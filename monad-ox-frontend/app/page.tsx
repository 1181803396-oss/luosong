"use client";

import { useCallback, useState } from "react";
import type { Hash } from "viem";
import { useAccount } from "wagmi";
import WalletConnect from "@/components/WalletConnect";
import RouteGrid from "@/components/RouteGrid";
import UserStats from "@/components/UserStats";
import { ESCAPE_QUOTES, type TravelRoute } from "@/lib/constants";

type Category = "全部" | "人文" | "风景";
type Level = "全部" | 0 | 1 | 2;
type Success = { quote: string; route: TravelRoute; hash: Hash };

export default function Home() {
  const { isConnected } = useAccount();
  const [category, setCategory] = useState<Category>("全部");
  const [level, setLevel] = useState<Level>("全部");
  const [success, setSuccess] = useState<Success>();

  const showSuccess = useCallback((route: TravelRoute, hash: Hash) => {
    const quote = ESCAPE_QUOTES[Math.floor(Math.random() * ESCAPE_QUOTES.length)];
    setSuccess({ quote, route, hash });
  }, []);

  const shareSuccess = async () => {
    if (!success || !navigator.share) return;
    await navigator.share({ title: "逃离工位", text: `我完成了「${success.route.name}」，获得了 L${success.route.level + 1} 旅行 NFT！` });
  };

  return (
    <main>
      <nav className="nav-shell"><a className="logo" href="#top" aria-label="逃离工位首页"><span className="logo-mark">逃</span><span>逃离工位<small>ESCAPE THE DESK</small></span></a><WalletConnect /></nav>
      <div className="speed-banner">⚡ Monad 高速链：交易秒确认，Gas 费低至忽略不计</div>
      {!isConnected && <aside className="wallet-empty"><span>🧳</span><div><strong>连接钱包，开启第一次出逃</strong><p>解锁路线、链上打卡，把周末变成永久旅行徽章。</p></div><WalletConnect /></aside>}

      <section className="hero" id="top"><div className="eyebrow"><i /> MONAD TESTNET · 城市出逃计划</div><h1>人生是<span>旷野</span><br />不是工位</h1><p>给周末一点链上仪式感。解锁平价路线，完成真实打卡，<br className="desktop-only" />把每一次出逃铸成独一无二的旅行徽章。</p><a className="hero-cta" href="#routes">开始逃离 <span>↓</span></a><div className="hero-number">03</div></section>

      <section className="routes-section" id="routes">
        <div className="section-heading"><div><span className="section-index">01 / ROUTES</span><h2>选择你的出逃路线</h2></div><p>从一天喘息，到奔赴旷野。<br />每一级，都是自由的刻度。</p></div>
        <div className="filters" aria-label="路线筛选"><div className="filter-group">{(["全部", "人文", "风景"] as Category[]).map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="filter-group level-filter">{(["全部", 0, 1, 2] as Level[]).map((item) => <button key={item} className={level === item ? "active" : ""} onClick={() => setLevel(item)}>{item === "全部" ? "全部等级" : `L${item + 1}`}</button>)}</div></div>
        <RouteGrid category={category} level={level} onSuccess={showSuccess} />
      </section>

      <section className="how-it-works"><span className="section-index">02 / HOW IT WORKS</span><h2>三步，把周末还给自己</h2><div className="steps"><div><b>01</b><strong>连接钱包</strong><p>切换到 Monad Testnet，出逃身份即刻就绪。</p></div><div><b>02</b><strong>解锁路线</strong><p>从 0.001 MON 开始，穷游也有精致路线。</p></div><div><b>03</b><strong>打卡铸章</strong><p>完成旅程，收获积分与永久旅行 NFT。</p></div></div></section>
      <UserStats />

      {success && <div className="modal-backdrop" role="presentation" onClick={() => setSuccess(undefined)}><div className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title" onClick={(event) => event.stopPropagation()}><span className="success-icon">🎉</span><span className="section-index">ONCHAIN CHECK-IN</span><h2 id="success-title">逃离成功！</h2><p>“{success.quote}”</p><div className="success-reward"><b>L{success.route.level + 1} NFT</b><span>+{(success.route.level + 1) * 100} 积分</span></div><div className="modal-actions"><a href={`https://testnet.monadscan.com/tx/${success.hash}`} target="_blank" rel="noreferrer">查看交易</a>{typeof navigator !== "undefined" && "share" in navigator && <button onClick={shareSuccess}>分享出逃</button>}<button onClick={() => setSuccess(undefined)}>继续探索</button></div></div></div>}
    </main>
  );
}