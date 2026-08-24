# Stand (konsolidiert) — 2026-08-24, 05:1x nach der Nachtschicht (Phasen G + H)

## Aktueller Arbeitsstand

- **Der finale Onsite-Delta-Umbau läuft** (beauftragt 2026-08-23, Bauplan =
  `knowledge-base/grundwissen/2026-08-23-onsite-delta-mapping.md` mit Nachträgen N1–N3;
  Onsite-Parität als Default, **Affiliate-Invariante I-A0** als Dauer-Abweichung;
  **Waypoint-Arbeitsmodus** — die alten CHANGELOG-/Tag-/Bump-Zeremonien und
  Zahlen-Spiegel gelten nicht mehr).
- **Phase G (Kontroll-Schicht-Parität) fertig → PR #22** (Kern **0.11.0**): FFG mit
  NotebookEdit/Windows-Mustern/Wrapper-Passthrough + Drift-Ritual §2b, Safety-Gate/Gate 3
  gebaut (Musterliste v1, Wortlaut-Abnahme am PR), Gate 4 endgültig entfallen, Queue-Hook
  mit PR-Sichtbarkeit + Windows-Sperren-Härtung. GLM-5.3 R1–R3, CI komplett grün.
- **Phase H (SSOT-Präsenz) fertig → PR #23** (stacked, Kern **0.12.0**):
  Node-Doks-Definition, vier `wissen-*`-Router (Modul `wissen`), Wissens-Zeiger-Hook +
  Sucheindex (38), Pfad-Zeiger-Hook + Pfad-Index (22 Klassen) + Red-Flags-Block,
  doku-sync ersatzlos entfallen (Träger-Regel), update-doks auf eine Aufgabe. GLM-5.3
  R1+R2 „vollständig behoben". Suite **312/310/2**, validate ×3 grün.
- `.nc/` ist seit Maintainer-Commit `242b9e7` (2026-08-23, „war Absicht") **getrackt** —
  Vorwegnahme von EN1/D14; Sitzungswissen-Commits reisen in den Phasen-PRs mit.
- **Merge-Reihenfolge:** PR #22 zuerst, dann PR #23 (stacked auf dem G-Branch).

## Offene Punkte (alle im Register)

- Maintainer: PR #22/#23 abnehmen + mergen; **EN4-Wortlaut-Abnahme** Safety-Gate-
  Musterliste v1 (Merge = Abnahme); WZS-Deploy-/DB-/Webhook-Kommandos für Muster 4
  benennen; Knoten-Entscheid `module-registry.json` (Knoten oder Blatt).
- **Phasen I/J/K offen:** I = D14 (sitzungswissen-Umzug, end-session/start-Umbau,
  GL1–GL5, **Kriterienliste v2**) + D10 (Sanierungs-Normen, Bauplan-2026-08-15-
  Archivierung) + D11 (Release-Runbook/Waypoints statt E7) + D12 (1b-Archiv-Satz,
  Kern-Bump) + D13 (doks-Governance) + D26 (Systemachsen-Port — Entscheid: portieren);
  J = D19–D23 (drei dev-Subagenten, W4, Anlageweg, CI-Kostenschnitt); K = D15–D18.
- Ketten-Zeilen in den lebenden Standardprozessen (Onsite-Muster, vertagt);
  `/nc:setup` um `kernRepoPfad`-Schreiben erweitern (bis dahin ruht D5, D4 nutzt die
  `kernSsotPfad`-Zweitquelle).
- **Onsite-Beobachtung ab `51e230f`** (D24-Liste: mneme-dreaming, ssot-krake,
  init-cli-bootstrap, nachzug-kadenz/executor-umbau, node-doks-Folgeplan,
  claude-ebenen-standards, dev-plugin-modernisierung, sanierung Phase 2).
- **Jira-Blöcke B/C zurückgestellt** (Maintainer-Weisung; Scratchpad existiert):
  B = Jira-Konzept NCOS (Leons 8-Epics-Gerüst vom 2026-08-17 einbeziehen;
  Onsite-Backlog-Extrakt im Journal 2026-08-24); C = EP-Umzug wegen
  `stud.hs-coburg.de`-Konten (Site-Frage klären).
- Alt-Stränge unverändert: reserve-Tags (E4) · Queue-Praxisprobe · GF3-Queue-Zeile ·
  @claude-Bot · Livetests · Ebene-0-Textentwurf · Remote-Branch phase-3 löschen ·
  nc-web-Bauplan.

## Zuletzt getroffene Entscheidungen

- Maintainer 2026-08-23: `.nc/`-Commit auf main „war Absicht" · finaler Umbau
  beauftragt, EN1–EN8 = Onsite-Parität · Waypoint-Arbeitsmodus sofort · Onsite immer
  live lesen · Jira zurückgestellt.
- Overseer (Nacht, dokumentiert in Mapping/CHANGELOG/PR-Bodies): Prod-SQL-Flag nicht
  portiert · psFlagActive nicht-falsy (NC-Härtung, Drift-Ritual) ·
  Lesekommando-Exemption deploy · kernSsotPfad-Zweitquelle für Zeiger · Ketten-Zeilen
  und Phase I vertagt (PR-Schnitt-Disziplin).

## Aktive Branches / PRs

- `feat/onsite-delta-phase-g` → **PR #22** (offen, CI grün).
- `feat/onsite-delta-phase-h` → **PR #23** (offen, stacked; lokal ausgecheckt).
- `main` @ `242b9e7`.

## Bekannte Risiken

- Stacked-PR-Reihenfolge (falsche Merge-Reihenfolge erzeugt Konflikte).
- Parallel-Sessions auf der Maschine (nie `git add -A`; Fremd-Commit-Vorfall 242b9e7).
- Onsite wandert weiter (Anker 51e230f, D24 beobachten).

## Nächster Schritt

- Maintainer: PRs #22/#23 reviewen/mergen (EN4-Abnahme). Danach Phase I als eigener
  Bauzyklus — Einstieg über das Mapping (N3) und `/nc:start`.
