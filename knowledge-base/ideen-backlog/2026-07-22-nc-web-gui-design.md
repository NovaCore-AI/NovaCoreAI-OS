# Idee: Design-Spec `/nc:web` — Claude-Code-Web-GUI (Nachbau von kimi `/web`)

> **Status:** Idee ohne Auftrag — für NovaCore **nicht entschieden** und **nicht gebaut**. Der
> geltende Stand des Vorhabens steht im Nachtrag v0.3
> ([SDK-Pivot](2026-07-22-nc-web-gui-design-nachtrag-v0.3-sdk-pivot.md)); dieses Dokument ist die
> **Vorgeschichte** und wird für Kontext und Reuse-Map gebraucht, nicht als Bauanweisung.
> **Herkunft:** portiert aus dem Onsite-Vorbild (dort datiert 2026-07-22, Spec-Version 0.1.0 mit
> eingearbeiteter Dual-Review-Synthese v0.2) am 2026-08-15. Terminologie auf NovaCore gemappt;
> firmenspezifische Passagen des Vorbilds (Branding auf eine fremde Marke) sind entfernt.

---

## §1 Ziel & Vorbild

Claude Code bekommt eine **lokale Web-GUI**, die das kimi-code-`/web`-Feature so nah wie möglich 1:1
nachbildet: **projektübergreifende Chat-Ansicht**, **Modell-/Kosten-Sicht** und die zugehörigen
**QOL-Features**, ausgeliefert im Namespace `nc:`.

**Vorbild kimi `/web` (im Vorbild per Live-Recon verifiziert):** Hono-Server + eingebettete
React/Vite-SPA auf `http://127.0.0.1:58627`, REST unter `/api/v1/*` + eine WebSocket `/api/v1/ws`;
Persistenz rein dateibasiert (`session_index.jsonl`, `workspaces.json`,
`sessions/<ws>/<sid>/{state.json, agents/main/wire.jsonl}`). Features: (a) Modellauswahl, (b)
projektübergreifende Session-Liste, (c) QOL: Suche/Filter, Theme, Kopieren, Token-/Kosten-Anzeige,
Datei-/Diff-Ansicht mit Git-Status, Rename/Delete/Archive/Fork/Export, Thinking-Anzeige,
Tool-Call-Streaming, Approvals, Terminal.

> **Korrektur durch den Nachtrag v0.3:** Diese Stack-Angaben waren teilweise geraten. Belegt ist:
> alles TypeScript, Web = Vue 3 + Vite, Server = Fastify 5 + `ws`. Beim Lesen dieses Dokuments
> vorrangig den Nachtrag heranziehen.

---

## §2 Realitäts-Analyse — der kritische Punkt (funktionale Abhängigkeiten)

kimi `/web` ist kein reiner Viewer: der Webserver **IST die kimi-Agent-Runtime**. Deshalb kann kimi
im Browser live Prompts senden, Modelle pro Session live umschalten, Turns streamen, Tools freigeben
und Terminals betreiben. **Ein Claude-Code-Plugin ist NICHT die Claude-Code-Runtime.** Claude Codes
Sessions liegen als append-only `.jsonl`-Transcripts unter `~/.claude/projects/`. Ein
plugin-gestarteter Server kann diese vollständig **lesen und live mitschreiben-beobachten**, aber er
kann keine Prompts in eine **laufende** Claude-Code-TUI-Session injizieren (keine öffentliche API).

Daraus folgt die ehrliche 1:1-Zerlegung:

| kimi-`/web`-Fähigkeit | In Claude Code 1:1? | Weg |
|---|---|---|
| Projektübergreifende Session-Liste | ✅ voll | `~/.claude/projects/*` enumerieren |
| Transcript rendern (Text/Markdown, tool_use/result, thinking, Anhänge) | ✅ voll | `.jsonl` parsen |
| Modell pro Session anzeigen | ✅ voll | `assistant.message.model` |
| Token-/Kosten-Anzeige | ✅ voll | `assistant.message.usage` aggregieren |
| Datei-/Diff-Ansicht | ✅ voll | `file-history-snapshot/delta`-Records |
| **Live-Aktualisierung** | ✅ voll | `fs.watch` auf `.jsonl` + Push |
| Suche/Filter, Theme, Kopieren, Keyboard-Shortcuts | ✅ voll | SPA |
| Export (JSON/Markdown) | ✅ voll | Server-Route |
| Rename / Archive | ⚠️ als **lokaler Alias** | Sidecar-Datei, NICHT Claudes `.jsonl` mutieren |
| Delete | ⚠️ guarded/aus per Default | destruktiv auf fremden Daten → rote Linie |
| **Prompt senden + Modell wählen + streamen** | ⚠️ nur als **neue** Session | Headless `claude -p --model X` streamen |
| Laufende TUI-Session kapern | ❌ nicht möglich | keine API |
| In-Browser-Tool-Approval einer TUI-Session | ❌ nicht möglich | keine API |
| Beliebige PTY-Terminals | ❌ deferred | Dep-Gewicht + Security |

**Leitprinzip:** Die Beobachtungs-/Browsing-Seite wird **1:1** nachgebaut (inkl. Live-Tail). Die
Steuerungs-Seite wird nur so weit repliziert, wie es **ohne Vortäuschung** möglich ist, und
Nicht-Mögliches wird **explizit dokumentiert**, statt es zu faken.

---

## §3 Scope

### 3.1 Core (MUSS, v1)

1. **Server** (zero-dependency Node, nur Built-ins): statisches SPA-Serving + REST + Live-Kanal.
2. **Workspace/Session-Index** projektübergreifend aus `~/.claude/projects/`.
3. **Transcript-Reader**: robustes JSONL-Parsing (defekte Zeilen tolerieren), Content-Blöcke
   `text | tool_use | tool_result | thinking | image`, Meta-/Hook-Records korrekt behandeln.
4. **SPA** (no-build, ES-Module): Zwei-Spalten-Layout (links Workspaces→Sessions-Baum, rechts
   Transcript), Header mit globaler Suche + Theme-Toggle.
5. **Metadaten je Session:** Titel (`ai-title`, Fallback erste User-Nachricht), Modell(e), Tokens
   (in/out/cache), grobe Kostenschätzung, cwd, gitBranch, createdAt/updatedAt, Nachrichtenzahl.
6. **QOL:** globale Volltext-Suche, Filter (Projekt/Modell/Zeit), Theme dark/light/auto,
   Copy-Buttons, Keyboard-Shortcuts, Markdown+Syntax-Highlighting, Thinking-Blöcke
   ein-/ausklappbar, Token-/Kosten-Panel.
7. **Live-Tail:** `fs.watch` erkennt neue Zeilen/Sessions → Event → UI aktualisiert inkrementell.
8. **Export:** Session als Markdown und als JSON.
9. **Sicherheit:** loopback-only (§7).
10. **Tests:** Unit (Reader/Aggregation/Security) + Integration (HTTP-Routen gegen Fixtures) + ein
    Smoke-Test gegen die echten lokalen Sessions.

### 3.2 Optional (SOLL, v2)

- **Headless-Prompt-Launcher:** in gewähltem Projekt eine **neue** Session via
  `claude -p --output-format stream-json --model <id>` starten und in die UI streamen. Guarded
  (Flag `--enable-launch`), niemals Default.
- **Rename/Archive** als lokale Aliase (Sidecar `~/.claude/nc-web/overlay.json`).

### 3.3 Out of Scope (dokumentiert, nicht gefaked)

Laufende TUI-Session kapern; In-Browser-Approvals einer TUI-Session; beliebige PTY-Terminals; Delete
von Transcripts (nur optional, doppelt guarded).

---

## §4 Datenmodell — Claude-Code-Transcript → Domäne

**Quelle:** `~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl`. Ordnername = `cwd` mit `/`→`-`.
Verlustbehaftet → echten `cwd` bevorzugt aus den Records lesen (Feld `cwd`), Ordnername nur als
Fallback/Label.

**Relevante Record-Typen (synthetische Werte):**

```
ai-title:  { "type":"ai-title", "aiTitle":"Beispiel-Titel", "sessionId":"<uuid>" }
user:      { "type":"user", "message":{"role":"user","content":"…" | [blocks]},
             "timestamp":"2026-07-22T10:00:00.000Z", "cwd":"/pfad", "gitBranch":"main",
             "isMeta":false, "uuid":"…", "parentUuid":"…", "sessionId":"…", "version":"2.1.x" }
assistant: { "type":"assistant", "message":{"model":"claude-opus-5","role":"assistant",
             "content":[{"type":"text","text":"…"}|{"type":"tool_use",…}|{"type":"thinking",…}],
             "usage":{"input_tokens":2,"output_tokens":270,
                      "cache_creation_input_tokens":42672,"cache_read_input_tokens":20347}},
             "timestamp":"…","cwd":"…","gitBranch":"…","sessionId":"…" }
system:    { "type":"system","subtype":"local_command","content":"…","level":"info","timestamp":"…" }
attachment:{ "type":"attachment","attachment":{"type":"hook_success",…},"timestamp":"…" }
file-history-snapshot / file-history-delta: Datei-Backups/Änderungen je messageId
```

**Domänen-Objekte (Server → SPA):**

```
Workspace      = { id, root(cwd), name, sessionCount, lastActivityAt }
SessionSummary = { id, workspaceId, title, model, messageCount, createdAt, updatedAt,
                   gitBranch, usage:{inputTokens,outputTokens,cacheReadTokens,cacheCreationTokens},
                   estimatedCostUsd, cwd }
Message        = { uuid, role, timestamp, blocks:[{kind,…}], model?, usageDelta?, isMeta }
```

Kostenschätzung: Tabelle Modell→USD/1M-Token (in/out/cache), als **Schätzung** gekennzeichnet;
unbekannte Modelle → `null` statt falscher Zahl.

---

## §5 Architektur

**Grundsatz:** zero **Runtime**-Dependencies (Distribution ohne `npm install`), no-build SPA
(Team-Rechner brauchen keine Toolchain). Built-ins: `http`, `fs`, `path`, `crypto`, `child_process`,
`url`, `events`.

- **HTTP/Router:** kleiner eigener Router auf `node:http`, spiegelt das `/api/v1/*`-Namensschema.
- **SPA:** statische Dateien aus `web/public/` — `index.html` + ES-Module, CSS mit CSS-Variablen
  (themebar). Kein Bundler.
- **Filewatch:** `fs.watch(projectsDir,{recursive:true})` (+ Debounce, + Fallback-Poll); Delta = neue
  Byte-Offsets je Datei nachlesen.
- **Sessions/Cache:** In-Memory-Index mit Lazy-Full-Load je geöffneter Session; `mtime`/`size` als
  Invalidierung. Ziel: hunderte Sessions flüssig.

---

## §6 API-Contract

REST, Präfix `/api/v1`, JSON:

| Route | Funktion |
|---|---|
| `GET /api/v1/meta` | Bootstrap: Serverinfo, Modelle (+ Kosten-Tabelle), Workspaces-Übersicht |
| `GET /api/v1/healthz` | Health |
| `GET /api/v1/workspaces` | alle Workspaces |
| `GET /api/v1/sessions?workspace=&q=&model=&since=` | projektübergreifende Session-Liste |
| `GET /api/v1/sessions/:id` | volle Session inkl. Nachrichten (paginierbar `?after=&limit=`) |
| `GET /api/v1/sessions/:id/export?format=md\|json` | Export |
| `GET /api/v1/sessions/:id/files` | Datei-Historie/Diffs der Session |
| `GET /api/v1/search?q=` | globale Volltextsuche über alle Transcripts |
| `POST /api/v1/launch` *(v2, guarded)* | neue Headless-Session starten |
| `GET /api/v1/stream` | Live-Events (SSE, siehe §0) |

Events (Server→Client): `session.created|updated`, `message.created`, `workspace.updated`,
`launch.delta|launch.completed` *(v2)*, `server.hello`.

**Fehlerformat:** `{ "code":"…", "message":"…" }`; `400` Request, `404` nicht gefunden, `503` nicht
bereit.

---

## §7 Sicherheit

- **Default-Bind `127.0.0.1`** (loopback) → kein Token nötig.
- **Nur lesend** außer den guarded v2-Aktionen.
- **Path-Traversal-Schutz:** `sessionId` gegen `^[A-Za-z0-9._-]+$` validieren; Dateizugriffe strikt
  unter `~/.claude/projects/` einsperren (realpath-Prüfung).
- **Transcripts können sensible Inhalte enthalten** → Loopback-Bind ist die Mitigation; keine
  automatische Exfiltration; keine externen Requests aus der SPA (CSP self-only).
- **Kein Secret** in Logs/Code.

---

## §8 Packaging als `/nc:web`

- App liegt selbst-enthalten unter `web/` im Plugin-Root (Server, `public/`, `bin/`, `tests/`,
  README).
- Einstieg **`/nc:web`** als **Command** `commands/web.md` (deterministischer Launch-Auftrag).
  **Format vor Umsetzung gegen die offizielle Claude-Code-Doku verifizieren** (Pflicht aus der
  Source-of-Truth-Regel), plus `claude plugin validate .`.
- Zusätzlich **standalone** nutzbar: `node web/bin/nc-web.mjs [--port] [--host] [--open]`.
- **Kein** Eintrag in `nc-development` — die Web-GUI ist Querschnitt, kein Dev-Workflow.

---

## §9 Datei-Layout (geplant)

```
web/
  bin/nc-web.mjs             # CLI-Einstieg (Arg-Parsing, Serverstart, Browser-Open)
  server/
    index.mjs                # Server-Bootstrap
    router.mjs               # Mini-Router auf node:http
    stream.mjs               # SSE (siehe §0 A1)
    security.mjs             # Origin/CSRF/CSP, Path-Guards
    claude-store.mjs         # Enumeration Workspaces/Sessions aus ~/.claude/projects
    transcript.mjs           # JSONL-Parser → Message-Blöcke
    aggregate.mjs            # Usage/Kosten/Metadaten
    watcher.mjs              # fs.watch + Delta-Tail
    pricing.json             # datierte Kostentabelle
    routes/*.mjs             # meta, sessions, search, export, files, launch(v2)
  public/
    index.html, styles.css, app.js, api.js, stream.js, markdown.js,
    theme.js, components/*.js, vendor/{marked.min.js,purify.min.js}
  tests/                     # node:test Fixtures + Unit/Integration
  README.md
commands/web.md              # /nc:web
```

## §10 Teststrategie

**`node:test`** (Built-in) — keine Test-Deps. Fixtures: synthetische `.jsonl`-Projekte im Temp-Dir.
Integration: Server auf Random-Port, echte HTTP-Requests, JSON-Assertions. Security-Tests:
Origin-Allowlist, CSRF-Header, Path-Traversal-Abwehr. Smoke: gegen echte `~/.claude/projects/` (nur
lesend). Ziel-Coverage Kernlogik hoch; SPA manuell + Browser-QA.

## §11 Meilensteine / Slices

1. **S1 Reader-Kern:** `claude-store` + `transcript` + `aggregate` + Unit-Tests (TDD).
2. **S2 Server/Routen:** Router + REST + Integrationstests.
3. **S3 SPA:** Liste + Transcript-Rendering + Suche + Theme + Copy.
4. **S4 Live:** SSE + Watcher + inkrementelles UI-Update.
5. **S5 Sicherheit/Härtung** + Security-Tests.
6. **S6 v2 (optional):** Headless-Launcher.
7. **S7 Branding.** **S8 Maintenance** (Doku/CHANGELOG/Version-Bump/Tag).

## §12 Risiken

- `fs.watch` recursive-Zuverlässigkeit plattformabhängig → Poll-Fallback.
- Große Transcripts (mehrere MB) → Streaming-Parsing + Pagination.
- Markdown-Rendering = XSS-Risiko → vendored `marked` + `DOMPurify`, kein `innerHTML` ohne
  Sanitisierung.
- Kosten-Tabelle veraltet → als Schätzung labeln, zentral pflegbar.
- Plugin-Command-Format nicht verifiziert → Doku-Check + `plugin validate` vor Merge.

## §13 Branding-Phase (Zusatz-Goal, am Ende)

Nach funktionalem Feature + Reviews: UI an die Marke anpassen, unter der die GUI ausgeliefert wird.
Deshalb die SPA von Anfang an über **CSS-Variablen** themebar (ein zentrales Token-Set), damit
Branding ein isolierter Schritt bleibt. *(Im Vorbild war hier eine konkrete Fremdmarke genannt; für
NovaCore ist die Zielmarke offen.)*

## §14 Offene Fragen

1. v2-Headless-Launcher in denselben Bau aufnehmen oder als Folge-Iteration?
2. Rename/Delete-Semantik: Sidecar-Alias-Ansatz ausreichend, oder ganz weglassen?
3. Command vs. Skill für `/nc:web` — was ist robuster/konventionskonform?
4. Übersehene funktionale Abhängigkeit aus kimi `/web`, die 1:1 doch möglich wäre?

---

## §0 Review-Synthese v0.2 (VERBINDLICH — überschreibt bei Konflikt §1–§14)

**Status:** Im Vorbild am 2026-07-22 dual-reviewed (Codex + kimi, beide `request_changes`), hier
vollständig eingearbeitet.

### Architektur (revidiert)

- **A1 — SSE statt WebSocket.** Live-Updates via `GET /api/v1/stream` (`text/event-stream`). Kein
  handgerollter RFC-6455-Server. Client→Server ausschließlich REST.
- **A2 — Markdown: vendored `marked` + `DOMPurify`** als eingecheckte Dateien unter
  `web/public/vendor/` (kein `npm install` nötig; KEIN Eigenbau-HTML-Renderer). Raw HTML aus,
  externe Medien aus.
- **A3 — cwd-Quelle: `~/.claude.json` `projects`-Map** (rohe cwd-Keys) autoritativ; Ordner-Encoding
  (`/`→`-`) und Record-`cwd` nur Fallback.
- **A4 — Parser partial-line-safe & versioniert:** letzte JSONL-Zeile evtl. unvollständig (aktive
  Session) → Offset halten, später erneut versuchen; unbekannte Record-Typen in `unknownRecords`
  sammeln statt still verwerfen.
- **A5 — Incremental-Tail-State je Datei** `{dev,ino,size,mtime,offset,partialLine}`; `fs.watch` NUR
  Invalidierungs-Hinweis + periodischer Reconcile + Poll-Fallback; Truncate/Replace/Rename
  behandeln; dedupe per `uuid`.
- **A6 — Pagination-Cursor = Zeilenindex** (append-only stabil) oder `uuid`, NICHT `seq`.
  Aggregation (usage/cost) gecacht per `(file,size)→totals` + Tail-Update statt Full-Scan.

### Sicherheit (verbindlich, v1)

- **SEC1 — Loopback-only.** Non-loopback wird abgelehnt (klare Meldung). Kein Token-Pfad in v1.
- **SEC2 — Origin/`Sec-Fetch-Site`-Check auf ALLEN Routen** (inkl. GET/SSE): fehlender oder nicht in
  der Allowlist (`http://127.0.0.1:<port>`, `http://localhost:<port>`) liegender Origin → `403`.
  Verteidigt localhost gegen beliebige Websites (Browser erzwingen für SSE/simple-GET keine SOP).
- **SEC3 — CSRF:** non-GET-Routen verlangen zusätzlich den Custom-Header `X-NC-Web: 1`.
- **SEC4 — CSP exakt:** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'
  data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'` +
  `X-Content-Type-Options: nosniff`. Keine Inline-Handler (separate `.js`-Module).
- **SEC5 — Path-Guards:** `sessionId ^[A-Za-z0-9._-]+$`; alle Datei-/Static-Zugriffe
  realpath-eingesperrt (`~/.claude/projects/` bzw. `web/public/`), Symlink-Escape blocken.
- **SEC6 — Export-Header:** `Content-Disposition: attachment` + nicht-HTML `Content-Type`.
- **SEC7 — Limits:** Request-/Header-/Response-/SSE-/Such-Limits gegen lokalen DoS; riesige
  `tool_result`/base64 einklappen/kappen.

### Scope v1 (verbindlich) — ehrlicher Name: **„Session Browser"**

Read-only projektübergreifender Session-Browser · robustes versioniertes Transcript-Rendering ·
sichere Markdown-Darstellung · paginierte Session-Ansicht · Modell-/Token-/Kosten-Anzeige
(Schätzung; datierte `pricing.json`; cache-read vs. -write getrennt) · Live-Updates via SSE
(`fs.watch`+Poll) · Suche/Filter · Theme dark/light/auto · Copy · JSON/MD-Export · loopback +
Origin/CSRF/CSP. Kein Rename/Delete in v1.

### Fixtures/Schema — Vorbedingung vor S1

Synthetische `.jsonl`-Fixtures, die das **gegen echte Daten verifizierte** Schema exakt spiegeln.
**Keine echten (evtl. sensiblen) Transcripts einchecken.** Der Read-only-Smoke-Test läuft gegen die
echten `~/.claude/projects/`.

---

*Portiert 2026-08-15 aus dem Onsite-Vorbild in die NovaCore-Wissensbasis; `oai`→`nc` gemappt,
fremdmarken- und fremdrepo-spezifische Passagen entfernt. Ursprung dort: autonomer Bauauftrag,
Architekt Lucas Vöhringer, 2026-07-22.*
