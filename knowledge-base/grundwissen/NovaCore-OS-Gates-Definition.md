# Kontroll-Schicht — Definition der Gates

> **Zweck:** die verbindliche Kurzbeschreibung der Gates an einem Ort — **drei gebaute
> Gates**; das früher geplante Gate 4 ist **endgültig entfallen** (Onsite-Paritäts-Entscheid
> §15.44, übernommen 2026-08-23 via Mapping D2). Abgeleitetes
> Dokument — bei Widerspruch gewinnen die normativen Quellen (jüngste Spec/Bauplan in
> `grundwissen/`, dann `CHANGELOG.md` als Produktstand).
>
> **Begriffshinweis:** „FFG" im engeren Sinn ist **Gate 1** (Fact-Forcing-Gate). Wenn im
> Alltag von **„FFG 1–3"** die Rede ist, sind damit die **drei Sub-Gates von Gate 1**
> gemeint — Datei-Gate, Destruktiv-Gate, Routine-Bash-Gate —, **nicht** drei eigenständige
> Gates. Normativ heißt die Familie **Kontroll-Schicht**, ihre Mitglieder **Gates**.

Gemeinsame Eigenschaften aller Gates: **deterministisch** (die KI hat kein Veto),
**fail-open** bei internen Fehlern (ein kaputtes Gate blockiert nie die Arbeit),
**kein Marker** — Aktivierungsbedingung ist die Installation des Kern-Plugins, Opt-out nur
per Env **je Gate**. **Hook-Norm W4:** Im OS-Repo liegen alle Hooks ausschließlich im Kern
`nc` (testerzwungen, `struktur.test.mjs`); ein **eigenständiger Satellit** (§„Satelliten"
unten) darf **eigene, nicht-redundante, nicht-kollidierende, spezialisierte** Hooks führen,
weil er den Kern technisch nicht erreicht — das ist die einzige Ausnahme von „alle Hooks im
Kern", keine zweite Kontroll-Schicht-Variante.

| # | Gate | Erzwingt | Mechanik | Fragt den Menschen? | Status | Opt-out | Quelle |
|---|---|---|---|---|---|---|---|
| **1** | **FFG** (Fact-Forcing-Gate) — im Kern als domänen-freies **Basis-Gate**; drei Sub-Gates („FFG 1–3") | Fakten **vor** schreibenden Aktionen: **(1) Datei-Gate** je Zieldatei (Edit/Write/MultiEdit/NotebookEdit — NotebookEdit wie Edit auf `notebook_path`, seit 2026-08-23), **(2) Destruktiv-Gate** je Kommando (`rm -rf`, Force-Push, `reset --hard`, SQL-DDL, `find -exec`, **Windows-Destruktivmuster** `del/rd /s`, `Remove-Item -Recurse -Force`, `-EncodedCommand` und **Wrapper-Passthrough** sudo/env/wsl/timeout … — Onsite §15.38/§15.46, Port 2026-08-23), **(3) Routine-Bash-Gate** einmal je Session; Read-only-Git nie | PreToolUse (`nc-ffg.js`); Ablehnung mit Investigations-Text, Durchlass nach Faktenvorlage; quote-aware Bash-Analyse (GHSA-4v57-ph3x-gf55-Härtung), verankerte Exempt-Globs, plattformbewusstes Case-Folding, Session-Key-Hashing bei jeder Zeichen-Ersetzung; Upstream-Drift-Falltabelle testerzwungen (`nc-ffg-drift.test.mjs`) | **Nie** — es verlangt Fakten und lässt danach den normalen Permission-Flow laufen | **gebaut** (v2; Review-Härtungen 2026-07-28, Lib-Extraktion + `exitCode`-Fix 2026-08-10, Read-only-Git-Erkennung segmentweise korrigiert 2026-08-14, Onsite-Delta-Port §15.38/§15.46 2026-08-23) | `NC_FFG=off` | Design-Spec 2026-07-28 §5; Bauplan 2026-08-10 AP1; Mapping D3 (2026-08-23) |
| **2** | **Session-Start-Zwang** | Kein Blind-Start: Pflicht-Einstieg + lebender Projektstand zu Sessionbeginn; die **erste schreibende Aktion** erst, nachdem `/nc:start` gelaufen und der Fakten-Stempel gesetzt ist — Lesen und Fragen bleiben frei | zweiteilig („Zangen-Prinzip"): SessionStart-**Injektion** (`nc-session-start.js`; kann plattformbedingt nicht blocken) + PreToolUse-**Erzwingungs-Begleiter** (`nc-start-gate.js`) mit Fakten-Stempel (`nc-start-stempel.js`, verifiziert `--branch`/`--head` gegen die Git-Lage des **Projektverzeichnisses**) | Nein | **gebaut** mit dem Umbau 2026-08-10 (vorher: markergebundener Begrüßungs-Hinweis, kein Gate); Read-only-Git-Erkennung segmentweise korrigiert 2026-08-14 (Pfadwechsel/Verkettung/`worktree list` wieder frei) | `NC_START_GATE=off` (ein Schalter für beide Teile) | Bauplan 2026-08-10 AP2, Nachtrag N2 |
| **3** | **Safety-Gate** | Echte **menschliche Freigabe** vor Aktionen mit Außen- oder Infrastrukturwirkung: Infra/Deploy/Prod/DB **und** kundensichtbare Schreibaktionen — Vorlagepflicht: Empfänger/Zielort + **wörtlicher** Text | PreToolUse (`nc-safety-gate.js`) auf `Bash` **und** `mcp__.*` mit `permissionDecision: "ask"` → echter Freigabedialog; Musterliste v1 im NovaCore-Zuschnitt (EN4): tofu/terraform apply/destroy · deploy-Wort mit Verbpositions-Ausnahme get/describe/logs · mcp-Schreibverben über Werkzeug- **und** Parameternamen (manifest-unabhängig) · **Muster 4 (DB-Hälfte, 2026-08-25)**: Prisma-Schreibwege (migrate dev/deploy/reset, db push/execute/seed, `db:*`-npm-Skripte) und Admin-Pfad `docker compose exec postgres psql` — WZS-Zulieferung 2026-08-24, mit Versions-/Lese-Ausnahmen (prisma generate/validate/studio, db pull, migrate status/diff, psql --version) als Fehlalarm-Schutz; die Deploy-Hälfte (gh workflow run, compose pull/up) wartet auf die Maintainer-Weiche Actions+SSH vs. Coolify; Bypass-Härtung gegen Shell-Wrapper, Präfix-Kommandos und gequotete Kommandowörter (GLM-Review-Stand des Vorbilds); **kein State** (jeder Treffer fragt erneut); **Subagenten nicht ausgenommen**; Fehlalarm-Schutz als Abnahmekriterium. Eigentums-Entscheid 2026-08-25: schreibende curl/wp-Aufrufe gegen Live-Domains gehören hierher (Gate 3), nicht ins FFG | **Ja — genau dafür existiert es** (das einzige Gate mit Dialog) | **gebaut** (Port 2026-08-23 aus `oai-safety-gate.js@6d3f8db`, Mapping D1/EN4; Muster-4-DB-Erweiterung 2026-08-25, Phase-J-Frühzug) | `NC_SAFETY_GATE=off` | Onsite §4.7/§15.21/§15.26; Mapping D1 (2026-08-23); Zulieferung WZS-Kommandos (2026-08-24) |
| **4** | **Sitzungsabschluss** — **ENDGÜLTIG ENTFALLEN** | *(historisch: sollte Wissensverlust am Sessionende verhindern — PostToolUse-Akkumulator + Stop-Hook + SessionEnd-Protokoll)* | entfällt ersatzlos; das menschliche Gegenstück bleibt `/nc:end-session`, die **PreCompact-Mahnung** bleibt bestehen und war nie Gate 4 (siehe unten) | — | **entfallen** (Onsite-Maintainer-Entscheid §15.44, übernommen 2026-08-23 via Mapping D2 — der frühere „nicht gebaut/offen"-Status ist aufgehoben) | — | Onsite §15.44; Mapping D2 (2026-08-23) |

## Abgrenzungen, die Verwechslungen verhindern

- **Gate 1 vs. Gate 3:** Das FFG fragt **nie** den Menschen (Fakten, dann Permission-Flow);
  Gate 3 erzeugt den **echten Freigabedialog**. Eine Bestätigungspflicht für kundensichtbare
  Schreibaktionen ist deshalb eine Gate-3-Erweiterung und **kein zweites FFG**.
- **Basis-Gate vs. Domänen-FFG (Prüfungs-Eigentum):** Der Kern trägt Gate 1 **domänen-frei**
  (einmal gepflegt, für alle gleich); eine Abteilung darf später ein eigenes **Domänen-FFG**
  mit eigenen Fragen auf eigenen Mustern bauen. Regel: **keine Kern-Prüfung duplizieren oder
  abschwächen**; Matcher sind frei. Gate 1 und Gate 2 nutzen denselben Matcher und prüfen
  trotzdem Verschiedenes — das ist gewollt, nicht redundant.
- **Gate 2 vs. Sitzungsende:** Der Start-Zwang sichert den **Anfang** (richtiger Kontext,
  bevor geschrieben wird); das **Ende** sichert kein Gate mehr (Gate 4 entfallen, Mapping
  D2), sondern der Skill `/nc:end-session` (bis Kern 0.7.x `save-session`) plus die
  PreCompact-Mahnung.
- **PreCompact-Mahnung vs. das entfallene Gate 4 (seit Kern 0.8.0):** `nc-end-mahnung.js`
  blockt die **erste** Kompaktierung einer Sitzung ohne abgeschlossenes `/nc:end-session`
  (top-level JSON `decision`, Exit 0) und lässt die zweite immer durch (Loop-Schutz gegen
  Auto-Compact-Sackgassen); Abschluss-Stempel `nc-end-stempel.js` ist reine
  Selbstauskunft, Marker verfallen nach 30 Min **Inaktivität** (Heartbeat). Das war
  **nie** Gate 4 und ist auch **kein Ersatz** dafür: Es mahnt nur vor der Kompaktierung,
  nie am Sitzungsende, und entscheidet nichts. Opt-out `NC_PRECOMPACT=off`, Test-Override
  `NC_END_STATE_DIR`.

## Weitere Mitglieder der Kontroll-Schicht (keine Gates)

- **Doks-Autosync** (`nc-doks-autosync.js`, SessionStart): hält seit Kern 0.8.0 **zwei**
  Ziele unabhängig aktuell — Ebene 1 (Firmen-Block, Marker-Chirurgie, fail-safe bei
  defekten Markern) und Ebene 1b (`~/.claude/nc-teamsync.md`, Ganzdatei mit
  Versions-Stempel). Details: `NovaCore-OS-CLAUDE-Ebenen-Definition.md`.
- **PreCompact-Mahnung** (`nc-end-mahnung.js` + `nc-end-stempel.js`): siehe Abgrenzung
  oben.
- **Queue-Fälligkeits-Erinnerung** (`nc-queue-faelligkeit.js`, dritter SessionStart-Hook,
  seit Kern 0.10.0): erinnert an überfällige Läufe der Queue-Skills
  `/nc:queue-abteilung`/`/nc:queue-kern` (14-Tage-Takt, +1 Tag Versatz — Bauplan-Nachtrag
  N6), sobald ein Abteilungs-Satellit registriert ist; im heutigen Übergangszustand (keine
  Satelliten, Entscheid E1) schweigt er by design. **Ausdrücklich KEIN Gate**: SessionStart
  kann laut Hooks-Doku nicht blocken — der Hook injiziert höchstens eine Erinnerung je
  Fälligkeit und Sitzung, fail-open bei jedem defekten State, kein Netzzugriff, höchstens
  fünf lokale Git-Aufrufe. Lauf-Marker `~/.claude/nc/queue-lauf.json` (reboot-fest, von den
  Skills selbst gestempelt), Sitzungsmarker ephemer in `os.tmpdir()`. Opt-out
  `NC_QUEUE_CHECK=off`; Test-Overrides `NC_QUEUE_STATE_DIR`, `NC_QUEUE_SESSION_DIR`,
  `NC_QUEUE_PFAD`. Details: `standardprozesse/queue-flow.md`.

- **Wissens-Zeiger** (`nc-wissens-hinweis.js`, UserPromptSubmit, seit Kern 0.12.0 — Onsite
  §15.40, Mapping D4): gleicht Prompt-Stichworte gegen den vorgebauten Sucheindex
  `hooks/wissen-sucheindex.json` und injiziert höchstens drei Zeiger-Zeilen auf Quellen
  der Wissensbasis — nie deren Inhalt. **Kein Gate**: Exit nie 2 (würde den Prompt
  löschen), blockiert nichts. Registry-Auflösung `kernRepoPfad` → `kernSsotPfad`
  (Lesekopie legitim für Zeiger). Opt-out `NC_WISSEN_HINWEIS=off`; Test-Overrides
  `NC_WISSEN_INDEX`/`NC_WISSEN_STATE_DIR`/`NC_WISSEN_SESSION_DIR`.
- **Pfad-Zeiger** (`nc-pfad-hinweis.js`, PreToolUse Write/Edit/MultiEdit/NotebookEdit,
  bewusst ohne Bash, seit Kern 0.12.0 — Onsite §15.49, Mapping D5): legt bei der ersten
  Schreibaktion je Sitzung und Pfadklasse (22 Klassen, `hooks/pfad-aenderungsindex.json`,
  längster Prefix) die passende Zeile der Änderungs-Matrix bei; matrixKeys sind
  testerzwungen Fett-Anker des Aktualisierungs-Index. **Kein Gate**: `permissionDecision`
  wird nie gesetzt, Exit immer 0. Nur im OS-Repo wirksam (`kernRepoPfad`, bewusst ohne
  Lesekopie-Fallback — begleitet Schreibarbeit). Dazu der Red-Flags-Block (≤ 400 Zeichen,
  testerzwungen) in der Session-Start-Injektion. Opt-out `NC_PFAD_HINWEIS=off`;
  Test-Overrides `NC_PFAD_INDEX`/`NC_PFAD_STATE_DIR`/`NC_PFAD_SESSION_DIR`.

## Was Gate 2 deterministisch prüft — und was nicht

Ehrliche Reichweite, damit die Tabelle oben nicht mehr verspricht, als der Code hält:

- **Geprüft wird die Git-Lage.** Der Stempel löst sie gegen das **Projektverzeichnis** auf
  (`CLAUDE_PROJECT_DIR`, sonst cwd) und vergleicht `--branch`/`--head` gegen
  `git rev-parse`. Ein Stempel aus einem Verzeichnis ohne Git wird als **unverifiziert**
  markiert und öffnet nur dort, wo auch die gegatete Aktion in keinem Git-Baum läuft —
  ein `cd` in ein leeres Verzeichnis reicht also nicht (Nachtrag N2, Befund H1).
- **Geprüft wird *eine* reale Git-Lage — nicht zwingend die des Zielpfads.** Der Stempel gilt
  für die ganze Session, nicht je Repo: Wer in einer Session mehrere Repos anfasst, stempelt
  einmal. Ein Stempel, der gegen Repo A verifiziert wurde, öffnet also auch Schreibvorgänge
  in Repo B. Das ist Absicht — ein Toplevel-Vergleich würde Mehr-Repo-Sessions unbrauchbar
  machen. Gate 2 erzwingt „der Agent hat eine echte Git-Lage angesehen", nicht „genau die
  des nächsten Schreibvorgangs".
- **Nicht geprüft wird, ob `/nc:start` inhaltlich lief.** Kein Hook kann das feststellen;
  der Stempel ist der Proxy. Wer ihn setzt, ohne den Ablauf durchlaufen zu haben, umgeht
  Gate 2 so bewusst wie per `NC_START_GATE=off`. Das ist die dokumentierte Proxy-Grenze.
- **Der Durchlass für den Stempel-Befehl ist eng gefasst:** Er verlangt eine einzeilige,
  am Zeilenanfang verankerte Invokation von **genau diesem** Skript (Pfadvergleich, nicht
  Namenssuffix) durch **genau `node`/`node.exe`** (Basisname-Vergleich, nicht Namensmuster);
  alles, was eine zweite Aktion anhängt — `;`, `&&`, `|`, `>`, `#`, `$(…)` oder ein
  Zeilenumbruch —, verwirft ihn, ebenso Flags zwischen Interpreter und Skript.
  **Bewusst nicht akzeptiert:** das Debian-Legacy-Binary `nodejs`. Begründung: `hooks.json`
  startet die Hooks selbst über `node` — wo `node` fehlt, läuft die Kontroll-Schicht
  ohnehin nicht, und ein weiterer akzeptierter Interpretername wäre nur Angriffsfläche
  ohne Nutzen. Der Fehlfall ist selbstheilend: Die Ablehnung nennt den funktionierenden
  Befehl wörtlich.
- **Fail-open bleibt fail-open:** Läuft die Git-Abfrage des Gates in den 2-Sekunden-Timeout,
  wird durchgelassen (wie bei allen Gates) — dann aber mit einer Warnung auf stderr, damit
  Last die Kontroll-Schicht nicht unbemerkt abschwächt.
- **`NotebookEdit`** verlangt seit 2026-08-23 **beides**: den erledigten Session-Start
  (Gate 2) **und** Fakten je Zieldatei (Gate 1, Datei-Gate auf `notebook_path` —
  Onsite §15.38, Mapping D3); die frühere Lücke „Gate 1 matcht es nicht" ist geschlossen.

## Satelliten (Kollegen-OS)

Die eigenständigen Satelliten (`nc-felix`, `nc-biggi`) tragen **eigene Kopien** von Gate 1
**und** Gate 2 in ihren Plugins — Felix seit `nc-felix` 0.4.1 (Pin nachgezogen 2026-08-12),
markerlos wie der Kern; sie hängen nicht am Kern. Deshalb gilt: **nie parallel zum Kern `nc`
und nie zwei Satelliten gleichzeitig betreiben** — sonst feuern die Gates doppelt.

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus,
auf Weisung Lucas Vöhringer. Abgeleitet — normative Quellen gewinnen; bei Gate-Änderungen in
derselben Änderung nachziehen (`standardprozesse/aktualisierungs-index.md`, Zeile
„Hook neu/geändert").*
