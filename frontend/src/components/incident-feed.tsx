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
import { IncidentRecord } from "./forensic-sheet";
import { Eye, ShieldAlert, Terminal, Lock, Trash2, Search } from "lucide-react";

interface IncidentFeedProps {
  incidents: IncidentRecord[];
  loading: boolean;
  onSelectIncident: (incident: IncidentRecord) => void;
  onClearIncidents: () => Promise<void>;
}

export function IncidentFeed({
  incidents,
  loading,
  onSelectIncident,
  onClearIncidents,
}: IncidentFeedProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [clearing, setClearing] = useState(false);

  const filtered = incidents.filter((inc) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      inc.incident_id.toLowerCase().includes(q) ||
      inc.ip_address.toLowerCase().includes(q) ||
      inc.attack_vector.toLowerCase().includes(q) ||
      inc.path.toLowerCase().includes(q) ||
      inc.severity.toLowerCase().includes(q)
    );
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <Badge variant="outline" className="border-rose-900 text-rose-400 bg-rose-950/40 text-[10px] font-mono">
            [CRITICAL]
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="outline" className="border-amber-900 text-amber-400 bg-amber-950/40 text-[10px] font-mono">
            [HIGH]
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-blue-900 text-blue-400 bg-blue-950/40 text-[10px] font-mono">
            [MEDIUM]
          </Badge>
        );
    }
  };

  const handleClear = async () => {
    if (confirm("Reset all captured incidents and active quarantines?")) {
      try {
        setClearing(true);
        await onClearIncidents();
      } finally {
        setClearing(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 size-4 text-zinc-500" />
          <Input
            placeholder="Filter by IP, Vector, Path, or ID..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-9 bg-zinc-900/90 border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={clearing || incidents.length === 0}
            className="border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 text-xs font-mono gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Reset Stream
          </Button>
        </div>
      </div>

      {/* Incident Table with Mobile Horizontal Scroll */}
      <div className="rounded-md border border-zinc-800 bg-zinc-900/60 overflow-hidden w-full">
        <Table className="min-w-[680px]">
          <TableHeader className="bg-zinc-900 border-b border-zinc-800">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[120px] text-xs font-mono text-zinc-400">ID / TIME</TableHead>
              <TableHead className="w-[140px] text-xs font-mono text-zinc-400">SOURCE IP</TableHead>
              <TableHead className="w-[120px] text-xs font-mono text-zinc-400">SEVERITY</TableHead>
              <TableHead className="text-xs font-mono text-zinc-400">ATTACK VECTOR</TableHead>
              <TableHead className="text-xs font-mono text-zinc-400">TARGET PATH</TableHead>
              <TableHead className="w-[130px] text-xs font-mono text-zinc-400">CONTAINMENT</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-mono text-zinc-400">FORENSICS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && incidents.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={7} className="text-center py-10 text-xs font-mono text-zinc-500">
                  [CONNECTING_TO_CANARYMESH_STREAM...]
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={7} className="text-center py-12 text-xs font-mono text-zinc-500">
                  [NO_INTRUSION_INCIDENTS_RECORDED]
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Honey-tokens armed. Run simulate_attack.py to trigger live breaches.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inc) => (
                <TableRow
                  key={inc.id}
                  className="border-zinc-800 hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  onClick={() => onSelectIncident(inc)}
                >
                  <TableCell className="font-mono text-xs text-zinc-300">
                    <span className="font-bold text-zinc-100 block">{inc.incident_id}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(inc.timestamp).toLocaleTimeString()}
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-300 font-medium">
                    {inc.ip_address}
                  </TableCell>

                  <TableCell>
                    {getSeverityBadge(inc.severity)}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-300">
                    <span className="text-zinc-200">[{inc.attack_vector}]</span>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-400 max-w-[200px] truncate">
                    <span className="text-zinc-500 mr-1">{inc.method}</span>
                    {inc.path}
                  </TableCell>

                  <TableCell>
                    {inc.is_quarantined ? (
                      <Badge variant="outline" className="border-rose-900 text-rose-400 bg-rose-950/40 text-[10px] font-mono gap-1">
                        <Lock className="size-2.5" />
                        [BANNED]
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] font-mono">
                        [MONITORED]
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                      }}
                      className="h-7 text-xs font-mono text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 gap-1"
                    >
                      <Eye className="size-3.5" />
                      Inspect
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

