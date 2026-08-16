# Abteilungs-Inhalts-Prüfung — Standardprozess für Agenten

> **Verbindlich** vor jeder inhaltlichen Modernisierung, nach jedem Norm-Schub im Kern und vor
> jedem Team-Rollout eines Abteilungsplugins oder Kollegen-OS-Satelliten. Die **Inhalts-Schwester**
> der Struktur-Testsuite (`plugins/nc/tests/struktur.test.mjs`), die nur **Form** prüft (Manifeste,
> Namespaces, Frontmatter, Plugin-Grenze). Diese Prüfung prüft **Inhalt**: ob Skills, `workflow.md`,
> Abteilungs-CLAUDE, README und Referenzdateien noch der geltenden Normlage und den verifizierten
> Fachfakten entsprechen. **Read-only** — sie ändert nichts am geprüften Plugin; Fixes laufen über
> Bauplan und den regulären PR-Fluss der Bau-Prozesse (`kern-plugin-bau.md`,
> `abteilungs-plugin-bau.md`).
>
> **Weisungsquelle:** `firmenkernprozesse/prozesskarten/10-abteilungs-inhalts-pruefung.md`
> (Karte 10, Onsite-Vorbild) — hier auf NC-Verhältnisse gemappt. **Architektur nicht dupliziert:**
> Für die Unterscheidung repo-interne Abteilung (`nc-development`, mit Kern-Dependency) versus
> eigenständiges Kollegen-OS im Satelliten (`nc-felix`, `nc-biggi`, eigene Kontroll-Schicht unter
> `hooks/`, keine Kern-Dependency) gilt `abteilungs-plugin-bau.md` §1 / **§1a** (Auslieferungsgrenze)
> und **§3b** (Kollegen-OS) — dort nachlesen, nicht hier wiederholen. Onsite-Firmenspezifika
> (GitLab/Jira/isento-Bezüge, feste Spec-Randnummern) sind **bewusst nicht** übernommen: Normquellen
> sind ausschließlich NC-eigene Standardprozesse, Definitionsdokumente und `AGENTS.md`/`nc-sync.md`.

## 1. Zweck in einem Satz

Wiederkehrende, **belegbasierte** Prüfung, ob die Inhalte eines Abteilungsplugins oder
Kollegen-OS-Satelliten noch der geltenden Normlage und den verifizierten Fachfakten entsprechen —
in zwei unabhängigen Läufen, damit ein einzelner Blickwinkel nicht als Ergebnis durchgeht.

**Nicht dieser Prozess:** reines Struktur-/Form-Testen (dafür `struktur.test.mjs`); Schreiben am
Plugin während der Prüfung; Sofort-Fixes ohne Bauplan.

## 2. Wann anwenden — vier Trigger

| # | Trigger | Pflichtcharakter |
|---|---|---|
| 1 | Vor jeder **inhaltlichen Modernisierung** eines Abteilungsplugins oder Satelliten | Pflicht-Erstschritt |
| 2 | Nach **Norm-Schüben im Kern** (neue Spec-Nachträge, Ebene-1/1b-Änderungen, Bauplan-Entscheide mit Abteilungs-Pflichten) | Abteilungen/Satelliten erben nicht automatisch |
| 3 | Vor dem **Team-Rollout** eines Abteilungsplugins oder Satelliten | Freigabe-Vorbereitung |
| 4 | Als **Zwilling** für jede weitere Abteilung oder jeden weiteren Satelliten | Derselbe Prozess, keine Neuerfindung je Fall |

## 3. Ablauf — zwei unabhängige Läufe, dann Synthese

Beide Läufe laufen **unabhängig** (getrennte Agenten oder getrennte Sitzungen/Blickwinkel). Erst
die Synthese deckt Widersprüche zwischen Soll-Herleitung und Ist-Befund auf — führt ein einzelner
Agent beide Läufe „im Kopf" zusammen, geht genau diese Gegenprobe verloren.

| Schritt | Name | Kern |
|---|---|---|
| 1 | Soll-Anforderungsregister | Normquellen aus §4; je Anforderung ein **Beleg** (`Datei:Abschnitt/§`), Zuordnung zum Prüfungsgegenstand, Typ (`Fakt-Korrektur` / `Norm-Pflicht` / `Kommende Änderung`) |
| 2 | Ist-Inventur | Alle Plugin-/Satelliten-Artefakte gegen die 12-Punkte-Checkliste (§5); Fundstellen **zitieren**, nicht paraphrasieren |
| 3 | Drift-Matrix | Je Artefakt Kategorie + Schwere (§6); nur reale Befunde — keine aufgefüllten Top-Listen; Positiv-Befunde („besser als angenommen") gehören ebenfalls hinein, sie korrigieren die Aufgabenprämisse |
| 4 | Synthese in Bauplan | Sofort-Fixes vs. **Kommende Änderungen** mit benannter Abhängigkeit (§7); Anker-Bedarf prüfen (§7) |
| 5 | Persistenz (Pflicht) | Rohdaten (Soll-Register + Drift-Matrix) als **Bauplan-Anhänge in der SSOT** — Session-Output ist kein Aufbewahrungsort (§7) |

Fehlt ein Beleg oder eine Fundstelle, ist der Punkt **offen** — nicht still als `OK` verbuchen.

## 4. Soll-Anforderungsregister — Normquellen (NC-gemappt)

| # | Normquelle | Liefert | Hinweis |
|---|---|---|---|
| 1 | `plugins/nc/nc-sync.md` (Ebene 1b) | Prozesse, Methodik, Sprachregeln, Rangfolge | NC-Pendant zu Onsites `oai-teamsync.md` |
| 2 | `plugins/nc/doks/global-claude-firmenblock.md` (Ebene 1) | Rote Linien, Freigabe, Konfliktordnung | Abteilung/Satellit: Kurzverweis + Ownership, **kein** Duplikat |
| 3 | Der zum Prüfungsgegenstand **einschlägige** Bauplan/Design-Spec in `grundwissen/` | Verifizierte Fachfakten des Arbeits-Repos | NovaCore führt **keine** Einzel-Spec mit Fußzeilenkette wie Onsite — das jüngste einschlägige, datierte Dokument ist die Quelle |
| 4 | Nachträge desselben Bauplans mit Abteilungs-/Satelliten-Pflichten | Pflichten seit dem letzten Prüflauf | z. B. §10/§11 der Multi-Plugin-Architektur-Design (Felix/Biggi) oder Phase F des Onsite-Endstand-Nachbau-Bauplans (`nc-development`) |
| 5 | `plugins/nc/module-registry.json` + `vorlagen/abteilungsplugin/VORLAGE.md` (repo-intern) bzw. eigene `module-registry.json` des Satelliten (`abteilungs-plugin-bau.md` §3b) | Schema, Status, Kriterien der Abteilungs-/Modul-Metadaten | **Normquelle für Abteilungen mit Kern-Dependency:** `plugins/nc/referenz/pflege-auspraegung.md` (seit AP-E1 gebaut) — Schema v1 der `pflege-auspraegung.json`, Auflösungsregel, Queue-Format v1 und Kriterienliste v1 samt Prüfliste. Für eigenständige Kollegen-OS-Satelliten gilt sie **nicht** (terminal, Entscheid E1 / Invariante I8) |
| 6 | Beschlusslage laufender Baupläne (`grundwissen/`, jüngste zuerst) | Queue-Flow, Subagenten, sonstige laufende Entscheide | **Kommende Änderung** mit Abhängigkeit — nie Sofort-Fix |
| 7 | `plugins/nc/wp-rahmen.md` | WP-Pflichten der `workflow.md` | |
| 8 | `plugins/nc/referenz/skill-authoring.md` | Formatregeln für Skills | |
| 9 | Offene Punkte der Abteilung/des Satelliten | Aufträge mit Verbleib, nicht bloß Ideen | repo-intern (`nc-development`): jüngster einschlägiger Bauplan bzw. CHANGELOG-Unreleased-Abschnitt · Kollegen-OS-Satellit: eigene Sitzungswissen-Residenz (`stand.md`/Journal aus dessen `save-session`/`start`-Skills) |
| 10 | `standardprozesse/abteilungs-plugin-bau.md` | Satelliten-Pflichten (Bump/Tag/Release/Umpinnen/CI), §1a Auslieferungsgrenze, §3b Kollegen-OS | Verweis, **keine** Duplizierung |

Typ `Kommende Änderung` (Quelle 6 u. a.) füllt die Drift-Matrix, nicht die Sofort-Fix-Liste.

## 5. Ist-Inventur — die zwölf Prüfpunkte

| # | Prüfpunkt |
|---|---|
| 1 | Konnektoren zu externen Systemen: zentral im Kern `nc` vs. lokal in Abteilung/Satellit — gegen den aktuellen Bauplan- und Registry-Stand, nicht gegen eine feste Spec-Randnummer |
| 2 | Reale Prozessketten (Review-/QS-/Abnahme-Ablauf der Abteilungs-Skills, z. B. `be-review`/`fe-review`); Rollen als **Besetzung**, nie Namen |
| 3 | Sprach-/Formatregeln für Text-Entwürfe — NC-Grundregel „alle Artefakte Deutsch" (`nc-sync.md`, Kopf); Abweichungen je Fremdsystem nur benennen, sofern belegt |
| 4 | Fremdsystem-Fakten der Abteilung gegen die Quellen-Hierarchie (Quelle vor Gedächtnis, `nc-sync.md` §2.1) |
| 5 | Rote Linien: Kurzverweis auf Normquelle (`global-claude-firmenblock.md`) statt Duplikat; Ownership je Skill klar |
| 6 | SSOT-Anbindung: Pfade gegen `SSOT-Document-Index.md` (Teil 1/2) statt geraten; Sitzungswissen-Residenz korrekt (`.nc/erinnerung/` des Arbeits-Repos bzw. eigene Wissensbasis des Satelliten, `ssot-aufbau.md` §4); Registry-Eintrag (`module-registry.json`) stimmig |
| 7 | Verweise auf Kern-Skills: Umbenennungen/Entfernungen nachgezogen; Kommendes nur als Merker |
| 8 | `workflow.md`: Trigger-Matrix vollständig, WP-Mapping konsistent mit `wp-rahmen.md`, SSOT-Abschnitt korrekt |
| 9 | Offene Punkte der Abteilung/des Satelliten (§4, Quelle 9): umgesetzt oder bestätigt fehlend? |
| 10 | Referenzdateien: Frische-Marker, keine Duplikation mit kommenden Agenten/Artefakten (z. B. `referenz/agent-authoring.md`, sobald gebaut) |
| 11 | Formales: Frontmatter/YAML-Fallen, Namensregeln, Längen — gegen `plugins/nc/tests/struktur.test.mjs` gegenprüfen, nicht neu erfinden |
| 12 | Team-Onboarding: README der Abteilung/des Satelliten mit Installation, verständlich für Erstkontakt |

Fehlt an einem Punkt der Beleg, ist er **offen**, nicht `OK`.

## 6. Drift-Matrix — Kategorien und Schwere

| Kategorie | Bedeutung |
|---|---|
| `STALE-FAKT` | Inhalt widerspricht verifiziertem Fachfakt |
| `NORM-DRIFT` | Inhalt weicht von geltender Norm ab |
| `FEHLT` | Geforderter Inhalt/Artefakt-Bezug fehlt |
| `KOMMEND` | Noch nicht fällig; Abhängigkeit benennen |
| `OK` | Entspricht Soll (auch Positiv-Befunde) |

Schwere: `HOCH` / `MITTEL` / `NIEDRIG`. Keine aufgefüllten Top-Listen — nur reale Befunde.

## 7. Synthese: Bauplan, Anker-Bedarf, Persistenz-Pflicht

Die Synthese trennt zwei Klassen von Befunden:

- **Sofort-Fixes** — eigene Session, eigener Bump, regulärer PR-Fluss über den zuständigen
  Bau-Prozess (`kern-plugin-bau.md` bzw. `abteilungs-plugin-bau.md`).
- **Kommende Änderungen** — nur als **Merker mit benannter Abhängigkeit** („nach Merge von X"),
  **nie** als Sofort-Fix. Maintainer-Fragen dazu im Bauplan-üblichen Muster stellen.

**Anker-Bedarf prüfen:** Verlangt die Synthese eine reservierbare Bezeichnung (Spec-Abschnitt,
Zielversion, Skill-/Agent-/Hook-Name) und arbeiten mehr als eine Einheit gleichzeitig am OS, gilt
`standardprozesse/anker-reservierung.md` — dieser Standardprozess entsteht parallel zu diesem
Dokument (Bauplan 2026-08-15, AP-C2); der Verweis wird **hier trotzdem gesetzt**, unabhängig davon,
ob die Datei zum Zeitpunkt des Lesens bereits existiert.

**Persistenz-Pflicht:** Die Rohdaten beider Läufe (vollständiges Soll-Register, vollständige
Drift-Matrix) werden als **Anhänge am zugehörigen Bauplan in `grundwissen/`** abgelegt — niemals
nur im Session-Output belassen. Methoden-Abweichungen von diesem Prozess selbst werden in dieser
Quelldatei nachgezogen, nicht stillschweigend nur im Bauplan vermerkt.

## 8. Regeln und Kopplung

1. **Zwei unabhängige Läufe, dann Synthese** — kein Einzelagent führt beide Perspektiven allein.
2. **Read-only** — die Prüfung ändert nichts am geprüften Plugin/Satelliten; Fixes laufen
   ausschließlich über Bauplan und regulären PR-Fluss.
3. **Quellen-Hierarchie:** Widerspruch Normquelle ↔ Plugin-Text → die Normquelle gewinnt.
   Widersprüche zwischen Doku-Ebenen werden **upstream** korrigiert, nicht im geprüften Artefakt
   umgangen.
4. **Kommende Änderungen** ausschließlich als Merker mit benannter Abhängigkeit (§7).
5. **Anker-Bedarf** ist Pflichtprüfpunkt der Synthese, kein optionaler Zusatz (§7).

**Nie angefasst:** das geprüfte Abteilungsplugin oder der Satellit selbst; der Session-Chat als
Aufbewahrungsort der Rohdaten.

**Kopplung:** Normquelle 10 und der Fix-Pfad laufen über `abteilungs-plugin-bau.md`. Anker-Bedarf
läuft über `anker-reservierung.md` (§7). Schwester-Prozess: `struktur.test.mjs` (Form statt
Inhalt).

## 9. Erster geplanter Anwendungsfall

`nc-development` — **vor** der Phase-3-Modernisierung: Laut Bauplan
`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md` prüft **AP-F1** die Inhalte von
`nc-development` nach genau diesem Prozess (Soll-Register aus den gemappten Normquellen,
Ist-Inventur, Synthese-Bauplan), **bevor** **AP-F2** auf Basis des AP-F1-Befunds modernisiert
(fehlende Module generisch gemappt, ohne Onsite-Firmenspezifika). Beide Arbeitspakete liegen in
„Phase 3 — Queue-Flow & Development-Plugin" derselben Bauplan-Tabelle.

## Anhang — Dateizeiger

| Zeiger | Pfad/Bezug |
|---|---|
| Weisungsquelle (Karte 10, Onsite-Vorbild) | `firmenkernprozesse/prozesskarten/10-abteilungs-inhalts-pruefung.md` |
| Bau-Prozesse (Fix-Pfad, §1a/§3b) | `standardprozesse/abteilungs-plugin-bau.md` · `standardprozesse/kern-plugin-bau.md` |
| Anker-Bedarf | `standardprozesse/anker-reservierung.md` (entsteht parallel) |
| SSOT-Struktur der Satelliten | `standardprozesse/ssot-aufbau.md` §4 |
| Gebündelter Doku-Nachzug | `standardprozesse/sync-nachzug-bauzyklus.md` |
| Struktur-Schwester (Form statt Inhalt) | `plugins/nc/tests/struktur.test.mjs` |
| Erstanwendungs-Bauplan | `grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md` (AP-C4, AP-F1, AP-F2) |

---

*Angelegt 2026-08-15 durch Claude (Sonnet 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`, AP-C4). Weisungsquelle:
`firmenkernprozesse/prozesskarten/10-abteilungs-inhalts-pruefung.md` (Onsite-Vorbild, Karte 10),
auf NC-Verhältnisse gemappt (oai→nc; repo-interne Abteilung `nc-development` vs.
Kollegen-OS-Satelliten mit eigener Kontroll-Schicht). Onsite-Firmenspezifika (GitLab/Jira/isento,
feste Spec-Randnummern) bewusst nicht übernommen — Normquellen sind ausschließlich NC-eigene
Standardprozesse, Definitionsdokumente und `nc-sync.md`/`AGENTS.md`.*
