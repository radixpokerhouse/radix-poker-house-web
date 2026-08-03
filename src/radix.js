import { RadixDappToolkit, RadixNetwork } from '@radixdlt/radix-dapp-toolkit';

// TODO: replace with the real dApp Definition address once created on
// Stokenet (Radix Wallet > Settings > dApp Definitions, or via console).
export const DAPP_DEFINITION_ADDRESS = 'account_tdx_2_12ynl5t4pp7263sz5ynukgex92zk44092gq0d6423wyml8vv3cqtvh9';

export const rdt = RadixDappToolkit({
  dAppDefinitionAddress: DAPP_DEFINITION_ADDRESS,
  networkId: RadixNetwork.Stokenet,
  applicationName: 'Radix Poker House',
  applicationVersion: '0.1.0',
});

export const gatewayApi = rdt.gatewayApi;
export const walletApi = rdt.walletApi;
