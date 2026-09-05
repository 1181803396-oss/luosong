# 逃离工位 · Web

```bash
cp .env.local.example .env.local
# Fill in the deployed TravelNFT and RouteMarket addresses and a WalletConnect project ID.
npm install
npm run dev
```

Production build and Vercel deployment:

```bash
npm run build
npx vercel --prod
```

