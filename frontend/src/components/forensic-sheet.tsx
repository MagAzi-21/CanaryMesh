"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, Terminal, Lock, Unlock, Copy, Check, Eye } from "lucide-react";

export interface IncidentRecord {
  id: number;
  incident_id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  method: string;
  path: string;
  headers: Record<string, any>;
  query_params: Record<string, any>;
  body: string | null;
  attack_vector: string;
  severity: string;
  token_id: number | null;
  token_name?: string | null;
  is_quarantined: boolean;
}

interface ForensicSheetProps {
  incident: IncidentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuarantineToggle: (ip: string, shouldBan: boolean) => Promise<void>;
}

export function ForensicSheet({
  incident,
  open,
  onOpenChange,
  onQuarantineToggle,
}: ForensicSheetProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!incident) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "border-rose-800 text-rose-400 bg-rose-950/40";
      case "HIGH":
        return "border-amber-800 text-amber-400 bg-amber-950/40";
      default:
        return "border-blue-800 text-blue-400 bg-blue-950/40";
    }
  };

  const handleToggle = async () => {
    try {
      setActionLoading(true);
      await onQuarantineToggle(incident.ip_address, !incident.is_quarantined);
    } finally {
      setActionLoading(false);
    }
  };

  const ufwRule = `sudo ufw insert 1 deny from ${incident.ip_address} to any`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl max-w-full bg-zinc-950 border-l border-zinc-800 text-zinc-100 p-0 flex flex-col">
        <SheetHeader className="p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <ShieldAlert className="size-5 text-rose-500 shrink-0" />
              <SheetTitle className="text-sm sm:text-base font-mono font-bold text-zinc-100 truncate">
                FORENSICS: {incident.incident_id}
              </SheetTitle>
            </div>
            <Badge variant="outline" className={`font-mono text-[10px] sm:text-xs shrink-0 ${getSeverityBadgeVariant(incident.severity)}`}>
              [{incident.severity}]
            </Badge>
          </div>
          <SheetDescription className="text-xs font-mono text-zinc-400 mt-1 truncate">
            Tripwire: {incident.token_name || "Custom Honey-Token"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs font-mono">
            <div className="p-3 rounded-md bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Attacker IP</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-zinc-200 font-bold">{incident.ip_address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
                  onClick={() => copyToClipboard(incident.ip_address, "ip")}
                >
                  {copiedField === "ip" ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-md bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Attack Vector</span>
              <span className="text-zinc-200 font-bold block mt-1">
                [{incident.attack_vector}]
              </span>
            </div>

            <div className="p-3 rounded-md bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">HTTP Target</span>
              <span className="text-zinc-200 font-bold block mt-1 truncate">
                {incident.method} {incident.path}
              </span>
            </div>

            <div className="p-3 rounded-md bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Containment Status</span>
              <div className="mt-1 flex items-center gap-1.5">
                {incident.is_quarantined ? (
                  <Badge variant="outline" className="border-rose-900 text-rose-400 bg-rose-950/40 text-[10px]">
                    [QUARANTINED]
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
                    [MONITORED]
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-800 my-4" />

          {/* User-Agent Fingerprint */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase flex items-center gap-1.5">
                <Terminal className="size-3.5 text-zinc-400" />
                User-Agent Fingerprint
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] font-mono text-zinc-400"
                onClick={() => copyToClipboard(incident.user_agent, "ua")}
              >
                {copiedField === "ua" ? <Check className="size-3 text-emerald-400 mr-1" /> : <Copy className="size-3 mr-1" />}
                Copy UA
              </Button>
            </div>
            <div className="p-3 rounded bg-zinc-900/90 border border-zinc-800/80 text-xs font-mono text-zinc-300 break-all leading-relaxed">
              {incident.user_agent || "[BLANK_USER_AGENT]"}
            </div>
          </div>

          <Separator className="bg-zinc-800 my-4" />

          {/* Raw Request Payload */}
          <div>
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase block mb-2">
              Inbound Payload / Body
            </span>
            <div className="p-3 rounded bg-zinc-900/90 border border-zinc-800/80 text-xs font-mono text-amber-300/90 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
              {incident.body ? incident.body : "[NO_INBOUND_BODY_DATA]"}
            </div>
          </div>

          <Separator className="bg-zinc-800 my-4" />

          {/* HTTP Request Headers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase">
                Captured Inbound Headers
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] font-mono text-zinc-400"
                onClick={() => copyToClipboard(JSON.stringify(incident.headers, null, 2), "headers")}
              >
                {copiedField === "headers" ? <Check className="size-3 text-emerald-400 mr-1" /> : <Copy className="size-3 mr-1" />}
                Copy JSON
              </Button>
            </div>
            <pre className="p-3 rounded bg-zinc-900/90 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48">
              {JSON.stringify(incident.headers, null, 2)}
            </pre>
          </div>

          <Separator className="bg-zinc-800 my-4" />

          {/* Firewall Command */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase">
                Host-Level Firewall Enforcement
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] font-mono text-zinc-400"
                onClick={() => copyToClipboard(ufwRule, "ufw")}
              >
                {copiedField === "ufw" ? <Check className="size-3 text-emerald-400 mr-1" /> : <Copy className="size-3 mr-1" />}
                Copy Rule
              </Button>
            </div>
            <div className="p-2.5 rounded bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-emerald-400">
              {ufwRule}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-mono"
            onClick={() => onOpenChange(false)}
          >
            Close Inspector
          </Button>

          <Button
            size="sm"
            variant={incident.is_quarantined ? "secondary" : "destructive"}
            className="text-xs font-mono gap-1.5"
            onClick={handleToggle}
            disabled={actionLoading}
          >
            {incident.is_quarantined ? (
              <>
                <Unlock className="size-3.5" />
                Unban IP Address
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                Quarantine IP Now
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

