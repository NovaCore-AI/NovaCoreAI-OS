# Bauplan: NovaCore Agent SDK & UI (`nc-web`) — Architektur, Runtime-Host & Gate-Integration

> **Status:** 🟢 Konzeption & Bauplan (gehärtet durch 3 spezialisierte Subagenten-Reviews, 2026-08-16)  
> **Auftrag:** Lucas Vöhringer, 2026-08-16 — Konzeption einer eigenen Claude-Code-gestützten SDK- und UI-Plattform für NovaCore-OS mit flexibler Modellwahl, Desktop/Web-UI und nativer Gate-Integration.  
> **Verbindliche Normen:** `NovaCore-OS-Produktarchitektur.md`, `NovaCore-OS-Gates-Definition.md`, `NovaCore-OS-CLAUDE-Ebenen-Definition.md`.

---

## 1. Executive Summary & Leitprinzip

Dieses Vorhaben definiert die Architektur für eine **eigene Desktop- und Web-UI-Plattform für NovaCore-OS**, die **Claude Code als eingebetteten Runtime-Motor** nutzt.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NOVACORE-FRONTEND (SPA / UI)                       │
│   Modell-Picker · Thinking-Slider · Chat-Canvas · Tool-Approval-Modal       │
│   NovaCore-Workflow-Monitor · Session-Manager · Gate-Telemetrie             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST (Aktionen) + WS (Streaming)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             RUNTIME HOST & GATEWAY (@novacore/runtime-host)                 │
│   - Multi-Workspace Session Pool (isoliert, kein globales process.chdir)    │
│   - Lease-Based Approval Registry (Fail-Closed TTL: 120-300s, Default-Deny) │
│   - Token-Auth (#token= Fragment + server.token 0600) + Strict Origin/CSP   │
│   - Sliding-Window Event RingBuffer (1000 Events) + Backpressure Valve      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Native IPC / Subprocess Guard
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ENGINE WORKER SUBPROCESS (Claude Agent SDK)                 │
│   - Win32 Job Object (Windows) / PR_SET_PDEATHSIG (Linux) / Pipe-EOF (macOS)│
│   - @anthropic-ai/claude-agent-sdk Runtime Runner                           │
│   - canUseTool Hook Bridge (Promise-Suspension ohne Thread-Blockade)        │
│   - Kontroll-Schicht: Gate 1 (FFG v2), Gate 2 (Start-Gate), Gate 4          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Append-Only WAL Stream
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PERSISTENZ & LOCAL FILE STATE                           │
│   ~/.claude/projects/<ws-hash>/<sid>.jsonl (Atomic Journal + flock)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Kernversprechen:** Alle NovaCore-Garantien (Gates, FFG-Fakten-Zwang, Kern-Skills `/nc:*`, rote Linien) bleiben zu 100 % erhalten, weil die Ausführung über die echte Claude-Code-Laufzeit mit dem installierten NovaCore-Plugin läuft.

---

## 2. Die 4 Schichten der Architektur

### Schicht 1: Engine-Host & Prozess-Lifecycle (Zero-Orphan-Garantie)
1. **Worker-Subprozess-Isolation:** Die `@anthropic-ai/claude-agent-sdk` läuft in einem separaten Node.js-Worker-Prozess. Dadurch führen V8-Crashes oder OOMs der Engine zu keinem Absturz des UI-Host-Servers.
2. **Win32 Job Objects (Windows):** Verknüpfung des Worker-Prozessbaums mit `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`. Bei Beendigung des Host-Prozesses (auch via Task-Manager) terminiert der Windows-Kernel sofort alle Subprozesse (`npm`, `git`, `python`).
3. **Linux `PR_SET_PDEATHSIG`:** Worker setzt `prctl(PR_SET_PDEATHSIG, SIGKILL)`.
4. **POSIX Pipe Dead Man's Switch (macOS & Fallback):** Der Host vererbt eine anonyme Pipe. Bei Host-Crash schließt das OS das Schreibende $\rightarrow$ der Worker liest `EOF` und terminiert sofort seine eigene Prozessgruppe (`kill(-pgid, SIGKILL)`).

### Schicht 2: Dynamische Modell- & Thinking-Budget-Orchestrierung
- **Turn-Level Parameter:** Jede Eingabe kann Modell (`claude-3-7-sonnet-20250219`, `claude-3-opus-20240229`, `claude-3-5-haiku-20241022`), `thinkingBudgetTokens` (0 bis 64.000) und `permissionMode` frei wählen.
- **Thinking-Block Sanitizing:** Beim Wechsel von Sonnet 3.7 auf Haiku 3.5 filtert der Host-Adapter Thinking-Blöcke aus dem API-History-Payload, behält sie aber im lokalen Transkript für das UI.
- **Invariante:** Bei aktivem Thinking gilt `max_tokens > thinking_budget` und `temperature = 1.0`.

### Schicht 3: Die Approval- & NovaCore-Gate-Brücke (Linchpin)
- **`canUseTool`-Promise-Brücke:**
  1. SDK pausiert bei Tool-Aufrufen deterministisch auf einem Promise.
  2. Host erzeugt `approval_id` (`appr_<uuid>`) mit **Fail-Closed-Timer (120–300s)** und sendet `tool.approval_requested` an das UI.
  3. UI zeigt Diffs (`Write`/`Edit`) und Syntax-AST (`Bash`).
  4. Nutzerentscheidung (`POST /approvals/{aid}`) resolved das Promise. Bei Timeout oder Disconnect greift **`behavior: 'deny'` (Fail-Closed)**.
- **Gate-Fidelity:**
  - **Gate 1 (FFG v2):** Verlangt Fakten vor Schreibaktionen; UI zeigt Statusbadge `FFG: ACTIVE`.
  - **Gate 2 (Start-Gate):** Blockiert bis `/nc:start` und Stempelverifikation; UI zeigt `LOCKED` $\rightarrow$ `ACTIVE`.
  - **Gate 3 (Safety-Gate):** `permissionDecision: "ask"` erzeugt rotes Eskalationsmodal für Infra-/Deploy-Aktionen.
  - **Gate 4 (PreCompact):** Blockiert die 1. Kompaktierung bei ungesichertem Sitzungswissen.

### Schicht 4: Bilaterales Streaming, State-Sync & UI-Härtung
- **WebSocket (`/api/v1/ws`) + REST (`/api/v1/*`):** Monotones Event-Streaming (`seq`) über WS, Mutationen über REST.
- **60fps RAF-Coalescing:** WebSocket-Deltas werden gepuffert und per `requestAnimationFrame` alle 16,6 ms gebatcht gerendert (verhindert UI-Freezes bei 100+ Tokens/s).
- **2-Stufen-Tool-Virtualisierung:** Tool-Ausgaben über 2.000 Zeichen werden gekürzt; Volltext bleibt als `Blob` im Speicher.
- **Local Loopback Security:** 256-Bit `server.token` (Rechte `0600`) + `#token=` URL-Fragment (wird clientseitig sofort aus der History gelöscht) + Anti-DNS-Rebinding (`Host`-Header-Allowlist) + strikte CSP (keine CDNs).

---

## 3. Review-Ergebnisse & Gehärtete Invarianten (INV-01 bis INV-14)

1. `INV-01`: Tool-Ausführung bleibt deterministisch pausiert bis zur expliziten REST-Freigabe.
2. `INV-02`: Approval-Lease-Timeout führt immer zu `deny` (Fail-Closed).
3. `INV-03`: Mehrfaches Resolven liefert `409 Conflict` ohne doppelte Tool-Ausführung.
4. `INV-04`: Session-Abbruch (`POST /abort`) weist alle offenen Approvals sofort ab.
5. `INV-05`: Start-Gate blockiert Schreib-Tools vor `/nc:start`.
6. `INV-06`: FFG blockiert ununtersuchte destruktive Befehle deterministisch.
7. `INV-07`: Safety-Gate erzwingt `permissionDecision: "ask"` bei Produktiv-Eingriffen.
8. `INV-08`: PreCompact blockiert die 1. Kompaktierung ohne `end-session`, lässt die 2. durch (Loop-Schutz).
9. `INV-09`: REST API verlangt gültigen Bearer-Token (`401 Unauthorized`).
10. `INV-10`: WebSocket-Upgrade verlangt gültiges Token.
11. `INV-11`: Fremde Host-Header (DNS-Rebinding) werden mit `403 Forbidden` abgewiesen.
12. `INV-12`: Cross-Origin-Requests (`Origin: http://evil.com`) erhalten `403 Forbidden`.
13. `INV-13`: `Sec-Fetch-Site: cross-site` wird blockiert.
14. `INV-14`: Path-Traversal in Session-/Datei-Routen wird abgewiesen.

---

## 4. Umsetzungs-Phasen

- **Phase 1: Prozess-Guard & Worker-Host (M0–M1)** — Win32 Job Objects, Dead Man's Switch Pipe, Fastify REST/WS-Server, Token-Auth.
- **Phase 2: Approval-Bridge & Gate-Mapper (M2)** — `canUseTool`-Registry, Diff-Normalizer, Gate-Telemetrie.
- **Phase 3: Bilaterales Streaming & State-Sync (M3)** — RingBuffer-Replay, RAF-Coalescing, Tool-Virtualisierung.
- **Phase 4: SPA-Frontend (M4)** — Chat-Canvas, Modell-Picker, Thinking-Budget-Slider, Approval-Modal, NovaCore-Monitor.
- **Phase 5: Testsuite & Integration (M5)** — Automatisierte Verifikation aller 14 Invarianten.
