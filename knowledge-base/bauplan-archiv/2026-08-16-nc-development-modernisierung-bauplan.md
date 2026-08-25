# Bauplan 2026-08-16 — Modernisierung `nc-development` (AP-F1-Synthese → AP-F2)

> **Status:** Synthese der Abteilungs-Inhalts-Prüfung AP-F1 (Standardprozess
> `standardprozesse/abteilungs-inhalts-pruefung.md`, §3 Schritte 3–5) und zugleich der
> **Arbeitsauftrag für AP-F2** (Bauplan
> [`2026-08-15-onsite-endstand-nachbau-bauplan.md`](2026-08-15-onsite-endstand-nachbau-bauplan.md),
> §4 Phase F, N1/N6/N7/N8). Beide Prüf-Läufe liefen **unabhängig** (zwei Opus-Agenten,
> read-only): Lauf 1 = Soll-Anforderungsregister allein aus den Normquellen (101
> Anforderungen, Anhang A), Lauf 2 = Ist-Inventur aller 15 Artefakte mit zitierten
> Fundstellen (Anhang B). Diese Synthese führt beide zusammen; die Rohdaten sind
> **vollständig** angehängt (Persistenz-Pflicht §7 — der Session-Output ist kein
> Aufbewahrungsort).

## 1. Drift-Matrix (Soll ↔ Ist, je Befund Kategorie + Schwere)

| # | Artefakt/Gegenstand | Kategorie | Schwere | Soll-Beleg (Anhang A) ↔ Ist-Beleg (Anhang B) | AP-F2 |
|---|---|---|---|---|---|
| 1 | Abteilungs-CLAUDE Ebene 2 (`development-abteilungs-claude.md`) | FEHLT | HOCH | A1–A12 ↔ Negativ-Inventar („keine Abteilungs-CLAUDE"), Prüfpunkt 9 („bestätigt nicht umgesetzt") | F2.1 |
| 2 | WP7 ohne Skill — Module `qs`/`rel` fehlen | FEHLT | HOCH | C1, D1–D6 ↔ Prüfpunkte 2/8 („OFFEN für Abnahme-Kette WP7", „WP3/WP7 ohne eigenen Skill") | F2.2 |
| 3 | Sprachregel für **erzeugte** Text-Entwürfe fehlt; Norm-Konflikt `nc-sync.md` §6 ↔ N6 | NORM-DRIFT | HOCH | D12/D13 ↔ Prüfpunkt 3 („null Treffer `Deutsch\|englisch`") | F2.3 (Upstream zuerst) |
| 4 | Domänen-rote-Linien + Queue nur in `pflege-auspraegung.json`, unsichtbar in `workflow.md`/README; kein SSOT-Abschnitt | NORM-DRIFT + FEHLT | MITTEL | A7/A10, C4/C7, E1, H1–H4 ↔ Prüfpunkte 5/6/8c | F2.4 |
| 5 | `wzs-blocker-gate`: Jira-Ablaufzeile widerspricht eigener Regel; Kürzel `EP` ohne Quelle; `flc-pr` ohne manuellen Weg ohne `gh` | NORM-DRIFT | MITTEL | D10/D11, J3 ↔ Prüfpunkt 1 (Zitate `:56` vs. `:70`) | F2.5 |
| 6 | Abteilungs-README ohne Installations-/Setup-Strecke und ohne Koexistenz-Regel | FEHLT | MITTEL | G1–G4 ↔ Prüfpunkt 12 | F2.6 |
| 7 | WZS-Fachfakten (v2.3-Zahlen, 6 Stellen) ohne Frische-Marker; Quelle liegt außerhalb dieses Repos | STALE-RISIKO | NIEDRIG | D19/D22 ↔ Prüfpunkt 4 („OFFEN — nicht belegbar; Drift-frei seit 2026-07-07") | F2.7 |
| 8 | Review-Kette nach N6 (Implementierer ≠ Reviewer, Admin nimmt ab und merged) nirgends als Rollen-Satz | NORM-DRIFT | NIEDRIG | D18 ↔ Prüfpunkt 2 (nur „der Mensch") | F2.8 |
| 9 | Registry: `status` „11 Skills in 4 Modulen", `minCoreVersion` 0.3.0, `_hinweis` ohne Ausprägung; `plugin.json` 0.1.0 + alte Description | STALE-FAKT (planmäßig) | NIEDRIG | F2/F3 ↔ Prüfpunkt 9 („Zustand planmäßig") | Executor (Konfliktzone) |
| 10 | **Positiv-Befunde (Prämissen-Korrektur, §6/K5):** Formales 11/11 sauber (3 Suiten grün, Format-Korridor, `>-`-Blöcke), Rollen namensfrei, `save-session`-Rename vollständig, keine Referenzdatei-Duplikation, AP-E1-Queue-Anbindung konsistent und testerzwungen grün | OK | — | Prüfpunkte 5/7/10/11 + Zusammenfassung | keine Format-Sanierung nötig — AP-F2 ist additiv + präzisierend |

**Offen ohne Fix-Möglichkeit in diesem Repo:** Prüfpunkt 4 bleibt strukturell offen — der
WZS-Projektplan v2.3 liegt im Arbeits-Repo; F2.7 markiert die Frische, ändert aber keine Zahl
(D19: fehlende Quelle heißt kennzeichnen, nie raten).

## 2. AP-F2 — Sofort-Fixes (Arbeitsliste mit Besetzung)

**Besetzung (N1/K8):** F2.1–F2.8 baut ein **Opus-Agent** mit Plan-Sandwich-Vertrag;
**zwei Kern-Anteile baut der Overseer selbst** (Kontroll-/Payload-Nähe): (a) die
**Lese-Verdrahtung der Ebene 2 in `/nc:start`** (Kern-Skill; claude-netz-bau §3 Ziff. 3 —
„Auslieferung ≠ Wirkung", A11) und (b) die **Upstream-Präzisierung der Sprachregel in
`nc-sync.md` §6** nach N6 (Ebene-1b-Payload; K4: Widersprüche werden upstream gelöst).
Registry/README-Wurzel/AGENTS/CHANGELOG/Versions-Bumps bleiben dem Executor-Lauf am
Phasenende (F7-Konfliktzonen-Regel; nc-development-Bump 0.1.0 → **0.2.0**, `minCoreVersion`
→ **0.10.0**, Status „15 Skills in 6 Modulen").

- **F2.1 Ebene-2-CLAUDE ausliefern:** `plugins/nc-development/development-abteilungs-claude.md`
  aus `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage` instanziert (A1–A12):
  zweigeteilt, < 100 Zeilen, Rollen statt Klarnamen; Teil 1 mit Selbstverständnis, den drei
  WZS-Domänen-Linien (gleichlautend zur `pflege-auspraegung.json`, gegenseitiger Verweis),
  Werkzeugen (GitHub-Org `NovaCore-AI`; Jira mit Zwei-Stufen-Regel — Projekt-Key offen, J3:
  nicht raten), Routing (repo-interne Variante: Wissensbasis des OS-Repos, Lesekopie
  `~/.nc/ssot/`, Residenz `.nc/erinnerung/`, Queue-Klassifikation über `/nc:end-session`);
  Teil 2 nur Bau-Sitzungen. Bauanleitungs-Blockquote löschen, keine `{{…}}`-Reste (A6).
- **F2.2 WP7 schließen — 4 neue Skills, 2 neue Module (D1–D6, generisch, keine
  Onsite-Firmenspezifika):** `qs-bugfix` (Bug-Reproduktion als roter Test → Fix →
  Regressionslauf; Jira nur lesend/Stufe 1 mit Einzelfreigabe) · `qs-abnahme`
  (WP7-Abnahmelauf: Verifikationsdisziplin, Livetest-Plan, Abnahme-Checkliste mit Beleg je
  Punkt) · `rel-vorbereitung` (Pre-Deploy-Check: Stand/Version/CHANGELOG des Arbeits-Repos,
  Migrations-/Rollback-Plan benannt, Freigabenachweis — **`disable-model-invocation: true`**)
  · `rel-verifikation` (Post-Deploy-Verifikation, read-only-Belege; Deploy selbst bleibt
  Mensch — **`disable-model-invocation: true`**). WZS-Bezug ausschließlich als Verweis auf
  die Domänen-Linien; kein GitLab/`exec-*`/PAR/PartSens/Liquibase/OpenTofu-Vokabular (D2/D3).
- **F2.3 Sprachregeln (zweistufig):** (a) Overseer präzisiert `nc-sync.md` §6 nach N6
  (Arbeits-/Kundenrepos: Code-Artefakte englisch, Kommunikation/Tickets/Doku deutsch;
  OS-Repo bleibt durchgängig deutsch; Repo-CLAUDE gewinnt). (b) Der Agent trägt in die vier
  entwerfenden Skills (`flc-commit-prep`, `flc-pr`, `fe-review`, `be-review`) und die neuen
  Skills je **einen** Regel-Satz mit Verweis auf `nc-sync.md` §6 ein — kein Duplikat der
  Regel, nur die Anwendung („Entwurfssprache nach `nc-sync.md` §6 des Kern-Plugins `nc`").
- **F2.4 `workflow.md` nachziehen:** WP7-Zeile auf die neuen Träger; Modul-Tabelle + zwei
  Module; Trigger-Matrix + zwei disjunkte Modulzeilen (C2); Ownership-Tabelle um die drei
  WZS-Domänen-Linien (Quelle: `pflege-auspraegung.json`, gegenseitiger Verweis) und die
  `rel-*`-Ownership; **neuer SSOT-Abschnitt** (C7: Wissensbasis des OS-Repos per
  Index-Triage, Residenz `.nc/erinnerung/`, Queue-Klassifikation über `/nc:end-session`
  Station 1, Übergangs-Queue im OS-Repo — `/nc:queue-abteilung` ist hier nicht der Weg).
- **F2.5 Fremdsystem-Präzisierung:** `wzs-blocker-gate` Schritt-Zeile auf „benennen bzw.
  Anlage-Bedarf formulieren; Anlage/Transition nur mit Einzelfreigabe (Jira Stufe 1), wo kein
  Jira-Zugang: manueller Weg" — Widerspruch zu `:70` aufgelöst; Kürzel `EP` als
  unbestätigte Portierungs-Annahme kennzeichnen (gegen CLAUDE.md des Arbeits-Repos prüfen,
  J3). `flc-pr`: manuellen PR-Weg ohne `gh` ausschreiben (D10).
- **F2.6 Abteilungs-README:** Installationsabschnitt (`/plugin marketplace add
  NovaCore-AI/NovaCoreAI-OS` → `/plugin install nc-development@novacore-os` → `/nc:setup`),
  Koexistenz-Regel (nie parallel zu `nc-felix`/`nc-biggi`), Queue-/Ausprägungs-Absatz,
  Skill-Tabelle + 4 Zeilen; `ONBOARDING.md` als Quellenangabe „OS-Repo" (kein Pfad-Verweis).
- **F2.7 Frische-Marker WZS:** an den sechs `v2.3`-Stellen (README + 5 Frontmatter) den
  Abgleichstand ergänzen („Stand v2.3, abgeglichen 2026-07-07 — vor Nutzung gegen den
  Projektplan im Arbeits-Repo prüfen"); keine Zahl ändern (D19).
- **F2.8 Review-Kette als Rollen-Satz** in `fe-review`/`be-review`/`flc-pr` (D18:
  Implementierer ≠ Reviewer; Abnahme + Merge beim Admin).

## 3. Kommende Änderungen (Merker mit Abhängigkeit — nie Sofort-Fix)

| Merker | Abhängigkeit |
|---|---|
| Spezialisten-Garnitur + Spezifikations-Pflicht (Norm A) für dev-Agenten (I1) | Upstream-Merge Onsite #59, dann Endstand gegenlesen (N7/N8) |
| Satelliten-Extraktion `nc-development` (AP-F3; `wzs` ist Extraktions-Kandidat, F11) | eigener Maintainer-Auftrag; F2 baut nichts Widersprechendes (qs/rel bleiben generisch, keine OS-Repo-Pfade) |
| Eigene Abteilungs-Kriterienliste (H5) | Maintainer-Entscheid „darf eine Abteilungsliste abschwächen?" — bis dahin Kern-Verweis |
| Jira-Projekt-Key(s), WZS-Deploy-Mechanik (J3) | Maintainer-Nachreichung (N6) — Skills raten nichts |
| Queue-Praxisprobe der Skills (T16/T17) | Dry-Run von `/nc:queue-kern` nach Merge; Befunde in Fehlerprotokoll/Debug-Log |
| Abteilungs-Agenten + portabler Prüfbaustein + Registry-`agents` (I4/I7/I8) | erster beauftragter Abteilungs-Agent |

## 4. Anker-Bedarf (Pflichtprüfpunkt der Synthese, K2)

Reservierbare Bezeichner dieses Zyklus: Zielversion **`nc-development` 0.2.0** (Vorab-Zuweisung
aus E6/N1 = Ersatz-Anker; ein `reserve/nc-development-0.2.0`-Tag braucht nach E4-Vertagung eine
Einzel-Freigabe, die in dieser autonomen Session nicht einholbar ist → als offener Punkt im
Register geführt, nicht blockierend — es arbeitet nachweislich nur eine Einheit am OS) · neue
Modul-Präfixe **`qs`/`rel`** und vier Skill-Namen (Kollisionsprüfung gegen Registry, Kern- und
Abteilungs-Skills: frei; Registry-Eintrag folgt am Phasenende über den Executor).

## 5. Verifikation AP-F2

`node --test plugins/nc/tests/*.test.mjs` (wortgleich) · `claude plugin validate
plugins/nc-development --strict` **und** `claude plugin validate .` · Trigger-Overlap-Prüfung
(C2) · grep-Sweeps: kein GitLab/PAR/PartSens/Liquibase/OpenTofu-Vokabular in neuen Skills,
keine Klarnamen, kein `knowledge-base/` ohne „OS-Repo"-Qualifizierung · No-Diff-Zonen des
Agenten: `CHANGELOG.md`, `AGENTS.md`, `README.md` (Wurzel), `SSOT-Document-Index.md`,
`module-registry.json`, alle `plugin.json`, `plugins/nc/**` (Kern gehört dem Overseer).

---

## Anhang A — Soll-Anforderungsregister (Lauf 1, wörtlich persistiert)

### AP-F1 — Soll-Anforderungsregister `nc-development` (Lauf 1 von 2)

> **Prozess:** `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md` §3 Schritt 1
> (Soll-Anforderungsregister) und §4 (Normquellen, NC-gemappt). **Read-only**; kein Zugriff auf
> `plugins/nc-development` — die Unabhängigkeit der beiden Läufe ist der Kern des Prozesses
> (§3 Kopf). Dieses Register leitet das **Soll** allein aus den Normquellen ab; ob eine
> Anforderung erfüllt ist, entscheidet erst die Ist-Inventur (Lauf 2) und die Drift-Matrix.
>
> **Prüfungsgegenstand:** die Inhalte des repo-internen Abteilungsplugins `nc-development`
> (Abteilung `development`, Kern-Dependency) vor der Modernisierung AP-F2, Bauplan
> `knowledge-base/grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md` §4 Phase F.
>
> **Typen** (§3 Schritt 1): `Fakt-Korrektur` = verifizierter Fachfakt hat sich geändert, der
> Text muss nachgezogen werden · `Norm-Pflicht` = geltende Normlage, sofort bindend ·
> `Kommende Änderung` = noch nicht fällig, Abhängigkeit benannt (§7: nie Sofort-Fix).
>
> **Onsite-Vorbild ist Soll-Referenz, nicht Soll-Text.** Firmenspezifika des Vorbilds
> (GitLab `exec-*`, Jira-PAR-Tickets, PartSens, isento, Liquibase/OpenTofu/Blue-Green) sind
> ausdrücklich **nicht** Soll (Bauplan §0.1, §2 Mapping-Zeile, AP-F2). Onsite-Belege stammen aus
> dem Lese-Worktree `origin/main@5c2c210` und sind als `[Onsite]` gekennzeichnet.
>
> **Alle Pfade relativ zu `C:\Users\luceb\Desktop\NovaCoreAI-OS`.**

---

## A. Ebene-2-Abteilungs-CLAUDE (Pflichtbestandteil, Auslieferung steht aus)

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| A1 | Das Abteilungsplugin liefert eine **Abteilungs-CLAUDE (Ebene 2)** aus — sie ist **Pflichtbestandteil jedes Abteilungsplugins**, nicht optional. | `vorlagen/abteilungsplugin/VORLAGE.md`:„Inhalt" (Zeile „abteilungs-claude.md.vorlage … — Pflicht") · `knowledge-base/standardprozesse/claude-netz-bau.md`:§2.1 (Zeile Ebene 2) | Plugin-Wurzel `nc-development` | Norm-Pflicht |
| A2 | Zielname exakt `development-abteilungs-claude.md`, abgelegt an der **Plugin-Wurzel** (nie Repo-Wurzel) — beim Nutzer kommt nur das Plugin-Verzeichnis an. | `vorlagen/abteilungsplugin/VORLAGE.md`:„Instanzieren" Schritt 2 · `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:Kopf-Blockquote · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§1a | `development-abteilungs-claude.md` | Norm-Pflicht |
| A3 | **Zweiteilung** zwingend: Teil 1 gilt für alle Sitzungen der Abteilung, Teil 2 nur für Sitzungen, die am Plugin/Abteilungs-Repo selbst bauen. | `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:Kopf-Blockquote („Zweigeteilt") und Abschnitte „Teil 1"/„Teil 2" | `development-abteilungs-claude.md` | Norm-Pflicht |
| A4 | **Prosa-Instruktion, kein Fachwissen:** Fachwissen wird verwiesen, nie kopiert (Doppelpflege-Verbot); Kern-Regeln werden nie wiederholt (sie kommen über Ebene 1/1b). Ziellänge **unter 100 Zeilen**. | `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:Kopf („Abgrenzung") · `knowledge-base/standardprozesse/claude-netz-bau.md`:§1, §5.1, §5.3 | `development-abteilungs-claude.md` | Norm-Pflicht |
| A5 | **Rollen statt Klarnamen** in jeder ausgelieferten Payload (Maintainer/Admin, Dev Feld 1, zweiter Reviewer) — keine Namen, Mailadressen oder Kundennamen; das OS-Repo ist öffentlich. | `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:Kopf („Rollen statt Klarnamen (Pflicht)") · Bauplan:§3 I9 · Bauplan:N6 („Public-Repo-Regel") | `development-abteilungs-claude.md`, alle Skills | Norm-Pflicht |
| A6 | Nach dem Instanzieren ist der **Bauanleitungs-Blockquote gelöscht** und **keine `{{…}}`-Stelle** übrig — die Invariante „Keine offenen Vorlagen-Platzhalter in ausgelieferten Plugins" wäre sonst rot. | `vorlagen/abteilungsplugin/VORLAGE.md`:„Instanzieren" Schritte 2–3 · `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 Zeile „Vorlage geändert" | `development-abteilungs-claude.md` | Norm-Pflicht |
| A7 | Abschnitt **„Rote Linien der Domäne"** nennt die WZS-Linien: Eingriffe am Produktivsystem (Deploy, Datenbank, Webhooks) bleiben **Mensch-only**. | Bauplan:N6 („Produktivsystem: WZS … Mensch-only rote Linien") · `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:„Rote Linien der Domäne" (Beispiel-Muster) | `development-abteilungs-claude.md` | Norm-Pflicht |
| A8 | Abschnitt **„Werkzeuge und Konnektoren"** nennt je System die Freigabestufe: GitHub-Organisation `NovaCore-AI` (Repos, Issues, PRs, Actions-CI) und **Jira mit Zwei-Stufen-Regel** (Lesen frei · Stufe 1 Transitionen/Felder nur mit Einzelfreigabe · Stufe 2 kundensichtbare Freitexte nur Mensch). | Bauplan:N6 („Werkzeuge") · `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:„Werkzeuge und Konnektoren der Abteilung" | `development-abteilungs-claude.md` | Norm-Pflicht |
| A9 | Abschnitt **„Routing in die Wissensbasis"** in der Variante *repo-interne Abteilung*: zuständig ist die Wissensbasis des OS-Repos, Einstieg über den Dokuindex, lokal als **Lesekopie** unter `~/.nc/ssot/`, angelegt und nachgezogen von `/nc:setup`. | `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:„Routing in die Wissensbasis" · `plugins/nc/doks/global-claude-firmenblock.md`:„Kern-SSOT (Wissensbasis der Firma)" | `development-abteilungs-claude.md` | Norm-Pflicht |
| A10 | **Sitzungswissen-Residenz:** Wohnort ist `.nc/erinnerung/` des Arbeits-Repos; geschrieben/gelesen wird es von `/nc:start` bzw. `/nc:end-session`. Die Onsite-Residenzpflicht (`sitzungswissen/` in der Wissensbasis) greift nur in **privaten** Repos und ist hier ausgeschlossen. | Bauplan:§8 E2/E3 (Ausprägung (a), Repo ist öffentlich) · `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`:„Routing in die Wissensbasis" | `development-abteilungs-claude.md`, `workflow.md` | Norm-Pflicht |
| A11 | **Lese-Verdrahtung mitdenken:** Ebene 2 wirkt erst, wenn das Einstiegs-Ritual `/nc:start` sie aus dem Plugin-Root liest — „Auslieferung ≠ Wirkung". Der Lese-Schritt folgt laut Pfad-Matrix mit dem ersten Abteilungs-Bump. | `knowledge-base/standardprozesse/claude-netz-bau.md`:§3 Ziff. 3, §4 (Pfad-Matrix, Zeile Ebene 2), §6 (Falle „Auslieferung ohne Lese-Verdrahtung") | Plugin + Kern-Skill `start` (Koordination) | Norm-Pflicht |
| A12 | Änderung an der Ebene-2-Datei zieht **Bump des tragenden Plugins** plus die Nachzüge der Matrix-Zeile „Abteilungs-/Plugin-CLAUDE geändert" nach; Payload-Änderung ohne Bump erreicht niemanden. | `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 Zeile „Abteilungs-/Plugin-CLAUDE geändert" · `knowledge-base/standardprozesse/claude-netz-bau.md`:§5.5 | `plugin.json`, CHANGELOG | Norm-Pflicht |

## B. `pflege-auspraegung.json` (seit AP-E1 normiert)

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| B1 | Datei liegt an der **Plugin-Wurzel** (neben `.claude-plugin/`) und trägt `schemaVersion: 1`; sie ist Pflicht für **jedes Abteilungsplugin mit Kern-Dependency**. | `plugins/nc/referenz/pflege-auspraegung.md`:§1, §2 (Feld `schemaVersion`), §6 (Prüfliste, Punkt 1) | `pflege-auspraegung.json` | Norm-Pflicht |
| B2 | `abteilung` == `development` und stimmt mit der Abteilungs-Registry des Kerns überein (sonst Abbruch mit Meldung). | `plugins/nc/referenz/pflege-auspraegung.md`:§2 (Feld `abteilung`), §6 Punkt 2 · `plugins/nc/module-registry.json`:`abteilungen[1].name` | `pflege-auspraegung.json` | Norm-Pflicht |
| B3 | `queuePfad` ist **relativ zur Wurzel des Abteilungs-Repos**, Standard `knowledge-base/kandidaten-queue/queue.md`, und zeigt auf eine existierende Queue-Kategorie (Wurzel-Invariante: nur der Index liegt oben). | `plugins/nc/referenz/pflege-auspraegung.md`:§2 (Feld `queuePfad`), §6 Punkt 3 · `knowledge-base/` (Kategorie `kandidaten-queue/` existiert) | `pflege-auspraegung.json` | Norm-Pflicht |
| B4 | `kriterienVerweis` zeigt auf eine erreichbare Liste — ohne eigene Abteilungsliste auf die **Kriterienliste v1** in Abschnitt 5 der Kern-Referenz. | `plugins/nc/referenz/pflege-auspraegung.md`:§2 (Feld `kriterienVerweis`), §5, §6 Punkt 5 | `pflege-auspraegung.json` | Norm-Pflicht |
| B5 | `journalSonderregeln` und `roteLinienDomaene` sind Pflichtfelder (Listen, dürfen leer sein) und **verschärfen nur** — Kern-Regeln (append-only, Belegpflicht, keine Secrets) sind nicht abwählbar. | `plugins/nc/referenz/pflege-auspraegung.md`:§2 (beide Felder), §6 Punkt 6 | `pflege-auspraegung.json` | Norm-Pflicht |
| B6 | `roteLinienDomaene` trägt die **WZS-Produktivsystem-Linie** (Deploys/DB-Eingriffe/Webhook-Änderungen ausschließlich Mensch). | Bauplan:N6 („Produktivsystem") · `plugins/nc/referenz/pflege-auspraegung.md`:§2 (Beispiel-JSON) | `pflege-auspraegung.json` | Norm-Pflicht |
| B7 | `uebergang` ist gesetzt, solange der Registry-Eintrag der Abteilung **kein `repository`** führt (heute der Fall) — inkl. **Einreichungsweg**: über den regulären Branch/PR-Fluss des OS-Repos, **nicht** über `/nc:queue-abteilung`. | `plugins/nc/referenz/pflege-auspraegung.md`:§2 (Feld `uebergang`), §3 Ziff. 4, §6 Punkt 7 · `plugins/nc/module-registry.json`:`abteilungen[1]` (kein `repository`) | `pflege-auspraegung.json` | Norm-Pflicht |
| B8 | Die Datei setzt voraus, dass die Abteilung **wirklich am Kern hängt** (`dependencies: ["nc"]`); für eigenständige Kollegen-OS gibt es sie nicht und darf es sie nicht geben. | `plugins/nc/referenz/pflege-auspraegung.md`:§6 letzter Punkt, Kopf-Blockquote („Geltungsbereich (E1, hart)") · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§1 | `plugin.json` (`dependencies`) | Norm-Pflicht |
| B9 | Die Queue-Datei selbst trägt **Kopf-Blockquote und Tabellenkopf** aus Queue-Format v1 (fünf Spalten, append-only, Status `offen` / `befördert (PR #n)` / `abgelehnt (PR #n)`). | `plugins/nc/referenz/pflege-auspraegung.md`:§4, §6 Punkt 4 | Queue-Datei am `queuePfad` | Norm-Pflicht |
| B10 | Bei künftigen **Feld**-Änderungen der Ausprägung muss `nc-development` die neue `schemaVersion` mit nachziehen; reine Kriterien-Textpflege zählt `schemaVersion` **nicht** hoch. | `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 Zeile „Pflege-Ausprägung / Queue-Format geändert" · Bauplan:§4 AP-E1 (Schema-Grenze) | `pflege-auspraegung.json` | Norm-Pflicht |

## C. `workflow.md` — WP-Mapping, Trigger-Matrix, SSOT-Abschnitt

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| C1 | **WP1–WP7 vollständig** auf den realen Zyklus abgebildet, mit **mindestens einem auto-triggerbaren Skill je Punkt**. WP7 (QS & Abnahme) ist damit nicht optional. | `plugins/nc/wp-rahmen.md`:„Für Abteilungsplugins verbindlich" Ziff. 1 und Tabelle „Die neun Punkte" (WP7) · Bauplan:§4 AP-F1 („Bekannte Lücke vorab: WP7 … noch ohne eigenen Skill") | `workflow.md`, Skill-Bestand | Norm-Pflicht |
| C2 | Trigger-Begriffe der Abteilungs-Skills sind **disjunkt** — kein Trigger-Overlap. | `plugins/nc/wp-rahmen.md`:„Für Abteilungsplugins verbindlich" Ziff. 1 · `plugins/nc/referenz/skill-authoring.md`:„Checkliste vor dem Merge" (Zeile Trigger-Overlap) | `workflow.md`, alle SKILL.md | Norm-Pflicht |
| C3 | **WP0/WP8 werden nicht nachgebaut** — sie kommen aus dem Kern (`/nc:start`, `/nc:end-session`). | `plugins/nc/wp-rahmen.md`:„Für Abteilungsplugins verbindlich" Ziff. 2 und „Warum WP0/WP8 im Kern liegen" | `workflow.md`, Skill-Bestand | Norm-Pflicht |
| C4 | Die `workflow.md` benennt je Skill die **Rote-Linien-Ownership** — welcher Skill welche Linie trägt; der Skill trägt das Verbot und führt durch den sicheren Ablauf. | `plugins/nc/wp-rahmen.md`:„Rote Linien (abteilungsübergreifend)" (Absatz „Jede Abteilung benennt in ihrer `workflow.md` …") Ziff. 3 | `workflow.md` | Norm-Pflicht |
| C5 | `wp-rahmen.md` wird **per Namen verlinkt**, seine Inhalte werden **nicht dupliziert**. | `plugins/nc/wp-rahmen.md`:„Für Abteilungsplugins verbindlich" Ziff. 4 · `plugins/nc/referenz/skill-authoring.md`:„Aufbau des Bodys" (WP-Verweis) | `workflow.md`, alle SKILL.md | Norm-Pflicht |
| C6 | Das repo-interne Abteilungsplugin bringt **keine Hooks** mit — die Kontroll-Schicht liegt ausschließlich im Kern (testerzwungen). | `plugins/nc/wp-rahmen.md`:„Für Abteilungsplugins verbindlich" Ziff. 5 · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§1 („Hooks nur im Kern") · `vorlagen/abteilungsplugin/VORLAGE.md`:„Bewusst nicht enthalten" | Plugin-Struktur | Norm-Pflicht |
| C7 | Der **SSOT-Abschnitt** der `workflow.md` nennt Pfade gegen `SSOT-Document-Index.md` (Teil 1/2) statt geraten und die korrekte Sitzungswissen-Residenz. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§5 Prüfpunkte 6 und 8 | `workflow.md` | Norm-Pflicht |
| C8 | Verweise auf **Kern-Skills** entsprechen dem heutigen Bestand: `start`, **`end-session`** (nicht mehr `save-session`), `journal`, `setup` (seit 0.8.0 **Reconciler S0–S6**, nicht bloß Klon-Skript), `doku-sync`, `os-info`, `skill-builder`, `update-doks`. | `plugins/nc/module-registry.json`:`abteilungen[0].status` und `.module.core` · Bauplan:§8 E3 (Rename `save-session` → `end-session`) · Bauplan:§4 AP-A1 | `workflow.md`, alle SKILL.md, README | Fakt-Korrektur |
| C9 | Der beschriebene Session-Zyklus entspricht `nc-sync.md` §5: Start `/nc:start` → Feature-Arbeit `flc-*` → Review `fe-review`/`be-review` → jederzeit `/nc:journal` → Abschluss `/nc:end-session`. | `plugins/nc/nc-sync.md`:§5 | `workflow.md` | Fakt-Korrektur |
| C10 | Änderungen an `workflow.md` bzw. am WP-Rahmen ziehen jede betroffene `SKILL.md` (Gate-Bezüge), `AGENTS.md` Vision-Abschnitt und `CHANGELOG.md` nach. | `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 Zeile „WP-Rahmen / `workflow.md` geändert" | `workflow.md`, Nachzüge | Norm-Pflicht |

## D. Module und Skills — Modernisierung AP-F2 (generisch gemappt)

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| D1 | WP7 bekommt **eigene Module**: ein QS-Zyklus (`qs-*`, Bugreproduktion/Fix/QS-Schleife) und ein Release-Zyklus (`rel-*`, Pre-Deploy-Check/Prod-Ops/Post-Deploy-Verifikation). Soll-Referenz sind die Vorbild-Module `qs` und `rel` (beide WP7). | Bauplan:§4 AP-F1 („Onsite-dev trägt 17 Skills in 6 Modulen (inkl. `qs-*`, `rel-*`)") und AP-F2 · [Onsite] `plugins/oai/module-registry.json`:`abteilungen[1].module.qs`/`.rel` | Modul-/Skill-Bestand | Norm-Pflicht |
| D2 | **Generische Mapping-Pflicht:** Der QS-/Release-Zyklus wird **ohne** Onsite-Firmenspezifika gebaut — kein GitLab `exec-*`, keine PAR-Tickets, kein isento, kein Liquibase/OpenTofu/Blue-Green-Vokabular. Gemappt wird auf GitHub-Flow, Jira nach N6 und WZS als Produktivsystem. | Bauplan:§4 AP-F2 (wörtlich) · Bauplan:§0.1 · Bauplan:§2 (Mapping-Zeile „Jira/Confluence/GitLab/PAR/PartSens/…") | neue `qs-*`/`rel-*`-Skills | Norm-Pflicht |
| D3 | Das Vorbild-Modul **`ps` (PartSens)** wird **nicht gemappt** — reines Firmenspezifikum ohne NC-Gegenstück; ein Nachbau wäre Regelverstoß, kein Rückstand. | Bauplan:§2 (Mapping-Zeile, „nie wörtlich") · Bauplan:§0.1 · [Onsite] `plugins/oai/module-registry.json`:`abteilungen[1].module.ps` | Modul-Bestand | Norm-Pflicht |
| D4 | Die Abdeckung **WP1–WP5** (Feature-Start, Planung, Umsetzung, Quality-Gate, Selbst-Review/Übergabe) bleibt Pflicht; der Vorbild-Zuschnitt (`feat` WP1–3 + `mr` WP4–5) ist Referenz, nicht Vorschrift — der NC-Zuschnitt (`flc-*`) darf bleiben, muss aber lückenlos sein. | `plugins/nc/wp-rahmen.md`:Tabelle WP1–WP5 · [Onsite] `plugins/oai/module-registry.json`:`.module.feat`/`.mr` | `workflow.md`, `flc-*` | Norm-Pflicht |
| D5 | Die Abdeckung **WP6 (Review)** bleibt Pflicht; das Vorbild führt sie dreistufig (`rev-prep`/`rev-run`/`rev-fixup`) — Vorbereitung, Durchführung, Einarbeitung der Findings. Prüfen, ob `fe-review`/`be-review` alle drei Schritte tragen. | `plugins/nc/wp-rahmen.md`:WP6 („Fremdprüfung vorbereiten, durchführen, einarbeiten") · [Onsite] `firmenkernprozesse/team-rollout-infrastruktur/02-FEATURE-SKILL-UND-AGENTEN-KATALOG.md`:Zeilen 116–118 | `fe-review`, `be-review`, `workflow.md` | Norm-Pflicht |
| D6 | **`disable-model-invocation: true`** wird als Muster für gefährliche Ops-Skills übernommen — Skills, die durch eine rote Linie führen (Release, Deployment, Merge-Freigabe, Kundenkommunikation), springen nie automatisch an. | Bauplan:§4 AP-F2 (wörtlich) · `plugins/nc/referenz/skill-authoring.md`:„Frontmatter (harte Constraints)", Punkt `disable-model-invocation` | neue `rel-*`-Skills | Norm-Pflicht |
| D7 | Jeder neue oder geänderte Skill erfüllt die **Formatregeln**: `name` == Verzeichnisname (`a-z0-9-`, ≤64), `description` als **`>-`-Block-Scalar** (YAML-Falle) in dritter Person mit Trigger-Begriffen, Gliederung Zweck/Ablauf/Regeln/Verifikation, Deutsch, 60–120 Zeilen. | `plugins/nc/referenz/skill-authoring.md`:„Frontmatter (harte Constraints)", „Aufbau des Bodys (Haus-Stil)", „Checkliste vor dem Merge eines Skills" | alle SKILL.md | Norm-Pflicht |
| D8 | **Module sind Namenspräfixe**, keine Verzeichnisse; flaches Layout `skills/<name>/SKILL.md`, kein Verzeichnis-Nesting. Ein neues Modul entsteht durch neues Präfix **plus** Eintrag in `module-registry.json` des Kerns. | `plugins/nc/referenz/skill-authoring.md`:„Aufbau des Bodys" (Punkte „Eine Datei pro Skill", „Module sind Namenspräfixe") · `plugins/nc/module-registry.json`:`_hinweis` | Skill-Layout, Registry | Norm-Pflicht |
| D9 | **Keine Pfad-Verweise über die Plugin-Grenze** (testerzwungen): auf Inhalte anderer Plugins per Name, auf Repo-Dokumente nur als Quellenangabe mit „OS-Repo"-Qualifizierung, nie als Leseanweisung. | `plugins/nc/referenz/skill-authoring.md`:„Aufbau des Bodys" (letzter Punkt) · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§2 Fakt 4 und §1a · `plugins/nc/nc-sync.md`:§3.4 | alle ausgelieferten Dateien | Norm-Pflicht |
| D10 | **Werkzeug-Verfügbarkeit korrekt behandeln:** Das OS bringt **keine** MCP-Server mit. Schritte, die auf einem optionalen Server (Atlassian/Jira) beruhen, sind als „wo vorhanden, sonst manuell" zu formulieren, mit ausgeschriebenem manuellem Weg; schreibende Aktionen über externe Dienste bleiben manuelle Menschen-Schritte. | `plugins/nc/referenz/skill-authoring.md`:„Inhaltliche Pflichten" Ziff. 4 · Bauplan:N6 („Werkzeuge") | alle Skills mit Fremdsystembezug | Norm-Pflicht |
| D11 | Jeder Skill, der **Jira** berührt, trägt die **Zwei-Stufen-Regel**: Lesen frei · Stufe 1 (Transitionen/Felder) nur mit Einzelfreigabe · Stufe 2 (kundensichtbare Freitexte) nur Mensch. | Bauplan:N6 („Werkzeuge: … Atlassian **Jira** mit **Zwei-Stufen-Regel**") | `flc-*`, neue `qs-*` | Norm-Pflicht |
| D12 | **Sprachregeln nach N6:** In Arbeits-/Kundenrepos sind Code-Artefakte (Branches, Commits, PR-Titel/-Texte, Code-Kommentare) **englisch**, Kommunikation/Tickets/Doku **deutsch**. Skills, die Branch-/Commit-/PR-Texte entwerfen, müssen das abbilden. | Bauplan:N6 („Sprachregeln (Onsite-Muster)") | `flc-commit-prep`, `flc-pr`, `flc-feature-start` | Fakt-Korrektur |
| D13 | **Norm-Konflikt benennen, nicht umgehen:** `nc-sync.md` §6 fordert „Alle Artefakte (Commits, Pull Requests, Doku, Journal) auf Deutsch", N6 fordert für Arbeits-/Kundenrepos englische Code-Artefakte. Der Widerspruch zweier Doku-Ebenen wird **upstream** aufgelöst (Nachtrag/Präzisierung in `nc-sync.md`), nicht im Abteilungstext umgangen. | `plugins/nc/nc-sync.md`:§6 (Sprache) vs. Bauplan:N6 (Sprachregeln) · `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§8 Ziff. 3 | `nc-sync.md` (Kern) + Abteilungs-Skills | Fakt-Korrektur |
| D14 | Jeder Skill, der eine **rote Linie** berührt, verbietet sie **explizit in `## Regeln`** und führt stattdessen durch den sicheren Ablauf — Push auf geteilte Branches, Merge, Review-Resolve/Approve, Release, Deployment, Kundensichtbares. | `plugins/nc/referenz/skill-authoring.md`:„Inhaltliche Pflichten" Ziff. 2 · `plugins/nc/wp-rahmen.md`:„Rote Linien (abteilungsübergreifend)" | alle Skills | Norm-Pflicht |
| D15 | Jeder Skill endet mit **prüfbarer Verifikation** (Befehl + erwartetes Ergebnis, Testlauf, Pipeline-/Ticket-Status, Datei-Existenz) — „sollte passen" ist kein Abschluss. | `plugins/nc/referenz/skill-authoring.md`:„Inhaltliche Pflichten" Ziff. 3 und Body-Gliederung · `plugins/nc/wp-rahmen.md`:„Verifikation statt Behauptung" | alle SKILL.md | Norm-Pflicht |
| D16 | Die **`wzs-*`-Invarianten-Skills bleiben die Referenz** des Produktivsystems WZS; Deploys, DB-Eingriffe und Webhook-Änderungen dort bleiben Mensch-only rote Linien. | Bauplan:N6 („Produktivsystem: **WZS** … die `wzs-*`-Invarianten-Skills bleiben deren Referenz") | `wzs-*` | Norm-Pflicht |
| D17 | **Keine personenbezogenen Pfade oder Annahmen** in Skills (kein Nutzername, keine lokalen Sonder-Setups) — verschärft durch die Public-Repo-Regel. | `plugins/nc/referenz/skill-authoring.md`:„Inhaltliche Pflichten" Ziff. 5 · Bauplan:§3 I9 | alle Skills | Norm-Pflicht |
| D18 | Die abgebildete **Review-Kette** entspricht N6: Dev implementiert → zweiter Dev bzw. Agenten-Review (Implementierer ≠ Reviewer) → **Admin** nimmt ab und merged — benannt als Rollen. | Bauplan:N6 („Team & Review-Kette") · `plugins/nc/nc-sync.md`:§2.4 | `fe-review`, `be-review`, `flc-pr`, `workflow.md` | Fakt-Korrektur |
| D19 | **Fachfakten nur aus der Quelle:** Schwellenwerte, Datenmodelle, API-Verträge, Branch-Konventionen stammen ausschließlich aus dem jeweiligen Arbeits-Repo; selbst generierte Werte werden als KI-Vorschlag gekennzeichnet, fehlende Quelle → STOPP. | `plugins/nc/nc-sync.md`:§2.1 · `plugins/nc/referenz/skill-authoring.md`:„Inhaltliche Pflichten" Ziff. 1 · `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§5 Prüfpunkt 4 | alle Skills | Norm-Pflicht |
| D20 | **Test-First auf dem kritischen Pfad** (Geldfluss, Auth, Datenschutz/Sicherheit, externe Verträge): RED → GREEN → REFACTOR, Ziel ≥ 80 % — Default, vom Repo überschreibbar. | `plugins/nc/nc-sync.md`:§2.2 | `flc-*`, neue `qs-*` | Norm-Pflicht |
| D21 | Die **Definition of Done** aus `nc-sync.md` §2.3 wird nicht dupliziert, sondern referenziert; ihre Punkte (Lint/Tests/kein Secret, PR beschrieben mit Anforderungs-/Ticket-Referenz, Eigen-Review, Review bestanden, **Mensch merged**) bleiben bindend. | `plugins/nc/nc-sync.md`:§2.3 · `knowledge-base/standardprozesse/claude-netz-bau.md`:§1 (Doppelpflege-Verbot) | `flc-commit-prep`, `flc-pr`, `workflow.md` | Norm-Pflicht |
| D22 | **Referenzdateien** neben einer `SKILL.md` sind zulässig, aber nur **eine** Verweis-Ebene tief; über 100 Zeilen brauchen sie ein Inhaltsverzeichnis. Frische-Marker pflegen, keine Duplikation mit kommenden Agenten-Artefakten. | `plugins/nc/referenz/skill-authoring.md`:„Aufbau des Bodys" (Länge) · `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§5 Prüfpunkt 10 | Referenzdateien der Abteilung | Norm-Pflicht |

## E. Rote Linien, Firmenblock und Gate-Fakten

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| E1 | Rote Linien erscheinen im Abteilungsmaterial als **Kurzverweis auf die Normquelle** plus **Ownership je Skill** — **kein Duplikat** der Ebene-1-Payload. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§4 Quelle 2 und §5 Prüfpunkt 5 · `plugins/nc/doks/global-claude-firmenblock.md`:„Rote Linien" | `development-abteilungs-claude.md`, `workflow.md` | Norm-Pflicht |
| E2 | Der referenzierte Linien-Kanon lautet: **Merges · Deploy-Klicks · Review-Resolves/Approvals · alles Kundensichtbare**; kein Commit/Push ohne explizite Maintainer-Freigabe. | `plugins/nc/doks/global-claude-firmenblock.md`:„Rote Linien" · `plugins/nc/wp-rahmen.md`:„Rote Linien (abteilungsübergreifend)" · `plugins/nc/nc-sync.md`:§6 (Safety, Branching) | alle Skills | Norm-Pflicht |
| E3 | **Session-Start-Zwang statt Marker:** Aktivierungsbedingung ist die **Installation**, nicht eine Markerdatei; die frühere `.nc-os`-Marker-Datei wird nicht mehr ausgewertet. Texte, die noch einen Repo-Marker voraussetzen, sind veraltet. | `plugins/nc/nc-sync.md`:§7 („Aktivierungsbedingung ist die Installation, nicht ein Marker") | `workflow.md`, README, Skills | Fakt-Korrektur |
| E4 | Das **FFG** gatet mit drei Gates (Datei-, Destruktiv-, Routine-Bash-Gate), antwortet mit **deny** (nicht „ask") und ist markerlos aktiv; Opt-out nur per Env `NC_FFG=off` durch den Menschen. Abteilungstexte, die die Gate-Mechanik beschreiben, müssen dem entsprechen. | `plugins/nc/nc-sync.md`:§6 (Safety) und §7 | `workflow.md`, Skills | Fakt-Korrektur |
| E5 | **Eigene Fehler protokollieren:** append-only ins Fehlerprotokoll `debugging-findings/agent-learnings.md` der Wissensbasis des OS-Repos — sofort, nicht am Ende. | `plugins/nc/nc-sync.md`:§6 (letzter Punkt) · `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.2 Zeile „Protokolleintrag fällig" | `workflow.md`, Skills | Norm-Pflicht |

## F. Registry, Manifest, Versionen, Nachzüge

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| F1 | Die Registry-Metadaten der Abteilung (`module`-Segment **und** `status`-Text) werden bei jedem neuen Skill/Modul in **derselben Änderung** nachgezogen. | `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 Zeilen „Skill neu" und „Neues Modul" | `plugins/nc/module-registry.json` (Zeilen 21–37) | Norm-Pflicht |
| F2 | Der Registry-Status der Abteilung lautet heute **„ausgeliefert — 11 Skills in 4 Modulen"**; nach AP-F2 ist er zusammen mit `AGENTS.md`:68/99 und `README.md`:7/27 auf den neuen Stand zu bringen (Sparsamkeits-Regel: Zahlen an so wenige Orte wie möglich). | `plugins/nc/module-registry.json`:Zeile 27 · `AGENTS.md`:Zeilen 68, 99 · `README.md`:Zeilen 7, 27 · `knowledge-base/standardprozesse/aktualisierungs-index.md`:Kopf („Sparsamkeits-Regel") | Registry, AGENTS, README | Fakt-Korrektur |
| F3 | **`minCoreVersion` der Abteilung steht auf `0.3.0`**, der Kern steht bei `0.9.0` und die Abteilung nutzt ab Phase 3 Kern-Mechanik (Ausprägungs-Auflösung, Ebene-2-Lese-Schritt). Der Wert ist dokumentarisch, aber der faktisch benötigte Kern-Stand ist zu setzen. | `plugins/nc/module-registry.json`:Zeile 26 (`"minCoreVersion": "0.3.0"`) gegen Zeile 2 (`"version": "0.9.0"`) · `plugins/nc/referenz/pflege-auspraegung.md`:§3 (Auflösungsregel) | Registry-Eintrag `development` | Fakt-Korrektur |
| F4 | **Version genau an einer Stelle:** `plugins/nc-development/.claude-plugin/plugin.json`. Kein Bump = kein Auto-Update; der Marketplace-Eintrag trägt **nie** ein `version`-Feld. Phase F bumpt `nc-development`. | `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§2 Fakt 6 · Bauplan:§8 E6 und N1 (Tabelle, „Phase 3 … (+ `nc-development`-Bump)") | `plugin.json`, `marketplace.json` | Norm-Pflicht |
| F5 | **`dependencies: ["nc"]` wird nie entfernt** — ohne den Eintrag fehlt die transitive Kern-Aktivierung und die ständige Abteilung ist nicht mehr erzwungen. | `vorlagen/abteilungsplugin/VORLAGE.md`:„Variablen" (Absatz `dependencies`) · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§1 | `plugin.json` | Norm-Pflicht |
| F6 | **E7-Release-Politik:** Tag und GitHub-Release erst **nach Abschluss des Gesamtumbaus**, nicht je Phase; die Bumps je Phase bleiben. Für `nc-development` heißt das: Bump ja, Tag/Release nein. | Bauplan:N6 („E7 — Release-Politik") | `plugin.json`, CHANGELOG, Tags | Norm-Pflicht |
| F7 | **Konfliktzonen-Regel beim Bau:** Kein Paketagent fasst `CHANGELOG.md`, `AGENTS.md`, `README.md`, `SSOT-Document-Index.md`, `module-registry.json` oder Versionsdateien an — diese gehören dem Executor-Lauf am Zyklusende (`sync-nachzug-executor`). | Bauplan:§5 (Delegationsschnitt) · `knowledge-base/standardprozesse/subagenten-bau.md`:§11 (Zeile `sync-nachzug-bauzyklus.md`) | Bauverfahren AP-F2 | Norm-Pflicht |
| F8 | Jede Änderung, die das Team erreichen soll, trägt einen **CHANGELOG-Eintrag** in derselben Änderung. | `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§3 Schritt 10 und §4 (Zeile „Version nicht gebumpt") · `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 (durchgehend) | CHANGELOG | Norm-Pflicht |
| F9 | **Abschluss-Verifikation:** `claude plugin validate plugins/nc-development --strict` **plus** `node --test plugins/nc/tests/*.test.mjs`; die Wurzel-Variante `claude plugin validate .` allein genügt nie (sie prüft keine Skills). | `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§3 Schritte 7–8 und §4 (erste Zeile) · `plugins/nc/referenz/skill-authoring.md`:„Checkliste" (letzter Punkt) | Prüfzyklus | Norm-Pflicht |
| F10 | **Formales gegen die Struktur-Testsuite gegenprüfen, nicht neu erfinden:** Manifeste, Namespaces, Frontmatter, „Hooks nur im Kern", Plugin-Grenze prüft `plugins/nc/tests/struktur.test.mjs`. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§5 Prüfpunkt 11 · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§4 (Zeile „Struktur-Invarianten") | Prüfverfahren | Norm-Pflicht |
| F11 | **AP-F2 baut nichts, was einer späteren Satelliten-Extraktion widerspricht** (AP-F3 bleibt Ideen-Backlog); das Modul `wzs` ist ausdrücklich Extraktions-Kandidat. | Bauplan:§4 AP-F3 · `plugins/nc/module-registry.json`:Zeile 34 („Kandidat für spätere Extraktion (Satellit)") | Modul-Zuschnitt, Skill-Ablage | Norm-Pflicht |

## G. Abteilungs-README und Team-Onboarding

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| G1 | Die Abteilung führt eine **README** mit Installationsweg, verständlich für den Erstkontakt. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§5 Prüfpunkt 12 · `vorlagen/abteilungsplugin/VORLAGE.md`:„Inhalt" (`README.md.vorlage`) | `README.md` der Abteilung | Norm-Pflicht |
| G2 | Der genannte Installationsweg lautet `/plugin install nc-development@novacore-os` — der Kern `nc` kommt **transitiv** mit. | `knowledge-base/standardprozesse/team-distribution.md`:Zeile 101 · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§3 Schritt 9 | `README.md` der Abteilung | Norm-Pflicht |
| G3 | Die **Koexistenz-Regel** ist zu nennen: `nc`/`nc-development` niemals parallel zu `nc-felix` oder `nc-biggi` in derselben Session (doppelte Gates). | `knowledge-base/standardprozesse/team-distribution.md`:Zeile 158 · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§3b (Kopf) · `plugins/nc/module-registry.json`:Zeilen 43, 56 | `README.md` der Abteilung | Norm-Pflicht |
| G4 | Die Skill-Tabelle der README wird bei jedem neuen/geänderten Skill in derselben Änderung nachgezogen. | `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 Zeilen „Skill neu" / „Skill inhaltlich geändert" | `README.md` der Abteilung | Norm-Pflicht |

## H. Queue-Anbindung der Abteilung (Phase E / AP-E1–E3)

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| H1 | Die Abteilung liefert **nur die Ausprägung**, nicht die Mechanik: Klassifikation und Queue-Zeile leistet der **Kern** (`/nc:end-session`, `/nc:journal`); ein eigener Abteilungs-Queue-Skill ist nicht vorgesehen. | `plugins/nc/referenz/pflege-auspraegung.md`:§1 · `knowledge-base/standardprozesse/queue-flow.md`:§1, §2 (Stationen 1–2) | Skill-Bestand (Abgrenzung) | Norm-Pflicht |
| H2 | **Kein Kurations-Skill, kein Auto-Merge, kein Schreiben in fremde Arbeits-Repos** (GF1: Findings fremder Repos gehen in deren Ticket-Prozess). | `knowledge-base/standardprozesse/queue-flow.md`:§4 · `plugins/nc/referenz/pflege-auspraegung.md`:§5.2 (GF1) | Skill-Bestand, `pflege-auspraegung.json` | Norm-Pflicht |
| H3 | Die Queue-Kategorie ist Pflichtbaustein jeder Abteilungs-SSOT **mit Kern-Dependency**; für eine repo-interne Abteilung ohne eigene Wissensbasis läuft sie über die Übergangsregel im OS-Repo (`knowledge-base/kandidaten-queue/`). | `knowledge-base/standardprozesse/queue-flow.md`:§7 (Zeile „Neue Abteilung") · `knowledge-base/standardprozesse/abteilungs-plugin-bau.md`:§1 („Repo-interne Abteilungen bekommen **keine** eigene Wissensbasis") · `plugins/nc/referenz/pflege-auspraegung.md`:§3 Ziff. 4 | `pflege-auspraegung.json`, OS-Repo-Queue | Norm-Pflicht |
| H4 | **Kommender Verweis:** Die Kern-Skills `/nc:queue-abteilung` und `/nc:queue-kern` (AP-E2) und der Fälligkeits-Hook (AP-E3) entstehen im laufenden Bauzyklus. Abteilungstexte dürfen sie nur als **Merker** führen, bis sie gebaut sind. Abhängigkeit: Abschluss AP-E2/AP-E3. | `knowledge-base/standardprozesse/queue-flow.md`:Kopf-Blockquote („Bauzustand (Stand 2026-08-16)") · Bauplan:§4 Phase E | `workflow.md`, `development-abteilungs-claude.md` | Kommende Änderung |
| H5 | **Offener Maintainer-Entscheid:** Ob eine Abteilungs-Kriterienliste die Kern-Kriterien abschwächen darf (insb. GF1/GF4), ist ungeklärt. Bis zum Entscheid **keine eigene Abteilungs-Kriterienliste** anlegen — `kriterienVerweis` zeigt auf die Kern-Referenz. Abhängigkeit: Maintainer-Entscheid. | `knowledge-base/standardprozesse/queue-flow.md`:§6 (Zeile „Darf eine Abteilungsliste die Kern-Kriterien abschwächen?") | `pflege-auspraegung.json` | Kommende Änderung |

## I. Subagenten — Spezialisten-Garnitur (Phase-3/F-Prüfpunkt)

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| I1 | Die **Spezialisten-Garnitur** für die dev-Skills und die Spezifikations-Pflicht aus Norm A stammen aus Onsite-PR #59, der **upstream offen** ist. Sie sind ausdrücklich **Phase-3/F-Prüfpunkt** — nichts daraus wird als Sofort-Fix gebaut. Abhängigkeit: Upstream-Merge #59/#60, danach Endstand gegenlesen und per Nachtrag auflösen. | Bauplan:N7 Ziff. 2 (wörtlich: „betreffen die dev-Skills und sind **Phase-3/F-Prüfpunkt**") und N7 „Folge-Prüfpunkt" | Agenten-Konzept `nc-development` | Kommende Änderung |
| I2 | **Norm B (Abnahme- und Peer-Review, 3 Stufen) gilt bereits** — sie wurde additiv als §14 übernommen: Stufe 1 strukturierte Selbstauskunft, Stufe 2 Abnahme durch den Führenden, Stufe 3 Peer-Review durch unbeteiligten Zweitagenten (Pflicht für schreibende Agenten und entscheidungstragende Prüf-Befunde). | `knowledge-base/standardprozesse/subagenten-bau.md`:§14 · Bauplan:N7 Ziff. 2 | Agenten-Arbeit der Abteilung | Norm-Pflicht |
| I3 | **Nicht übernommen** (Widerspruch zum implementierten PR #60): JSON-Array-Format der Allowlist und `disallowedTools`-Totalverbot. Wer sie aus #59 übernimmt, baut gegen den geltenden Stand. | Bauplan:N7 Ziff. 2 · `plugins/nc/referenz/agent-authoring.md`:„Werkzeuggrenzen-Regel (Allowlist-Prinzip, seit 2026-08-15)" | Agenten-Format | Norm-Pflicht |
| I4 | Bekommt `nc-development` Agenten, gilt: flaches Layout `plugins/nc-development/agents/<name>.md`, `tools` **und** `model` als Pflichtfelder, read-only = Allowlist ohne Schreib-Werkzeuge und ohne `Bash`, schreibend nur mit Marker `<!-- nc:schreibend -->` + begründeter Allowlist ohne `Bash` + `maxTurns`, **Defense-Baseline-Block** Pflicht, verbotene Felder `hooks`/`mcpServers`/`permissionMode`, kein `isolation`. Abhängigkeit: erst wenn ein Abteilungs-Agent beauftragt ist. | `plugins/nc/referenz/agent-authoring.md`:„Frontmatter — Pflichtfelder", „Feldkanon", „Verbotene Felder", „Defense-Baseline" · `knowledge-base/standardprozesse/subagenten-bau.md`:§3, §6 · Bauplan:§3 I4 | künftiges `agents/` | Kommende Änderung |
| I5 | **Prüfungs-Eigentum:** Kein Abteilungs-Agent dupliziert oder schwächt eine Kern-Prüfung ab — existiert die Aufgabe im Kern, wird der Kern-Agent genutzt, nicht kopiert. Eigene Domänen-Prüfungen dürfen **daneben** stehen, nie darüber. | `knowledge-base/standardprozesse/subagenten-bau.md`:§3 (Zeile „Prüfungs-Eigentum") | künftige Abteilungs-Agenten | Norm-Pflicht |
| I6 | **Gate-Fakt für Agenten-Entwürfe:** Für Subagenten greifen FFG-**Datei**-Gate und Start-Gate **nicht**; scharf bleibt allein das Destruktiv-Gate auf dem Bash-Pfad. Schreibgrenzen stehen deshalb in der `tools`-Allowlist und im Prompt, nie im Vertrauen auf die Gates. | `knowledge-base/standardprozesse/subagenten-bau.md`:§8 (Tabelle, am Code belegt) · `plugins/nc/referenz/agent-authoring.md`:„Klarstellung" | Agenten-Konzept | Fakt-Korrektur |
| I7 | Sobald ein `agents/`-Verzeichnis entsteht, **wandert der portable Prüfbaustein `agenten.test.mjs` im selben Zug mit** (Nicht-Leer-Guard, Baustein-Version im Kopf). Abhängigkeit: erster Abteilungs-Agent bzw. Satelliten-Extraktion. | `knowledge-base/standardprozesse/subagenten-bau.md`:§9 | Testschutz | Kommende Änderung |
| I8 | Das Registry-Feld **`agents`** der Abteilung steht heute auf `{}` und wird mit dem ersten Abteilungs-Agenten befüllt (testerzwungener Abgleich gegen `plugins/<plugin>/agents/`). Abhängigkeit: erster Abteilungs-Agent. | `plugins/nc/module-registry.json`:Zeile 36 und `_hinweis` · `knowledge-base/standardprozesse/subagenten-bau.md`:§4 Ziff. 6 | Registry-Eintrag `development` | Kommende Änderung |
| I9 | **Faustregel Agent-vs-Skill beachten, bevor gebaut wird:** flutet die Arbeit den Haupt-Kontext oder braucht sie Isolation → Agent; geführter Ablauf in der Haupt-Session → Skill. **Im Zweifel Skill.** Overlap-Prüfung gegen Agents **und** Skills, eigenes Plugin **und** Kern. | `knowledge-base/standardprozesse/subagenten-bau.md`:§2, §5 | Modernisierungs-Entwurf AP-F2 | Norm-Pflicht |

## J. Konnektoren und ausgeschlossene Bausteine

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| J1 | **Konnektoren-Frage (Prüfpunkt 1):** Das OS bringt keine MCP-Server mit. Bekäme das Abteilungsplugin einen lokalen MCP-Server, müsste der FFG-Matcher in `plugins/nc/hooks/hooks.json` `mcp__*` mit abdecken — sonst schriebe ein Werkzeug am Gate vorbei. | `knowledge-base/standardprozesse/aktualisierungs-index.md`:§2.1 Zeile „Ein lokales Plugin bekommt einen MCP-Server" · `plugins/nc/referenz/skill-authoring.md`:„Inhaltliche Pflichten" Ziff. 4 · `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§5 Prüfpunkt 1 | Plugin-Manifest, Kern-Hooks | Norm-Pflicht |
| J2 | **`firmenwissen-suche` (Atlassian-Connector) bleibt zurückgestellt** (E5, durch N6 bestätigt) — kein Abteilungs-Nachbau, keine Abhängigkeit darauf. Die No-Duplicate-Prüfung läuft allein über die Index-Triage der Kern-Wissensbasis. | Bauplan:§8 E5 · Bauplan:N6 („Confluence … `firmenwissen-suche` bleibt zurückgestellt (E5 bestätigt)") · `plugins/nc/referenz/pflege-auspraegung.md`:Fußnote (b) | Skill-Bestand (Ausschluss) | Norm-Pflicht |
| J3 | **Offener Punkt aus N6:** Jira-Projekt-Key(s) sind noch nicht benannt, ebenso die WZS-Deploy-Mechanik-Details. Skills dürfen dafür **nichts raten** — fehlende Quelle heißt STOPP und Nachfrage. Abhängigkeit: Maintainer-Nachreichung. | Bauplan:N6 („*Offen: Jira-Projekt-Key(s) nachreichen.*", „*Offen: Deploy-Mechanik-Details nachreichen.*") · `plugins/nc/nc-sync.md`:§2.1 | `flc-*`, `wzs-*`, neue `rel-*` | Kommende Änderung |
| J4 | **Abteilungs-Roadmap:** `ui-ux` und `automation` sind reine Namens-/Registry-Reservierungen — kein Plugin, kein Marketplace-Eintrag; `nc-development` baut nichts, was sie vorwegnimmt. | Bauplan:N6 („Abteilungs-Roadmap") · `plugins/nc/module-registry.json`:`reservierungen` (Zeilen 68–71) | Modul-Zuschnitt | Norm-Pflicht |
| J5 | **Kollegen-OS bleiben außen vor:** Felix-OS und Biggi-OS sind terminal — keine Queue, keine Promotion, kein Cross-Read. Nichts an `nc-development` darf einen Andockpunkt für sie schaffen. | Bauplan:§3 I8 und §8 E1 · `knowledge-base/standardprozesse/queue-flow.md`:§4 (Kopf-Blockquote, „Kein Anschluss der Kollegen-OS-Satelliten") | Modernisierungs-Entwurf | Norm-Pflicht |

## K. Verfahren der Modernisierung selbst (AP-F1 → AP-F2)

| Nr | Anforderung | Beleg | Gegenstand | Typ |
|---|---|---|---|---|
| K1 | **AP-F2 modernisiert ausschließlich auf Basis des AP-F1-Befunds** — die Inhalts-Prüfung ist Pflicht-Erstschritt, kein Parallelvorgang. | Bauplan:§4 AP-F1/AP-F2 · `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§2 Trigger 1 und §9 | Bauverfahren | Norm-Pflicht |
| K2 | **Anker-Bedarf ist Pflichtprüfpunkt der Synthese:** Neue reservierbare Bezeichnungen (Modul-Präfixe `qs`/`rel`, Skill-Namen, Zielversion des `nc-development`-Bumps) laufen über `standardprozesse/anker-reservierung.md`, sobald mehr als eine Einheit gleichzeitig am OS arbeitet. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§7 („Anker-Bedarf prüfen") und §8 Ziff. 5 · Bauplan:§3 I5 („kein Bump ohne Anker, sobald AP-C2 gebaut ist") | Synthese AP-F1 | Norm-Pflicht |
| K3 | **Persistenz-Pflicht:** Soll-Register und Drift-Matrix werden als **Anhänge am Bauplan in `grundwissen/`** abgelegt — der Session-Output ist kein Aufbewahrungsort. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§3 Schritt 5 und §7 („Persistenz-Pflicht") | Bauplan-Anhänge | Norm-Pflicht |
| K4 | **Quellen-Hierarchie:** Bei Widerspruch Normquelle ↔ Plugin-Text gewinnt die Normquelle; Widersprüche zwischen Doku-Ebenen werden **upstream** korrigiert, nicht im geprüften Artefakt umgangen. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§8 Ziff. 3 | Synthese AP-F1 | Norm-Pflicht |
| K5 | **Positiv-Befunde gehören in die Drift-Matrix** („besser als angenommen") — sie korrigieren die Aufgabenprämisse; keine aufgefüllten Top-Listen. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§3 Schritt 3 und §6 | Drift-Matrix (Lauf 2) | Norm-Pflicht |
| K6 | **Fehlt ein Beleg, ist der Punkt offen — nicht still `OK`.** | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§3 (Schlusssatz) und §5 (Schlusssatz) | beide Läufe | Norm-Pflicht |
| K7 | **Read-only:** Die Prüfung ändert nichts am geprüften Plugin; Fixes laufen ausschließlich über Bauplan und den regulären PR-Fluss von `abteilungs-plugin-bau.md`. | `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md`:§8 Ziff. 2 und §1 · Bauplan:§7 (Rote Linien) | beide Läufe | Norm-Pflicht |
| K8 | **Besetzung des Bauzyklus:** Doku-/Karten-Ports mit klarer Vorlage → Sonnet; Kontroll-Schicht-nahe Arbeit → Opus/Fable; Review immer heterogen (Implementierer ≠ Reviewer), Doku- und Versions-Nachzüge nur am Phasenende. | Bauplan:§5 (Delegationsschnitt) · Bauplan:N1 („Besetzung (Weisung)") | Bauverfahren AP-F2 | Norm-Pflicht |

---

## Anhang — Onsite-Vorbild als Soll-Referenz (nicht Soll-Text)

Quelle: Lese-Worktree `origin/main@5c2c210`, `plugins/oai/module-registry.json`
(`abteilungen[1]`, Satellit v0.11.0, 17 Skills in 6 Modulen) und
`knowledge-base/firmenkernprozesse/team-rollout-infrastruktur/02-FEATURE-SKILL-UND-AGENTEN-KATALOG.md`
(Zeilen 35–40, 88–93, 106–132).

| Vorbild-Modul | WP | Vorbild-Skills | NC-Behandlung |
|---|---|---|---|
| `feat` | WP1–WP3 | `feat-start`, `feat-plan`, `feat-tdd` | Abdeckung Pflicht; Zuschnitt bleibt NC-Sache (`flc-*`) — D4 |
| `mr` | WP4–WP5 | `mr-commit-prep`, `mr-selfreview`, `mr-create` | Abdeckung Pflicht; GitLab-MR → GitHub-PR gemappt — D2, D4 |
| `rev` | WP6 | `rev-prep`, `rev-run`, `rev-fixup` | Abdeckung Pflicht; isento-/GitLab-Bezüge entfallen — D5 |
| `qs` | WP7 | `qs-bug-repro`, `qs-bug-fix`, `qs-loop` | **Lücke** — generisch zu mappen (Jira nach N6 statt PAR) — D1, D2 |
| `rel` | WP7 | `rel-check`, `rel-prod-ops`, `rel-verify` | **Lücke** — generisch zu mappen; `exec-*`/Liquibase/OpenTofu entfallen, `disable-model-invocation` als Muster übernehmen — D1, D2, D6 |
| `ps` | WP7 | `ps-healthcheck`, `ps-debug` | **Wird NICHT gemappt** (PartSens = Firmenspezifikum) — D3 |

**Nicht-Soll aus dem Vorbild (explizit ausgeschlossen):** GitLab-`exec-*`-Web-UI-Jobs ·
Jira-PAR-Ticketschema und `par-<nr>-`-Branchpräfix · isento-Subtasks/Thread-Ownership ·
PartSens/WSL-Bridge · Liquibase/OpenTofu/Blue-Green-Slot-Mechanik · Onsite-Spec-Randnummern ·
Betriebshandbuch (Bauplan §2, §0.1).

---

*Erstellt 2026-08-16 durch Opus-Prüfagent (Lauf 1 von 2, read-only) nach
`knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md` §3 Schritt 1 / §4.
`plugins/nc-development` wurde bewusst **nicht** gelesen — das Ist ist Gegenstand von Lauf 2.*

---

## Anhang B — Ist-Inventur (Lauf 2, wörtlich persistiert)

### AP-F1 Lauf 2 — Ist-Inventur `plugins/nc-development`

> **Prozess:** `knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md` §3 Schritt 2 +
> §5 (zwölf Prüfpunkte). **Read-only** — am Repo wurde nichts geändert; ausgeführt wurden
> ausschließlich lesende Kommandos (`git`-freie `find`/`grep`, `node --test` der bestehenden
> Suiten).
> **Gegenstand:** 15 Artefakte unter `C:\Users\luceb\Desktop\NovaCoreAI-OS\plugins\nc-development`
> (Stand Arbeitsbaum 2026-08-16, Branch `feat/onsite-endstand-phase-2`).
> **Abgrenzung:** Dies ist **kein** Soll-Register (Lauf 1). Wo etwas als fehlend auffällt, steht
> es als **Ist-Beobachtung mit Fundstelle**, ohne Normherleitung.
> **Belegregel:** Fehlt an einem Punkt der Beleg, ist er **OFFEN**, nicht `OK`.

---

## Prüfpunkt 1 — Konnektoren zu externen Systemen (Kern vs. Abteilung)

**Ist:** Das Plugin bringt **keinen** MCP-Server mit. `plugin.json` führt genau vier Schlüssel
neben Name/Version — kein `mcpServers`, keine `.mcp.json` im Verzeichnisbaum (Dateiliste unten,
Artefakt-Inventar). Der Struktur-Test, der genau diesen Fall gaten würde, ist heute trivial grün:

- `plugins/nc/tests/struktur.test.mjs:129` — „*Sobald ein Plugin einen MCP-Server mitbringt,
  gatet das FFG auch mcp__*-Tools*"; Lauf grün (20/20, siehe Punkt 11).

**Faktisch adressierte Fremdsysteme in den Skills — drei Klassen:**

1. **Git/GitHub über CLI, ohne Konnektor:**
   `skills/flc-pr/SKILL.md:34` — „*Erst nach explizitem „Ja" pushen (`git push -u origin
   <branch>`) und den PR anlegen (z. B. `gh pr create`).*" Die Einschränkung „z. B." lässt die
   Werkzeugwahl offen; ein **ausgeschriebener manueller Weg** für den Fall ohne `gh` fehlt.
2. **Jira — schreibende Aktion im Ablauftext:**
   `skills/wzs-blocker-gate/SKILL.md:56` — „*Klärungs-Ticket im Jira (Projekt EP) bewegen oder
   anlegen.*" Dem steht die eigene Regel desselben Skills gegenüber:
   `skills/wzs-blocker-gate/SKILL.md:70` — „*Rote Linie: Der Skill legt keine Jira-Vorgänge
   eigenmächtig an und postet nichts Kundensichtbares*". Und die Verifikation verlangt:
   `skills/wzs-blocker-gate/SKILL.md:83-84` — „*ist das Klärungs-Ticket (Projekt EP) benannt oder
   der Bedarf zur Anlage ist formuliert*". **Ist-Beobachtung:** Ablaufschritt (imperativ,
   schreibend) und Regel/Verifikation (nur vorbereiten) tragen zwei verschiedene Aussagen; eine
   „wo vorhanden, sonst manuell"-Formulierung trägt keiner der drei Sätze. Das Projekt-Kürzel
   `EP` ist ohne Quellenangabe gesetzt (kein `§`-Verweis daneben).
3. **Fremdsysteme ausschließlich über n8n (Architektur-Schnitt, kein Agenten-Konnektor):**
   `skills/wzs-webhook-contract/SKILL.md:21-22` — „*Architektur-Schnitt: **n8n** besitzt alle
   Fremdsystem-Verbindungen — Eigencode baut nie direkt gegen Fremdsysteme.*", verstärkt
   `:67-68` — „*Rote Linie: kein Direktaufruf eines Fremdsystems aus dem Eigencode.*"

**Registry-/Bauplan-Stand als Bezug:** `plugins/nc/module-registry.json:22-36` führt
`development` ohne `repository` und ohne Konnektor-Feld; der Kern trägt die Kontroll-Schicht
allein (`plugins/nc/tests/struktur.test.mjs:108` „*Hooks liegen ausschliesslich im Kern*", grün).

**Befund:** **OK mit einer Ist-Beobachtung** — keine lokalen Konnektoren, Kontroll-Schicht
sauber im Kern; die Jira-Zeile `wzs-blocker-gate/SKILL.md:56` ist der einzige Ablauftext, der
eine schreibende Fremdsystem-Aktion imperativ anweist und der eigenen Regel `:70` widerspricht.

---

## Prüfpunkt 2 — Reale Prozessketten (Review/QS/Abnahme), Rollen als Besetzung

**Kette laut `workflow.md`** (`plugins/nc-development/workflow.md:16-26`), Zitate der Träger:

| WP | Zitat aus `workflow.md` | Träger |
|---|---|---|
| WP1 | `:19` „*Anforderung klären, Abgrenzung bestätigen … Branch vorbereiten*" | `flc-feature-start` |
| WP2 | `:20` „*Aufgabe in vertikale, PR-große Slices zerlegen*" | `flc-plan` |
| WP3 | `:21` „*Test-First auf kritischem Pfad … \| **(kein eigener Skill)**, `wzs-*` als Invarianten-Checklisten*" | — |
| WP4 | `:22` „*Format/Lint/Tests/Secrets vor jedem Commit*" | `flc-commit-prep` |
| WP5 | `:23` „*Gesamtdiff gegen `main` reviewen, PR-Text entwerfen*" | `flc-pr` |
| WP6 | `:24` „*Fremden oder eigenen Diff prüfen, Befunde nach Severity belegen*" | `fe-review`, `be-review` |
| WP7 | `:25` „*QS & Live-Test … **noch ohne eigenen Skill** — manuell nach Verifikationsdisziplin*" | — |

Die Lücke ist **ausdrücklich ausgewiesen**, nicht kaschiert: `workflow.md:33-38` — „*WP3 und WP7
ehrlich ausgewiesen … WP7 ist derzeit **nicht** durch einen Skill abgedeckt: QS und Live-Test
laufen manuell*".

**Review-Kette selbst** — beide Review-Skills enden bei der menschlichen Entscheidung:
`skills/fe-review/SKILL.md:60-61` und `skills/be-review/SKILL.md:65-66`, wörtlich identisch:
„*Rote Linie: der Skill approved nie, resolved nie und postet nie selbst.*"
Belegpflicht je Befund: `skills/be-review/SKILL.md:81` — „*Jeder Befund trägt Severity und
Fundstelle `Datei:Zeile`; kein Befund ohne beides.*"

**Rollen als Besetzung, nie Namen:** Grep über das gesamte Plugin nach `lucas|vöhringer|
voehringer|felix|biggi` (case-insensitive) liefert **null Treffer**. Verwendete Bezeichnungen
sind durchgängig Besetzungen: „der Mensch" (`workflow.md:24`), „Admin"
(`skills/wzs-attribution/SKILL.md:64` „*Admin verknüpft `referral ↔ order` manuell*"),
„Projektleitung" (`skills/wzs-share-invariant/SKILL.md:60`), „Kunde"
(`skills/wzs-blocker-gate/SKILL.md:46`), „die zweite Person"
(`skills/wzs-reward-guard/SKILL.md:88` — „*Jeder Reward-PR ist im Vier-Augen-Review — die zweite
Person ist im PR benannt.*").

**Ist-Beobachtung:** Die Kette endet fachlich bei WP6. Für **QS/Abnahme (WP7)** und für
Merge/Release/Deployment gibt es keinen Skill; letzteres ist als Absicht deklariert
(`workflow.md:65` — „*Merge, Release, Deployment \| **kein Skill** — bewusst nicht
automatisiert*"), WP7 dagegen als Lücke (`workflow.md:25`). Das von `nc-sync.md:76` für den
kritischen Pfad empfohlene „*adversarielles Dual-Review*" taucht in `fe-review`/`be-review`
nicht auf; die einzige Zwei-Personen-Regel des Plugins steht in
`skills/wzs-reward-guard/SKILL.md:88`.

**Befund:** **OK** für Rollenführung und Review-Kette WP1–WP6 (belegt);
**OFFEN** für die Abnahme-Kette WP7 — kein Skill, kein prozessualer Träger außer dem
Verweis auf manuelle Verifikationsdisziplin.

---

## Prüfpunkt 3 — Sprach-/Formatregeln für Text-Entwürfe

**Norm-Bezug (nur zitiert, nicht hergeleitet):** `plugins/nc/nc-sync.md:8` — „*Sprache aller
Artefakte: Deutsch.*", präzisiert `plugins/nc/nc-sync.md:191` — „*Sprache: Alle Artefakte
(Commits, Pull Requests, Doku, Journal) auf Deutsch.*"

**Ist:** Alle 15 Artefakte sind vollständig auf Deutsch verfasst (Sichtprüfung aller Dateien).
Englisch erscheint ausschließlich als **Fachterminologie**, an drei Stellen:

1. **Commit-Typen** (externer Standard):
   `skills/flc-commit-prep/SKILL.md:35-36` — „*Format `<typ>: <beschreibung>` mit einem Typ aus
   `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.*"
2. **Severity-Stufen:** `skills/fe-review/SKILL.md:47-51` und `skills/be-review/SKILL.md:53-57`
   — „**CRITICAL** … **HIGH** … **MEDIUM** … **LOW**".
3. **Statuswerte/Feldnamen der WZS-Domäne:** z. B.
   `skills/wzs-attribution/SKILL.md:43` — „*`referrals.match_method ∈ {hard, fuzzy, manual}`*".

**Ist-Beobachtung mit Beleg — die Sprachregel für Text-Entwürfe in Arbeits-Repos fehlt in den
Skills, die Entwürfe erzeugen.** Die vier Text-erzeugenden Skills (`flc-commit-prep` Zeile 35-37
Commit-Message, `flc-pr` Zeile 29-33 PR-Beschreibung, `fe-review` Zeile 52-54 und `be-review`
Zeile 58-60 Review-Kommentar) sagen **kein Wort** zur Sprache des erzeugten Textes. Grep nach
`Deutsch|deutsch|englisch|Englisch` über `plugins/nc-development/` liefert **null Treffer**.
Gleichzeitig existiert eine differenzierende Beschlusslage:
`knowledge-base/grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md:583-585` — „*Sprachregeln
(Onsite-Muster): In Arbeits-/Kundenrepos sind Code-Artefakte (Branches, Commits, PR-Titel/-Texte,
Code-Kommentare) **englisch**, Kommunikation/Tickets/Doku **deutsch**; das OS-Repo selbst bleibt
durchgängig deutsch (Bestand).*" Die Abteilung arbeitet definitionsgemäß in Arbeits-Repos
(`workflow.md:5` „*GitHub-Flow — Auftrag/Issue → Feature-Branch → PR → Review → Merge nach
`main`*"), trägt zu dieser Unterscheidung aber keine Zeile.

**Befund:** **OK** für die Artefaktsprache des Plugins selbst (durchgängig Deutsch, belegt);
**OFFEN** für die Sprachregel der **erzeugten** Text-Entwürfe — weder Deutsch noch die
N6-Differenzierung ist in einem der vier entwerfenden Skills belegt.

---

## Prüfpunkt 4 — Fremdsystem-Fakten gegen die Quellen-Hierarchie

**Quellen-Hierarchie im Plugin selbst korrekt abgebildet:**
`README.md:37-39` — „*Quellen-Hierarchie im Wasserzisterne-Repo: **1.** Projektplan v2.3 (Source
of Truth) → **2.** `CLAUDE.md` / `AGENTS.md` des Projekts → **3.** diese Skills (sie kapseln
Invarianten, sie ersetzen die Quelle nicht).*"
Jeder der fünf `wzs-*`-Skills nennt seine Quelle in der Frontmatter, z. B.
`skills/wzs-reward-guard/SKILL.md:9` — „*Quelle: CLAUDE.md §6, Projektplan v2.3 §4.4/§6/§9 des
Arbeits-Repos.*" und trägt die STOPP-Regel, z. B.
`skills/wzs-attribution/SKILL.md:69` — „*Quelle nicht auffindbar → **STOPP**, sagen, fragen.*"
Das entspricht wörtlich `plugins/nc/nc-sync.md:46` — „*Quelle nicht auffindbar → **STOPP**,
sagen, fragen — nicht raten.*"

**Nachverifizierbarkeit der Fachfakten aus diesem Repo heraus: nicht gegeben.** Der
Projektplan existiert hier nicht — `find . -iname "*Projektplan*"` (ohne `.git`) liefert **null
Treffer**. Damit sind die harten Zahlen der `wzs-*`-Skills gegen die **eigentliche** Quelle
**nicht** prüfbar: 90 Tage Zeitfenster (`wzs-attribution/SKILL.md:41`), Karenz 21 T
(`:53`), Fallback +35 Tage (`:54`), partial-unique auf `{approved, sent}`
(`wzs-reward-guard/SKILL.md:30-31`), Reconciliation-Poll 48 h
(`wzs-webhook-contract/SKILL.md:50`).

**Was aus diesem Repo heraus prüfbar war — Drift seit der Portierung: keine.** Die
Vorgängerfassung liegt als Alt-Backup im OS-Repo
(`_wzs-skills-backup-20260707-213841/`, im SSOT-Index als „*Alt-Backups … (Aufräum-Kandidat des
Maintainers)*" geführt, `knowledge-base/SSOT-Document-Index.md:23-24`). Abgleich Zahl für Zahl:
- `_wzs-skills-backup-20260707-213841/attribution-spec/SKILL.md:21` — „*Zeitfenster: Link-Öffnung
  → Kauf innerhalb Default **90 Tage** (🔶 B5 — kundenseitig bestätigen)*" ≡
  `skills/wzs-attribution/SKILL.md:41` (wortgleich).
- Backup `:33` „*Default 21 T, § 356 II Nr. 1a BGB*" ≡ `skills/wzs-attribution/SKILL.md:53`.
- Backup `:34` „*größerer Puffer (Default +35 Tage, Plan §4.5)*" ≡ `:54`.
- Backup-README Zeile 3 nennt ebenfalls „*(v2.3)*" — die Versionsangabe ist seit 2026-07-07
  unverändert.

**Ist-Beobachtung:** Die Versionsangabe „v2.3" ist an **sechs** Stellen hart eingetragen
(`README.md:33`, `README.md:37`, und je Frontmatter der fünf `wzs-*`-Skills) und trägt **keinen
Frische-Marker** (kein Datum des letzten Abgleichs). Ein Plan-Fortschritt auf v2.4 wäre aus dem
Plugin heraus nicht erkennbar; der Nachzieh-Auftrag ist zwar formuliert
(`README.md:39-40` — „*Ändert sich eine Invariante im Plan (§16 Änderungsprotokoll), ist der
zugehörige Skill synchron nachzuziehen.*"), aber ohne Stichtag.

**Befund:** **OFFEN** — die Fremdsystem-Fakten sind gegen die benannte Quelle aus diesem Repo
heraus **nicht belegbar** (Quelle liegt im Wasserzisterne-Arbeits-Repo). Belegt ist lediglich
Drift-Freiheit gegenüber dem Stand vom 2026-07-07 und die formal korrekte Quellenkette.

---

## Prüfpunkt 5 — Rote Linien: Kurzverweis statt Duplikat, Ownership je Skill

**Kurzverweis statt Duplikat — sauber:**
`workflow.md:54-56` — „*Die roten Linien selbst definiert der Kern (`wp-rahmen.md`): keine
automatischen Pushes, Merges, Posts, Releases oder Deployments ohne explizite Nutzerfreigabe …
Hier steht, **welcher Skill welche Linie trägt**.*"
Dazu die Nicht-Duplikations-Ansage im Kopf: `workflow.md:7-8` — „*bei Widerspruch gilt für
Rahmenpunkte der Kern, für den Fachablauf diese Datei. Rahmenregeln werden hier **nicht**
dupliziert.*"

**Ownership-Tabelle vollständig** (`workflow.md:59-65`), fünf Zeilen, jede mit Träger und Regel:
Push/PR-Anlage → `flc-pr`; Commit ohne Freigabe → `flc-commit-prep`; Review approven/resolven →
`fe-review`, `be-review`; Kundensichtbares posten → `flc-pr`, `fe-review`, `be-review`;
Merge/Release/Deployment → „*kein Skill — bewusst nicht automatisiert*" (`:65`).

**Verankerung je Skill — in allen 11 vorhanden**, Stichproben:
`skills/flc-feature-start/SKILL.md:50` „*Rote Linie: Kein Push, kein PR, kein Merge in diesem
Skill — auch nicht „vorbereitend".*" · `skills/flc-pr/SKILL.md:41-43` · `skills/flc-commit-prep
/SKILL.md:48` · `skills/fe-review/SKILL.md:71` · `skills/be-review/SKILL.md:75` ·
`skills/wzs-reward-guard/SKILL.md:66` „*Rote Linie: kein Auto-Payout.*" ·
`skills/wzs-share-invariant/SKILL.md:64` · `skills/wzs-blocker-gate/SKILL.md:61,70` ·
`skills/wzs-webhook-contract/SKILL.md:67` · `skills/wzs-attribution/SKILL.md:75`.
`flc-plan` trägt statt „Rote Linie" die äquivalente Verbotsformulierung
`skills/flc-plan/SKILL.md:47` — „*Nicht implementieren, solange der Plan nicht freigegeben ist.*"

**Zwei Ist-Beobachtungen:**

1. **Kein Verweis auf die Ebene-1-Normquelle.** Grep nach `firmenblock|Firmenblock|Ebene 1|
   Ebene 2` über `plugins/nc-development/` liefert **null Treffer**. Weder `README.md` noch
   `workflow.md` nennen `global-claude-firmenblock.md`; der Kurzverweis geht ausschließlich auf
   `wp-rahmen.md` (`workflow.md:54`, `README.md:65`).
2. **Die domänenspezifischen roten Linien leben nur in der JSON, nicht in der Prosa.**
   `pflege-auspraegung.json:7-11` führt drei WZS-Linien — „*Deploys am WZS-Produktivsystem führt
   ausschließlich der Mensch aus.*", „*Eingriffe in die Datenbank …*", „*Änderungen an Webhooks
   …*". Die Ownership-Tabelle in `workflow.md:59-65` kennt diese drei **nicht**, und kein
   `wzs-*`-Skill zitiert sie; `skills/wzs-webhook-contract/SKILL.md` behandelt Webhooks
   fachlich, nennt aber keine Deploy-/DB-Linie. Beschlusslage dazu:
   `2026-08-15-onsite-endstand-nachbau-bauplan.md:592-594` — „*Deploys, DB-Eingriffe und
   Webhook-Änderungen dort sind Mensch-only rote Linien (Payload/Ebene 2, Phase 2/3)*".

**Befund:** **OK** für Kurzverweis-Prinzip und Ownership je Skill (durchgängig belegt);
**Ist-Beobachtung** zu (1) fehlendem Ebene-1-Verweis und (2) der Zweiteilung der roten Linien
zwischen `workflow.md` und `pflege-auspraegung.json` ohne gegenseitigen Verweis.

---

## Prüfpunkt 6 — SSOT-Anbindung, Sitzungswissen-Residenz, Registry-Eintrag

**Sitzungswissen-Residenz korrekt:** `workflow.md:29-30` — „*Sie arbeiten auf dem
Sitzungsgedächtnis unter `.nc/erinnerung/`.*" Das ist die einzige `.nc/`-Nennung im Plugin
(Grep) und deckt sich mit `plugins/nc/nc-sync.md:91-94` (`.nc/erinnerung/stand.md`,
`journal/<YYYY-MM-DD>.md`).

**Keine Plugin-Grenzen-Verletzung:** Grep nach `knowledge-base` und `../` über alle `.md` des
Plugins → **null Treffer**; testerzwungen bestätigt durch
`plugins/nc/tests/struktur.test.mjs:189` („*Plugin-Dateien verweisen nicht ueber die
Plugin-Grenze*", grün).

**Queue-Anbindung (neu in diesem Bauzyklus) — konsistent:**
`pflege-auspraegung.json:4` — „*"queuePfad": "knowledge-base/kandidaten-queue/queue.md"*"; die
Datei existiert real (`knowledge-base/kandidaten-queue/queue.md`, 1913 Bytes). Der SSOT-Index
führt genau diese Kategorie: `knowledge-base/SSOT-Document-Index.md:51` — „*Die **Übergangs-Queue**
der repo-internen Abteilung `development` (`queue.md`) … Format nach
`plugins/nc/referenz/pflege-auspraegung.md` Abschnitt 4*", und `:114` mit der Zeile zur
Queue-Datei selbst. Der `kriterienVerweis` (`pflege-auspraegung.json:5` — „*Kriterienliste v1,
referenz/pflege-auspraegung.md des Kern-Plugins nc*") zeigt auf einen real existierenden
Abschnitt (`plugins/nc/referenz/pflege-auspraegung.md:147` „*## 5. Kriterienliste v1
(firmenrelevant)*").
Der `uebergang` (`pflege-auspraegung.json:12`) trifft die Formulierung der Referenz
(`plugins/nc/referenz/pflege-auspraegung.md:55` — „*`/nc:queue-abteilung` gilt ausschließlich für
Abteilungs-Satelliten-Klone und ist hier nicht der Weg*") sinngemäß und wörtlich passend:
„*… nicht über /nc:queue-abteilung.*"

**Registry-Eintrag stimmig** (`plugins/nc/module-registry.json:21-37`): `namespace`
„*/nc-development:*", `staendig: false`, `repoSkillsPath`
„*plugins/nc-development/skills*", `status` „*ausgeliefert — 11 Skills in 4 Modulen*",
Modulzeilen `fe`/`be`/`flc`/`wzs` mit je „[gebaut]" für alle 11, `agents: {}` bei real
fehlendem `agents/`-Verzeichnis. Maschinell bestätigt: `struktur.test.mjs` „*Registry beschreibt
genau die vorhandenen Plugins mit korrektem Namespace*" (grün) und
`agenten-os.test.mjs` „*Registry-Konsistenz: agents-Segment je Abteilung passt zur Platte*"
(grün, 4/4).

**Ist-Beobachtung:** Die Queue-Anbindung existiert **ausschließlich** in
`pflege-auspraegung.json`. Weder `workflow.md` (WP8-Zeile `:26` nennt nur „*Stand sichern,
Entscheidungen protokollieren*") noch `README.md` erwähnen Queue, Kandidaten-Klassifikation oder
die Pflege-Ausprägung; Grep nach `queue|Queue|Kandidat` über die `.md` des Plugins → **null
Treffer**. Ebenso trägt `workflow.md` **keinen** eigenen SSOT-Abschnitt (siehe Punkt 8).

**Befund:** **OK** — Residenz, Registry und Queue-Pfad sind belegt und testerzwungen stimmig;
**Ist-Beobachtung** zur fehlenden Sichtbarkeit der Queue in der Prosa-Doku der Abteilung.

---

## Prüfpunkt 7 — Verweise auf Kern-Skills (Umbenennungen/Entfernungen nachgezogen)

**Vollständige Liste aller Kern-Skill-Verweise im Plugin** (Grep `/nc:`, 12 Treffer):
`README.md:10` („*`/nc:start`, `/nc:end-session` und `/nc:journal`*"), `README.md:46-47`
(Ablaufkette), `skills/fe-review/SKILL.md:56` („*auf `/nc:journal` … verweisen*"),
`skills/flc-feature-start/SKILL.md:28` („*`/nc:start` ausführen*") und `:41` („*damit
`/nc:end-session` sie ins Journal übernehmen kann*"), `skills/flc-plan/SKILL.md:51` („*Der
bestätigte Plan wird von `/nc:end-session` ins Journal übernommen*"), `workflow.md:13,18,26,28,29`.

**Abgleich gegen die real vorhandenen Kern-Skills** (`plugins/nc/skills/`: `doku-sync`,
`end-session`, `journal`, `os-info`, `queue-abteilung`, `queue-kern`, `setup`, `skill-builder`,
`start`, `update-doks`): **alle drei referenzierten Namen existieren**. Insbesondere ist die
Umbenennung `save-session` → `end-session` **überall nachgezogen** — Grep nach `save-session`
über `plugins/nc-development/` liefert **null Treffer**; die Registry dokumentiert die
Umbenennung (`plugins/nc/module-registry.json:15` — „*end-session [gebaut, bis 0.7.x
save-session]*").

**Ist-Beobachtung:** Sieben der zehn Kern-Skills werden nirgends erwähnt — darunter zwei mit
direktem Abteilungsbezug: `/nc:setup` (die Referenz macht ihn zum Standard-Zeiger bei fehlender
Auflösung, `plugins/nc/referenz/pflege-auspraegung.md:93-94` — „*der Skill meldet den
Ist-Zustand und verweist auf `/nc:setup`*") und `/nc:queue-abteilung`, der in
`pflege-auspraegung.json:12` **negativ** genannt wird („*nicht über /nc:queue-abteilung*"),
in der Prosa-Doku aber nicht auftaucht.

**Befund:** **OK** — keine toten oder veralteten Kern-Skill-Verweise (belegt durch
Namensabgleich gegen `plugins/nc/skills/`); Ist-Beobachtung zur Unvollständigkeit der Nennung.

---

## Prüfpunkt 8 — `workflow.md`: Trigger-Matrix, WP-Mapping, SSOT-Abschnitt

**a) WP-Mapping gegen `plugins/nc/wp-rahmen.md`.** Alle neun Punkte WP0–WP8 sind in
`workflow.md:16-26` vorhanden und in Reihenfolge. Bezeichnungs-Abgleich:

| WP | `wp-rahmen.md:19-29` | `workflow.md:16-26` | Ist |
|---|---|---|---|
| WP0 | „Session-Start" | „Session-Start" | identisch |
| WP1 | „Verstehen" | „Verstehen" | identisch |
| WP2 | „Planen" | „Planen" | identisch |
| WP3 | „Umsetzen" | „Umsetzen" | identisch |
| WP4 | „Quality-Gate" | „Quality-Gate" | identisch |
| WP5 | „Selbst-Review + Übergabe" | „Selbst-Review + PR" | fachlich übersetzt |
| WP6 | „Review" | „Review" | identisch |
| WP7 | „QS & Abnahme" | „QS & Live-Test" | fachlich übersetzt |
| WP8 | „Session-Ende" | „Session-Ende" | identisch |

WP0/WP8 sind korrekt **nicht** nachgebaut, sondern dem Kern zugewiesen (`workflow.md:18,26`
je „*(Kern)*"), wie `wp-rahmen.md:71` verlangt („*WP0/WP8 **nicht** nachbauen*").

**Belegte Abweichung — Skill-Abdeckung.** `plugins/nc/wp-rahmen.md:69-70` — „*WP1–WP7 in der
eigenen `workflow.md` auf den realen Zyklus abbilden, **mit mindestens einem auto-triggerbaren
Skill je Punkt** und **disjunkten** Trigger-Begriffen.*" Ist:
`workflow.md:21` (WP3) — „*(kein eigener Skill)*"; `workflow.md:25` (WP7) — „*noch ohne eigenen
Skill*". Zwei der sieben Punkte tragen keinen eigenen Skill; für WP3 springen die
`wzs-*`-Checklisten nur bei WZS-Berührung ein (`workflow.md:21`), was `workflow.md:33-35`
ausdrücklich als bewusste Entscheidung ausweist („*Für WP3 gibt es bewusst keinen
Generalisten-Skill*"). Die Lücke ist im Bauplan als bekannt vermerkt:
`2026-08-15-onsite-endstand-nachbau-bauplan.md:317-319` — „*Bekannte Lücke vorab: WP7 (QS &
Abnahme) ist bei uns „noch ohne eigenen Skill", Onsite-dev trägt 17 Skills in 6 Modulen (inkl.
`qs-*`, `rel-*`) gegenüber unseren 11 in 4.*"

**b) Trigger-Matrix.** Vorhanden als „*Trigger-Abdeckung (QA-Matrix)*" (`workflow.md:67-83`) mit
vier Modul-Zeilen und expliziter Disjunktheits-Ansage (`:69-70` — „*Trigger-Begriffe sind je
Modul disjunkt gehalten, damit sich Skills nicht gegenseitig wegtriggern*") sowie
Pflege-Anweisung (`:82-83` — „*Bei neuen Skills: Matrix ergänzen und Overlap-Prüfung laut
Checkliste in `referenz/skill-authoring.md`*"). **Granularität:** Die Matrix ist **modulweise**
(vier Einträge), nicht skillweise (elf) — die vier `flc-*`-Skills teilen sich eine Zeile
(`:72-73`), die fünf `wzs-*`-Skills ebenfalls (`:78-80`). Gegenprobe gegen die
Frontmatter-Trigger: `flc-feature-start` („*Feature beginnen*"), `flc-plan` („*Task slicen*"),
`flc-commit-prep` („*committen*"), `flc-pr` („*Pull Request erstellen*") — alle vier tauchen
wörtlich in der Matrix-Zeile `:72-73` auf; die fünf `wzs-`-Begriffe („*Attribution*", „*Reward /
Auszahlung*", „*Share-Kanal / Empfehlungsnachricht*", „*Webhook / Reconciliation*",
„*Phasen-Start / Blocker*") in `:78-80` decken je einen Skill ab. **Kein Trigger-Begriff eines
Skills fehlt in der Matrix.**

**c) SSOT-Abschnitt.** **Nicht vorhanden.** `workflow.md` hat vier Abschnitte („*Der Zyklus*"
`:10`, „*Module dieser Abteilung*" `:40`, „*Rote-Linien-Ownership dieser Abteilung*" `:52`,
„*Trigger-Abdeckung (QA-Matrix)*" `:67`) — keiner davon behandelt SSOT/Wissensbasis. Der einzige
SSOT-nahe Satz ist die Residenz-Nennung in `workflow.md:29-30` („*Sitzungsgedächtnis unter
`.nc/erinnerung/`*") innerhalb des Kern-Abhängigkeits-Absatzes.

**Befund:** **OK** für Trigger-Matrix (vollständig, disjunkt, belegt) und WP-Vollständigkeit;
**OFFEN** für „SSOT-Abschnitt korrekt" — es gibt keinen; **belegte Abweichung** beim
WP-Mapping: WP3 und WP7 ohne eigenen Skill gegen `wp-rahmen.md:69`.

---

## Prüfpunkt 9 — Offene Punkte der Abteilung: umgesetzt oder bestätigt fehlend?

Quelle 9 des Prozesses für repo-interne Abteilungen: jüngster einschlägiger Bauplan bzw.
CHANGELOG-`[Unreleased]`.

| Offener Punkt (Fundstelle) | Ist-Zustand im Plugin | Beleg |
|---|---|---|
| **AP-F2:** „*fehlende Module generisch gemappt (QS-/Release-Zyklus …)*" (`bauplan:320-322`) | **nicht umgesetzt** — 4 Module (`fe`,`be`,`flc`,`wzs`), keine `qs-*`/`rel-*` | Dateiliste (11 Skills); `plugin.json:5` „*11 Skills in 4 Modulen (fe, be, flc, wzs)*" |
| **AP-F2:** „*`disable-model-invocation: true` als Muster für gefährliche Ops-Skills übernehmen*" (`bauplan:322-323`) | **nicht umgesetzt** — Grep über `plugins/` findet den Schlüssel nur in der Kern-Referenz `plugins/nc/referenz/skill-authoring.md:41`, in **keiner** SKILL.md | Grep `disable-model-invocation` |
| **AP-F2:** „*Abteilungs-CLAUDE (Ebene 2, aus AP-C1) ausliefern*" (`bauplan:323`) | **nicht umgesetzt** — keine `development-abteilungs-claude.md` an der Plugin-Wurzel | Dateiliste (15 Dateien, keine Abteilungs-CLAUDE) |
| **Ebene-2-Auslieferung an Bump gekoppelt** — „*Auslieferung folgt mit dem ersten Abteilungs-Bump, der die Lese-Verdrahtung in `/nc:start` mitbringt*" | **konsistent offen** — `nc-development` steht unverändert auf `0.1.0` | `plugin.json:4` „*"version": "0.1.0"*"; CHANGELOG nennt `nc-development` zuletzt bei `0.1.0` (`CHANGELOG.md:796`) |
| **Neu in diesem Bauzyklus (AP-E1):** `pflege-auspraegung.json` an der Plugin-Wurzel | **umgesetzt** — vorhanden, Schema v1 vollständig, testerzwungen grün | `pflege-auspraegung.json:1-13`; `queue-os.test.mjs` T-3 grün |
| **WP7-Lücke** (`bauplan:317-319`) | **bestätigt fehlend und ehrlich ausgewiesen** | `workflow.md:25,35-38` |
| **AP-F3** Satelliten-Extraktion — „*bleibt Ideen-Backlog, wird hier nicht gebaut*" (`bauplan:324-325`) | **konsistent** — kein `repository` in der Registry, `uebergang` gesetzt | `module-registry.json:21-37`; `pflege-auspraegung.json:12` |
| **Bauplan-offen:** „*Offen: Deploy-Mechanik-Details nachreichen.*" (`bauplan:594-595`) | **offen** — keine Deploy-Mechanik im Plugin; `workflow.md:65` schließt Deployment aus | `workflow.md:65` |

**Ist-Beobachtung zur Versionslage:** Der laufende Bauzyklus hat das Plugin inhaltlich verändert
(neue `pflege-auspraegung.json`), ohne dass die Plugin-Version bewegt wurde
(`plugin.json:4` = `0.1.0`). Der Bauplan sieht den Abteilungs-Bump erst in Phase F vor:
`bauplan:464` — „*| **Phase 3 — Queue-Flow & Development-Plugin** | E (AP-E1–E3) + F (AP-F1–F2) |
0.10.0 (+ `nc-development`-Bump) |*". Der Zustand ist damit planmäßig, nicht unbemerkt.

**Befund:** **OK** — jeder offene Punkt ist zuordenbar: drei AP-F2-Punkte **bestätigt nicht
umgesetzt** (AP-F2 ist der Nachfolgeschritt dieser Prüfung), der AP-E1-Punkt **umgesetzt**, die
WP7-Lücke **bestätigt fehlend und dokumentiert**.

---

## Prüfpunkt 10 — Referenzdateien: Frische-Marker, keine Duplikation

**Ist: Das Plugin führt keine einzige Referenzdatei.** Der vollständige Dateibaum (15 Dateien)
enthält kein `referenz/`-Verzeichnis und keine Datei neben einer `SKILL.md`. Damit entfällt die
Frische-Marker-Frage mangels Gegenstand — und es gibt **keine** Duplikation mit
Kern-Referenzdateien.

**Verweise auf Kern-Referenzen erfolgen korrekt per Name, nicht per Pfad:**
`README.md:66` — „*`referenz/skill-authoring.md` des Kern-Plugins `nc` — verbindliche
SKILL.md-Formatregeln*"; `workflow.md:82-83` — „*laut Checkliste in `referenz/skill-authoring.md`
des Kern-Plugins `nc`*"; `skills/be-review/SKILL.md:48` — „*`nc-sync.md` §2.2 des Kern-Plugins
`nc`*". Das entspricht `plugins/nc/referenz/skill-authoring.md:83-87` („*Auf Inhalte eines
anderen Plugins per **Name** verweisen*") und ist testerzwungen (`struktur.test.mjs:189`, grün).

**Kein Bezug auf kommende Artefakte:** Grep nach `agent-authoring` über
`plugins/nc-development/` → **null Treffer**; das Plugin verweist auf keine Agenten-Referenz und
führt selbst kein `agents/`-Verzeichnis (passend zu `module-registry.json:36` — „*"agents": {}*").

**Ist-Beobachtung:** Der Detailwissen-Auslagerungspfad, den `skill-authoring.md:73-75` vorsieht
(„*Detailwissen in eine Referenzdatei neben der `SKILL.md` auslagern*"), wird nicht genutzt —
alle Skills bleiben mit 61–90 Zeilen im Zielkorridor, eine Auslagerung ist also derzeit auch
nicht nötig.

**Befund:** **OK** (Negativbefund, belegt): keine Referenzdateien, damit keine Duplikation und
kein Frische-Marker-Bedarf; alle Fremdverweise plugin-grenzenkonform.

---

## Prüfpunkt 11 — Formales, gegengeprüft an `plugins/nc/tests/struktur.test.mjs`

**Maschineller Nachweis (Testläufe vom 2026-08-16, read-only ausgeführt):**

| Suite | Ergebnis |
|---|---|
| `plugins/nc/tests/struktur.test.mjs` | **20 pass / 0 fail** |
| `plugins/nc/tests/queue-os.test.mjs` | **7 pass / 0 fail** |
| `plugins/nc/tests/agenten-os.test.mjs` | **4 pass / 0 fail** |

Die für `nc-development` einschlägigen Invarianten und ihr Ist:

| Invariante (Fundstelle im Test) | Ist für `nc-development` |
|---|---|
| `struktur.test.mjs:91` „*Abteilungsplugins haengen am Kern*" | `plugin.json:11-13` — „*"dependencies": [ "nc" ]*" ✓ |
| `struktur.test.mjs:108` „*Hooks liegen ausschliesslich im Kern*" | kein `hooks/`-Verzeichnis ✓ (entspricht `wp-rahmen.md:74-75`) |
| `struktur.test.mjs:154` „*name entspricht dem Verzeichnis*" | alle 11 ✓ |
| `struktur.test.mjs:164` „*description bricht nicht am YAML-Plain-Scalar*" | alle 11 nutzen `>-`; Längen 466–758 Zeichen (max. 1024) ✓ |
| `struktur.test.mjs:189` „*verweisen nicht ueber die Plugin-Grenze*" | kein `../`, kein `knowledge-base/` in `.md` ✓ |
| `struktur.test.mjs:452` „*Keine offenen Vorlagen-Platzhalter*" | keine `{{…}}` ✓ |
| `queue-os.test.mjs:220` T-3 „*Pflege-Auspraegung … Schema v1 vollstaendig und registry-konsistent*" | alle sechs Pflichtfelder + `uebergang` gesetzt ✓ |

**Zusätzlich manuell geprüft, was die Suite nicht abdeckt** (Regeln aus
`plugins/nc/referenz/skill-authoring.md`):

- **Haus-Stil-Gliederung** (`skill-authoring.md:50-65`): alle 11 Skills tragen genau einmal
  `## Zweck`, `## Ablauf`, `## Regeln`, `## Verifikation` — maschinell ausgezählt, 11/11.
- **Aufrufform im Titel** (`skill-authoring.md:67-69`): alle 11 beginnen mit
  `# /nc-development:<name> — …`, 11/11.
- **Länge 60–120 Zeilen** (`skill-authoring.md:73`): 61 (`flc-plan`) bis 90
  (`wzs-attribution`, `wzs-webhook-contract`) — **alle 11 im Korridor**, keiner nahe dem harten
  Limit von 500.
- **Keine personenbezogenen Pfade** (`skill-authoring.md:109`): Grep nach Namen → null Treffer.
- **`claude plugin validate plugins/nc-development --strict`** (`skill-authoring.md:127`):
  **nicht ausgeführt** — dieser Lauf ist read-only am Repo, und der Befehl gehört zum Bau-, nicht
  zum Prüfpfad. Der Nachweis stützt sich stattdessen auf die Frontmatter-Invarianten der Suite.

**Befund:** **OK** — formal vollständig sauber; alle drei einschlägigen Suiten grün, die vier
nicht testgedeckten Formatregeln manuell 11/11 erfüllt. Einzige nicht erbrachte Einzelprüfung:
`claude plugin validate --strict` (bewusst nicht ausgeführt, siehe oben).

---

## Prüfpunkt 12 — Team-Onboarding: README mit Installation, Erstkontakt-tauglich

**Was die README leistet** (`README.md`, 66 Zeilen): Zweck und Zyklus (`:3-6`), vollständige
Modul-/Skill-Tabelle mit WP-Spalte für alle 11 Skills (`:15-27`), die kundenspezifische Warnung
zu `wzs` (`:29-41`), typischer Ablauf als Kette (`:43-52`), rote Linien in Kurzform (`:54-59`)
und ein Weiterlesen-Block (`:61-66`). Sie ist für den Erstkontakt inhaltlich orientierend.

**Was fehlt — Installation.** Die README enthält **keine** Installationsanweisung. Der einzige
Installationsbezug ist beschreibend, nicht anleitend:
`README.md:8-11` — „*Der Kern `nc` ist als Dependency dieses Plugins eingetragen und wird bei
Installation und Aktivierung transitiv mitgezogen*". Grep nach `/plugin |marketplace|Installation
|installieren` über `README.md` liefert außer dieser einen Nennung nichts. Kein
`/plugin marketplace add`, kein `/plugin install`, keine Voraussetzungen, kein Hinweis auf
`/nc:setup`.

Die vollständige Anleitung existiert — aber **außerhalb des Plugins**, in der Repo-Wurzel:
`ONBOARDING.md:9-20` — „*## 1. Installation (einmal pro Rechner) … `/plugin marketplace add
NovaCore-AI/NovaCoreAI-OS` / `/plugin install nc-development@novacore-os`*", samt
Voraussetzungen (`ONBOARDING.md:3-7`), SSH-Falle (`:26-31`) und dem Pflichtschritt
`/nc:setup` (`:33-40`). Der Weiterlesen-Block der README (`:61-66`) nennt `workflow.md`,
`wp-rahmen.md` und `skill-authoring.md` — **`ONBOARDING.md` nicht**. Für einen Nutzer, der das
installierte Plugin vor sich hat, gibt es damit keinen Zeiger auf die Installations- und
Setup-Strecke. (Ein Pfadverweis wäre nach `skill-authoring.md:83-87` ohnehin unzulässig; eine
Quellenangabe „OS-Repo" wäre zulässig, steht aber nicht da.)

**Befund:** **OFFEN** — die geforderte Installation fehlt in der README der Abteilung; sie
existiert nur in `ONBOARDING.md` an der Repo-Wurzel, auf das die README nicht verweist.

---

## Zusammenfassung der Befunde je Prüfpunkt

| # | Prüfpunkt | Befund |
|---|---|---|
| 1 | Konnektoren extern | **OK** + Ist-Beobachtung (Jira-Ablaufzeile widerspricht eigener Regel) |
| 2 | Reale Prozessketten, Rollen | **OK** (WP1–WP6, Rollen namensfrei) · **OFFEN** für Abnahme-Kette WP7 |
| 3 | Sprach-/Formatregeln Text-Entwürfe | **OK** (Plugin-Artefakte deutsch) · **OFFEN** (Sprache der erzeugten Entwürfe nirgends geregelt) |
| 4 | Fremdsystem-Fakten vs. Quellen-Hierarchie | **OFFEN** (Quelle liegt außerhalb dieses Repos; nur Drift-Freiheit seit 2026-07-07 belegbar) |
| 5 | Rote Linien: Verweis statt Duplikat, Ownership | **OK** + 2 Ist-Beobachtungen (kein Ebene-1-Verweis; Domänen-Linien nur in JSON) |
| 6 | SSOT-Anbindung, Residenz, Registry | **OK** + Ist-Beobachtung (Queue in der Prosa-Doku unsichtbar) |
| 7 | Verweise auf Kern-Skills | **OK** (keine veralteten Namen; `save-session` vollständig nachgezogen) |
| 8 | `workflow.md` Matrix/WP/SSOT | **OK** (Matrix, WP-Vollständigkeit) · **OFFEN** (kein SSOT-Abschnitt) · belegte Abweichung (WP3/WP7 ohne Skill) |
| 9 | Offene Punkte der Abteilung | **OK** — jeder Punkt zuordenbar (3× AP-F2 bestätigt offen, AP-E1 umgesetzt) |
| 10 | Referenzdateien | **OK** (Negativbefund: keine vorhanden, keine Duplikation) |
| 11 | Formales vs. `struktur.test.mjs` | **OK** (3 Suiten grün, 4 manuelle Regeln 11/11) |
| 12 | Team-Onboarding README/Installation | **OFFEN** — keine Installation in der Abteilungs-README |

---

## Artefakt-Inventar — alle 15 Dateien unter `plugins/nc-development/`

Zeilenzahlen per `wc -l`. Reihenfolge: Manifeste, Wurzel-Doku, Skills nach Modul.

| # | Pfad (relativ zur Plugin-Wurzel) | Zeilen | Kurzcharakteristik |
|---|---|---:|---|
| 1 | `.claude-plugin/plugin.json` | 14 | Manifest. `version: 0.1.0` (unverändert seit Erstauslieferung), `dependencies: ["nc"]`, Description nennt „11 Skills in 4 Modulen (fe, be, flc, wzs)". Kein `mcpServers`, kein `hooks`. |
| 2 | `pflege-auspraegung.json` | 13 | **Neu in diesem Bauzyklus (AP-E1).** Deklarative Pflege-Ausprägung, Schema v1: `abteilung: development`, `queuePfad` auf die Übergangs-Queue, `kriterienVerweis` auf Kern-Referenz Abschnitt 5, `journalSonderregeln: []`, drei WZS-`roteLinienDomaene`, `uebergang` gesetzt. Einziges Artefakt, das Queue und Domänen-Linien führt. |
| 3 | `README.md` | 66 | Erstkontakt-Doku: Modul-/Skill-Tabelle mit WP-Spalte, WZS-Warnblock samt Quellen-Hierarchie, Ablaufkette, rote Linien in Kurzform, Weiterlesen. **Ohne Installationsabschnitt.** |
| 4 | `workflow.md` | 83 | **Normative Landkarte der Abteilung.** WP0–WP8-Tabelle mit Träger und menschlichem Gate, Ehrlichkeits-Absatz zu WP3/WP7, Modul-Tabelle, Rote-Linien-Ownership (5 Zeilen), Trigger-Matrix (4 Modulzeilen). Kein SSOT-Abschnitt. |
| 5 | `skills/flc-feature-start/SKILL.md` | 65 | WP1. Anforderung klären → Kontext (`/nc:start`) → betroffene Stellen → Branch `feat/<kurzbeschreibung>` vorschlagen → Freigabe → Übergabe an `flc-plan`. Rote Linie: kein Push/PR/Merge, „auch nicht ‚vorbereitend'". |
| 6 | `skills/flc-plan/SKILL.md` | 61 | WP2. 2–7 vertikale Slices, Richtwert < 400 geänderte Zeilen, kein Slice ohne Testanteil, Abhängigkeiten + Risiken je Slice, Plan-Freigabe vor Code. Kürzester Skill des Plugins. |
| 7 | `skills/flc-commit-prep/SKILL.md` | 63 | WP4. Status/Diff sichten → Formatter→Linter→Tests aus der realen Projekt-Konfiguration → Secrets-Check (Fund = STOPP) → Conventional-Commits-Vorschlag → Freigabe. Verbietet `--no-verify` und automatischen Push. |
| 8 | `skills/flc-pr/SKILL.md` | 62 | WP5. Branch-Prüfung, `git diff main...HEAD` + volle Commit-Historie, PR-Entwurf in vier Teilen (Zusammenfassung/Änderungen/Testplan/offene Punkte), Push und Anlage erst nach explizitem „Ja"; bestehende PRs aktualisieren statt neu anlegen. |
| 9 | `skills/fe-review/SKILL.md` | 81 | WP6, Modul `fe`. Vier feste Dimensionen (Zugänglichkeit · Web-Vitals-Risiken · Design-Qualität · Komponenten-Hygiene), Severity CRITICAL–LOW mit `Datei:Zeile`, Review-Kommentar als **Entwurf**. Approved/resolved/postet nie. |
| 10 | `skills/be-review/SKILL.md` | 87 | WP6, Modul `be`. Sechs Dimensionen (API-Verträge · Fehlerpfade · Input-Validierung · Datenzugriff · Secrets · Testtiefe), einziger Skill mit explizitem `nc-sync.md`-§-Verweis (`:48`, ≥ 80 % Coverage). Längster Nicht-WZS-Skill. |
| 11 | `skills/wzs-attribution/SKILL.md` | 90 | WP3/WP6, kundenspezifisch. Blöcke A–E + G: Normalisierung (lowercase, E.164), hart/fuzzy Matching, Zeitfenster 90 T, Mehrfach-Match-Guard, Tie-Break, Karenz-Übergabe, manueller Fallback. Führt ⛔ A1/A2 als offene Blocker. |
| 12 | `skills/wzs-reward-guard/SKILL.md` | 88 | WP3/WP6, Geld-Pfad. Partial-unique auf `{approved, sent}`, Karenz `eligible_at` (§ 356 II Nr. 1a BGB, 21 T), Refund-Erlöschen, Approval-Gate ohne Auto-Payout, Audit-Log, Pause-Schalter. Einziger Skill mit Vier-Augen-Pflicht. |
| 13 | `skills/wzs-share-invariant/SKILL.md` | 86 | WP3/WP6, UWG. Kern-Invariante „System versendet nie an Dritte" (BGH I ZR 208/12), Kanal-Design Mobil `wa.me`/`mailto:` vs. Desktop Kopieren+QR, Datenminimierung, ⛔ A5, Gutschein-Code-Mail als einzige zulässige System-Mail, Stopp- statt Reparatur-Bedingung. |
| 14 | `skills/wzs-blocker-gate/SKILL.md` | 84 | WP3, vorgelagert. Phase→Blocker-Mappe (Phase 0–5, hart/weich), Gate-Prüfung gegen Plan §11.C, Sekundär-Annahmen B3–B10, Eskalationsweg. Einziger Skill mit Jira-Nennung („Projekt EP"). |
| 15 | `skills/wzs-webhook-contract/SKILL.md` | 90 | WP3/WP6, Integrationen. Idempotenz je Source, Signatur/Authentizität, Refund-/Status-Events, Reconciliation-Fallback (48-h-Poll, `POST /api/internal/orders/reconcile`), Architektur-Schnitt „alles über n8n", ⛔ A2/A4. |

**Nicht vorhanden** (Negativ-Inventar, für die Vollständigkeit der Ist-Aufnahme):
`hooks/` · `agents/` · `referenz/` · Abteilungs-CLAUDE (Ebene 2) · `tests/` · `.mcp.json` ·
CHANGELOG des Plugins.

**Summen:** 15 Dateien · 11 `SKILL.md` (Skill-Zeilen 61–90, Median 84) · 2 JSON-Manifeste ·
2 Wurzel-Markdown (`README.md` 66, `workflow.md` 83) · Gesamt 1033 Zeilen.

---

*Ist-Inventur (Lauf 2 von 2, AP-F1) erstellt 2026-08-16 durch einen Opus-Prüfagenten nach
`knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md` §3 Schritt 2 / §5. Read-only:
am geprüften Plugin und am Repo wurde nichts geändert. Kein Soll-Register — die Unabhängigkeit
der beiden Läufe ist gewahrt.*

---

*Synthese angelegt 2026-08-16 durch Claude (Fable 5, Overseer) nach `standardprozesse/abteilungs-inhalts-pruefung.md` §3 Schritte 3–5 und §7; Läufe 1 und 2 durch zwei unabhängige Opus-Prüfagenten (read-only). Erstanwendung des Prozesses (§9).*
