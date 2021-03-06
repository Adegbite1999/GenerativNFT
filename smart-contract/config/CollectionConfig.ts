import CollectionConfigInterface from '../lib/CollectionConfigInterface';
import * as Networks from '../lib/Networks';
import * as Marketplaces from '../lib/Marketplaces';
import whitelistAddresses from './whitelist.json';

const CollectionConfig: CollectionConfigInterface = {
  testnet: Networks.ethereumTestnet,
  mainnet: Networks.ethereumMainnet,
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: 'FileCoin',
  tokenName: 'CrackHeads',
  tokenSymbol: 'CRKH',
  hiddenMetadataUri: 'ipfs://QmSwtUrQFjPQDqRRSbAS1shVSH1G1z2W1g8KL3hHBYL8L4',
  maxSupply: 7000,
  whitelistSale: {
    price: 0.05,
    maxMintAmountPerTx: 1,
  },
  preSale: {
    price: 0.07,
    maxMintAmountPerTx: 2,
  },
  publicSale: {
    price: 0.001,
    maxMintAmountPerTx: 10,
  },
  contractAddress: "0x2F7fAD5b7a006A495fa2B373128983F061F992eb",
  marketplaceIdentifier: 'CrackHeads',
  marketplaceConfig: Marketplaces.openSea,
  whitelistAddresses: whitelistAddresses,
}

export default CollectionConfig;
