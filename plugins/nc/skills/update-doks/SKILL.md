---
name: update-doks
description: >-
  Maintainer-Werkzeug für die Instandhaltung der harten SSOT-Dokumente des OS-Repos: Es erhebt
  Kreuzverweise, Pfadangaben und Verlinkungen der im SSOT-Document-Index gelisteten Dokumente
  gegen den realen Repo-Stand, legt einen Drift-Bericht mit Quellenbeleg je Fund vor und zieht
  erst nach ausdrücklicher Bestätigung nach. Datengrundlage ist die Änderungs-Matrix des
  Aktualisierungs-Index, die der Skill zur Laufzeit liest statt sie zu duplizieren. Kein
  Alltagsbefehl und kein Werkzeug für Arbeits-Repos — er läuft ausschließlich im Arbeitsklon
  des OS-Repos und ausschließlich in Maintainer-Hand. Trigger-Begriffe aus dem
  Maintainer-Vokabular, nicht aus der Alltagssprache: „update-doks", „SSOT-Kreuzverweise
  erheben", „SSOT-Verlinkungen instand halten", „Kern-Repo-Doku-Drift prüfen".
---

# /nc:update-doks — Kreuzverweise und Pfade der SSOT-Dokumente instand halten (Maintainer)

## Zweck

**Ein Skill, eine Aufgabe.** Er hält die **harten SSOT-Dokumente** — die, die im
SSOT-Document-Index gelistet sind — untereinander anschlussfähig: Kreuzverweise, Pfadangaben
und Verlinkungen sollen nach jeder Änderung noch auf das zeigen, was wirklich da ist. Er
verteilt nichts an Maschinen und entscheidet nicht, ob etwas Firmenwissen ist. Er ist das
**Meta-Pendant zu `/nc:end-session`**: Was der Sitzungsabschluss für eine Sitzung leistet,
leistet dieser Lauf für den Dokumentenbestand — reiner **Maintainer-Skill**, kein
Team-Alltagswerkzeug. Er läuft nach `/nc:start` (WP0, Rahmen `wp-rahmen.md` dieses
Kern-Plugins `nc`); alle Schreibschritte liegen hinter dem Fakten-Stempel.

**Übergangs-Hinweis:** Das Instandhalten der firmengeführten CLAUDE-Ebenen **auf einer
Maschine** (Ebene 1 Firmen-Block, Ebene 1b Team-Sync-Datei) ist ausdrücklich **nicht** mehr
Aufgabe dieses Skills — auch nicht der Reparatur- und Erstlauf-Fall. Bis ein künftiger
CLAUDE-Netz-Aktualisierer gebaut ist, trägt der **Doks-Autosync-Hook** des Kerns diese Ziele
allein; defekte Marker lässt er fail-safe aus und legt sie dem Menschen vor.

## Ablauf

1. **Vorbedingungen prüfen — vor jeder anderen Aktion, Abbruch statt Notlauf.** Drei Fragen,
   jede einzeln beantwortet und im Ergebnis genannt:
   **(a) Session gestempelt?** Ist das Start-Gate aktiv und die Sitzung ungestempelt: abbrechen
   mit „erst `/nc:start`, dann erneut".
   **(b) Arbeitsklon des OS-Repos vorhanden?** Läuft die Sitzung selbst im Arbeitsbaum des
   OS-Repos (per `git remote get-url origin` belegen, nicht annehmen), ist das der
   Gegenstand. Sonst zählt allein der Pfad aus dem Feld `kernRepoPfad` der Infra-Registry
   `~/.claude/nc/infra.json`. Die Lesekopie `kernSsotPfad` ist **nie** der Gegenstand — sie
   ist ein Bereitstellungs-Klon, dort geschriebene Fixes erreichen das Repo nie. Fehlt beides
   oder ist der Pfad tot: abbrechen und `/nc:setup` vorschlagen — **keine Pfade raten, kein
   anderes Repo ersatzweise prüfen**.
   **(c) Maintainer-Auftrag?** Der Lauf schreibt in die SSOT des Kerns. Ist der Auftrag nicht
   ausdrücklich als Instandhaltung des OS-Repos gestellt — etwa weil ein Alltagsbegriff den
   Skill gezogen hat —, den Zweck in einem Satz nennen, den vermuteten Bedarf benennen und
   **ohne Erhebung beenden**, solange die Maintainer-Absicht nicht bestätigt ist.
2. **Infrastruktur des Arbeitsbaums feststellen** (nur lesend): Existiert der Arbeitsbaum, ist
   er ein Git-Repo, auf welchem Branch steht er, gibt es uncommittete Änderungen und parallele
   Worktrees (`git status`, `git branch --show-current`, `git worktree list`)? Der
   **Arbeitsbaum ist die Wahrheit** — nicht der letzte Commit. Steht der Klon auf einem fremden
   Arbeitsstand oder laufen fremde Worktrees, das im Ergebnis nennen; Fixes gehören nie in
   fremde Arbeit.
3. **Datengrundlage einlesen — zur Laufzeit im Arbeitsbaum, nie aus dem Gedächtnis.** Das
   **Soll** liefert die Änderungs-Matrix des **Aktualisierungs-Index** (im OS-Repo unter
   `knowledge-base/standardprozesse/`): Sie sagt je Änderungsart, was mitzuziehen ist. Dazu der
   **SSOT-Document-Index** (im OS-Repo das einzige Dokument auf der Wurzelebene der
   Wissensbasis) — er nennt den Prüfumfang, also **welche** Dokumente überhaupt zum harten
   Bestand zählen. **Der Skill dupliziert diese Listen nie**; steht eine Änderungsart nicht in
   der Matrix, ist sie für diesen Lauf unsichtbar und genau das wird als Lücke gemeldet.
4. **Abweichungen erheben — erheben, nicht korrigieren.** Über die im SSOT-Document-Index
   gelisteten Dokumente: **tote Links** (Ziel existiert nicht mehr), **verschobene Pfade**
   (Datei liegt woanders als angegeben), **veraltete Kreuzverweise** (Verweis auf entfernte
   oder umbenannte Skills, Agenten, Hooks, Module, Kategorien) und **Index-Lücken** (Datei ohne
   Zeile im Index, Indexzeile ohne Datei). Gegenprobe ist immer die Platte
   (Glob/Grep/`git status`), nicht eine zweite Dokumentaussage. Die deterministisch prüfbaren
   Anteile deckt `node --test plugins/nc/tests/*.test.mjs` ab — der Lauf ergänzt ihn, ersetzt
   ihn nicht.
5. **Vorschau vor dem Schreiben — Pflichtschritt, nicht überspringbar.** Zuerst den
   **Drift-Bericht** ausgeben: je Fund Datei und Stelle, **Ist**, **Soll** und die **Quelle**
   der Soll-Aussage. Danach die vorgesehenen Änderungen als Vorschlag zeigen und **ausdrücklich
   bestätigen lassen** — eine Rückfrage im Dialog, kein Hook und keine stillschweigende
   Annahme. Ohne Antwort wird nichts geschrieben; ein leerer Bericht endet hier mit „keine
   Drift gefunden" samt Liste der geprüften Punkte.
6. **Erst nach Bestätigung nachziehen**, und nur das Bestätigte: in einem Arbeits-Branch, ein
   Fund nach dem anderen, Formulierung minimal. Wird während des Schreibens ein neuer Fund
   sichtbar, kommt er in den Bericht — nicht ungefragt in den Diff.
7. **Belegen:** Was wurde geändert (Datei, Stelle, alt → neu), was blieb bewusst offen und
   warum, welche Prüfungen liefen. Der Prüfzyklus schließt den Lauf ab: Testsuite plus
   `claude plugin validate .` und `claude plugin validate plugins/<name> --strict` je berührtem
   Plugin.

## Regeln

- **Vorschau vor Schreiben, ohne Ausnahme.** Kein Fund wird während der Erhebung still
  korrigiert; Schritt 5 ist die einzige Tür zu Schritt 6.
- **Keine Doppelpflege.** Der Skill trägt keine Kopie der Änderungs-Matrix, keine Dateiliste
  und keine Kategorienliste — er liest sie. Eine hier eingebaute Zweitfassung wäre genau die
  Drift, gegen die er läuft.
- **Nur lebende Dokumente.** CHANGELOG-Alteinträge, Bauplan-Alttext (Änderung nur per
  Nachtrag), das Bauplan-Archiv und die append-only-Protokolle werden nie rückwirkend auf neue
  Pfade umgeschrieben. Historische Pfadangaben sind kein Fund, sondern Zeitstand.
- **Widersprüche werden gemeldet, nie stillschweigend geglättet.** Quellen-Hierarchie: jüngster
  Bauplan bzw. Definitionsdokument → Standardprozesse → lebende Doku; bei Pfaden gewinnt die
  Platte.
- **Kein Zuständigkeitsausgriff.** Nur der Arbeitsklon des OS-Repos. Satelliten-Repos,
  Arbeits-Repos des Teams und die CLAUDE-Ebenen einer Maschine sind nicht Gegenstand dieses
  Laufs — Befunde dazu werden genannt, nicht bearbeitet; für die CLAUDE-Ebenen ist der
  Doks-Autosync-Hook zuständig.
- **Rote Linien:** kein `git commit`, `push`, `merge`, kein Tag und kein Release ohne explizite
  Freigabe des Maintainers im laufenden Lauf; nichts wird an Dritte gesendet. **Kein
  Versions-Bump** — Versionen vergibt allein der Release-Entscheid des Maintainers.
- Keine personenbezogenen Pfade annehmen; der Repo-Pfad kommt aus dem laufenden Arbeitsbaum
  oder aus der Infra-Registry — nie aus Annahmen über den Rechner.

## Verifikation

- **Vorbedingungen:** Das Ergebnis nennt zu (a), (b) und (c) je eine ausdrückliche Antwort —
  bei Abbruch steht dort, **welche** der drei Bedingungen fehlte, und es wurde nichts
  geschrieben. Bei (b) ist der verwendete Pfad samt Herkunft (Arbeitsbaum oder
  `kernRepoPfad`) genannt.
- **Drift-Bericht:** Jeder Fund trägt Datei, Stelle, Ist, Soll und Quellenbeleg. Ein leerer
  Bericht wird als „keine Drift gefunden" mit Nennung der geprüften Punkte ausgegeben — nie als
  stilles Nichts.
- **Bestätigungsschritt:** Zu jeder geschriebenen Änderung lässt sich die Bestätigung im
  Gesprächsverlauf zeigen; ohne sie darf keine Datei berührt worden sein.
- **Abschluss-Gegenprobe:** `node --test plugins/nc/tests/*.test.mjs` im Arbeitsbaum ist grün;
  bei berührten Manifesten oder Skills zusätzlich
  `claude plugin validate plugins/<name> --strict`. Ein direkter Zweitlauf meldet für die
  behobenen Funde **keine Drift** mehr.
