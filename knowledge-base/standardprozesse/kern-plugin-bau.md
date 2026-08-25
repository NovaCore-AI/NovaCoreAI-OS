# Kern-Plugin-Bau — Standardprozess für Agenten

> **Verbindlich** für jede Arbeit am Kern-Plugin `nc` und Referenz für den Bau eines neuen
> Kern-Plugins nach diesem Muster (auch mit abweichendem Scope). Den Bau von
> **Abteilungsplugins und eigenständigen Satelliten** regelt daneben
> [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md) — die Governance-Tabelle in §1a sagt,
> wer welche Struktur trägt. Die **Wissens-Seite** regelt [`ssot-aufbau.md`](ssot-aufbau.md),
> die Nachzugs-Mechanik je Bauzyklus
> [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md), den Änderungsumfang je Änderungsart
> der [`aktualisierungs-index.md`](aktualisierungs-index.md).
>
> **Status: lebendes Teilwerk.** Hervorgegangen aus der Zweiteilung des früheren
> `plugin-bau.md` (2026-08-11, Bauplan-AP1; das Vorbild `Onsite.ai-OS` hat sie am 2026-08-09
> vollzogen). **Diese Datei trägt die Git-Historie des Vorgängers nicht** (Review-Befund
> 2026-08-12, Plan-Nachtrag N4): Git erkennt Umbenennungen inhaltsbasiert, und der größere
> Textanteil ist in `abteilungs-plugin-bau.md` gelandet. Wer die Vorgeschichte einer Regel
> braucht, liest sie über den alten Pfad —
> `git log --oneline -- knowledge-base/standardprozesse/plugin-bau.md`. Mechanik-Aussagen
> sind gegen die offizielle Claude-Code-Doku verifiziert (`plugin-marketplaces` zuletzt
> **2026-08-11**, `plugins-reference`/`skills` **2026-07-28**, Hooks-Doku **2026-08-10**). Vor
> Format-Änderungen erneut abrufen — nie aus dem Gedächtnis.

## 1. Was das Kern-Plugin ist (Scope)

Der Kern ist die **team-shared Governance-Schicht**: alles, was für **alle** Abteilungen gleich
ist — und **nur** das. Fachliches gehört in Abteilungsplugins.

| Bestandteil | Im Kern `nc` konkret | Regel |
|---|---|---|
| **Basis-Gate** (Sicherheitsnetz) | FFG: universelle Destruktiv-Liste, Datei-Gate, Routine-Bash (`hooks/nc-ffg.js` + `hooks/lib/`) | **domänen-frei halten** — keine Abteilungs-Fachprüfungen; jede Kern-Prüfung ist für Abteilungen tabu zu duplizieren (Prüfungs-Eigentum) |
| **Prozess-Infrastruktur** | Session-Start-Injektion (`nc-session-start.js`), Start-Gate + Fakten-Stempel (`nc-start-gate.js`, `nc-start-stempel.js`), Safety-Gate (`nc-safety-gate.js`, seit 2026-08-23), Doks-Autosync (`nc-doks-autosync.js`); Gate 4 endgültig entfallen (§5) | Hooks **fail-open** bei internen Fehlern, Opt-out-Env je Gate, **keine Marker-Dateien** (ein Gate, das man vergessen kann, ist kein Gate) |
| **Shared-Skills** | ständige Abteilung `gemeinsam` (`skills/<name>/SKILL.md`): `start`, `end-session` (bis 0.7.x `save-session`), `journal`, `setup`, `os-info`, `skill-builder`, `update-doks`, `queue-abteilung`/`queue-kern` und die vier `wissen-*`-Router (seit 0.12.0; `doku-sync` ist seit 0.12.0 ersatzlos entfallen) | Format strikt nach `referenz/skill-authoring.md`; Ordner ohne `SKILL.md` ignoriert der Scanner und bleibt unausgeliefert |
| **Normative Doks** | `wp-rahmen.md` (WP0–WP8), `referenz/skill-authoring.md`, `doks/nc-teamsync.md`, `doks/global-claude-firmenblock.md` (Ebene-1-Payload) | liegen **im Kern**, weil sie ausgeliefert werden — installierte Plugins sehen keine Repo-Pfade (§2 Fakt 4 des Abteilungsdokuments) |
| **Registry** | `module-registry.json` — reiner Metadaten-SSOT (Abteilung → Plugin → Module → Skills) | steuert nichts aus; spiegelt die Kern-Version (Leitversion) |
| **Testsuite** | `tests/*.test.mjs` — FFG, Start-Gate, Session-Start, Autosync, SSOT-Provisionierung, Struktur-Invarianten | jeder Hook bekommt Tests **inklusive Negativ- und Fehlalarm-Probe**; die Struktur-Invarianten sind Policy-Tests des ganzen Marketplace |
| **Manifest** | `.claude-plugin/plugin.json` | Kern-Version = **Produkt-Leitversion**, gespiegelt in `VERSION` + Registry (testerzwungen); der Beschreibungstext nennt die gebauten Hooks (das Team liest ihn im Install-Dialog) |

Jedes **repo-interne** Abteilungsplugin führt `dependencies: ["nc"]` — der Kern ist damit das
Fundament jeder Installation und technisch nicht abwählbar. **Ausnahme:** eigenständige
Abteilungs-OS in Satelliten-Repos (`nc-felix`, `nc-biggi`) führen keine Kern-Dependency; sie
bringen Kernmodul und Kontroll-Schicht selbst mit (Begründung und Folgen:
`abteilungs-plugin-bau.md` §1 und §3b).

### 1a. Zwei Governance-Schichten — wer trägt welche Struktur

Der Unterschied ist nicht *was*, sondern *für wen*. Diese Tabelle ist die Schnittkante zwischen
diesem Dokument und `abteilungs-plugin-bau.md`; sie steht **nur hier**.

| | Kern `nc` (team-shared) | Abteilungsplugin / Satellit (individuell) |
|---|---|---|
| **Sicherheitsnetz** | **Basis-Gate**: universelle Destruktiv-Liste, Datei-Gate, Routine-Bash — domänen-frei, einmal gepflegt (das heutige FFG) | **Repo-interne Abteilung: keine eigenen Hooks** (sonst feuern die Gates doppelt; testerzwungen „Hooks nur im Kern"). Fachliche Prüfwünsche werden als Anforderung an den Kern gestellt. **Eigenständiger Satellit:** trägt eine **eigene Kopie** der Kontroll-Schicht, weil er Kern-Hooks technisch nicht erreichen kann |
| **Infrastruktur** | Session-Start (Injektion + Erzwingungs-Begleiter), Doks-Autosync, SSOT-Präsenz (Wissens-Router `wissen-*` + zwei Zeiger-Hooks; der frühere `/nc:doku-sync` ist ersatzlos entfallen — Träger: CI-Prüfzyklus + Maintainer-Review am PR), Shared-Skills, geteiltes Fehlerprotokoll | Fach-Skills · Fach-Workflow (`workflow.md`) · eigene Konnektoren · beim eigenständigen Satelliten zusätzlich die **eigene Wissensbasis** samt mechanischem Wächter (`ssot-aufbau.md` §4) |
| **Verbot** | keine Abteilungs-Fachprüfungen im Kern | **keine Kern-Prüfung duplizieren oder abschwächen** |

**Prüfungs-Eigentum statt Matcher-Eigentum:** Jede Prüfung hat genau ein Heimat-Plugin;
Werkzeugnamen sind frei. Deshalb dürfen sich Matcher überlappen — im Kern tun sie das bereits:
FFG und Start-Gate abonnieren denselben PreToolUse-Matcher und prüfen Verschiedenes. Die eigene
Kopie eines Gates im Satelliten ist **keine** Duplikation im Sinne der Regel, weil dort kein
Kern-Hook läuft.

## 2. Bauablauf

1. **Plan zuerst:** Jede Design-Entscheidung entsteht als **Nachtrag** zum jüngsten Bauplan bzw.
   Definitionsdokument (nie in-place), bevor gebaut wird; der jüngste Nachtrag gewinnt.
   Kontrollmechanismen (Regeln, Schwellen, Verbote) sind Teil der Entscheidung und werden dem
   Maintainer vorgelegt — nicht als Ausgestaltung miterfunden.
2. **Manifest + Leitversion:** Version **nur** in `plugin.json`; beim Kern zusätzlich `VERSION`
   und `module-registry.json` spiegeln. Bump-Schema und Release-Weg: `aktualisierungs-index.md`.
3. **Skills** nach `referenz/skill-authoring.md` (YAML-Falle, Trigger in dritter Person, Länge);
   eine Datei je Skill, Detailwissen als Referenzdatei daneben. **Keine Repo-Pfade in
   ausgelieferten Dateien** (Plugin-Grenze, testerzwungen).
4. **Kontroll-Schicht** auf gemeinsamem Gerüst, in der Reihenfolge der Gates 1 → 2 → 3 (ein Gate 4 gibt es nicht mehr):
   quote-aware Bash-Analyse wiederverwenden (`hooks/lib/bash-analyse.js`), Session-Schlüssel aus
   `hooks/lib/session-key.js` beziehen (nie eine zweite Kopie in Sicherheitscode),
   **`process.exitCode` statt `process.exit()`** — Truncation-Falle: `process.exit()` kann auf
   POSIX den gepufferten stdout-Write einer Pipe abschneiden, und eine abgeschnittene Deny-JSON
   heißt, das Gate blockt **still nicht**. Hook-Pfade über `${CLAUDE_PLUGIN_ROOT}`.
5. **Tests + Validierung beider Ebenen** vor jedem Commit-Vorschlag:
   `node --test plugins/nc/tests/*.test.mjs` · `claude plugin validate .` **und**
   `claude plugin validate plugins/nc --strict` (die Wurzel-Variante allein prüft keine Skills).
6. **Doku-Sync** nach dem `aktualisierungs-index.md` (Änderungs-Matrix + Selbsttest); die
   abgeleiteten Nachzüge laufen gebündelt nach `sync-nachzug-bauzyklus.md`. CHANGELOG-Eintrag
   **mit Namenszeichnung** ist Pflicht für jede Änderung.

## 2a. Standardprozess Doks-Autosync (gebaut)

Der Autosync bekommt **kein eigenes Dokument**, sondern wird hier als Standardprozess geführt.
Gebaut: `plugins/nc/hooks/nc-doks-autosync.js` + Payload
`plugins/nc/doks/global-claude-firmenblock.md` + `plugins/nc/tests/nc-doks-autosync.test.mjs`.
Normative Begriffsquelle der Ebenen: `grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md`.

1. **Mechanik:** Ein SessionStart-Script vergleicht den Versions-Stempel im Ziel-Block
   (`<!-- NC:BLOCK:VERSION <kern-version> -->`, erste Zeile im Block) mit der Plugin-Version; bei
   Abweichung wird **nur der Inhalt zwischen den Markern** ersetzt. Marker:
   `<!-- NC:BLOCK:START global -->` … `<!-- NC:BLOCK:ENDE global -->`. **Pfad-Auflösung relativ
   zum Hook (`__dirname`)** — bewusst nicht über `CLAUDE_PLUGIN_DATA` (die Variable ist zwischen
   Prozessen inkonsistent); `${CLAUDE_PLUGIN_ROOT}` bleibt der **Lade**-Pfad in `hooks.json`,
   nicht die State-Quelle. Ziel: `~/.claude/CLAUDE.md`, für Tests umleitbar per
   `NC_AUTOSYNC_TARGET`.
2. **Fallunterscheidung:** Ziel fehlt → Datei mit Block anlegen · Ziel ohne Marker → Block ganz
   **oben** einfügen, Bestand byte-identisch dahinter · Marker + identisch → **No-op** (kein
   Schreiben, kein Backup) · Marker + abweichend → Blockinhalt ersetzen · **Marker defekt**
   (START ohne ENDE, ENDE vor START, Mehrfach-Marker) → **nichts schreiben**, stderr-Hinweis
   (fail-safe: lieber veraltet als zerstört).
3. **Eigenschaften:** idempotent — **der Versions-Kommentar im Block IST der Stempel**, kein
   externer State, keine Stempeldateien. Alles außerhalb der Marker ist **Privat-Zone** des
   Mitarbeiters und bleibt unverändert. Rollierende Sicherung `<ziel>.nc-autosync-backup` vor
   jedem Schreiben. Subagenten ausgenommen. Opt-out `NC_AUTOSYNC=off` (auch `0`/`false`/
   `disabled`). Strikt fail-open: `process.exitCode = 0`, nie `process.exit()`.
4. **Zwei NC-Härtungen über das Vorbild hinaus** (Review 2026-08-10 — nicht wegoptimieren):
   - **Atomarer Write** über eine Temp-Datei im selben Verzeichnis plus `rename` statt
     In-place-Write. SessionStart feuert auch bei `resume`/`clear`/`compact`/`fork`, zwei
     parallel startende Fenster sind also real: Vorher konnte ein zweiter Prozess einen halb
     geschriebenen Bestand lesen, darin keine Marker finden, den Torso als „Backup" über die
     einzige gute Sicherung kopieren und ihn hinter den Block hängen — Privat-Zone dauerhaft
     gekürzt.
   - **Die Sicherung wird nie verschlechtert:** Trägt das vorhandene Backup ein intaktes
     Markerpaar und der aktuelle Bestand keines, bleibt das ältere, bessere Backup stehen.
5. **Kein Cron** — Setup-Abhängigkeit pro Maschine ohne Zusatznutzen; die Wirkung entsteht nur in
   Sessions, also genügt SessionStart.
6. **Kein manueller Autosync-Befehl.** Bei defekten Markern repariert der Mensch die Marker; der
   nächste Session-Start zieht nach. `/nc:setup` ist der Weg für die **Wissensbasis**, nicht für
   diesen Block — die beiden nicht verwechseln.
7. **Verifizierte Hook-Mechanik** (offizielle Hooks-Doku, abgerufen 2026-08-10, vor dem Bau):
   SessionStart-Hooks laufen parallel, sind nicht-blockierend, Default-Timeout **600 s** je Hook
   und feuern bei `source` startup/resume/clear/compact/fork; `command`-Hooks dürfen Dateien
   schreiben.

## 2b. Upstream-Drift-Ritual FFG-Engine (Onsite §15.38, Port 2026-08-23 — Mapping D3)

Die FFG-Erkennung (`hooks/lib/bash-analyse.js`, `hooks/lib/shell-substitution.js`,
Hook-Eintritt `nc-ffg.js`) ist ein Port des GateGuard aus dem ECC-Plugin. Damit ein
künftiger Upstream-Fix (GHSA-4v57-ph3x-gf55 war genau so einer) nicht unbemerkt
vorbeirauscht, gilt:

- **Pin-Stand — genau eine Stelle, hier:** ecc@**2.0.0** (gelesen 2026-07-26,
  Upstream-Repo-Stand nachgezogen 2026-07-27). Code-Kommentare verweisen auf diesen
  Abschnitt, sie pflegen die Angabe nicht selbst.
- **Trigger:** (a) neues ECC-Release im Plugin-Cache (`~/.claude/plugins/cache/ecc/`),
  (b) jede Änderung an den beiden Lib-Dateien (Hook-Zeile im Aktualisierungs-Index
  erinnert), (c) spätestens je Halbjahr ein Versions-Check des Caches.
- **Schritte je Lauf:** 1. Neue/geänderte Engine-Testfälle aus
  `tests/hooks/gateguard-fact-force.test.js` in die Drift-Falltabelle
  (`plugins/nc/tests/nc-ffg-drift.test.mjs`) übernehmen. 2. `shell-substitution.js`
  gegen `scripts/lib/shell-substitution.js` des neuen Stands diffen — Soll:
  funktionell wortgleich. 3. rm-/git-/SQL-/find-/quote-aware-Logik gegen den
  **Monolithen** `scripts/hooks/gateguard-fact-force.js` diffen (für `bash-analyse.js`
  existiert upstream keine Datei-Entsprechung — Strukturwandel PR #1853). 4. Je Punkt
  die Übernahme-Entscheidung im CHANGELOG festhalten — auch „bewusst nicht übernommen".
- **Bewusste Dauer-Abweichungen** (Erwartungen der Drift-Tabelle dürfen hiervon
  abweichen, jeweils mit Verweis in der Datei): Env-Namen `NC_FFG_*`, erweiterte
  Read-only-Allowlist (Onsite §15.25 / NC-AP1 **plus** die NC-eigene segmentweise
  Introspektion mit `cd`/`worktree list`/`-sb`, Härtung 2026-08-14 — weder Upstream
  noch Onsite kennen sie), kein KI-sichtbarer Abschalt-Hinweis, Windows-Muster und
  Wrapper-Passthrough (Onsite §15.38/§15.46 — Upstream hat beides nicht), sowie
  `psFlagActive` mit nicht-falsy-Semantik (`-Recurse:1` zählt als aktiv — GLM-R2
  2026-08-24, am PS-5.1-Cmdlet empirisch belegt; Onsite prüft nur `:$true` und teilt
  die Lücke).

## 3. Regeln, die nur den Kern binden

- **Kern-Version = Produkt-Leitversion.** Kein Bump = kein Auto-Update fürs Team. Gespiegelt in
  `VERSION` und `module-registry.json`, testerzwungen — sonst beginnt die Drift-Serie von Neuem.
- **Basis-Gate bleibt domänen-frei.** Was eine einzelne Abteilung prüfen will, gehört in deren
  Domänen-Ausprägung — der Kern fragt nie nach Branch-Regeln oder Empfängern.
- **Hooks bleiben im Kern.** Repo-interne Abteilungsplugins bringen keine mit (testerzwungene
  Invariante); eigenständige Satelliten sind die dokumentierte Ausnahme (§1a).
- **Mindest-Client des Produkts.** Das Abteilungsmodell hängt an der Dependency-Mechanik:
  transitives Enable-/Disable-Blocking ab Claude Code **2.1.143**, `defaultEnabled` ab
  **2.1.154**, `renames` ab **2.1.193**. Das Team fordert **≥ 2.1.193**; ältere Clients melden
  nur ein nachgelagertes `dependency-unsatisfied`, statt den Kern zu erzwingen.
  **Was wo steht:** Die **Einzelschwellen samt Begründung** stehen ausschließlich hier —
  `abteilungs-plugin-bau.md` §2 Fakt 6 verweist darauf, statt sie zu spiegeln. Die **nackte
  Team-Anforderung** (`≥ 2.1.193`) ist davon ausgenommen: Sie gehört zum Produktstand und wird
  laut Änderungs-Matrix (`aktualisierungs-index.md` §2.3, Zeile „Mindestversion Claude Code /
  Node") pflichtgemäß in `README.md`, `ONBOARDING.md` und `AGENTS.md` mitgeführt. Diese
  Spiegel sind **gewollt** und werden nicht „aufgeräumt"; die Sparsamkeitsregel richtet sich
  gegen *neue*, unbeauftragte Fundstellen.
- **Der Kern ist das Referenzbeispiel.** Der Sicherheitsapparat wird zuerst hier vollständig
  gebaut; Abteilungen und Satelliten iterieren danach nach diesem Vorbild — nie umgekehrt.

## 4. Replikation für einen abweichenden Scope

Wer nach diesem Muster ein neues Kern-Plugin baut (etwa für eine andere Organisation), hält die
Schichtgrenze ein: team-shared = domänen-freier Basisschutz + Prozess- und Wissens-Infrastruktur
+ Shared-Skills; alles Fachliche in abgeleitete Plugins mit `dependencies`-Kopplung. Reihenfolge
wie §2; die Governance-Tabelle §1a gilt spiegelbildlich. Die Wissens-Seite repliziert man nach
`ssot-aufbau.md` §6.

## 5. Offene Bestandteile

| Offen | Stand / Blocker |
|---|---|
| ~~Gate 3 (Safety-Gate) und Gate 4 (Sitzungsabschluss)~~ **erledigt/entfallen 2026-08-23** | Gate 3 ist **gebaut** (`nc-safety-gate.js`, Port aus dem Onsite-Vorbild — Mapping D1/EN4); Gate 4 ist **endgültig entfallen** (Onsite §15.44, Mapping D2). Stand: `grundwissen/NovaCore-OS-Gates-Definition.md` |
| **Automatische SSOT-Pflege** über die SSOT-Präsenz (Router + Zeiger-Hooks) hinaus | die Änderungs-Matrix ist heute der Selbsttest; was mechanisch erzwingbar ist, gehört in `struktur.test.mjs` (`ssot-aufbau.md` §2, Baustein 6) |

---

*Zweiteilung des früheren `plugin-bau.md` am 2026-08-11 durch Claude (Opus 5, Claude Code) auf
Weisung Lucas Vöhringer (Bauplan
`grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md`, AP1 /
Entscheid E2). Struktur-Vorbild: `Onsite.ai-OS@5d335a7` `kern-plugin-bau.md`; Inhalte auf den
NovaCore-Ist-Stand gemappt und dort, wo NovaCore härter ist (Autosync §2a.4, „Hooks nur im
Kern"), nach dem realen Code statt nach dem Vorbild geschrieben.*
