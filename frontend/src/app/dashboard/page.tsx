"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCards } from "@/components/kpi-cards";
import { IncidentFeed } from "@/components/incident-feed";
import { ForensicSheet, IncidentRecord } from "@/components/forensic-sheet";
import { TokenDialog, TokenItem } from "@/components/token-dialog";
import { QuarantineTable, QuarantinedIP } from "@/components/quarantine-table";
import { toast } from "sonner";
import { ShieldCheck, Radio, ShieldAlert, Lock, ArrowLeft } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api/soc";

export default function SOCDashboard() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [quarantined, setQuarantined] = useState<QuarantinedIP[]>([]);
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Keep track of seen incident IDs to fire live SOC alerts on new breaches
  const seenIncidentIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  const fetchSocData = async () => {
    try {
      const [telRes, incRes, quarRes, tokRes] = await Promise.all([
        fetch(`${API_BASE}/telemetry`),
        fetch(`${API_BASE}/incidents`),
        fetch(`${API_BASE}/quarantine`),
        fetch(`${API_BASE}/tokens`),
      ]);

      const isAnyOk = telRes.ok || incRes.ok || quarRes.ok || tokRes.ok;
      setApiConnected(isAnyOk);

      if (telRes.ok) {
        setTelemetry(await telRes.json());
      }
      
      if (incRes.ok) {
        const incData: IncidentRecord[] = await incRes.json();
        setIncidents(incData);

        // Check for new breaches if already initialized
        if (initialLoadDone.current) {
          for (const inc of incData) {
            if (!seenIncidentIds.current.has(inc.incident_id)) {
              seenIncidentIds.current.add(inc.incident_id);
              toast.error(`[SOC_BREACH_DETECTED] ${inc.incident_id}`, {
                description: `${inc.attack_vector} probe from ${inc.ip_address} on ${inc.path}`,
              });
            }
          }
        } else {
          incData.forEach((i) => seenIncidentIds.current.add(i.incident_id));
          initialLoadDone.current = true;
        }
      }

      if (quarRes.ok) setQuarantined(await quarRes.json());
      if (tokRes.ok) setTokens(await tokRes.json());
    } catch (err) {
      console.warn("CanaryMesh API unreachable (polling every 2s)...", err);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Real-time polling every 2 seconds
  useEffect(() => {
    fetchSocData();
    const interval = setInterval(fetchSocData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectIncident = (inc: IncidentRecord) => {
    setSelectedIncident(inc);
    setIsSheetOpen(true);
  };

  const handleClearIncidents = async () => {
    try {
      await fetch(`${API_BASE}/incidents/clear`, { method: "DELETE" });
      seenIncidentIds.current.clear();
      await fetchSocData();
      toast.info("[SYSTEM_RESET] Incident and quarantine tables cleared.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuarantineToggle = async (ip: string, shouldBan: boolean) => {
    try {
      if (shouldBan) {
        await fetch(`${API_BASE}/quarantine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip_address: ip, reason: "Manual SOC Operator Quarantine" }),
        });
        toast.error(`[QUARANTINED] IP ${ip} blocked at edge.`);
      } else {
        await fetch(`${API_BASE}/quarantine/${ip}/unban`, { method: "POST" });
        toast.success(`[UNBANNED] IP ${ip} restored.`);
      }

      // Update local state if inspector sheet is open
      if (selectedIncident && selectedIncident.ip_address === ip) {
        setSelectedIncident({ ...selectedIncident, is_quarantined: shouldBan });
      }

      await fetchSocData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualBan = async (ip: string, reason: string) => {
    try {
      await fetch(`${API_BASE}/quarantine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip_address: ip, reason }),
      });
      toast.error(`[QUARANTINED] IP ${ip} manually added to edge firewall.`);
      await fetchSocData();
    } catch (err) {
      console.error(err);
    }
  };

  const activeQuarantineCount = quarantined.filter((q) => q.is_active).length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-zinc-800 font-sans">
      {/* 1. Sticky Enterprise Navbar - Identical to Homepage */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="size-8 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center shrink-0 group-hover:border-zinc-500 transition-colors">
              <ShieldAlert className="size-5 text-rose-500" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-mono text-xs sm:text-base font-bold tracking-wider text-zinc-100 uppercase">
                CANARYMESH
              </span>
              <Badge
                variant="outline"
                className="text-[9px] sm:text-[10px] font-mono border-zinc-700 text-zinc-400 bg-zinc-900 px-1 sm:px-1.5"
              >
                v1.0
              </Badge>
            </div>
          </Link>

          {/* Right Controls - Clean Single Line Alignment */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live API Connection Status Badge */}
            {apiConnected === true ? (
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded border border-emerald-900/60 bg-emerald-950/20 text-emerald-400 text-[10px] sm:text-xs font-mono">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">API: </span>
                <span>CONNECTED</span>
              </div>
            ) : apiConnected === false ? (
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded border border-rose-900/60 bg-rose-950/20 text-rose-400 text-[10px] sm:text-xs font-mono">
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="hidden sm:inline">API: </span>
                <span>OFFLINE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 text-[10px] sm:text-xs font-mono">
                <span className="size-1.5 rounded-full bg-zinc-500 animate-pulse" />
                <span className="hidden sm:inline">API: </span>
                <span>CONNECTING...</span>
              </div>
            )}

            <TokenDialog tokens={tokens} onTokenCreated={fetchSocData} />

            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-mono gap-1 sm:gap-1.5 h-8 px-2 sm:px-3"
              >
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main SOC Dashboard Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1 w-full">
        {/* Telemetry KPIs */}
        <KpiCards telemetry={telemetry} loading={loading} />

        {/* Main Workspace Tabs - Responsive Scroll Container */}
        <Tabs defaultValue="feed" className="w-full space-y-4">
          <div className="border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1 inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger
                value="feed"
                className="text-xs font-mono gap-1.5 whitespace-nowrap data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
              >
                <ShieldAlert className="size-3.5" />
                Live Intrusion Feed
                <Badge variant="outline" className="ml-1 text-[9px] border-zinc-700 font-mono">
                  {incidents.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="quarantine"
                className="text-xs font-mono gap-1.5 whitespace-nowrap data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
              >
                <Lock className="size-3.5" />
                Active Quarantine
                <Badge variant="outline" className="ml-1 text-[9px] border-rose-900 text-rose-400 bg-rose-950/40 font-mono">
                  {activeQuarantineCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="fleet"
                className="text-xs font-mono gap-1.5 whitespace-nowrap data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
              >
                <Radio className="size-3.5" />
                Honey-Token Fleet
                <Badge variant="outline" className="ml-1 text-[9px] border-zinc-700 font-mono">
                  {tokens.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Live Feed */}
          <TabsContent value="feed" className="mt-0 space-y-4">
            <IncidentFeed
              incidents={incidents}
              loading={loading}
              onSelectIncident={handleSelectIncident}
              onClearIncidents={handleClearIncidents}
            />
          </TabsContent>

          {/* Tab 2: Quarantine */}
          <TabsContent value="quarantine" className="mt-0 space-y-4">
            <QuarantineTable
              quarantinedList={quarantined}
              loading={loading}
              onUnban={(ip) => handleQuarantineToggle(ip, false)}
              onManualBan={handleManualBan}
            />
          </TabsContent>

          {/* Tab 3: Fleet Overview */}
          <TabsContent value="fleet" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tokens.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-md border border-zinc-800 bg-zinc-900/60 space-y-3 font-mono text-xs overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-zinc-100 text-sm truncate">{t.name}</span>
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-300 shrink-0">
                      [{t.type}]
                    </Badge>
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    <span className="text-zinc-500 block text-[10px]">Monitored Trap Endpoint:</span>
                    <code className="text-emerald-400/90 break-all text-[11px]">{t.decoy_path}</code>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] mb-1">Plantable Bait Snippet:</span>
                    <pre className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-300 overflow-x-auto max-w-full font-mono">
                      {t.payload_snippet}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Slide-Over Forensic Inspector Sheet */}
      <ForensicSheet
        incident={selectedIncident}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onQuarantineToggle={handleQuarantineToggle}
      />
    </main>
  );
}
