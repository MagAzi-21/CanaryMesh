"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Copy, Check, Radio } from "lucide-react";

export interface TokenItem {
  id: number;
  token_uuid: string;
  name: string;
  type: string;
  decoy_path: string;
  payload_snippet: string;
  created_at: string;
  is_active: boolean;
}

interface TokenDialogProps {
  tokens: TokenItem[];
  onTokenCreated: () => Promise<void>;
}

export function TokenDialog({ tokens, onTokenCreated }: TokenDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tokenType, setTokenType] = useState("ENV_FILE");
  const [customPath, setCustomPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSnippet, setCreatedSnippet] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/soc/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: tokenType,
          decoy_path: customPath.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create token");
      const data = await res.json();
      setCreatedSnippet(data.payload_snippet);
      setName("");
      setCustomPath("");
      await onTokenCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-mono font-medium gap-1.5 shadow"
      >
        <Plus className="size-3.5" />
        Deploy Honey-Token
      </Button>

      <DialogContent className="sm:max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden bg-zinc-950 border border-zinc-800 text-zinc-100 p-6">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-emerald-400" />
            <DialogTitle className="text-base font-mono font-bold text-zinc-100">
              HONEY-TOKEN FACTORY
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs font-mono text-zinc-400">
            Mint cryptographically tracked deception tripwires to embed into production repositories, robots.txt, or authorization headers.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body Container to Prevent Any Overflow */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1 min-h-0">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-zinc-300">Tripwire Name</Label>
                <Input
                  placeholder="e.g. Finance Vault Backup Key"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-zinc-300">Deception Type</Label>
                <Select value={tokenType} onValueChange={(val: string | null) => { if (val) setTokenType(val); }}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs font-mono text-zinc-100">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="ENV_FILE" className="text-xs font-mono">
                      Decoy .env Credentials
                    </SelectItem>
                    <SelectItem value="DECOY_ROUTE" className="text-xs font-mono">
                      Hidden Admin / Backup Route
                    </SelectItem>
                    <SelectItem value="API_KEY" className="text-xs font-mono">
                      Monitored Canary Bearer Key
                    </SelectItem>
                    <SelectItem value="DECOY_LOGIN" className="text-xs font-mono">
                      Corporate SSO Login Portal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-300">
                Custom Decoy Path (Optional)
              </Label>
              <Input
                placeholder="Leave blank for auto-generated UUID path"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-mono font-medium gap-1.5"
            >
              <Plus className="size-3.5" />
              {loading ? "Minting Tripwire..." : "Mint & Register Honey-Token"}
            </Button>
          </form>

          {/* Recently Generated Snippet */}
          {createdSnippet && (
            <div className="p-3 rounded-md bg-zinc-900 border border-emerald-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="size-3.5" />
                  [TOKEN_GENERATED] Ready to Plant
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(createdSnippet, "new")}
                  className="h-6 text-[11px] font-mono text-zinc-300"
                >
                  {copiedId === "new" ? <Check className="size-3 text-emerald-400 mr-1" /> : <Copy className="size-3 mr-1" />}
                  Copy Bait Snippet
                </Button>
              </div>
              <pre className="text-[11px] font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded border border-zinc-800 overflow-x-auto">
                {createdSnippet}
              </pre>
            </div>
          )}

          <Separator className="bg-zinc-800 my-2" />

          {/* Active Honey-Tokens Registry */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-zinc-400 uppercase font-medium block">
              Active Deception Fleet ({tokens.length})
            </span>
            <div className="max-h-48 overflow-y-auto rounded border border-zinc-800/80 bg-zinc-900/50 p-2 space-y-2">
              {tokens.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono w-full min-w-0"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 mr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 font-bold truncate">{t.name}</span>
                      <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-400 shrink-0">
                        [{t.type}]
                      </Badge>
                    </div>
                    <span className="text-[10px] text-zinc-500 block truncate">
                      {t.decoy_path}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] font-mono text-zinc-400 hover:text-zinc-100 shrink-0"
                    onClick={() => copyToClipboard(t.payload_snippet, `token-${t.id}`)}
                  >
                    {copiedId === `token-${t.id}` ? (
                      <Check className="size-3 text-emerald-400 mr-1" />
                    ) : (
                      <Copy className="size-3 mr-1" />
                    )}
                    Copy Bait
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
