import React, { useState, useEffect } from 'react';
import { 
  ArrowDownUp, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Wallet, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  ETHERSAIR_CONTRACTS, 
  switchToBaseSepolia, 
  fetchERC20Balance, 
  executePoolSwap 
} from './ethersairContracts';

interface EthersAirSwapPanelProps {
  connected: boolean;
  walletAddress: string;
  isRealWallet: boolean;
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  setShowConnectModal: (show: boolean) => void;
  onSwapSuccess?: (tx: { hash: string; details: string; amount: string }) => void;
}

export const EthersAirSwapPanel: React.FC<EthersAirSwapPanelProps> = ({
  connected,
  walletAddress,
  isRealWallet,
  addToast,
  setShowConnectModal,
  onSwapSuccess,
}) => {
  // Selected Pool state: 'pool1' (ETHERSAIR ⇄ WETHERSAIR) or 'pool2' (ETHERSAIR ⇄ mWBTC)
  const [activePool, setActivePool] = useState<'pool1' | 'pool2'>('pool1');
  
  // Swap direction: 'AtoB' or 'BtoA'
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  const [inputAmount, setInputAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Live Token Balances
  const [balances, setBalances] = useState({
    ETHERSAIR: '10000.00',
    WETHERSAIR: '10000.00',
    mWBTC: '0.5000',
    ETH: '1.2500'
  });
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);

  // Fetch real balances if connected via MetaMask
  const refreshBalances = async () => {
    if (!connected || !walletAddress || !isRealWallet) return;
    setIsLoadingBalances(true);
    try {
      const eairBal = await fetchERC20Balance(ETHERSAIR_CONTRACTS.ETHERSAIR1986, walletAddress);
      const weairBal = await fetchERC20Balance(ETHERSAIR_CONTRACTS.WETHERSAIR1986, walletAddress);
      const mwbtcBal = await fetchERC20Balance(ETHERSAIR_CONTRACTS.MockWBTC, walletAddress, 8); // mWBTC decimals
      
      setBalances(prev => ({
        ...prev,
        ETHERSAIR: eairBal,
        WETHERSAIR: weairBal,
        mWBTC: mwbtcBal
      }));
    } catch (err) {
      console.warn('Error refreshing EthersAir token balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  useEffect(() => {
    refreshBalances();
  }, [connected, walletAddress, isRealWallet]);

  // Derived Token A and Token B based on active pool & direction
  const poolInfo = activePool === 'pool1' ? {
    id: 'pool1',
    name: 'Pool #1 (ETHERSAIR ⇄ WETHERSAIR)',
    address: ETHERSAIR_CONTRACTS.POOL_1_ETHERSAIR_WETHERSAIR,
    tokenA: { symbol: 'ETHERSAIR', name: 'ETHERSAIR1986', address: ETHERSAIR_CONTRACTS.ETHERSAIR1986, price: 1.00 },
    tokenB: { symbol: 'WETHERSAIR', name: 'WETHERSAIR1986', address: ETHERSAIR_CONTRACTS.WETHERSAIR1986, price: 1.00 },
    apy: '45.2%',
    status: 'Tested & Operational',
    ratio: 1 // 1:1 ratio
  } : {
    id: 'pool2',
    name: 'Pool #2 (ETHERSAIR ⇄ mWBTC)',
    address: ETHERSAIR_CONTRACTS.POOL_2_ETHERSAIR_mWBTC,
    tokenA: { symbol: 'ETHERSAIR', name: 'ETHERSAIR1986', address: ETHERSAIR_CONTRACTS.ETHERSAIR1986, price: 1.00 },
    tokenB: { symbol: 'mWBTC', name: 'MockWBTC', address: ETHERSAIR_CONTRACTS.MockWBTC, price: 65000.00 },
    apy: '88.6%',
    status: 'Active Liquidity',
    ratio: 65000
  };

  const sourceToken = swapDirection === 'AtoB' ? poolInfo.tokenA : poolInfo.tokenB;
  const destToken = swapDirection === 'AtoB' ? poolInfo.tokenB : poolInfo.tokenA;

  const sourceBalance = balances[sourceToken.symbol as keyof typeof balances] || '0.00';
  const destBalance = balances[destToken.symbol as keyof typeof balances] || '0.00';

  // Output estimation
  const parsedInput = parseFloat(inputAmount) || 0;
  const outputAmount = parsedInput > 0 
    ? ((parsedInput * sourceToken.price) / destToken.price).toFixed(destToken.symbol === 'mWBTC' ? 6 : 4)
    : '0.00';

  // Handle Copy Contract Address
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    addToast('Copied!', `${label} address copied to clipboard`, 'info');
    setTimeout(() => setCopiedAddress(null), 3000);
  };

  // Handle Switch to Base Sepolia
  const handleSwitchNetwork = async () => {
    try {
      await switchToBaseSepolia();
      addToast('Network Switched', 'MetaMask is now connected to Base Sepolia Testnet', 'success');
      refreshBalances();
    } catch (err: any) {
      addToast('Network Switch Error', err.message || 'Failed to switch to Base Sepolia', 'error');
    }
  };

  // Execute Swap Action
  const handleSwapSubmit = async () => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }

    if (parsedInput <= 0) {
      addToast('Invalid Amount', 'Please enter a valid amount to swap.', 'error');
      return;
    }

    if (parsedInput > parseFloat(sourceBalance)) {
      addToast('Insufficient Balance', `You do not have enough ${sourceToken.symbol}.`, 'error');
      return;
    }

    setIsSubmitting(true);
    addToast('Initiating Swap', `Swapping ${parsedInput} ${sourceToken.symbol} on Base Sepolia...`, 'info');

    try {
      let txHash = '';

      if (isRealWallet && (window as any).ethereum) {
        // Switch network if needed
        try {
          await switchToBaseSepolia();
        } catch (e) {
          console.warn('Network auto-switch notice:', e);
        }

        // On-chain contract swap execution
        const poolAddress = poolInfo.address;
        txHash = await executePoolSwap(
          poolAddress,
          sourceToken.address,
          inputAmount,
          sourceToken.symbol === 'mWBTC' ? 8 : 18
        );
      } else {
        // Fallback simulated execution for sandbox
        await new Promise(res => setTimeout(res, 1800));
        txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }

      // Update local balances
      setBalances(prev => {
        const sourceVal = parseFloat(prev[sourceToken.symbol as keyof typeof balances] || '0') - parsedInput;
        const destVal = parseFloat(prev[destToken.symbol as keyof typeof balances] || '0') + parseFloat(outputAmount);
        return {
          ...prev,
          [sourceToken.symbol]: Math.max(0, sourceVal).toFixed(sourceToken.symbol === 'mWBTC' ? 6 : 4),
          [destToken.symbol]: Math.max(0, destVal).toFixed(destToken.symbol === 'mWBTC' ? 6 : 4)
        };
      });

      const detailsStr = `Swapped ${parsedInput} ${sourceToken.symbol} ➔ ${outputAmount} ${destToken.symbol}`;
      addToast('Swap Executed Successfully! 🎉', `${detailsStr} (TX: ${txHash.slice(0, 10)}...)`, 'success');

      if (onSwapSuccess) {
        onSwapSuccess({
          hash: txHash,
          details: detailsStr,
          amount: `$${(parsedInput * sourceToken.price).toFixed(2)}`
        });
      }

      setInputAmount('');
      refreshBalances();
    } catch (err: any) {
      console.error('Swap Error:', err);
      let msg = err.message || 'Swap transaction failed';
      if (msg.includes('user-denied') || err.code === 4001) {
        msg = 'Transaction was rejected in MetaMask.';
      }
      addToast('Swap Failed', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-950 border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0">
            🔵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base">EthersAir DEX (EVM / Base Sepolia)</h3>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Deployed & Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chain ID: <span className="font-mono text-blue-300 font-bold">84532</span> | Native Swap Pools for ETHERSAIR1986 Ecosystem
            </p>
          </div>
        </div>

        {connected ? (
          <button
            onClick={handleSwitchNetwork}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 text-blue-300 transition flex items-center gap-2 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Network to Base Sepolia
          </button>
        ) : (
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 shrink-0"
          >
            <Wallet className="w-4 h-4" />
            Connect MetaMask
          </button>
        )}
      </div>

      {/* Pool Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pool 1 Card */}
        <div 
          onClick={() => { setActivePool('pool1'); setSwapDirection('AtoB'); }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activePool === 'pool1' 
              ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30' 
              : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Pool #1</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">125% Tested</span>
            </div>
            <span className="text-xs font-black text-indigo-400 font-mono">45.2% APY</span>
          </div>

          <div className="font-extrabold text-base text-white mb-1 flex items-center gap-2">
            ETHERSAIR <ArrowDownUp className="w-4 h-4 text-slate-400" /> WETHERSAIR
          </div>
          <p className="text-[11px] text-slate-400 mb-3">1:1 Pegged Ecosystem Swap Pool</p>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
            <span>Pool: 0x5a78...A7a6</span>
            <button 
              onClick={(e) => { e.stopPropagation(); copyToClipboard(ETHERSAIR_CONTRACTS.POOL_1_ETHERSAIR_WETHERSAIR, 'Pool #1'); }}
              className="hover:text-white flex items-center gap-1 text-slate-400"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
        </div>

        {/* Pool 2 Card */}
        <div 
          onClick={() => { setActivePool('pool2'); setSwapDirection('AtoB'); }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activePool === 'pool2' 
              ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30' 
              : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Pool #2</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">mWBTC Liquidity</span>
            </div>
            <span className="text-xs font-black text-indigo-400 font-mono">88.6% APY</span>
          </div>

          <div className="font-extrabold text-base text-white mb-1 flex items-center gap-2">
            ETHERSAIR <ArrowDownUp className="w-4 h-4 text-slate-400" /> mWBTC
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Wrapped Bitcoin Collateral Pool</p>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
            <span>Pool: 0x5d55...0d0C</span>
            <button 
              onClick={(e) => { e.stopPropagation(); copyToClipboard(ETHERSAIR_CONTRACTS.POOL_2_ETHERSAIR_mWBTC, 'Pool #2'); }}
              className="hover:text-white flex items-center gap-1 text-slate-400"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
        </div>
      </div>

      {/* MAIN SWAP BOX */}
      <div className="max-w-xl mx-auto rounded-2xl glass-card p-6 shadow-2xl relative border border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Swap on {poolInfo.name.split('(')[0]}
            </h4>
            <p className="text-xs text-slate-400">Direct Base Sepolia Smart Contract Router</p>
          </div>

          <button
            onClick={refreshBalances}
            disabled={isLoadingBalances}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
            title="Refresh Token Balances"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBalances ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* FROM BLOCK */}
        <div className="bg-slate-950/80 border border-slate-800/90 p-4 rounded-xl mb-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>You Pay</span>
            <div className="flex items-center gap-2">
              <span>Balance: <strong className="text-white font-mono">{parseFloat(sourceBalance).toFixed(4)}</strong></span>
              <button 
                onClick={() => setInputAmount(sourceBalance)}
                className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded hover:bg-indigo-500/30 transition"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <input 
              type="number" 
              placeholder="0.00" 
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="bg-transparent text-2xl font-black text-white focus:outline-none w-1/2 font-mono"
            />
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white shrink-0">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {sourceToken.symbol}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
            ~${(parsedInput * sourceToken.price).toFixed(2)} USD
          </div>
        </div>

        {/* SWAP DIRECTION INVERT BUTTON */}
        <div className="flex justify-center -my-3.5 relative z-10">
          <button 
            onClick={() => setSwapDirection(prev => prev === 'AtoB' ? 'BtoA' : 'AtoB')}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500 flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg active:scale-90"
            title="Switch Swap Direction"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* TO BLOCK */}
        <div className="bg-slate-950/80 border border-slate-800/90 p-4 rounded-xl mt-2 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>You Receive (Estimated)</span>
            <span>Balance: <strong className="text-white font-mono">{parseFloat(destBalance).toFixed(4)}</strong></span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl font-black text-emerald-400 font-mono w-1/2 overflow-hidden truncate">
              {outputAmount}
            </span>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {destToken.symbol}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
            ~${(parseFloat(outputAmount) * destToken.price).toFixed(2)} USD
          </div>
        </div>

        {/* POOL RATE & SPECS BREAKDOWN */}
        <div className="p-3.5 bg-slate-950/60 rounded-xl space-y-2 text-xs border border-white/5 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-400">Exchange Rate</span>
            <span className="font-mono text-slate-200 font-bold">
              1 {sourceToken.symbol} = {(sourceToken.price / destToken.price).toFixed(6)} {destToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Target Pool Contract</span>
            <span className="font-mono text-blue-400 text-[11px] flex items-center gap-1">
              {poolInfo.address.slice(0, 6)}...{poolInfo.address.slice(-6)}
              <a 
                href={`${ETHERSAIR_CONTRACTS.EXPLORER}/address/${poolInfo.address}`} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Network Fee (Base Sepolia)</span>
            <span className="text-emerald-400 font-mono font-semibold">&lt; 0.0001 ETH (&lt;$0.01)</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSwapSubmit}
          disabled={isSubmitting || !inputAmount || parsedInput <= 0}
          className="w-full py-4 rounded-xl text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Executing On-Chain Swap...
            </>
          ) : !connected ? (
            'Connect Wallet to Swap'
          ) : (
            `Swap ${sourceToken.symbol} for ${destToken.symbol}`
          )}
        </button>
      </div>

      {/* VERIFIED CONTRACTS SUMMARY TABLE */}
      <div className="rounded-2xl glass-card p-6 space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              EthersAir Verified Base Sepolia Smart Contracts
            </h4>
            <p className="text-xs text-slate-400">All contracts deployed and active on Base Sepolia EVM Testnet</p>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
            6 Verified Contracts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border border-white/5 rounded-xl overflow-hidden">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/80 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Contract Name</th>
                <th className="py-3 px-4">Contract Address</th>
                <th className="py-3 px-4">Status / Details</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'ETHERSAIR1986', addr: ETHERSAIR_CONTRACTS.ETHERSAIR1986, status: 'Native Token', badge: 'Active' },
                { name: 'WETHERSAIR1986', addr: ETHERSAIR_CONTRACTS.WETHERSAIR1986, status: 'Wrapped Token', badge: 'Active' },
                { name: 'EthersAirStaking', addr: ETHERSAIR_CONTRACTS.EthersAirStaking, status: 'Staking (125% APY)', badge: 'Active' },
                { name: 'MockWBTC', addr: ETHERSAIR_CONTRACTS.MockWBTC, status: 'Collateral Token', badge: 'Active' },
                { name: 'Pool #1 (ETHERSAIR ⇄ WETHERSAIR)', addr: ETHERSAIR_CONTRACTS.POOL_1_ETHERSAIR_WETHERSAIR, status: 'Liquid Swap Pool', badge: 'Tested ✅' },
                { name: 'Pool #2 (ETHERSAIR ⇄ mWBTC)', addr: ETHERSAIR_CONTRACTS.POOL_2_ETHERSAIR_mWBTC, status: 'mWBTC Liquidity Pool', badge: 'Active ✅' }
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {item.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-300">{item.addr}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyToClipboard(item.addr, item.name)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Copy Address"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`${ETHERSAIR_CONTRACTS.EXPLORER}/address/${item.addr}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition"
                        title="View on BaseScan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
