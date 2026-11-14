"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, ShieldAlert, Lock, Terminal, Activity } from "lucide-react";

interface TelemetryData {
  active_traps: number;
  total_breaches: number;
  quarantined_ips: number;
  blocked_requests: number;
  critical_events: number;
  high_events: number;
  medium_events: number;
}

interface KpiCardsProps {
  telemetry: TelemetryData | null;
  loading: boolean;
}

export function KpiCards({ telemetry, loading }: KpiCardsProps) {
  const activeTraps = telemetry?.active_traps ?? 0;
  const totalBreaches = telemetry?.total_breaches ?? 0;
  const quarantinedIps = telemetry?.quarantined_ips ?? 0;
  const blockedRequests = telemetry?.blocked_requests ?? 0;

  return (
    <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Active Traps */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 p-3 sm:p-6">
          <CardTitle className="text-[11px] sm:text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase truncate">
            Active Traps
          </CardTitle>
          <Radio className="size-3.5 sm:size-4 text-emerald-400 animate-pulse shrink-0" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : activeTraps}
          </div>
          <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate">
              [LIVE_MONITORING]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Breaches Detected */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 p-3 sm:p-6">
          <CardTitle className="text-[11px] sm:text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase truncate">
            Breaches
          </CardTitle>
          <ShieldAlert className="size-3.5 sm:size-4 text-rose-500 shrink-0" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : totalBreaches}
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-2 flex-wrap">
            <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono border-rose-900 text-rose-400 bg-rose-950/30 px-1 py-0">
              CRIT: {telemetry?.critical_events ?? 0}
            </Badge>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono border-amber-900 text-amber-400 bg-amber-950/30 px-1 py-0">
              HIGH: {telemetry?.high_events ?? 0}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quarantined IPs */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 p-3 sm:p-6">
          <CardTitle className="text-[11px] sm:text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase truncate">
            Quarantine
          </CardTitle>
          <Lock className="size-3.5 sm:size-4 text-amber-400 shrink-0" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : quarantinedIps}
          </div>
          <p className="text-[10px] sm:text-xs font-mono text-zinc-400 mt-1 sm:mt-2 truncate">
            [EDGE_BLOCKLIST]
          </p>
        </CardContent>
      </Card>

      {/* Blocked Inbound Requests */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 p-3 sm:p-6">
          <CardTitle className="text-[11px] sm:text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase truncate">
            Blocked Hits
          </CardTitle>
          <Terminal className="size-3.5 sm:size-4 text-cyan-400 shrink-0" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : blockedRequests}
          </div>
          <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
            <Activity className="size-3 text-cyan-400 shrink-0" />
            <p className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate">
              [EDGE_SHIELD]
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
