# 🚀 Apex DeFi Dashboard & Workspace Intelligence

**Apex DeFi** is a high-fidelity, multi-chain DeFi dashboard and analytics suite powered by Gemini AI and Google Workspace integrations. It seamlessly connects Web3 portfolio tracking, cross-chain DEX swap monitoring, yield staking, inscription exploring, and automated Google Workspace reporting (Docs, Sheets, Slides, Calendar, Drive).

---

## ✨ Key Features

- **🌐 Multi-Chain Portfolio Tracking**: Real-time asset monitoring across Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Solana, and Bitcoin.
- **⚡ AI-Powered Market & Portfolio Intelligence**: Gemini 2.5 / 3.6 integration for automated smart contract auditing, portfolio risk assessment, and market sentiment analysis.
- **📊 Google Workspace Integrations**:
  - Export DeFi portfolio snapshots directly to **Google Docs**.
  - Append live yield metrics to **Google Sheets**.
  - Generate visual presentation decks in **Google Slides**.
  - Schedule rebalancing alerts & harvest reminders directly in **Google Calendar**.
  - Attach documents and media using **Google Picker**.
- **🔄 Cross-Chain Swap & Yield Aggregator**: Interactive interface for DEX trading, yield farming analytics, and staking pools.
- **🔐 Web3 Wallet Ready**: Native support for EVM wallets, seed vault interactions, and read-only address analytics.
- **☁️ Real-time Cloud Persistence**: Integrated with Firebase Firestore & Google Auth for saved preferences and portfolio snapshots.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (Framer), Recharts
- **Backend / Server**: Express, Node.js (CommonJS build via `esbuild`), `tsx`
- **AI & ML**: `@google/genai` (Gemini API)
- **Web3 & Crypto**: `ethers.js` v6, Multi-chain RPC helpers
- **Database & Auth**: Firebase Firestore, Firebase Authentication
- **Build System**: Vite, Esbuild, TypeScript (`tsc`)

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Node.js** (v18+ or v20+) installed.

### 2. Clone Repository & Install Dependencies

```bash
git clone https://github.com/your-username/apex-defi.git
cd apex-defi
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📦 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Express + Vite development server with TypeScript support (`tsx server.ts`) |
| `npm run build` | Builds client static assets and bundles `server.ts` into `dist/server.cjs` |
| `npm start` | Starts the production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## 🛡️ Security Note

- **API Keys**: Never commit your `.env` file or sensitive secrets to public repositories.
- **Web3 Vaults**: Always verify connected Web3 extensions or local seed vaults before signing transactions.

---

## 📄 License

This project is open-source and available under the MIT License.
