"use client";

import { useEffect, useRef, useState } from "react";
import { BaseError, formatEther, type Hash } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  ROUTE_MARKET_ADDRESS,
  TRAVEL_NFT_ADDRESS,
  routeMarketAbi,
  travelNFTAbi,
  type TravelRoute,
  ZERO_ADDRESS,
} from "@/lib/constants";

type Props = {
  route: TravelRoute;
  onSuccess: (route: TravelRoute, hash: Hash) => void;
};

function friendlyError(error: unknown) {
  const message = error instanceof BaseError ? error.shortMessage : error instanceof Error ? error.message : "未知错误";
  if (/reject|denied|cancel/i.test(message)) return "你取消了钱包授权，本次没有提交交易。";
  if (/insufficient|funds|balance/i.test(message)) return "MON 余额不足，请补充测试币后重试。";
  if (/chain|network|switch/i.test(message)) return "网络切换失败，请在钱包中手动选择 Monad Testnet。";
  if (/estimate|revert/i.test(message)) return "路线状态可能已变化，请刷新页面后重试。";
  return `操作失败：${message.slice(0, 90)}`;
}

export default function RouteCard({ route, onSuccess }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();
  const [localError, setLocalError] = useState<string>();
  const user = address ?? ZERO_ADDRESS;
  const contractsReady = ROUTE_MARKET_ADDRESS !== ZERO_ADDRESS && TRAVEL_NFT_ADDRESS !== ZERO_ADDRESS;

  const { data: unlocked, refetch: refetchUnlocked, isPending: isUnlockLoading } = useReadContract({
    address: ROUTE_MARKET_ADDRESS,
    abi: routeMarketAbi,
    functionName: "routeUnlocked",
    args: [BigInt(route.id), user],
    query: { enabled: isConnected && contractsReady },
  });
  const { data: completed, refetch: refetchCompleted, isPending: isCompleteLoading } = useReadContract({
    address: TRAVEL_NFT_ADDRESS,
    abi: travelNFTAbi,
    functionName: "hasCompletedLevel",
    args: [user, route.level],
    query: { enabled: isConnected && contractsReady },
  });
  const { data: previousCompleted, isPending: isPreviousLoading } = useReadContract({
    address: TRAVEL_NFT_ADDRESS,
    abi: travelNFTAbi,
    functionName: "hasCompletedLevel",
    args: [user, Math.max(0, route.level - 1)],
    query: { enabled: isConnected && contractsReady && route.level > 0 },
  });

  const canEnterLevel = route.level === 0 || previousCompleted === true;
  const publicClient = usePublicClient();
  const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
  const handledHash = useRef<Hash | undefined>(undefined);

  useEffect(() => {
    if (isSuccess && hash && handledHash.current !== hash) {
      handledHash.current = hash;
      void refetchUnlocked();
      void refetchCompleted();
      onSuccess(route, hash);
      reset();
    }
  }, [hash, isSuccess, onSuccess, refetchCompleted, refetchUnlocked, reset, route]);

  const submit = async () => {
    if (!address || !publicClient || !contractsReady || completed || !canEnterLevel) return;
    setLocalError(undefined);
    try {
      if (unlocked) {
        const estimate = await publicClient.estimateContractGas({ address: ROUTE_MARKET_ADDRESS, abi: routeMarketAbi, functionName: "completeRoute", args: [BigInt(route.id)], account: address });
        writeContract({ address: ROUTE_MARKET_ADDRESS, abi: routeMarketAbi, functionName: "completeRoute", args: [BigInt(route.id)], gas: estimate + estimate / 10n });
      } else {
        const estimate = await publicClient.estimateContractGas({ address: ROUTE_MARKET_ADDRESS, abi: routeMarketAbi, functionName: "unlockRoute", args: [BigInt(route.id)], account: address, value: route.price });
        writeContract({ address: ROUTE_MARKET_ADDRESS, abi: routeMarketAbi, functionName: "unlockRoute", args: [BigInt(route.id)], value: route.price, gas: estimate + estimate / 10n });
      }
    } catch (error) {
      setLocalError(friendlyError(error));
    }
  };

  const switchNetwork = () => {
    setLocalError(undefined);
    switchChain({ chainId: 10143 });
  };

  let buttonLabel = `解锁路线 · ${Number(formatEther(route.price)).toFixed(3)} MON`;
  if (!isConnected) buttonLabel = "连接钱包后解锁";
  else if (!contractsReady) buttonLabel = "请配置合约地址";
  else if (chainId !== 10143) buttonLabel = "切换至 Monad Testnet";
  else if (!canEnterLevel) buttonLabel = `完成 L${route.level} 后解锁`;
  else if (completed) buttonLabel = "已完成 ✓";
  else if (unlocked) buttonLabel = "确认打卡";
  if (isPending) buttonLabel = "等待钱包确认…";
  if (isConfirming) buttonLabel = "链上确认中…";
  if (isSwitching) buttonLabel = "正在切换网络…";

  const errorMessage = localError || (switchError ? friendlyError(switchError) : undefined) || (writeError ? friendlyError(writeError) : undefined) || (receiptError ? friendlyError(receiptError) : undefined);
  const dataLoading = isConnected && contractsReady && (isUnlockLoading || isCompleteLoading || (route.level > 0 && isPreviousLoading));

  if (dataLoading) {
    return <article className="route-card skeleton-card" aria-label="路线数据加载中"><div className="skeleton-art" /><div className="card-body"><i /><i /><i /><span>正在读取链上路线…</span></div></article>;
  }

  const status = completed ? "已完成" : unlocked ? "待打卡" : canEnterLevel ? "未解锁" : "等级未达成";

  return (
    <article className={`route-card level-${route.level + 1}`}>
      <div className="card-art" aria-hidden="true"><span>{route.emoji}</span><div className="level-pill">L{route.level + 1}</div><div className={`status-pill status-${status}`}>{status}</div></div>
      <div className="card-body">
        <div className="route-meta"><span>{route.category}</span><span>{route.duration}</span></div>
        <h3>{route.name}</h3><p className="subtitle">“{route.subtitle}”</p>
        <div className="reward-line"><span>完成奖励</span><strong>{(route.level + 1) * 100} 积分 + NFT</strong></div>
        <button className="action-button" type="button" onClick={chainId !== 10143 && isConnected ? switchNetwork : submit} disabled={!isConnected || !contractsReady || (chainId === 10143 && (!canEnterLevel || Boolean(completed))) || isPending || isConfirming || isSwitching}>{buttonLabel}</button>
        {errorMessage && <p className="tx-error" role="alert">{errorMessage}</p>}
      </div>
    </article>
  );
}