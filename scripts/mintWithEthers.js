import { JsonRpcProvider, Wallet, Contract, parseUnits, formatUnits } from 'ethers';

// Base Sepolia Testnet RPC URL
const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';

// Target wallet address to receive minted tokens
const RECIPIENT_ADDRESS = '0x154D40777d5733bC461EdeBfE62D9D8f8B2fDd1E';

// Smart Contract Addresses on Base Sepolia
const CONTRACTS = {
  ETHERSAIR: {
    symbol: 'ETHERSAIR',
    address: '0xdAc3533CAf83CFB01685Ac506C1519173E0B3eA3',
    decimals: 18,
    mintAmount: '500000',
  },
  WETHERSAIR: {
    symbol: 'WETHERSAIR',
    address: '0x2187BA3eDF218Cb6F3c418e8c8a1Ab7Cb828EDd6',
    decimals: 18,
    mintAmount: '500000',
  },
  MockWBTC: {
    symbol: 'mWBTC',
    address: '0xC4E7504EB0625D29DfFd09D7470d70FB0ab2FfC2',
    decimals: 8,
    mintAmount: '10',
  },
};

// ABI for ERC-20 with mint/faucet support
const MINT_ABI = [
  'function mint(address to, uint256 amount) external',
  'function faucet() external',
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

async function main() {
  console.log('==================================================');
  console.log('🚀 Base Sepolia Test Token Minting Script');
  console.log('==================================================');
  console.log(`Target Recipient: ${RECIPIENT_ADDRESS}`);
  console.log(`RPC Provider: ${RPC_URL}\n`);

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable is required.');
    console.error('Usage: PRIVATE_KEY="0xYourPrivateKey" node scripts/mintWithEthers.js');
    process.exit(1);
  }

  const provider = new JsonRpcProvider(RPC_URL);
  const wallet = new Wallet(privateKey, provider);

  console.log(`🔑 Deployer / Signer Address: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`⛽ Signer Native ETH Balance: ${formatUnits(balance, 18)} ETH\n`);

  for (const [key, token] of Object.entries(CONTRACTS)) {
    console.log(`--------------------------------------------------`);
    console.log(`🔹 Processing Mint for ${token.symbol} (${token.address})`);
    
    try {
      const contract = new Contract(token.address, MINT_ABI, wallet);
      const amount = parseUnits(token.mintAmount, token.decimals);

      console.log(`⏳ Sending mint transaction: ${token.mintAmount} ${token.symbol}...`);
      
      let tx;
      try {
        tx = await contract.mint(RECIPIENT_ADDRESS, amount);
      } catch (err) {
        console.warn(`⚠️ Direct mint() failed or unpermitted. Attempting fallback faucet()...`);
        tx = await contract.faucet();
      }

      console.log(`🚀 Tx Hash: ${tx.hash}`);
      console.log(`⏳ Waiting for block confirmation...`);
      const receipt = await tx.wait(1);
      console.log(`✅ Transaction confirmed in block #${receipt.blockNumber}!`);

      const newBal = await contract.balanceOf(RECIPIENT_ADDRESS);
      console.log(`🎉 New Balance for ${RECIPIENT_ADDRESS}: ${formatUnits(newBal, token.decimals)} ${token.symbol}`);
    } catch (error) {
      console.error(`❌ Failed to mint ${token.symbol}:`, error.message || error);
    }
  }

  console.log('\n==================================================');
  console.log('✨ All mint operations processed!');
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
