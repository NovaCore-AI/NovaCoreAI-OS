---
name: rel-verifikation
description: >-
  Verifiziert eine bereits vom Menschen ausgelöste Auslieferung ausschließlich lesend: prüft,
  ob der erwartete Stand in der Zielumgebung angekommen ist, arbeitet einen Smoke-Umfang
  entlang der kritischen Pfade ab, sichtet Fehlerbilder und Logs auf Abweichungen und
  entscheidet belegt zwischen „stabil" und „Rückweg empfohlen".
  Trigger-Begriffe: „Post-Deploy-Verifikation", „nach der Auslieferung prüfen", „Release
  verifizieren", „Smoke-Check nach dem Deploy", „Auslieferung nachweisen".
disable-model-invocation: true
---

# /nc-development:rel-verifikation — Auslieferung verifizieren (Post-Deploy)

## Zweck

WP7 „QS & Abnahme" aus der `workflow.md` dieser Abteilung, Modul `rel`: Nach einer
Auslieferung wird **belegt**, dass der richtige Stand läuft und die kritischen Pfade tragen —
statt darauf zu vertrauen, dass ein grüner Deploy-Lauf schon reiche. Der Skill arbeitet
read-only und wird **nur manuell aufgerufen** (im Frontmatter verdrahtet), weil er an einem
Produktivsystem entlangprüft. Der Rahmen WP0–WP8 steht in `wp-rahmen.md` des Kern-Plugins
`nc` und wird hier nicht wiederholt.

## Ablauf

1. **Erwartung festlegen:** Welcher Stand sollte ausgeliefert worden sein (Commit bzw.
   Version), in welche Umgebung, mit welchen sichtbaren Änderungen. Grundlage ist die Mappe
   aus `/nc-development:rel-vorbereitung`; fehlt sie, wird die Erwartung erst rekonstruiert
   und bestätigt.
2. **Ankunft prüfen:** Den tatsächlich laufenden Stand lesend feststellen (Versionsanzeige,
   Health- oder Info-Endpunkt, Build-Kennung — je nachdem, was das Arbeits-Repo vorsieht) und
   gegen die Erwartung halten. Abweichung → sofort melden, nicht weiterprüfen.
3. **Smoke-Umfang abarbeiten:** Die kritischen Pfade in fester Reihenfolge durchgehen —
   Anmeldung und Berechtigungen, Geldfluss-relevante Vorgänge, externe Verträge und
   Schnittstellen, die konkret geänderten Funktionen. Je Punkt erwartetes und beobachtetes
   Verhalten notieren.
4. **Fehlerbild sichten:** Fehlerraten, Antwortzeiten und Logs im Zeitfenster um die
   Auslieferung lesend prüfen und gegen den Zustand davor halten. Neue Fehlerklassen zählen
   als Befund, auch wenn sie selten sind.
5. **Datenpfad nachsehen:** Wurde eine Datenmodell-Änderung ausgeliefert, den Zustand danach
   lesend bestätigen (erwartete Struktur vorhanden, laufende Verarbeitung ohne Rückstau).
   **Nichts korrigieren** — Abweichungen werden gemeldet.
6. **Ergebnis entscheiden:** „stabil", „stabil mit benannter Nacharbeit" oder „Rückweg
   empfohlen". Die Empfehlung trägt immer die Belege, auf denen sie beruht.
7. **Protokoll entwerfen:** Erwartung, Ankunft, Smoke-Ergebnisse, Fehlerbild und Empfehlung
   zusammenfassen. Entwurfssprache nach `nc-sync.md` §6 des Kern-Plugins `nc`.
8. **Übergabe:** Bei Befunden auf `/nc-development:qs-bugfix` verweisen; die Entscheidung über
   Rückweg oder Weiterbetrieb trifft die Rolle Maintainer/Admin.

## Regeln

- **Der Skill arbeitet ausschließlich lesend.** Keine Konfigurationsänderung, kein Neustart,
  kein Datenkorrektur-Kommando, kein Nachladen von Daten — auch nicht „nur kurz".
- **Rote Linie — Produktivsystem:** Deploys, Datenbank-Eingriffe und Webhook-Änderungen führt
  ausschließlich der Mensch aus (domänenspezifische rote Linien der Abteilung, wortgleich in
  `pflege-auspraegung.json` dieses Plugins). Das gilt auch für den Rückweg: Der Skill
  **empfiehlt** ihn und beschreibt die Schritte, er löst ihn nie aus.
- **Rote Linie:** kein Deployment, kein Release, kein Merge aus diesem Skill heraus.
- **Kein Punkt gilt als geprüft ohne Beleg.** Ein nicht prüfbarer Punkt wird als **offen**
  ausgewiesen, mit dem Grund (kein Zugang, keine Testdaten, kein Einblick).
- **Keine produktiven Nebenwirkungen erzeugen:** keine Testbestellungen, keine ausgelösten
  Benachrichtigungen, nichts Kundensichtbares. Lässt sich ein Pfad nur mit Nebenwirkung
  prüfen, wird er dem Menschen übergeben.
- **Keine Secrets und keine personenbezogenen Daten im Protokoll** — Logauszüge werden
  gekürzt und Bezüge maskiert.
- **Rote Linie — Ticketsystem:** Lesen frei · Transitionen und Feldänderungen nur mit
  Einzelfreigabe je Vorgang · kundensichtbare Freitexte nur der Mensch; ohne Zugang wird der
  manuelle Weg ausgeschrieben.

## Verifikation

- Erwarteter und tatsächlich laufender Stand sind beide benannt und ausdrücklich gegeneinander
  gehalten (übereinstimmend oder abweichend).
- Jeder Punkt des Smoke-Umfangs trägt erwartetes Verhalten, beobachtetes Verhalten und einen
  Beleg — oder den Status **offen** mit Grund.
- Das Fehlerbild ist mit Zeitfenster und Vergleichsbasis beschrieben; neue Fehlerklassen sind
  einzeln aufgeführt.
- Zur Datenmodell-Änderung liegt entweder eine lesende Bestätigung vor oder die Feststellung
  „keine ausgeliefert".
- Die Empfehlung („stabil" / „stabil mit Nacharbeit" / „Rückweg empfohlen") ist ausgesprochen
  und mit den zugehörigen Belegen verknüpft.
- Es wurde nachweislich nichts verändert: keine schreibende Aktion an Umgebung, Daten oder
  Konfiguration im Verlauf.
