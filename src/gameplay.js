import { blake2b } from 'blakejs';
import { rdt, gatewayApi, GENESIS_TABLE_COMPONENT, GENESIS_TABLE_BADGE_RESOURCE, debugLog } from './radix.js';

function toHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Find the caller's Session Badge NFT id for this table.
export async function getBadgeLocalId(accountAddress) {
  const vaultResp = await gatewayApi.state.innerClient.entityNonFungibleResourceVaultPage({
    stateEntityNonFungibleResourceVaultsPageRequest: {
      address: accountAddress,
      resource_address: GENESIS_TABLE_BADGE_RESOURCE,
    },
  });
  const vault = vaultResp.items?.[0];
  if (!vault) return null;

  const idsResp = await gatewayApi.state.innerClient.entityNonFungibleIdsPage({
    stateEntityNonFungibleIdsPageRequest: {
      address: accountAddress,
      vault_address: vault.vault_address,
      resource_address: GENESIS_TABLE_BADGE_RESOURCE,
    },
  });
  return idsResp.items?.[0] || null;
}

// Wraps a sequence of {method, extraArgs} calls, threading the Session
// Badge bucket through each one, then depositing whatever remains.
function badgeManifest(accountAddress, badgeLocalId, calls) {
  let manifest = `
    CALL_METHOD
      Address("${accountAddress}")
      "withdraw_non_fungibles"
      Address("${GENESIS_TABLE_BADGE_RESOURCE}")
      Array<NonFungibleLocalId>(NonFungibleLocalId("${badgeLocalId}"))
    ;
    TAKE_ALL_FROM_WORKTOP
      Address("${GENESIS_TABLE_BADGE_RESOURCE}")
      Bucket("badge0")
    ;
  `;
  calls.forEach((call, i) => {
    const inputBucket = `badge${i}`;
    const outputBucket = `badge${i + 1}`;
    manifest += `
      CALL_METHOD
        Address("${GENESIS_TABLE_COMPONENT}")
        "${call.method}"
        Bucket("${inputBucket}")
        ${call.extraArgs || ''}
      ;
    `;
    if (i < calls.length - 1) {
      manifest += `
        TAKE_ALL_FROM_WORKTOP
          Address("${GENESIS_TABLE_BADGE_RESOURCE}")
          Bucket("${outputBucket}")
        ;
      `;
    }
  });
  manifest += `
    CALL_METHOD
      Address("${accountAddress}")
      "deposit_batch"
      Expression("ENTIRE_WORKTOP")
    ;
  `;
  return manifest;
}

async function send(manifest) {
  const result = await rdt.walletApi.sendTransaction({ transactionManifest: manifest, version: 1 });
  if (result.isErr()) {
    throw new Error(result.error?.message || JSON.stringify(result.error));
  }
  return result.value; // { transactionIntentHash }
}

export async function startHand() {
  const manifest = `
    CALL_METHOD
      Address("${GENESIS_TABLE_COMPONENT}")
      "start_hand"
    ;
  `;
  return send(manifest);
}

// Commit + reveal in a single transaction/approval: our contract's
// reveal_seed only checks the caller's own commitment, so both steps
// can be chained in one manifest without waiting on other players.
export async function commitAndReveal(accountAddress, badgeLocalId) {
  const secretBytes = crypto.getRandomValues(new Uint8Array(32));
  const secretHex = toHex(secretBytes);
  const hashHex = blake2b(secretBytes, undefined, 32);
  const hashHexStr = toHex(hashHex);

  const manifest = badgeManifest(accountAddress, badgeLocalId, [
    { method: 'commit_seed', extraArgs: `Bytes("${hashHexStr}")` },
    { method: 'reveal_seed', extraArgs: `Bytes("${secretHex}")` },
  ]);
  return send(manifest);
}

export async function fold(accountAddress, badgeLocalId) {
  const manifest = badgeManifest(accountAddress, badgeLocalId, [{ method: 'fold' }]);
  return send(manifest);
}

export async function check(accountAddress, badgeLocalId) {
  const manifest = badgeManifest(accountAddress, badgeLocalId, [{ method: 'check' }]);
  return send(manifest);
}

export async function call(accountAddress, badgeLocalId) {
  const manifest = badgeManifest(accountAddress, badgeLocalId, [{ method: 'call' }]);
  return send(manifest);
}

export async function raise(accountAddress, badgeLocalId, newTotalBet) {
  const manifest = badgeManifest(accountAddress, badgeLocalId, [
    { method: 'raise', extraArgs: `Decimal("${newTotalBet}")` },
  ]);
  return send(manifest);
}

export async function showdown() {
  const manifest = `
    CALL_METHOD
      Address("${GENESIS_TABLE_COMPONENT}")
      "showdown"
    ;
  `;
  return send(manifest);
}

// Live table state for rendering (pot, seats, hand status).
export async function getTableState() {
  const resp = await gatewayApi.state.innerClient.stateEntityDetails({
    stateEntityDetailsRequest: { addresses: [GENESIS_TABLE_COMPONENT] },
  });
  const fields = resp.items[0]?.details?.state?.fields || [];
  const get = (name) => fields.find((f) => f.field_name === name);
  return {
    handActive: get('hand_active')?.value,
    currentBet: get('current_bet')?.value,
    activeSeats: (get('active_seats')?.entries || []).map((e) => Number(e.key.value)),
  };
}

// Reads the contract's game_status() view: (hand_active, street, current_turn, current_bet)
export async function getGameStatus() {
  const status = await gatewayApi.status.innerClient.gatewayStatus();
  const epoch = status.ledger_state.epoch;

  const result = await gatewayApi.transaction.innerClient.transactionPreview({
    transactionPreviewRequest: {
      manifest: `
        CALL_METHOD
          Address("${GENESIS_TABLE_COMPONENT}")
          "game_status"
        ;
      `,
      start_epoch_inclusive: epoch,
      end_epoch_exclusive: epoch + 10,
      tip_percentage: 0,
      nonce: Math.floor(Math.random() * 1000000),
      signer_public_keys: [],
      flags: { use_free_credit: true, assume_all_signature_proofs: true, skip_epoch_check: true },
    },
  });

  const output = result.receipt?.output?.[0]?.programmatic_json;
  if (!output || output.kind !== 'Tuple') return null;
  const [handActive, street, currentTurn, currentBet] = output.fields;
  return {
    handActive: handActive.value,
    street: Number(street.value),
    currentTurn: Number(currentTurn.value),
    currentBet: currentBet.value,
  };
}
