# Idee: Nachtrag v0.3 — `/nc:web` Pivot von Read-Only-Viewer zu SDK-gestützter interaktiver GUI

> **Status:** Idee ohne Auftrag — für NovaCore **nicht entschieden** und **nicht gebaut**. Dies ist
> der **geltende Stand** des Web-GUI-Vorhabens; die Vorgeschichte steht in
> [Design-Spec v0.1/v0.2](2026-07-22-nc-web-gui-design.md).
> **Herkunft:** portiert aus dem Onsite-Vorbild (dort datiert 2026-07-22) am 2026-08-15.
> Terminologie auf NovaCore gemappt. **Vor jeder Umsetzung neu verifizieren:** Die SDK-/CLI-Belege
> des Vorbilds stammen von 2026-07-22 — Claude Agent SDK und CLI ändern sich; die Quellen sind
> erneut abzurufen, nicht aus diesem Dokument zu übernehmen.

---

## §0 Warum dieser Nachtrag (Kernkorrektur)

Die v1-Spec hat das Feature als **Plugin** geframt und daraus korrekt gefolgert, dass die
**Steuer-Seite** (Prompt senden, Modell wählen, Tools freigeben) unmöglich sei — und nur die
**Beobachtungs-Seite** (Read-Only-Session-Browser) gebaut. Das verfehlt das eigentliche Ziel
(„kimi `/web` nachbilden").

**Der Denkfehler:** „Ein *Plugin* kann die TUI nicht steuern" ≠ „*Claude Code* kann nicht per GUI
gesteuert werden". kimi `/web` funktioniert, weil **der Webserver die Agent-Runtime IST**. Genau das
ist reproduzierbar — nicht als Plugin, sondern als **eigenständige App auf dem Claude Agent SDK**.

**Korrigierte Zielarchitektur:**

- **`nc`-Plugin** = Verteil-/Management-Schicht: Installer/Launcher. Es *trägt* die Funktion nicht
  selbst — es installiert und managt sie.
- **Standalone Agent-SDK-App** (deployt z. B. nach `~/.claude/nc-web/`) = die echte Engine.
- Die Viewer-Arbeit aus v1 wird nicht weggeworfen, sondern zur **Browse-/History-Komponente**.

> **Abweichung zu NovaCore:** Das Vorbild nennt hier `/oai:setup` **und** `/oai:update` als
> Management-Einstiege. Bei uns existiert `/nc:setup` (`plugins/nc/skills/setup/`), ein `/nc:update`
> aber **nicht** — „Update" läuft über die Marketplace-Mechanik (`/plugin update` bzw. Auto-Update
> nach Versions-Bump). Ein Deploy-/Update-Weg für die App wäre also neu zu entwerfen, nicht an einen
> bestehenden Skill zu hängen.

---

## §1 Belegte Grundlagen — kimi-`/web`-Anatomie

Quellen im Vorbild: laufende Instanz (`127.0.0.1:58627`, live abgeklopft) + `MoonshotAI/kimi-code`
(MIT). **Korrigiert die v1-Spec-Vermutungen** (Python-Kern/React/Hono — alles falsch geraten).

| Aspekt | Belegte Realität |
|---|---|
| Stack | Alles **TypeScript**. Web = **Vue 3 + Vite**. Server = **Fastify 5 + `ws`**. Runtime = `agent-core-v2` + `kosong` (LLM-Layer) |
| **Prozess-Kopplung** | **Ein Prozess, Runtime eingebettet** — kein IPC/Daemon. `/web` macht den TUI-Prozess selbst zum Server |
| **Aufgabenteilung** | **WS = nur Event-Streaming** (read-only für Aktionen). **REST = alle Aktionen** (Prompt, Modell, Approval, Abbruch, Resume). WS client→server nur `subscribe`/Cursor |
| Streaming | WS pusht `assistant.delta` / `thinking.delta` / `tool.call.delta` / `turn.step.*`, mit kumulativem `offset` + `seq/epoch`-Resync |
| **Tool-Approval** | Runtime blockiert auf in-process Promise (`interaction.request` → Phase `awaiting_approval`); Browser löst per **REST** `POST /approvals/{id}` → `interaction.respond` → Promise aufgelöst |
| Modellwahl | Liste **provider-discovery-getrieben** (nicht hardcoded); Wahl **pro Prompt** (`body.model`); Mid-Session-Wechsel = nächster Prompt |
| Auth | File-Token `<home>/server.token` (0600) → SPA per URL-Fragment `#token=` (client-only, nie an Server/Log) → dann `Authorization: Bearer` auf REST+WS; auf allen `/api` erzwungen |
| Launch | `/web` = neuer Vordergrund-Server im selben Prozess; Port 58627 (+1 bei Konflikt); Deep-Link im Browser; kein PID-Reuse |
| Persistenz | `session_index.jsonl`, `workspaces.json`, pro Session `state.json` + `wire.jsonl`, Event-Journal, Instanz-Registry |

---

## §2 SDK-Feasibility (Stand des Vorbilds — vor Umsetzung neu prüfen)

Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) / headless `claude -p`:

| Benötigt | Status (2026-07-22) | Nachweis im Vorbild |
|---|---|---|
| Streaming-Input (mehrturnig, persistent) | ✅ | `query({ prompt: AsyncGenerator<SDKUserMessage> })` |
| **`canUseTool`-Callback** (Approval-Linchpin) | ✅ | `canUseTool(toolName, input, opts) → {behavior:'allow',updatedInput} \| {behavior:'deny',message}`; vor jedem Tool awaited |
| Streaming-Output | ✅ | `includePartialMessages` → `message_start`/`content_block_delta`/… |
| Modellwahl | ✅ | `options.model` + `query.setModel(...)`; empirisch per `claude -p --model <id>` bestätigt |
| Resume | ✅ | `resume`/`continue`/`forkSession`; `~/.claude/projects/<cwd>/<sid>.jsonl` |
| **Lokale Abo-Auth (kein API-Key)** | ✅ | empirisch: `ANTHROPIC_API_KEY` unset, `claude -p` antwortet. Das SDK spawnt das CLI-Binary → erbt die lokale Abo-Auth |

**Einordnung des Vorbilds:** Die Hosting-Doku verlangt einen API-Key — das gilt für den
**Container-/Server-Deployment**-Kontext ohne interaktiven Login. Lokal (jede Person auf ihrem
eigenen Login) war kein API-Key nötig.

**Offen / nicht-technisch:** Ob die Anthropic-ToS intensive programmatische Nutzung persönlicher
Abos für ein verteiltes Team-Werkzeug decken. Technisch identisch zur normalen Claude-Code-Nutzung —
juristisch eine eigene Frage, **vor** einem Team-Rollout zu klären.

---

## §3 Zielarchitektur

```
┌───────────────────────────────────────────────────────────────┐
│  nc-Plugin (Verteilung/Management — trägt die Funktion NICHT)  │
│  · /nc:setup   · /nc:web → startet & öffnet die App            │
│  · Update-Weg offen (kein /nc:update; Marketplace-Mechanik)    │
└───────────────────────────┬───────────────────────────────────┘
                            │ installiert / launched
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  nc-web-App (Standalone, ~/.claude/nc-web/) — DIE Engine       │
│                                                                │
│  Node-Server                                                   │
│   ├─ REST /api/v1/*  (ALLE Aktionen)                           │
│   │    prompts · approvals · model · abort · sessions · resume │
│   ├─ WS  /api/v1/ws  (NUR Event-Streaming an den Browser)      │
│   ├─ Token-Auth (server.token 0600 + #token=-Fragment)         │
│   └─ Static-SPA-Serving + Security (loopback/Origin/CSP)       │
│                                                                │
│  Eingebettete Runtime: @anthropic-ai/claude-agent-sdk          │
│   ├─ Streaming-Input-Session (Prompt-Queue je Session)         │
│   ├─ canUseTool  ──► Approval-Brücke (offenhalten bis REST)    │
│   └─ Stream-Events ──► WS-Push                                 │
│                                                                │
│  SPA (Browser)                                                 │
│   ├─ [WIEDERVERWENDET aus v1] Session-Liste, Transcript-View   │
│   └─ [NEU] Compose-Feld, Modell-Picker, Approval-Dialog        │
└───────────────────────────────────────────────────────────────┘
```

**Approval-Brücke (der Kernmechanismus):**

1. SDK ruft `canUseTool` → wir geben ein **Promise zurück und halten es offen**.
2. Server meldet die Pending-Approval per **WS** an den Browser (Status-Event + Detail).
3. Browser antwortet per **REST** `POST /api/v1/sessions/{sid}/approvals/{aid} {decision}`.
4. Der REST-Handler **resolved das offene `canUseTool`-Promise** → SDK fährt fort (allow/deny).

Das ist exakt kimis „blockierendes `interaction.request` + REST-`respond`" — nur ist bei uns
`canUseTool` der Blockierpunkt statt eines eigenen Interaction-Kernels.

---

## §4 Verbindliche Übersetzungstabelle — kimi → Claude (NICHT klonen, übersetzen)

| kimi-Konzept | Claude-Pendant | Anmerkung |
|---|---|---|
| `swarm_mode` | **Subagenten** (Task/Agent-Tool; SDK `agents`) + Multi-Agent-Orchestrierung | Kein „Swarm"-Toggle; spawnbare Subagenten. **v1: out of scope** |
| `plan_mode` | Nativer **Plan-Mode** (`permissionMode:'plan'`) | Claude first-class |
| `permission_mode` | `permissionMode` (default/acceptEdits/plan/bypassPermissions) | 1:1 |
| `thinking` / effort | **Extended Thinking** / thinking-effort | 1:1 |
| `disabled_tools` | `disallowedTools` / `allowedTools` | 1:1 |
| `agent_id` / Profiles | **Subagenten** / custom Agent-Definitionen | |
| Terminals (xterm/PTY) | **Nur Bash-Tool-Ausgabe** anzeigen | Kein Browser-PTY im SDK — ehrliche Grenze, nicht faken |
| Provider-Modell-Katalog | **Account-Modelle** | Aus SDK/CLI ermitteln, **nicht hardcoden** (das war ein v1-Bug) |
| seq/epoch-Resync-Journal | Eigenbau falls nötig | **v1: weglassen** (kein Multi-Device) |

**Leitprinzip:** Was Claude first-class hat, wird über Claudes API abgebildet — nicht über einen
kimi-Nachbau. Nicht-Übertragbares wird **dokumentiert, nicht vorgetäuscht**.

---

## §5 MVP-Scope (v1 der echten App)

**Dünner vertikaler Schnitt — end-to-end funktionsfähig:**

1. Server startet (loopback, Token-Auth), öffnet Browser mit `#token=`.
2. **Ein** Workspace (cwd), Session-Liste + Transcript-Ansicht **[Reuse aus v1-Viewer]**.
3. **Neuer Chat** in diesem Workspace.
4. **Modell-Picker** — Wert an den SDK-Turn.
5. **Prompt senden** (REST) → SDK-Streaming-Session.
6. **Antwort streamen** (WS): Text + Thinking + tool_use/tool_result.
7. **Tool-Approval im Browser** (Approval-Brücke) — Default-**Deny** bis Klick.
8. **Resume** einer bestehenden Session (`options.resume`).

**Bewusste Nicht-Ziele v1:** Swarm/Multi-Agent-Toggle, Terminals/PTY, Multi-Device-Resync
(seq/epoch), fs-watch-Feinheiten, Rename/Archive/Delete, mehrere Workspaces gleichzeitig,
Remote-Zugriff (nur loopback).

---

## §6 Reuse-Map (aus dem v1-Viewer übernehmen)

| v1-Artefakt | Rolle in v2 |
|---|---|
| `server/transcript.mjs` (JSONL-Parser) | Transcript-Rendering der History-Seite |
| `server/claude-store.mjs` (Enumeration, Path-Guards, Cache) | Session-/Workspace-Liste |
| `server/aggregate.mjs` (Usage/Kosten) | Token-/Kosten-Panel |
| `server/security.mjs` (loopback/Origin/CSP) | Basis-Härtung — **erweitern um Token-Auth** |
| `server/router.mjs`, Static-Serving | Routing-Grundgerüst |
| SPA-Shell (`public/`, Design-Tokens, Theme) | UI-Rahmen — **erweitern um Compose/Picker/Approval** |
| Tests (`web/tests/`) | Basis für erweiterte Suite |

**Ersetzt/entfällt:** die „das ist nur read-only, v2 unmöglich"-Doku-Aussagen; hardcodierte
Modell-Liste. `pricing.json` bleibt als Schätzung.

---

## §7 Build-Phasen (TDD, je Slice grün + Selbst-Review)

- **S0 — Gerüst:** App-Skelett, SDK-Dependency, Token-Auth-Layer (`server.token` + `#token=` +
  Bearer-Enforcement auf `/api`), Reuse-Module einhängen. Test: 401 ohne Token, 200 mit.
- **S1 — SDK-Session-Kern:** Streaming-Input-Session pro `sessionId`, `options.model`, Prompt-Queue.
  REST `POST /sessions/{id}/prompts`. Test: Prompt → `ResultMessage`, Modell greift.
- **S2 — WS-Event-Stream:** SDK-Stream-Events → WS-Push (`assistant.delta`/`thinking`/`tool.*`).
  Test: Frame-Sequenz bei einem Turn.
- **S3 — Approval-Brücke:** `canUseTool` offenhalten → WS-Pending-Event → REST-Resolve. Test: Deny
  blockiert Tool, Allow lässt es laufen; Default-Deny bei Timeout.
- **S4 — SPA-Steuerung:** Compose-Feld, Modell-Picker, Approval-Dialog, Live-Stream-Rendering.
- **S5 — Resume + Browse:** bestehende Session fortsetzen; History-Liste [Reuse] verdrahten.
- **S6 — Plugin-Integration:** `/nc:web`-Launcher, Deploy nach `~/.claude/nc-web/`, Deploy-Manifest
  für Orphan-Cleanup.
- **S7 — Härtung + Release:** Security-Re-Review (Token, Origin, CSP, Approval-Default-Deny,
  Path-Guards), Version-Bump nach `standardprozesse/aktualisierungs-index.md` §3, CHANGELOG,
  `claude plugin validate`.

---

## §8 Sicherheit (Pflicht — über v1 hinaus)

- **Token-Auth Pflicht** auf allen `/api` + WS-Upgrade. Loopback + Origin/`Sec-Fetch-Site`
  zusätzlich. Token nie loggen, nie an die Server-URL hängen.
- **Approval Default-Deny:** `canUseTool` verweigert, solange der Browser nicht explizit zustimmt;
  Timeout → Deny. Destruktives niemals auto-approven.
- **CSP** wie v1 (keine Inline-Scripts), vendored Libs.
- **Rote Linien** des OS gelten auch hier: keine Auto-Merges, keine Auto-Deploys, keine
  Auto-Approvals durch die App.

---

## §9 Offene Entscheidungen / Risiken

1. **ToS Abo vs. API** (nicht-technisch) — vor Team-Rollout klären; ggf. Option auf zentralen
   API-Key (`ANTHROPIC_API_KEY`/`ANTHROPIC_BASE_URL`) als Fallback vorsehen.
2. **App-Distribution:** Quelle im Plugin-Repo gebündelt vs. beim Setup gefetcht (Größe vs.
   Update-Kontrolle). Empfehlung: gebündelt (offline-fähig, versionssynchron mit dem Plugin).
3. **SDK-npm vs. `claude -p`-Spawn:** Das SDK gibt `canUseTool` als sauberen JS-Callback →
   Empfehlung SDK. Fallback `claude -p --input-format/--output-format stream-json` bleibt möglich.
4. **Deploy-Ziel** `~/.claude/nc-web/` vs. plugin-internes Verzeichnis — mit dem Update-Weg
   abstimmen, der bei uns noch nicht existiert (§0).
5. **Runtime-Dependency-Bruch:** Das v1-Prinzip „zero Runtime-Dependencies" fällt mit dem SDK. Ob
   das OS ein `npm install` beim Nutzer akzeptiert, ist eine Grundsatzentscheidung — sie
   widerspricht der bisherigen Verteilannahme.

---

*Portiert 2026-08-15 aus dem Onsite-Vorbild in die NovaCore-Wissensbasis; `oai`→`nc` gemappt,
Management-Einstiege gegen den realen Skill-Bestand korrigiert. Ursprung dort: 2026-07-22.*
