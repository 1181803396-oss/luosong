"use client";

import type { Hash } from "viem";
import RouteCard from "./RouteCard";
import { ROUTES, type TravelRoute } from "@/lib/constants";

type Props = {
  category: "全部" | "人文" | "风景";
  level: "全部" | 0 | 1 | 2;
  onSuccess: (route: TravelRoute, hash: Hash) => void;
};

export default function RouteGrid({ category, level, onSuccess }: Props) {
  const routes = ROUTES.filter((route) => (category === "全部" || route.category === category) && (level === "全部" || route.level === level));
  if (routes.length === 0) return <div className="empty-state"><span>🧭</span><strong>暂时没有符合条件的路线</strong><p>换个分类看看，旷野总会出现。</p></div>;
  return <div className="route-grid">{routes.map((route) => <RouteCard key={route.id} route={route} onSuccess={onSuccess} />)}</div>;
}