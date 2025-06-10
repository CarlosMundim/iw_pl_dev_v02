import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy CredentialRegistry
  console.log("\n🚀 Deploying CredentialRegistry...");
  
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  
  await credentialRegistry.deployed();

  console.log("✅ CredentialRegistry deployed to:", credentialRegistry.address);
  console.log("Transaction hash:", credentialRegistry.deployTransaction.hash);

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...");
  await credentialRegistry.deployTransaction.wait(2);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const totalCredentials = await credentialRegistry.getTotalCredentials();
  const isAuthorized = await credentialRegistry.isAuthorizedIssuer(deployer.address);
  
  console.log("Total credentials:", totalCredentials.toString());
  console.log("Deployer is authorized issuer:", isAuthorized);

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: credentialRegistry.address,
    deployerAddress: deployer.address,
    transactionHash: credentialRegistry.deployTransaction.hash,
    blockNumber: credentialRegistry.deployTransaction.blockNumber,
    gasUsed: credentialRegistry.deployTransaction.gasLimit?.toString(),
    deployedAt: new Date().toISOString(),
    abi: CredentialRegistry.interface.format('json')
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`📄 Deployment info saved to: ${deploymentFile}`);

  // Generate environment variables
  console.log("\n📋 Environment Variables:");
  console.log(`${network.name.toUpperCase()}_CREDENTIAL_REGISTRY=${credentialRegistry.address}`);
  console.log(`DEPLOYER_ADDRESS=${deployer.address}`);

  // If on testnet, add some test data
  if (network.name === 'sepolia' || network.name === 'mumbai' || network.chainId === 31337n) {
    console.log("\n🧪 Adding test data...");
    
    try {
      // Authorize a test issuer
      const testIssuerAddress = "0x742d35Cc6523C0532925a3b8D3bC5f1B9B5d1234"; // Example address
      
      const authTx = await credentialRegistry.authorizeIssuer(
        testIssuerAddress,
        "Test University",
        "educational",
        "0x04abcd1234...", // Mock public key
        "https://api.testuniversity.edu/verify"
      );
      
      await authTx.wait();
      console.log("✅ Test issuer authorized:", testIssuerAddress);
      
      // Issue a test credential
      const testCredentialTx = await credentialRegistry.issueCredential(
        deployer.address, // Use deployer as holder for testing
        "degree",
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Bachelor of Computer Science")),
        "QmTestHash1234567890abcdef",
        0 // No expiration
      );
      
      const receipt = await testCredentialTx.wait();
      const credentialIssuedEvent = receipt.events?.find(e => e.event === 'CredentialIssued');
      
      if (credentialIssuedEvent) {
        console.log("✅ Test credential issued:", credentialIssuedEvent.args?.credentialId);
      }
      
    } catch (error) {
      console.log("⚠️ Could not add test data:", error);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  
  // Verification instructions
  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    console.log("\n📝 To verify the contract, run:");
    console.log(`npx hardhat verify --network ${network.name} ${credentialRegistry.address}`);
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});