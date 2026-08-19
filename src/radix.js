import { RadixDappToolkit, RadixNetwork, DataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';
import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk';

export const DAPP_DEFINITION_ADDRESS = 'account_tdx_2_12ynl5t4pp7263sz5ynukgex92zk44092gq0d6423wyml8vv3cqtvh9';
export const GENESIS_TABLE_COMPONENT = 'component_tdx_2_1cr4mzwgky0vmftaxas6n200wln694n278gw4xws86cez9tft6nwjtv';
export const GENESIS_TABLE_BADGE_RESOURCE = 'resource_tdx_2_1n280sw8p36p4lvteclw6vzw3gjks30xpvgv5xuzsdfadl60dgkladf';
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

let debugListeners = [];
export function onDebugLog(cb) {
  debugListeners.push(cb);
}
export function debugLog(msg) {
  console.log('[radix-debug]', msg);
  debugListeners.forEach((cb) => cb(msg));
}

async function fetchChallenge() {
  debugLog('fetchChallenge called');
  const res = await fetch(`${DEALER_URL}/auth/challenge`);
  const data = await res.json();
  debugLog('challenge received: ' + data.challenge?.slice(0, 12));
  return data.challenge;
}

rdt.walletApi.provideChallengeGenerator(fetchChallenge);

rdt.walletApi.setRequestData(
  DataRequestBuilder.accounts().atLeast(1).withProof()
);

rdt.walletApi.dataRequestControl(async (walletData) => {
  debugLog('dataRequestControl fired, proofs: ' + JSON.stringify(walletData.proofs));
  const accountProof = walletData.proofs?.find((p) => p.type === 'account');
  if (!accountProof) {
    debugLog('No account proof found in walletData');
    return;
  }

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
    debugLog('verify response: ' + JSON.stringify(data));
    if (data.sessionToken) {
      debugLog('Session established, seat ' + data.seat);
      sessionListeners.forEach((cb) => cb(data));
    } else {
      debugLog('Dealer verification failed: ' + data.error);
    }
  } catch (e) {
    debugLog('Dealer verification request failed: ' + e.message);
  }
});

// Use a dedicated Gateway client (not rdt.gatewayApi) -- RDT's bundled
// client doesn't expose the same .state.innerClient shape we rely on
// for direct badge/entity queries.
export const gatewayApi = GatewayApiClient.initialize({
  networkId: RadixNetwork.Stokenet,
  applicationName: 'Radix Poker House Frontend',
});
export const walletApi = rdt.walletApi;
