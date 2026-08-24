---
name: wissen-aendern
description: >-
  Nennt die Knotendokumente der Wissensbasis des OS-Repos, die vor einer Änderung an Plugin,
  Skill, Hook, Marketplace, Manifest, CI, Vorlage oder Standardprozess zu lesen sind, und den
  Umfang der Nachzüge in derselben Änderung. Liefert Zeiger auf die Quellen, nie deren Inhalt,
  und führt keinen Nachzug selbst aus. Einschlägig, wenn eine Änderung am OS ansteht oder
  abgeschlossen wird — Fragen wie „was muss ich mitändern", „brauche ich einen Bump", „kommt
  das ins CHANGELOG", „gibt es dafür einen Standardprozess", „wie läuft ein Release".
  Trigger-Begriffe: Aktualisierungs-Index, Änderungs-Matrix, Nachzug, Doku-Sync,
  Sync-Nachzug, Version-Bump, CHANGELOG, Release-Tag, Standardprozess, Kern-Plugin-Bau,
  Abteilungs-Plugin-Bau, Subagenten-Bau, Queue-Flow, Anker-Reservierung, Plugin-Grenze.
  Nicht zuständig für laufende Vorhaben (Router wissen-planen), für die Frage, welches
  Dokument überhaupt existiert (Router wissen-nachschlagen), und für Fehler- oder
  Bug-Protokolle (Router wissen-protokolle).
---

# /nc:wissen-aendern — Router: was eine Änderung am OS alles anfasst

## Zweck

Der frühere `/nc:doku-sync` ist seit Kern 0.12.0 **ersatzlos entfallen** — seine
Rolle tragen dieser Router (Zeiger auf die Änderungs-Matrix) und der Prüfzyklus
(CI + Maintainer-Review am PR).

Wissens-Router der ständigen Abteilung `gemeinsam` (Kern-Plugin `nc`): macht die
**Knotendokumente** präsent, die den Umfang einer Änderung am OS bestimmen — die
Änderungs-Matrix und die Standardprozesse. Er ist die **Nachschlagestelle** für den
Änderungsumfang; das Nachziehen selbst tut die Arbeitseinheit, gebündelt am Zyklusende der
Subagent `sync-nachzug-executor`. Der Skill liefert **Zeiger, niemals Inhalt**: gelesen wird
die Quelle, nicht dieser Skill. Er greift vor jedem Bau-Schritt und vor dem Abschluss (WP1
bzw. WP8 des Rahmens `wp-rahmen.md` im Kern-Plugin `nc`).

## Ablauf

1. **Wissensbasis lokalisieren.** Der Skill läuft auch in fremden Arbeits-Repos, in denen die
   OS-Wissensbasis nicht existiert. Ihr Pfad steht in der Infra-Registry
   `~/.claude/nc/infra.json`: **zuerst** `kernRepoPfad` (Arbeitsklon des OS-Repos — aktueller
   Stand, Fixes sind committierbar; heute ein optionales Feld), **sonst** `kernSsotPfad`
   (Lesekopie, die `/nc:setup` anlegt). Fehlen beide Felder oder das Verzeichnis dahinter,
   wird das **ausdrücklich als Übergangs-Befund gemeldet** und `/nc:setup` als Reparaturweg
   genannt — nicht raten, keinen Pfad erfinden, nicht schweigen. **Die Platte ist die
   Wahrheit:** ein Registry-Pfad ohne Bestand dahinter gilt als fehlend.
2. **Reihenfolge einhalten.** Erst triagieren (Master-Index), dann Umfang bestimmen
   (Aktualisierungs-Index Abschnitt 2), dann bauen. Die Änderungs-Matrix wird **je
   zutreffender Zeile** gelesen; mehrere Zeilen dürfen gleichzeitig gelten, dann gilt ihre
   Vereinigung.
3. **Zeiger auswählen** aus der Tabelle unten — nur die Dokumente nennen, die zur konkreten
   Änderungsart gehören, statt die Liste vorzulesen.
4. **Lesen und belegen.** Die Quelle öffnen und die einschlägigen Zeilen zitieren; jede
   Nachzugs-Behauptung trägt ihre Fundstelle.
5. **Ergebnis übergeben:** eine Liste der Nachzüge, je Eintrag mit Fundstelle, plus die
   Mechanik-Spalte (Bump, Suite, Validierung, Protokoll-/Indexpflicht).

## Zeiger

Alle Pfade sind relativ zur Wissensbasis `knowledge-base/` des **OS-Repos**, sofern nicht als
Kern-Plugin-Datei gekennzeichnet.

| Quelle | Einschlägig wenn … |
|---|---|
| `standardprozesse/aktualisierungs-index.md` | **immer** — Abschnitt 1 Pflichtlektüre, Abschnitt 2 Änderungs-Matrix je Änderungsart (2.1 Plugin-Inhalt · 2.2 Wissensbasis und Doku · 2.3 Mechanik), Abschnitt 3 Version/Release/Tag, Abschnitt 4 Protokolle und Indizes, Abschnitt 5 Prüfzyklus, Abschnitt 6 Selbsttest |
| `standardprozesse/kern-plugin-bau.md` | am Kern-Plugin `nc` gebaut wird (Scope, Governance-Schichten, Doks-Autosync, Mindest-Client-Schwellen) |
| `standardprozesse/abteilungs-plugin-bau.md` | an einem Abteilungsplugin, an der Auslieferungsgrenze, am Marketplace, an einer Satelliten-Extraktion (§3a) oder an einem eigenständigen Kollegen-OS (§3b) gebaut wird |
| `standardprozesse/subagenten-bau.md` | ein Subagent angelegt oder geändert wird (Agent-vs-Skill, Werkzeuggrenzen, Gate-Semantik) |
| `standardprozesse/anker-reservierung.md` | parallel gearbeitet wird und ein knapper Anker (Ziel-Version, Skill-/Agent-/Hook-Name, Abteilungsname) vor Baubeginn zu vergeben ist |
| `standardprozesse/sync-nachzug-bauzyklus.md` | am Ende eines Bauzyklus die abgeleiteten Doku-Nachzüge anstehen oder Konfliktzonen für Parallelbau zu schneiden sind |
| `standardprozesse/queue-flow.md` | der Weg eines Wissensstücks in die Kern-SSOT gebraucht oder geändert wird |
| `standardprozesse/kriterien-pflege.md` | die Kriterienliste „firmenrelevant" geändert oder geschärft wird |
| `standardprozesse/ssot-aufbau.md` | eine Wissensbasis aufgebaut, erweitert oder an einen Satelliten vererbt wird |
| `standardprozesse/claude-netz-bau.md` | eine CLAUDE-Ebene, ihr Payload oder ihre Verdrahtung entsteht oder sich ändert |
| `standardprozesse/abteilungs-inhalts-pruefung.md` | die **Inhalte** eines Abteilungsplugins oder Satelliten wiederkehrend gegen die Normlage geprüft werden |
| `standardprozesse/team-distribution.md` | ein Stand ans Team gelangen soll (Marketplace, Pins, Update-Wege, Koexistenz) |
| `standardprozesse/os-bau-methode.md` | eine Methodenfrage zum Gesamtaufbau des OS ansteht |
| `referenz/skill-authoring.md` (Kern-Plugin `nc`) | eine `SKILL.md` entsteht oder sich ändert — Frontmatter-Constraints inklusive YAML-Falle |
| `referenz/agent-authoring.md` (Kern-Plugin `nc`) | eine Agenten-Datei entsteht oder sich ändert |
| `referenz/pflege-auspraegung.md` (Kern-Plugin `nc`) | Queue-Format, Kriterienliste oder die Ausprägungs-Felder einer Abteilung berührt sind |
| `module-registry.json` (Kern-Plugin `nc`) | zu klären ist, welche Abteilung, welches Modul, welcher Skill oder welcher Subagent überhaupt existiert — der Metadaten-Knoten der Produkt-Oberfläche |

## Regeln

- **Zeiger statt Inhalt.** Der Skill zitiert die Quellen nicht nach und fasst sie nicht
  zusammen — kopierter Inhalt wäre sofort Doppelpflege und driftet.
- **Der Router zieht nichts nach.** Er nennt die Matrix-Zeilen; das Schreiben tut die
  Arbeitseinheit, gebündelt am Zyklusende der Subagent `sync-nachzug-executor`.
- **Keine Aussage ohne gelesene Quelle.** Wer den Aktualisierungs-Index nennt, liest die
  zutreffende Zeile; „steht sicher drin" ist keine Auskunft.
- **Fehlende Registry wird benannt, nicht überspielt** — mit dem Verweis auf `/nc:setup`.
- **Rote Linien bleiben unberührt:** Der Skill liest nur. Commit, Push, PR-Erstellung, Merge,
  Tag/Release und alles Kundensichtbare führt er **nie** aus; das entscheidet der Mensch.
- **Version und CHANGELOG folgen der Matrix, nicht dem Gefühl.** Ob ein Bump fällig ist und
  in welcher Stelle, sagt Abschnitt 3 des Aktualisierungs-Index — wer danach gefragt wird,
  verweist dorthin, statt eine Nummer zu wählen.

## Verifikation

- Der genannte Wissensbasis-Pfad ist real: Existenz des Verzeichnisses geprüft, oder der
  Übergangs-Befund samt `/nc:setup`-Hinweis ist ausgegeben.
- Jede genannte Quelle wurde geöffnet; die einschlägige Zeile der Änderungs-Matrix ist
  zitiert (Abschnitt und Zeilentitel).
- Die Antwort enthält **keine** nacherzählten Regelinhalte ohne Fundstelle.
- Am Ende steht eine Liste der Nachzüge mit Fundstelle je Eintrag — nicht „vermutlich
  betroffen".
