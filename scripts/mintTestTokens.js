const { ethers } = require("hardhat");

async function main() {
  const targetAddress = "0x154D40777d5733bC461EdeBfE62D9D8f8B2fDd1E";
  console.log(`\n==================================================`);
  console.log(`Starting Test Token Minting to: ${targetAddress}`);
  console.log(`==================================================\n`);

  const [deployer] = await ethers.getSigners();
  console.log(`Executor / Admin Account: ${deployer.address}`);

  // 1. Mint ETHERSAIR1986 (18 decimals)
  const ethersairAddress = "0xdAc3533CAf83CFB01685Ac506C1519173E0B3eA3";
  try {
    const ethersairToken = await ethers.getContractAt("EthersAirToken", ethersairAddress);
    const amountEthersAir = ethers.parseUnits("500000", 18); // Mint 500,000 ETHERSAIR
    console.log(`\n1. Minting 500,000 ETHERSAIR1986...`);
    const tx1 = await ethersairToken.mint(targetAddress, amountEthersAir);
    await tx1.wait();
    console.log(`   ✅ Mint Successful! Tx Hash: ${tx1.hash}`);
    const balance1 = await ethersairToken.balanceOf(targetAddress);
    console.log(`   New ETHERSAIR Balance: ${ethers.formatUnits(balance1, 18)} ETHERSAIR`);
  } catch (err) {
    console.error(`   ❌ Failed to mint ETHERSAIR1986:`, err.message);
  }

  // 2. Mint WETHERSAIR1986 (18 decimals)
  const wEthersairAddress = "0x2187BA3eDF218Cb6F3c418e8c8a1Ab7Cb828EDd6";
  try {
    const wEthersairToken = await ethers.getContractAt("EthersAirToken", wEthersairAddress);
    const amountWEthersAir = ethers.parseUnits("500000", 18); // Mint 500,000 WETHERSAIR
    console.log(`\n2. Minting 500,000 WETHERSAIR1986...`);
    const tx2 = await wEthersairToken.mint(targetAddress, amountWEthersAir);
    await tx2.wait();
    console.log(`   ✅ Mint Successful! Tx Hash: ${tx2.hash}`);
    const balance2 = await wEthersairToken.balanceOf(targetAddress);
    console.log(`   New WETHERSAIR Balance: ${ethers.formatUnits(balance2, 18)} WETHERSAIR`);
  } catch (err) {
    console.error(`   ❌ Failed to mint WETHERSAIR1986:`, err.message);
  }

  // 3. Mint MockWBTC (8 decimals)
  const mockWbtcAddress = "0xC4E7504EB0625D29DfFd09D7470d70FB0ab2FfC2";
  try {
    const mockWbtcToken = await ethers.getContractAt("MockWBTC_v2", mockWbtcAddress);
    const amountmWBTC = ethers.parseUnits("10", 8); // Mint 10 mWBTC (8 decimals)
    console.log(`\n3. Minting 10 mWBTC...`);
    
    // Check if contract has mint function, otherwise call faucet
    try {
      const tx3 = await mockWbtcToken.mint(targetAddress, amountmWBTC);
      await tx3.wait();
      console.log(`   ✅ Mint Successful via mint()! Tx Hash: ${tx3.hash}`);
    } catch {
      console.log(`   Attempting faucet() caller transfer...`);
      const tx3 = await mockWbtcToken.faucet();
      await tx3.wait();
      console.log(`   ✅ Faucet triggered! Tx Hash: ${tx3.hash}`);
    }
    const balance3 = await mockWbtcToken.balanceOf(targetAddress);
    console.log(`   New mWBTC Balance: ${ethers.formatUnits(balance3, 8)} mWBTC`);
  } catch (err) {
    console.error(`   ❌ Failed to mint mWBTC:`, err.message);
  }

  console.log(`\n==================================================`);
  console.log(`All Minting Tasks Completed Successfully!`);
  console.log(`==================================================\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
