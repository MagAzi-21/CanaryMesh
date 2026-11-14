"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Radio,
  Lock,
  ArrowRight,
  Activity,
  FileCode,
  Key,
  Globe,
  AlertTriangle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-zinc-800 font-sans">
      {/* 1. Sticky Enterprise Navbar */}
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

          {/* Clean Human-Readable Anchor Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#problem" className="hover:text-zinc-100 transition-colors">
              Architecture
            </a>
            <a href="#tripwires" className="hover:text-zinc-100 transition-colors">
              Tripwires
            </a>
            <a href="#killchain" className="hover:text-zinc-100 transition-colors">
              Kill-Chain
            </a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard">
              <Button
                size="sm"
                className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-mono text-xs font-semibold gap-1.5 shadow h-8 px-2.5 sm:px-3"
              >
                <span className="hidden sm:inline">Launch SOC Console</span>
                <span className="sm:hidden">SOC Console</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-900/60 bg-rose-950/20 text-rose-400 text-xs font-mono">
                  <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                  [ACTIVE_DECEPTION_DEFENSE_ENGINE]
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] text-zinc-50 font-sans">
                  Active cyber deception and automated edge containment
                </h1>

                <p className="text-zinc-400 text-base leading-relaxed font-sans max-w-2xl">
                  Trap adversary reconnaissance, credential stuffing, and leaked cloud credentials using
                  cryptographically tracked tripwires. Because legitimate users never touch decoy assets,
                  every alert represents a zero-false-positive intrusion signal with instant edge firewall enforcement.
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Badge variant="outline" className="text-xs font-mono border-zinc-800 bg-zinc-900/80 text-zinc-300 py-1">
                    [0%_FALSE_POSITIVES]
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono border-zinc-800 bg-zinc-900/80 text-zinc-300 py-1">
                    [&lt;500MS_TELEGRAM_ALERTS]
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono border-rose-900/50 bg-rose-950/30 text-rose-300 py-1">
                    [HTTP_403_EDGE_CONTAINMENT]
                  </Badge>
                </div>

                {/* Primary & Secondary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-mono text-sm font-semibold gap-2 shadow-lg"
                    >
                      <ShieldCheck className="size-4" />
                      Launch SOC Console
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>

                  <a href="#tripwires">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 font-mono text-sm"
                    >
                      Explore Honey-Tokens
                    </Button>
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive Live Terminal Demonstration */}
              <div className="lg:col-span-5 min-w-0">
                <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden font-mono text-xs">
                  <CardHeader className="bg-zinc-900/80 border-b border-zinc-800 px-4 py-3 flex flex-row items-center justify-between space-y-0 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Terminal className="size-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-zinc-200 truncate">
                        CANARYMESH_GATEWAY
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-900/80 text-emerald-400 bg-emerald-950/40 shrink-0 gap-1.5 px-2 py-0.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="min-w-0 truncate">LIVE</span>
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 bg-zinc-950/90 text-zinc-300 leading-relaxed">
                    {/* Simulated Command Output */}
                    <div className="space-y-1 text-zinc-400">
                      <p className="text-zinc-500 text-[11px]">[SYSTEM] Trap listener initialized on port :8000</p>
                      <p className="text-emerald-400 break-all">
                        <strong className="text-zinc-500">attacker@recon:~$</strong> curl -s http://127.0.0.1:8000/canary/env/550e84...
                      </p>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Threat Interception Details */}
                    <div className="space-y-1.5 p-2.5 rounded bg-zinc-900/90 border border-rose-950 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-400 font-bold">[SOC_ALERT] INTRUSION DETECTED</span>
                        <Badge variant="outline" className="text-[9px] border-rose-900 text-rose-400 bg-rose-950/50">
                          [CRITICAL]
                        </Badge>
                      </div>
                      <p className="text-zinc-300">• IP: <code className="text-zinc-100 font-bold">198.51.100.42</code></p>
                      <p className="text-zinc-300">• Vector: <code className="text-amber-300">ENV_CREDENTIAL_LEAK</code></p>
                      <p className="text-zinc-300">• Trap: <code className="text-zinc-200">Production .env Credential Leak</code></p>
                      <p className="text-zinc-300">• Client: <code className="text-zinc-400">curl/7.88.1 (AUTOMATED_SCANNER)</code></p>
                    </div>

                    {/* Automated Containment Step */}
                    <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] space-y-1">
                      <span className="text-zinc-400 block text-[10px] uppercase font-bold">[AUTOMATED_CONTAINMENT]</span>
                      <p className="text-emerald-400 font-bold break-all">
                        sudo ufw insert 1 deny from 198.51.100.42 to any
                      </p>
                      <p className="text-zinc-500 text-[10px] font-sans">
                        Edge middleware updated: All subsequent requests from 198.51.100.42 blocked.
                      </p>
                    </div>

                    {/* Follow-Up Rejection */}
                    <div className="p-2 rounded bg-rose-950/20 border border-rose-900/40 text-[11px] text-rose-300">
                      <span className="text-zinc-500">attacker@recon:~$</span> curl -I http://127.0.0.1:8000/api/v1/data<br />
                      <strong className="text-rose-400">HTTP/1.1 403 Forbidden</strong> [CONTAINMENT_ENFORCED]
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Problem vs. Solution Grid */}
        <section id="problem" className="scroll-mt-24 py-20 sm:py-24 border-t border-zinc-900 bg-zinc-900/20">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-400 uppercase">
                [COMPARATIVE_ANALYSIS]
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug text-zinc-50 font-sans">
                Legacy Perimeter vs. Active Cyber-Deception
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 font-sans">
                Traditional scanners generate noise while missing stolen credentials. CanaryMesh relies on intent-based deception.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Legacy Approach */}
              <Card className="bg-zinc-950 border-zinc-800 text-zinc-300">
                <CardHeader>
                  <div className="flex items-center justify-between pb-1">
                    <Badge variant="outline" className="text-xs font-mono border-amber-900 text-amber-400 bg-amber-950/30">
                      [LEGACY_DEFENSE: PASSIVE_&_NOISY]
                    </Badge>
                    <AlertTriangle className="size-4 text-amber-400" />
                  </div>
                  <CardTitle className="text-lg font-sans font-bold text-zinc-100">
                    Vulnerability Scanners & Firewalls
                  </CardTitle>
                  <CardDescription className="text-xs font-sans text-zinc-500">
                    Signature-heavy perimeter inspection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs font-sans">
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-500 font-mono mt-0.5 shrink-0">[x]</span>
                    <p className="text-zinc-400">
                      <strong className="text-zinc-200">High False Positive Rates:</strong> Floods security analysts with thousands of low-confidence alerts, leading to alert fatigue.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-500 font-mono mt-0.5 shrink-0">[x]</span>
                    <p className="text-zinc-400">
                      <strong className="text-zinc-200">Blind to Insider Threat:</strong> Completely unaware when stolen cloud credentials or API keys are abused within normal traffic envelopes.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-500 font-mono mt-0.5 shrink-0">[x]</span>
                    <p className="text-zinc-400">
                      <strong className="text-zinc-200">Delayed Triage Window:</strong> Traditional log analysis detects breaches hours or days after exfiltration has already taken place.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-500 font-mono mt-0.5 shrink-0">[x]</span>
                    <p className="text-zinc-400">
                      <strong className="text-zinc-200">Notification Without Action:</strong> Generates notifications without isolating the adversary, leaving the attack surface exposed.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CanaryMesh Active Defense */}
              <Card className="bg-zinc-950 border-emerald-950/60 ring-1 ring-emerald-900/30 text-zinc-300">
                <CardHeader>
                  <div className="flex items-center justify-between pb-1">
                    <Badge variant="outline" className="text-xs font-mono border-emerald-900 text-emerald-400 bg-emerald-950/30">
                      [CANARYMESH: ZERO_FALSE_POSITIVES]
                    </Badge>
                    <ShieldCheck className="size-4 text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg font-sans font-bold text-zinc-100">
                    Active Deception & Edge Containment
                  </CardTitle>
                  <CardDescription className="text-xs font-sans text-zinc-500">
                    Deterministic tripwires & automated isolation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs font-sans">
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-mono mt-0.5 shrink-0">[+]</span>
                    <p className="text-zinc-300">
                      <strong className="text-zinc-100">Zero False Positives:</strong> Legitimate business traffic never accesses hidden decoy endpoints or leaked canary keys. Any trigger is high-confidence.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-mono mt-0.5 shrink-0">[+]</span>
                    <p className="text-zinc-300">
                      <strong className="text-zinc-100">Automated Edge Containment:</strong> Banned IPs are blocked at the edge middleware immediately, dropping subsequent attack attempts with HTTP 403.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-mono mt-0.5 shrink-0">[+]</span>
                    <p className="text-zinc-300">
                      <strong className="text-zinc-100">Deep Forensic Packet Capture:</strong> Extracts full request headers, payload heuristics (SQLi, path traversal), and automated scanner fingerprints.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-mono mt-0.5 shrink-0">[+]</span>
                    <p className="text-zinc-300">
                      <strong className="text-zinc-100">Sub-Second Telegram Push:</strong> Dispatches clean bracketed SOC alert cards to security teams within &lt;500ms of tripwire activation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. Tripwire Matrix */}
        <section id="tripwires" className="scroll-mt-24 py-20 sm:py-24 border-t border-zinc-900">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-400 uppercase">
                [DECEPTION_FACTORY]
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug text-zinc-50 font-sans">
                Four High-Fidelity Tripwire Archetypes
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 font-sans">
                Plant high-confidence decoys across source repositories, public routes, and authentication workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Trap 1: Decoy .env */}
              <Card className="bg-zinc-900/60 border-zinc-800 text-zinc-100 flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FileCode className="size-5 text-emerald-400" />
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
                      [ENV_FILE]
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-sans font-bold text-zinc-100">
                    Decoy .env Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-zinc-400 flex-1 flex flex-col justify-between font-sans">
                  <p>
                    A tracked environment file containing dummy <code className="text-zinc-200 font-mono">AWS_ACCESS_KEY</code> and <code className="text-zinc-200 font-mono">DATABASE_URL</code> pointing to a monitored internal backup webhook.
                  </p>
                  <div className="text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-md p-2.5 break-all whitespace-pre-wrap text-zinc-400">
                    CANARY_SYNC=http://host/canary/env/550e84...
                  </div>
                </CardContent>
              </Card>

              {/* Trap 2: Hidden Route */}
              <Card className="bg-zinc-900/60 border-zinc-800 text-zinc-100 flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Globe className="size-5 text-cyan-400" />
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
                      [DECOY_ROUTE]
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-sans font-bold text-zinc-100">
                    Admin / Backup Routes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-zinc-400 flex-1 flex flex-col justify-between font-sans">
                  <p>
                    Planted in <code className="text-zinc-200 font-mono">robots.txt</code> or HTML comments. Lures directory brute-forcers like <code className="text-zinc-200 font-mono">gobuster</code> and <code className="text-zinc-200 font-mono">dirsearch</code>.
                  </p>
                  <div className="text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-md p-2.5 break-all whitespace-pre-wrap text-zinc-400">
                    Disallow: /api/v1/internal/db-export-2026
                  </div>
                </CardContent>
              </Card>

              {/* Trap 3: Canary API Key */}
              <Card className="bg-zinc-900/60 border-zinc-800 text-zinc-100 flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Key className="size-5 text-amber-400" />
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
                      [API_KEY]
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-sans font-bold text-zinc-100">
                    Canary Bearer API Key
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-zinc-400 flex-1 flex flex-col justify-between font-sans">
                  <p>
                    Planted in internal developer documentation or client bundles. Detects unauthorized API probing using stolen credentials.
                  </p>
                  <div className="text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-md p-2.5 break-all whitespace-pre-wrap text-zinc-400">
                    Authorization: Bearer cm_live_7f9b8c2d...
                  </div>
                </CardContent>
              </Card>

              {/* Trap 4: Decoy SSO Login */}
              <Card className="bg-zinc-900/60 border-zinc-800 text-zinc-100 flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Lock className="size-5 text-rose-500" />
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
                      [DECOY_LOGIN]
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-sans font-bold text-zinc-100">
                    Decoy SSO Portal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-zinc-400 flex-1 flex flex-col justify-between font-sans">
                  <p>
                    Realistic enterprise SSO authentication portal (<code className="text-zinc-200 font-mono">/corp-sso-login</code>) capturing credential stuffing and SQL injection payloads.
                  </p>
                  <div className="text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-md p-2.5 break-all whitespace-pre-wrap text-zinc-400">
                    POST /corp-sso-login [admin&apos; OR &apos;1&apos;=&apos;1&apos;]
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. 3-Step Active Kill-Chain */}
        <section id="killchain" className="scroll-mt-24 py-20 sm:py-24 border-t border-zinc-900 bg-zinc-900/20">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-400 uppercase">
                [ACTIVE_DEFENSE_PIPELINE]
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug text-zinc-50 font-sans">
                The 3-Step Containment Kill-Chain
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 font-sans">
                From initial decoy contact to edge-level adversary isolation in under 500 milliseconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 01 */}
              <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 relative">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-500">PHASE_01</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-800 text-zinc-400">
                      [BAIT]
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-sans font-bold text-zinc-100 flex items-center gap-2">
                    <Radio className="size-4 text-emerald-400" />
                    01 Plant Decoys
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-sans text-zinc-400 space-y-2">
                  <p>
                    Operators deploy cryptographically tracked honey-tokens, fake <code className="text-zinc-200 font-mono">.env</code> files, and hidden paths across application assets via the Honey-Token Factory.
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Protocols return convincing status codes (401/403/503) so attackers continue probing unsuspectingly.
                  </p>
                </CardContent>
              </Card>

              {/* Step 02 */}
              <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 relative">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-500">PHASE_02</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-800 text-zinc-400">
                      [CAPTURE]
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-sans font-bold text-zinc-100 flex items-center gap-2">
                    <Activity className="size-4 text-cyan-400" />
                    02 Forensic Capture
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-sans text-zinc-400 space-y-2">
                  <p>
                    On tripwire activation, the forensic engine extracts IP (<code className="text-zinc-200 font-mono">X-Forwarded-For</code> aware), fingerprints scanners (<code className="text-zinc-200 font-mono">sqlmap</code>, <code className="text-zinc-200 font-mono">gobuster</code>, <code className="text-zinc-200 font-mono">curl</code>), and heuristically classifies exploit vectors.
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Payloads are inspected for SQL Injection, Path Traversal, and API Key abuse.
                  </p>
                </CardContent>
              </Card>

              {/* Step 03 */}
              <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 relative">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-500">PHASE_03</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-rose-900 text-rose-400 bg-rose-950/30">
                      [ISOLATE]
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-sans font-bold text-zinc-100 flex items-center gap-2">
                    <Lock className="size-4 text-rose-500" />
                    03 Edge Containment
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-sans text-zinc-400 space-y-2">
                  <p>
                    High-severity attackers are instantly quarantined in the SQLite edge store. FastAPI edge middleware drops all subsequent requests with <code className="text-rose-400 font-mono">HTTP 403 Forbidden</code>.
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Formatted Telegram SOC alert card dispatched; copyable <code className="text-emerald-400 font-mono">ufw deny</code> command generated.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. Ready to Defend CTA Section */}
        <section className="py-20 sm:py-24 border-t border-zinc-900">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug text-zinc-50 font-sans">
              Ready to deploy active deception defense?
            </h2>
            <p className="text-zinc-400 text-base font-sans max-w-xl mx-auto">
              Launch the real-time SOC console to monitor live honey-tokens, inspect deep packet forensics, and manage quarantined adversaries.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-mono text-sm font-semibold gap-2 shadow-lg"
                >
                  <Terminal className="size-4" />
                  Launch SOC Command Center
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer: Clean Attribution */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-zinc-400" />
            <span className="font-bold text-zinc-300">CANARYMESH</span>
            <span>&copy; 2026. All rights reserved.</span>
          </div>

          {/* Academic / Project Attribution */}
          <div className="text-center sm:text-right text-zinc-400">
            Engineered by <strong className="text-zinc-200">Mikiyas Abesha Aba</strong> (<code className="text-zinc-300">CTC-5608-26</code>)
            <span className="block text-[11px] text-zinc-500">
              INSA Cyber Talent Summer Camp 2026 — Cybersecurity Stream Final Evaluation
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
