# Offene-Stränge-Register

> **Zweck:** Jeder ausgelagerte, geplante oder delegierte Strang bekommt hier eine Zeile —
> kein PR, Bauplan, Praxistest oder vertagter Entscheid geht zwischen Sitzungen verloren.
> **Pflege:** append/update, nie delete; Erledigtes bekommt ein Erledigt-Datum und bleibt
> stehen. Detailwissen wohnt am Verbleib-Ort, das Register ist der Zeiger.

| Datum | Strang | Verbleib | Nächster Schritt | Status |
|---|---|---|---|---|
| 2026-08-16 | PR #20 — Phase 2 (Kern 0.9.0) | github.com/NovaCore-AI/NovaCoreAI-OS/pull/20 | Maintainer-Abnahme + Merge | offen |
| 2026-08-16 | Phase 3: Queue-Flow (AP-E1–E3, E1-Empfehlung a) + Development-Plugin (AP-F1–F2) | Bauplan 2026-08-15 §4 Phasen E/F | nach Merge PR #20 auf frischem Branch starten | offen |
| 2026-08-16 | Livetest `@sync-nachzug-executor` (T15-Negativprobe) + Reconciler/PreCompact-Livetests | Bauplan N6/N7, PR-#20-Kommentar | Maintainer führt Livetests | offen |
| 2026-08-16 | Schutzprobe `reserve/probe`-Tag | standardprozesse/anker-reservierung.md §5 | Push-Freigabe einholen (E4 vertagt), Probe fahren | offen |
| 2026-08-16 | Ebene-0-Textentwurf (Org-Instructions) | standardprozesse/team-distribution.md §2.1 | Maintainer-Freigabe, dann Workspace-Admin-Panel | offen |
| 2026-08-16 | Onsite-Upstream: PR #59/#60 (Subagenten-Norm) + #61/#62 (Metaflow) | Bauplan N7-Folge-Prüfpunkt | nach Onsite-Merge Endstand gegenlesen, Differenzen per Nachtrag | erledigt 2026-08-23 (aufgegangen im Delta-Mapping D11/D24; Nachfolger: Beobachtungsliste ab 51e230f) |
| 2026-08-16 | K3-Zweitreview Phase 2 | Kimi-Code (Moonshot-Quota 403 am 2026-08-16) | optional nach Quota-Refresh | offen |
| 2026-08-16 | `.nc/` in `.gitignore` aufnehmen | Vorschlag aus /nc:end-session | Zustimmung Maintainer, dann Eintrag | erledigt 2026-08-23 (GEGENTEILIG entschieden: Maintainer-Commit 242b9e7 trackt `.nc/` bewusst — EN1/D14-Vorwegnahme) |
| 2026-08-16 | @claude-GitHub-Bot ohne Reaktion (nie Aktivität im Repo) | PR #20 (Kommentar 23:04) | Installation der Claude-GitHub-App prüfen | offen |
| 2026-08-16 | Maintainer-Bauplan `nc-web` (Agent SDK & GUI) | grundwissen/2026-08-16-novacore-agent-sdk-gui-architektur.md (in PR #20) | eigener Bauzyklus nach Maintainer-Priorisierung | offen |
| 2026-08-16 | GLM-Hinweis: Phase-1-Nachzug README nie erfolgt (0.7.0-Drift, in PR #20 geheilt) | CHANGELOG-Phase-2-Eintrag | retrospektiv nichts offen — nur Merken für Executor-Checkliste | erledigt 2026-08-16 |
| 2026-08-16 | Phase 3 UNCOMMITTED auf feat/onsite-endstand-phase-3 — Restfixes+Review-R2+Commit/Push/PR offen | Projekt-Memory phase-3-uebergabe.md (Schrittliste) | Schritte 1–6 exakt abarbeiten | erledigt 2026-08-16 (PR #21 gemergt, 34b8c57 — Übergabe per Kimi K3 abgeschlossen) |
| 2026-08-16 | Remote-Branch `feat/onsite-endstand-phase-3` auf origin steht nach PR-#21-Merge noch | origin (GitHub) | Maintainer freigeben, dann `git push origin --delete` | offen |
| 2026-08-16 | E7: gesammeltes Release am Umbau-Ende (Tags, GitHub-Releases, CHANGELOG-Schnitt je Plugin) | Bauplan 2026-08-15 §7/N6; CHANGELOG [Unreleased]-Note | nach Ende aller Phasen: Bauplan-AP-Vollständigkeit prüfen, dann Release-Lauf | offen |
| 2026-08-16 | GF3-Queue-Zeile (erste echte) in kandidaten-queue/queue.md | knowledge-base/kandidaten-queue/queue.md | wartet auf Kern-Aufstiegslauf nach Merge | offen |
| 2026-08-16 | reserve-Tags nc-0.10.0 + nc-development-0.2.0 nachholen | anker-reservierung.md §2/§3 (E4 vertagt) | Einzel-Freigabe Maintainer, dann taggen+pushen | offen |
| 2026-08-16 | Queue-Praxisprobe: Dry-Run /nc:queue-kern | queue-flow.md §6 | nach Phase-3-Merge fahren, Befunde in Protokolle | offen |
| 2026-08-24 | PR #22 — Onsite-Delta Phase G (Kern 0.11.0, Kontroll-Schicht-Parität; EN4-Wortlaut-Abnahme Musterliste v1 = Merge) | github.com/NovaCore-AI/NovaCoreAI-OS/pull/22 | Maintainer-Review + Merge (VOR #23) | offen |
| 2026-08-24 | PR #23 — Onsite-Delta Phase H (Kern 0.12.0, SSOT-Präsenz; stacked auf #22) | github.com/NovaCore-AI/NovaCoreAI-OS/pull/23 | Maintainer-Review + Merge (NACH #22) | offen |
| 2026-08-24 | Onsite-Delta Phasen I/J/K (D10–D26-Rest: sitzungswissen/GL1–GL5/Kriterienliste v2, Sanierungs-Normen, Release-Runbook, vorlagen-Umzug, Systemachsen, dev-Subagenten, W4, Anlageweg, CI-Schnitt, Kleinteile) | grundwissen/2026-08-23-onsite-delta-mapping.md (N3) | Phase I als nächster Bauzyklus nach Merge #22/#23 | offen |
| 2026-08-24 | WZS-Muster fürs Safety-Gate (Deploy-/DB-/Webhook-Kommandos) benennen | nc-safety-gate.js Kopf (BEWUSSTE ABWEICHUNG) | Maintainer benennt reale Kommandos, dann Muster 4 | offen |
| 2026-08-24 | Knoten-Entscheid: module-registry.json Knoten oder Blatt | NovaCore-OS-Node-Doks-Definition.md (Bestandstabelle) | Maintainer-Entscheid; nur Tabellenzeile wandert | offen |
| 2026-08-24 | Ketten-Zeilen in allen lebenden Standardprozessen (Onsite-Muster) | Paket-C-Bericht Phase H | im Phase-I/J-Zyklus nachziehen | offen (vertagt) |
| 2026-08-24 | /nc:setup um kernRepoPfad-Schreiben erweitern (bis dahin ruht Pfad-Zeiger D5; Wissens-Zeiger nutzt kernSsotPfad) | skills/setup/infra-registry.md | kleiner Setup-Ausbau, eigener Vorgang | offen |
| 2026-08-24 | Onsite-Beobachtungsliste ab 51e230f (D24: mneme-dreaming, ssot-krake, init-cli, nachzug-kadenz/executor, node-doks-Folgeplan, ebenen-standards, dev-modernisierung, sanierung Ph. 2) | Mapping D24/N3 | beim nächsten Prüfpunkt gegenlesen | offen |
| 2026-08-24 | Jira Block B: Konzept OS-Produktentwicklung (NCOS; Leons 8-Epics-Gerüst 2026-08-17 einbeziehen; Onsite-Backlog-Extrakt im Journal 2026-08-24) | Journal 2026-08-24 + Maintainer-Scratchpad | nach dem Umbau wieder aufnehmen (Maintainer-Weisung) | offen (zurückgestellt) |
| 2026-08-24 | Jira Block C: EP-Umzug (Konten auf stud.hs-coburg.de) — Site-Frage neu/alt klären | novacore-ai.atlassian.net (EP=87, NC=32, NCOS=20 Vorgänge) | nach Block B | offen (zurückgestellt) |
