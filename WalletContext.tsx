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

  // Helper to get real balance
  const refreshBalanceForAddress = useCallback(async (address: string) => {
    if (typeof window !== 'undefined' && (window as any).ethereum && isRealWallet) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const bal = await provider.getBalance(address);
        const formatted = parseFloat(formatEther(bal)).toFixed(4);
        setWalletBalance(formatted);
      } catch (err) {
        console.error('Error fetching balance via Ethers:', err);
      }
    }
  }, [isRealWallet]);

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
      // 1. Try real web3 provider for MetaMask/Coinbase if window.ethereum is present
      if ((wallet === 'MetaMask' || wallet === 'Coinbase') && typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        // Request accounts
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const address = accounts[0];
          const bal = await provider.getBalance(address);
          const formattedBal = parseFloat(formatEther(bal)).toFixed(4);
          
          setConnected(true);
          setWalletType(wallet);
          setWalletAddress(address);
          setWalletBalance(formattedBal);
          setIsRealWallet(true);
          setShowConnectModal(false);
          addToast('Web3 Connected', `Successfully connected real wallet: ${wallet}`, 'success');
          
          // Detect current chain ID
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          let chainKey = 'ethereum';
          if (chainId === 1) chainKey = 'ethereum';
          else if (chainId === 137) chainKey = 'polygon';
          else if (chainId === 42161) chainKey = 'arbitrum';
          else if (chainId === 10) chainKey = 'optimism';
          else if (chainId === 56) chainKey = 'bsc';
          setSelectedChainId(chainKey);
          return;
        }
      }

      // 2. Simulated sandbox connection fallback (if window.ethereum not available or Phantom is picked)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let addr = '';
      let initialBalance = '42.6932';
      if (wallet === 'Phantom') {
        addr = 'Sol' + Array.from({ length: 36 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');
        initialBalance = '188.4200';
      } else {
        addr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }

      setConnected(true);
      setWalletType(wallet);
      setWalletAddress(addr);
      setWalletBalance(initialBalance);
      setIsRealWallet(false);
      setShowConnectModal(false);
      
      if (typeof window !== 'undefined' && !(window as any).ethereum && (wallet === 'MetaMask' || wallet === 'Coinbase')) {
        addToast(
          'Sandbox Connection', 
          `No Web3 browser extension was detected. Established a beautiful simulated ${wallet} connection.`, 
          'info'
        );
      } else {
        addToast('Wallet Connected', `Successfully connected via ${wallet} (Sandbox)`, 'success');
      }
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
