# Bauplan: `ncpit` — Terminal-Cockpit für NovaCore-OS (2026-09-05)

> **Status:** lebend — GO des Maintainers am 2026-09-05 nach Plan-Review Revision 2
> (Revision 1 wurde mit drei Klärungspunkten und Sachkorrekturen zurückgewiesen; die
> Klärungen sind als Phase 0 in diesen Plan eingearbeitet).
> **Herkunft:** Idee
> [`ideen-backlog/2026-09-05-cli-team-cockpit.md`](../ideen-backlog/2026-09-05-cli-team-cockpit.md)
> (bleibt liegen — Herkunft ≠ Arbeit).
> **Spec-Bezug:** Nachtrag 2026-09-05 der
> [`grundwissen/2026-07-28-multi-plugin-architektur-design.md`](../grundwissen/2026-07-28-multi-plugin-architektur-design.md)
> (Präzisierung des CLI-Verzichts auf die Verteilerrolle).
> **Pflege:** Lucas Vöhringer · Sprache: Deutsch.

## 1. Auftrag & Leitentscheidung

Eine CLI für das NovaCore-OS als **Team-Cockpit**, das die Beobachtungslücke zwischen den
Claude-Code-Sessions schließt. Richtungsentcheide des Maintainers: **Team-Cockpit**
(Maintainer-Werkzeugkasten nur Ausblick) · **Node.js + TypeScript** · **eigenes Projekt**
`~/Projects/nc-cli` als Schwesterschiff von nc-cockpit · **hybrid** (scriptbare Befehle +
TUI-Board).

**Rollenteilung zum Cockpit:** Das Cockpit bedient, die CLI beobachtet. nc-cockpit steht
„weg von CLI, hin zu Buttons" — `ncpit` macht die Beobachtungsseite im Terminal, ohne
Session.

**Randnotiz aus dem Session-Start (nicht Aufgabe dieses Plans):** OS-Repo hat Commits bis
2026-09-04, Roll-up und Journal enden am 2026-08-26 — mindestens ein Vortag ohne
Session-Abschluss. Nachzug nur auf Ansage per `/nc:end-session`.

## 2. Invarianten (nicht verhandelbar)

1. **Die CLI schreibt niemals OS-Zustand.** `infra.json`-Invariante „ein Beleg, ein
   Schreiber" (`/nc:setup`) — `ncpit` liest nur. Gleiches für Sitzungswissen, Queue,
   Stempel, Marker, Hook-States. Eigene Schreibzugriffe ausschließlich eigener
   Cache/Config unter `~/.cache/ncpit/` bzw. `~/.config/ncpit/`.
2. **Keine personenbezogenen Pfade im Code.** OS-Pfade werden zur Laufzeit über die
   Fallback-Kette (§ 4) bzw. `cwd` aufgelöst.
3. **Netzzugriff nur explizit** (`gh` nur bei `--live`, Budget + eigener Cache).
4. **Keine Verteilerrolle** — nichts installiert, updated oder bootstrapt das OS (Onsite
   D24 „init-cli-bootstrap-und-auto-update", Status B, bleibt gesperrt; nach Merge des
   Onsite-Plans wird eine Anpassung explizit geprüft).
5. **Deutsch** für UI, Hilfe, Tests, Doku.
6. **Vertragsklassen sauber behandeln:** `infra.json`, `pr-sichtbarkeit.json` tragen
   `schemaVersion` → strenge Prüfung mit kontrollierter Degradation (Vier-Zustände-Muster
   fehlt · neuer · defekt · grün). Stempel- und Marker-Dateien sowie die undokumentierte
   `installed_plugins.json` haben kein stabiles Schema → nur mit Fehlanzeige/„Best effort"
   lesen, **nie mit Crash**; jede Ausgabe kennzeichnet ihre Quelle und deren Stand.
7. **Windows in V1 ausdrücklich ausgeschlossen** (README-Absatz), Pfad-Code von Tag 1 an
   mit `node:path` ohne hartkodierte Separatoren; Windows-Fähigkeit ist M4-Aufgabe (dann
   CI-Matrix analog OS). V1-Ziel: Linux/WSL/macOS.

## 3. Projekt, Name, Verteilung

- **Verzeichnis:** `~/Projects/nc-cli` · **Paketname & Binärname:** `ncpit`
  (Reserve-Alternative `ncdeck` — offener Punkt § 10).
- **Namensbegründung:** `ncos` ist verworfen — ONBOARDING.md weist Migrierende an, den
  alten globalen `ncos`-Befehl vom PATH zu nehmen; ein neues `ncos` kollidierte mit
  Alt-Installationen aus v0.2.0 und mit dieser Anleitung.
- **Verteilung V1 = Maintainer-lokal (Pilot auf eigener Maschine):** `dist` wird vor dem
  Install gebaut (tsup), `package.json` trägt `"files": ["dist"]`, Install aus dem
  Projektverzeichnis `npm install -g .` — ohne Scripts, da `dist` fertig vorliegt
  (global steht npm `ignore-scripts=true`; `prepare`/`postinstall` laufen nicht).
  **Team-Verteilung ist M4-Entscheid:** GitHub-Release-Tarball mit vorgebautem `dist`
  (Empfehlung) oder npm-Publish. Kein Team-Rollout davor.
- **Repo-Heimat** (offen, § 10): GitHub-Anlage später in der Org **NovaCore-AI** oder
  privat — in der Org gilt das Merge-Verbot ohne Zustimmung von Lucas Vöhringer.

## 4. Datenquellen (verifiziert am 2026-09-05)

| Quelle | Pfad | Vertrag | Liefert |
|---|---|---|---|
| Plugin-Installation | **primär:** `claude plugin list` (wie `os-info`); **Fallback:** `~/.claude/plugins/installed_plugins.json` (version 2, undokumentiertes Internum) | kein stabiles Schema → Formwächte | installierte Plugins, Versionen, `installPath` |
| Infra-Registry | `~/.claude/nc/infra.json` | schemaVersion 1 | `kernRepoPfad` (kann **„ausstehend"** sein), `kernSsotPfad`, `ssotAblage`, Abteilungen, `zuletztGeprueft` — heute nur S0, S1, S2, S4, S5; **fehlende S-Einträge ausweisen**, nicht zu „S0–S6" glätten |
| Marketplace-Klon | `~/.claude/plugins/marketplaces/novacore-os/` (git) | intern | verfügbare Versionen → Update-Delta |
| PR-Cache | `~/.claude/nc/pr-sichtbarkeit.json` | schemaVersion 1 | offene PRs je Repo, `geprueft`/`stand` |
| SSOT-Lesekopie | `~/.nc/ssot/<repo>/` (git) | intern | HEAD-Vergleich gegen Kern-Repo → Drift ist echter Doctor-Befund (damals: Kopie `405ab4e`, Kern `b4406f0`) |
| Kern-Wissen | Fallback-Kette **installPath → kernRepoPfad (falls ≠ „ausstehend") → kernSsotPfad**, je mit Stand-Kennzeichnung | intern | `VERSION`, `module-registry.json` (maßgeblich: die im installierten Plugin-Cache), `knowledge-base/sitzungswissen/` (Abteilungsordner `gemeinsam/`), `knowledge-base/kandidaten-queue/queue.md`, `knowledge-base/aktive-bauplaene/` |
| Queue-Lauf-Marker | `~/.claude/nc/queue-lauf.json` (nc-queue-faelligkeit.js, stateDir) | kein Schema → Best effort | letzter Lauf; fehlt die Datei, ist **„nie gelaufen" eigener Zustand** |
| FFG-/Gate-State | **primär:** `~/.claude/plugins/data/nc-novacore-os/ffg/`; tmpdir nur Fallback (nc-ffg.js) | kein Schema → Best effort | Gate-Aktivität, Routine-Bash-Belege |
| Start-Stempel (Sessions) | tmpdir-Stempel | kein Schema | nur „Stempel jünger als 30 Minuten" ist eine Aussage; verfallene, ungelöschte Stempel sind Rauschen — Anzeige als gekennzeichnete Näherung, Doctor nennt die Zahl alter Stempel informativ |
| Doks-Ebenen | `~/.claude/CLAUDE.md`, `~/.claude/nc-teamsync.md` | intern | Firmenblock-Marker-Paar-Intaktheit, Versions-Stempel |

Umgebung (verifiziert): Node 24, Claude Code 2.1.261, gh 2.96 vorhanden.

**Bewusst gestrichen (V1):** `wo <thema>` und jeder Sucheindex-Reader — der Sucheindex ist
Hook-Internum (46 Einträge), kein öffentlicher Vertrag; `ncpit wo` wäre die fünfte
Implementierung der Index-Auflösung, und das Register führt die Doppelpflege der vier
Router bereits als offenen Strang. `wo` nur, wenn der OS einen öffentlichen Vertrag
schafft oder der Router-Dedup-Strang gelöst ist (M4).

## 5. Architektur

```
nc-cli/
├── package.json            # name ncpit, bin: { "ncpit": "dist/cli.js" }, files: ["dist"]
├── tsconfig.json           # NodeNext, strict
├── src/
│   ├── cli.ts              # Commander-Root, Hilfe, Versionsbanner, Dispatch
│   ├── quellen/            # Lese-Schicht (read-only)
│   │   ├── installation.ts # claude plugin list primär, installed_plugins.json Fallback
│   │   ├── infra.ts        # infra.json, Vier-Zustände, S-Ausweisung, „ausstehend"
│   │   ├── pfade.ts        # Fallback-Kette installPath → kernRepoPfad → kernSsotPfad
│   │   ├── marketplace.ts  # Marketplace-Klon → verfügbare Versionen
│   │   ├── registry.ts     # module-registry.json aus dem installierten Cache
│   │   ├── sitzungswissen.ts # roll-up, offene-straenge-register, stand.md, journal/
│   │   ├── queue.ts        # queue.md + queue-lauf.json + 14d/+1d-Takt (nur gelesen)
│   │   ├── prs.ts          # pr-sichtbarkeit.json + optional gh --live
│   │   ├── doks.ts         # Firmenblock-Marker + teamsync-Stempel
│   │   ├── gates.ts        # hooks.json der installierten Plugins; FFG data/ primär
│   │   └── git.ts          # branch/status/log, HEAD-Vergleich Kopie vs. Kern
│   ├── modelle/            # Domänen-Typen + Aggregation (Statusbild, Doctor-Befund)
│   ├── befehle/            # status, doctor, journal, stand, queue, prs, familie, gates
│   ├── ui/
│   │   ├── ausgabe.ts      # Farben, Ampeln, Tabellen, relative Zeiten (nicht-TUI)
│   │   └── board/          # Ink-TUI: Board.tsx, Tabs, MiniOrbit.tsx
│   └── util/               # zeit.ts, env.ts (NO_COLOR, CI/Nicht-TTY)
└── tests/                  # vitest + fixtures/ (anonymisierte infra.json, queue.md, …)
```

**Performance-Regel:** Ink/React nur im Board laden (dynamischer Import); Einzelbefehle
ohne TUI-Framework, Ziel <100 ms.

## 6. Befehlskatalog V1

| Befehl | Inhalt |
|---|---|
| `ncpit` / `ncpit board` | Interaktives Dashboard (§ 7) |
| `ncpit status` | Kompakt-Gesamtbild: Versionen (mit Quellenkennzeichnung), Setup-Ampel mit vorhandenen/fehlenden S-Einträgen, Gate-Zeile, Queue-Zustand (nie gelaufen / fällig in X / ruhig bis Y), offene PRs, letzter Journaleintrag, offene Stränge |
| `ncpit doctor` | Geordnete Prüfliste, Ampeln, Exit 1 bei Befund: Werkzeug-Versionen (node/claude/gh) · infra.json-Vier-Zustände inkl. fehlender S-Einträge · SSOT-Kopie: vorhanden/git/HEAD-Drift/dirty · Firmenblock-Marker paarweise · teamsync-Stempel · Update-Delta installiert vs. Marketplace · Parallelschaltungs-Warnung (nc + nc-felix/nc-biggi installiert → Gates doppelt) · npm ignore-scripts-Hinweis · alte Start-Stempel (informativ) |
| `ncpit journal [-n] [--abteilung]` | Journal-Timeline (`--json`) |
| `ncpit stand` | roll-up + Offene-Stränge-Register gerendert |
| `ncpit queue` | Zustand aus queue-lauf.json + Fälligkeitsrechnung (Logik identisch gelesen, nie geschrieben) + Queue-Zeilen |
| `ncpit prs [--live]` | PRs aus Cache; `--live` via `gh`, schreibt nur eigenen Cache |
| `ncpit familie` | Installierte Familie: Kern/Abteilungen/Affiliates, Versionen, Skill-Zählung aus der Cache-Registry; `--skills` = volles Verzeichnis (`/nc:os-info` von der Shell) |
| `ncpit gates` | Gate-Katalog: Name, Event, Opt-out-Env, Aktivität; FFG-State aus `data/` (tmpdir-Fallback); Start-Stempel nur als „jünger als 30 Min"-Näherung gekennzeichnet |
| Global | `--json`, `--no-color`, `--help` je Ebene; Exit 0/1/2 |

## 7. TUI-Board

Ink **v5 gepinnt** + React **v18 gepinnnt** (Ink 6 verlangt React 19). Tabs via
`Tab`/`←→`/Ziffern, `q` beenden, `?` Hilfe, `r` neu einlesen. Tabs: Übersicht (=
`status`) · Journal (`j/k`) · Queue · Familie (MiniOrbit, installiert vs. verfügbar) ·
PRs · Gates. Das MiniOrbit (Kern + Satelliten als ASCII-Orbit) ist das Signatur-Visual
und spiegelt die MiniOrbit-Komponente des nc-cockpit — Wiedererkennung beider
Oberflächen bei klarer Rollenteilung.

## 8. Design-System & Technik

- **Ampel-Disziplin:** Grün/Gelb/Rot nur für Zustandsaussagen; ruhige Basispalette.
  Übernommen wird die Ampel-**Semantik** des Cockpits („lossgleich" ist im Terminal nicht
  erreichbar — tokens.css definiert Hex-Werte und Brand-Fonts).
- `NO_COLOR` und Nicht-TTY schalten Farben/Spinner/Board ab — Ausgaben bleiben scriptbar.
- Unicode-Symbole mit `--ascii`-Fallback, relative Zeiten, deutsche Hilfe mit Beispielen;
  subtile Spaß-Details (Queue-Countdown „3d 04h", MiniOrbit, Doctor-Ampelliste), keine
  Emoji-Kaskaden.
- **Exit-Codes:** 0 · 1 (Befund) · 2 (Nutzungsfehler).

| Baustein | Wahl |
|---|---|
| Sprache/Laufzeit | TypeScript, ESM, Node ≥18 |
| Befehls-Parser | `commander` |
| Farben | `picocolors` |
| TUI | `ink@^5` + `react@^18` (gepinnt) |
| Build | `tsup` (ESM-Bundle + d.ts), `files: ["dist"]` |
| Tests | `vitest` + Fixtures (bewusste Abweichung vom `node --test` des OS — eigenes Projekt, kein OS-Code) |
| Sonst | keine weiteren Deps; git/gh via `node:child_process` |

## 9. Meilensteine & Verifikation

**Phase 0 — Klärung & Wissensbasis (OS-Repo, dieser Strang):** Spec-Nachtrag +
README/AGENTS-Präzisierung · Ideen-Backlog-Eintrag · dieser Bauplan + Registerzeilen ·
Struktur-Tests grün. Abnahme: Tests grün, Wortlaut vom Maintainer abgenommen.

**M1 — Fundament & `status`:** Projektgerüst (README mit Rollen-, Windows-,
Verteilungs-Absätzen) · Reader `installation/infra/pfade/git/marketplace/registry` ·
`ncpit status`, `ncpit familie`, `--json` · Smoke auf echter Maschine ·
`npm install -g .` mit vorgebautem dist. Abnahme: `ncpit status` zeigt die reale
Installation mit Quellenkennzeichnung.

**M2 — Wissen & Arbeit:** Reader `sitzungswissen/queue/prs/doks/gates` · Befehle
`journal`, `stand`, `queue`, `prs [--live]`, `gates`, voller `doctor` · Grenzfall-Tests
(infra.json fehlt/„ausstehend", queue-lauf.json fehlt, installed_plugins.json unbekannt).
Abnahme: `doctor` findet echte Befunde (fehlende S-Einträge, SSOT-Drift falls vorhanden)
und exitet 1.

**M3 — Board (TUI):** Shell, Tabs, MiniOrbit, Tastatur, `r`-Refresh, Resize;
Komponenten-Tests mit Ink-`render`. Abnahme: Board zeigt dieselben Zahlen wie die
Einzelbefehle (Konsistenztest gegen `--json`).

**Verifikation je Meilenstein:** `npm run build` (tsc strict + tsup) und `npm test`
grün · E2E-Probe auf echter Maschine (`status`, `doctor`, `journal -n 5`, `queue`,
`familie`, `board`) · `NO_COLOR=1 ncpit status | cat` bleibt plain · Exit-Codes stimmen.

**M4 — Ausblick (bewusst nicht Teil dieses Baus):** `watch` · `session` ·
Maintainer-Modul · Team-Verteilung (Tarball empfohlen) · Windows · `wo`/Sucheindex nur
bei öffentlichem Vertrag · nc-web-Event-Contract-Anschluss.

## 10. Offene Punkte

- Binärname final: `ncpit` (Empfehlung) vs. `ncdeck`.
- Repo-Heimat: **entschieden 2026-09-05 — lokales Git-Repo** in `~/Projects/nc-cli`
  (Branch `main`, Erst-Commit `8c73202`, kein Remote); GitHub (Org/privat) bleibt
  optionaler Folgeschritt, in der Org gilt das Merge-Verbot ohne Zustimmung von
  Lucas Vöhringer.
- Team-Verteilung: Tarball vs. npm (M4-Entscheid, Empfehlung Tarball).
- Farbschema-Abgleich mit nc-cockpit, sobald das NovaCore-Dunkelthema fixiert ist.

## Stand 2026-09-05 (Nachtrag zur Ausführung)

Phase 0 sowie M1–M3 sind gebaut und verifiziert; M4 bleibt Ausblick:

- **Phase 0:** Spec-Nachtrag 2026-09-05 (Design-Spec 2026-07-28), README/AGENTS-Präzisierung,
  Ideen-Backlog-Eintrag und dieser Bauplan mit Registerzeilen angelegt; OS-Struktur-Tests
  grün (354/354). V1 als Maintainer-lokal deklariert, Repo-Heimat offen.
- **M1:** Projekt `~/Projects/nc-cli` (Binärname `ncpit`, tsup/vitest, `files: ["dist"]`),
  Reader mit Fallback-Kette und Formwächten, Befehle `status`/`familie` mit
  Quellenkennzeichnung, PATH-Installation über `npm install -g .` mit vorgebautem dist.
- **M2:** Reader für Sitzungswissen, Queue (queue-lauf.json inkl. Zustand „nie gelaufen"),
  PR-Cache, Doks-Marker, Gates (FFG `plugins/data` primär); Befehle `journal`, `stand`,
  `queue`, `prs [--live]`, `gates`, voller `doctor` — findet auf der Maintainer-Maschine
  reale Befunde (fehlende S3/S6-Belege, SSOT-HEAD-Drift) und exitet 1.
- **M3:** Ink-Board (ink@5 + react@18 gepinnt, dynamisch geladen — Einzelbefehle starten
  in ~40 ms), Tabs Übersicht/Journal/Queue/Familie/PRs/Gates, MiniOrbit, `r`-Neuladen,
  Nicht-TTY-Fallback auf Status; Komponenten-Tests mit ink-testing-library.
- **Verifikation:** Suite 34/34 grün (`npm test`), Build grün (`npm run build`), alle
  Befehle gegen die echte Installation geprüft, `--json` valide, `NO_COLOR`/Pipe plain,
  Exit-Codes 0/1 verifiziert.

---

*Angelegt 2026-09-05 · GO nach Plan-Review Revision 2 (Maintainer) · ausgearbeitet in
der Planungs-Session mit Kimi Code.*
