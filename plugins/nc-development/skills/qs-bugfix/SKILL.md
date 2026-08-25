---
name: qs-bugfix
description: >-
  Führt einen gemeldeten Fehler durch die QS-Schleife: klärt die Meldung, stellt den Fehler
  zuerst als scheiternden Test nach, grenzt die Ursache ein, macht den Test mit einer
  minimalen Änderung grün, lässt Regression und umliegende Suite laufen und hält Ursache,
  Behebung und Belege für die Rückmeldung fest. Schreibt nicht ins Ticketsystem ohne
  Einzelfreigabe, pusht nicht und merged nicht.
  Trigger-Begriffe: „Bug reproduzieren", „Fehlermeldung nachstellen", „Regressionstest
  schreiben", „Bugfix absichern", „roter Test zum Fehler", „QS-Schleife".
---

# /nc-development:qs-bugfix — Fehler reproduzieren und beheben

## Zweck

WP7 „QS & Abnahme" aus der `workflow.md` dieser Abteilung, Modul `qs`: Ein gemeldeter Fehler
wird nicht „irgendwie weggemacht", sondern erst **reproduziert**, dann behoben und
anschließend **gegen Rückfall gesichert**. Der scheiternde Test ist der Beleg, dass der
richtige Fehler getroffen wurde; ohne ihn bleibt jede Behebung eine Behauptung. Der Rahmen
WP0–WP8 steht in `wp-rahmen.md` des Kern-Plugins `nc` und wird hier nicht wiederholt.

## Ablauf

1. **Meldung klären:** Erwartetes Verhalten, beobachtetes Verhalten, Umgebung, Datenstand und
   Schritte zur Auslösung in eigenen Worten zusammenfassen. Fehlt etwas davon, **nachfragen**
   statt annehmen. Existiert ein Vorgang im Ticketsystem, ihn **lesend** heranziehen.
2. **Reproduktion herstellen (RED):** Einen Test schreiben, der den Fehler auslöst, und ihn
   ausführen. Er **muss scheitern** — Befehl und Fehlausgabe festhalten. Lässt sich der Fehler
   nicht reproduzieren, ist das das Ergebnis dieses Laufs: melden, Rückfragen stellen, nichts
   „auf Verdacht" ändern.
3. **Ursache eingrenzen:** Vom scheiternden Test aus rückwärts arbeiten, bis die Stelle mit
   `Datei:Zeile` benannt ist. Symptomort und Ursachenort unterscheiden und beide nennen.
4. **Minimal beheben (GREEN):** Die kleinste Änderung, die den roten Test grün macht. Kein
   Umbau nebenan, kein Aufräumen im selben Zug — Beobachtetes gehört in eine eigene Notiz.
5. **Regressionslauf:** Den Reproduktionstest **und** die umliegende Suite ausführen. Die
   Befehle stammen aus der Projekt-Konfiguration des Arbeits-Repos — nichts erfinden. Rot →
   erst grün machen, dann weiter.
6. **Befund festhalten:** Ursache, Behebung, betroffene Stellen und Nachweis in einem kurzen
   Befund zusammenfassen. Entwurfssprache nach `nc-teamsync.md` §6 des Kern-Plugins `nc`.
7. **Ticketstand vorbereiten:** Statuswechsel oder Feldänderung als **Vorschlag** formulieren
   und die Einzelfreigabe einholen; wo kein Zugang zum Ticketsystem besteht, den manuellen
   Weg ausschreiben (welcher Vorgang, welches Feld, welcher Zielstatus, welcher Text).
8. **Übergabe:** Auf `/nc-development:flc-commit-prep` (WP4) für das Festschreiben verweisen;
   ist die Behebung Teil einer Abnahme, auf `/nc-development:qs-abnahme` verweisen.

## Regeln

- **Kein Fix ohne vorher roten Test.** Wer zuerst repariert, weiß nicht, was er repariert hat.
- **Tests werden nie abgeschwächt, ausgeklammert oder gelöscht, um grün zu werden.** Ein
  angepasster Test braucht eine ausgesprochene Begründung aus der Anforderung.
- **Keine Symptombehandlung.** Wird nur das Symptom entschärft, ist das ausdrücklich als
  Zwischenstand zu kennzeichnen, mit benannter offener Ursache.
- **Rote Linie — Ticketsystem:** Lesen ist frei. **Transitionen und Feldänderungen nur mit
  Einzelfreigabe je Vorgang** (Stufe 1); **kundensichtbare Freitexte und Kommentare schreibt
  ausschließlich der Mensch** (Stufe 2). Der Skill legt keinen Vorgang eigenmächtig an.
- **Rote Linie:** kein Push, kein Merge, kein Release, kein Deployment aus diesem Skill
  heraus — der Skill bereitet vor, der Mensch handelt.
- **Fakten nur aus dem Arbeits-Repo.** Schwellenwerte, Verträge und Konventionen stammen aus
  dessen Doku und Quellcode; selbst hergeleitete Annahmen werden als **KI-Vorschlag**
  gekennzeichnet. Quelle nicht auffindbar → **STOPP**, benennen, fragen.
- **Nicht reproduzierbar ist ein Ergebnis, kein Misserfolg** — es wird gemeldet, nicht durch
  einen plausibel wirkenden Fix überdeckt.

## Verifikation

- Der Reproduktionstest ist benannt (`Datei:Testname`) und sein **Fehlschlag vor dem Fix** ist
  mit Befehl und Ausgabe belegt.
- Nach der Behebung ist derselbe Test grün — Befehl und Ausgabe liegen vor.
- Der Lauf der umliegenden Suite ist mit **tatsächlich ausgeführtem Befehl** und Ergebnis
  genannt; ein Fehlschlag ist explizit gemeldet, nicht übergangen.
- Die Ursache ist mit `Datei:Zeile` benannt und vom Symptomort unterschieden.
- Der Umfang der Änderung ist ausgewiesen (`git diff --stat`) und enthält nichts, was nicht
  zum Fehler gehört.
- Zum Ticketsystem ist ausgesprochen, was geschah: nur gelesen, mit Einzelfreigabe geändert
  oder als manueller Schritt an den Menschen übergeben.
