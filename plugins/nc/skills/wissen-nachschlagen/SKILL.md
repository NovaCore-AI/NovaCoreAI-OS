---
name: wissen-nachschlagen
description: >-
  Nennt den Einstieg in die Wissensbasis des OS-Repos, wenn unklar ist, welches Dokument zu
  einem Thema existiert — Master-Index mit Ordner-Routing und Quellen-Triage, Einstiegs-Karte
  und Repo-Karte, Produktarchitektur, die datierten Design-Specs und die normativen
  Begriffsdokumente zu SSOT, Node-Doks, Gates, CLAUDE-Ebenen, Kriterienliste und Ankern.
  Liefert Zeiger auf die Quellen, nie deren Inhalt. Einschlägig bei Fragen wie „gibt es dazu
  ein Dokument", „wo steht das", „wie ist der gebaute Ist-Stand", „was bedeutet dieser
  Begriff", „wohin gehört eine neue Wissensdatei", „was sagt die Spec dazu". Trigger-Begriffe:
  SSOT-Document-Index, Master-Index, Design-Spec, Spec-Nachtrag, Begriffsdefinition,
  Node-Doks, Knotendokument, Wissensbasis, Ordner-Routing, Quellen-Triage, Repo-Karte,
  Ist-Stand, Produktarchitektur, Quellen-Hierarchie, Beleg. Nicht zuständig für den Umfang
  einer Änderung (Router wissen-aendern), für laufende Vorhaben (Router wissen-planen) und für
  die Protokolle (Router wissen-protokolle).
---

# /nc:wissen-nachschlagen — Router: welches Dokument gibt es dazu

## Zweck

Wissens-Router der ständigen Abteilung `gemeinsam` (Kern-Plugin `nc`): die Eingangstür zur
Wissensbasis, wenn nicht die Antwort, sondern **die Quelle** gesucht wird. Er nennt den
Master-Index als Triage-Einstieg, die Einstiegs-Karte des Repos, die normativen
Grunddokumente und die Begriffsquellen — und liefert **Zeiger, niemals Inhalt**. Er greift bei
WP0 des Rahmens `wp-rahmen.md` im Kern-Plugin `nc` und immer dann, wenn eine Behauptung einen
Beleg braucht.

## Ablauf

1. **Wissensbasis lokalisieren.** Der Skill läuft auch in fremden Arbeits-Repos, in denen die
   OS-Wissensbasis nicht existiert. Ihr Pfad steht in der Infra-Registry
   `~/.claude/nc/infra.json`: **zuerst** `kernRepoPfad` (Arbeitsklon des OS-Repos — aktueller
   Stand; heute ein optionales Feld), **sonst** `kernSsotPfad` (Lesekopie, die `/nc:setup`
   anlegt). Fehlen beide Felder oder das Verzeichnis dahinter, wird das **ausdrücklich als
   Übergangs-Befund gemeldet** und `/nc:setup` als Reparaturweg genannt — nicht raten, keinen
   Pfad erfinden, nicht schweigen.
2. **Im Master-Index triagieren statt Volltexte lesen.** Teil 1 beantwortet „wohin gehört ein
   Dokument", Teil 2 nennt je Quelle den Status (`lebend`/`historisch`) und die
   Abruf-Situation in der Spalte „Relevant wenn …".
3. **Die passende Quelle öffnen** und die einschlägigen Abschnitte lesen — Titel allein
   entscheiden nicht.
4. **Quellen-Hierarchie beachten,** wenn Quellen einander widersprechen: jüngste Design-Spec
   bzw. jüngster Bauplan (mit allen Nachträgen) → Standardprozesse → Produktvision. Bei
   Widerspruch zwischen Doku und realer Struktur gilt die **Platte**; danach wird die Doku
   korrigiert.
5. **Ergebnis übergeben:** Fundstelle mit Pfad und Abschnitt, plus eine ausdrückliche
   Wissenslücken-Zeile für alles, wozu die Wissensbasis nichts hergibt.

## Zeiger

Pfade der Wissensbasis sind relativ zu `knowledge-base/` des **OS-Repos**; die übrigen
Angaben nennen eine Datei an der Repo-Wurzel bzw. im Kern-Plugin.

| Quelle | Einschlägig wenn … |
|---|---|
| `SSOT-Document-Index.md` | **immer zuerst** — Master-Index aller Dokumente und Ordner: Teil 1 Ordner-Routing, Teil 2 Quellen-Triage nach „Relevant wenn …" |
| `AGENTS.md` (Repo-Wurzel des OS-Repos) | der Einstieg, die Repo-Karte, das Kategorien-Glossar, die Quellen-Hierarchie oder die verbindlichen Konventionen gebraucht werden |
| `CHANGELOG.md` (Repo-Wurzel des OS-Repos) | der **gebaute Ist-Stand** gebraucht wird — autoritativ für „was ist gebaut, was fehlt"; NovaCore führt kein Betriebshandbuch |
| `module-registry.json` (Kern-Plugin `nc`) | zu klären ist, welche Abteilungen, Module, Skills und Subagenten existieren und wo sie liegen — Metadaten-Knoten der Produkt-Oberfläche |
| `grundwissen/` (Dateien mit Datumspräfix) | eine Design- oder Architekturentscheidung belegt werden muss — der jüngste Bauplan samt Nachträgen ist der Planungsstand; Änderungen entstehen **nur per Nachtrag** |
| `grundwissen/NovaCore-OS-Produktarchitektur.md` | die sechs Schichten der Produktvision erklärt oder gegen einen Plan gehalten werden |
| `grundwissen/NovaCore-OS-SSOT-Definition.md` | der Begriff „SSOT" erklärt, abgegrenzt oder referenziert wird — inklusive der Abgrenzung firmenintern ↔ affiliate |
| `grundwissen/NovaCore-OS-Node-Doks-Definition.md` | die **Knotendokumente** erklärt, abgegrenzt oder aufgezählt werden: die Knoten mit Pfad und Geltungsbereich, „auf Knoten zeigen, nie Inhalt liefern" |
| `grundwissen/NovaCore-OS-Gates-Definition.md` | die Gates der Kontroll-Schicht erklärt oder abgegrenzt werden |
| `grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md` | die CLAUDE-Ebenen samt Träger, Update-Kanal und Präzedenzregel erklärt oder abgegrenzt werden |
| `grundwissen/NovaCore-OS-Kriterienliste-Definition.md` | zu entscheiden ist, ob ein Sitzungsergebnis firmenrelevant ist, und warum es diesen Filter gibt |
| `grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md` | begründet werden soll, warum knappe Bezeichner vor dem Bau reserviert werden |
| `firmenkernprozesse/` | der Stand des **Vorbild-Systems** oder der Firmenebene abgeglichen wird — extern geführt, **nicht** normativ für dieses Repo |

## Regeln

- **Zeiger statt Inhalt.** Der Skill nennt Quellen und Abschnitte; er kopiert keinen Quelltext
  in seinen Body und erfindet keine Zusammenfassung.
- **Keine Antwort ohne Fundstelle.** Was ohne Beleg wäre, gehört in die Wissenslücken-Zeile.
- **Interne Wissensbasis, nicht das Firmenarchiv.** Externe Firmenquellen (Ticket- und
  Wiki-Systeme) deckt dieser Router **nicht** ab; das OS bringt dafür keinen Skill und keinen
  MCP-Server mit — wo eine Integration existiert, ist sie Sache des Arbeits-Repos, sonst gilt
  der manuelle Weg.
- **Die Spec wird nie in-place umgeschrieben** — Änderungen entstehen als Nachtrag; den
  Ablauf nennt der Router `/nc:wissen-aendern`.
- **Fehlende Registry wird benannt, nicht überspielt** — mit dem Verweis auf `/nc:setup`.
- **Rote Linien bleiben unberührt:** kein Commit, kein Push, kein Merge, nichts
  Kundensichtbares; der Skill liest.

## Verifikation

- Der genannte Wissensbasis-Pfad ist real, oder der Übergangs-Befund samt
  `/nc:setup`-Hinweis ist ausgegeben.
- Der Master-Index wurde konsultiert, bevor eine Kategorie im Volltext gelesen wurde.
- Jede Aussage der Antwort trägt Pfad **und** Abschnitt; Stichprobe: Quelle öffnen, Aussage
  wiederfinden.
- Die Wissenslücken-Zeile ist vorhanden, notfalls leer mit Begründung.
