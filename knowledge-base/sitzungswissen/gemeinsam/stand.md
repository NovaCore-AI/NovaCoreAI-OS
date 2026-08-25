# Stand (konsolidiert) — 2026-08-25, 01:5x nach der Nachtschicht (Phase I)

## Aktueller Arbeitsstand

- **Der Onsite-Delta-Umbau ist bis Phase I gebaut.** Rahmenplan:
  `knowledge-base/aktive-bauplaene/2026-08-23-onsite-delta-mapping.md` (Nachträge N1–**N4**),
  Anker jetzt Onsite `origin/main@2530ced` / Kern **0.26.0**. Phasen G, H und I sind fertig;
  **J und K stehen aus**.
- **Phase I → PR #25** (`feat/onsite-delta-phase-i`, Kern **0.13.0**), offen und `MERGEABLE`,
  **10/10 CI-Checks grün**, Suite 312 → **315**. Fünf Bau-Commits: I-A Fugen · I-B Umzug ·
  I-C Mechanik · Nachzug + Bump · Waypoint-Schnitt — dazu Abschluss- und Nachpflege-Commits
  (Session-Abschluss, `.nc/`-Fix, Follow-up-Iteration Punkte 3–7).
- **Zwei neue Kategorien in der Wissensbasis:** `aktive-bauplaene/` (laufende Pläne;
  `grundwissen/` trägt nur noch dauerhafte Referenzen und Design-Specs) und `sitzungswissen/`
  (dieses Dokument liegt darin). `vorlagen/` ist von der Repo-Wurzel nach
  `standardprozesse/vorlagen/` gezogen — als Unterordner, nicht als Kategorie.
- **Das Buchführungsmodell hat gewechselt:** Aktualisierungs-Index §0 (Zwei-Klassen: Produkt-
  vs. Wissensklasse) und §3.6 (Release-Zug, acht Schritte, nur auf Maintainer-Kommando). Im
  Arbeitsstrang wird **nie** gebumpt, `[Unreleased]` bleibt leer.

## Offene Punkte

- **Abnahme-Vorbehalt S1:** Merge von PR #25 = **Wortlaut-Abnahme** der Kriterienliste v2 und
  GL1–GL5. Wer den Wortlaut ändern will, tut das vor dem Merge.
- **`referenz/`-Review (P-E5):** Je Datei existiert ein dokumentierter Review-Vorgang
  (PR #3 Kimi, #20 Kette N1, #21 zwei GLM-Runden), aber alle drei stehen auf
  `REVIEW_REQUIRED` mit **null** aufgezeichneten Reviews. Maintainer-Entscheid nötig.
- **Jira-Ablageort — ENTschieden (2026-08-25):** `.nc/` ist strikt nach Onsite **kein
  Ablageort, keine Ausnahme**; der `git add -f`-Ausweg ist ersatzlos entfernt. Die lokalen
  Jira-Funde (`.nc/jira-migration/`, `.nc/erinnerung/jira-rest-zugang.md`) bleiben
  unangetastete Scratchpad-Funde (D27); ihre Heimat entscheidet sich mit D29
  (`jira-workflow.md`, Phase J/K) — offener Strang im Register.
- **Achse 2 ohne Maintenance-Skill:** Onsites „CLAUDE-Netz-Aktualisierer" ist bei uns weder
  gebaut noch beschlossen; die Rolle trägt heute `/nc:setup`. **Maintainer (2026-08-25):** Task
  folgt — Anlage später per Jira-REST als Follow-up, bis dahin Desktop-To-do.
- **Phase J** (D19 Subagenten, D20 Hook-Norm W4, D21 Anlageweg, D22 CI-Kostenschnitt, D23
  Prozessteil, dazu **D28/D29/D30** aus N4) und **Phase K** (D16, D17) stehen aus.

## Zuletzt getroffene Entscheidungen

- **P-E1–P-E9** (2026-08-24) sind in Phase I vollständig ausgeführt.
- **PR-#25-Follow-ups beantwortet (Maintainer, 2026-08-25):** `nc-development`-Modernisierungsplan
  archiviert (sechs §3-Merker ins Register überführt) · **Leitplanken der Ebene 0 wohnen als
  Systemprompt fürs Team in der Claude Desktop App** — kein repo-seitiger Ausbau, SSOT-Index-Kopf
  umgestellt · Achse-2-Task kommt später per Jira-REST, bis dahin Desktop-To-do ·
  T19-Größendeckel-Follow-up existiert bereits · Punkt-7-Posten bleiben bis zur gemeinsamen
  Durchsprache nach PR-Abnahme liegen.
- **A8 aufgeteilt:** permissive Testausnahmen nach I-A, strukturfordernde Invarianten mit dem
  Umzug in I-B — sonst wäre kein Commit einzeln grün gewesen.
- **T19 nicht erzwungen:** Der Router-Kontext-Deckel misst die Summe der
  `wissen-*`-Descriptions, nicht einen Skill-Rumpf; er wurde nicht auf eine Datei angewandt,
  für die er nie galt.
- **Die frozen v0.1.0-Spec bleibt unangetastet** — „Historisch bleibt historisch" schlägt die
  neue Spec-Governance; die Begründung steht im SSOT-Index, damit sie niemand als Drift meldet.

## Aktive Branches und offene Pull Requests

- `feat/onsite-delta-phase-i` → **PR #25**, offen, MERGEABLE, CI grün, **nicht gemergt**.
- `main` steht auf `cab9f88` (Kern 0.12.0); PR #22, #23 und #24 sind gemergt und im Register
  als erledigt geführt.

## Bekannte Risiken

- **BREAKING, teamweit:** Sobald 0.13.0 ausgeliefert ist, legen `/nc:start` und
  `/nc:end-session` in fremden Arbeits-Repos **nichts** mehr an — das Projekt-Memory trägt
  allein. Ein `.nc/erinnerung/`-Altbestand wird **gemeldet**, nicht gelesen.
- Der Tag `nc--v0.13.0` fehlt noch und gehört **hinter** den Merge. Die Release-Tag-Invariante
  ist grün, weil die jüngste CHANGELOG-Version bewusst ausgenommen ist — nach dem nächsten
  Schnitt ohne Tag würde sie rot.
- Die Queue-Praxisprobe steht weiterhin aus (kein Abteilungs-Satellit).

## Nächster Schritt

**Maintainer:** PR #25 lesen, die letzte offene Frage im PR-Body beantworten (`referenz/`-
Approval, Punkt 1), mergen und `nc--v0.13.0` annotiert taggen (Merge = Wortlaut-Abnahme S1).
**Danach** Phase J auf frischem Branch — sie ist von G–I unabhängig und parallelisierbar — und
die gemeinsame Durchsprache der Punkt-7-Posten.
