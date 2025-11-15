import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },

  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: false,
    },

    // ANDE Network Testnet
    "ande-testnet": {
      url: process.env.ANDE_NETWORK_RPC_URL || "https://rpc.testnet.ande.network",
      chainId: parseInt(process.env.ANDE_NETWORK_CHAIN_ID || "1234"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },

    // ANDE Network Mainnet
    "ande-mainnet": {
      url: process.env.ANDE_NETWORK_RPC_URL || "https://rpc.ande.network",
      chainId: parseInt(process.env.ANDE_NETWORK_CHAIN_ID || "5678"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },
  },

  etherscan: {
    apiKey: {
      "ande-testnet": process.env.ANDE_EXPLORER_API_KEY || "YOUR_API_KEY",
      "ande-mainnet": process.env.ANDE_EXPLORER_API_KEY || "YOUR_API_KEY",
    },
    customChains: [
      {
        network: "ande-testnet",
        chainId: parseInt(process.env.ANDE_NETWORK_CHAIN_ID || "1234"),
        urls: {
          apiURL: "https://api-testnet.explorer.ande.network/api",
          browserURL: "https://testnet.explorer.ande.network",
        },
      },
      {
        network: "ande-mainnet",
        chainId: parseInt(process.env.ANDE_NETWORK_CHAIN_ID || "5678"),
        urls: {
          apiURL: "https://api.explorer.ande.network/api",
          browserURL: "https://explorer.ande.network",
        },
      },
    ],
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },

  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },

  mocha: {
    timeout: 40000,
  },
};

export default config;
