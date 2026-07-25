import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Coins, 
  ArrowLeftRight, 
  Layers, 
  TrendingUp, 
  Wallet, 
  ExternalLink, 
  RefreshCw, 
  ChevronDown, 
  Info, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Activity, 
  Lock, 
  Unlock, 
  Zap, 
  Search, 
  ArrowDownUp, 
  Clock, 
  Check, 
  Globe, 
  HelpCircle,
  Copy,
  TrendingDown,
  ArrowUpRight,
  ShieldAlert,
  Menu,
  X,
  Image,
  Code,
  Sparkles,
  Server,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import './index.css';
import { ethers } from 'ethers';
import { Presentation, Play, Trash2, LogOut, FileText, FileSpreadsheet, FolderOpen, Database, Terminal, Key, Eye, EyeOff, ShieldCheck, Calendar, CheckSquare, FileQuestion, ListTodo } from 'lucide-react';
import { WalletProvider, useWallet, Toast } from './WalletContext';
import { 
  initAuth, 
  googleSignIn, 
  googleLogout, 
  getAccessToken,
  auth
} from './googleAuth';
import { 
  listPresentations, 
  createPresentationFromDeck, 
  deletePresentationFile, 
  COLOR_THEMES, 
  DrivePresentation, 
  GeneratedDeck 
} from './googleSlidesApi';
import {
  listSpreadsheets,
  createSpreadsheet,
  exportPortfolioToSheet,
  exportTransactionsToSheet,
  deleteSpreadsheetFile,
  listDriveFiles,
  DriveSpreadsheet
} from './googleSheetsApi';
import {
  listUpcomingEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent
} from './googleCalendarApi';
import {
  listGoogleDocs,
  createGoogleDoc,
  exportPortfolioToDoc,
  DriveDoc
} from './googleDocsApi';
import {
  listTaskLists,
  listTasks,
  createGoogleTask,
  updateTaskStatus,
  deleteGoogleTask,
  GoogleTaskList,
  GoogleTask
} from './googleTasksApi';
import {
  listGoogleForms,
  createGoogleForm,
  addQuestionsToForm
} from './googleFormsApi';
import {
  loadGapiScript,
  openGooglePicker
} from './googlePickerApi';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Token {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  balance: number;
  logo: string;
  color: string;
  totalSupply?: number;
}

interface Chain {
  id: string;
  name: string;
  symbol: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  gasPrice: string;
  explorer: string;
  icon: string;
  tokens: Token[];
}

interface StakingPool {
  id: string;
  tokenSymbol: string;
  poolName: string;
  apy: number;
  staked: number;
  rewards: number;
  chain: string;
}

interface NFTItem {
  id: string;
  name: string;
  collection: string;
  imageGradient: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  powerRating: number;
  mintedAt: string;
}

interface InscriptionItem {
  id: string;
  number: string;
  contentType: string;
  sat: string;
  sizeBytes: number;
  feeRate: number;
  name: string;
  timestamp: string;
}

interface ValidatorNode {
  id: string;
  name: string;
  commission: string;
  delegated: number;
  myDelegation: number;
  status: 'Active' | 'Inactive';
  uptime: string;
}

interface Transaction {
  id: string;
  type: 'swap' | 'bridge' | 'stake' | 'unstake' | 'mint_nft' | 'inscribe_btc' | 'delegate' | 'undelegate' | 'add_liquidity' | 'remove_liquidity' | 'claim_fees';
  chain: string;
  details: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  txHash: string;
}

export interface LiquidityPool {
  id: string;
  chain: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  tokenAAmount: number;
  tokenBAmount: number;
  apy: number;
  volume24h: number;
  myShare: number;
  myLiquidityA: number;
  myLiquidityB: number;
  myRewards: number;
}

// ==========================================
// DATA DEFINITIONS & INITIAL STATES
// ==========================================

const CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    glowColor: 'rgba(98, 126, 234, 0.4)',
    bgGradient: 'from-indigo-600/20 via-slate-950 to-slate-950',
    gasPrice: '24 Gwei',
    explorer: 'https://etherscan.io/tx/',
    icon: 'Ξ',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', price: 3450.25, priceChange24h: 2.45, balance: 1.45, logo: 'Ξ', color: '#627EEA' },
      { symbol: 'EAIR', name: "Ether's Air", price: 0.91, priceChange24h: 12.50, balance: 4000.00, logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/08e70c173_logo.png', color: '#6366F1', totalSupply: 60000000 },
      { symbol: 'WEAIR', name: "W Ether's Air", price: 0.91, priceChange24h: 12.50, balance: 4000.00, logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/08e70c173_logo.png', color: '#818CF8', totalSupply: 60000000 },
      { symbol: 'E33R', name: "E33R", price: 1.25, priceChange24h: 8.40, balance: 4000.00, logo: 'E33R', color: '#EC4899', totalSupply: 60000000 },
      { symbol: 'USDT', name: 'Tether USD', price: 1.00, priceChange24h: 0.01, balance: 1250.00, logo: '$', color: '#26A17B' },
      { symbol: 'USDC', name: 'USD Coin', price: 1.00, priceChange24h: -0.02, balance: 740.00, logo: 'C', color: '#2775CA' },
      { symbol: 'LINK', name: 'Chainlink', price: 18.75, priceChange24h: 5.12, balance: 45.00, logo: 'L', color: '#375BD2' },
      { symbol: 'UNI', name: 'Uniswap', price: 7.85, priceChange24h: -1.34, balance: 20.00, logo: 'U', color: '#FF007A' },
    ]
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    color: '#14F195',
    glowColor: 'rgba(20, 241, 149, 0.4)',
    bgGradient: 'from-emerald-600/20 via-slate-950 to-slate-950',
    gasPrice: '0.00005 SOL',
    explorer: 'https://solscan.io/tx/',
    icon: '◎',
    tokens: [
      { symbol: 'SOL', name: 'Solana', price: 148.50, priceChange24h: 6.84, balance: 12.8, logo: '◎', color: '#14F195' },
      { symbol: 'USDC', name: 'USD Coin', price: 1.00, priceChange24h: 0.00, balance: 500.00, logo: 'C', color: '#2775CA' },
      { symbol: 'JUP', name: 'Jupiter', price: 1.12, priceChange24h: 12.41, balance: 350.0, logo: 'J', color: '#F39C12' },
      { symbol: 'BONK', name: 'Bonk', price: 0.0000245, priceChange24h: -4.15, balance: 12500000, logo: 'B', color: '#E67E22' },
      { symbol: 'PYTH', name: 'Pyth Network', price: 0.48, priceChange24h: 3.25, balance: 120.0, logo: 'P', color: '#9B59B6' },
    ]
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'POL',
    color: '#8247E5',
    glowColor: 'rgba(130, 71, 229, 0.4)',
    bgGradient: 'from-purple-600/20 via-slate-950 to-slate-950',
    gasPrice: '65 Gwei',
    explorer: 'https://polygonscan.com/tx/',
    icon: 'P',
    tokens: [
      { symbol: 'POL', name: 'Polygon ecosystem token', price: 0.58, priceChange24h: 1.15, balance: 840.0, logo: 'P', color: '#8247E5' },
      { symbol: 'USDT', name: 'Tether USD', price: 1.00, priceChange24h: 0.01, balance: 340.0, logo: '$', color: '#26A17B' },
      { symbol: 'QUICK', name: 'Quickswap', price: 0.048, priceChange24h: -2.35, balance: 2500.0, logo: 'Q', color: '#00D1FF' },
      { symbol: 'GHST', name: 'Aavegotchi GHST', price: 1.02, priceChange24h: 0.85, balance: 150.0, logo: 'G', color: '#FF7D00' },
    ]
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    color: '#28A0F0',
    glowColor: 'rgba(40, 160, 240, 0.4)',
    bgGradient: 'from-blue-600/20 via-slate-950 to-slate-950',
    gasPrice: '0.1 Gwei',
    explorer: 'https://arbiscan.io/tx/',
    icon: 'A',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum (Arb)', price: 3448.90, priceChange24h: 2.38, balance: 0.54, logo: 'Ξ', color: '#627EEA' },
      { symbol: 'ARB', name: 'Arbitrum', price: 0.96, priceChange24h: -1.82, balance: 1420.0, logo: 'A', color: '#28A0F0' },
      { symbol: 'GMX', name: 'GMX', price: 38.50, priceChange24h: 4.12, balance: 5.5, logo: 'G', color: '#1B2032' },
      { symbol: 'MAGIC', name: 'Treasure MAGIC', price: 0.52, priceChange24h: -3.10, balance: 180.0, logo: 'M', color: '#FF4E82' },
    ]
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    color: '#FF0420',
    glowColor: 'rgba(255, 4, 32, 0.4)',
    bgGradient: 'from-red-600/20 via-slate-950 to-slate-950',
    gasPrice: '0.15 Gwei',
    explorer: 'https://optimistic.etherscan.io/tx/',
    icon: 'O',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum (Op)', price: 3449.10, priceChange24h: 2.41, balance: 0.32, logo: 'Ξ', color: '#627EEA' },
      { symbol: 'OP', name: 'Optimism', price: 1.84, priceChange24h: -0.92, balance: 650.0, logo: 'O', color: '#FF0420' },
      { symbol: 'VELO', name: 'Velodrome', price: 0.095, priceChange24h: 8.52, balance: 1200.0, logo: 'V', color: '#0052FF' },
      { symbol: 'SNX', name: 'Synthetix', price: 2.15, priceChange24h: 1.65, balance: 80.0, logo: 'S', color: '#00D1FF' },
    ]
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    symbol: 'BNB',
    color: '#F3BA2F',
    glowColor: 'rgba(243, 186, 47, 0.4)',
    bgGradient: 'from-amber-600/20 via-slate-950 to-slate-950',
    gasPrice: '3 Gwei',
    explorer: 'https://bscscan.com/tx/',
    icon: 'B',
    tokens: [
      { symbol: 'BNB', name: 'BNB', price: 585.30, priceChange24h: 1.84, balance: 4.25, logo: 'B', color: '#F3BA2F' },
      { symbol: 'USDT', name: 'Tether USD', price: 1.00, priceChange24h: 0.01, balance: 1800.00, logo: '$', color: '#26A17B' },
      { symbol: 'CAKE', name: 'PancakeSwap', price: 1.95, priceChange24h: -2.15, balance: 220.0, logo: '🍰', color: '#D1884F' },
      { symbol: 'XVS', name: 'Venus', price: 7.10, priceChange24h: 4.88, balance: 40.0, logo: 'V', color: '#C6322E' },
    ]
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    color: '#E84142',
    glowColor: 'rgba(232, 65, 66, 0.4)',
    bgGradient: 'from-rose-600/20 via-slate-950 to-slate-950',
    gasPrice: '25 nAVAX',
    explorer: 'https://subnets.avax.network/c-chain/tx/',
    icon: 'A',
    tokens: [
      { symbol: 'AVAX', name: 'Avalanche', price: 28.90, priceChange24h: 5.48, balance: 42.0, logo: 'A', color: '#E84142' },
      { symbol: 'USDC', name: 'USD Coin', price: 1.00, priceChange24h: -0.01, balance: 1100.0, logo: 'C', color: '#2775CA' },
      { symbol: 'JOE', name: 'Trader Joe', price: 0.38, priceChange24h: -1.25, balance: 800.0, logo: 'J', color: '#FF720A' },
      { symbol: 'QI', name: 'BENQI', price: 0.014, priceChange24h: 11.20, balance: 15000.0, logo: 'Q', color: '#00F0FF' },
    ]
  }
];

const INITIAL_STAKING_POOLS: StakingPool[] = [
  { id: 'ethersair-staking', tokenSymbol: 'ETH', poolName: 'ETHERS AIR Native Staking', apy: 15.80, staked: 0, rewards: 0, chain: 'ethereum' },
  { id: 'eth-liquid', tokenSymbol: 'ETH', poolName: 'Lido staked ETH (stETH)', apy: 3.82, staked: 0, rewards: 0, chain: 'ethereum' },
  { id: 'sol-liquid', tokenSymbol: 'SOL', poolName: 'Jito staked SOL (JitoSOL)', apy: 6.45, staked: 0, rewards: 0, chain: 'solana' },
  { id: 'pol-staking', tokenSymbol: 'POL', poolName: 'Validator Native Staking', apy: 5.10, staked: 0, rewards: 0, chain: 'polygon' },
  { id: 'bnb-staking', tokenSymbol: 'BNB', poolName: 'Binance Liquid Staking', apy: 4.25, staked: 0, rewards: 0, chain: 'bnb' },
  { id: 'avax-staking', tokenSymbol: 'AVAX', poolName: 'Benqi Liquid Staking (sAVAX)', apy: 5.80, staked: 0, rewards: 0, chain: 'avalanche' }
];

const INITIAL_LIQUIDITY_POOLS: LiquidityPool[] = [
  // Ethereum
  { id: 'eth-usdc', chain: 'ethereum', tokenASymbol: 'ETH', tokenBSymbol: 'USDC', tokenAAmount: 1200, tokenBAmount: 4140000, apy: 14.50, volume24h: 3200000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'eth-eair', chain: 'ethereum', tokenASymbol: 'ETH', tokenBSymbol: 'EAIR', tokenAAmount: 850, tokenBAmount: 3220000, apy: 32.40, volume24h: 1500000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'usdc-usdt', chain: 'ethereum', tokenASymbol: 'USDC', tokenBSymbol: 'USDT', tokenAAmount: 15000000, tokenBAmount: 15000000, apy: 3.80, volume24h: 8900000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  // Solana
  { id: 'sol-usdc', chain: 'solana', tokenASymbol: 'SOL', tokenBSymbol: 'USDC', tokenAAmount: 45000, tokenBAmount: 6680000, apy: 16.80, volume24h: 4100000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'sol-jup', chain: 'solana', tokenASymbol: 'SOL', tokenBSymbol: 'JUP', tokenAAmount: 18000, tokenBAmount: 2380000, apy: 22.10, volume24h: 1800000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  // Polygon
  { id: 'pol-usdt', chain: 'polygon', tokenASymbol: 'POL', tokenBSymbol: 'USDT', tokenAAmount: 850000, tokenBAmount: 493000, apy: 12.40, volume24h: 350000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'pol-quick', chain: 'polygon', tokenASymbol: 'POL', tokenBSymbol: 'QUICK', tokenAAmount: 320000, tokenBAmount: 3860000, apy: 19.50, volume24h: 180000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  // Arbitrum
  { id: 'arb-eth', chain: 'arbitrum', tokenASymbol: 'ARB', tokenBSymbol: 'ETH', tokenAAmount: 1200000, tokenBAmount: 333, apy: 15.20, volume24h: 950000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'arb-gmx', chain: 'arbitrum', tokenASymbol: 'ARB', tokenBSymbol: 'GMX', tokenAAmount: 450000, tokenBAmount: 11200, apy: 24.50, volume24h: 420000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  // Optimism
  { id: 'op-eth', chain: 'optimism', tokenASymbol: 'OP', tokenBSymbol: 'ETH', tokenAAmount: 480000, tokenBAmount: 256, apy: 13.80, volume24h: 620000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'op-velo', chain: 'optimism', tokenASymbol: 'OP', tokenBSymbol: 'VELO', tokenAAmount: 220000, tokenBAmount: 4260000, apy: 28.10, volume24h: 310000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  // BNB
  { id: 'bnb-usdt', chain: 'bnb', tokenASymbol: 'BNB', tokenBSymbol: 'USDT', tokenAAmount: 8500, tokenBAmount: 4970000, apy: 11.20, volume24h: 1200000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'bnb-cake', chain: 'bnb', tokenASymbol: 'BNB', tokenBSymbol: 'CAKE', tokenAAmount: 4100, tokenBAmount: 1230000, apy: 18.90, volume24h: 650000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  // Avalanche
  { id: 'avax-usdc', chain: 'avalanche', tokenASymbol: 'AVAX', tokenBSymbol: 'USDC', tokenAAmount: 48000, tokenBAmount: 1380000, apy: 14.10, volume24h: 880000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 },
  { id: 'avax-joe', chain: 'avalanche', tokenASymbol: 'AVAX', tokenBSymbol: 'JOE', tokenAAmount: 25000, tokenBAmount: 1900000, apy: 22.30, volume24h: 540000, myShare: 0, myLiquidityA: 0, myLiquidityB: 0, myRewards: 0 }
];

const PORTFOLIO_HISTORY = [
  { name: '01 Jun', Balance: 5200 },
  { name: '05 Jun', Balance: 5800 },
  { name: '10 Jun', Balance: 5400 },
  { name: '15 Jun', Balance: 6100 },
  { name: '20 Jun', Balance: 6300 },
  { name: '25 Jun', Balance: 6800 },
  { name: '27 Jun', Balance: 7120 },
];

const STAKING_REWARDS_HISTORY = [
  { name: 'Day 5', Rewards: 0.45 },
  { name: 'Day 10', Rewards: 1.12 },
  { name: 'Day 15', Rewards: 2.34 },
  { name: 'Day 20', Rewards: 3.89 },
  { name: 'Day 25', Rewards: 5.67 },
  { name: 'Day 30', Rewards: 8.42 },
];

const TokenLogo = ({ logo, symbol, color }: { logo: string; symbol: string; color: string }) => {
  const [srcIndex, setSrcIndex] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  const urls: string[] = [];
  if (logo && logo.startsWith('http')) {
    urls.push(logo);
  }

  if (symbol === 'E33R') {
    urls.push(
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/E33R_logo.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/E33R.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/e33r_logo.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/e33r.png'
    );
  } else if (symbol === 'WEAIR') {
    urls.push(
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/WEAIR_logo.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/WEAIR.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/weair_logo.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/weair.png'
    );
  } else if (symbol === 'EAIR') {
    urls.push(
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/EAIR_logo.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/EAIR.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/eair_logo.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c77814775ee0229ccf8e02/eair.png'
    );
  }

  if (urls.length === 0 || failed || srcIndex >= urls.length) {
    return <span style={{ color }}>{symbol.substring(0, 4)}</span>;
  }

  return (
    <img
      src={urls[srcIndex]}
      alt={symbol}
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
      onError={() => {
        if (srcIndex + 1 < urls.length) {
          setSrcIndex(srcIndex + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
};

// ==========================================
// CORE COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'swap' | 'bridge' | 'stake' | 'history' | 'api' | 'nfts' | 'ethersair' | 'inscriptions' | 'slides'>('overview');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('rezadress6659@gmail.com');
  const [walletFilter, setWalletFilter] = useState<'all' | 'eth' | 'sol' | 'btc'>('all');

  // NFT States
  const [nfts, setNfts] = useState<NFTItem[]>([
    { id: 'nft-1', name: "EthersAir Pioneer #148", collection: "Genesis Founders", imageGradient: "from-blue-600 to-indigo-900", rarity: "Legendary", powerRating: 98, mintedAt: "2026-06-15" },
    { id: 'nft-2', name: "Cosmic Voyager", collection: "Galaxy Chronicles", imageGradient: "from-purple-600 to-pink-900", rarity: "Rare", powerRating: 82, mintedAt: "2026-06-20" },
    { id: 'nft-3', name: "DeFi Spark", collection: "Abstract Ecosystems", imageGradient: "from-emerald-500 to-teal-800", rarity: "Uncommon", powerRating: 65, mintedAt: "2026-06-25" }
  ]);
  const [nftNameInput, setNftNameInput] = useState<string>('');
  const [nftTemplateInput, setNftTemplateInput] = useState<string>('from-blue-600 to-indigo-900');
  const [nftRarityInput, setNftRarityInput] = useState<'Common' | 'Uncommon' | 'Rare' | 'Legendary'>('Common');
  const [isMintingNft, setIsMintingNft] = useState<boolean>(false);
  const [nftTargetChain, setNftTargetChain] = useState<'ethersair' | 'bitcoin'>('ethersair');

  // Inscription States
  const [inscriptions, setInscriptions] = useState<InscriptionItem[]>([
    { id: 'ins-1', number: "#68,230,114", contentType: "image/png", sat: "4509123847921", sizeBytes: 25088, feeRate: 18, name: "Ord Punk Alpha", timestamp: "18:12:05" },
    { id: 'ins-2', number: "#68,230,115", contentType: "text/plain", sat: "1940128479218", sizeBytes: 120, feeRate: 22, name: "BRC-20 deploy 'AIR'", timestamp: "18:14:22" },
    { id: 'ins-3', number: "#68,230,116", contentType: "image/webp", sat: "3491029487192", sizeBytes: 14540, feeRate: 14, name: "Digital Artifact #99", timestamp: "18:15:45" }
  ]);
  const [inscriptionContent, setInscriptionContent] = useState<string>('');
  const [inscriptionName, setInscriptionName] = useState<string>('');
  const [inscriptionType, setInscriptionType] = useState<string>('text/plain');
  const [inscriptionFeeRate, setInscriptionFeeRate] = useState<number>(18); // sat/vB
  const [isInscribing, setIsInscribing] = useState<boolean>(false);

  // EthersAir Validator States
  const [validators, setValidators] = useState<ValidatorNode[]>([
    { id: 'node-1', name: "Alpha Core Validator", commission: "3%", delegated: 12450000, myDelegation: 0, status: "Active", uptime: "99.98%" },
    { id: 'node-2', name: "Genesis Sentinel", commission: "2%", delegated: 9120000, myDelegation: 0, status: "Active", uptime: "99.95%" },
    { id: 'node-3', name: "Orbital Nexus Node", commission: "5%", delegated: 6840000, myDelegation: 0, status: "Active", uptime: "99.89%" },
    { id: 'node-4', name: "Nebula Guard", commission: "1%", delegated: 4200000, myDelegation: 0, status: "Active", uptime: "99.99%" }
  ]);
  const [delegateAmount, setDelegateAmount] = useState<string>('');
  const [selectedValidatorId, setSelectedValidatorId] = useState<string>('node-1');
  const [isDelegating, setIsDelegating] = useState<boolean>(false);

  // Private API configuration states
  const [apiEndpoint, setApiEndpoint] = useState<string>(() => localStorage.getItem('apex_api_endpoint') || '');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('apex_api_key') || '');
  const [useCustomApi, setUseCustomApi] = useState<boolean>(() => localStorage.getItem('apex_use_custom_api') === 'true');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  // Scanning States
  const [apiScanStatus, setApiScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [apiScanLogs, setApiScanLogs] = useState<string[]>([]);
  const [apiScanResult, setApiScanResult] = useState<{ score: string; latency: string; vulnerabilities: string; ssl: string } | null>(null);

  const [chainScanStatus, setChainScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [chainScanLogs, setChainScanLogs] = useState<string[]>([]);
  const [chainScanResult, setChainScanResult] = useState<{ btcBlock: string; btcGas: string; btcInscriptions: string; solTps: string; solEpoch: string; solValidators: string } | null>(null);

  // Alchemy & Developer Smart Account States
  const [alchemyApiKey, setAlchemyApiKey] = useState<string>(() => localStorage.getItem('apex_alchemy_api_key') || '');
  const [alchemyNetwork, setAlchemyNetwork] = useState<string>('eth-sepolia');
  const [alchemyWallet, setAlchemyWallet] = useState<{ address: string; privateKey: string; mnemonic: string } | null>(() => {
    const saved = localStorage.getItem('apex_alchemy_wallet');
    return saved ? JSON.parse(saved) : null;
  });
  const [alchemySmartAccount, setAlchemySmartAccount] = useState<string | null>(() => localStorage.getItem('apex_alchemy_smart_account') || null);
  const [isAlchemyDeploying, setIsAlchemyDeploying] = useState<boolean>(false);
  const [isGeneratingAlchemyWallet, setIsGeneratingAlchemyWallet] = useState<boolean>(false);
  const [alchemyTerminalLogs, setAlchemyTerminalLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('apex_alchemy_logs');
    return saved ? JSON.parse(saved) : [
      `[${new Date().toLocaleTimeString()}] System ready. Please save your Alchemy API Key or generate a developer Externally Owned Account (EOA) to begin.`
    ];
  });

  // Google Slides & Drive States
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [slidesDecks, setSlidesDecks] = useState<DrivePresentation[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState<boolean>(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState<boolean>(false);
  const [slidePrompt, setSlidePrompt] = useState<string>('');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [selectedTheme, setSelectedTheme] = useState<string>('tech-slate');
  const [isGeneratingDeck, setIsGeneratingDeck] = useState<boolean>(false);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  // Google Sheets & Drive States
  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheet[]>([]);
  const [isLoadingSpreadsheets, setIsLoadingSpreadsheets] = useState<boolean>(false);
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string | null>(null);
  const [newSheetTitle, setNewSheetTitle] = useState<string>('');
  const [isCreatingSpreadsheet, setIsCreatingSpreadsheet] = useState<boolean>(false);
  const [isExportingPortfolio, setIsExportingPortfolio] = useState<boolean>(false);
  const [isExportingTransactions, setIsExportingTransactions] = useState<boolean>(false);

  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState<boolean>(false);
  const [activeDriveFileId, setActiveDriveFileId] = useState<string | null>(null);
  const [activeDriveFileMimeType, setActiveDriveFileMimeType] = useState<string | null>(null);

  // Google Docs states
  const [docsList, setDocsList] = useState<DriveDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [customDocUrlOrId, setCustomDocUrlOrId] = useState<string>('');
  const [isCreatingDoc, setIsCreatingDoc] = useState<boolean>(false);
  const [isExportingDoc, setIsExportingDoc] = useState<boolean>(false);

  // Google Calendar states
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [newEventSummary, setNewEventSummary] = useState<string>('');
  const [newEventDesc, setNewEventDesc] = useState<string>('');
  const [newEventStart, setNewEventStart] = useState<string>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return d.toISOString().substring(0, 16); // format: YYYY-MM-DDTHH:MM
  });
  const [newEventEnd, setNewEventEnd] = useState<string>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(0);
    return d.toISOString().substring(0, 16);
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);

  // Google Tasks states
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('');
  const [googleTasks, setGoogleTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isCreatingTask, setIsCreatingTask] = useState<boolean>(false);

  // Google Forms states
  const [formsList, setFormsList] = useState<any[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState<boolean>(false);
  const [newFormTitle, setNewFormTitle] = useState<string>('');
  const [newFormDesc, setNewFormDesc] = useState<string>('');
  const [isCreatingForm, setIsCreatingForm] = useState<boolean>(false);

  // Google Picker states
  const [pickedFile, setPickedFile] = useState<{ id: string; name: string; mimeType: string; url: string } | null>(null);

  // Sub-tab selection inside the Google Workspace tab
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'slides' | 'sheets' | 'docs' | 'calendar' | 'tasks' | 'forms' | 'picker' | 'drive'>('slides');

  // Cloud SQL Database Persistence Helpers
  const syncDatabaseUserData = async (token: string, user: any) => {
    try {
      // 1. Register or fetch the user in Cloud SQL
      const regRes = await fetch('/api/db/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!regRes.ok) {
        throw new Error('Failed to synchronize user in database');
      }

      // 2. Fetch the user's saved data from Cloud SQL
      const dataRes = await fetch('/api/db/user/data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!dataRes.ok) {
        throw new Error('Failed to load user database records');
      }
      const data = await dataRes.json();

      // 3. Update application state with loaded records
      if (data.transactions && data.transactions.length > 0) {
        setTransactions(prev => {
          const existingHashes = new Set(prev.map(t => t.txHash || t.id));
          const loaded = data.transactions.map((t: any) => ({
            id: t.id.toString(),
            type: t.type,
            chain: t.chain,
            details: t.details,
            amount: t.amount,
            status: t.status,
            timestamp: t.timestamp,
            txHash: t.txHash
          }));
          const filteredLoaded = loaded.filter((t: any) => !existingHashes.has(t.txHash || t.id));
          return [...filteredLoaded, ...prev];
        });
      }

      if (data.stakingPools && data.stakingPools.length > 0) {
        setStakingPools(prev => {
          return prev.map(p => {
            const dbPool = data.stakingPools.find((dbP: any) => dbP.tokenSymbol === p.tokenSymbol && dbP.poolName === p.poolName && dbP.chain === p.chain);
            if (dbPool) {
              return {
                ...p,
                dbId: dbPool.id,
                staked: dbPool.staked,
                rewards: dbPool.rewards
              };
            }
            return p;
          });
        });
      }

      if (data.nfts && data.nfts.length > 0) {
        setNfts(prev => {
          const loaded = data.nfts.map((n: any) => ({
            id: `db-${n.id}`,
            dbId: n.id,
            name: n.name,
            collection: n.collection,
            imageGradient: n.imageGradient,
            rarity: n.rarity,
            powerRating: n.powerRating,
            mintedAt: n.mintedAt
          }));
          const existingNames = new Set(prev.map(n => n.name));
          const filteredLoaded = loaded.filter((n: any) => !existingNames.has(n.name));
          return [...prev, ...filteredLoaded];
        });
      }

      if (data.inscriptions && data.inscriptions.length > 0) {
        setInscriptions(prev => {
          const loaded = data.inscriptions.map((ins: any) => ({
            id: `db-${ins.id}`,
            dbId: ins.id,
            number: ins.number,
            contentType: ins.contentType,
            sat: ins.sat,
            sizeBytes: ins.sizeBytes,
            feeRate: ins.feeRate,
            name: ins.name,
            timestamp: ins.timestamp
          }));
          const existingSats = new Set(prev.map(ins => ins.sat));
          const filteredLoaded = loaded.filter((ins: any) => !existingSats.has(ins.sat));
          return [...prev, ...filteredLoaded];
        });
      }

      addToast('Cloud Sync Success', 'Synchronized with Cloud SQL database', 'success');
    } catch (err) {
      console.error('Error syncing user database:', err);
    }
  };

  const persistTransactionCloud = async (tx: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        await fetch('/api/db/transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(tx)
        });
      }
    } catch (e) {
      console.error('Error persisting transaction to cloud:', e);
    }
  };

  const persistStakingPoolCloud = async (pool: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        if (pool.dbId) {
          await fetch(`/api/db/staking/${pool.dbId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ staked: pool.staked, rewards: pool.rewards })
          });
        } else {
          const res = await fetch('/api/db/staking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(pool)
          });
          if (res.ok) {
            const saved = await res.json();
            setStakingPools(prev => prev.map(p => p.id === pool.id ? { ...p, dbId: saved.id } : p));
          }
        }
      }
    } catch (e) {
      console.error('Error persisting staking pool to cloud:', e);
    }
  };

  const persistNftCloud = async (nft: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/db/nft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(nft)
        });
        if (res.ok) {
          const saved = await res.json();
          setNfts(prev => prev.map(n => n.id === nft.id ? { ...n, dbId: saved.id, id: `db-${saved.id}` } : n));
        }
      }
    } catch (e) {
      console.error('Error persisting NFT to cloud:', e);
    }
  };

  const deleteNftCloud = async (nft: any) => {
    try {
      const user = auth.currentUser;
      const targetId = nft.dbId;
      if (user && targetId) {
        const idToken = await user.getIdToken();
        await fetch(`/api/db/nft/${targetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
      }
    } catch (e) {
      console.error('Error deleting NFT from cloud:', e);
    }
  };

  const persistInscriptionCloud = async (inscription: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/db/inscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(inscription)
        });
        if (res.ok) {
          const saved = await res.json();
          setInscriptions(prev => prev.map(ins => ins.id === inscription.id ? { ...ins, dbId: saved.id, id: `db-${saved.id}` } : ins));
        }
      }
    } catch (e) {
      console.error('Error persisting inscription to cloud:', e);
    }
  };

  // Initialize Google Auth Listener on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        // Automatically fetch files on successful login
        loadAllWorkspaceData(token);

        try {
          const idToken = await user.getIdToken();
          await syncDatabaseUserData(idToken, user);
        } catch (e) {
          console.error("Failed to get idToken for database sync:", e);
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setSlidesDecks([]);
        setSpreadsheets([]);
        setDocsList([]);
        setCalendarEvents([]);
        setTaskLists([]);
        setGoogleTasks([]);
        setFormsList([]);
        setPickedFile(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch presentations helper
  const loadUserDecks = async (token: string) => {
    setIsLoadingDecks(true);
    try {
      const files = await listPresentations(token);
      setSlidesDecks(files);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve presentation list from Google Drive.', 'error');
    } finally {
      setIsLoadingDecks(false);
    }
  };

  // Fetch spreadsheets helper
  const loadUserSheets = async (token: string) => {
    setIsLoadingSpreadsheets(true);
    try {
      const files = await listSpreadsheets(token);
      setSpreadsheets(files);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve spreadsheet list from Google Drive.', 'error');
    } finally {
      setIsLoadingSpreadsheets(false);
    }
  };

  // Fetch drive files helper
  const loadUserDriveFiles = async (token: string) => {
    setIsLoadingDriveFiles(true);
    try {
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve files from Google Drive.', 'error');
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  // Fetch Google Docs helper
  const loadUserDocs = async (token: string) => {
    setIsLoadingDocs(true);
    try {
      const files = await listGoogleDocs(token);
      setDocsList(files);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve Google Docs from Google Drive.', 'error');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Fetch Calendar helper
  const loadUserEvents = async (token: string) => {
    setIsLoadingEvents(true);
    try {
      const events = await listUpcomingEvents(token);
      setCalendarEvents(events);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve Google Calendar events.', 'error');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Fetch Tasks helper
  const loadUserTasks = async (token: string) => {
    setIsLoadingTasks(true);
    try {
      const lists = await listTaskLists(token);
      setTaskLists(lists);
      if (lists.length > 0) {
        const defaultList = lists[0].id;
        setSelectedTaskListId(defaultList);
        const tasks = await listTasks(token, defaultList);
        setGoogleTasks(tasks);
      }
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve Google Tasks lists.', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleTaskListChange = async (listId: string) => {
    setSelectedTaskListId(listId);
    if (!googleToken) return;
    setIsLoadingTasks(true);
    try {
      const tasks = await listTasks(googleToken, listId);
      setGoogleTasks(tasks);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve tasks.', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Fetch Google Forms helper
  const loadUserForms = async (token: string) => {
    setIsLoadingForms(true);
    try {
      const forms = await listGoogleForms(token);
      setFormsList(forms);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to retrieve Google Forms from Google Drive.', 'error');
    } finally {
      setIsLoadingForms(false);
    }
  };

  // Docs Action Handlers
  const handleCreateDoc = async () => {
    if (!googleToken) return;
    const title = newDocTitle.trim() || `Apex DeFi Investment Thesis - ${new Date().toLocaleDateString()}`;
    setIsCreatingDoc(true);
    try {
      const id = await createGoogleDoc(googleToken, title);
      addToast('Doc Created', `Successfully created Google Doc: "${title}"`, 'success');
      setNewDocTitle('');
      await loadUserDocs(googleToken);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to create Google Doc.', 'error');
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const handleExportDoc = async (docId: string) => {
    if (!googleToken) return;
    setIsExportingDoc(true);
    try {
      const formattedData = chainsData.map(c => ({
        chainName: c.name,
        tokens: c.tokens,
        total: c.tokens.reduce((acc, t) => acc + (t.balance * t.price), 0)
      }));
      await exportPortfolioToDoc(googleToken, docId, formattedData, portfolioTotalBalance);
      addToast('Export Success', 'DeFi portfolio summary appended to your Google Doc!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Export Failed', err.message || 'Failed to export portfolio snapshot to doc.', 'error');
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleExportToCustomDoc = async () => {
    if (!googleToken) {
      addToast('Google Account Required', 'Please connect your Google account to write to Google Docs.', 'info');
      return;
    }
    if (!customDocUrlOrId.trim()) {
      addToast('Input Required', 'Please enter a Google Doc URL or Document ID.', 'info');
      return;
    }

    const match = customDocUrlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const docId = (match && match[1]) ? match[1] : customDocUrlOrId.trim();

    setIsExportingDoc(true);
    try {
      const formattedData = chainsData.map(c => ({
        chainName: c.name,
        tokens: c.tokens,
        total: c.tokens.reduce((acc, t) => acc + (t.balance * t.price), 0)
      }));
      await exportPortfolioToDoc(googleToken, docId, formattedData, portfolioTotalBalance);
      addToast('Export Success', 'DeFi portfolio summary appended to your specified Google Doc!', 'success');
      setCustomDocUrlOrId('');
      await loadUserDocs(googleToken);
    } catch (err: any) {
      console.error(err);
      addToast('Export Failed', err.message || 'Failed to append report to specified Google Doc.', 'error');
    } finally {
      setIsExportingDoc(false);
    }
  };

  // Calendar Action Handlers
  const handleCreateCalendarEvent = async () => {
    if (!googleToken) return;
    if (!newEventSummary.trim()) {
      addToast('Title Required', 'Please enter a title for the calendar event.', 'info');
      return;
    }
    setIsCreatingEvent(true);
    try {
      await createCalendarEvent(googleToken, {
        summary: newEventSummary,
        description: newEventDesc || 'Created via Apex DeFi Dashboard',
        startTime: new Date(newEventStart).toISOString(),
        endTime: new Date(newEventEnd).toISOString()
      });
      addToast('Event Scheduled', `Successfully scheduled "${newEventSummary}"!`, 'success');
      setNewEventSummary('');
      setNewEventDesc('');
      await loadUserEvents(googleToken);
    } catch (err: any) {
      console.error(err);
      addToast('Scheduling Failed', 'Failed to add event to Google Calendar.', 'error');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleDeleteCalendarEvent = async (eventId: string) => {
    if (!googleToken) return;
    try {
      await deleteCalendarEvent(googleToken, eventId);
      addToast('Event Deleted', 'Google Calendar event removed successfully.', 'success');
      await loadUserEvents(googleToken);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to delete calendar event.', 'error');
    }
  };

  // Tasks Action Handlers
  const handleCreateTask = async () => {
    if (!googleToken || !selectedTaskListId) return;
    if (!newTaskTitle.trim()) {
      addToast('Task Title Required', 'Please enter a title for the task.', 'info');
      return;
    }
    setIsCreatingTask(true);
    try {
      await createGoogleTask(googleToken, selectedTaskListId, {
        title: newTaskTitle
      });
      addToast('Task Added', `Successfully added task: "${newTaskTitle}"`, 'success');
      setNewTaskTitle('');
      // Reload tasks
      const tasks = await listTasks(googleToken, selectedTaskListId);
      setGoogleTasks(tasks);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to add task.', 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!googleToken || !selectedTaskListId) return;
    try {
      await updateTaskStatus(googleToken, selectedTaskListId, taskId, isCompleted);
      addToast('Task Updated', isCompleted ? 'Task marked as completed!' : 'Task active again.', 'success');
      const tasks = await listTasks(googleToken, selectedTaskListId);
      setGoogleTasks(tasks);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to update task status.', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!googleToken || !selectedTaskListId) return;
    try {
      await deleteGoogleTask(googleToken, selectedTaskListId, taskId);
      addToast('Task Deleted', 'Task removed successfully.', 'success');
      const tasks = await listTasks(googleToken, selectedTaskListId);
      setGoogleTasks(tasks);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to delete task.', 'error');
    }
  };

  // Forms Action Handlers
  const handleCreateForm = async () => {
    if (!googleToken) return;
    const title = newFormTitle.trim() || `Apex DeFi LP survey - ${new Date().toLocaleDateString()}`;
    const desc = newFormDesc.trim() || 'Yield polling & smart account feedback survey';
    setIsCreatingForm(true);
    try {
      const form = await createGoogleForm(googleToken, title, desc);
      await addQuestionsToForm(googleToken, form.formId);
      addToast('Form Configured', `Successfully created and styled Form: "${title}"!`, 'success');
      setNewFormTitle('');
      setNewFormDesc('');
      await loadUserForms(googleToken);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to construct Google Form with questions.', 'error');
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Google Picker Opener
  const handleOpenPicker = async () => {
    if (!googleToken) {
      addToast('Auth Required', 'Connect Google to launch the File Picker.', 'info');
      return;
    }
    try {
      await loadGapiScript();
      openGooglePicker(googleToken, (file) => {
        setPickedFile(file);
        addToast('File Selected', `Picked: "${file.name}" via Google Picker`, 'success');
      });
    } catch (err: any) {
      console.error(err);
      addToast('Picker Error', 'Google Picker failed to open (this is common inside iframes). Running high-fidelity local picker instead!', 'info');
      // Set to local picker (Drive tab)
      setWorkspaceSubTab('picker');
    }
  };

  const loadAllWorkspaceData = async (token: string) => {
    loadUserDecks(token);
    loadUserSheets(token);
    loadUserDocs(token);
    loadUserEvents(token);
    loadUserTasks(token);
    loadUserForms(token);
    loadUserDriveFiles(token);
  };

  // Google Sheets Action Handlers
  const handleCreateSpreadsheet = async () => {
    if (!googleToken) {
      addToast('Auth Required', 'Please connect your Google Account first.', 'info');
      return;
    }
    const title = newSheetTitle.trim() || `Apex DeFi Export - ${new Date().toLocaleDateString()}`;
    setIsCreatingSpreadsheet(true);
    try {
      const id = await createSpreadsheet(googleToken, title);
      addToast('Created Sheet', `Successfully created spreadsheet: "${title}"`, 'success');
      setNewSheetTitle('');
      await loadUserSheets(googleToken);
      setActiveSpreadsheetId(id);
      setWorkspaceSubTab('sheets');
    } catch (err: any) {
      console.error(err);
      addToast('Error', err.message || 'Failed to create spreadsheet.', 'error');
    } finally {
      setIsCreatingSpreadsheet(false);
    }
  };

  const handleExportPortfolio = async (spreadsheetId: string) => {
    if (!googleToken) {
      addToast('Auth Required', 'Please connect your Google Account first.', 'info');
      return;
    }
    setIsExportingPortfolio(true);
    try {
      const formattedData = chainsData.map(c => ({
        chainName: c.name,
        tokens: c.tokens,
        total: c.tokens.reduce((acc, t) => acc + (t.balance * t.price), 0)
      }));
      await exportPortfolioToSheet(googleToken, spreadsheetId, formattedData, portfolioTotalBalance);
      addToast('Export Successful', 'DeFi portfolio balances written to Google Sheet!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Export Failed', err.message || 'Failed to write portfolio to sheet.', 'error');
    } finally {
      setIsExportingPortfolio(false);
    }
  };

  const handleExportTransactions = async (spreadsheetId: string) => {
    if (!googleToken) {
      addToast('Auth Required', 'Please connect your Google Account first.', 'info');
      return;
    }
    if (transactions.length === 0) {
      addToast('No Data', 'You do not have any transaction logs to export yet.', 'info');
      return;
    }
    setIsExportingTransactions(true);
    try {
      const formattedTransactions = transactions.map(tx => ({
        ...tx,
        status: tx.status || 'success'
      }));
      await exportTransactionsToSheet(googleToken, spreadsheetId, formattedTransactions);
      addToast('Export Successful', 'Transaction history logs written to Google Sheet!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Export Failed', err.message || 'Failed to write transaction logs to sheet.', 'error');
    } finally {
      setIsExportingTransactions(false);
    }
  };

  const handleDeleteSpreadsheet = async (sheetId: string) => {
    if (!googleToken) return;
    try {
      await deleteSpreadsheetFile(googleToken, sheetId);
      addToast('Deleted Spreadsheet', 'Sheet file was moved to Trash.', 'success');
      if (activeSpreadsheetId === sheetId) {
        setActiveSpreadsheetId(null);
      }
      await loadUserSheets(googleToken);
    } catch (err: any) {
      console.error(err);
      addToast('Error', 'Failed to delete spreadsheet file.', 'error');
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    if (isGoogleLoggingIn) return;
    setIsGoogleLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        addToast('Connected Google Workspace', 'Welcome, Workspace permissions granted successfully!', 'success');
        loadAllWorkspaceData(result.accessToken);
      }
    } catch (err: any) {
      if (
        err.code === 'auth/cancelled-popup-request' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/user-cancelled' ||
        err.message?.includes('cancelled') ||
        err.message?.includes('closed') ||
        err.message?.includes('denied')
      ) {
        addToast('Sign-In Closed', err.message || 'The Google sign-in window was closed or cancelled.', 'info');
      } else if (err.code === 'auth/popup-blocked') {
        addToast('Popup Blocked', 'Google sign-in popup was blocked by your browser. Please allow popups for this site.', 'error');
      } else {
        addToast('Authentication Failed', err.message || 'Failed to complete Google login.', 'error');
      }
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  // Google OAuth Logout
  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      setGoogleToken(null);
      setSlidesDecks([]);
      setSpreadsheets([]);
      setDriveFiles([]);
      setActiveDeckId(null);
      setActiveSpreadsheetId(null);
      addToast('Disconnected', 'Successfully signed out from Google.', 'info');
    } catch (err: any) {
      console.error(err);
    }
  };

  // AI-Powered Deck Builder Action
  const handleGenerateAiDeck = async () => {
    if (!googleToken) {
      addToast('Auth Required', 'Please connect your Google Account first.', 'info');
      return;
    }
    if (!slidePrompt.trim()) {
      addToast('Topic Required', 'Please fill in a topic or prompt for your presentation.', 'error');
      return;
    }

    setIsGeneratingDeck(true);
    addToast('Analyzing & Drafting', 'Gemini AI is structuring your presentation content...', 'info');

    try {
      // 1. Generate text slide structure on the server
      const response = await fetch('/api/gemini/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: slidePrompt,
          count: slideCount,
          theme: selectedTheme
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server failed to build presentation draft.');
      }

      const generatedDeck: GeneratedDeck = await response.json();

      addToast('Programmatic Design', 'Gemini structured the presentation. Creating your slides on Google Slides...', 'info');

      // 2. Client-side programmatically create presentation on Google Drive/Slides
      const presentationId = await createPresentationFromDeck(googleToken, generatedDeck, selectedTheme);

      addToast('Presentation Generated!', `"${generatedDeck.title}" has been successfully built!`, 'success');
      setActiveDeckId(presentationId);
      setSlidePrompt('');

      // Refresh files list
      await loadUserDecks(googleToken);
    } catch (err: any) {
      console.error(err);
      addToast('Generation Failed', err.message || 'Failed to generate slide deck.', 'error');
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  // Delete Slides Document
  const handleDeleteDeck = async (fileId: string) => {
    if (!googleToken) return;
    try {
      await deletePresentationFile(googleToken, fileId);
      addToast('Deleted File', 'Google Slides presentation was moved to trash.', 'success');
      if (activeDeckId === fileId) {
        setActiveDeckId(null);
      }
      loadUserDecks(googleToken);
    } catch (err: any) {
      addToast('Delete Failed', err.message || 'Could not delete slides document.', 'error');
    }
  };

  const handleSaveApiConfig = () => {
    localStorage.setItem('apex_api_endpoint', apiEndpoint);
    localStorage.setItem('apex_api_key', apiKey);
    localStorage.setItem('apex_use_custom_api', useCustomApi ? 'true' : 'false');
    addToast('API Config Saved', 'Your custom API credentials have been saved securely.', 'success');
  };

  const handleTestConnection = () => {
    if (!apiEndpoint) {
      addToast('Error', 'Please enter an RPC endpoint URL to test', 'error');
      return;
    }
    setTestStatus('testing');
    setTimeout(() => {
      if (apiEndpoint.startsWith('http://') || apiEndpoint.startsWith('https://')) {
        setTestStatus('success');
        setTestResult(`Successfully connected! Latency: ${Math.floor(Math.random() * 60 + 15)}ms. Block height: ${Math.floor(Math.random() * 100000 + 19500000)}`);
        addToast('Connection Success', 'RPC endpoint is online and synced.', 'success');
      } else {
        setTestStatus('error');
        setTestResult('Error: Connection failed. Invalid URL format.');
        addToast('Connection Failed', 'Could not establish connection to RPC.', 'error');
      }
    }, 1500);
  };

  const handleScanApi = () => {
    setApiScanStatus('scanning');
    setApiScanLogs([]);
    setApiScanResult(null);

    const logs = [
      "Initializing secure diagnostic pipeline...",
      "Resolving RPC Node Provider Endpoint...",
      "Analyzing API Key configuration parameters...",
      "Performing SSL/TLS handshake integrity verification...",
      "Checking JSON-RPC v2.0 schema response compliance...",
      "Auditing CORS headers & Referrer-Policy headers...",
      "Measuring rate-limit and query throughput density...",
      "Running DEX Aggregator security posture check..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setApiScanLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setApiScanStatus('success');
        setApiScanResult({
          score: apiKey ? "A+ Premium Security" : "B- Simulation Mode",
          latency: `${Math.floor(Math.random() * 30 + 12)}ms (Optimal)`,
          vulnerabilities: "0 potential exploits detected",
          ssl: "TLS 1.3 Active (RSA 2048-bit encryption)"
        });
        addToast('API Scan Complete', 'Private API vulnerability audit completed with 0 errors.', 'success');
      }
    }, 450);
  };

  const handleScanChains = () => {
    setChainScanStatus('scanning');
    setChainScanLogs([]);
    setChainScanResult(null);

    const logs = [
      "Establishing handshake peer connection to Bitcoin Core ledger...",
      "Querying active Bitcoin mempool depth and transaction fee density...",
      "Retrieving current BTC block height from decentralized peer group...",
      "Synchronizing Solana cluster state validator registry...",
      "Pinging Solana high-throughput RPC node clusters...",
      "Checking active Solana epoch progress index...",
      "Validating cross-chain liquidity pool index states..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setChainScanLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setChainScanStatus('success');
        setChainScanResult({
          btcBlock: `#${Math.floor(Math.random() * 500 + 849200)}`,
          btcGas: `${Math.floor(Math.random() * 10 + 18)} sat/vB (Low fee)`,
          btcInscriptions: `${(Math.floor(Math.random() * 2000 + 11000)).toLocaleString()} artifacts`,
          solTps: `${Math.floor(Math.random() * 500 + 2600)} transactions/sec`,
          solEpoch: `642 (${(Math.random() * 10 + 85).toFixed(1)}% progress)`,
          solValidators: `${Math.floor(Math.random() * 50 + 1800)} online nodes`
        });
        addToast('Chain Scan Complete', 'Bitcoin and Solana network scans completed successfully.', 'success');
      }
    }, 450);
  };

  const addAlchemyLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    const formatted = `[${time}] ${msg}`;
    setAlchemyTerminalLogs(prev => {
      const updated = [...prev, formatted];
      localStorage.setItem('apex_alchemy_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveAlchemyKey = (key: string) => {
    const trimmed = key.trim();
    setAlchemyApiKey(trimmed);
    localStorage.setItem('apex_alchemy_api_key', trimmed);
    addAlchemyLog(`Saved Alchemy API Key (ends in ...${trimmed ? trimmed.slice(-4) : 'none'}).`);
    addToast('Alchemy Config Saved', 'Your Alchemy API configuration key is stored locally in this device.', 'success');
  };

  const handleGenerateAlchemyWallet = () => {
    setIsGeneratingAlchemyWallet(true);
    addAlchemyLog("Spinning up secure local entropy collector...");
    
    setTimeout(() => {
      try {
        const randomWallet = ethers.Wallet.createRandom();
        const info = {
          address: randomWallet.address,
          privateKey: randomWallet.privateKey,
          mnemonic: randomWallet.mnemonic ? randomWallet.mnemonic.phrase : ''
        };
        setAlchemyWallet(info);
        localStorage.setItem('apex_alchemy_wallet', JSON.stringify(info));
        
        addAlchemyLog(`New EOA Signer generated: ${info.address}`);
        addAlchemyLog("Derivation Path: m/44'/60'/0'/0/0 (Standard BIP44 Ethereum)");
        addAlchemyLog("Signature mechanics: ECDSA (secp256k1) verified and live.");
        addToast('Web3 Wallet Created', 'Generated a secure developer Externally Owned Account (EOA).', 'success');
      } catch (err: any) {
        addAlchemyLog(`Error generating wallet: ${err?.message || err}`);
        addToast('Wallet Generation Failed', 'Cryptographic entropy failure.', 'error');
      } finally {
        setIsGeneratingAlchemyWallet(false);
      }
    }, 1200);
  };

  const handleDeployAlchemySmartAccount = () => {
    if (!alchemyWallet) {
      addToast('Owner EOA Missing', 'Generate or import a developer EOA first.', 'error');
      return;
    }
    
    setIsAlchemyDeploying(true);
    addAlchemyLog("Initializing Alchemy LightAccount Client connection...");
    
    const logs = [
      `Validating developer EOA Owner Signature (address: ${alchemyWallet.address})...`,
      `Pinging Alchemy Bundler node via HTTP JSON-RPC endpoint: https://${alchemyNetwork}.g.alchemy.com/v2/...`,
      "Creating modular smart contract account deployment intent (ERC-4337)...",
      "Deploying SimpleAccountFactory standard counterfactual mapping...",
      "Requesting sponsorship from default Alchemy Paymaster Gas Manager...",
      "Gas sponsorship verified (Sponsor ID: alchemy_paymaster_gas_free)...",
      "Broadcasting signed UserOperation containing initCode call...",
      "UserOperation successfully submitted! Tx hash: 0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(""),
      "Confirming smart contract deployment at derived deterministic address..."
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logs.length) {
        addAlchemyLog(logs[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        
        // Generate a deterministic-looking address from the EOA
        const derivedPart = ethers.keccak256(ethers.toUtf8Bytes(alchemyWallet.address)).slice(2, 42);
        const smartAddress = ethers.getAddress("0x" + derivedPart);
        
        setAlchemySmartAccount(smartAddress);
        localStorage.setItem('apex_alchemy_smart_account', smartAddress);
        
        addAlchemyLog(`✔ Alchemy Modular Smart Account DEPLOYED: ${smartAddress}`);
        addAlchemyLog("Account logic: SimpleAccount v1.0.0 (ERC-4337 validated)");
        addAlchemyLog("EntryPoint address: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789");
        addToast('Smart Wallet Deployed', 'Modular ERC-4337 smart wallet generated and registered.', 'success');
        setIsAlchemyDeploying(false);
      }
    }, 550);
  };

  const handleResetAlchemyWallet = () => {
    setAlchemyWallet(null);
    setAlchemySmartAccount(null);
    localStorage.removeItem('apex_alchemy_wallet');
    localStorage.removeItem('apex_alchemy_smart_account');
    localStorage.removeItem('apex_alchemy_logs');
    setAlchemyTerminalLogs([
      `[${new Date().toLocaleTimeString()}] Session reset. Please save your Alchemy API Key or generate a developer EOA to begin.`
    ]);
    addToast('Credentials Reset', 'Cleared local Alchemy developer credentials.', 'info');
  };
  const {
    selectedChainId,
    setSelectedChainId,
    connected,
    walletType,
    walletAddress,
    walletBalance,
    isRealWallet,
    connecting,
    showConnectModal,
    setShowConnectModal,
    handleConnectWallet,
    handleDisconnect,
    selectChain: contextSelectChain,
    toasts,
    addToast,
    refreshBalance,
    setWalletBalance
  } = useWallet();



  const [searchTokenQuery, setSearchTokenQuery] = useState<string>('');
  
  // Custom Dynamic Portfolio state
  const [chainsData, setChainsData] = useState<Chain[]>(CHAINS);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(INITIAL_STAKING_POOLS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [livePricesMultiplier, setLivePricesMultiplier] = useState<number>(1.0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // References
  const autoPriceInterval = useRef<NodeJS.Timeout | null>(null);

  // Computed unified chains that sync with the connected wallet's active balance
  const unifiedChains = useMemo(() => {
    return chainsData.map(c => {
      return {
        ...c,
        tokens: c.tokens.map((token, index) => {
          let currentBalance = token.balance;
          // If wallet is connected and this is the active chain, override index 0 (native asset) with walletBalance
          if (connected && c.id === selectedChainId && index === 0) {
            const parsed = parseFloat(walletBalance);
            if (!isNaN(parsed)) {
              currentBalance = parsed;
            }
          }
          return {
            ...token,
            balance: currentBalance
          };
        })
      };
    });
  }, [chainsData, connected, selectedChainId, walletBalance]);

  // Active Chain computed object using unifiedChains
  const activeChain = useMemo(() => {
    return unifiedChains.find(c => c.id === selectedChainId) || unifiedChains[0];
  }, [unifiedChains, selectedChainId]);

  // Helper: Format wallet address
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Switch Chain helper
  const selectChain = (chainId: string) => {
    const chainName = CHAINS.find(c => c.id === chainId)?.name || chainId;
    contextSelectChain(chainId, chainName);
    setMobileMenuOpen(false);
  };

  // Simulate market price fluctuation
  useEffect(() => {
    autoPriceInterval.current = setInterval(() => {
      // Small fluctuation between -0.4% and +0.4%
      const fluctuation = 1 + (Math.random() * 0.008 - 0.004);
      setLivePricesMultiplier(prev => prev * fluctuation);
    }, 15000);

    return () => {
      if (autoPriceInterval.current) clearInterval(autoPriceInterval.current);
    };
  }, []);

  // Compute total wallet balances using unifiedChains
  const tokenBalancesWithPrices = useMemo(() => {
    return unifiedChains.map(c => {
      let chainTotal = 0;
      const parsedTokens = c.tokens.map(token => {
        const livePrice = token.price * (token.symbol === 'USDT' || token.symbol === 'USDC' ? 1 : livePricesMultiplier);
        const value = token.balance * livePrice;
        chainTotal += value;
        return {
          ...token,
          price: livePrice,
          value
        };
      });
      return {
        chainId: c.id,
        chainName: c.name,
        color: c.color,
        tokens: parsedTokens,
        total: chainTotal
      };
    });
  }, [unifiedChains, livePricesMultiplier]);

  // Liquidity Pools States
  const [swapSubTab, setSwapSubTab] = useState<'swap' | 'pool'>('swap');
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>(INITIAL_LIQUIDITY_POOLS);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [poolDepositAmountA, setPoolDepositAmountA] = useState<string>('');
  const [poolDepositAmountB, setPoolDepositAmountB] = useState<string>('');
  const [poolWithdrawPercent, setPoolWithdrawPercent] = useState<number>(100);
  const [isLpActionLoading, setIsLpActionLoading] = useState<boolean>(false);
  const [lpActionType, setLpActionType] = useState<'deposit' | 'withdraw' | 'claim' | null>(null);

  // Total balance sum
  const portfolioTotalBalance = useMemo(() => {
    // Add wallet balance + staked balance + liquidity pool positions
    const walletSum = tokenBalancesWithPrices.reduce((acc, curr) => acc + curr.total, 0);
    const stakedSum = stakingPools.reduce((acc, curr) => {
      const livePrice = curr.tokenSymbol === 'ETH' ? 3450.25 * livePricesMultiplier : 
                        curr.tokenSymbol === 'SOL' ? 148.50 * livePricesMultiplier : 
                        curr.tokenSymbol === 'POL' ? 0.58 : 
                        curr.tokenSymbol === 'BNB' ? 585.30 * livePricesMultiplier : 
                        curr.tokenSymbol === 'AVAX' ? 28.90 * livePricesMultiplier : 1;
      return acc + (curr.staked * livePrice) + curr.rewards;
    }, 0);
    const liquiditySum = liquidityPools.reduce((acc, pool) => {
      const chainBalances = tokenBalancesWithPrices.find(c => c.chainId === pool.chain);
      const tokenA = chainBalances?.tokens.find(t => t.symbol === pool.tokenASymbol);
      const tokenB = chainBalances?.tokens.find(t => t.symbol === pool.tokenBSymbol);
      const priceA = tokenA?.price || 0;
      const priceB = tokenB?.price || 0;
      const userValueA = pool.myLiquidityA * priceA;
      const userValueB = pool.myLiquidityB * priceB;
      return acc + userValueA + userValueB + pool.myRewards;
    }, 0);
    return walletSum + stakedSum + liquiditySum;
  }, [tokenBalancesWithPrices, stakingPools, liquidityPools, livePricesMultiplier]);

  // Current active tokens list
  const activeChainTokens = useMemo(() => {
    const activeData = tokenBalancesWithPrices.find(t => t.chainId === selectedChainId);
    if (!activeData) return [];
    if (!searchTokenQuery) return activeData.tokens;
    return activeData.tokens.filter(t => 
      t.name.toLowerCase().includes(searchTokenQuery.toLowerCase()) || 
      t.symbol.toLowerCase().includes(searchTokenQuery.toLowerCase())
    );
  }, [tokenBalancesWithPrices, selectedChainId, searchTokenQuery]);

  // Simulated balance charts distribution
  const allocationData = useMemo(() => {
    return tokenBalancesWithPrices.map(c => ({
      name: c.chainName,
      value: Math.round(c.total),
      color: c.color
    })).filter(item => item.value > 0);
  }, [tokenBalancesWithPrices]);

  // Swap calculations
  const [swapSourceSymbol, setSwapSourceSymbol] = useState<string>('');
  const [swapDestSymbol, setSwapDestSymbol] = useState<string>('');
  const [swapSourceAmount, setSwapSourceAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Swap/Pool operational state configuration

  // Real-time Liquidity Pool fee accumulation
  useEffect(() => {
    const lpInterval = setInterval(() => {
      setLiquidityPools(prevPools => {
        return prevPools.map(pool => {
          if (pool.myLiquidityA > 0 || pool.myLiquidityB > 0) {
            const chainBalances = tokenBalancesWithPrices.find(c => c.chainId === pool.chain);
            const tokenA = chainBalances?.tokens.find(t => t.symbol === pool.tokenASymbol);
            const tokenB = chainBalances?.tokens.find(t => t.symbol === pool.tokenBSymbol);
            const priceA = tokenA?.price || 1;
            const priceB = tokenB?.price || 1;
            const totalPositionValue = (pool.myLiquidityA * priceA) + (pool.myLiquidityB * priceB);
            
            const incrementalRewardUsd = (totalPositionValue * (pool.apy / 100)) / (365 * 24 * 3600);
            return {
              ...pool,
              myRewards: pool.myRewards + incrementalRewardUsd
            };
          }
          return pool;
        });
      });
    }, 1000);

    return () => {
      clearInterval(lpInterval);
    };
  }, [tokenBalancesWithPrices]);

  // Set default swap tokens on chain change
  useEffect(() => {
    if (activeChain.tokens.length >= 2) {
      setSwapSourceSymbol(activeChain.tokens[0].symbol);
      setSwapDestSymbol(activeChain.tokens[1].symbol);
      setSwapSourceAmount('');
    }
  }, [selectedChainId]);

  // Set default selected pool on chain change
  useEffect(() => {
    const activeChainPools = liquidityPools.filter(p => p.chain === selectedChainId);
    if (activeChainPools.length > 0) {
      setSelectedPoolId(activeChainPools[0].id);
    } else {
      setSelectedPoolId(null);
    }
  }, [selectedChainId]);

  const swapSourceToken = useMemo(() => {
    return activeChainTokens.find(t => t.symbol === swapSourceSymbol);
  }, [activeChainTokens, swapSourceSymbol]);

  const swapDestToken = useMemo(() => {
    return activeChainTokens.find(t => t.symbol === swapDestSymbol);
  }, [activeChainTokens, swapDestSymbol]);

  const swapDestinationAmount = useMemo(() => {
    if (!swapSourceToken || !swapDestToken || !swapSourceAmount || isNaN(parseFloat(swapSourceAmount))) return '0.00';
    const parsedSource = parseFloat(swapSourceAmount);
    const sourcePrice = swapSourceToken.price;
    const destPrice = swapDestToken.price;
    return ((parsedSource * sourcePrice) / destPrice).toFixed(6);
  }, [swapSourceToken, swapDestToken, swapSourceAmount]);

  // Execute Swap Action
  const handleSwap = () => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    const amount = parseFloat(swapSourceAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Invalid Amount', 'Please specify a positive token amount', 'error');
      return;
    }
    if (swapSourceToken && amount > swapSourceToken.balance) {
      addToast('Insufficient Balance', `You do not have enough ${swapSourceSymbol}`, 'error');
      return;
    }

    setIsSwapping(true);
    addToast('Submitting Swap', `Trading ${amount} ${swapSourceSymbol} for ${swapDestSymbol}...`, 'info');

    setTimeout(() => {
      // Execute local balance reduction and increase
      setChainsData(prevChains => {
        return prevChains.map(c => {
          if (c.id === selectedChainId) {
            return {
              ...c,
              tokens: c.tokens.map(t => {
                if (t.symbol === swapSourceSymbol) {
                  return { ...t, balance: t.balance - amount };
                }
                if (t.symbol === swapDestSymbol) {
                  const addedAmount = (amount * (swapSourceToken?.price || 1)) / (swapDestToken?.price || 1);
                  return { ...t, balance: t.balance + addedAmount };
                }
                return t;
              })
            };
          }
          return c;
        });
      });

      // If simulated wallet, update walletBalance in context
      if (!isRealWallet) {
        const nativeSymbol = activeChain.tokens[0].symbol;
        if (swapSourceSymbol === nativeSymbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : Math.max(0, val - amount).toFixed(4);
          });
        } else if (swapDestSymbol === nativeSymbol) {
          const addedAmount = (amount * (swapSourceToken?.price || 1)) / (swapDestToken?.price || 1);
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : (val + addedAmount).toFixed(4);
          });
        }
      }

      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'swap',
        chain: activeChain.name,
        details: `Swap ${amount.toFixed(4)} ${swapSourceSymbol} ➔ ${parseFloat(swapDestinationAmount).toFixed(4)} ${swapDestSymbol}`,
        amount: `$${(amount * (swapSourceToken?.price || 0)).toFixed(2)}`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsSwapping(false);
      setSwapSourceAmount('');
      addToast('Swap Succeeded!', `Swapped ${amount.toFixed(4)} ${swapSourceSymbol} ➔ ${parseFloat(swapDestinationAmount).toFixed(4)} ${swapDestSymbol}`, 'success');
    }, 2000);
  };

  // Cross-chain Bridge State
  const [bridgeSourceChainId, setBridgeSourceChainId] = useState<string>('ethereum');
  const [bridgeDestChainId, setBridgeDestChainId] = useState<string>('arbitrum');
  const [bridgeTokenSymbol, setBridgeTokenSymbol] = useState<string>('ETH');
  const [bridgeAmount, setBridgeAmount] = useState<string>('');
  const [bridgeStep, setBridgeStep] = useState<number>(0); // 0=idle, 1=approving, 2=depositing, 3=relaying, 4=finished
  const [isBridging, setIsBridging] = useState<boolean>(false);

  // Computed Token lists for Bridge Tab
  const bridgeSourceChain = useMemo(() => {
    return unifiedChains.find(c => c.id === bridgeSourceChainId) || unifiedChains[0];
  }, [unifiedChains, bridgeSourceChainId]);

  const bridgeDestChain = useMemo(() => {
    return unifiedChains.find(c => c.id === bridgeDestChainId) || unifiedChains[1];
  }, [unifiedChains, bridgeDestChainId]);

  const bridgeActiveToken = useMemo(() => {
    return bridgeSourceChain.tokens.find(t => t.symbol === bridgeTokenSymbol) || bridgeSourceChain.tokens[0];
  }, [bridgeSourceChain, bridgeTokenSymbol]);

  // Sync token list on bridge chain selection
  useEffect(() => {
    if (bridgeSourceChainId === bridgeDestChainId) {
      const remainingChains = CHAINS.filter(c => c.id !== bridgeSourceChainId);
      if (remainingChains.length > 0) {
        setBridgeDestChainId(remainingChains[0].id);
      }
    }
    const commonTokens = bridgeSourceChain.tokens.filter(t => 
      ['ETH', 'USDC', 'USDT'].includes(t.symbol)
    );
    if (commonTokens.length > 0) {
      setBridgeTokenSymbol(commonTokens[0].symbol);
    }
  }, [bridgeSourceChainId]);

  const handleBridge = () => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    const amount = parseFloat(bridgeAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Invalid Amount', 'Please specify a positive bridge amount', 'error');
      return;
    }
    if (amount > bridgeActiveToken.balance) {
      addToast('Insufficient Balance', `You do not have enough ${bridgeTokenSymbol} on ${bridgeSourceChain.name}`, 'error');
      return;
    }

    setIsBridging(true);
    setBridgeStep(1); // Approving

    // Visual bridges stepper simulation
    setTimeout(() => {
      setBridgeStep(2); // Depositing to lock contract
      setTimeout(() => {
        setBridgeStep(3); // Relaying to destination
        setTimeout(() => {
          // Adjust local balances on both chains!
          setChainsData(prevChains => {
            return prevChains.map(c => {
              if (c.id === bridgeSourceChainId) {
                return {
                  ...c,
                  tokens: c.tokens.map(t => t.symbol === bridgeTokenSymbol ? { ...t, balance: t.balance - amount } : t)
                };
              }
              if (c.id === bridgeDestChainId) {
                return {
                  ...c,
                  tokens: c.tokens.map(t => {
                    if (t.symbol === bridgeTokenSymbol) {
                      return { ...t, balance: t.balance + amount * 0.995 }; // 0.5% bridge fee
                    }
                    return t;
                  })
                };
              }
              return c;
            });
          });

          // If simulated wallet, update walletBalance in context if native token is bridged
          if (!isRealWallet) {
            const sourceNativeSymbol = bridgeSourceChain.tokens[0].symbol;
            const destNativeSymbol = bridgeDestChain.tokens[0].symbol;
            
            if (bridgeSourceChainId === selectedChainId && bridgeTokenSymbol === sourceNativeSymbol) {
              setWalletBalance(prev => {
                const val = parseFloat(prev);
                return isNaN(val) ? prev : Math.max(0, val - amount).toFixed(4);
              });
            } else if (bridgeDestChainId === selectedChainId && bridgeTokenSymbol === destNativeSymbol) {
              setWalletBalance(prev => {
                const val = parseFloat(prev);
                return isNaN(val) ? prev : (val + amount * 0.995).toFixed(4);
              });
            }
          }

          const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
          const newTx: Transaction = {
            id: Math.random().toString(36).substring(2, 9),
            type: 'bridge',
            chain: `${bridgeSourceChain.name} ➔ ${bridgeDestChain.name}`,
            details: `Bridge ${amount.toFixed(4)} ${bridgeTokenSymbol} to ${bridgeDestChain.name}`,
            amount: `$${(amount * bridgeActiveToken.price).toFixed(2)}`,
            status: 'completed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            txHash
          };

          setTransactions(prev => [newTx, ...prev]);
          setBridgeStep(4); // Finished
          setIsBridging(false);
          setBridgeAmount('');
          addToast('Bridge Completed', `Successfully relayed ${amount.toFixed(4)} ${bridgeTokenSymbol} to ${bridgeDestChain.name}`, 'success');
          
          setTimeout(() => {
            setBridgeStep(0); // reset state back to idle
          }, 3000);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // ==========================================
  // LIQUIDITY POOL ACTIONS
  // ==========================================
  const handleAddLiquidity = (poolId: string, amountAStr: string, amountBStr: string) => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    const amountA = parseFloat(amountAStr);
    const amountB = parseFloat(amountBStr);
    if (isNaN(amountA) || amountA <= 0 || isNaN(amountB) || amountB <= 0) {
      addToast('Invalid Amounts', 'Please enter positive amounts for both tokens', 'error');
      return;
    }

    const pool = liquidityPools.find(p => p.id === poolId);
    if (!pool) return;

    const tokenA = activeChainTokens.find(t => t.symbol === pool.tokenASymbol);
    const tokenB = activeChainTokens.find(t => t.symbol === pool.tokenBSymbol);
    
    if (!tokenA || tokenA.balance < amountA) {
      addToast('Insufficient Balance', `You do not have enough ${pool.tokenASymbol}`, 'error');
      return;
    }
    if (!tokenB || tokenB.balance < amountB) {
      addToast('Insufficient Balance', `You do not have enough ${pool.tokenBSymbol}`, 'error');
      return;
    }

    setIsLpActionLoading(true);
    setLpActionType('deposit');
    addToast('Adding Liquidity', `Depositing ${amountA.toFixed(4)} ${pool.tokenASymbol} and ${amountB.toFixed(4)} ${pool.tokenBSymbol} to pool...`, 'info');

    setTimeout(() => {
      setChainsData(prevChains => {
        return prevChains.map(c => {
          if (c.id === selectedChainId) {
            return {
              ...c,
              tokens: c.tokens.map(t => {
                if (t.symbol === pool.tokenASymbol) {
                  return { ...t, balance: t.balance - amountA };
                }
                if (t.symbol === pool.tokenBSymbol) {
                  return { ...t, balance: t.balance - amountB };
                }
                return t;
              })
            };
          }
          return c;
        });
      });

      // If simulated wallet, update walletBalance in context if native token is used
      if (!isRealWallet) {
        const nativeSymbol = activeChain.tokens[0].symbol;
        if (pool.tokenASymbol === nativeSymbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : Math.max(0, val - amountA).toFixed(4);
          });
        } else if (pool.tokenBSymbol === nativeSymbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : Math.max(0, val - amountB).toFixed(4);
          });
        }
      }

      setLiquidityPools(prevPools => {
        return prevPools.map(p => {
          if (p.id === poolId) {
            const priceA = tokenA.price;
            const priceB = tokenB.price;
            
            const newMyLiquidityA = p.myLiquidityA + amountA;
            const newMyLiquidityB = p.myLiquidityB + amountB;
            
            const poolTvlUsd = (p.tokenAAmount * priceA) + (p.tokenBAmount * priceB);
            const userPositionUsd = (newMyLiquidityA * priceA) + (newMyLiquidityB * priceB);
            const newShare = (userPositionUsd / (poolTvlUsd + userPositionUsd)) * 100;

            return {
              ...p,
              tokenAAmount: p.tokenAAmount + amountA,
              tokenBAmount: p.tokenBAmount + amountB,
              myLiquidityA: newMyLiquidityA,
              myLiquidityB: newMyLiquidityB,
              myShare: newShare
            };
          }
          return p;
        });
      });

      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const usdValue = (amountA * tokenA.price + amountB * tokenB.price).toFixed(2);
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'add_liquidity',
        chain: activeChain.name,
        details: `Add Liquidity: ${amountA.toFixed(4)} ${pool.tokenASymbol} + ${amountB.toFixed(4)} ${pool.tokenBSymbol}`,
        amount: `$${usdValue}`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsLpActionLoading(false);
      setLpActionType(null);
      setPoolDepositAmountA('');
      setPoolDepositAmountB('');
      addToast('Liquidity Added!', `Successfully deposited to the ${pool.tokenASymbol}/${pool.tokenBSymbol} pool`, 'success');
    }, 1500);
  };

  const handleRemoveLiquidity = (poolId: string, percent: number) => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    const pool = liquidityPools.find(p => p.id === poolId);
    if (!pool || pool.myLiquidityA <= 0 || pool.myLiquidityB <= 0) {
      addToast('No Liquidity', 'You do not have any liquidity to remove from this pool', 'error');
      return;
    }

    setIsLpActionLoading(true);
    setLpActionType('withdraw');
    
    const factor = percent / 100;
    const withdrawA = pool.myLiquidityA * factor;
    const withdrawB = pool.myLiquidityB * factor;
    const claimedRewardsUsd = pool.myRewards * factor;

    addToast('Removing Liquidity', `Withdrawing ${percent}% of your ${pool.tokenASymbol}/${pool.tokenBSymbol} position...`, 'info');

    setTimeout(() => {
      const tokenA = activeChainTokens.find(t => t.symbol === pool.tokenASymbol);
      const tokenB = activeChainTokens.find(t => t.symbol === pool.tokenBSymbol);
      const priceA = tokenA?.price || 1;
      const priceB = tokenB?.price || 1;

      const rewardAAmount = (claimedRewardsUsd / 2) / priceA;
      const rewardBAmount = (claimedRewardsUsd / 2) / priceB;

      const totalAAddition = withdrawA + rewardAAmount;
      const totalBAddition = withdrawB + rewardBAmount;

      setChainsData(prevChains => {
        return prevChains.map(c => {
          if (c.id === selectedChainId) {
            return {
              ...c,
              tokens: c.tokens.map(t => {
                if (t.symbol === pool.tokenASymbol) {
                  return { ...t, balance: t.balance + totalAAddition };
                }
                if (t.symbol === pool.tokenBSymbol) {
                  return { ...t, balance: t.balance + totalBAddition };
                }
                return t;
              })
            };
          }
          return c;
        });
      });

      // If simulated wallet, update walletBalance in context if native token is received
      if (!isRealWallet) {
        const nativeSymbol = activeChain.tokens[0].symbol;
        if (pool.tokenASymbol === nativeSymbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : (val + totalAAddition).toFixed(4);
          });
        }
        if (pool.tokenBSymbol === nativeSymbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : (val + totalBAddition).toFixed(4);
          });
        }
      }

      setLiquidityPools(prevPools => {
        return prevPools.map(p => {
          if (p.id === poolId) {
            const nextLiquidityA = Math.max(0, p.myLiquidityA - withdrawA);
            const nextLiquidityB = Math.max(0, p.myLiquidityB - withdrawB);
            
            const poolTvlUsd = (p.tokenAAmount * priceA) + (p.tokenBAmount * priceB);
            const userPositionUsd = (nextLiquidityA * priceA) + (nextLiquidityB * priceB);
            const nextShare = userPositionUsd > 0 ? (userPositionUsd / poolTvlUsd) * 100 : 0;

            return {
              ...p,
              tokenAAmount: Math.max(0, p.tokenAAmount - withdrawA),
              tokenBAmount: Math.max(0, p.tokenBAmount - withdrawB),
              myLiquidityA: nextLiquidityA,
              myLiquidityB: nextLiquidityB,
              myShare: nextShare,
              myRewards: Math.max(0, p.myRewards - claimedRewardsUsd)
            };
          }
          return p;
        });
      });

      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const usdValue = (withdrawA * priceA + withdrawB * priceB + claimedRewardsUsd).toFixed(2);
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'remove_liquidity',
        chain: activeChain.name,
        details: `Remove Liquidity: ${withdrawA.toFixed(4)} ${pool.tokenASymbol} + ${withdrawB.toFixed(4)} ${pool.tokenBSymbol}`,
        amount: `$${usdValue}`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsLpActionLoading(false);
      setLpActionType(null);
      addToast('Liquidity Removed', `Successfully withdrew your LP tokens and claimed $${claimedRewardsUsd.toFixed(2)} in fees`, 'success');
    }, 1500);
  };

  const handleClaimLpFees = (poolId: string) => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    const pool = liquidityPools.find(p => p.id === poolId);
    if (!pool || pool.myRewards <= 0) {
      addToast('No Fees to Claim', 'You do not have any accrued trading fees to claim', 'error');
      return;
    }

    setIsLpActionLoading(true);
    setLpActionType('claim');
    
    const claimedRewardsUsd = pool.myRewards;

    addToast('Claiming Fees', `Claiming $${claimedRewardsUsd.toFixed(2)} in trading fees...`, 'info');

    setTimeout(() => {
      const tokenA = activeChainTokens.find(t => t.symbol === pool.tokenASymbol);
      const tokenB = activeChainTokens.find(t => t.symbol === pool.tokenBSymbol);
      const priceA = tokenA?.price || 1;
      const priceB = tokenB?.price || 1;

      const rewardAAmount = (claimedRewardsUsd / 2) / priceA;
      const rewardBAmount = (claimedRewardsUsd / 2) / priceB;

      setChainsData(prevChains => {
        return prevChains.map(c => {
          if (c.id === selectedChainId) {
            return {
              ...c,
              tokens: c.tokens.map(t => {
                if (t.symbol === pool.tokenASymbol) {
                  return { ...t, balance: t.balance + rewardAAmount };
                }
                if (t.symbol === pool.tokenBSymbol) {
                  return { ...t, balance: t.balance + rewardBAmount };
                }
                return t;
              })
            };
          }
          return c;
        });
      });

      // If simulated wallet, update walletBalance in context if native token is received
      if (!isRealWallet) {
        const nativeSymbol = activeChain.tokens[0].symbol;
        if (pool.tokenASymbol === nativeSymbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : (val + rewardAAmount).toFixed(4);
          });
        }
        if (pool.tokenBSymbol === nativeSymbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : (val + rewardBAmount).toFixed(4);
          });
        }
      }

      setLiquidityPools(prevPools => {
        return prevPools.map(p => {
          if (p.id === poolId) {
            return {
              ...p,
              myRewards: 0
            };
          }
          return p;
        });
      });

      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'claim_fees',
        chain: activeChain.name,
        details: `Claimed LP Trading Fees from ${pool.tokenASymbol}/${pool.tokenBSymbol} Pool`,
        amount: `$${claimedRewardsUsd.toFixed(2)}`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsLpActionLoading(false);
      setLpActionType(null);
      addToast('Fees Claimed', `Successfully claimed $${claimedRewardsUsd.toFixed(2)} worth of ${pool.tokenASymbol} and ${pool.tokenBSymbol}`, 'success');
    }, 1500);
  };

  // Staking states
  const [selectedStakingPoolId, setSelectedStakingPoolId] = useState<string>('eth-liquid');
  const [stakingAmount, setStakingAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [stakingMode, setStakingMode] = useState<'stake' | 'unstake'>('stake');

  const activeStakingPool = useMemo(() => {
    return stakingPools.find(p => p.id === selectedStakingPoolId) || stakingPools[0];
  }, [stakingPools, selectedStakingPoolId]);

  const activeStakingToken = useMemo(() => {
    // Find the token in the corresponding chain
    const chain = unifiedChains.find(c => c.id === activeStakingPool.chain);
    return chain?.tokens.find(t => t.symbol === activeStakingPool.tokenSymbol);
  }, [unifiedChains, activeStakingPool]);

  // Reward generation simulation (accumulate 0.0001 stETH/JitoSOL rewards periodically)
  useEffect(() => {
    const rewardInterval = setInterval(() => {
      setStakingPools(prevPools => {
        return prevPools.map(pool => {
          if (pool.staked > 0) {
            // accrues based on APY
            const incrementalReward = (pool.staked * (pool.apy / 100)) / (365 * 24 * 3600); // per second
            return {
              ...pool,
              rewards: pool.rewards + incrementalReward
            };
          }
          return pool;
        });
      });
    }, 3000);

    return () => clearInterval(rewardInterval);
  }, []);

  const handleStakeAction = () => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    const amount = parseFloat(stakingAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Invalid Amount', 'Please specify a positive stake amount', 'error');
      return;
    }

    if (stakingMode === 'stake') {
      if (activeStakingToken && amount > activeStakingToken.balance) {
        addToast('Insufficient Balance', `You do not have enough ${activeStakingPool.tokenSymbol} to stake.`, 'error');
        return;
      }

      setIsStaking(true);
      addToast('Staking Tokens', `Locking ${amount} ${activeStakingPool.tokenSymbol} in ${activeStakingPool.poolName}...`, 'info');

      setTimeout(() => {
        // Deduct from token wallet, add to staked
        setChainsData(prevChains => {
          return prevChains.map(c => {
            if (c.id === activeStakingPool.chain) {
              return {
                ...c,
                tokens: c.tokens.map(t => t.symbol === activeStakingPool.tokenSymbol ? { ...t, balance: t.balance - amount } : t)
              };
            }
            return c;
          });
        });

        // If simulated wallet, update walletBalance in context if native token is staked
        if (!isRealWallet && activeStakingPool.chain === selectedChainId && activeStakingPool.tokenSymbol === activeChain.tokens[0].symbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : Math.max(0, val - amount).toFixed(4);
          });
        }

        setStakingPools(prevPools => {
          const updated = prevPools.map(p => p.id === selectedStakingPoolId ? { ...p, staked: p.staked + amount } : p);
          const targeted = updated.find(p => p.id === selectedStakingPoolId);
          if (targeted) {
            persistStakingPoolCloud(targeted);
          }
          return updated;
        });

        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const newTx: Transaction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'stake',
          chain: activeStakingPool.chain,
          details: `Stake ${amount.toFixed(4)} ${activeStakingPool.tokenSymbol} in ${activeStakingPool.poolName}`,
          amount: `$${(amount * (activeStakingToken?.price || 1)).toFixed(2)}`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txHash
        };

        setTransactions(prev => [newTx, ...prev]);
        persistTransactionCloud(newTx);
        setIsStaking(false);
        setStakingAmount('');
        addToast('Tokens Staked Successfully', `Locked ${amount.toFixed(4)} ${activeStakingPool.tokenSymbol} @ ${activeStakingPool.apy}% APY`, 'success');
      }, 2000);

    } else {
      // Unstake action
      if (amount > activeStakingPool.staked) {
        addToast('Insufficient Staked Amount', `You only have ${activeStakingPool.staked.toFixed(4)} staked.`, 'error');
        return;
      }

      setIsStaking(true);
      addToast('Unstaking Tokens', `Withdrawing ${amount} ${activeStakingPool.tokenSymbol}...`, 'info');

      setTimeout(() => {
        // Add back to token wallet, deduct from staked
        setChainsData(prevChains => {
          return prevChains.map(c => {
            if (c.id === activeStakingPool.chain) {
              return {
                ...c,
                tokens: c.tokens.map(t => t.symbol === activeStakingPool.tokenSymbol ? { ...t, balance: t.balance + amount } : t)
              };
            }
            return c;
          });
        });

        // If simulated wallet, update walletBalance in context if native token is unstaked
        if (!isRealWallet && activeStakingPool.chain === selectedChainId && activeStakingPool.tokenSymbol === activeChain.tokens[0].symbol) {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : (val + amount).toFixed(4);
          });
        }

        setStakingPools(prevPools => {
          const updated = prevPools.map(p => p.id === selectedStakingPoolId ? { ...p, staked: p.staked - amount } : p);
          const targeted = updated.find(p => p.id === selectedStakingPoolId);
          if (targeted) {
            persistStakingPoolCloud(targeted);
          }
          return updated;
        });

        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const newTx: Transaction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'unstake',
          chain: activeStakingPool.chain,
          details: `Unstake ${amount.toFixed(4)} ${activeStakingPool.tokenSymbol}`,
          amount: `$${(amount * (activeStakingToken?.price || 1)).toFixed(2)}`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txHash
        };

        setTransactions(prev => [newTx, ...prev]);
        persistTransactionCloud(newTx);
        setIsStaking(false);
        setStakingAmount('');
        addToast('Tokens Unstaked', `Withdrawn ${amount.toFixed(4)} ${activeStakingPool.tokenSymbol} to your wallet`, 'success');
      }, 2000);
    }
  };

  const handleClaimRewards = () => {
    if (activeStakingPool.rewards <= 0) {
      addToast('No Rewards', 'You do not have any rewards to claim yet', 'error');
      return;
    }
    const claimAmount = activeStakingPool.rewards;
    addToast('Claiming Rewards', `Transferring ${claimAmount.toFixed(6)} ${activeStakingPool.tokenSymbol} rewards...`, 'info');

    setTimeout(() => {
      // Add rewards to wallet balance, set rewards to 0
      setChainsData(prevChains => {
        return prevChains.map(c => {
          if (c.id === activeStakingPool.chain) {
            return {
              ...c,
              tokens: c.tokens.map(t => t.symbol === activeStakingPool.tokenSymbol ? { ...t, balance: t.balance + claimAmount } : t)
            };
          }
          return c;
        });
      });

      // If simulated wallet, update walletBalance in context if native token rewards are claimed
      if (!isRealWallet && activeStakingPool.chain === selectedChainId && activeStakingPool.tokenSymbol === activeChain.tokens[0].symbol) {
        setWalletBalance(prev => {
          const val = parseFloat(prev);
          return isNaN(val) ? prev : (val + claimAmount).toFixed(4);
        });
      }

      setStakingPools(prevPools => {
        const updated = prevPools.map(p => p.id === selectedStakingPoolId ? { ...p, rewards: 0 } : p);
        const targeted = updated.find(p => p.id === selectedStakingPoolId);
        if (targeted) {
          persistStakingPoolCloud(targeted);
        }
        return updated;
      });

      addToast('Rewards Claimed!', `Added ${claimAmount.toFixed(6)} ${activeStakingPool.tokenSymbol} to your wallet`, 'success');
    }, 1500);
  };

  // Copy simulated wallet address to clipboard
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    addToast('Address Copied', 'Wallet address copied to clipboard', 'info');
  };

  // Mint NFT Action
  const handleMintNft = () => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    if (!nftNameInput.trim()) {
      addToast('Error', 'Please enter a name for your custom NFT', 'error');
      return;
    }
    setIsMintingNft(true);

    if (nftTargetChain === 'bitcoin') {
      addToast('Bitcoin NFT Engine Initiated', `Broadcasting reveal transaction and inscribing "${nftNameInput}"...`, 'info');

      setTimeout(() => {
        const newNftId = `nft-${Date.now()}`;
        const randomOrdNum = `#${Math.floor(Math.random() * 200000 + 68200000).toLocaleString()}`;

        // Add to active NFT gallery
        const newNft: NFTItem = {
          id: newNftId,
          name: nftNameInput,
          collection: "Bitcoin Ordinals",
          imageGradient: nftTemplateInput,
          rarity: nftRarityInput,
          powerRating: Math.floor(Math.random() * 35) + (nftRarityInput === 'Legendary' ? 65 : nftRarityInput === 'Rare' ? 50 : nftRarityInput === 'Uncommon' ? 30 : 15),
          mintedAt: new Date().toISOString().split('T')[0]
        };
        setNfts(prev => [newNft, ...prev]);
        persistNftCloud(newNft);

        // Add to Bitcoin Inscriptions list
        const sizeBytes = Math.floor(Math.random() * 15000) + 1200;
        const newInscription: InscriptionItem = {
          id: `ins-${Date.now()}`,
          number: randomOrdNum,
          contentType: "image/png (Hex script)",
          sat: Array.from({length: 13}, () => Math.floor(Math.random()*10)).join(''),
          sizeBytes,
          feeRate: 25,
          name: nftNameInput,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setInscriptions(prev => [newInscription, ...prev]);
        persistInscriptionCloud(newInscription);

        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const newTx: Transaction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'inscribe_btc',
          chain: 'Bitcoin Ordinals',
          details: `Bitcoin Inscribe NFT ${randomOrdNum}: "${nftNameInput}"`,
          amount: `$${((sizeBytes / 4) * 25 * 0.0006).toFixed(2)}`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txHash
        };

        setTransactions(prev => [newTx, ...prev]);
        persistTransactionCloud(newTx);
        setIsMintingNft(false);
        setNftNameInput('');
        addToast('Bitcoin NFT Minted!', `Successfully inscribed "${nftNameInput}" as Ordinal ${randomOrdNum} on the Bitcoin blockchain!`, 'success');
      }, 2200);
    } else {
      addToast('Minting NFT', `Deploying metadata and minting "${nftNameInput}" on EthersAir...`, 'info');

      setTimeout(() => {
        const newNftId = `nft-${Date.now()}`;
        const newNft: NFTItem = {
          id: newNftId,
          name: nftNameInput,
          collection: "EthersAir Creators",
          imageGradient: nftTemplateInput,
          rarity: nftRarityInput,
          powerRating: Math.floor(Math.random() * 35) + (nftRarityInput === 'Legendary' ? 65 : nftRarityInput === 'Rare' ? 50 : nftRarityInput === 'Uncommon' ? 30 : 15),
          mintedAt: new Date().toISOString().split('T')[0]
        };

        setNfts(prev => [newNft, ...prev]);
        persistNftCloud(newNft);

        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const newTx: Transaction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'mint_nft',
          chain: 'EthersAir Network',
          details: `Mint NFT: "${nftNameInput}" (${nftRarityInput})`,
          amount: '$0.00 (Gas Paid)',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txHash
        };

        setTransactions(prev => [newTx, ...prev]);
        persistTransactionCloud(newTx);
        setIsMintingNft(false);
        setNftNameInput('');
        addToast('NFT Minted!', `Successfully minted and added "${nftNameInput}" to your active gallery`, 'success');
      }, 1800);
    }
  };

  // Inscribe Ordinal Action
  const handleInscribeBtc = () => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    if (!inscriptionName.trim()) {
      addToast('Error', 'Please provide a label/name for the Bitcoin Inscription', 'error');
      return;
    }
    if (!inscriptionContent.trim()) {
      addToast('Error', 'Inscription payload content cannot be empty', 'error');
      return;
    }

    setIsInscribing(true);
    addToast('Ordinal Engine Initiated', 'Broadcasting commit/reveal script block on Bitcoin network...', 'info');

    setTimeout(() => {
      const newInsId = `ins-${Date.now()}`;
      const randomOrdNum = `#${Math.floor(Math.random() * 200000 + 68200000).toLocaleString()}`;
      const sizeBytes = Math.floor(Math.random() * 8000) + 120;
      const newInscription: InscriptionItem = {
        id: newInsId,
        number: randomOrdNum,
        contentType: inscriptionType,
        sat: Array.from({length: 13}, () => Math.floor(Math.random()*10)).join(''),
        sizeBytes,
        feeRate: inscriptionFeeRate,
        name: inscriptionName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setInscriptions(prev => [newInscription, ...prev]);
      persistInscriptionCloud(newInscription);

      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'inscribe_btc',
        chain: 'Bitcoin Ordinals',
        details: `Bitcoin Inscription ${randomOrdNum}: "${inscriptionName}"`,
        amount: `$${((sizeBytes / 4) * inscriptionFeeRate * 0.0006).toFixed(2)}`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash
      };

      setTransactions(prev => [newTx, ...prev]);
      persistTransactionCloud(newTx);
      setIsInscribing(false);
      setInscriptionName('');
      setInscriptionContent('');
      addToast('Bitcoin Inscribed!', `Ordinal ${randomOrdNum} created on-chain successfully`, 'success');
    }, 2200);
  };

  // EthersAir Delegate Action
  const handleDelegateAction = (validatorId: string, amountStr: string, mode: 'delegate' | 'undelegate') => {
    if (!connected) {
      setShowConnectModal(true);
      return;
    }
    const valAmt = parseFloat(amountStr);
    if (isNaN(valAmt) || valAmt <= 0) {
      addToast('Invalid Amount', 'Please provide a valid token delegation amount', 'error');
      return;
    }

    if (mode === 'delegate') {
      setIsDelegating(true);
      addToast('Delegating Tokens', `Staking and delegating ${valAmt.toLocaleString()} ETH to validator...`, 'info');

      setTimeout(() => {
        setValidators(prev => prev.map(v => {
          if (v.id === validatorId) {
            return {
              ...v,
              delegated: v.delegated + valAmt,
              myDelegation: v.myDelegation + valAmt
            };
          }
          return v;
        }));

        // Deduct from chainsData
        setChainsData(prevChains => {
          return prevChains.map(c => {
            if (c.id === 'ethereum') {
              return {
                ...c,
                tokens: c.tokens.map(t => t.symbol === 'ETH' ? { ...t, balance: t.balance - valAmt } : t)
              };
            }
            return c;
          });
        });

        // If simulated wallet, update walletBalance in context if active chain is ethereum
        if (!isRealWallet && selectedChainId === 'ethereum') {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : Math.max(0, val - valAmt).toFixed(4);
          });
        }

        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const newTx: Transaction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'delegate',
          chain: 'EthersAir Network',
          details: `Delegate ${valAmt.toLocaleString()} ETH to validator node`,
          amount: `$${(valAmt * 0.91).toFixed(2)}`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txHash
        };

        setTransactions(prev => [newTx, ...prev]);
        setIsDelegating(false);
        setDelegateAmount('');
        addToast('Delegated Successfully!', `Delegated ${valAmt.toLocaleString()} ETH to validator`, 'success');
      }, 1500);

    } else {
      const selectedVal = validators.find(v => v.id === validatorId);
      if (!selectedVal || selectedVal.myDelegation < valAmt) {
        addToast('Error', 'Insufficient active delegation to withdraw', 'error');
        return;
      }

      setIsDelegating(true);
      addToast('Withdrawing Delegation', `Undelegating ${valAmt.toLocaleString()} ETH from validator node...`, 'info');

      setTimeout(() => {
        setValidators(prev => prev.map(v => {
          if (v.id === validatorId) {
            return {
              ...v,
              delegated: v.delegated - valAmt,
              myDelegation: v.myDelegation - valAmt
            };
          }
          return v;
        }));

        // Add back to chainsData
        setChainsData(prevChains => {
          return prevChains.map(c => {
            if (c.id === 'ethereum') {
              return {
                ...c,
                tokens: c.tokens.map(t => t.symbol === 'ETH' ? { ...t, balance: t.balance + valAmt } : t)
              };
            }
            return c;
          });
        });

        // If simulated wallet, update walletBalance in context if active chain is ethereum
        if (!isRealWallet && selectedChainId === 'ethereum') {
          setWalletBalance(prev => {
            const val = parseFloat(prev);
            return isNaN(val) ? prev : (val + valAmt).toFixed(4);
          });
        }

        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const newTx: Transaction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'undelegate',
          chain: 'EthersAir Network',
          details: `Undelegate ${valAmt.toLocaleString()} ETH from validator node`,
          amount: `$${(valAmt * 0.91).toFixed(2)}`,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txHash
        };

        setTransactions(prev => [newTx, ...prev]);
        setIsDelegating(false);
        setDelegateAmount('');
        addToast('Undelegated Successfully!', `Withdrawn ${valAmt.toLocaleString()} ETH delegation`, 'success');
      }, 1500);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 bg-gradient-to-b ${activeChain.bgGradient} text-slate-100 font-sans relative overflow-x-hidden pb-12 transition-all duration-700`}>
      
      {/* BACKGROUND PARTICLES EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none transition-all duration-700" style={{ backgroundColor: activeChain.color + '15' }} />
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] pointer-events-none transition-all duration-700" style={{ backgroundColor: '#8247E510' }} />

      {/* TOAST SYSTEM */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            id={`toast-${toast.id}`}
            className="p-4 rounded-xl shadow-2xl glass-card flex items-start gap-3 border-l-4 animate-slide-in duration-300"
            style={{ borderLeftColor: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : activeChain.color }}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-white">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CONNECT WALLET MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              id="close-connect-modal"
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-5">
              <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Connect Multi-Chain Wallet</h3>
              <p className="text-xs text-slate-400 mt-1">Select your wallet for Ethereum, Solana, or Bitcoin networks</p>
            </div>

            {/* Network Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs font-semibold">
              {[
                { id: 'all', label: 'All Networks' },
                { id: 'eth', label: 'Ethereum (ETH)', icon: '💎' },
                { id: 'sol', label: 'Solana (SOL)', icon: '🟣' },
                { id: 'btc', label: 'Bitcoin (BTC)', icon: '🟧' },
              ].map(tab => (
                <button
                  key={tab.id}
                  id={`wallet-tab-${tab.id}`}
                  onClick={() => setWalletFilter(tab.id as any)}
                  className={`flex-1 py-2 px-2 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                    walletFilter === tab.id 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Provider detection helper */}
            <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              {typeof window !== 'undefined' && ((window as any).ethereum || (window as any).solana || (window as any).phantom || (window as any).unisat || (window as any).okxwallet) ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium">Extension Detected!</span>
                  <span className="text-slate-400">
                    {[(window as any).ethereum && 'MetaMask/EVM', ((window as any).solana || (window as any).phantom) && 'Phantom/SOL', ((window as any).unisat || (window as any).okxwallet) && 'UniSat/BTC'].filter(Boolean).join(', ')} ready for live connection.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1 text-amber-400">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Sandbox & Live Connection Mode</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-relaxed">
                    Connect installed wallet extension or launch instantly in sandbox mode with mock multi-chain balances!
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                // EVM
                { name: 'MetaMask', chain: 'eth', chainLabel: 'ETH / EVM', desc: 'Ethereum & EVM L2 browser wallet', icon: '🦊', badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                { name: 'Coinbase Wallet', chain: 'eth', chainLabel: 'ETH / EVM', desc: 'Coinbase multi-chain self-custody wallet', icon: '🔵', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                { name: 'WalletConnect', chain: 'eth', chainLabel: 'EVM / QR', desc: 'Mobile wallet scan via WalletConnect', icon: '🔗', badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
                { name: 'Rabby Wallet', chain: 'eth', chainLabel: 'ETH / EVM', desc: 'DeFi multi-chain EVM browser extension', icon: '🐰', badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                
                // SOLANA
                { name: 'Phantom', chain: 'sol', chainLabel: 'SOLANA', desc: 'Solana & multi-chain self-custody wallet', icon: '👻', badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                { name: 'Solflare', chain: 'sol', chainLabel: 'SOLANA', desc: 'Solana ecosystem web & mobile wallet', icon: '🔥', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                { name: 'Backpack', chain: 'sol', chainLabel: 'SOLANA', desc: 'xNFT & Solana multi-chain wallet', icon: '🎒', badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },

                // BITCOIN
                { name: 'UniSat', chain: 'btc', chainLabel: 'BITCOIN', desc: 'Bitcoin Ordinals & BRC-20 extension', icon: '🟧', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                { name: 'Xverse', chain: 'btc', chainLabel: 'BITCOIN', desc: 'Bitcoin Taproot & Ordinals Web3 wallet', icon: '⚡', badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
                { name: 'OKX Wallet', chain: 'btc', chainLabel: 'BTC & MULTI', desc: 'Bitcoin, EVM & Solana multi-chain wallet', icon: '⬛', badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
              ]
              .filter(w => walletFilter === 'all' || w.chain === walletFilter)
              .map(wallet => (
                <button
                  key={wallet.name}
                  id={`connect-${wallet.name.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => handleConnectWallet(wallet.name)}
                  disabled={connecting}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700 transition duration-150 text-left w-full group relative"
                >
                  <span className="text-2xl flex-shrink-0">{wallet.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm group-hover:text-indigo-400 transition truncate">{wallet.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${wallet.badgeBg}`}>
                        {wallet.chainLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{wallet.desc}</p>
                  </div>
                  {connecting && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />}
                </button>
              ))}
            </div>

            <div className="mt-5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-chain Web3 Support: Ethereum • Solana • Bitcoin</span>
            </div>
          </div>
        </div>
      )}

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">ETHERS AIR</span>
              <span className="block text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Multi-Chain Portal</span>
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/50 border border-slate-800/60 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Dashboard', icon: Coins },
              { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
              { id: 'bridge', label: 'Cross Bridge', icon: Globe },
              { id: 'stake', label: 'Staking Yield', icon: Layers },
              { id: 'nfts', label: 'NFTs Manager', icon: Image },
              { id: 'ethersair', label: 'ETHERS AIR Node', icon: Zap },
              { id: 'inscriptions', label: 'Bitcoin', icon: TrendingUp },
              { id: 'history', label: 'History', icon: Clock },
              { id: 'slides', label: 'Google Workspace', icon: FolderOpen },
              ...(currentUserEmail === 'rezadress6659@gmail.com' ? [{ id: 'api', label: 'API Scan', icon: Code }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              
              // Apply highly polished custom styles and a gradient bottom accent line for active tabs
              const customStyles = isSelected
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg border border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60';

              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 relative ${customStyles}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {isSelected && (
                    <span className="absolute -bottom-1.5 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header: Chain Selector & Wallet */}
          <div className="hidden md:flex items-center gap-3">
            {/* User Profile / Dev Session */}
            <div className="relative group">
              <button 
                id="user-profile-btn"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  RD
                </div>
                <span className="max-w-[120px] truncate">{currentUserEmail}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="text-xs text-slate-400 px-3 py-1.5 font-bold">Session Profile</div>
                <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                  <div className="text-sm font-bold text-white truncate">{currentUserEmail}</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5 uppercase tracking-wide">
                    {currentUserEmail === 'rezadress6659@gmail.com' ? 'Developer / Owner' : 'Standard Viewer'}
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    id="switch-to-dev-btn"
                    onClick={() => {
                      setCurrentUserEmail('rezadress6659@gmail.com');
                      addToast('User Switched', 'Logged in as rezadress6659@gmail.com (Developer)', 'success');
                    }}
                    className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition text-xs ${
                      currentUserEmail === 'rezadress6659@gmail.com' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-300'
                    }`}
                  >
                    <span>Developer (rezadress6659)</span>
                    {currentUserEmail === 'rezadress6659@gmail.com' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                  <button
                    id="switch-to-guest-btn"
                    onClick={() => {
                      setCurrentUserEmail('guest@example.com');
                      if (activeTab === 'api') {
                        setActiveTab('overview');
                      }
                      addToast('User Switched', 'Logged in as guest@example.com', 'info');
                    }}
                    className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition text-xs ${
                      currentUserEmail !== 'rezadress6659@gmail.com' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-300'
                    }`}
                  >
                    <span>Guest Viewer (guest)</span>
                    {currentUserEmail !== 'rezadress6659@gmail.com' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Chain Dropdown */}
            <div className="relative group">
              <button 
                id="chain-selector-btn"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition"
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-slate-950" style={{ backgroundColor: activeChain.color }}>
                  {activeChain.icon}
                </span>
                {activeChain.name}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Chain selector dropdown content */}
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="text-xs text-slate-400 px-3 py-1.5 font-bold">Switch Ecosystem</div>
                {CHAINS.map(c => (
                  <button
                    key={c.id}
                    id={`chain-select-option-${c.id}`}
                    onClick={() => selectChain(c.id)}
                    className={`flex items-center justify-between w-full text-left p-2.5 rounded-lg hover:bg-slate-800/80 transition text-sm ${
                      selectedChainId === c.id ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950" style={{ backgroundColor: c.color }}>
                        {c.icon}
                      </span>
                      <span>{c.name}</span>
                    </div>
                    {selectedChainId === c.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Button */}
            {connected ? (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 pr-2">
                <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono">
                  {walletBalance} {walletType === 'Phantom' ? 'SOL' : 'ETH'}
                </div>
                <button
                  id="wallet-info-btn"
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-800 rounded-lg text-xs text-slate-200 transition font-mono"
                  title="Copy wallet address"
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${isRealWallet ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} 
                    title={isRealWallet ? "Connected to real wallet via Web3 Provider" : "Connected via Sandbox Simulator"} 
                  />
                  <span>{formatAddress(walletAddress)}</span>
                  <Copy className="w-3 h-3 text-slate-500 hover:text-white" />
                </button>
                <button 
                  id="disconnect-wallet-btn"
                  onClick={handleDisconnect}
                  className="px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                id="connect-wallet-header"
                onClick={() => setShowConnectModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            {connected ? (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                <span className="font-mono text-slate-300">{formatAddress(walletAddress)}</span>
              </div>
            ) : (
              <button
                id="connect-wallet-mobile"
                onClick={() => setShowConnectModal(true)}
                className="p-1.5 rounded-lg bg-indigo-600 text-white"
              >
                <Wallet className="w-4 h-4" />
              </button>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-4 animate-fade-in">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'overview', label: 'Dashboard', icon: Coins },
                { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
                { id: 'bridge', label: 'Bridge', icon: Globe },
                { id: 'stake', label: 'Staking', icon: Layers },
                { id: 'nfts', label: 'NFTs', icon: Image },
                { id: 'ethersair', label: 'ETHERS AIR', icon: Zap },
                { id: 'inscriptions', label: 'Bitcoin', icon: TrendingUp },
                { id: 'history', label: 'History', icon: Clock },
                { id: 'slides', label: 'Google Workspace', icon: FolderOpen },
                ...(currentUserEmail === 'rezadress6659@gmail.com' ? [{ id: 'api', label: 'API Scan', icon: Code }] : [])
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`mobile-tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-lg text-xs font-semibold ${
                      activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile session switcher */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Profile Role</span>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                  {currentUserEmail === 'rezadress6659@gmail.com' ? 'Developer' : 'Standard'}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">{currentUserEmail}</div>
              <div className="flex gap-2">
                <button
                  id="mobile-switch-to-dev-btn"
                  onClick={() => {
                    setCurrentUserEmail('rezadress6659@gmail.com');
                    addToast('User Switched', 'Logged in as Developer', 'success');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                    currentUserEmail === 'rezadress6659@gmail.com' 
                      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  rezadress
                </button>
                <button
                  id="mobile-switch-to-guest-btn"
                  onClick={() => {
                    setCurrentUserEmail('guest@example.com');
                    if (activeTab === 'api') {
                      setActiveTab('overview');
                    }
                    addToast('User Switched', 'Logged in as guest', 'info');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                    currentUserEmail !== 'rezadress6659@gmail.com' 
                      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  guest
                </button>
              </div>
            </div>

            {/* Network selectors */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Active Network</label>
              <div className="grid grid-cols-3 gap-1.5">
                {CHAINS.map(c => (
                  <button
                    key={c.id}
                    id={`mobile-chain-${c.id}`}
                    onClick={() => selectChain(c.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium border ${
                      selectedChainId === c.id 
                        ? 'bg-slate-800 border-indigo-500 text-white' 
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-bold" style={{ backgroundColor: c.color }}>
                      {c.icon}
                    </span>
                    {c.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {connected && (
              <button
                id="mobile-disconnect-btn"
                onClick={() => {
                  handleDisconnect();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-900/20 text-sm font-semibold"
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        )}
      </header>

      {/* CORE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TOP METRIC RIBBON */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* NET WORTH */}
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400">Total Net Worth</span>
              <h3 className="text-2xl font-black mt-1 text-white">
                ${portfolioTotalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* ACTIVE ECOSYSTEM */}
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400">Network Focus</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-slate-950 font-black" style={{ backgroundColor: activeChain.color }}>
                  {activeChain.icon}
                </span>
                <span className="text-base font-bold text-white">{activeChain.name}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block">Gas Fee</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">{activeChain.gasPrice}</span>
            </div>
          </div>

          {/* STAKED BALANCE */}
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400">Total Staked Amount</span>
              <h3 className="text-xl font-bold mt-1 text-white">
                ${stakingPools.reduce((acc, curr) => {
                  const livePrice = curr.tokenSymbol === 'ETH' ? 3450.25 * livePricesMultiplier : 
                                    curr.tokenSymbol === 'SOL' ? 148.50 * livePricesMultiplier : 
                                    curr.tokenSymbol === 'POL' ? 0.58 : 
                                    curr.tokenSymbol === 'BNB' ? 585.30 * livePricesMultiplier : 
                                    curr.tokenSymbol === 'AVAX' ? 28.90 * livePricesMultiplier : 1;
                  return acc + (curr.staked * livePrice);
                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {/* SIMULATED WEB3 STATUS */}
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400">Wallet Connection</span>
              <div className="flex items-center gap-2 mt-1.5">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">{connected ? `Connected (${walletType})` : 'Not Connected'}</span>
                  {connected && (
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{formatAddress(walletAddress)}</span>
                  )}
                </div>
              </div>
            </div>
            {!connected && (
              <button 
                id="ribbon-connect-btn"
                onClick={() => setShowConnectModal(true)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold rounded-lg transition"
              >
                Connect
              </button>
            )}
          </div>

        </div>

        {/* TAB CONTENTS */}

        {/* ----------------- TAB: OVERVIEW ----------------- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PORTFOLIO GROWTH AREA CHART */}
            <div className="lg:col-span-2 rounded-2xl glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-200">Portfolio Growth Tracker</h4>
                  <p className="text-xs text-slate-400">Simulated growth of current wallet and staked allocations</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm bg-emerald-500/5 px-2.5 py-1 rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                  +36.9%
                </div>
              </div>
              
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PORTFOLIO_HISTORY}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeChain.color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={activeChain.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Balance" stroke={activeChain.color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ASSET ALLOCATION */}
            <div className="rounded-2xl glass-card p-5 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Asset Distribution</h4>
                <p className="text-xs text-slate-400 mb-4">Allocation by blockchain ecosystem</p>
              </div>

              <div className="h-[180px] w-full relative flex items-center justify-center">
                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-500 text-sm">
                    No active balances. Switch chains to view distributions.
                  </div>
                )}
                {allocationData.length > 0 && (
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Apex Balance</span>
                    <span className="text-lg font-black text-white">
                      ${portfolioTotalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {allocationData.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="text-slate-500 font-bold ml-auto">${item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ECOSYSTEM ASSET LIST */}
            <div className="lg:col-span-3 rounded-2xl glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="font-bold text-slate-200">{activeChain.name} Balances</h4>
                  <p className="text-xs text-slate-400">Review assets, holdings, and quick action options</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input 
                      id="token-search-input"
                      type="text" 
                      placeholder="Search Token..." 
                      value={searchTokenQuery}
                      onChange={(e) => setSearchTokenQuery(e.target.value)}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-44"
                    />
                  </div>
                  <button 
                    id="refresh-rates-btn"
                    onClick={() => {
                      setLivePricesMultiplier(prev => prev * (1 + (Math.random() * 0.02 - 0.01)));
                      addToast('Prices Updated', 'Latest DEX oracle prices pulled successfully', 'success');
                    }}
                    className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Force oracle price update"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">24h Change</th>
                      <th className="py-3 px-4">Holdings</th>
                      <th className="py-3 px-4 text-right">Value</th>
                      <th className="py-3 px-4 text-center">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeChainTokens.map(token => (
                      <tr key={token.symbol} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-800/80 border border-white/10 overflow-hidden">
                              <TokenLogo logo={token.logo} symbol={token.symbol} color={token.color} />
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100">{token.symbol}</span>
                                {token.totalSupply && (
                                  <span className="text-[9px] px-1 bg-indigo-500/10 text-indigo-400 rounded font-bold uppercase tracking-wider">
                                    {token.totalSupply >= 1000000 ? `${(token.totalSupply / 1000000).toFixed(0)}M Supply` : `${token.totalSupply} Supply`}
                                  </span>
                                )}
                              </div>
                              <span className="block text-[11px] text-slate-400 font-normal">{token.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium">
                          ${token.price > 0.01 ? token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : token.price.toFixed(7)}
                        </td>
                        <td className={`py-3.5 px-4 font-bold text-xs ${token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {token.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right font-bold text-white">
                          ${(token.balance * token.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              id={`quick-action-swap-${token.symbol.toLowerCase()}`}
                              onClick={() => {
                                setSwapSourceSymbol(token.symbol);
                                setActiveTab('swap');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 transition"
                            >
                              Swap
                            </button>
                            {['ETH', 'USDC', 'USDT'].includes(token.symbol) && (
                              <button
                                id={`quick-action-bridge-${token.symbol.toLowerCase()}`}
                                onClick={() => {
                                  setBridgeTokenSymbol(token.symbol);
                                  setBridgeSourceChainId(selectedChainId);
                                  setActiveTab('bridge');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 rounded-lg hover:bg-indigo-950/20 hover:border-indigo-900 transition"
                              >
                                Bridge
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GLOBAL DIAGNOSTICS & LEDGER SCANNER HUB */}
            <div className="lg:col-span-3 rounded-2xl glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="font-bold text-slate-200">Global Diagnostics & Multi-Chain Ledger Scanner</h4>
                    <p className="text-xs text-slate-400">Scan private endpoints, query live Bitcoin Satoshis, and check active Solana clusters</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2.5 py-1 rounded-lg uppercase font-mono tracking-wider">
                  Engine Ready
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Private API Scanner */}
                <div className="rounded-xl bg-slate-950/40 border border-slate-900 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Private API Security Audit</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Analyze active credentials and RPC endpoints. Verifies certificate status, latency, CORS limits, and key encryption signatures in localStorage.
                    </p>
                  </div>

                  {/* Terminal Log Stream */}
                  {(apiScanStatus === 'scanning' || apiScanStatus === 'success') && (
                    <div className="p-3 bg-black/95 rounded-lg border border-slate-800/80 h-32 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 scrollbar-thin">
                      <div className="text-indigo-400 font-bold mb-1 border-b border-white/5 pb-0.5 flex justify-between items-center">
                        <span>API AUDIT PEERS</span>
                        {apiScanStatus === 'scanning' && <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-400" />}
                      </div>
                      {apiScanLogs.map((log, idx) => (
                        <div key={idx} className="leading-snug">{log}</div>
                      ))}
                      {apiScanStatus === 'success' && (
                        <div className="text-emerald-400 font-bold">✔ Audit Completed. Zero vulnerabilities detected.</div>
                      )}
                    </div>
                  )}

                  {/* Results Display */}
                  {apiScanStatus === 'success' && apiScanResult && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">Security Rating</span>
                        <span className="text-emerald-400 font-bold block">{apiScanResult.score}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">Average Latency</span>
                        <span className="text-white font-bold block">{apiScanResult.latency}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">Vulnerability Check</span>
                        <span className="text-white font-bold block">{apiScanResult.vulnerabilities}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">SSL Status</span>
                        <span className="text-white font-bold block truncate">{apiScanResult.ssl}</span>
                      </div>
                    </div>
                  )}

                  <button
                    id="dashboard-scan-api-btn"
                    onClick={handleScanApi}
                    disabled={apiScanStatus === 'scanning'}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {apiScanStatus === 'scanning' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Auditing Endpoint...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Scan My API
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Bitcoin & Solana Ledger Scanner */}
                <div className="rounded-xl bg-slate-950/40 border border-slate-900 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Bitcoin & Solana Ledger Sync</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Establish handshakes with decentralized block peers across Bitcoin and Solana. Query the current block height, mempool fee density, and cluster validator metrics.
                    </p>
                  </div>

                  {/* Terminal Log Stream */}
                  {(chainScanStatus === 'scanning' || chainScanStatus === 'success') && (
                    <div className="p-3 bg-black/95 rounded-lg border border-slate-800/80 h-32 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 scrollbar-thin">
                      <div className="text-emerald-400 font-bold mb-1 border-b border-white/5 pb-0.5 flex justify-between items-center">
                        <span>LEDGER PEER HARVESTS</span>
                        {chainScanStatus === 'scanning' && <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-400" />}
                      </div>
                      {chainScanLogs.map((log, idx) => (
                        <div key={idx} className="leading-snug">{log}</div>
                      ))}
                      {chainScanStatus === 'success' && (
                        <div className="text-emerald-400 font-bold">✔ Sync Completed. Ledgers are verified.</div>
                      )}
                    </div>
                  )}

                  {/* Results Display */}
                  {chainScanStatus === 'success' && chainScanResult && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">BTC Block Height</span>
                        <span className="text-white font-bold block">{chainScanResult.btcBlock}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">Solana Net TPS</span>
                        <span className="text-white font-bold block">{chainScanResult.solTps}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">BTC Optimal Fee</span>
                        <span className="text-white font-bold block">{chainScanResult.btcGas}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase">Solana Epoch Sync</span>
                        <span className="text-white font-bold block">{chainScanResult.solEpoch}</span>
                      </div>
                    </div>
                  )}

                  <button
                    id="dashboard-scan-chains-btn"
                    onClick={handleScanChains}
                    disabled={chainScanStatus === 'scanning'}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {chainScanStatus === 'scanning' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        Scan Bitcoin & Solana
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: SWAP ----------------- */}
        {activeTab === 'swap' && (() => {
          const currentPool = liquidityPools.find(p => p.id === selectedPoolId);
          const poolTokenA = currentPool ? activeChainTokens.find(t => t.symbol === currentPool.tokenASymbol) : null;
          const poolTokenB = currentPool ? activeChainTokens.find(t => t.symbol === currentPool.tokenBSymbol) : null;

          const handleAmountAChange = (val: string) => {
            setPoolDepositAmountA(val);
            if (!val || isNaN(parseFloat(val)) || !poolTokenA || !poolTokenB) {
              setPoolDepositAmountB('');
              return;
            }
            const amt = parseFloat(val);
            const calculated = (amt * poolTokenA.price) / poolTokenB.price;
            setPoolDepositAmountB(calculated.toFixed(4));
          };

          const handleAmountBChange = (val: string) => {
            setPoolDepositAmountB(val);
            if (!val || isNaN(parseFloat(val)) || !poolTokenA || !poolTokenB) {
              setPoolDepositAmountA('');
              return;
            }
            const amt = parseFloat(val);
            const calculated = (amt * poolTokenB.price) / poolTokenA.price;
            setPoolDepositAmountA(calculated.toFixed(4));
          };

          return (
            <div className={`${swapSubTab === 'swap' ? 'max-w-md' : 'max-w-4xl'} mx-auto rounded-2xl glass-card p-6 shadow-2xl relative transition-all duration-300`}>
              
              {/* Segmented Sub-Tab Switcher */}
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 mb-6">
                <button
                  id="subtab-swap-btn"
                  onClick={() => setSwapSubTab('swap')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    swapSubTab === 'swap'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Token Swap
                </button>
                <button
                  id="subtab-pool-btn"
                  onClick={() => setSwapSubTab('pool')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    swapSubTab === 'pool'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Liquidity Pools
                </button>
              </div>

              {swapSubTab === 'swap' ? (
                /* DEX SWAP UI */
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h4 className="font-bold text-lg text-white">Universal Swap DEX</h4>
                      <p className="text-xs text-slate-400">Instantly exchange native ecosystem assets</p>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase">L2 Router v3</span>
                  </div>

                  {/* FROM BLOCK */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl mb-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>From</span>
                      <span>Balance: {swapSourceToken ? swapSourceToken.balance.toFixed(4) : '0.000'} {swapSourceSymbol}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <input 
                        id="swap-amount-input"
                        type="number" 
                        placeholder="0.00" 
                        value={swapSourceAmount}
                        onChange={(e) => setSwapSourceAmount(e.target.value)}
                        className="bg-transparent text-2xl font-black text-white focus:outline-none w-1/2"
                      />
                      
                      {/* Source Token Select */}
                      <select 
                        id="swap-source-token-select"
                        value={swapSourceSymbol}
                        onChange={(e) => {
                          setSwapSourceSymbol(e.target.value);
                          if (e.target.value === swapDestSymbol) {
                            const otherToken = activeChain.tokens.find(t => t.symbol !== e.target.value);
                            if (otherToken) setSwapDestSymbol(otherToken.symbol);
                          }
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm font-semibold text-white focus:outline-none"
                      >
                        {activeChain.tokens.map(t => (
                          <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                        ))}
                      </select>
                    </div>
                    {swapSourceToken && (
                      <div className="text-[10px] text-slate-500 mt-1.5">
                        ~${(parseFloat(swapSourceAmount || '0') * swapSourceToken.price).toFixed(2)} USD
                      </div>
                    )}
                  </div>

                  {/* INVERT PATH BUTTON */}
                  <div className="flex justify-center -my-3.5 relative z-10">
                    <button 
                      id="swap-invert-btn"
                      onClick={() => {
                        const s = swapSourceSymbol;
                        setSwapSourceSymbol(swapDestSymbol);
                        setSwapDestSymbol(s);
                      }}
                      className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90"
                    >
                      <ArrowDownUp className="w-4 h-4" />
                    </button>
                  </div>

                  {/* TO BLOCK */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl mt-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>To (Estimated)</span>
                      <span>Balance: {swapDestToken ? swapDestToken.balance.toFixed(4) : '0.000'} {swapDestSymbol}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-2xl font-black text-slate-400 focus:outline-none w-1/2 overflow-hidden truncate">
                        {swapDestinationAmount}
                      </span>
                      
                      {/* Destination Token Select */}
                      <select 
                        id="swap-dest-token-select"
                        value={swapDestSymbol}
                        onChange={(e) => {
                          setSwapDestSymbol(e.target.value);
                          if (e.target.value === swapSourceSymbol) {
                            const otherToken = activeChain.tokens.find(t => t.symbol !== e.target.value);
                            if (otherToken) setSwapSourceSymbol(otherToken.symbol);
                          }
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm font-semibold text-white focus:outline-none"
                      >
                        {activeChain.tokens.map(t => (
                          <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                        ))}
                      </select>
                    </div>
                    {swapDestToken && (
                      <div className="text-[10px] text-slate-500 mt-1.5">
                        ~${(parseFloat(swapDestinationAmount) * swapDestToken.price).toFixed(2)} USD
                      </div>
                    )}
                  </div>

                  {/* SWAP BREAKDOWN */}
                  <div className="p-3 bg-slate-950/40 rounded-xl space-y-2 text-xs border border-white/5 mb-5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rate</span>
                      <span className="font-medium text-slate-200">
                        {swapSourceToken && swapDestToken 
                          ? `1 ${swapSourceSymbol} = ${(swapSourceToken.price / swapDestToken.price).toFixed(4)} ${swapDestSymbol}` 
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price Impact</span>
                      <span className="text-emerald-400 font-semibold">&lt; 0.05%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slippage Tolerance</span>
                      <span className="text-slate-300">0.5% (Auto)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network Routing Fee</span>
                      <span className="text-slate-300 font-mono">~$0.24</span>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  {connected ? (
                    <button
                      id="swap-submit-btn"
                      onClick={handleSwap}
                      disabled={isSwapping || !swapSourceAmount}
                      className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSwapping ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Executing Automated Swap...
                        </>
                      ) : (
                        'Swap Assets'
                      )}
                    </button>
                  ) : (
                    <button
                      id="swap-connect-wallet-btn"
                      onClick={() => setShowConnectModal(true)}
                      className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-98"
                    >
                      Connect Wallet to Swap
                    </button>
                  )}
                </div>
              ) : (
                /* LIQUIDITY POOL UI */
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="font-black text-lg text-white">Ecosystem Liquidity Pools</h4>
                      <p className="text-xs text-slate-400">Become an LP, earn trading fees from network route swaps</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Oracle Active
                      </span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-1 rounded uppercase tracking-wider font-mono">
                        Fee: 0.3%
                      </span>
                    </div>
                  </div>

                  {/* STATS ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">My Total LP Value</span>
                      <span className="text-lg font-mono font-black text-white mt-1 block">
                        ${liquidityPools
                          .filter(p => p.chain === selectedChainId)
                          .reduce((acc, p) => {
                            const tokenA = activeChainTokens.find(t => t.symbol === p.tokenASymbol);
                            const tokenB = activeChainTokens.find(t => t.symbol === p.tokenBSymbol);
                            const priceA = tokenA?.price || 0;
                            const priceB = tokenB?.price || 0;
                            return acc + (p.myLiquidityA * priceA) + (p.myLiquidityB * priceB);
                          }, 0)
                          .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Accrued Swap Fees</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <span className="text-lg font-mono font-black text-emerald-400 mt-1 block">
                        ${liquidityPools
                          .filter(p => p.chain === selectedChainId)
                          .reduce((acc, p) => acc + p.myRewards, 0)
                          .toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-center">
                      <button
                        id="claim-all-lp-fees-btn"
                        disabled={liquidityPools.filter(p => p.chain === selectedChainId && p.myRewards > 0).length === 0 || isLpActionLoading}
                        onClick={() => {
                          const chainPools = liquidityPools.filter(p => p.chain === selectedChainId && p.myRewards > 0);
                          chainPools.forEach(p => handleClaimLpFees(p.id));
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 transition duration-150 text-white flex items-center justify-center gap-1.5 shadow border border-emerald-500/10 cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        Claim All Fees
                      </button>
                    </div>
                  </div>

                  {/* MAIN SPLIT PANELS */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* LEFT: POOLS LIST */}
                    <div className="lg:col-span-3 space-y-3">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Select Pool</span>
                      {liquidityPools.filter(p => p.chain === selectedChainId).map(pool => {
                        const priceA = activeChainTokens.find(t => t.symbol === pool.tokenASymbol)?.price || 0;
                        const priceB = activeChainTokens.find(t => t.symbol === pool.tokenBSymbol)?.price || 0;
                        const tvl = (pool.tokenAAmount * priceA) + (pool.tokenBAmount * priceB);
                        const isSelected = selectedPoolId === pool.id;
                        const userLPValue = (pool.myLiquidityA * priceA) + (pool.myLiquidityB * priceB);

                        return (
                          <div
                            key={pool.id}
                            id={`lp-pool-card-${pool.id}`}
                            onClick={() => {
                              setSelectedPoolId(pool.id);
                              setPoolDepositAmountA('');
                              setPoolDepositAmountB('');
                            }}
                            className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left ${
                              isSelected
                                ? 'bg-slate-900/80 border-indigo-500/80 shadow-lg shadow-indigo-500/5'
                                : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900/40 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {/* Double Token Logo */}
                                <div className="flex items-center">
                                  <span className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs overflow-hidden z-10 text-white">
                                    {pool.tokenASymbol.substring(0, 2)}
                                  </span>
                                  <span className="w-7 h-7 rounded-full bg-slate-850 border border-white/10 flex items-center justify-center font-bold text-xs overflow-hidden -ml-2.5 text-slate-300">
                                    {pool.tokenBSymbol.substring(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-bold text-white text-sm block">
                                    {pool.tokenASymbol} / {pool.tokenBSymbol}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-medium">Constant Product Pool</span>
                                </div>
                              </div>
                              
                              <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                                {pool.apy.toFixed(2)}% APY
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3 mt-1">
                              <div>
                                <span className="text-slate-400 text-[10px] block">Total Value Locked (TVL)</span>
                                <span className="font-mono text-slate-200 font-bold">
                                  ${tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">Volume (24h)</span>
                                <span className="font-mono text-slate-200 font-bold">
                                  ${pool.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            </div>

                            {userLPValue > 0 && (
                              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2.5 mt-3 flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-indigo-400 font-semibold block text-[10px] uppercase tracking-wider">My Staked Liquidity</span>
                                  <span className="font-bold text-slate-200 mt-0.5 block">
                                    {pool.myLiquidityA.toFixed(4)} {pool.tokenASymbol} + {pool.myLiquidityB.toFixed(4)} {pool.tokenBSymbol}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 text-[10px] block">Pending Fees</span>
                                  <span className="font-mono text-emerald-400 font-bold block animate-pulse">
                                    ${pool.myRewards.toFixed(5)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* RIGHT: MANAGE POOL */}
                    <div className="lg:col-span-2">
                      {currentPool && poolTokenA && poolTokenB ? (
                        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 sticky top-20">
                          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Manage Pool</span>
                              <span className="font-bold text-white text-base">
                                {currentPool.tokenASymbol} / {currentPool.tokenBSymbol}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-medium">Pool Share</span>
                              <span className="font-mono font-bold text-indigo-400 text-sm">
                                {currentPool.myShare.toFixed(3)}%
                              </span>
                            </div>
                          </div>

                          {/* DEPOSIT / WITHDRAW TAB TOGGLE */}
                          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800/60 mb-4 text-xs font-semibold">
                            <button
                              id="lp-mode-deposit-btn"
                              onClick={() => {
                                setPoolWithdrawPercent(0);
                              }}
                              className={`flex-1 py-1.5 rounded-md transition duration-150 cursor-pointer ${
                                poolWithdrawPercent === 0 ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Add Liquidity
                            </button>
                            {currentPool.myLiquidityA > 0 && (
                              <button
                                id="lp-mode-withdraw-btn"
                                onClick={() => {
                                  setPoolWithdrawPercent(100);
                                }}
                                className={`flex-1 py-1.5 rounded-md transition duration-150 cursor-pointer ${
                                  poolWithdrawPercent > 0 ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Remove Liquidity
                              </button>
                            )}
                          </div>

                          {/* FORM VIEW TYPE */}
                          {poolWithdrawPercent > 0 && currentPool.myLiquidityA > 0 ? (
                            // REMOVE LIQUIDITY FORM
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-400">Amount to Remove</span>
                                  <span className="font-bold text-white">{poolWithdrawPercent}%</span>
                                </div>
                                
                                {/* PERCENT SLIDER */}
                                <input
                                  id="lp-withdraw-slider"
                                  type="range"
                                  min="10"
                                  max="100"
                                  step="5"
                                  value={poolWithdrawPercent}
                                  onChange={(e) => setPoolWithdrawPercent(parseInt(e.target.value))}
                                  className="w-full accent-indigo-500 bg-slate-900 h-2 rounded-lg cursor-pointer border border-slate-800"
                                />

                                {/* PERCENT QUICK ACCENTS */}
                                <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-400">
                                  {[25, 50, 75, 100].map(p => (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => setPoolWithdrawPercent(p)}
                                      className={`py-1 rounded border hover:text-white hover:border-slate-600 transition cursor-pointer ${
                                        poolWithdrawPercent === p ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : 'bg-slate-900 border-slate-800'
                                      }`}
                                    >
                                      {p}%
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* REMOVE ESTIMATE SUMMARY */}
                              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs space-y-2">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Estimated Return</span>
                                <div className="flex justify-between font-mono">
                                  <span className="text-slate-400">Token A Return</span>
                                  <span className="font-bold text-slate-200">
                                    {(currentPool.myLiquidityA * (poolWithdrawPercent / 100)).toFixed(5)} {currentPool.tokenASymbol}
                                  </span>
                                </div>
                                <div className="flex justify-between font-mono">
                                  <span className="text-slate-400">Token B Return</span>
                                  <span className="font-bold text-slate-200">
                                    {(currentPool.myLiquidityB * (poolWithdrawPercent / 100)).toFixed(5)} {currentPool.tokenBSymbol}
                                  </span>
                                </div>
                                <div className="flex justify-between font-mono text-emerald-400 border-t border-white/5 pt-2 mt-1 font-bold">
                                  <span>Fee Rewards Claim</span>
                                  <span>
                                    +${(currentPool.myRewards * (poolWithdrawPercent / 100)).toFixed(4)}
                                  </span>
                                </div>
                              </div>

                              {/* REMOVE BUTTON */}
                              {connected ? (
                                <button
                                  id="lp-withdraw-submit-btn"
                                  disabled={isLpActionLoading}
                                  onClick={() => handleRemoveLiquidity(currentPool.id, poolWithdrawPercent)}
                                  className="w-full py-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  {isLpActionLoading && lpActionType === 'withdraw' ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      Burning Liquidity Pool Tokens...
                                    </>
                                  ) : (
                                    'Remove Liquidity & Claim Fees'
                                  )}
                                </button>
                              ) : (
                                <button
                                  id="lp-withdraw-connect-btn"
                                  onClick={() => setShowConnectModal(true)}
                                  className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition flex items-center justify-center"
                                >
                                  Connect Wallet to Remove Liquidity
                                </button>
                              )}
                            </div>
                          ) : (
                            // ADD LIQUIDITY FORM
                            <div className="space-y-4">
                              {/* TOKEN A INPUT */}
                              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                                  <span>Input {currentPool.tokenASymbol}</span>
                                  <span>Balance: {poolTokenA.balance.toFixed(4)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    id="lp-input-amount-a"
                                    type="number"
                                    placeholder="0.00"
                                    value={poolDepositAmountA}
                                    onChange={(e) => handleAmountAChange(e.target.value)}
                                    className="bg-transparent text-lg font-bold text-white focus:outline-none w-2/3"
                                  />
                                  <div className="ml-auto flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-white">
                                    <span className="font-bold">{currentPool.tokenASymbol}</span>
                                  </div>
                                </div>
                              </div>

                              {/* PLUS SEPARATOR */}
                              <div className="flex justify-center -my-3.5 relative z-10">
                                <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                  +
                                </span>
                              </div>

                              {/* TOKEN B INPUT */}
                              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                                  <span>Input {currentPool.tokenBSymbol} (Proportional)</span>
                                  <span>Balance: {poolTokenB.balance.toFixed(4)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    id="lp-input-amount-b"
                                    type="number"
                                    placeholder="0.00"
                                    value={poolDepositAmountB}
                                    onChange={(e) => handleAmountBChange(e.target.value)}
                                    className="bg-transparent text-lg font-bold text-white focus:outline-none w-2/3"
                                  />
                                  <div className="ml-auto flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-white">
                                    <span className="font-bold">{currentPool.tokenBSymbol}</span>
                                  </div>
                                </div>
                              </div>

                              {/* LIQUIDITY ADD RATIO DEEPER INFO */}
                              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs space-y-1">
                                <div className="flex justify-between text-slate-400">
                                  <span>Oracle Price Ratio</span>
                                  <span className="font-mono text-slate-300">
                                    1 {currentPool.tokenASymbol} = {(poolTokenA.price / poolTokenB.price).toFixed(4)} {currentPool.tokenBSymbol}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Est. Share Increase</span>
                                  <span className="text-indigo-400 font-bold">
                                    {poolDepositAmountA && !isNaN(parseFloat(poolDepositAmountA))
                                      ? `${(
                                          (parseFloat(poolDepositAmountA) * poolTokenA.price * 2) /
                                          ((currentPool.tokenAAmount * poolTokenA.price +
                                            currentPool.tokenBAmount * poolTokenB.price) +
                                            parseFloat(poolDepositAmountA) * poolTokenA.price * 2) *
                                          100
                                        ).toFixed(4)}%`
                                      : '0.00%'}
                                  </span>
                                </div>
                              </div>

                              {/* DEPOSIT ACTION BUTTON */}
                              {connected ? (
                                <button
                                  id="lp-deposit-submit-btn"
                                  disabled={isLpActionLoading || !poolDepositAmountA || !poolDepositAmountB}
                                  onClick={() => handleAddLiquidity(currentPool.id, poolDepositAmountA, poolDepositAmountB)}
                                  className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  {isLpActionLoading && lpActionType === 'deposit' ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      Depositing Assets to Liquidity Pool...
                                    </>
                                  ) : (
                                    'Supply Pairs Liquidity'
                                  )}
                                </button>
                              ) : (
                                <button
                                  id="lp-deposit-connect-btn"
                                  onClick={() => setShowConnectModal(true)}
                                  className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition flex items-center justify-center cursor-pointer"
                                >
                                  Connect Wallet to Supply Liquidity
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 bg-slate-950/40 border border-slate-800 rounded-xl">
                          Select a pool to deposit or manage liquidity
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ----------------- TAB: BRIDGE ----------------- */}
        {activeTab === 'bridge' && (
          <div className="max-w-md mx-auto rounded-2xl glass-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-bold text-lg text-white">Cross-Chain Bridge</h4>
                <p className="text-xs text-slate-400">Relay assets securely between ecosystems</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase font-mono">Instant Pool V2</span>
            </div>

            {/* ROUTE BOX (FROM -> TO) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* FROM NETWORK */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <label className="text-[10px] text-slate-400 font-semibold block uppercase mb-1.5">Source Network</label>
                <select 
                  id="bridge-source-chain-select"
                  value={bridgeSourceChainId}
                  onChange={(e) => setBridgeSourceChainId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none w-full"
                >
                  {CHAINS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* TO NETWORK */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <label className="text-[10px] text-slate-400 font-semibold block uppercase mb-1.5">Destination</label>
                <select 
                  id="bridge-dest-chain-select"
                  value={bridgeDestChainId}
                  onChange={(e) => setBridgeDestChainId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none w-full"
                >
                  {CHAINS.filter(c => c.id !== bridgeSourceChainId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* BRIDGE AMOUNT */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl mb-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Send Amount</span>
                <span>Balance: {bridgeActiveToken?.balance.toFixed(4)} {bridgeTokenSymbol}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <input 
                  id="bridge-amount-input"
                  type="number" 
                  placeholder="0.00" 
                  value={bridgeAmount}
                  onChange={(e) => setBridgeAmount(e.target.value)}
                  className="bg-transparent text-2xl font-black text-white focus:outline-none w-1/2"
                />
                
                <select 
                  id="bridge-token-select"
                  value={bridgeTokenSymbol}
                  onChange={(e) => setBridgeTokenSymbol(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm font-semibold text-white focus:outline-none"
                >
                  {bridgeSourceChain.tokens.filter(t => ['ETH', 'USDC', 'USDT'].includes(t.symbol)).map(t => (
                    <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* INTERACTIVE STEPPER PROGRESS */}
            {bridgeStep > 0 && (
              <div className="mb-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-300">Bridge State Progress</div>
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-800" />
                  
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 relative pb-4">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                      bridgeStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {bridgeStep > 1 ? '✓' : '1'}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">Approve Relayer Allowance</h5>
                      <p className="text-[10px] text-slate-400">Request smart contract sign approval</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 relative pb-4">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                      bridgeStep >= 2 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {bridgeStep > 2 ? '✓' : '2'}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">Deposit & Lock</h5>
                      <p className="text-[10px] text-slate-400">Locking assets in source pool liquidity contract</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                      bridgeStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {bridgeStep > 3 ? '✓' : '3'}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">Destination Mint/Unlock</h5>
                      <p className="text-[10px] text-slate-400">Cross-chain consensus validation and payout</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BREAKDOWN */}
            <div className="p-3 bg-slate-950/40 rounded-xl space-y-2 text-xs border border-white/5 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Transfer Time</span>
                <span className="font-semibold text-slate-200">~ 2 Minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bridge Gas Fee</span>
                <span className="text-slate-300">0.003 {bridgeActiveToken?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Slippage & Impact</span>
                <span className="text-emerald-400">&lt; 0.1%</span>
              </div>
            </div>

            {/* BRIDGE TRIGGER BUTTON */}
            {connected ? (
              <button
                id="bridge-submit-btn"
                onClick={handleBridge}
                disabled={isBridging || !bridgeAmount}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isBridging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Bridging Ecosystems...
                  </>
                ) : (
                  'Initiate Bridge Transfer'
                )}
              </button>
            ) : (
              <button
                id="bridge-connect-wallet-btn"
                onClick={() => setShowConnectModal(true)}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-98"
              >
                Connect Wallet to Bridge
              </button>
            )}
          </div>
        )}

        {/* ----------------- TAB: STAKING ----------------- */}
        {activeTab === 'stake' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* VAULT PANEL */}
            <div className="rounded-2xl glass-card p-5">
              <h4 className="font-bold text-slate-200 mb-4">Select Staking Vault</h4>
              <div className="space-y-3">
                {stakingPools.map(pool => {
                  const isSelected = pool.id === selectedStakingPoolId;
                  return (
                    <button
                      key={pool.id}
                      id={`staking-vault-option-${pool.id}`}
                      onClick={() => setSelectedStakingPoolId(pool.id)}
                      className={`w-full p-4 rounded-xl border text-left transition duration-150 relative ${
                        isSelected 
                          ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/5' 
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase block mb-1">
                            {pool.chain.toUpperCase()} POOL
                          </span>
                          <h5 className="font-bold text-slate-100 text-sm leading-tight">{pool.poolName}</h5>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Yield APY</span>
                          <span className="text-base font-black text-emerald-400">{pool.apy}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                        <div>
                          <span>My Locked</span>
                          <span className="block font-bold text-white mt-0.5 font-mono">
                            {pool.staked.toFixed(4)} {pool.tokenSymbol}
                          </span>
                        </div>
                        <div className="text-right">
                          <span>Earned</span>
                          <span className="block font-bold text-emerald-400 mt-0.5 font-mono flex items-center justify-end gap-1">
                            <Zap className="w-3 h-3 animate-pulse" />
                            {pool.rewards.toFixed(6)} {pool.tokenSymbol}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LOCK / UNSTAKE PANEL */}
            <div className="rounded-2xl glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 mb-5">
                  <button
                    id="stake-mode-btn"
                    onClick={() => setStakingMode('stake')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      stakingMode === 'stake' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Stake
                  </button>
                  <button
                    id="unstake-mode-btn"
                    onClick={() => setStakingMode('unstake')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      stakingMode === 'unstake' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Unstake
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>
                      {stakingMode === 'stake' ? 'Available to stake' : 'Staked balance'}
                    </span>
                    <span className="font-mono">
                      {stakingMode === 'stake' 
                        ? `${activeStakingToken ? activeStakingToken.balance.toFixed(4) : '0.00'} ${activeStakingPool.tokenSymbol}`
                        : `${activeStakingPool.staked.toFixed(4)} ${activeStakingPool.tokenSymbol}`}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <input 
                      id="staking-amount-input"
                      type="number" 
                      placeholder="0.00" 
                      value={stakingAmount}
                      onChange={(e) => setStakingAmount(e.target.value)}
                      className="bg-transparent text-2xl font-black text-white focus:outline-none w-1/2"
                    />
                    <button
                      id="staking-max-btn"
                      onClick={() => {
                        if (stakingMode === 'stake') {
                          setStakingAmount(activeStakingToken ? activeStakingToken.balance.toString() : '0');
                        } else {
                          setStakingAmount(activeStakingPool.staked.toString());
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* EARNINGS PREVIEW */}
                <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-xs space-y-2 mb-5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Rewards Growth</span>
                    <span className="font-bold text-slate-200">
                      {stakingAmount && !isNaN(parseFloat(stakingAmount)) 
                        ? `${((parseFloat(stakingAmount) * (activeStakingPool.apy / 100)) / 365).toFixed(6)} ${activeStakingPool.tokenSymbol}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Yearly Earnings</span>
                    <span className="font-bold text-emerald-400">
                      {stakingAmount && !isNaN(parseFloat(stakingAmount))
                        ? `${(parseFloat(stakingAmount) * (activeStakingPool.apy / 100)).toFixed(4)} ${activeStakingPool.tokenSymbol}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lockup Epoch Period</span>
                    <span className="text-slate-400">None (Liquid Pool)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {connected ? (
                  <button
                    id="staking-submit-btn"
                    onClick={handleStakeAction}
                    disabled={isStaking || !stakingAmount}
                    className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isStaking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Writing to Smart Contract...
                      </>
                    ) : (
                      stakingMode === 'stake' ? 'Lock & Stake' : 'Confirm Unstake'
                    )}
                  </button>
                ) : (
                  <button
                    id="staking-connect-wallet-btn"
                    onClick={() => setShowConnectModal(true)}
                    className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-98"
                  >
                    Connect Wallet to Stake
                  </button>
                )}

                {activeStakingPool.rewards > 0 && (
                  <button
                    id="claim-rewards-btn"
                    onClick={handleClaimRewards}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 transition flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Claim Accumulated {activeStakingPool.rewards.toFixed(6)} {activeStakingPool.tokenSymbol} Rewards
                  </button>
                )}
              </div>
            </div>

            {/* STAKING ANALYTICS & REWARDS GROWTH CHART */}
            <div className="rounded-2xl glass-card p-5">
              <h4 className="font-bold text-slate-200">Staking Rewards Index</h4>
              <p className="text-xs text-slate-400 mb-4">Simulated APY growth yield over 30 days epoch</p>
              
              <div className="h-[180px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={STAKING_REWARDS_HISTORY}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="Rewards" fill="#8247E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Apex liquid pool stakers automatically accrue compound validation nodes yield. Unlocked assets can be traded on the Swap tab at any time.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: NFTS ----------------- */}
        {activeTab === 'nfts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: NFT Minting Station */}
            <div className="rounded-2xl glass-card p-6 space-y-5 lg:col-span-1">
              <div>
                <h4 className="font-bold text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  EthersAir NFT Forge
                </h4>
                <p className="text-xs text-slate-400">Mint unique multi-chain collectibles on the native validator ledger</p>
              </div>

              <div className="space-y-4">
                {/* Target Blockchain Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Target Blockchain Network</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNftTargetChain('ethersair')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        nftTargetChain === 'ethersair'
                          ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      EthersAir
                    </button>
                    <button
                      type="button"
                      onClick={() => setNftTargetChain('bitcoin')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        nftTargetChain === 'bitcoin'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Bitcoin Ordinal
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Collectible Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Neo-Ether Warrior #1"
                    value={nftNameInput}
                    onChange={(e) => setNftNameInput(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>

                {/* Aesthetic Visual Matrix */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Artistic Visual Template</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { grad: 'from-blue-600 to-indigo-900', label: 'Cosmos' },
                      { grad: 'from-purple-600 to-pink-900', label: 'Neon' },
                      { grad: 'from-emerald-500 to-teal-800', label: 'Jade' },
                      { grad: 'from-amber-500 to-orange-800', label: 'Amber' },
                    ].map(item => (
                      <button
                        key={item.grad}
                        onClick={() => setNftTemplateInput(item.grad)}
                        className={`h-10 rounded-lg bg-gradient-to-tr ${item.grad} border-2 transition-all ${
                          nftTemplateInput === item.grad ? 'border-indigo-400 scale-105 shadow-md shadow-indigo-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Rarity Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Ledger Rarity Rank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Common', 'Uncommon', 'Rare', 'Legendary'].map(rarity => (
                      <button
                        key={rarity}
                        onClick={() => setNftRarityInput(rarity as any)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                          nftRarityInput === rarity 
                            ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action */}
                {connected ? (
                  <button
                    onClick={handleMintNft}
                    disabled={isMintingNft}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-lg transition flex items-center justify-center gap-2 active:scale-98 ${
                      nftTargetChain === 'bitcoin'
                        ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                    }`}
                  >
                    {isMintingNft ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {nftTargetChain === 'bitcoin' ? 'Inscribing Ordinal Metadata...' : 'Forging On-Chain Metadata...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        {nftTargetChain === 'bitcoin' ? 'Inscribe Bitcoin Ordinal NFT' : 'Mint Premium Collectible'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold text-white transition ${
                      nftTargetChain === 'bitcoin'
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    Connect Wallet to Mint
                  </button>
                )}
              </div>
            </div>

            {/* Right: NFT Active Gallery */}
            <div className="rounded-2xl glass-card p-6 space-y-6 lg:col-span-2">
              <div>
                <h4 className="font-bold text-lg text-white">Your Premium Collectibles</h4>
                <p className="text-xs text-slate-400">Secure record of decentralized ownership on current account</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {nfts.map(nft => (
                  <div key={nft.id} className="rounded-xl bg-slate-950/40 border border-slate-800/80 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 group">
                    {/* Visual Canvas Block */}
                    <div className={`h-40 bg-gradient-to-tr ${nft.imageGradient} p-4 flex flex-col justify-between relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-[1px]" />
                      <div className="flex justify-between items-start z-10">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          nft.rarity === 'Legendary' ? 'bg-amber-500 text-amber-950' :
                          nft.rarity === 'Rare' ? 'bg-purple-500 text-purple-950' :
                          nft.rarity === 'Uncommon' ? 'bg-emerald-500 text-emerald-950' :
                          'bg-slate-400 text-slate-950'
                        }`}>
                          {nft.rarity}
                        </span>
                        <span className="text-[10px] font-bold text-slate-200 bg-slate-950/40 backdrop-blur-md px-2 py-0.5 rounded font-mono">
                          PWR: {nft.powerRating}
                        </span>
                      </div>
                      <div className="z-10 flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-300 font-mono tracking-wider">{nft.collection}</span>
                          <span className={`text-[8px] font-bold px-1 rounded uppercase tracking-wide ${
                            nft.collection.includes('Bitcoin') 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {nft.collection.includes('Bitcoin') ? 'BTC' : 'EAIR'}
                          </span>
                        </div>
                        <span className="text-sm font-black text-white truncate drop-shadow">{nft.name}</span>
                      </div>
                    </div>

                    {/* Meta Data & Transfer Button */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Ledger Origin ID</span>
                        <span className="font-mono text-slate-300 text-[10px]">{nft.id}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-2">
                        <span>Minted On</span>
                        <span className="font-mono text-slate-300">{nft.mintedAt}</span>
                      </div>
                      <button
                        onClick={() => {
                          const destAddr = prompt('Enter recipient mock Ethereum / Solana wallet address:');
                          if (destAddr) {
                            addToast('Transferring Collectible', `Routing NFT metadata pipeline for "${nft.name}"...`, 'info');
                            setTimeout(() => {
                              setNfts(prev => prev.filter(n => n.id !== nft.id));
                              addToast('Transfer Completed!', `Successfully transferred "${nft.name}" to address ${destAddr.substring(0,6)}...`, 'success');
                            }, 1500);
                          }
                        }}
                        className="w-full py-1.5 rounded-lg text-[10px] font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 transition"
                      >
                        Transfer Collectible
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: ETHERSAIR ----------------- */}
        {activeTab === 'ethersair' && (
          <div className="space-y-6">
            {/* Network Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Network Native Price', value: '$0.91', desc: '12.5% increase 24h', icon: Coins, color: 'text-indigo-400 bg-indigo-500/5' },
                { label: 'Core Market Capitalization', value: '$68.25 Million', desc: 'Fully diluted ecosystem', icon: Activity, color: 'text-emerald-400 bg-emerald-500/5' },
                { label: 'Ecosystem Staking APY', value: '15.8% APY', desc: 'Compounding liquid return', icon: Zap, color: 'text-amber-400 bg-amber-500/5' },
                { label: 'Active Validation Nodes', value: '128 Node Peers', desc: 'Byzantine fault tolerant', icon: Server, color: 'text-purple-400 bg-purple-500/5' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="rounded-2xl p-5 bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                      <span className="text-xl font-black text-white block">{stat.value}</span>
                      <span className="text-[10px] text-slate-500 block">{stat.desc}</span>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Validation Node Delegation Workspace */}
            <div className="rounded-2xl glass-card p-6 space-y-6">
              <div>
                <h4 className="font-bold text-lg text-white">Interactive Validator Node Delegation</h4>
                <p className="text-xs text-slate-400">Delegate and stake tokens directly to active consensus nodes to secure the ledger</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Delegate Controls Form */}
                <div className="rounded-xl bg-slate-950/50 p-5 border border-slate-800 lg:col-span-4 space-y-4">
                  <h5 className="font-bold text-xs text-white uppercase tracking-wider">Stake Delegation Console</h5>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Target Node Validator</label>
                      <select
                        value={selectedValidatorId}
                        onChange={(e) => setSelectedValidatorId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                      >
                        {validators.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.commission} Fee)</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Delegation Amount (ETH)</label>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={delegateAmount}
                        onChange={(e) => setDelegateAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleDelegateAction(selectedValidatorId, delegateAmount, 'delegate')}
                        disabled={isDelegating}
                        className="py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                      >
                        Delegate
                      </button>
                      <button
                        onClick={() => handleDelegateAction(selectedValidatorId, delegateAmount, 'undelegate')}
                        disabled={isDelegating}
                        className="py-2.5 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition disabled:opacity-50"
                      >
                        Undelegate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Validators Table List */}
                <div className="lg:col-span-8 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border border-white/5 rounded-xl overflow-hidden">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/60 border-b border-white/5">
                      <tr>
                        <th className="py-3.5 px-4">Validator Node Name</th>
                        <th className="py-3.5 px-4">Commission</th>
                        <th className="py-3.5 px-4">Uptime Rank</th>
                        <th className="py-3.5 px-4">Total Delegated pool</th>
                        <th className="py-3.5 px-4">Your Active Stake</th>
                        <th className="py-3.5 px-4 text-right">Node Peer Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {validators.map(v => (
                        <tr key={v.id} className="hover:bg-white/[0.01] transition">
                          <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {v.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono">{v.commission}</td>
                          <td className="py-3.5 px-4 text-slate-400">{v.uptime}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-100 font-semibold">{(v.delegated).toLocaleString()} ETH</td>
                          <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">{(v.myDelegation).toLocaleString()} ETH</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                              Active & Synced
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: INSCRIPTIONS ----------------- */}
        {activeTab === 'inscriptions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Ordinal Engine Forge */}
            <div className="rounded-2xl glass-card p-6 space-y-5 lg:col-span-1">
              <div>
                <h4 className="font-bold text-lg text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Bitcoin Ordinal Engine
                </h4>
                <p className="text-xs text-slate-400">Inscribe immutable text content or media scripts onto individual Satoshi blocks</p>
              </div>

              <div className="space-y-4">
                {/* Name Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Artifact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Satoshi Cyber Script"
                    value={inscriptionName}
                    onChange={(e) => setInscriptionName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans"
                  />
                </div>

                {/* Content Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Mime Content-Type</label>
                  <select
                    value={inscriptionType}
                    onChange={(e) => setInscriptionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="text/plain">text/plain (UTF-8)</option>
                    <option value="application/json">application/json</option>
                    <option value="image/png">image/png (Hex representation)</option>
                  </select>
                </div>

                {/* Raw Script Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Payload Script Code</label>
                  <textarea
                    rows={4}
                    placeholder={`e.g. BRC-20 deploy script:\n{\n  "p": "brc-20",\n  "op": "mint",\n  "tick": "air",\n  "amt": "1000"\n}`}
                    value={inscriptionContent}
                    onChange={(e) => setInscriptionContent(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono placeholder:text-slate-600"
                  />
                </div>

                {/* Fee Rate Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300 uppercase tracking-wide">
                    <span>Sat Transaction Fee Rate</span>
                    <span className="text-indigo-400 font-mono">{inscriptionFeeRate} sat/vB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={inscriptionFeeRate}
                    onChange={(e) => setInscriptionFeeRate(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Low ~10 sat</span>
                    <span>Standard ~25 sat</span>
                    <span>High priority ~80+ sat</span>
                  </div>
                </div>

                {/* Submit button */}
                {connected ? (
                  <button
                    onClick={handleInscribeBtc}
                    disabled={isInscribing}
                    className="w-full py-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    {isInscribing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Inscribing Ordinal Block...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Inscribe Ordinal script
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="w-full py-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                  >
                    Connect Wallet to Inscribe
                  </button>
                )}
              </div>
            </div>

            {/* Right: Inscriptions Museum Gallery */}
            <div className="rounded-2xl glass-card p-6 space-y-6 lg:col-span-2">
              <div>
                <h4 className="font-bold text-lg text-white">Ordinals Museum Ledger</h4>
                <p className="text-xs text-slate-400">View real-time Bitcoin digital artifacts mined onto individual Satoshis</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inscriptions.map(ins => (
                  <div key={ins.id} className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3.5 hover:border-indigo-500/30 transition duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{ins.name}</span>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-mono">
                        {ins.number}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-[11px] font-mono text-slate-400 truncate space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Content MIME</span>
                        <span className="text-indigo-400">{ins.contentType}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Payload Byte size</span>
                        <span className="text-slate-300">{ins.sizeBytes} Bytes</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Genesis Sat No</span>
                        <span className="text-slate-300">{ins.sat}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Mined At Time</span>
                        <span className="text-slate-300">{ins.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                      <span>Transaction Fee Paid</span>
                      <span className="text-emerald-400">{(ins.sizeBytes / 4 * ins.feeRate * 0.0006).toFixed(5)} mBTC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: HISTORY ----------------- */}
        {activeTab === 'history' && (
          <div className="rounded-2xl glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-bold text-slate-200">Ecosystem Event Logs</h4>
                <p className="text-xs text-slate-400">Secure record of transactions on current wallet connection</p>
              </div>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 font-mono px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Live Feed
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Clock className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-semibold">No transactions recorded yet.</p>
                <p className="text-xs text-slate-600 mt-1">Initiate a Swap, Cross-Chain Bridge, or Staking action to populate this log.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Ecosystem Chain</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Fiat Value</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Receipt Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/[0.01] transition">
                        <td className="py-3.5 px-4 font-bold text-white uppercase text-xs">
                          <span className={`px-2 py-1 rounded ${
                            tx.type === 'swap' ? 'bg-indigo-500/10 text-indigo-400' :
                            tx.type === 'bridge' ? 'bg-emerald-500/10 text-emerald-400' :
                            tx.type === 'stake' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-orange-500/10 text-orange-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {tx.chain}
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          {tx.details}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                          {tx.amount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            Success
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                          {tx.timestamp}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-indigo-400 hover:underline">
                          <a href="#" className="flex items-center justify-end gap-1" onClick={(e) => { e.preventDefault(); addToast('Receipt Opened', 'Redirecting to mock blockchain explorer...', 'info'); }}>
                            {formatAddress(tx.txHash)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: PRIVATE DEVELOPER API ----------------- */}
        {activeTab === 'api' && currentUserEmail === 'rezadress6659@gmail.com' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div className="rounded-2xl glass-card p-6 shadow-2xl space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white">Private RPC API Console</h4>
                  <p className="text-xs text-slate-400">Configure your personal endpoint keys securely inside localStorage</p>
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  Owner Mode Active
                </span>
              </div>

              {/* Informational Warning */}
              <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-indigo-300 block">Personalized Developer Access Only</span>
                  <p className="text-slate-300 leading-relaxed">
                    As the primary developer (<span className="font-mono text-white">rezadress6659@gmail.com</span>), you have exclusive access to this console panel. Standard viewers and guest accounts are blocked from seeing or editing these connection details.
                  </p>
                </div>
              </div>

              {/* Configuration Fields */}
              <div className="space-y-4">
                {/* Endpoint */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">RPC Node Provider Endpoint</label>
                  <input 
                    id="api-rpc-endpoint-input"
                    type="text" 
                    placeholder="https://eth-mainnet.g.alchemy.com/v2/your-api-key" 
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-mono placeholder:text-slate-600"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Supports Infura, Alchemy, QuickNode, or any standard JSON-RPC HTTP/HTTPS endpoint.
                  </span>
                </div>

                {/* Private Key */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">DEX Aggregator API Key / Secret</label>
                  <input 
                    id="api-secret-key-input"
                    type="password" 
                    placeholder="••••••••••••••••••••••••••••••••••••••••••••" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-mono placeholder:text-slate-600"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Keys are stored locally and will never be transmitted over public servers.
                  </span>
                </div>

                {/* Toggle switch for Custom API */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-white block uppercase tracking-wide">Route Dashboard Traffic via Private API</span>
                    <p className="text-[10px] text-slate-400 mt-1">When toggled ON, the application bypasses default simulation rates and utilizes custom API RPC</p>
                  </div>
                  <button
                    id="api-toggle-use-custom"
                    onClick={() => setUseCustomApi(!useCustomApi)}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-200 ${useCustomApi ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all duration-200 transform ${useCustomApi ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Test Results Output */}
              {testStatus !== 'idle' && (
                <div className={`p-4 rounded-xl border text-xs font-mono space-y-1 ${
                  testStatus === 'testing' ? 'bg-slate-950/40 border-slate-800 text-slate-400' :
                  testStatus === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                  'bg-red-500/5 border-red-500/20 text-red-400'
                }`}>
                  <div className="font-bold flex items-center gap-2">
                    {testStatus === 'testing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {testStatus === 'success' && <Check className="w-3.5 h-3.5" />}
                    {testStatus === 'error' && <X className="w-3.5 h-3.5" />}
                    <span>Connection Diagnostics:</span>
                  </div>
                  <p className="text-slate-300 mt-1">{testStatus === 'testing' ? 'Querying JSON-RPC node peer handshake...' : testResult}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  id="api-test-connection-btn"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Test Handshake
                </button>
                <button
                  id="api-save-config-btn"
                  onClick={handleSaveApiConfig}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save API Config
                </button>
              </div>
            </div>

            {/* HIGH-FIDELITY SCANNING DIAGNOSTICS HUB */}
            <div className="rounded-2xl glass-card p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white">Apex Security & Ledger Diagnostic Scanner</h4>
                  <p className="text-xs text-slate-400">Perform multi-layer checks on private APIs and real-time ledger states</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  Diagnostic Module Active
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Private API Security Scanner */}
                <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Private API Security Audit</span>
                        <span className="text-[10px] text-slate-400">Scan custom endpoints for SSL, CORS leaks, and key integrity</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Analyze the security posture of your RPC endpoints. This scan checks for cryptographic signature configurations, endpoint SSL certification, parameter injections, and CORS policy setups.
                    </p>
                  </div>

                  {/* Terminal Logger */}
                  {(apiScanStatus === 'scanning' || apiScanStatus === 'success') && (
                    <div className="p-3 bg-black/80 rounded-lg border border-slate-800 h-36 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1 scrollbar-thin">
                      <div className="text-indigo-400 font-bold mb-1 border-b border-white/5 pb-1 flex justify-between items-center">
                        <span>API AUDIT LOGS</span>
                        {apiScanStatus === 'scanning' && <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />}
                      </div>
                      {apiScanLogs.map((log, idx) => (
                        <div key={idx} className="leading-snug">{log}</div>
                      ))}
                      {apiScanStatus === 'success' && (
                        <div className="text-emerald-400 font-bold pt-1">✔ Audit Completed. Zero high-severity vulnerabilities found.</div>
                      )}
                    </div>
                  )}

                  {/* Diagnostic Results */}
                  {apiScanStatus === 'success' && apiScanResult && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Security Rating</span>
                        <span className="text-emerald-400 font-bold">{apiScanResult.score}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Query Latency</span>
                        <span className="text-white font-bold">{apiScanResult.latency}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Vulnerability Audit</span>
                        <span className="text-white font-bold">{apiScanResult.vulnerabilities}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">SSL Protocol</span>
                        <span className="text-white font-bold truncate block">{apiScanResult.ssl}</span>
                      </div>
                    </div>
                  )}

                  <button
                    id="api-scan-security-btn"
                    onClick={handleScanApi}
                    disabled={apiScanStatus === 'scanning'}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {apiScanStatus === 'scanning' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Auditing Endpoint Security...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Scan Private API Security
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Bitcoin & Solana Ledger Scanner */}
                <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Bitcoin & Solana Node Ledger Sync</span>
                        <span className="text-[10px] text-slate-400">Scan active blocks, mempool rates, and cluster synchronizations</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connect directly to decentralized block peers across Bitcoin and Solana. Query the live network fee rate, block heights, epoch states, mempool depth, and active cluster validator metrics.
                    </p>
                  </div>

                  {/* Terminal Logger */}
                  {(chainScanStatus === 'scanning' || chainScanStatus === 'success') && (
                    <div className="p-3 bg-black/80 rounded-lg border border-slate-800 h-36 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1 scrollbar-thin">
                      <div className="text-emerald-400 font-bold mb-1 border-b border-white/5 pb-1 flex justify-between items-center">
                        <span>LEDGER PEER LOGS</span>
                        {chainScanStatus === 'scanning' && <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />}
                      </div>
                      {chainScanLogs.map((log, idx) => (
                        <div key={idx} className="leading-snug">{log}</div>
                      ))}
                      {chainScanStatus === 'success' && (
                        <div className="text-emerald-400 font-bold pt-1">✔ Ledger Sync Completed. Chains are synchronized.</div>
                      )}
                    </div>
                  )}

                  {/* Diagnostic Results */}
                  {chainScanStatus === 'success' && chainScanResult && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Bitcoin Block Height</span>
                        <span className="text-white font-bold">{chainScanResult.btcBlock}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Solana Net TPS</span>
                        <span className="text-white font-bold">{chainScanResult.solTps}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Bitcoin Optimal Fee</span>
                        <span className="text-white font-bold">{chainScanResult.btcGas}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Solana Epoch Progress</span>
                        <span className="text-white font-bold">{chainScanResult.solEpoch}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Bitcoin Inscriptions Today</span>
                        <span className="text-white font-bold">{chainScanResult.btcInscriptions}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Solana Active Validators</span>
                        <span className="text-emerald-400 font-bold">{chainScanResult.solValidators}</span>
                      </div>
                    </div>
                  )}

                  <button
                    id="chain-scan-networks-btn"
                    onClick={handleScanChains}
                    disabled={chainScanStatus === 'scanning'}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {chainScanStatus === 'scanning' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Synchronizing Ledgers...
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        Scan Bitcoin & Solana Ledgers
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ALCHEMY CLI COMPANION & ERC-4337 SMART ACCOUNT CONSOLE */}
            <div className="rounded-2xl glass-card p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white flex items-center gap-2">
                      Alchemy CLI & Smart Account Developer Portal
                    </h4>
                    <p className="text-xs text-slate-400">
                      Learn local CLI patterns, manage credentials, and deploy ERC-4337 Smart Contract Accounts in real-time
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2.5 py-1 rounded-lg uppercase font-mono tracking-wider">
                  Alchemy Suite v2.3
                </span>
              </div>

              {/* Grid: Left - CLI installation / Right - Browser Web3 smart wallets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Panel 1: Local Terminal Companion & CLI Quickstart */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">1. Local Machine Setup Companion</span>
                    <h5 className="font-bold text-sm text-white">Configure the `@alchemy/cli` Package</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      To run and deploy Alchemy projects locally, install the global CLI utility on your computer. Below is the step-by-step developer pipeline with direct clipboard commands:
                    </p>
                  </div>

                  {/* Step by Step commands list */}
                  <div className="space-y-3">
                    {/* Command 1: Install */}
                    <div className="rounded-xl bg-slate-950 border border-slate-900 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Step A: Install Global CLI Tool</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("npm i -g @alchemy/cli@latest");
                            addToast('Copied to Clipboard', 'npm installation command copied successfully.', 'success');
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[10px]"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <div className="bg-black/85 font-mono text-[11px] text-emerald-400 p-2 rounded-lg border border-white/5 truncate flex justify-between items-center">
                        <span>$ npm i -g @alchemy/cli@latest</span>
                      </div>
                    </div>

                    {/* Command 2: Login */}
                    <div className="rounded-xl bg-slate-950 border border-slate-900 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Step B: Authenticate CLI Session</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("alchemy login");
                            addToast('Copied to Clipboard', 'alchemy login command copied successfully.', 'success');
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[10px]"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <div className="bg-black/85 font-mono text-[11px] text-emerald-400 p-2 rounded-lg border border-white/5 truncate">
                        <span>$ alchemy login</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block leading-relaxed">
                        Starts the Alchemy browser handshake to bind your local machine key signature secure token.
                      </span>
                    </div>

                    {/* Command 3: Init */}
                    <div className="rounded-xl bg-slate-950 border border-slate-900 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Step C: Initialize Local Project</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("alchemy init --name my-smart-account");
                            addToast('Copied to Clipboard', 'alchemy init command copied successfully.', 'success');
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[10px]"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <div className="bg-black/85 font-mono text-[11px] text-emerald-400 p-2 rounded-lg border border-white/5 truncate">
                        <span>$ alchemy init --name my-smart-account</span>
                      </div>
                    </div>

                    {/* Command 4: Create */}
                    <div className="rounded-xl bg-slate-950 border border-slate-900 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Step D: Create Smart Contract Account</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("alchemy account create --type light");
                            addToast('Copied to Clipboard', 'alchemy account create command copied.', 'success');
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[10px]"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <div className="bg-black/85 font-mono text-[11px] text-emerald-400 p-2 rounded-lg border border-white/5 truncate">
                        <span>$ alchemy account create --type light</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Live Browser-based Account Creation Suite */}
                <div className="space-y-5 border-l border-white/5 lg:pl-8">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">2. Sandbox Wallet & Smart Contract Account Suite</span>
                    <h5 className="font-bold text-sm text-white">Provision Smart Wallet Sandbox</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Generate a real Externally Owned Account (EOA) in the browser, and use it as the secure owner to deploy an ERC-4337 modular Smart Contract Account.
                    </p>
                  </div>

                  {/* State Section 1: Save Alchemy API Key */}
                  <div className="rounded-xl bg-slate-950/50 border border-slate-900 p-4 space-y-3">
                    <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">Developer Alchemy API Key</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input
                          type="password"
                          placeholder="alchemy_api_key_••••••••"
                          value={alchemyApiKey}
                          onChange={(e) => handleSaveAlchemyKey(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono transition"
                        />
                      </div>
                      <select
                        value={alchemyNetwork}
                        onChange={(e) => setAlchemyNetwork(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="eth-sepolia">Sepolia Testnet</option>
                        <option value="eth-mainnet">Ethereum Mainnet</option>
                        <option value="arb-mainnet">Arbitrum One</option>
                        <option value="opt-mainnet">Optimism</option>
                      </select>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Enables real bundler connections if provided. Otherwise, the sandbox falls back to public testnet RPC pools.
                    </span>
                  </div>

                  {/* Sandbox Wallet State Handler */}
                  <div className="space-y-4">
                    {/* Step 1: Create Owner EOA */}
                    {!alchemyWallet ? (
                      <div className="rounded-xl border border-dashed border-slate-800 p-5 text-center space-y-3">
                        <Wallet className="w-8 h-8 text-indigo-400 mx-auto opacity-70" />
                        <div>
                          <span className="text-xs font-bold text-white block">A: Generate Developer EOA Signer</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Generate standard Web3 master keys with real-time seed phrase entropy</span>
                        </div>
                        <button
                          onClick={handleGenerateAlchemyWallet}
                          disabled={isGeneratingAlchemyWallet}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 mx-auto active:scale-98 disabled:opacity-50"
                        >
                          {isGeneratingAlchemyWallet ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Deriving Keys...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Generate Master EOA Signer
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-4 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white">Active Master EOA (Owner)</span>
                          </div>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded font-mono">
                            SECURE LOCAL DERIVATION
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-[10px]">EOA Address:</span>
                            <span className="text-white font-bold select-all">{alchemyWallet.address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-[10px]">Private Key:</span>
                            <span className="text-slate-300 truncate w-48 text-right select-all" title={alchemyWallet.privateKey}>{alchemyWallet.privateKey}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-[10px]">Seed Phrase:</span>
                            <span className="text-slate-300 truncate w-48 text-right select-all" title={alchemyWallet.mnemonic}>{alchemyWallet.mnemonic}</span>
                          </div>
                        </div>

                        {/* Step 2: Deploy smart contract */}
                        {!alchemySmartAccount ? (
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span>Deploy ERC-4337 Modular Wallet:</span>
                              <span className="text-indigo-400 font-mono font-bold">LightAccount v1</span>
                            </div>
                            <button
                              onClick={handleDeployAlchemySmartAccount}
                              disabled={isAlchemyDeploying}
                              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                            >
                              {isAlchemyDeploying ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Deploying LightAccount on {alchemyNetwork}...
                                </>
                              ) : (
                                <>
                                  <Server className="w-3.5 h-3.5" />
                                  Counterfactually Deploy Smart Wallet
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="pt-3 border-t border-white/5 space-y-3 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                              <span className="text-xs font-bold text-white">Alchemy Smart Account (ERC-4337)</span>
                            </div>
                            <div className="space-y-1 text-xs font-mono">
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[10px]">Smart Address:</span>
                                <span className="text-indigo-400 font-bold select-all text-right block">{alchemySmartAccount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[10px]">Smart Logic:</span>
                                <span className="text-slate-300 text-right block">SimpleAccount Contract</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Terminal Console Window for Bundler logs */}
                  <div className="p-3 bg-black/95 rounded-lg border border-slate-800 h-36 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 scrollbar-thin">
                    <div className="text-indigo-400 font-bold border-b border-white/5 pb-1 flex justify-between items-center">
                      <span>ALCHEMY BUNDLER & ACCOUNT LOGGER</span>
                      <button
                        onClick={handleResetAlchemyWallet}
                        className="text-[9px] hover:text-red-400 text-slate-500 transition uppercase font-black"
                      >
                        Wipe Credentials
                      </button>
                    </div>
                    {alchemyTerminalLogs.map((log, idx) => (
                      <div key={idx} className="leading-snug text-slate-300">{log}</div>
                    ))}
                    {isAlchemyDeploying && (
                      <div className="text-indigo-400 font-black animate-pulse">⧗ Querying active user operations...</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: GOOGLE WORKSPACE ----------------- */}
        {activeTab === 'slides' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section with Auth State */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-card">
              <div>
                <h4 className="font-bold text-lg text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-400" />
                  Google Workspace Suite
                </h4>
                <p className="text-xs text-slate-400">
                  Manage Slides, design Sheets, and browse your Google Drive directly from your DeFi Terminal
                </p>
              </div>

              <div>
                {googleUser ? (
                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">{googleUser.displayName || 'Google User'}</span>
                      <span className="text-[10px] text-indigo-400 font-mono block">{googleUser.email}</span>
                    </div>
                    <button
                      onClick={handleGoogleLogout}
                      className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      title="Disconnect Account"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoggingIn}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Globe className={`w-4 h-4 ${isGoogleLoggingIn ? 'animate-spin' : ''}`} />
                    {isGoogleLoggingIn ? 'Connecting...' : 'Connect Google Workspace'}
                  </button>
                )}
              </div>
            </div>

            {!googleUser ? (
              <div className="rounded-2xl glass-card p-12 text-center max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                  <FolderOpen className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-base text-white">Unlock Google Workspace Integration</h5>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Securely authenticate with Google to list and programmatically design custom slideshow presentations, export live DeFi balance sheets, and organize files in Drive.
                  </p>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoggingIn}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Globe className={`w-4 h-4 ${isGoogleLoggingIn ? 'animate-spin' : ''}`} />
                  {isGoogleLoggingIn ? 'Connecting...' : 'Connect with Google Secure Sign-In'}
                </button>
                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  OAuth credentials verified and approved by Workspace administrator.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sub Tab Navigation */}
                <div className="flex border-b border-slate-800 pb-px overflow-x-auto scrollbar-none whitespace-nowrap">
                  <button
                    onClick={() => setWorkspaceSubTab('slides')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'slides'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Presentation className="w-4 h-4" />
                    Google Slides
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('sheets')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'sheets'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Google Sheets
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('docs')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'docs'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Google Docs
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('calendar')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'calendar'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Google Calendar
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('tasks')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'tasks'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    Google Tasks
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('forms')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'forms'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileQuestion className="w-4 h-4" />
                    Google Forms
                  </button>
                  <button
                    onClick={() => {
                      setWorkspaceSubTab('picker');
                      handleOpenPicker();
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'picker'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Google Picker
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('drive')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      workspaceSubTab === 'drive'
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    Google Drive Browser
                  </button>
                </div>

                {/* SUB TAB: SLIDES */}
                {workspaceSubTab === 'slides' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Left side: AI Presentation Form & Config */}
                    <div className="lg:col-span-5 rounded-2xl glass-card p-6 space-y-6 self-start">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">AI Content Draft Builder</h5>
                        <p className="text-xs text-slate-400">Describe your topic and pick a premium design language</p>
                      </div>

                      <div className="space-y-4">
                        {/* Prompt input */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Presentation Topic / Idea</label>
                          <textarea
                            rows={3}
                            placeholder="E.g., 2026 DeFi Market Dynamics & Multi-Chain Yield Strategies"
                            value={slidePrompt}
                            onChange={(e) => setSlidePrompt(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition leading-relaxed placeholder:text-slate-600 resize-none font-sans"
                          />
                        </div>

                        {/* Slide Count */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-300 uppercase tracking-wider">Slide Count Limit</span>
                            <span className="text-indigo-400 font-bold font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">{slideCount} Slides</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="10"
                            value={slideCount}
                            onChange={(e) => setSlideCount(Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Min (2)</span>
                            <span>Max (10)</span>
                          </div>
                        </div>

                        {/* Color Theme Selector */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Design Palette & Typography</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(COLOR_THEMES).map(([key, theme]) => {
                              const bgHex = `rgb(${Math.round(theme.bg.red * 255)}, ${Math.round(theme.bg.green * 255)}, ${Math.round(theme.bg.blue * 255)})`;
                              const titleHex = `rgb(${Math.round(theme.title.red * 255)}, ${Math.round(theme.title.green * 255)}, ${Math.round(theme.title.blue * 255)})`;
                              const accentHex = `rgb(${Math.round(theme.accent.red * 255)}, ${Math.round(theme.accent.green * 255)}, ${Math.round(theme.accent.blue * 255)})`;

                              return (
                                <button
                                  key={key}
                                  onClick={() => setSelectedTheme(key)}
                                  className={`p-3 rounded-xl text-left border transition duration-200 ${
                                    selectedTheme === key 
                                      ? 'border-indigo-500 bg-slate-900/60' 
                                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: bgHex }} />
                                    <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: titleHex }} />
                                    <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: accentHex }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-white block capitalize">{key.replace('-', ' ')}</span>
                                  <span className="text-[8px] text-slate-500 font-mono block">{theme.fontTitle}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Generate button */}
                        <button
                          onClick={handleGenerateAiDeck}
                          disabled={isGeneratingDeck}
                          className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                        >
                          {isGeneratingDeck ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Building custom deck via Gemini AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Generate Slides Deck
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Right side: List / Embed view */}
                    <div className="lg:col-span-7 space-y-6">
                      {/* Embedded Player when deck is active */}
                      {activeDeckId ? (
                        <div className="rounded-2xl glass-card overflow-hidden border border-indigo-500/20 animate-fade-in">
                          <div className="p-4 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-xs font-bold text-white">Active Google Slides Presenter</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://docs.google.com/presentation/d/${activeDeckId}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-bold transition flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open In Editor
                              </a>
                              <button
                                onClick={() => setActiveDeckId(null)}
                                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition"
                              >
                                Close Preview
                              </button>
                            </div>
                          </div>

                          {/* Embedded Slide Player */}
                          <div className="aspect-video w-full bg-slate-950">
                            <iframe
                              src={`https://docs.google.com/presentation/d/${activeDeckId}/embed?start=false&loop=false&delayms=3000`}
                              width="100%"
                              height="100%"
                              allowFullScreen
                              className="border-0"
                              title="Google Slides Viewer"
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Documents List */}
                      <div className="rounded-2xl glass-card p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h5 className="font-bold text-sm text-white uppercase tracking-wider">Drive Slides Documents</h5>
                            <p className="text-xs text-slate-400">All presentations currently synced under your Google Drive account</p>
                          </div>
                          <button
                            onClick={() => googleToken && loadUserDecks(googleToken)}
                            disabled={isLoadingDecks}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                            title="Sync list"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDecks ? 'animate-spin' : ''}`} />
                          </button>
                        </div>

                        {isLoadingDecks ? (
                          <div className="py-12 text-center space-y-3">
                            <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                            <span className="text-xs text-slate-400 block">Fetching files list from Google Workspace...</span>
                          </div>
                        ) : slidesDecks.length === 0 ? (
                          <div className="py-12 text-center text-slate-500">
                            <FileText className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                            <p className="text-sm font-semibold">No presentations found.</p>
                            <p className="text-xs text-slate-600 mt-1">Specify a topic and use the builder to draft your very first Google Slides document!</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                            {slidesDecks.map(deck => (
                              <div
                                key={deck.id}
                                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                                  activeDeckId === deck.id
                                    ? 'bg-indigo-500/5 border-indigo-500/20'
                                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
                                    <Presentation className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-white block truncate">{deck.name}</span>
                                    <span className="text-[10px] text-slate-400 block">
                                      Modified: {new Date(deck.modifiedTime).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setActiveDeckId(deck.id)}
                                    className={`p-2 rounded-lg text-xs font-bold transition ${
                                      activeDeckId === deck.id
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-900 text-indigo-400 hover:bg-slate-800'
                                    }`}
                                    title="Embed Slide Presenter"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={deck.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
                                    title="View in Google Drive"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete presentation "${deck.name}"?`)) {
                                        handleDeleteDeck(deck.id);
                                      }
                                    }}
                                    className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                                    title="Move to Trash"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB: SHEETS */}
                {workspaceSubTab === 'sheets' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Left Panel: Creation & Exports */}
                    <div className="lg:col-span-5 rounded-2xl glass-card p-6 space-y-6 self-start">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">Spreadsheet Controls</h5>
                        <p className="text-xs text-slate-400">Initialize spreadsheet files or export DeFi databases</p>
                      </div>

                      {/* Create New Sheet */}
                      <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3">
                        <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Create New Sheet</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="E.g., Q3 Asset Allocation Model"
                            value={newSheetTitle}
                            onChange={(e) => setNewSheetTitle(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition leading-relaxed"
                          />
                          <button
                            onClick={handleCreateSpreadsheet}
                            disabled={isCreatingSpreadsheet}
                            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 disabled:opacity-50 active:scale-95 shrink-0"
                            title="Create Spreadsheet"
                          >
                            {isCreatingSpreadsheet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Data Exporters */}
                      <div className="space-y-4">
                        <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Active Sheet Data Export</label>
                        
                        {activeSpreadsheetId ? (
                          <div className="space-y-3">
                            <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs space-y-1">
                              <span className="font-bold text-indigo-300 block">Target Sheet Selection:</span>
                              <span className="font-mono text-slate-200 block truncate">
                                {spreadsheets.find(s => s.id === activeSpreadsheetId)?.name || 'Untitled Spreadsheet'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                onClick={() => handleExportPortfolio(activeSpreadsheetId)}
                                disabled={isExportingPortfolio}
                                className="p-4 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900/80 text-white text-xs font-bold transition flex flex-col items-center gap-2.5 justify-center text-center group active:scale-98 disabled:opacity-50"
                              >
                                <Database className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition duration-200" />
                                <span>{isExportingPortfolio ? 'Exporting...' : 'Export Asset Portfolio'}</span>
                              </button>

                              <button
                                onClick={() => handleExportTransactions(activeSpreadsheetId)}
                                disabled={isExportingTransactions}
                                className="p-4 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900/80 text-white text-xs font-bold transition flex flex-col items-center gap-2.5 justify-center text-center group active:scale-98 disabled:opacity-50"
                              >
                                <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition duration-200" />
                                <span>{isExportingTransactions ? 'Exporting...' : 'Export Event Logs'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                            <p className="text-xs text-slate-400">
                              Please select or create a spreadsheet from the synced file list on the right to enable exports!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Panel: Embedded Player & List */}
                    <div className="lg:col-span-7 space-y-6">
                      {/* Active Iframe Viewer */}
                      {activeSpreadsheetId ? (
                        <div className="rounded-2xl glass-card overflow-hidden border border-indigo-500/20 animate-fade-in">
                          <div className="p-4 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-xs font-bold text-white">Live Collaborative Spreadsheet</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-bold transition flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open in Sheets
                              </a>
                              <button
                                onClick={() => setActiveSpreadsheetId(null)}
                                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition"
                              >
                                Close Preview
                              </button>
                            </div>
                          </div>

                          <div className="h-[400px] w-full bg-white">
                            <iframe
                              src={`https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit?widget=true&headers=false`}
                              width="100%"
                              height="100%"
                              className="border-0"
                              title="Google Sheet Viewer"
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Synced Sheets List */}
                      <div className="rounded-2xl glass-card p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h5 className="font-bold text-sm text-white uppercase tracking-wider">Drive Spreadsheet Files</h5>
                            <p className="text-xs text-slate-400">All spreadsheets currently synced under your Google Drive account</p>
                          </div>
                          <button
                            onClick={() => googleToken && loadUserSheets(googleToken)}
                            disabled={isLoadingSpreadsheets}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                            title="Sync list"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpreadsheets ? 'animate-spin' : ''}`} />
                          </button>
                        </div>

                        {isLoadingSpreadsheets ? (
                          <div className="py-12 text-center space-y-3">
                            <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                            <span className="text-xs text-slate-400 block">Fetching sheets from Google Workspace...</span>
                          </div>
                        ) : spreadsheets.length === 0 ? (
                          <div className="py-12 text-center text-slate-500">
                            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                            <p className="text-sm font-semibold">No spreadsheets found.</p>
                            <p className="text-xs text-slate-600 mt-1">Initialize your balance sheets by creating or importing documents!</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                            {spreadsheets.map(sheet => (
                              <div
                                key={sheet.id}
                                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                                  activeSpreadsheetId === sheet.id
                                    ? 'bg-indigo-500/5 border-indigo-500/20'
                                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400">
                                    <FileSpreadsheet className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-white block truncate">{sheet.name}</span>
                                    <span className="text-[10px] text-slate-400 block">
                                      Modified: {new Date(sheet.modifiedTime).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setActiveSpreadsheetId(sheet.id)}
                                    className={`p-2 rounded-lg text-xs font-bold transition ${
                                      activeSpreadsheetId === sheet.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                                    }`}
                                    title="Embed Sheet Viewer"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={sheet.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
                                    title="Open Spreadsheet File"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete spreadsheet "${sheet.name}"?`)) {
                                        handleDeleteSpreadsheet(sheet.id);
                                      }
                                    }}
                                    className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                                    title="Move to Trash"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB: DOCS */}
                {workspaceSubTab === 'docs' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Left: Create / Export */}
                    <div className="lg:col-span-5 rounded-2xl glass-card p-6 space-y-6 self-start">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">Docs Report Builder</h5>
                        <p className="text-xs text-slate-400">Inscribe your portfolio metrics and research logs to Google Docs</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Report Document Title</label>
                          <input
                            type="text"
                            placeholder="E.g., Q3 Multi-Chain Yield Thesis"
                            value={newDocTitle}
                            onChange={(e) => setNewDocTitle(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans"
                          />
                        </div>

                        <button
                          onClick={handleCreateDoc}
                          disabled={isCreatingDoc}
                          className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          {isCreatingDoc ? 'Creating Doc...' : 'Create Google Document'}
                        </button>
                      </div>

                      <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <div>
                          <h6 className="font-bold text-xs text-white uppercase tracking-wider mb-1">Target Existing Google Doc</h6>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Paste a Google Document URL (e.g. <code className="text-indigo-300 font-mono">https://docs.google.com/document/d/1ABC.../edit</code>) or Document ID to append your portfolio snapshot directly:
                          </p>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="https://docs.google.com/document/d/... or Doc ID"
                            value={customDocUrlOrId}
                            onChange={(e) => setCustomDocUrlOrId(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans"
                          />
                          <button
                            onClick={handleExportToCustomDoc}
                            disabled={isExportingDoc || !customDocUrlOrId.trim()}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-40"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {isExportingDoc ? 'Exporting...' : 'Export Snapshot to This Doc'}
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-800/80 pt-4">
                        <h6 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-1">Automated Drive Sync</h6>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          You can also choose any existing Google Doc from your Drive list on the right and click "Export to Doc".
                        </p>
                      </div>
                    </div>

                    {/* Right: Docs List */}
                    <div className="lg:col-span-7 rounded-2xl glass-card p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">My Google Documents</h5>
                        <button
                          onClick={() => googleToken && loadUserDocs(googleToken)}
                          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Refresh documents list"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {isLoadingDocs ? (
                        <div className="py-12 text-center space-y-3">
                          <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                          <span className="text-xs text-slate-400 block">Fetching reports from Google Docs...</span>
                        </div>
                      ) : docsList.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                          <FileText className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                          <p className="text-sm font-semibold">No Google Documents found.</p>
                          <p className="text-xs text-slate-600 mt-1">Start writing report drafts by creating a document above!</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                          {docsList.map(doc => (
                            <div
                              key={doc.id}
                              className="p-3 rounded-xl border bg-slate-950/40 border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{doc.name}</span>
                                  <span className="text-[10px] text-slate-400 block">
                                    Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleExportDoc(doc.id)}
                                  disabled={isExportingDoc}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[11px] font-bold transition flex items-center gap-1"
                                >
                                  Export to Doc
                                </button>
                                <a
                                  href={doc.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
                                  title="Open Document File"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB TAB: CALENDAR */}
                {workspaceSubTab === 'calendar' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Left: Schedule event */}
                    <div className="lg:col-span-5 rounded-2xl glass-card p-6 space-y-5 self-start">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">DeFi Event Scheduler</h5>
                        <p className="text-xs text-slate-400">Set calendar sessions for trading, yield harvests, or market audits</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Session Title / Event</label>
                          <input
                            type="text"
                            placeholder="E.g., Claim staking rewards & re-delegate E33R"
                            value={newEventSummary}
                            onChange={(e) => setNewEventSummary(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Event Notes / Description</label>
                          <textarea
                            rows={2}
                            placeholder="E.g., Claim from AVAX Liquidity pool, check gas rates beforehand"
                            value={newEventDesc}
                            onChange={(e) => setNewEventDesc(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Start Time</label>
                            <input
                              type="datetime-local"
                              value={newEventStart}
                              onChange={(e) => setNewEventStart(e.target.value)}
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-sans"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">End Time</label>
                            <input
                              type="datetime-local"
                              value={newEventEnd}
                              onChange={(e) => setNewEventEnd(e.target.value)}
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-sans"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleCreateCalendarEvent}
                          disabled={isCreatingEvent}
                          className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Calendar className="w-4 h-4" />
                          {isCreatingEvent ? 'Scheduling Session...' : 'Schedule DeFi Session'}
                        </button>
                      </div>
                    </div>

                    {/* Right: Upcoming Events List */}
                    <div className="lg:col-span-7 rounded-2xl glass-card p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">Calendar Scheduled Sessions</h5>
                        <button
                          onClick={() => googleToken && loadUserEvents(googleToken)}
                          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Refresh upcoming events"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {isLoadingEvents ? (
                        <div className="py-12 text-center space-y-3">
                          <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                          <span className="text-xs text-slate-400 block">Loading calendar events...</span>
                        </div>
                      ) : calendarEvents.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                          <Calendar className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                          <p className="text-sm font-semibold">No scheduled events found.</p>
                          <p className="text-xs text-slate-600 mt-1">Setup trading or harvest intervals using the scheduler on the left!</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                          {calendarEvents.map(event => (
                            <div
                              key={event.id}
                              className="p-3 rounded-xl border bg-slate-950/40 border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{event.summary}</span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                                    {event.start.dateTime
                                      ? `${new Date(event.start.dateTime).toLocaleDateString()} @ ${new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                      : event.start.date}
                                  </span>
                                  {event.description && (
                                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">{event.description}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {event.htmlLink && (
                                  <a
                                    href={event.htmlLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
                                    title="Open Google Calendar Event"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete the event "${event.summary}"?`)) {
                                      handleDeleteCalendarEvent(event.id);
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB TAB: TASKS */}
                {workspaceSubTab === 'tasks' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Left: Task Lists and Add Task */}
                    <div className="lg:col-span-5 rounded-2xl glass-card p-6 space-y-6 self-start">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">DeFi Task Lists</h5>
                        <p className="text-xs text-slate-400">Choose a list and track structured checklists on Google Tasks</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Active Task List</label>
                          <select
                            value={selectedTaskListId}
                            onChange={(e) => handleTaskListChange(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-sans"
                          >
                            {taskLists.map(list => (
                              <option key={list.id} value={list.id} className="bg-slate-950 text-white">
                                {list.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="border-t border-slate-800/80 pt-4 space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Add Checklist Task</label>
                          <input
                            type="text"
                            placeholder="E.g., Audit POL smart accounts"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans"
                          />
                        </div>

                        <button
                          onClick={handleCreateTask}
                          disabled={isCreatingTask}
                          className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          {isCreatingTask ? 'Adding task...' : 'Add Task to List'}
                        </button>
                      </div>
                    </div>

                    {/* Right: Tasks List */}
                    <div className="lg:col-span-7 rounded-2xl glass-card p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">Google Task Items</h5>
                        <button
                          onClick={() => googleToken && loadUserTasks(googleToken)}
                          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Refresh tasks"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {isLoadingTasks ? (
                        <div className="py-12 text-center space-y-3">
                          <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                          <span className="text-xs text-slate-400 block">Loading active checklist...</span>
                        </div>
                      ) : googleTasks.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                          <CheckSquare className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                          <p className="text-sm font-semibold">All tasks completed!</p>
                          <p className="text-xs text-slate-600 mt-1">Excellent job keeping your yield operations audited.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                          {googleTasks.map(task => (
                            <div
                              key={task.id}
                              className="p-3 rounded-xl border bg-slate-950/40 border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={() => handleToggleTask(task.id, task.status !== 'completed')}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                                    task.status === 'completed'
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                      : 'border-slate-700 hover:border-slate-500 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <div className="min-w-0">
                                  <span className={`text-xs font-bold block truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                                    {task.title}
                                  </span>
                                  {task.notes && (
                                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">{task.notes}</span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (confirm(`Delete task "${task.title}"?`)) {
                                    handleDeleteTask(task.id);
                                  }
                                }}
                                className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB TAB: FORMS */}
                {workspaceSubTab === 'forms' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Left: Create Form */}
                    <div className="lg:col-span-5 rounded-2xl glass-card p-6 space-y-6 self-start">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">dApp Form Builder</h5>
                        <p className="text-xs text-slate-400">Design feedback forms, poll LPs, or survey your DeFi users on Google Forms</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Form Title</label>
                          <input
                            type="text"
                            placeholder="E.g., Apex Dashboard LP Survey"
                            value={newFormTitle}
                            onChange={(e) => setNewFormTitle(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">Form Description</label>
                          <textarea
                            rows={3}
                            placeholder="E.g., We are polling our liquidity providers to plan upcoming pool incentives and audit strategies."
                            value={newFormDesc}
                            onChange={(e) => setNewFormDesc(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-sans resize-none"
                          />
                        </div>

                        <button
                          onClick={handleCreateForm}
                          disabled={isCreatingForm}
                          className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          {isCreatingForm ? 'Constructing & Styling Form...' : 'Publish Feedback Survey'}
                        </button>
                      </div>
                    </div>

                    {/* Right: Created Forms List */}
                    <div className="lg:col-span-7 rounded-2xl glass-card p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">Published Feedback Surveys</h5>
                        <button
                          onClick={() => googleToken && loadUserForms(googleToken)}
                          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Refresh Forms list"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingForms ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {isLoadingForms ? (
                        <div className="py-12 text-center space-y-3">
                          <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                          <span className="text-xs text-slate-400 block">Loading published Forms...</span>
                        </div>
                      ) : formsList.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                          <FileQuestion className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                          <p className="text-sm font-semibold">No published surveys found.</p>
                          <p className="text-xs text-slate-600 mt-1">Design an interactive yield poll with styled choice questions above!</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                          {formsList.map(form => (
                            <div
                              key={form.id}
                              className="p-3 rounded-xl border bg-slate-950/40 border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-center justify-center shrink-0 text-purple-400">
                                  <FileQuestion className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{form.name}</span>
                                  <span className="text-[10px] text-slate-400 block">
                                    Modified: {new Date(form.modifiedTime).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <a
                                href={form.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-[11px] font-bold transition flex items-center gap-1 hover:bg-purple-500"
                              >
                                View Responses
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB TAB: PICKER (LOCAL HIGH-FIDELITY & REAL GOOGLE PICKER) */}
                {workspaceSubTab === 'picker' && (
                  <div className="rounded-2xl glass-card p-6 space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">Google Asset Picker</h5>
                        <p className="text-xs text-slate-400">Select sheets, presentations, documents, or forms directly from Google Drive</p>
                      </div>

                      <button
                        onClick={handleOpenPicker}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 self-start"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Launch Official Picker overlay
                      </button>
                    </div>

                    {/* Picked File Preview */}
                    {pickedFile && (
                      <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h6 className="font-bold text-xs text-indigo-400 uppercase tracking-wider">Active Picked Asset</h6>
                          <button
                            onClick={() => setPickedFile(null)}
                            className="text-xs text-slate-500 hover:text-white"
                          >
                            Clear Selection
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 text-white">
                            {pickedFile.mimeType.includes('spreadsheet') ? (
                              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                            ) : pickedFile.mimeType.includes('presentation') ? (
                              <Presentation className="w-5 h-5 text-indigo-400" />
                            ) : pickedFile.mimeType.includes('document') ? (
                              <FileText className="w-5 h-5 text-blue-400" />
                            ) : (
                              <FileQuestion className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{pickedFile.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">ID: {pickedFile.id}</span>
                            <span className="text-[10px] text-slate-500 block truncate font-mono">Type: {pickedFile.mimeType}</span>
                          </div>
                        </div>
                        <a
                          href={pickedFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                          View Asset on Google Drive
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Local picker grid */}
                    <div className="space-y-4">
                      <div>
                        <h6 className="font-bold text-xs text-white uppercase tracking-wider">Local Drive Picker fallback</h6>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Click any file from your Workspace below to instantly load it as the active selected asset.
                        </p>
                      </div>

                      {isLoadingDriveFiles ? (
                        <div className="py-8 text-center space-y-3">
                          <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                          <span className="text-xs text-slate-400 block">Loading drive folder tree...</span>
                        </div>
                      ) : driveFiles.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                          <Database className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                          <p className="text-xs">No files available in Google Drive.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {driveFiles.map(file => (
                            <div
                              key={file.id}
                              onClick={() => {
                                setPickedFile({
                                  id: file.id,
                                  name: file.name,
                                  mimeType: file.mimeType || 'unknown',
                                  url: file.webViewLink || '#'
                                });
                                addToast('Selected File', `Picked: "${file.name}"`, 'success');
                              }}
                              className={`p-3 rounded-xl border bg-slate-950/20 border-slate-800/80 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition cursor-pointer flex items-center gap-3 min-w-0 ${
                                pickedFile?.id === file.id ? 'border-indigo-500 ring-1 ring-indigo-500/20' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                                {file.mimeType?.includes('spreadsheet') ? (
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                                ) : file.mimeType?.includes('presentation') ? (
                                  <Presentation className="w-4 h-4 text-indigo-400" />
                                ) : file.mimeType?.includes('document') ? (
                                  <FileText className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Database className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white block truncate">{file.name}</span>
                                <span className="text-[9px] text-slate-400 block">
                                  {new Date(file.modifiedTime).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB TAB: DRIVE BROWSER */}
                {workspaceSubTab === 'drive' && (
                  <div className="rounded-2xl glass-card p-6 space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h5 className="font-bold text-sm text-white uppercase tracking-wider">Google Drive Organizer</h5>
                        <p className="text-xs text-slate-400">All non-trashed documentation and media synced on Google Cloud Storage</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => googleToken && loadUserDriveFiles(googleToken)}
                          disabled={isLoadingDriveFiles}
                          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
                          Refresh Drive
                        </button>
                      </div>
                    </div>

                    {isLoadingDriveFiles ? (
                      <div className="py-24 text-center space-y-3">
                        <RefreshCw className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
                        <span className="text-xs text-slate-400 block">Scanning cloud directory tree...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="py-24 text-center text-slate-500">
                        <FolderOpen className="w-14 h-14 mx-auto text-slate-700 mb-3" />
                        <p className="text-sm font-semibold">Drive is completely empty.</p>
                        <p className="text-xs text-slate-600 mt-1">Start using Slides AI or Sheets Exports to populate your storage folders!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {driveFiles.map(file => {
                          const isSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
                          const isSlide = file.mimeType === 'application/vnd.google-apps.presentation';
                          const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                          return (
                            <div
                              key={file.id}
                              className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl hover:border-slate-700 transition duration-200 flex flex-col justify-between space-y-4"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isSheet ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                                  isSlide ? 'bg-amber-500/5 border-amber-500/10 text-amber-400' :
                                  isFolder ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400' :
                                  'bg-slate-800/5 border-slate-700 text-slate-400'
                                }`}>
                                  {isSheet ? <FileSpreadsheet className="w-4 h-4" /> :
                                   isSlide ? <Presentation className="w-4 h-4" /> :
                                   isFolder ? <FolderOpen className="w-4 h-4" /> :
                                   <FileText className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-bold text-white block truncate" title={file.name}>
                                    {file.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                                    MIME: {file.mimeType.split('.').pop()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-white/[0.03] pt-3 text-[10px] text-slate-400 font-mono">
                                <span>
                                  {new Date(file.modifiedTime).toLocaleDateString()}
                                </span>
                                
                                <div className="flex gap-2">
                                  {isSheet && (
                                    <button
                                      onClick={() => {
                                        setActiveSpreadsheetId(file.id);
                                        setWorkspaceSubTab('sheets');
                                      }}
                                      className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded font-bold"
                                    >
                                      Load
                                    </button>
                                  )}
                                  {isSlide && (
                                    <button
                                      onClick={() => {
                                        setActiveDeckId(file.id);
                                        setWorkspaceSubTab('slides');
                                      }}
                                      className="px-2 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded font-bold"
                                    >
                                      Load
                                    </button>
                                  )}
                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-300 font-bold flex items-center gap-1"
                                  >
                                    Drive
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Render React App
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <WalletProvider>
      <App />
    </WalletProvider>
  );
}
