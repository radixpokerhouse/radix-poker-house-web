import { RadixDappToolkit, RadixNetwork, DataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';

export const DAPP_DEFINITION_ADDRESS = 'account_tdx_2_12ynl5t4pp7263sz5ynukgex92zk44092gq0d6423wyml8vv3cqtvh9';

export const rdt = RadixDappToolkit({
  dAppDefinitionAddress: DAPP_DEFINITION_ADDRESS,
  networkId: RadixNetwork.Stokenet,
  applicationName: 'Radix Poker House',
  applicationVersion: '0.1.0',
});

// Explicitly request at least one account, so the wallet prompts the user
// to pick which account to share instead of connecting silently.
rdt.walletApi.setRequestData(
  DataRequestBuilder.accounts().atLeast(1)
);

export const gatewayApi = rdt.gatewayApi;
export const walletApi = rdt.walletApi;

export const GENESIS_TABLE_COMPONENT = 'component_tdx_2_1cqrdwav7ql8stvsq8l85z9yn95s274ee6r3d4zt72xg402fh342q5p';
export const GENESIS_TABLE_BADGE_RESOURCE = 'resource_tdx_2_1n2kjrw7lhld0cq0l8ke350854ju7p7jzsteyeddyc029ww9wncapqj';
export const DEALER_URL = 'https://radix-poker-house-dealer-production.up.railway.app';
