"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletConnect() {
  return <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />;
}

