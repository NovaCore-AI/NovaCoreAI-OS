# Kern-Plugin-Bau — Standardprozess für Agenten

> **Verbindlich** für jede Arbeit am Kern-Plugin `oai` und Referenz für den Bau eines neuen
> Kern-Plugins nach diesem Muster (auch mit abweichendem Scope). Den Bau von
> **Abteilungsplugins** regelt daneben
> [`abteilungs-plugin-bau.md`](<abteilungs-plugin-bau.md>) — die Scope-Tabelle dort (§1)
> definiert, wer welche Struktur trägt; die **Wissens-Seite** (Kern-SSOT samt
> Plugin-Verknüpfungsvorbereitung) regelt [`kern-ssot-aufbau.md`](<kern-ssot-aufbau.md>).
>
> **Status: lebendes Teilwerk** (angelegt 2026-08-09, Maintainer-Auftrag; Stand nachgezogen
> 2026-08-18). Destilliert aus dem real gebauten Kern (aktuell 0.24.0, 15 gebaute Skills
> inkl. der vier Wissens-Router §15.40) und den Governance-Entscheidungen aus Spec §15.22.
> Gate 3 ist gebaut (§4.7/§15.21/§15.26), Gate 4 endgültig entfallen (§15.44). Das Dokument
> wächst mit dem Kern; nach der Kern-Fertigstellung wird es auf den Endstand gehoben und fließt
> in das geplante firmeninterne Prozessarchiv ein (Roadmap §3).
> **Kette:** **dieser Prozess** → `sync-nachzug-bauzyklus.md`

## 1. Was ein Kern-Plugin ist (Scope)

Der Kern ist die **team-shared Governance-Schicht** (Spec §15.22): alles, was für **alle**
Abteilungen gleich ist — und **nur** das. Fachliches gehört in Abteilungsplugins.

| Bestandteil | Im Kern `oai` konkret | Regel |
|---|---|---|
| **Basis-Gate** (Sicherheitsnetz) | FFG: universelle Destruktiv-Liste, Datei-Gate, Routine-Bash (`hooks/oai-ffg.js` + `hooks/lib/`) | **domänen-frei halten** — keine Abteilungs-Fachprüfungen; jede Kern-Prüfung ist für Abteilungen tabu zu duplizieren (Prüfungs-Eigentum) |
| **Prozess-Infrastruktur** | Session-Start-Injektion (`hooks/oai-session-start.js`) + Start-Gate mit Fakten-Stempel (`hooks/oai-start-gate.js`/`hooks/oai-start-stempel.js`), Safety-Gate (`hooks/oai-safety-gate.js`), Doks-Autosync (`hooks/oai-doks-autosync.js`), PreCompact-Mahnung (`hooks/oai-end-mahnung.js`/`hooks/oai-end-stempel.js`), Queue-Fälligkeits-Erinnerung mit PR-Sichtbarkeit (`hooks/oai-queue-faelligkeit.js`, §15.39), Wissens-Zeiger (`hooks/oai-wissens-hinweis.js`, §15.40) | Hooks fail-open bei internen Fehlern, Opt-out-Env je Hook, **keine Marker-Dateien** (§15.20); Gate 4 (Sitzungsabschluss) ist endgültig entfallen (§15.44) |
| **Shared-Skills** | ständige Abteilung `gemeinsam` (`skills/<name>/SKILL.md`) | Format strikt nach `referenz/skill-authoring.md`; Platzhalter-Ordner ohne `SKILL.md` bleiben unausgeliefert |
| **Normative Doks** | `wp-rahmen.md` (WP0–WP8), `referenz/skill-authoring.md`, `referenz/agent-authoring.md` (§15.34), `referenz/wissens-router.md` (§15.40), `referenz/pflege-auspraegung.md` | liegen im Kern, weil sie ausgeliefert werden (§15.18) — installierte Plugins sehen keine Repo-Pfade |
| **Registry** | `module-registry.json` — reiner Metadaten-SSOT (Abteilung → Plugin → Module → Skills) | steuert nichts aus; spiegelt die Kern-Version (Leitversion) |
| **Testsuite** | `tests/*.test.mjs` — FFG + FFG-Drift, Struktur-Invarianten (inkl. Router-/Fußzeilen-Prüfungen), Session-Start/Start-Gate, Safety-Gate, Doks-Autosync, PreCompact-Mahnung, Agenten-Invarianten (portabel + OS-gebunden), Queue-Fälligkeit, Wissens-Zeiger | jeder Hook bekommt Tests inkl. Negativ-/Fehlalarm-Probe; Struktur-Invarianten sind Policy-Tests des ganzen Marketplace |
| **Manifest** | `.claude-plugin/plugin.json` | Kern-Version = **Produkt-Leitversion**, gespiegelt in `VERSION` + Registry (testerzwungen); Beschreibungstext nennt die gebauten Hooks (Team liest ihn im Install-Dialog) |

Jedes Abteilungsplugin führt `dependencies: ["oai"]` — der Kern ist damit das
Fundament jeder Installation und technisch nicht abwählbar.

## 2. Bauablauf (destilliert aus dem realen Bau seit 0.1.0)

1. **Spec zuerst:** Jede Design-Entscheidung entsteht als **Spec-Nachtrag** (nie in-place),
   bevor gebaut wird; der jüngste Nachtrag gewinnt. Kontrollmechanismen (Regeln, Schwellen,
   Verbote) sind Teil der Entscheidung und werden dem Maintainer vorgelegt — nicht als
   Ausgestaltung miterfunden (Fehlerprotokoll 2026-08-09).
2. **Manifest + Leitversion:** Version **nur** in `plugin.json`; beim Kern zusätzlich `VERSION`
   und Registry spiegeln. **Gebumpt wird ausschließlich am Release-Zug** (Aktualisierungs-Index §3.6),
   nie in diesem Bauablauf — hier wird der Gleichstand nur geprüft. Bump-Schema:
   `Aktualisierungs-Index` §3.
3. **Skills** nach `skill-authoring.md` (YAML-Falle, dritte-Person-Trigger, Länge); eine Datei
   je Skill, Detailwissen als Referenzdatei daneben. Keine Repo-Pfade in ausgelieferten Dateien
   (Plugin-Grenze, testerzwungen).
4. **Kontroll-Schicht** auf einem gemeinsamen Gerüst, in der Reihenfolge des Zielplans
   Kontroll-Schicht (Gates 1 → 2 → 3 → 4): quote-aware Bash-Analyse wiederverwenden
   (`hooks/lib/bash-analyse.js`), `process.exitCode` statt `process.exit()` (Truncation-Falle,
   Debug-Log 2026-08-04), Hook-Pfade über `${CLAUDE_PLUGIN_ROOT}`.
5. **Tests + Validierung beider Ebenen** vor jedem Commit-Vorschlag:
   `node --test plugins/oai/tests/*.test.mjs` · `claude plugin validate .` **und**
   `claude plugin validate plugins/oai --strict` (die Wurzel-Variante allein prüft keine
   Skills).
6. **Doku-Nachzug** nach `Aktualisierungs-Index` (Änderungs-Matrix + Selbsttest).
   **Kein CHANGELOG-Eintrag und kein Bump im Strang** —
   Wissensträger ist das **PR-Ergebnismemo** mit gekennzeichnetem Produktanteil; Version und
   CHANGELOG-Sektion vergibt der Release-Zug (Aktualisierungs-Index §0/§3.6). Einen ausführenden Skill
   gibt es seit 2026-08-17 nicht mehr (§15.43); Träger sind CI-Prüfzyklus und
   Maintainer-Review am PR.

## 2a. Standardprozess Autosync/Doks-Sync (gebaut 2026-08-10, Kern 0.12.0 — AP2)

Normierungsort laut Spec §15.28 und Bauplan `Bauplan-archiv/2026-08-10-claude-ebenen-architektur-konzeption.md`
§2.4/§2.4a: der Autosync-Prozess bekommt kein eigenes Dokument, sondern wird hier als
Standardprozess geführt. **Gebaut** am 2026-08-10 (Kern 0.11.1 → 0.12.0):
`plugins/oai/hooks/oai-doks-autosync.js` + Payload `plugins/oai/doks/global-claude-firmenblock.md`
+ Tests `plugins/oai/tests/oai-doks-autosync.test.mjs`.

1. **Mechanik:** Ein SessionStart-Script im Kern (Muster der bestehenden Gates) vergleicht den
   Versions-Stempel im Ziel-Block (`<!-- OAI:BLOCK:VERSION <kern-version> -->`, erste Blockzeile)
   mit der Plugin-Version; bei Abweichung wird die Payload aus dem Plugin-Paket an den Zielort
   geschrieben. **Pfad-Auflösung relativ zum Hook (`__dirname`)** — bewusst weder über
   `CLAUDE_PLUGIN_DATA` noch über andere Env-Ableitungen (Lesson Kern 0.11.1: die Variable ist
   zwischen Prozessen inkonsistent); `${CLAUDE_PLUGIN_ROOT}` bleibt der Lade-Pfad in
   `hooks.json`, nicht die State-Quelle. Ziel: `~/.claude/CLAUDE.md`; für Tests umleitbar per
   `OAI_AUTOSYNC_TARGET`.
2. **Eigenschaften:** idempotent (der Versions-Stempel im Block IST der Stempel — kein externer
   State, keine Stempeldateien); Marker-Blöcke (`<!-- OAI:BLOCK:START name -->` …
   `<!-- OAI:BLOCK:ENDE name -->`, siehe `Onsite.ai-OS-CLAUDE-Ebenen-Definition.md`) schützen die
   Privat-Zone (alles außerhalb bleibt byte-identisch); Backup `<ziel>.oai-autosync-backup` vor
   jedem Schreiben; **fail-safe bei defekten Markern** (START ohne ENDE o. ä. → nichts schreiben,
   stderr-Hinweis — lieber veraltet als zerstört); Subagenten ausgenommen; Opt-out
   `OAI_AUTOSYNC=off`; strikt fail-open (`process.exitCode = 0`, nie `process.exit()`).
3. **Kein Cron** — Setup-Abhängigkeit pro Maschine, kein Zusatznutzen. Wirkung nur in Sessions,
   also reicht SessionStart.
4. **`/oai:update-doks`** bleibt der manuelle Reparatur-/Erstlauf-Befehl, hört auf, der
   Normalweg zu sein (präzisiert §15.3).
5. **Verifizierte Hook-Mechanik** (offizielle Hooks-Doku, abgerufen 2026-08-10, vor dem Bau):
   SessionStart-Hooks laufen parallel, sind nicht-blockierend, Default-Timeout **600 s** je Hook,
   feuern bei den dokumentierten `source`-Werten startup/resume/clear/compact — ein eigener
   Wert `fork` existiert nicht; ein geforkter Resume bleibt ein Resume. Der Bauplan-§3-Punkt „Offen" ist
   damit geschlossen.
6. Verweis: Spec §15.28 + Definitionsdokument `Onsite.ai-OS-CLAUDE-Ebenen-Definition.md`;
   Ist-Stand: Betriebshandbuch §6.3.

## 2b. Upstream-Drift-Ritual FFG-Engine (§15.38)

Die FFG-Erkennung (`hooks/lib/bash-analyse.js`, `hooks/lib/shell-substitution.js`,
Hook-Eintritt `oai-ffg.js`) ist ein Port des GateGuard aus dem ECC-Plugin. Damit ein
künftiger Upstream-Fix (GHSA-4v57-ph3x-gf55 war genau so einer) nicht unbemerkt
vorbeirauscht, gilt:

- **Pin-Stand — genau eine Stelle, hier:** ecc@**2.0.0** (gelesen 2026-07-26,
  Upstream-Repo-Stand nachgezogen 2026-07-27). Code-Kommentare verweisen auf diesen
  Abschnitt, sie pflegen die Angabe nicht selbst.
- **Trigger:** (a) neues ECC-Release im Plugin-Cache (`~/.claude/plugins/cache/ecc/`),
  (b) jede Änderung an den beiden Lib-Dateien (Hook-Zeile im Aktualisierungs-Index
  erinnert), (c) spätestens je Halbjahr ein Versions-Check des Caches.
- **Schritte je Lauf:** 1. Neue/ändernte Engine-Testfälle aus
  `tests/hooks/gateguard-fact-force.test.js` in die Drift-Falltabelle
  (`plugins/oai/tests/oai-ffg-drift.test.mjs`) übernehmen. 2. `shell-substitution.js`
  gegen `scripts/lib/shell-substitution.js` des neuen Stands diffen — Soll:
  funktionell wortgleich. 3. rm-/git-/SQL-/find-/quote-aware-Logik gegen den
  **Monolithen** `scripts/hooks/gateguard-fact-force.js` diffen (für `bash-analyse.js`
  existiert upstream keine Datei-Entsprechung — Strukturwandel PR #1853). 4. Je Punkt
  die Übernahme-Entscheidung im CHANGELOG festhalten — auch „bewusst nicht übernommen".
- **Bewusste Dauer-Abweichungen** (Erwartungen der Drift-Tabelle dürfen hiervon
  abweichen, jeweils mit Spec-§-Verweis in der Datei): Env-Namen `OAI_FFG_*`,
  erweiterte Read-only-Allowlist (§15.25), kein KI-sichtbarer Abschalt-Hinweis,
  Windows-Muster (§15.38 — Upstream hat keine).

## 3. Regeln, die nur den Kern binden

- **Kern-Version = Produkt-Leitversion.** Kein Bump = kein Auto-Update fürs Team.
- **Basis-Gate bleibt domänen-frei.** Was eine einzelne Abteilung prüfen will, gehört in deren
  Domänen-FFG — der Kern fragt nie nach Branch-Regeln oder Empfängern.
- **Matcher sind kein Kern-Monopol** (§15.22): Der Kern besitzt seine **Prüfungen** exklusiv,
  nicht die Werkzeugnamen. Abteilungs-Hooks dürfen dieselben Matcher abonnieren — nach der
  Hook-Norm W4 (2026-08-21) in einem etablierten Satelliten, spezialisiert und
  nicht-kollidierend.
- **Der Kern ist das Referenzbeispiel** (Maintainer-Auflage §15.22): Der Sicherheitsapparat
  wird zuerst hier vollständig gebaut; Abteilungen iterieren danach nach diesem Vorbild.

## 4. Replikation für einen abweichenden Scope

Wer nach diesem Muster ein neues Kern-Plugin baut (z. B. für eine andere Organisation), hält
die Schichtgrenze ein: team-shared = domänen-freier Basisschutz + Prozess-/Wissens-
Infrastruktur + Shared-Skills; alles Fachliche in abgeleitete Plugins mit
`dependencies`-Kopplung. Reihenfolge wie §2; die Scope-Tabelle in
`abteilungs-plugin-bau.md` §1 gilt spiegelbildlich.

## 5. Offene Bestandteile (Stand 2026-08-17)

| Offen | Stand / Blocker |
|---|---|
| **`/oai:grill-me`** | Platzhalter ohne `SKILL.md`; Inhalt und Abgrenzung zur gebauten Fit-Prüfung sind noch zu konzipieren |
| Erledigt seit dem letzten Stand: Start-Gate (§15.25) · Safety-Gate (§15.21/§15.26) · endgültiger Entfall von Gate 4 (§15.44) · Wissens-Router + Wissens-Zeiger (§15.40) · Fit-Prüfung Skill+Agent (§15.45) · Entfernung von `doku-sync` (§15.43) · SSOT-Pflege-Skills `queue-abteilung`/`queue-kern` (§15.36) · Neufassung von `update-doks` (§15.47) | — |

---

*Angelegt 2026-08-09 durch Claude (Fable 5, Claude Code) auf Weisung Lucas Vöhringer, im Zuge
der §15.22-Neufassung (Zweiteilung des früheren `plugin-bau.md`). Abschnitt 2b
(Upstream-Drift-Ritual) ergänzt 2026-08-15 (§15.38).*
