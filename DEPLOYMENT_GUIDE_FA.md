# راهنمای دپلویمنت و راه‌اندازی EthersAir Swap (Apex DeFi Dashboard)

این فایل راهنمای گام‌به‌گام راه‌اندازی، کامپایل، دیپلوی قراردادهای هوشمند، ایجاد استخر نقدینگی و میزبانی فرانت‌اند پروژه است.

---

## ۱. پیش‌نیازها و نصب ابزارها

### نصب Node.js یا Bun
از وب‌سایت رسمی [nodejs.org](https://nodejs.org) اقدام به دانلود و نصب کنید. 
یا برای سرعت بیشتر می‌توانید از **Bun** استفاده کنید:

```bash
curl -fsSL https://bun.sh/install | bash
```

### نصب Git
از وب‌سایت رسمی [git-scm.com](https://git-scm.com) دانلود و نصب کنید.

### نصب وابستگی‌های پروژه
وارد دایرکتوری پروژه شده و وابستگی‌ها را نصب کنید:

```bash
cd ethersair-swap
npm install
# یا با استفاده از bun:
bun install
```

---

## ۲. دریافت کلید خصوصی والت (Private Key) و دریافت ETH تستی

### روش ۱: دریافت از MetaMask
1. MetaMask را باز کنید.
2. روی سه نقطه کلیک کنید.
3. مسیر `Account Details > Export Private Key` را دنبال کنید.
4. کلید خصوصی خود را کپی کنید.
> ⚠️ **هشدار امنیتی:** هرگز این کلید را با کسی به اشتراک نگذارید!

### روش ۲: ساخت والت جدید با استفاده از کنسول Hardhat
```bash
npx hardhat console
```
سپس دستور زیر را در کنسول اجرا کنید:
```javascript
const wallet = ethers.Wallet.createRandom()
console.log(wallet.privateKey)
```

### دریافت ارز تستی Sepolia ETH
برای تست شبکه Sepolia به وب‌سایت‌های شیر آب (Faucet) زیر بروید و آدرس والت خود را برای دریافت کوین تستی رایگان وارد کنید:
* [Sepolia Faucet](https://sepoliafaucet.com)
* [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
* [QuickNode Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)

---

## ۳. تنظیم متغیرهای محیطی (Environment Variables)

### ۱. کپی کردن فایل نمونه
```bash
cp .env.example .env
```

### ۲. ویرایش فایل `.env`
فایل `.env` را با ویرایشگر باز کنید و مقادیر مربوطه را قرار دهید:

```env
# کلید خصوصی والت شما بدون پیشوند 0x
PRIVATE_KEY=your_private_key_here

# آدرس RPC شبکه Sepolia (از Alchemy یا Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# کلید ای‌پی‌آی Etherscan جهت تایید قرارداد
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### نحوه دریافت API Key از Alchemy:
1. به سایت [alchemy.com](https://www.alchemy.com) رفته و ثبت‌نام کنید (رایگان).
2. روی گزینه **Create App** کلیک کنید.
3. مشخصات زیر را تنظیم کنید:
   * **Name:** EthersAir
   * **Network:** Ethereum
   * **Chain:** Sepolia
4. گزینه **API Key** یا **HTTPS RPC URL** را کپی کرده و در فایل `.env` قرار دهید.

### نحوه دریافت API Key از Etherscan:
1. به سایت [etherscan.io](https://etherscan.io) رفته و ثبت‌نام کنید.
2. به بخش **API Keys** بروید.
3. روی دکمه **Create API Key** کلیک کنید.
4. مقدار تولید شده را کپی کرده و در فایل `.env` ذخیره نمایید.

---

## ۴. کامپایل، دپلوی و وریفای قراردادها با Hardhat

### نصب Hardhat و ابزارهای لازم
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv

# مقداردهی اولیه هارد هت (در صورت نیاز)
npx hardhat init
# گزینه "Create a JavaScript project" را انتخاب کنید.
```

### کامپایل قراردادها
```bash
npx hardhat compile
```

### دیپلوی روی شبکه Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```
⏳ منتظر بمانید تا تراکنش کامل شود (معمولاً ۱ الی ۲ دقیقه).

پس از اتمام موفق، خروجی مشابه زیر دریافت می‌کنید:
```text
═══════════════════════════════════════════════
✅ EthersAir Token deployed to: 0x1234...
✅ EthersAir Router deployed to: 0x5678...
═══════════════════════════════════════════════
```

### تایید رسمی کدها در Etherscan (Verify)
جهت عمومی‌سازی و وریفای سورس کد در مرورگر بلاکچین، دستورات زیر را اجرا کنید:

```bash
# تایید توکن
npx hardhat verify --network sepolia YOUR_TOKEN_ADDRESS

# تایید روتر
npx hardhat verify --network sepolia YOUR_ROUTER_ADDRESS
```

---

## ۵. اسکریپت راه‌اندازی استخر نقدینگی (scripts/setup-pool.js)

کد نمونه زیر را برای تعریف استخر نقدینگی اولیه و جفت ارز (Token / USDC) استفاده کنید:

```javascript
const hre = require("hardhat");

async function main() {
  const ROUTER_ADDRESS = "YOUR_ROUTER_ADDRESS_HERE";
  const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS_HERE";
  const USDC_ADDRESS = "0x..."; // آدرس قرارداد USDC در شبکه Sepolia
  
  const [deployer] = await hre.ethers.getSigners();
  
  // دریافت مراجع قراردادها
  const router = await hre.ethers.getContractAt("EthersAirRouter", ROUTER_ADDRESS);
  const token = await hre.ethers.getContractAt("EthersAirToken", TOKEN_ADDRESS);
  
  console.log("🏊 Creating pool...");
  const tx1 = await router.createPool(TOKEN_ADDRESS, USDC_ADDRESS);
  await tx1.wait();
  console.log("✅ Pool created!");
  
  console.log("💰 Adding liquidity...");
  
  // تایید دسترسی مصرف توکن‌ها (Approve)
  const amountToken = hre.ethers.parseUnits("10000", 18); // 10,000 ETHERSAIR
  const amountUSDC = hre.ethers.parseUnits("1000", 6);    // 1,000 USDC
  
  const tx2 = await token.approve(ROUTER_ADDRESS, amountToken);
  await tx2.wait();
  
  // افزودن نقدینگی به استخر
  const tx3 = await router.addLiquidity(
    TOKEN_ADDRESS,
    USDC_ADDRESS,
    amountToken,
    amountUSDC
  );
  await tx3.wait();
  
  console.log("✅ Liquidity added!");
  console.log("🎉 Setup complete! Ready to swap!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

اجرای اسکریپت ساخت استخر:
```bash
npx hardhat run scripts/setup-pool.js --network sepolia
```

---

## ۶. راه‌اندازی فرانت‌اند و اتصال کلاینت‌ها

### به‌روزرسانی آدرس قراردادها در فرانت‌اند
در فایل‌های کلاینت (مثلاً `src/App.jsx` یا فایل تنظیمات برنامه)، متغیرهای زیر را آپدیت کنید:
```javascript
const ETHERSAIR_TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS";
const ROUTER_ADDRESS = "YOUR_ROUTER_ADDRESS";
```

### ثبت‌نام و دریافت Privy App ID (برای لاگین کاربران)
1. به پنل [privy.io](https://privy.io) بروید.
2. یک اپلیکیشن جدید بسازید (**Create App**).
3. گزینه **App ID** را کپی کرده و آن را در کدهای فرانت‌اند قرار دهید:
   ```javascript
   appId="your-privy-app-id"
   ```

---

## ۷. دپلویمنت و میزبانی فرانت‌اند (روش‌های مختلف)

### روش ۱: استفاده از Vercel CLI
```bash
# نصب ابزار ورسل به صورت سراسری
npm i -g vercel

# ورود به حساب کاربری
vercel login

# بیلد پروژه
npm run build

# دیپلوی و آپلود بیلد نهایی
vercel --prod
```
سپس متغیرهای محیطی زیر را در داشبورد Vercel تنظیم کنید (`Settings > Environment Variables`):
* `VITE_PRIVY_APP_ID=your_privy_app_id`
* `VITE_ETHERSAIR_TOKEN_ADDRESS=0x...`
* `VITE_ROUTER_ADDRESS=0x...`

### روش ۲: استفاده از Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify login
netlify deploy --prod --dir=dist
```

### روش ۳: استفاده از GitHub Pages
۱. نصب بسته کمکی:
```bash
npm install --save-dev gh-pages
```

۲. افزودن دستور دیپلوی به فایل `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://USERNAME.github.io/ethersair-swap"
}
```

۳. ساخت مخزن گیت و آپلود پروژه:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/ethersair-swap.git
git push -u origin main
```

۴. اجرای دستور نهایی انتشار:
```bash
npm run deploy
```

---

## ۸. عیب‌یابی و برطرف کردن ارورهای متداول (Troubleshooting)

### خطای مربوط به نصب وابستگی‌ها و بیلد نشدن پروژه
**علت:** خرابی پکیج‌ها یا تداخل نسخه‌ها.  
**راه حل:** دستورات زیر را وارد کنید تا پوشه وابستگی‌ها پاک شده و مجدداً از نو نصب شود:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ارور: "Insufficient ETH"
**علت:** موجودی اتریوم والت تستی شما تمام شده یا بسیار کم است.  
**راه حل:** از وب‌سایت‌های شیر آب معرفی شده در گام دوم (Sepolia Faucets) اتریوم تستی رایگان دریافت کنید.

### تراکنش گیر کرده است (Stuck Transaction)
**علت:** شلوغی شبکه یا ناهماهنگی در Nonce تراکنش‌ها.  
**راه حل:** در افزونه متامسک والت خود را ریست کنید:  
`MetaMask Settings > Advanced > Reset Account`

### ارور: "Pool not created" یا "Zero Liquidity"
**علت:** هنوز استخر نقدینگی نساخته‌اید یا نقدینگی کافی برای سواپ شارژ نشده است.  
**راه حل:** مطمئن شوید اسکریپت `scripts/setup-pool.js` را به درستی و بدون ارور اجرا کرده‌اید.

---

## ۹. گام‌های انتقال به شبکه اصلی اتریوم (Ethereum Mainnet)

1. اتریوم واقعی (Real ETH) را خریداری کرده و به والت دپلور منتقل کنید.
2. فایل `.env` را برای شبکه اصلی پیکربندی کنید:
   ```env
   MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   PRIVATE_KEY=your_private_key_with_real_eth
   ```
3. اجرای فرمان انتشار رسمی قرارداد روی شبکه اصلی:
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```
4. تایید رسمی سورس کدها در شبکه اصلی:
   ```bash
   npx hardhat verify --network mainnet YOUR_TOKEN_ADDRESS
   npx hardhat verify --network mainnet YOUR_ROUTER_ADDRESS
   ```
5. اجرای اسکریپت شارژ نقدینگی واقعی:
   ```bash
   npx hardhat run scripts/setup-pool.js --network mainnet
   ```
6. آدرس قراردادها و متغیرهای فرانت‌اند را به مقادیر شبکه اصلی تغییر دهید و مجدداً فرانت‌اند را آپلود کنید.
