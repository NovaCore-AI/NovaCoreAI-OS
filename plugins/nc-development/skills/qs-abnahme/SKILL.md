---
name: qs-abnahme
description: >-
  Führt den Abnahmelauf einer fertigen Änderung: leitet die Abnahmekriterien aus Auftrag und
  Anforderung ab, plant den Livetest in der Zielumgebung mit Vorbedingungen und Testdaten,
  arbeitet eine Abnahme-Checkliste Punkt für Punkt mit je einem Beleg ab und fasst Restrisiken
  und Nacharbeiten zusammen. Die Abnahmeentscheidung selbst trifft der Mensch.
  Trigger-Begriffe: „Abnahme", „Abnahmelauf", „Abnahme-Checkliste", „Livetest planen",
  „Ergebnis in der Zielumgebung prüfen", „Feature abnehmen".
---

# /nc-development:qs-abnahme — Abnahmelauf durchführen

## Zweck

WP7 „QS & Abnahme" aus der `workflow.md` dieser Abteilung, Modul `qs`: Ein gemergter oder
review-fertiger Stand wird gegen die **ursprüngliche Anforderung** geprüft, nicht gegen die
eigene Umsetzungsabsicht. Der Skill erzwingt Verifikationsdisziplin — jeder Abnahmepunkt trägt
einen Beleg, „sollte passen" ist kein Ergebnis. Der Rahmen WP0–WP8 steht in `wp-rahmen.md` des
Kern-Plugins `nc` und wird hier nicht wiederholt.

## Ablauf

1. **Gegenstand festlegen:** Was genau wird abgenommen (Änderung, Slice, Release-Kandidat),
   auf welchem Stand (Commit, Branch, Version) und in welcher Umgebung. Ohne benannten Stand
   keine Abnahme.
2. **Abnahmekriterien ableiten:** Aus Auftrag, Anforderung bzw. Ticket die prüfbaren Kriterien
   ziehen — **wörtlich aus der Quelle des Arbeits-Repos**, nicht aus dem Gedächtnis
   nachformuliert. Fehlen Kriterien, wird das als Befund gemeldet und nachgefordert.
3. **Livetest-Plan schreiben:** Je Kriterium Vorbedingung, Schritte, erwartetes Ergebnis und
   die nötigen Testdaten. Umgang mit echten Daten und mit dem Produktivsystem vorher klären —
   im Zweifel Testumgebung.
4. **Automatisierte Nachweise einsammeln:** Tests, Lint und Build des Arbeits-Repos ausführen
   und Befehl plus Ergebnis notieren. Für kritische Pfade zusätzlich die Testtiefe belegen.
5. **Checkliste abarbeiten:** Jeden Punkt einzeln durchgehen und mit **genau einem Beleg**
   abschließen: Command-Output, Screenshot-Beschreibung, Logzeile, beobachtetes Verhalten,
   grüner Test. Punkte ohne Beleg bleiben **offen** — sie werden nicht „aus Plausibilität"
   abgehakt.
6. **Befunde einordnen:** Abweichungen als **blockierend** (Abnahme nicht möglich) oder
   **nachzuarbeiten** (Abnahme mit benannter Restarbeit) einstufen, jeweils reproduzierbar
   beschrieben. Blockierende Befunde gehen über `/nc-development:qs-bugfix` zurück in die
   Schleife.
7. **Abnahme-Protokoll entwerfen:** Gegenstand, Stand, Kriterien mit Beleg, Befunde,
   Restrisiken und Empfehlung in einem Text zusammenfassen. Entwurfssprache nach `nc-teamsync.md`
   §6 des Kern-Plugins `nc`.
8. **Übergabe:** Das Protokoll der Rolle **Maintainer/Admin** vorlegen — sie nimmt ab und
   merged. Steht ein Release an, auf `/nc-development:rel-vorbereitung` verweisen.

## Regeln

- **Rote Linie: der Skill nimmt nicht selbst ab.** Er legt die Belege vor; die Freigabe ist
  eine menschliche Entscheidung der Rolle Maintainer/Admin.
- **Rote Linie:** kein Merge, kein Release, kein Deployment und kein Eingriff am
  Produktivsystem aus diesem Skill heraus — insbesondere keine Deploys, keine Datenbank- und
  keine Webhook-Änderungen (domänenspezifische rote Linien der Abteilung, siehe
  `pflege-auspraegung.json` dieses Plugins).
- **Rote Linie — Ticketsystem:** Lesen frei · Transitionen und Feldänderungen nur mit
  Einzelfreigabe je Vorgang · kundensichtbare Freitexte nur der Mensch. Wo kein Zugang
  besteht, wird der manuelle Weg ausgeschrieben.
- **Ein Punkt ohne Beleg ist offen, nicht bestanden.** Das gilt auch für Punkte, die
  „offensichtlich" erfüllt wirken.
- **Keine erfundenen Kriterien.** Ergänzt der Skill aus Erfahrung einen Prüfpunkt, wird er als
  **KI-Vorschlag** gekennzeichnet und getrennt von den Auftragskriterien geführt.
- **Testdaten sind keine Kundendaten.** Personenbezogene oder produktive Datensätze werden
  nicht für Testläufe kopiert; Secrets erscheinen nie im Protokoll.

## Verifikation

- Gegenstand und Stand sind eindeutig benannt (Branch/Commit bzw. Version) und die Umgebung
  ist ausgesprochen.
- Die Abnahmekriterien sind mit ihrer Quelle im Arbeits-Repo belegt; ergänzte Punkte sind als
  KI-Vorschlag markiert.
- Zu **jedem** Kriterium liegt genau ein Beleg oder der Status „offen" mit Begründung vor —
  die Liste enthält keinen unbelegten Haken.
- Für Tests, Lint und Build ist je der tatsächlich ausgeführte Befehl samt Ergebnis genannt.
- Blockierende Befunde sind reproduzierbar beschrieben (Schritte, erwartet, beobachtet) und an
  die QS-Schleife übergeben.
- Das Abnahme-Protokoll liegt als **Entwurf** vor und ist als solcher gekennzeichnet; eine
  Abnahmeentscheidung wurde nicht vorweggenommen.
