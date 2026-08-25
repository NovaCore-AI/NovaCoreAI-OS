# Bauplan 2026-08-10 — Onsite-Align-Umbau des NovaCore-OS + Marketplace-Erweiterung

> **Status:** beschlossen (Maintainer-Auftrag Lucas Vöhringer, 2026-08-10). Dieser Plan ist der
> aktuellste Planungsstand (jüngste Datei in `grundwissen/`) und **administriert** den Umbau.
> Verfasst von Claude **Fable 5** nach vollständigem Quellstudium des Vorbilds; die Umsetzung
> dürfen andere Modelle (Opus/Sonnet) übernehmen, aber **nur exakt entlang dieses Plans**.
> Abweichungen → erst Plan-Nachtrag, dann bauen. Quelle-schlägt-Gedächtnis gilt: jede
> Port-Datei wird beim Bau aus dem Vorbild-Repo GELESEN, nie aus Erinnerung rekonstruiert.

**Vorbild:** `C:\Users\luceb\Desktop\Onsite.ai-OS` (Kern `oai` 0.11.1, main `f8cb0fb`;
PR #22 = Branch `origin/feat/ap2-autosync`, bereits lokal gefetcht als `FETCH_HEAD`).
**Ziel-Repo:** dieses Repo (Marketplace `novacore-os`, Kern `nc` 0.5.0, `nc-development` 0.1.0).

---

## 0. Auftrag (wörtliche Essenz) und harte Ausschlüsse

1. NovaCore-OS strukturell nach dem Onsite-Vorbild umbauen: **FFG 1–3** (= die drei Sub-Gates
   des Fact-Forcing-Gates: Datei-Gate, Destruktiv-Gate, Routine-Bash-Gate) **plus Gate 2
   (Session-Start-Zwang)**; die **SSOT-Infrastruktur**; der **„CLAUDE.md-Index"** = die
   CLAUDE-Ebenen-Architektur mit Doks-Autosync aus Onsite-**PR #22**. Kern-Plugin trägt die
   geteilten Infrapflege-Skills; fachliche Skills bleiben im internen Dev-Plugin
   (`nc-development` — erfüllt bereits die Rolle „novacore-dev-plugin", **kein Rename**).
   Interne Plugin-Struktur bleibt gleich bis auf anzupassende Skills und Hooks.
2. **EINZIGER AUSSCHLUSS (nicht verhandelbar):** Die Queue-Logik / SSOT-Abstufung des Vorbilds
   (Onsite-Spec §15.24: Kandidaten-Queue, Kurationslauf, „Aufrücken" von Abteilungswissen in
   den Kern, Cross-Abteilungs-GitHub-Reads) wird **NICHT** übernommen. Grund: Im
   NovaCore-Satelliten-Umfeld wird zwischen **firmeninternen Plugins** (heute nur dieses Repo:
   `nc` + `nc-development`) und **Affiliate-Plugins** (Satelliten wie Felix-OS/Biggi-OS,
   persönliche Tools) unterschieden. **Zwischen den bisherigen Satelliten darf es keinen
   Memory-Share geben.** Falls später nötig → eigene Nachiteration. Was aus dem Vorbild
   TROTZDEM als reine Redaktionsdisziplin übernommen wird: „Kern verlinkt, Abteilung
   dokumentiert" (Doppelpflege-Verbot) — ohne jede Queue-/Promotion-Mechanik.
3. Marketplace-Erweiterung um zwei persönliche Tools (Kategorie **`affiliate`**):
   `kimi-code-plugin-cc` (fertig) und `mneme-kimi-code` (braucht Konvertierung, s. AP7).

## 1. Verifizierte Ausgangslage (Quellstudium Fable, 2026-08-10)

**Delta FFG (nc-ffg.js 469 Z. vs. oai-ffg.js 431 Z. — nahe Verwandte, gleiche drei Sub-Gates):**

- NovaCore trägt **eigene Review-Härtungen (2026-07-28), die BEHALTEN werden** (sie sind
  strenger als das Vorbild; „Onsite gewinnt" gilt für Struktur, nicht für Sicherheitsabbau):
  a) Exempt-Globs **voll verankert** (`^…$`) und lowercase-konsistent — Onsite matcht
     unverankert (Substring, `*.md` würde `x.md/evil.js` freistellen);
  b) Datei-Gate-Key: **Case-Folding nur auf win32/darwin** — Onsite lowercased immer;
  c) `sanitizeSessionKey`: Hash bei **jeder Zeichen-Ersetzung** (a/b vs. a_b-Kollision) —
     Onsite hasht nur bei Überlänge.
- Von Onsite zu ÜBERNEHMEN:
  a) **`hooks/lib/session-key.js`-Extraktion** (Onsite §15.25): `hashSessionKey`,
     `sanitizeSessionKey`, `resolveSessionKey`, `isSubagentInvocation` in geteilte Lib —
     Pflicht, weil Start-Gate/Stempel/Session-Start denselben Schlüssel brauchen. Inhalt =
     Onsite-Datei, aber `sanitizeSessionKey` in der **NC-gehärteten Fassung** (`sanitized ===
     raw`-Prüfung). nc-ffg.js verliert seine lokalen Kopien und requiret die Lib.
  b) **`process.exitCode = 0` statt `process.exit(0)`** am Datei-Ende ALLER Hooks (POSIX-Pipe-
     Falle: exit() schneidet gepufferte Deny-JSON ab → Gate blockt still nicht). Betrifft auch
     das bestehende `nc-session-start.js`.
  c) `lib/bash-analyse.js` + `lib/shell-substitution.js`: kleines Delta (±15 Z.) per
     `git diff --no-index` gegen Onsite prüfen und nur ÜBERNEHMEN, was Erkennungs-Substanz ist;
     NC-Härtungen nicht abschwächen.
- Kommentar-Köpfe: NC-Spec-Referenzen beibehalten (nicht Onsite-§ blind kopieren).

**Gate 2 fehlt in NovaCore komplett** (nc-session-start.js ist ein 99-Zeilen-Marker-Begrüßer;
Onsite: 272-Zeilen-Injektion + Start-Gate + Fakten-Stempel). Der `.nc-os`-Marker-Scope des
Session-Start-HINWEISES entfällt damit (Onsite-Entscheid: „ein Gate, das man vergessen kann,
ist kein Gate"); der Marker bleibt nur noch historisch in ONBOARDING erwähnt → Doku anpassen.

**CLAUDE.md-Index:** In Onsite-main existiert die Normierung
(`Onsite.ai-OS-CLAUDE-Ebenen-Definition.md`, Spec §15.28); die Implementierung (Autosync)
liegt in PR #22. Kein Artefakt heißt dort wörtlich „CLAUDE.md-Index" — gemeint ist genau
diese Ebenen-Architektur samt Router-Payload.

## 2. Verbindliche Rename-/Mapping-Regeln (gelten für JEDEN Port)

| Vorbild | NovaCore |
|---|---|
| `oai` (Plugin/Präfix/Dateinamen) | `nc` |
| `OAI_FFG`, `OAI_START_GATE`, `OAI_AUTOSYNC`, `OAI_*_STATE_DIR`, `OAI_AUTOSYNC_TARGET` | `NC_FFG`, `NC_START_GATE`, `NC_AUTOSYNC`, `NC_*_STATE_DIR`, `NC_AUTOSYNC_TARGET` |
| `/oai:` Namespace | `/nc:` |
| Marker `<!-- OAI:BLOCK:START/ENDE/VERSION -->` | `<!-- NC:BLOCK:START/ENDE/VERSION -->` |
| Backup-Suffix `.oai-autosync-backup` | `.nc-autosync-backup` |
| `os.tmpdir()/oai-ffg`, `oai-start-gate` | `os.tmpdir()/nc-ffg`, `nc-start-gate` |
| `knowledge base/` (mit Leerzeichen) | `knowledge-base/` (Bestand; NICHT umbenennen) |
| `.oai/erinnerung/` | `.nc/erinnerung/` (Bestand) |
| `Onsite.ai(-OS)`, Spec-§-Refs | `NovaCore(-OS)`, Verweis auf DIESEN Bauplan |
| Repo-Referenz `onsite-ai-devs/Onsite.ai-OS` | `NovaCore-AI/NovaCoreAI-OS` |
| Skills `feat`/`mr`/… (Dev-Plugin Onsite) | bleiben unberührt — `nc-development` behält `fe`/`be`/`flc`/`wzs` |

Onsite-Wissensbasis-Ordnernamen werden auf die NovaCore-Bestandsstruktur GEMAPPT, nicht
kopiert: `project-meta-infos/` → `knowledge-base/grundwissen/` ·
`plugin-maintanance-ruleset-source/` → `knowledge-base/standardprozesse/` ·
`Debugging + findings/` → `knowledge-base/debugging-findings/`. **Neu angelegt** werden nur:
`knowledge-base/SSOT-Document-Index.md` (einzige Wurzeldatei) und die Kategorie-Erweiterungen
aus AP4. KEIN Ordner „Aktive Baupläne" — NovaCore nutzt weiter `grundwissen/` mit
Datumspräfix (Abweichung vom Vorbild, hier beschlossen; der Index dokumentiert das Mapping).

## 3. Arbeitspakete (Baureihenfolge = Nummerierung)

### AP1 — FFG-Angleich (Kern-Hooks)
Quelle lesen: `Onsite.ai-OS/plugins/oai/hooks/oai-ffg.js`, `lib/session-key.js`,
`lib/bash-analyse.js`. Schritte:
1. `plugins/nc/hooks/lib/session-key.js` NEU: Onsite-Fassung + NC-gehärtetes
   `sanitizeSessionKey` (Kommentar mit Härtungs-Begründung 2026-07-28 übernehmen).
2. `nc-ffg.js`: lokale Kopien von hash/sanitize/resolve/isSubagent entfernen → Require auf
   Lib; `process.exit(0)` → Kommentar + `process.exitCode = 0` (wörtlich aus Onsite Z. 428–431
   portieren). Alle NC-Härtungen (§1) UNVERÄNDERT lassen.
3. `bash-analyse.js`/`shell-substitution.js`: Delta-Review per `git diff --no-index`; nur
   substanzielle Erkennungsverbesserungen übernehmen.
4. Tests: `plugins/nc/tests/nc-ffg.test.mjs` muss grün bleiben; neue Lib bekommt Abdeckung
   über die bestehenden FFG-Tests (Requires umstellen falls nötig).

### AP2 — Gate 2: Session-Start-Zwang (Zangen-Prinzip)
Quellen lesen: `oai-session-start.js` (272 Z.), `oai-start-gate.js` (124 Z.),
`oai-start-stempel.js` (122 Z.), `hooks.json` (FETCH_HEAD-Fassung). Schritte:
1. `nc-session-start.js` ERSETZEN durch Port der Onsite-Injektion: Pflicht-Einstieg +
   Stempel-Hinweis + rote Linien + lebender Stand (VERSION/Branch/Commits/status mit
   `-c core.quotepath=false`, 2 s Timeout) + `[Unreleased]`-Kopf + Abteilungen aus
   `plugins/nc/module-registry.json`. Abschnitt „Laufende Vorhaben": statt
   `knowledge base/Aktive Baupläne/` die **jüngsten 5 Dateinamen** aus
   `knowledge-base/grundwissen/` mit Datumspräfix listen (NovaCore-Mapping §2). Marker-Logik
   (`hasNcOsMarker`) ERSATZLOS streichen; Export-API der Datei ändert sich → Tests anpassen.
2. `nc-start-gate.js` + `nc-start-stempel.js` NEU (1:1-Port mit Renames): Stempel-State
   **env-unabhängig** in `os.tmpdir()/nc-start-gate` (Onsite-Lesson 0.11.1:
   CLAUDE_PLUGIN_DATA ist zwischen Hook- und Bash-Prozess inkonsistent → Deadlock);
   `NC_START_GATE_STATE_DIR` nur als Test-Override; Fakten-Stempel verifiziert
   `--branch`/`--head` (≥7 Zeichen) gegen `git rev-parse`; Durchlässe: Stempel-Befehl selbst
   (`command.includes('nc-start-stempel.js')`), Read-only-Git, Subagenten; 30-Min-Verfall,
   1-Min-Heartbeat; EIN Schalter `NC_START_GATE=off` für beide Teile.
3. `hooks.json`: Onsite-FETCH_HEAD-Struktur übernehmen (zwei PreToolUse-Blöcke: FFG-Matcher
   `Write|Edit|MultiEdit|Bash`, Start-Gate-Matcher `Write|Edit|MultiEdit|NotebookEdit|Bash`;
   SessionStart mit session-start + autosync; überall `timeout: 10`,
   `${CLAUDE_PLUGIN_ROOT}`-Pfade). `description`-Feld neu texten: trägt den Prosa-Zustand der
   GESAMTEN Kontroll-Schicht (Onsite-Muster, an NC-Envs/Namen angepasst).
4. `/nc:start`-SKILL.md erweitern: letzter Ablaufschritt = Fakten-Stempel setzen (exakter
   Befehl), Marker-Schritt (heutiger Ablaufpunkt 2) ersatzlos raus.
5. Tests portieren: `oai-session-start.test.mjs` (8) + `oai-start-gate.test.mjs` (13) → NC.

### AP3 — CLAUDE.md-Index: Doks-Autosync + Firmenblock (aus PR #22)
Quellen: `git show FETCH_HEAD:plugins/oai/hooks/oai-doks-autosync.js`,
`…:plugins/oai/doks/global-claude-firmenblock.md`,
`…:plugins/oai/tests/oai-doks-autosync.test.mjs` (im Onsite-Repo-Klon ausführen). Schritte:
1. `plugins/nc/hooks/nc-doks-autosync.js`: 1:1-Port. Kernlogik unverändert: Ziel
   `~/.claude/CLAUDE.md` (Override `NC_AUTOSYNC_TARGET`); Marker-Chirurgie
   (fehlt→anlegen · ohne Marker→Block OBEN, Bestand byte-identisch dahinter ·
   identisch→No-op · abweichend→nur zwischen Markern ersetzen · defekt→NICHTS schreiben,
   stderr-Warnung); Versions-Kommentar `<!-- NC:BLOCK:VERSION <kern-version> -->` als
   EINZIGER State (kein CLAUDE_PLUGIN_DATA!); Backup `<ziel>.nc-autosync-backup` vor jedem
   Schreiben; Subagenten raus; `NC_AUTOSYNC=off`; fail-open; `process.exitCode = 0`.
2. `plugins/nc/doks/global-claude-firmenblock.md`: Router-Payload (~29 Z.) nach
   Onsite-Muster, NovaCore-Fassung: Kurzdefinition NovaCore-OS · Pflicht `/nc:start` vor der
   ersten Aktion (Start-Gate-Hinweis) · rote Linien · Verweis Kern-SSOT =
   `NovaCore-AI/NovaCoreAI-OS` → `knowledge-base/SSOT-Document-Index.md` · Schlusssatz
   Privat-Zone. KEIN Queue-/Abteilungs-Share-Inhalt.
3. Test portieren (9 Fälle: anlegen, oben einfügen, No-op, ersetzen, defekte Marker ×3,
   Backup, Version-Bump).

### AP4 — SSOT-Infrastruktur (OHNE Queue)
Neu anzulegende Dokumente (alle Deutsch, Onsite-Fassung als Struktur-Vorlage LESEN und auf
NovaCore mappen):
1. `knowledge-base/SSOT-Document-Index.md` — Master-Index; Teil 1 Ordner-Routing (Zeilen für
   `grundwissen/`, `standardprozesse/`, `debugging-findings/` + neue Kategorien nur falls in
   diesem Umbau entstehend), Teil 2 Quellen-Triage („Relevant wenn …" = Abruf-SITUATION) über
   ALLE Bestandsdateien der knowledge-base. Kopf: Zweck/Benutzung/Abgrenzung zum
   Aktualisierungs-Index/Pflege(testerzwungen). **Einzige Datei auf Wurzelebene.**
2. `knowledge-base/standardprozesse/aktualisierungs-index.md` — Änderungs-Matrix nach
   Onsite-Muster (§1 Immer-zuerst · §2 Matrix 2.1 Plugin-Inhalt / 2.2 Wissensbasis / 2.3
   Mechanik · §3 Version/Release/Tag · §4 Protokolle · §5 Prüfzyklus · §6 Selbsttest, 7
   Fragen) — aber auf NovaCore-Artefakte bezogen (AGENTS.md statt CLAUDE.md als
   Normativ-Einstieg; kein Betriebshandbuch/keine Roadmap = Zeilen weglassen statt leere
   Verweise; Onsite-Warnung beherzigen: **weniger Spiegelstellen bauen** — Zahlen NICHT an
   5+ Orten spiegeln).
3. `knowledge-base/grundwissen/NovaCore-OS-Gates-Definition.md` — Vier-Gates-Tabelle
   (Gate 1 FFG [gebaut] · Gate 2 Session-Start-Zwang [mit diesem Umbau gebaut] · Gate 3
   Safety-Gate [nicht gebaut, wie Vorbild] · Gate 4 Sitzungsabschluss [nicht gebaut]) +
   Begriffshinweis „FFG 1–3 = Sub-Gates von Gate 1" + die drei Abgrenzungen (Gate 1↔3,
   Basis-Gate↔Domänen-FFG/Prüfungs-Eigentum, Gate 2↔4).
4. `knowledge-base/grundwissen/NovaCore-OS-SSOT-Definition.md` — Begriffsnorm nach
   Onsite-Vorlage; Abschnitt „SSOT-Abstufung" ERSETZEN durch: **„Abgrenzung
   Satelliten-Wissen: firmenintern vs. affiliate — kein Memory-Share zwischen Satelliten,
   keine Queue/Promotion (Maintainer-Entscheid 2026-08-10; bewusste Abweichung vom
   Onsite-Vorbild §15.24). Kern verlinkt, Abteilung dokumentiert bleibt als
   Redaktionsregel."**
5. `knowledge-base/grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md` — Ebenen 0/1/2/3/3b
   nach Onsite-Norm (Träger/Kanal/Owner-Tabelle, Präzedenzregel, NC-Marker-Konvention,
   Kanal-Regel). Status ehrlich: Ebene 1 mit AP3 gebaut; 0/2 nicht genutzt/offen.
6. Glossar-/Repo-Karten-Zeilen in AGENTS.md für alle neuen Dateien (Sync-Matrix!).

### AP5 — Kern-Infrapflege-Skills
Port aus `Onsite.ai-OS/plugins/oai/skills/` → `plugins/nc/skills/`: **`doku-sync`**
(Prüfzyklus-Skill; Checkliste = AGENTS.md-Abschluss-Checkliste + neuer Aktualisierungs-Index
§5; Stempelpfad `.git/nc/doku-sync.stamp`), **`os-info`**, **`skill-builder`**. Jede
SKILL.md beim Port gegen `plugins/nc/referenz/skill-authoring.md` prüfen (YAML-Falle:
`description` mit Trigger-Begriffen als `>-`-Block). NICHT portieren: `firmenwissen-suche`
(Atlassian-spezifisch), Platzhalter-Skills (`update-doks`, `module-setup`, `grill-me`).
Registry (`module`-Objekt `core` der Abteilung `gemeinsam`) + READMEs nachziehen.

### AP6 — Tests + CI
1. `struktur.test.mjs` um Onsite-Invarianten erweitern (Onsite-Datei als Vorlage lesen,
   Zeilenanker: 51/71/81/92/132/143/217/247/255/327/335/341/350/364/389): Marketplace↔Platte
   beidseitig · kein `version`-Feld in Einträgen · Abteilungsplugins hängen am Kern ·
   Hook-Pfade über `${CLAUDE_PLUGIN_ROOT}` · MCP-Gate-Invariante (schlafend: sobald ein
   Manifest MCP-Server führt, muss der FFG-Matcher `mcp__*` decken) · Frontmatter-Regeln ·
   Plugin-Grenze (keine `../`-Verweise in ausgelieferten Dateien; Ausnahme
   skill-authoring.md) · Leitversions-Gleichstand · Registry↔Plugins ·
   **SSOT-Index-Vollständigkeit + Linkgültigkeit + Wurzel-Regel** · Vorlage-ist-kein-Plugin ·
   Release-Tag-Invariante (Schema hier: `nc--vX.Y.Z`, an NovaCore-Tagging anpassen!) ·
   keine offenen Platzhalter. **Satelliten-/affiliate-Einträge: gepinnt (ref+sha) Pflicht.**
2. `.github/workflows/ci.yml` + `release.yml` nach Onsite-Muster NEU (Matrix ubuntu+windows ×
   Node 20/22/24, `fetch-tags: true`, Testaufruf wortgleich
   `node --test plugins/nc/tests/*.test.mjs`, plugin-validate-Job mit versionsgepinnter CLI
   `@2.1.220`, Positivkontrolle [defekter Wegwerf-Skill MUSS rot werden + intakte
   Kontrollgruppe], `validate .` + `validate <plugin> --strict` je Plugin, Actions per
   Full-SHA gepinnt). release.yml-Tag-Muster auf `nc--v*`-Schema anpassen (NovaCore-Tags via
   `claude plugin tag`); die vier harten Vorbedingungen (annotiert, Tag==Version, Suite grün,
   CHANGELOG-Abschnitt per `index($0,…)==1`-awk) beibehalten.

### AP7 — Marketplace-Erweiterung (Anliegen 2)
1. `kimi-code-plugin-cc`: Eintrag in `.claude-plugin/marketplace.json` mit
   `source: {source: "github", repo: "ArchiDoxx/Kimi-code-Plugin-CC", ref: "v1.4.0", sha:
   <Full-SHA des Tags, per gh api ermitteln — annotiertes Tag auf Commit dereferenzieren>}`,
   `category: "affiliate"`, Description nennt Zweck (externe Review-/Planning-Loops via Kimi
   Code) UND Host-Anforderungen (`uv` + `kimi`-CLI erforderlich; MIT-Lizenz). Registry:
   NICHT als „Abteilung" führen — Affiliate-Plugins sind keine Abteilungen; stattdessen im
   `_hinweis`-Feld + README dokumentieren. Falls Struktur-Tests Marketplace↔Registry 1:1
   fordern: Invariante auf Kategorien `kern`/`abteilung` einschränken, `affiliate` ausnehmen.
   **MCP-Invariante beachten:** Das Plugin bringt einen MCP-Server mit → die schlafende
   `mcp__*`-FFG-Invariante aus AP6 wird von externen Plugins NICHT ausgelöst (sie prüft nur
   lokale Manifeste) — Formulierung im Test entsprechend präzisieren; das FFG gated
   `mcp__*`-Tools heute nicht (Matcher), das bleibt dokumentierte bekannte Grenze.
2. `mneme-kimi-code`: **kein Claude-Code-Plugin** (nur Kimi-CLI-Manifest; 7 Python-Hooks ohne
   hooks.json; MCP via Installer; AGPL-3.0; keine Tags/Releases; Branch `master`).
   Konvertierung im lokalen Repo `C:\Users\luceb\Desktop\mneme-kimi-code` VORBEREITEN
   (`.claude-plugin/plugin.json`, `hooks/hooks.json` mit Python-Aufrufen über
   `${CLAUDE_PLUGIN_ROOT}`, `.mcp.json` für den FastMCP-Server), aber der Marketplace-Eintrag
   ist **blockiert bis Push + Tag im ArchiDoxx-Repo** (braucht Maintainer-Freigabe;
   GitHub-Description ist leer → setzen). Bis dahin NICHT in marketplace.json aufnehmen
   (Eintrag würde Installs brechen); Vorbereitung + Blocker in CHANGELOG dokumentieren.

### AP8 — Abschluss (Standardzyklus AGENTS.md, Punkt 5)
Sync-Matrix vollständig: AGENTS.md (Repo-Karte/Glossar/Produktstand/Konventionen — Verweis
auf neuen Aktualisierungs-Index), README.md, ONBOARDING.md (Marker-Rolle geändert:
Session-Start-Zwang statt Begrüßung), Plugin-READMEs falls angelegt. CHANGELOG unter
`[Unreleased]` **mit Namenszeichnung**. **Kern-Bump 0.5.0 → 0.6.0** (Neuerung; NUR
plugin.json + VERSION + Registry-`version`). Validierung: `claude plugin validate .` UND
`claude plugin validate plugins/<name> --strict` je Plugin (stilles „passed" = Erfolg).
Tests: `node --test plugins/nc/tests/*.test.mjs` (wortgleich). Fehlerprotokoll-Einträge
(`debugging-findings/agent-learnings.md`) für jeden eigenen Fehler der Bau-Sessions.

## 4. Rote Linien der Umsetzung

**Kein Commit, kein Push, kein PR, kein Merge, kein Tag/Release ohne explizite
Maintainer-Freigabe.** Arbeit im Working Tree auf Feature-Branch
`feat/onsite-align-umbau` (von `main`). Fremd-Repos (`mneme-kimi-code`) nur lokal
vorbereiten. `~/.claude/CLAUDE.md` des Entwicklers wird beim Bau NICHT beschrieben
(Autosync-Tests laufen ausschließlich gegen `NC_AUTOSYNC_TARGET`-Testpfade).

## 5. Offene Punkte an den Maintainer (blockieren den Bau nicht)

1. mneme: Freigabe für Push der Konvertierung + Tag `v2.0.24` ins ArchiDoxx-Repo.
2. Koexistenz-Falle verschärft sich: Gate 2 + Autosync laufen künftig in JEDER Session dieses
   Rechners, sobald `nc` installiert ist — parallele OS-Plugins (nc-felix/nc-biggi) doppeln
   Gates; Regel „nie parallel betreiben" in README bekräftigen.
3. Onsite-PR #24 („Sitzungswissen/offene-Stränge-Register") ist NICHT Teil dieses Auftrags —
   bewusst ausgeklammert wegen Nähe zur ausgeschlossenen Queue-Thematik; bei Bedarf separat
   beauftragen.

## 6. Plan-Nachträge aus der Umsetzung

> Regel des Auftrags: Abweichungen werden **erst hier dokumentiert, dann gebaut**. Jeder
> Nachtrag nennt Anlass, Entscheidung und Begründung.

### N1 — Release-Tag-Invariante: Ausnahmeliste für zwei historisch ungetaggte Stände
*(2026-08-10, Claude Opus 5, im Zuge von AP6.1)*

**Anlass:** Die aus dem Vorbild portierte Invariante „jede veröffentlichte
CHANGELOG-Version außer der jüngsten ist getaggt" wurde beim ersten Lauf sofort rot: Die
Stände **0.3.0 und 0.4.0 sind veröffentlicht, aber nie getaggt** worden (real vorhanden sind
nur `nc--v0.5.0` sowie die historischen `novacoreai-os--v0.1.0/0.1.1/0.2.0`). Das ist genau
der Drift, den die Invariante fangen soll — sie ist hier also nicht falsch, sondern deckt
einen **Altbestand** auf.

**Entscheidung (Zwischenstand):** Die Invariante wurde **scharf gebaut**, zunächst mit einer
namentlich gelisteten, kommentierten Ausnahme für exakt diese zwei Altstände — weil Tags
nachzusetzen eine rote Linie ist (§4) und nicht nebenbei passieren darf. Zusätzlich zählt
neben dem Schema `nc--v{version}` auch das vor 2026-07-28 gültige `novacoreai-os--v{version}`.

**ERLEDIGT (2026-08-10, Maintainer-Freigabe „löse nach eigenem Ermessen"):** Beide Tags
wurden nachgesetzt — **annotiert**, mit Begründung im Tag-Text, und nach der Konvention von
`nc--v0.5.0` auf die **Merge-Commits**, nicht auf die Bump-Commits:

| Tag | Commit | PR | belegt |
|---|---|---|---|
| `nc--v0.3.0` | `ef9f263` | #3 `feat/multi-plugin-architektur` | `VERSION` und `plugin.json` dort = 0.3.0 |
| `nc--v0.4.0` | `37047f2` | #4 `feat/abteilung-felix` | `VERSION` und `plugin.json` dort = 0.4.0 |

Die Zuordnung ist eindeutig: `git log --ancestry-path --merges <bump>..main | tail -1` liefert
je Version genau einen integrierenden Merge, und der Versionsstand dort wurde gegen beide
Manifest-Stellen geprüft. **Die Ausnahmeliste im Test ist damit ersatzlos entfallen** — die
Invariante gilt ohne Ausnahme.

**Begründung für „nachsetzen statt Ausnahme behalten":** Eine Ausnahme, die niemand mehr
anfasst, ist auf Dauer dasselbe wie eine gelockerte Regel. Da die Zuordnung beweisbar und
das Nachsetzen im Repo präzedenzgestützt ist (dieselbe Hygiene wurde 2026-08-05 für die
Felix-Tags v0.2.0/v0.2.1 nachgezogen), ist die saubere Historie der richtige Endzustand.
Ein GitHub-Release entsteht dadurch **nicht**: `release.yml` existiert an diesen alten
Commits nicht, der Workflow läuft für diese Tags also nie an.

### N2 — Review-Härtungen an Gate 2 und am Autosync (über den 1:1-Port hinaus)
*(2026-08-10, Claude Opus 5, nach dem PR-Review von PR #10)*

**Anlass:** Das adversariale Review des fertigen PR fand zwei HIGH- und drei
MEDIUM-Befunde. Zwei davon (H1, M1) betreffen Logik, die AP2.2 als **1:1-Port** vorschreibt —
sie sind also im Vorbild genauso vorhanden. Ein Fix ist daher eine bewusste Abweichung vom
Plan und wird hier dokumentiert, bevor er gebaut wird.

| # | Befund | Kern |
|---|---|---|
| **H1** | Der Fakten-Stempel verifiziert **nichts**, wenn er aus einem Nicht-Git-Verzeichnis läuft — `git rev-parse` schlägt fehl, der Prüfblock wird übersprungen, der Stempel wird mit `branch: null` geschrieben, und das Gate öffnet danach für das **echte** Repo. Ein `cd` genügt. | Die zentrale Zusage von Gate 2 ist aushebelbar. |
| **M1** | Der Durchlass `command.includes('nc-start-stempel.js')` matcht per **Substring** — `echo x > /tmp/y # nc-start-stempel.js` passiert Gate 2 ungehindert. | Jeder schreibende Bash-Befehl kommt mit angehängtem Kommentar vorbei. |
| **M2** | Der Autosync schreibt **nicht atomar** und überschreibt sein einziges Backup. Zwei gleichzeitig startende Sessions können die Privat-Zone der Nutzer-`CLAUDE.md` dauerhaft kürzen — samt beschädigtem Backup. | Datenverlustpfad in fremden Dateien. |
| **H2** | Zwei der vier Testsuites erben `NC_AUTOSYNC`/`NC_START_GATE` aus der Umgebung: auf einer Maschine mit gesetztem Opt-out fallen **16 von 77** Tests um. | Das AP8-Abnahmekriterium scheitert reproduzierbar. |
| **M3** | Die Release-Tag-Invariante wird **still grün**, wenn die Tagliste leer ist (Fork, Checkout ohne `fetch-tags`). | Die Regel, die die 0.3.0/0.4.0-Lücke fand, kann unbemerkt aussetzen. |

**Entscheidung:** Alle fünf werden behoben. Für H1/M1 heißt das: **das NovaCore-Gate 2 wird
strenger als sein Vorbild** — dieselbe Begründung wie bei den FFG-Härtungen aus §1
(„Onsite gewinnt für Struktur, nicht für Sicherheitsabbau"). Konkret:

1. **H1:** Der Stempel löst die Git-Lage gegen das **Projektverzeichnis** auf
   (`CLAUDE_PROJECT_DIR`, sonst cwd) statt gegen das cwd des Stempel-Prozesses, und
   schreibt ein Feld `verified`. Das Gate akzeptiert einen unverifizierten Stempel **nur
   dann**, wenn das Verzeichnis der gegateten Aktion selbst kein Git-Baum ist — sonst
   Ablehnung mit klarer Begründung. Der legitime „außerhalb eines Git-Baums"-Fall bleibt
   damit erhalten, der `cd`-Trick nicht.
2. **M1:** Der Durchlass ankert auf eine **echte Invokation** am Zeilenanfang und verwirft
   alles, was danach per `;`, `&&`, `|`, `>` oder `#` angehängt wird.
3. **M2:** Schreiben per Temp-Datei + `rename` (atomar auf demselben Volume); ein Backup
   wird **nie** mit einem Inhalt überschrieben, der die Marker verloren hat.
4. **H2:** Beide Testsuites filtern die Opt-out-Variablen aus dem geerbten Env — exakt das
   Muster, das `nc-start-gate.test.mjs` bereits verwendet.
5. **M3:** Die Invariante unterscheidet „kein Git-Repo" (überspringen) von „Repo ohne Tags"
   (Fehlschlag mit Hinweis auf `fetch-tags`).

Jede Härtung bekommt einen **Regressionstest**, der die im Review reproduzierte Umgehung
nachstellt. Die Doku-Zusagen (`hooks.json`-`description`, README, ONBOARDING,
Gates-Definition) beschreiben danach den realen Stand.

---
*Plan erstellt und administriert: Claude Fable 5, 2026-08-10, auf Weisung Lucas Vöhringer.
Umsetzende Agenten zeichnen ihre CHANGELOG-Einträge selbst; Abnahme gegen diesen Plan.
Nachträge aus der Umsetzung: Abschnitt 6.*
