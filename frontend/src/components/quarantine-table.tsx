"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, Copy, Check, ShieldAlert, Plus } from "lucide-react";

export interface QuarantinedIP {
  ip_address: string;
  quarantined_at: string;
  reason: string;
  hit_count: number;
  ufw_command: string;
  is_active: boolean;
}

interface QuarantineTableProps {
  quarantinedList: QuarantinedIP[];
  loading: boolean;
  onUnban: (ip: string) => Promise<void>;
  onManualBan: (ip: string, reason: string) => Promise<void>;
}

export function QuarantineTable({
  quarantinedList,
  loading,
  onUnban,
  onManualBan,
}: QuarantineTableProps) {
  const [manualIp, setManualIp] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(id);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp.trim()) return;

    try {
      setSubmitting(true);
      await onManualBan(manualIp.trim(), manualReason.trim() || "Manual SOC Operator Quarantine");
      setManualIp("");
      setManualReason("");
    } finally {
      setSubmitting(false);
    }
  };

  const activeQuarantines = quarantinedList.filter((q) => q.is_active);

  return (
    <div className="space-y-4">
      {/* Manual Quarantine Bar */}
      <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/60">
        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full sm:w-auto">
            <Input
              placeholder="Adversary IP to Quarantine (e.g. 198.51.100.22)"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600"
              required
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <Input
              placeholder="Containment Reason (Optional)"
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || !manualIp.trim()}
            size="sm"
            className="w-full sm:w-auto bg-rose-600 text-zinc-100 hover:bg-rose-700 text-xs font-mono gap-1.5"
          >
            <Lock className="size-3.5" />
            Quarantine IP
          </Button>
        </form>
      </div>

      {/* Table of Quarantined IPs with Mobile Horizontal Scroll */}
      <div className="rounded-md border border-zinc-800 bg-zinc-900/60 overflow-hidden w-full">
        <Table className="min-w-[680px]">
          <TableHeader className="bg-zinc-900 border-b border-zinc-800">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[160px] text-xs font-mono text-zinc-400">QUARANTINED IP</TableHead>
              <TableHead className="w-[140px] text-xs font-mono text-zinc-400">TIMESTAMP</TableHead>
              <TableHead className="text-xs font-mono text-zinc-400">CONTAINMENT REASON</TableHead>
              <TableHead className="w-[120px] text-xs font-mono text-zinc-400">BLOCKED HITS</TableHead>
              <TableHead className="text-xs font-mono text-zinc-400">FIREWALL RULE</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-mono text-zinc-400">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && quarantinedList.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={6} className="text-center py-8 text-xs font-mono text-zinc-500">
                  [LOADING_QUARANTINE_DATA...]
                </TableCell>
              </TableRow>
            ) : activeQuarantines.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={6} className="text-center py-10 text-xs font-mono text-zinc-500">
                  [NO_IPS_CURRENTLY_QUARANTINED]
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Threats triggering CRITICAL events will appear here automatically.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              activeQuarantines.map((item) => (
                <TableRow key={item.ip_address} className="border-zinc-800 hover:bg-zinc-800/40">
                  <TableCell className="font-mono text-xs text-zinc-100 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Lock className="size-3.5 text-rose-500" />
                      {item.ip_address}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-400">
                    {new Date(item.quarantined_at).toLocaleTimeString()}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-300">
                    {item.reason}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-100 font-bold">
                    <Badge variant="outline" className="border-amber-900 text-amber-400 bg-amber-950/30 text-[10px] font-mono">
                      {item.hit_count} Dropped
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono text-[11px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <code className="text-emerald-400/90 truncate max-w-[220px]">
                        {item.ufw_command}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100 shrink-0"
                        onClick={() => copyToClipboard(item.ufw_command, item.ip_address)}
                      >
                        {copiedIp === item.ip_address ? (
                          <Check className="size-3 text-emerald-400" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnban(item.ip_address)}
                      className="h-7 text-xs font-mono border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1"
                    >
                      <Unlock className="size-3.5" />
                      Unban
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

