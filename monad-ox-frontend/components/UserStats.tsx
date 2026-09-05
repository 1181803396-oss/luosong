"use client";

import { useAccount, useReadContract } from "wagmi";
import { ROUTE_MARKET_ADDRESS, TRAVEL_NFT_ADDRESS, ZERO_ADDRESS, routeMarketAbi, travelNFTAbi } from "@/lib/constants";

export default function UserStats() {
  const { address, isConnected } = useAccount();
  const user = address ?? ZERO_ADDRESS;
  const enabled = isConnected && ROUTE_MARKET_ADDRESS !== ZERO_ADDRESS;
  const { data: points } = useReadContract({ address: ROUTE_MARKET_ADDRESS, abi: routeMarketAbi, functionName: "points", args: [user], query: { enabled } });
  const { data: unlocked } = useReadContract({ address: ROUTE_MARKET_ADDRESS, abi: routeMarketAbi, functionName: "getUserUnlockedRoutes", args: [user], query: { enabled } });
  const { data: completed } = useReadContract({ address: TRAVEL_NFT_ADDRESS, abi: travelNFTAbi, functionName: "balanceOf", args: [user], query: { enabled: isConnected && TRAVEL_NFT_ADDRESS !== ZERO_ADDRESS } });

  return <><footer className="stats-bar"><div><span>逃离积分</span><strong>{points?.toString() ?? "0"}</strong></div><div><span>已解锁</span><strong>{unlocked?.length ?? 0}<small> / 6</small></strong></div><div><span>NFT 徽章</span><strong>{completed?.toString() ?? "0"}<small> / 3</small></strong></div></footer>{isConnected && unlocked?.length === 0 && <div className="first-route-hint">还没有路线？从 0.001 MON 的 L1 开始第一次出逃 →</div>}</>;
}