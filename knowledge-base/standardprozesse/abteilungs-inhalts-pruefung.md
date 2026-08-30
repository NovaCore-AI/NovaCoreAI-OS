# Standardprozess: Abteilungs-Inhalts-Prüfung (Soll-Register + Ist-Inventur + Drift-Matrix)

> **Zweck:** Wiederkehrende, belegbare Prüfung, ob die **Inhalte** eines Abteilungsplugins
> (Skills, `workflow.md`, Abteilungs-CLAUDE, Pflege-Ausprägung, README, Referenzdateien)
> noch der geltenden Normlage und den verifizierten Fachfakten entsprechen — die
> Inhalts-Schwester der Struktur-Testsuite, die nur Form prüft.
> **Herkunft:** Erstanwendung 2026-08-14 auf `oai-development` (Bauplan
> `Aktive Baupläne/2026-08-14-dev-plugin-inhalts-modernisierung.md`, Anhänge A/B =
> Volldaten der Erstanwendung). Persistiert auf Maintainer-Weisung 2026-08-14.
> **Kette:** Norm-Schub im Kern / geplante Abteilungs-Modernisierung → **dieser Prozess** → Bauplan, Fixes über `abteilungs-plugin-bau.md`

## Wann anwenden

- Vor jeder inhaltlichen Modernisierung eines Abteilungsplugins (Pflicht-Erstschritt).
- Nach Norm-Schüben im Kern (neue Spec-Nachträge, geänderte Ebene-1/1b-Payloads,
  neue Queue-/Prozess-Beschlüsse) — die Abteilungen erben die Änderungen nicht automatisch.
- Vor dem Team-Rollout eines Abteilungsplugins.
- Als Zwilling für weitere Abteilungen: `controlling`/`marketing` laufen gegen denselben Prozess.

## Methode (zwei unabhängige Läufe, dann Synthese)

**Schritt 1 — Soll-Anforderungsregister** aus den Normquellen; je Anforderung ein Beleg
(`Datei:Abschnitt/§`), Zuordnung (welches Abteilungs-Artefakt) und Typ
(`Fakt-Korrektur / Norm-Pflicht / Kommende Änderung`):

1. `plugins/oai/doks/oai-teamsync.md` (Ebene 1b) — Prozesse, Rollen, Sprachregeln, Rangfolge
2. `plugins/oai/doks/global-claude-firmenblock.md` (Ebene 1) — rote Linien, Freigabe-Regel,
   Konfliktordnung (Abteilung führt nur Kurzverweis + domänenspezifische Ownership)
3. Design-Spec §4/§5 — verifizierte Fachfakten des Arbeits-Repos
4. Jüngste Spec-Nachträge mit Abteilungs-Pflichten (Stand 2026-08-14: §15.29–§15.33)
5. `plugins/oai/referenz/pflege-auspraegung.md` — Schema, Queue-Format, Kriterien
6. Beschlusslage laufender Baupläne (Queue-Flow, Subagenten, …) — als **Kommende Änderung**
   mit benannter Abhängigkeit führen, nie als Sofort-Fix
7. `plugins/oai/wp-rahmen.md` — WP-Pflichten der `workflow.md`
8. `plugins/oai/referenz/skill-authoring.md` — Formatregeln
9. Offene-Stränge-Register — Aufträge mit Verbleib in der Abteilung
10. `abteilungs-plugin-bau.md` — Satelliten-Pflichten (Bump/Tag/Release/Umpinnen/CI)

**Schritt 2 — Ist-Inventur** über ALLE Artefakte des Plugins gegen die
**12-Punkte-Checkliste** (je Punkt Fundstellen zitieren, nicht paraphrasieren):

1. Beschaffungswege externer Systeme (Konnektoren zentral vs. lokal — Stand §15.11 ff.)
2. Reale Prozessketten (Review-/QS-/Abnahme-Sequenz; Rollen als Besetzung, nie Namen)
3. Sprach-/Formatregeln für Text-Entwürfe (aktuell: Jira deutsch, GitLab englisch)
4. Fremdsystem-Fakten (TRYB u. ä.) gegen die Quellen-Rangfolge
5. Rote Linien: Kurzverweis auf die Normativ-Quelle statt Duplikat; Ownership je Skill
6. SSOT-Anbindung: Queue-Pfad, Sitzungswissen-Residenz, Infra-Registry statt geratener Pfade
7. Verweise auf Kern-Skills (Umbenennungen/Entfernungen; Kommendes als Merker führen)
8. `workflow.md`: Trigger-Matrix vollständig, WP-Mapping konsistent, SSOT-Abschnitt korrekt
9. Offene Register-Aufträge der Abteilung: umgesetzt oder bestätigt fehlend?
10. Referenzdateien: Frische-Marker, keine Duplikation mit kommenden Agenten/Artefakten
11. Formales: Frontmatter/YAML-Falle, Namensregeln, Längen (testerzwungen gegenprüfen)
12. Team-Onboarding-Tauglichkeit: README mit Installation, verständlich für Erstkontakt

**Schritt 3 — Drift-Matrix:** je Artefakt Befunde mit Kategorie
`STALE-FAKT / NORM-DRIFT / FEHLT / KOMMEND / OK` + Schwere `HOCH/MITTEL/NIEDRIG`.
Keine aufgefüllten Top-Listen — nur reale Befunde zählen. Positiv-Befunde („besser als
angenommen") ausdrücklich festhalten: sie korrigieren die Aufgabenprämisse.

**Schritt 4 — Synthese in einen Bauplan:** Sofort-Fixes (eigene Session, Bump) getrennt von
**Kommenden Änderungen** (Merker mit Abhängigkeit „nach Merge von X"), plus offene
Maintainer-Fragen im §5-Muster.

**Schritt 5 — Persistenz (Pflicht):** Methoden-Abweichungen hier nachziehen; die Volldaten
(Soll-Register + Drift-Matrix) als Anhänge des Bauplans in die SSOT — Session-Output ist
kein Aufbewahrungsort.

## Regeln

- Beide Läufe unabhängig voneinander (getrennte Agenten/Blickwinkel) — die Synthese deckt
  Widersprüche zwischen Soll-Herleitung und Ist-Befund auf.
- Read-only: Die Prüfung ändert nichts; Fixes laufen über Bauplan + regulären PR-Fluss.
- Quellen-Hierarchie gilt: Bei Widerspruch zwischen Normquelle und Plugin-Text gewinnt die
  Quelle; Widersprüche zwischen Doku-Ebenen werden upstream korrigiert, nicht umgangen.

---

*Angelegt 2026-08-14 von Claude „Saga" (Fable 5) auf Maintainer-Weisung (Lucas Vöhringer),
nach der Erstanwendung auf `oai-development` v0.11.0. Lebendes Dokument — Änderungen an der
Methode werden hier nachgezogen; die Erstanwendungs-Daten bleiben im Bauplan-Anhang.*
