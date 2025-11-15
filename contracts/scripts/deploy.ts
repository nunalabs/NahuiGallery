import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy NahuiGallery Smart Contracts
 *
 * Deployment order:
 * 1. NahuiFactory (contract deployment factory)
 * 2. NahuiMarketplace (marketplace for buying/selling)
 *
 * All addresses are saved to deployments/[network].json
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("================================================");
  console.log("🚀 NahuiGallery Smart Contract Deployment");
  console.log("================================================");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(
    `Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ANDE`
  );
  console.log("================================================\n");

  // Configuration
  const PLATFORM_FEE = 250; // 2.5%
  const platformFeeRecipient = deployer.address; // Change in production

  console.log("📋 Deployment Configuration:");
  console.log(`  Platform Fee: ${PLATFORM_FEE / 100}%`);
  console.log(`  Platform Fee Recipient: ${platformFeeRecipient}`);
  console.log("");

  const deployedContracts: Record<string, string> = {};

  // ========================================
  // 1. Deploy NahuiFactory
  // ========================================
  console.log("📦 Deploying NahuiFactory...");

  const NahuiFactory = await ethers.getContractFactory("NahuiFactory");
  const factory = await NahuiFactory.deploy(platformFeeRecipient, PLATFORM_FEE);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`✅ NahuiFactory deployed to: ${factoryAddress}`);
  deployedContracts["NahuiFactory"] = factoryAddress;

  // ========================================
  // 2. Deploy NahuiMarketplace
  // ========================================
  console.log("\n📦 Deploying NahuiMarketplace...");

  const NahuiMarketplace = await ethers.getContractFactory("NahuiMarketplace");
  const marketplace = await NahuiMarketplace.deploy(
    platformFeeRecipient,
    PLATFORM_FEE
  );

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log(`✅ NahuiMarketplace deployed to: ${marketplaceAddress}`);
  deployedContracts["NahuiMarketplace"] = marketplaceAddress;

  // ========================================
  // Save Deployment Info
  // ========================================
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
    config: {
      platformFee: PLATFORM_FEE,
      platformFeeRecipient,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${network.name}-${network.chainId}.json`;
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n================================================");
  console.log("✅ Deployment Complete!");
  console.log("================================================");
  console.log(`Deployment info saved to: deployments/${filename}`);
  console.log("");
  console.log("📝 Deployed Contracts:");
  Object.entries(deployedContracts).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
  console.log("");
  console.log("🔍 Next Steps:");
  console.log("  1. Verify contracts on block explorer:");
  console.log(`     npx hardhat verify --network ${network.name} ${factoryAddress} ${platformFeeRecipient} ${PLATFORM_FEE}`);
  console.log(
    `     npx hardhat verify --network ${network.name} ${marketplaceAddress} ${platformFeeRecipient} ${PLATFORM_FEE}`
  );
  console.log("  2. Test minting an NFT using the factory");
  console.log("  3. List and sell an NFT on the marketplace");
  console.log("================================================\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
