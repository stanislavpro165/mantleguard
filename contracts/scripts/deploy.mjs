import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n=== Mantle Deployment ===");
  console.log("Network:", hre.network.name);
  console.log("Account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MNT");

  if (balance === 0n) {
    console.log("\n⚠️  Account has no funds!");
    console.log("Get test MNT from faucet: https://faucet.sepolia.mantle.xyz");
    console.log("Or bridge: https://bridge.sepolia.mantle.xyz");
    return;
  }

  // Deploy VulnerableWallet
  console.log("\nDeploying VulnerableWallet...");
  const VulnerableWallet = await hre.ethers.getContractFactory("VulnerableWallet");
  const wallet = await VulnerableWallet.deploy();
  await wallet.waitForDeployment();
  const walletAddr = await wallet.getAddress();
  console.log("✓ VulnerableWallet:", walletAddr);

  // Deploy FixedWallet
  console.log("\nDeploying FixedWallet...");
  const FixedWallet = await hre.ethers.getContractFactory("FixedWallet");
  const fixed = await FixedWallet.deploy();
  await fixed.waitForDeployment();
  const fixedAddr = await fixed.getAddress();
  console.log("✓ FixedWallet:    ", fixedAddr);

  console.log("\n=== Deployment Complete ===");
  console.log("Vulnerable Wallet:", walletAddr);
  console.log("Fixed Wallet:     ", fixedAddr);
  console.log("Explorer:         https://explorer.sepolia.mantle.xyz");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
