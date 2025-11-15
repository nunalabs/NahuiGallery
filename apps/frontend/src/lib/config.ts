export const andeTestnet = {
  id: 1234,
  name: 'ANDE Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ANDE',
    symbol: 'ANDE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.ande.network'],
    },
    public: {
      http: ['https://rpc.testnet.ande.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ANDE Explorer',
      url: 'https://testnet.explorer.ande.network',
    },
  },
  testnet: true,
};

export const contracts = {
  factory: '0x0000000000000000000000000000000000000000',
  marketplace: '0x0000000000000000000000000000000000000000',
};
