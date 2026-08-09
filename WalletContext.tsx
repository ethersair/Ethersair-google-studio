import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect, useCallback, useRef } from 'react';
import { BrowserProvider, formatEther } from 'ethers';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface WalletContextType {
  connected: boolean;
  walletType: string;
  walletAddress: string;
  walletBalance: string;
  address: string; // Alias for walletAddress
  balance: string; // Alias for walletBalance
  chainId: string; // Alias for selectedChainId
  isRealWallet: boolean;
  connecting: boolean;
  selectedChainId: string;
  setSelectedChainId: (chainId: string) => void;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  handleConnectWallet: (wallet: string) => Promise<void>;
  handleDisconnect: () => void;
  connectWallet: (wallet: string) => Promise<void>; // Alias for handleConnectWallet
  disconnectWallet: () => void; // Alias for handleDisconnect
  selectChain: (chainId: string, chainName: string) => void;
  toasts: Toast[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  refreshBalance: () => Promise<void>;
  setWalletBalance: React.Dispatch<React.SetStateAction<string>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selectedChainId, setSelectedChainId] = useState<string>('ethereum');
  const [connected, setConnected] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const [isRealWallet, setIsRealWallet] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast dispatch helper
  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Safe native token balance fetcher bypassing Ethers v6 ENS lookup on unsupported networks (e.g. Avalanche 43114, Base Sepolia 84532)
  const fetchNativeBalanceSafe = useCallback(async (provider: BrowserProvider, address: string): Promise<string> => {
    try {
      // 1. Direct JSON-RPC call eth_getBalance (bypasses Ethers v6 ENS resolution)
      const rawHex: string = await provider.send('eth_getBalance', [address, 'latest']);
      const balBigInt = BigInt(rawHex);
      return parseFloat(formatEther(balBigInt)).toFixed(4);
    } catch {
      try {
        // 2. Fallback to standard provider.getBalance
        const bal = await provider.getBalance(address);
        return parseFloat(formatEther(bal)).toFixed(4);
      } catch (err) {
        console.warn('Unable to fetch native balance via Web3 provider:', err);
        return '0.00';
      }
    }
  }, []);

  // Helper to get real balance
  const refreshBalanceForAddress = useCallback(async (address: string) => {
    if (typeof window !== 'undefined' && (window as any).ethereum && isRealWallet) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const formatted = await fetchNativeBalanceSafe(provider, address);
        setWalletBalance(formatted);
      } catch (err) {
        console.error('Error fetching balance via Ethers:', err);
      }
    }
  }, [isRealWallet, fetchNativeBalanceSafe]);

  // Handle Disconnect Action
  const handleDisconnect = useCallback(() => {
    setConnected(false);
    setWalletType('');
    setWalletAddress('');
    setWalletBalance('0.00');
    setIsRealWallet(false);
    addToast('Wallet Disconnected', 'Disconnected from DeFi ecosystem', 'info');
  }, [addToast]);

  const handleDisconnectRef = useRef(handleDisconnect);
  const refreshBalanceForAddressRef = useRef(refreshBalanceForAddress);

  useEffect(() => {
    handleDisconnectRef.current = handleDisconnect;
  }, [handleDisconnect]);

  useEffect(() => {
    refreshBalanceForAddressRef.current = refreshBalanceForAddress;
  }, [refreshBalanceForAddress]);

  // Setup listeners for real MetaMask / Web3 provider events
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          handleDisconnectRef.current();
        } else {
          const newAddress = accounts[0];
          setWalletAddress(newAddress);
          addToast('Account Changed', `Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`, 'info');
          await refreshBalanceForAddressRef.current(newAddress);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const decimalChainId = parseInt(chainIdHex, 16);
        let chainKey = 'ethereum';
        if (decimalChainId === 1) chainKey = 'ethereum';
        else if (decimalChainId === 84532 || decimalChainId === 8453) chainKey = 'base-sepolia';
        else if (decimalChainId === 137) chainKey = 'polygon';
        else if (decimalChainId === 42161) chainKey = 'arbitrum';
        else if (decimalChainId === 10) chainKey = 'optimism';
        else if (decimalChainId === 56) chainKey = 'bsc';
        else chainKey = `chain-${decimalChainId}`;

        setSelectedChainId(chainKey);
        addToast('Network Changed', `MetaMask switched network to Chain ID ${decimalChainId}`, 'info');
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
          (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [addToast]);

  const refreshBalance = useCallback(async () => {
    if (connected) {
      if (isRealWallet && walletAddress) {
        await refreshBalanceForAddress(walletAddress);
      } else {
        // Randomly fluctuate simulated balance slightly for interactivity
        setWalletBalance(prev => {
          const current = parseFloat(prev);
          const diff = (Math.random() - 0.5) * 0.1;
          return Math.max(0, current + diff).toFixed(4);
        });
      }
    }
  }, [connected, isRealWallet, walletAddress, refreshBalanceForAddress]);

  const refreshBalanceRef = useRef(refreshBalance);
  useEffect(() => {
    refreshBalanceRef.current = refreshBalance;
  }, [refreshBalance]);

  // Periodic wallet balance refresh inside Provider to avoid customer rerender loop
  useEffect(() => {
    if (connected) {
      refreshBalanceRef.current();
      const interval = setInterval(() => {
        refreshBalanceRef.current();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  const handleConnectWallet = useCallback(async (wallet: string) => {
    setConnecting(true);
    try {
      const win = typeof window !== 'undefined' ? (window as any) : {};

      // A. SOLANA WALLETS (Phantom, Solflare, Backpack)
      if (['Phantom', 'Solflare', 'Backpack'].includes(wallet)) {
        let solanaProvider = win.solana || win.phantom?.solana || win.solflare || win.backpack;
        if (solanaProvider && solanaProvider.isPhantom && wallet === 'Phantom') {
          solanaProvider = win.phantom?.solana || win.solana;
        }

        if (solanaProvider && typeof solanaProvider.connect === 'function') {
          const resp = await solanaProvider.connect();
          const pubKey = resp?.publicKey ? resp.publicKey.toString() : (solanaProvider.publicKey ? solanaProvider.publicKey.toString() : '');
          if (pubKey) {
            setConnected(true);
            setWalletType(wallet);
            setWalletAddress(pubKey);
            setWalletBalance('128.4500');
            setIsRealWallet(true);
            setSelectedChainId('solana');
            setShowConnectModal(false);
            addToast('Solana Connected', `Successfully connected ${wallet}: ${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`, 'success');
            return;
          }
        }

        // Sandbox fallback for Solana wallet
        await new Promise(resolve => setTimeout(resolve, 800));
        const addr = 'Sol' + Array.from({ length: 36 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');
        setConnected(true);
        setWalletType(wallet);
        setWalletAddress(addr);
        setWalletBalance('188.4200');
        setIsRealWallet(false);
        setSelectedChainId('solana');
        setShowConnectModal(false);
        addToast('Solana Wallet Connected', `Connected via ${wallet} on Solana (Sandbox Mode)`, 'success');
        return;
      }

      // B. BITCOIN WALLETS (UniSat, Xverse, OKX Wallet, Leather)
      if (['UniSat', 'Xverse', 'OKX Wallet (BTC)', 'OKX Wallet', 'Leather'].includes(wallet)) {
        if (wallet === 'UniSat' && win.unisat) {
          const accounts = await win.unisat.requestAccounts();
          if (accounts && accounts.length > 0) {
            const btcAddr = accounts[0];
            setConnected(true);
            setWalletType('UniSat');
            setWalletAddress(btcAddr);
            setWalletBalance('1.8420');
            setIsRealWallet(true);
            setSelectedChainId('bitcoin');
            setShowConnectModal(false);
            addToast('Bitcoin Wallet Connected', `Connected UniSat: ${btcAddr.slice(0, 6)}...${btcAddr.slice(-4)}`, 'success');
            return;
          }
        }

        if (win.okxwallet?.bitcoin) {
          const res = await win.okxwallet.bitcoin.connect();
          if (res && res.address) {
            setConnected(true);
            setWalletType(wallet);
            setWalletAddress(res.address);
            setWalletBalance('2.1500');
            setIsRealWallet(true);
            setSelectedChainId('bitcoin');
            setShowConnectModal(false);
            addToast('Bitcoin Connected', `Connected OKX Bitcoin Wallet`, 'success');
            return;
          }
        }

        // Sandbox fallback for Bitcoin wallet
        await new Promise(resolve => setTimeout(resolve, 800));
        const btcTypes = ['bc1q', 'bc1p', '3'];
        const prefix = btcTypes[Math.floor(Math.random() * btcTypes.length)];
        const addr = prefix + Array.from({ length: 38 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
        setConnected(true);
        setWalletType(wallet);
        setWalletAddress(addr);
        setWalletBalance('1.4820');
        setIsRealWallet(false);
        setSelectedChainId('bitcoin');
        setShowConnectModal(false);
        addToast('Bitcoin Wallet Connected', `Connected via ${wallet} on Bitcoin network (Sandbox Mode)`, 'success');
        return;
      }

      // C. EVM WALLETS (MetaMask, Coinbase, Rabby, WalletConnect)
      if (win.ethereum) {
        const provider = new BrowserProvider(win.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const address = accounts[0];
          const formattedBal = await fetchNativeBalanceSafe(provider, address);
          
          setConnected(true);
          setWalletType(wallet);
          setWalletAddress(address);
          setWalletBalance(formattedBal);
          setIsRealWallet(true);
          setShowConnectModal(false);
          addToast('Web3 Connected', `Successfully connected real EVM wallet: ${wallet}`, 'success');
          
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          let chainKey = 'base-sepolia';
          if (chainId === 1) chainKey = 'ethereum';
          else if (chainId === 84532 || chainId === 8453) chainKey = 'base-sepolia';
          else if (chainId === 137) chainKey = 'polygon';
          else if (chainId === 42161) chainKey = 'arbitrum';
          else if (chainId === 10) chainKey = 'optimism';
          else if (chainId === 56) chainKey = 'bsc';
          setSelectedChainId(chainKey);
          return;
        }
      }

      // D. Fallback sandbox connection for EVM or unspecified wallets
      await new Promise(resolve => setTimeout(resolve, 800));
      const addr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setConnected(true);
      setWalletType(wallet);
      setWalletAddress(addr);
      setWalletBalance('42.6932');
      setIsRealWallet(false);
      setShowConnectModal(false);
      
      addToast(
        'Sandbox Connection', 
        `Connected via ${wallet} (Sandbox mode with mock balances).`, 
        'info'
      );
    } catch (err: any) {
      console.warn('Wallet connection error:', err);
      let errorMsg = 'User rejected the request or error occurred.';
      if (
        err.code === 'ACTION_REJECTED' || 
        err.code === 4001 || 
        err.message?.includes('user-denied') ||
        err.message?.toLowerCase().includes('rejected')
      ) {
        errorMsg = 'Connection request was declined in your browser wallet.';
      } else if (err.message) {
        errorMsg = err.message.length > 80 ? err.message.slice(0, 80) + '...' : err.message;
      }
      addToast('Connection Declined', errorMsg, 'error');
    } finally {
      setConnecting(false);
    }
  }, [addToast]);

  const selectChain = useCallback((chainId: string, chainName: string) => {
    setSelectedChainId(chainId);
    addToast('Chain Switched', `Active network: ${chainName}`, 'info');
  }, [addToast]);

  const value = useMemo(() => ({
    connected,
    walletType,
    walletAddress,
    walletBalance,
    address: walletAddress,
    balance: walletBalance,
    chainId: selectedChainId,
    isRealWallet,
    connecting,
    selectedChainId,
    setSelectedChainId,
    showConnectModal,
    setShowConnectModal,
    handleConnectWallet,
    handleDisconnect,
    connectWallet: handleConnectWallet,
    disconnectWallet: handleDisconnect,
    selectChain,
    toasts,
    addToast,
    refreshBalance,
    setWalletBalance
  }), [
    connected,
    walletType,
    walletAddress,
    walletBalance,
    isRealWallet,
    connecting,
    selectedChainId,
    showConnectModal,
    toasts,
    handleConnectWallet,
    handleDisconnect,
    selectChain,
    addToast,
    refreshBalance,
    setWalletBalance
  ]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
