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
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Active Traps */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase">
            Active Honey-Traps
          </CardTitle>
          <Radio className="size-4 text-emerald-400 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : activeTraps}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            <p className="text-xs font-mono text-zinc-400">
              [SYSTEM_STATUS: LIVE_MONITORING]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Breaches Detected */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase">
            Breaches Captured
          </CardTitle>
          <ShieldAlert className="size-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : totalBreaches}
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-mono border-rose-900 text-rose-400 bg-rose-950/30">
              [CRITICAL: {telemetry?.critical_events ?? 0}]
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono border-amber-900 text-amber-400 bg-amber-950/30">
              [HIGH: {telemetry?.high_events ?? 0}]
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quarantined IPs */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase">
            Quarantined Adversaries
          </CardTitle>
          <Lock className="size-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : quarantinedIps}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-2">
            [EDGE_FIREWALL_BLOCKLIST]
          </p>
        </CardContent>
      </Card>

      {/* Blocked Inbound Requests */}
      <Card className="bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase">
            Blocked Follow-Ups
          </CardTitle>
          <Terminal className="size-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-zinc-50">
            {loading && !telemetry ? "--" : blockedRequests}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Activity className="size-3 text-cyan-400" />
            <p className="text-xs font-mono text-zinc-400">
              [ACTIVE_EDGE_CONTAINMENT]
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

