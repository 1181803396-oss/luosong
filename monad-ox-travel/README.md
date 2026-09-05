# 逃离工位 · Contracts

Foundry contracts for Monad Testnet (chain ID `10143`).

```bash
forge install --no-git OpenZeppelin/openzeppelin-contracts
forge install --no-git foundry-rs/forge-std
forge test
forge script script/Deploy.s.sol:Deploy \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --rpc-url https://testnet-rpc.monad.xyz
```

Never commit a private key. After deployment, copy both printed addresses into the frontend `.env.local`.

