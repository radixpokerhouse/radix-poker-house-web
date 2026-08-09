import { RadixDappToolkit, RadixNetwork, DataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';

export const DAPP_DEFINITION_ADDRESS = 'account_tdx_2_12ynl5t4pp7263sz5ynukgex92zk44092gq0d6423wyml8vv3cqtvh9';
export const GENESIS_TABLE_COMPONENT = 'component_tdx_2_1cqrdwav7ql8stvsq8l85z9yn95s274ee6r3d4zt72xg402fh342q5p';
export const GENESIS_TABLE_BADGE_RESOURCE = 'resource_tdx_2_1n2kjrw7lhld0cq0l8ke350854ju7p7jzsteyeddyc029ww9wncapqj';
export const DEALER_URL = 'https://radix-poker-house-dealer-production.up.railway.app';

export const rdt = RadixDappToolkit({
  dAppDefinitionAddress: DAPP_DEFINITION_ADDRESS,
  networkId: RadixNetwork.Stokenet,
  applicationName: 'Radix Poker House',
  applicationVersion: '0.1.0',
});

// --- ROLA wiring ---
// 1. Wallet asks us for a challenge before it will sign a proof.
// 2. We forward the wallet's signed proof to the dealer, which verifies
//    the signature AND checks on-chain badge ownership before trusting it.
let sessionListeners = [];
export function onSessionReady(cb) {
  sessionListeners.push(cb);
}

async function fetchChallenge() {
  const res = await fetch(`${DEALER_URL}/auth/challenge`);
  const data = await res.json();
  return data.challenge;
}

rdt.walletApi.provideChallengeGenerator(fetchChallenge);

rdt.walletApi.setRequestData(
  DataRequestBuilder.accounts().atLeast(1).withProof()
);

rdt.walletApi.dataRequestControl(async (walletData) => {
  const accountProof = walletData.proofs?.find((p) => p.type === 'account');
  if (!accountProof) return;

  try {
    const res = await fetch(`${DEALER_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signedChallenge: accountProof,
        tableBadgeResource: GENESIS_TABLE_BADGE_RESOURCE,
      }),
    });
    const data = await res.json();
    if (data.sessionToken) {
      sessionListeners.forEach((cb) => cb(data));
    } else {
      console.error('Dealer verification failed:', data.error);
    }
  } catch (e) {
    console.error('Dealer verification request failed:', e);
  }
});

export const gatewayApi = rdt.gatewayApi;
export const walletApi = rdt.walletApi;
