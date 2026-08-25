---
name: rel-vorbereitung
description: >-
  Bereitet ein Release vor, ohne es auszulösen: fixiert den auszuliefernden Stand, prüft
  Version und CHANGELOG des Arbeits-Repos auf Vollständigkeit, sammelt die grünen Nachweise,
  lässt Migrations- und Rollback-Weg benennen und stellt den Freigabenachweis zusammen. Der
  Deploy selbst bleibt eine menschliche Handlung; der Skill wird nur manuell aufgerufen.
  Trigger-Begriffe: „Release vorbereiten", „Pre-Deploy-Check", „Releasestand fixieren",
  „Rollback-Weg benennen", „Freigabenachweis zusammenstellen".
disable-model-invocation: true
---

# /nc-development:rel-vorbereitung — Release vorbereiten (Pre-Deploy-Check)

## Zweck

WP7 „QS & Abnahme" aus der `workflow.md` dieser Abteilung, Modul `rel`: Vor einer
Auslieferung wird geprüft, **was** ausgeliefert wird, **womit** es belegt ist und **wie** man
zurückkommt, wenn es schiefgeht. Der Skill stellt diese Mappe zusammen und übergibt sie dem
Menschen — er löst nichts aus. Deshalb springt er nie automatisch an
(im Frontmatter verdrahtet), sondern nur auf ausdrücklichen Aufruf. Der Rahmen WP0–WP8 steht
in `wp-rahmen.md` des Kern-Plugins `nc` und wird hier nicht wiederholt.

## Ablauf

1. **Stand fixieren:** Branch, Commit und Zielumgebung benennen. `git log --oneline` gegen den
   zuletzt ausgelieferten Stand zeigen — was ist neu, was ist ungewollt mitgekommen. Ein
   unklarer Stand ist ein Abbruchgrund.
2. **Version prüfen:** Trägt das Arbeits-Repo eine Versionsangabe, ist sie für diesen Stand
   gezogen? Wo die Version steht und nach welcher Regel sie steigt, entscheidet die Doku des
   **Arbeits-Repos** — nicht der Skill.
3. **CHANGELOG prüfen:** Jede Änderung, die Nutzer erreicht, hat einen Eintrag. Fehlende
   Einträge auflisten und als Vorschlag entwerfen. Entwurfssprache nach `nc-teamsync.md` §6 des
   Kern-Plugins `nc`.
4. **Nachweise sammeln:** Tests, Lint und Build ausführen bzw. den letzten CI-Lauf des Stands
   zitieren — je mit Befehl oder Lauf-Kennung und Ergebnis. Rot heißt: keine Vorbereitung
   abschließen.
5. **Datenpfad klären:** Bringt der Stand Änderungen am Datenmodell mit? Wenn ja, den
   Migrationsweg und seine Reihenfolge **benennen lassen** und prüfen, ob die vorige Version
   während der Umstellung weiterläuft.
6. **Rückweg benennen:** Rollback-Weg in Schritten festhalten — was wird zurückgenommen, in
   welcher Reihenfolge, was ist **nicht** rücknehmbar (bereits verarbeitete Daten, versendete
   Nachrichten, ausgezahlte Beträge). Ohne benannten Rückweg keine Freigabeempfehlung.
7. **Freigabenachweis zusammenstellen:** Abnahme (siehe `/nc-development:qs-abnahme`),
   bestandenes Review, offene Befunde mit Einstufung und die Zustimmung der Rolle
   Maintainer/Admin in einer Mappe bündeln.
8. **Übergabe:** Die Mappe vorlegen, den ausstehenden menschlichen Schritt klar benennen und
   auf `/nc-development:rel-verifikation` für den Nachweis nach der Auslieferung verweisen.

## Regeln

- **Rote Linie: der Skill deployt nicht, releast nicht, taggt nicht und merged nicht.** Er
  bereitet vor; jede auslösende Handlung ist menschlich.
- **Rote Linie — Produktivsystem:** Deploys, Datenbank-Eingriffe und Webhook-Änderungen am
  Produktivsystem führt ausschließlich der Mensch aus (domänenspezifische rote Linien der
  Abteilung, wortgleich in `pflege-auspraegung.json` dieses Plugins). Der Skill formuliert
  diese Schritte als Anleitung für den Menschen, führt sie nie selbst aus.
- **Die Deploy-Mechanik ist im OS nicht hinterlegt.** Wie eine Auslieferung technisch abläuft,
  steht im jeweiligen Arbeits-Repo; für das Produktivsystem WZS ist sie noch **offen und vom
  Maintainer nachzureichen**. Der Skill **rät sie nicht** — er fragt danach und hält den
  fehlenden Punkt fest.
- **Kein grüner Nachweis, keine Freigabeempfehlung.** Ein roter oder fehlender Lauf wird
  benannt, nicht relativiert.
- **Nicht rücknehmbare Wirkungen werden ausgesprochen**, bevor über die Auslieferung
  entschieden wird.
- **Keine Secrets in der Mappe.** Zugangsdaten werden als Platzhalter plus Fundort benannt.
- **Rote Linie — Ticketsystem:** Lesen frei · Transitionen und Feldänderungen nur mit
  Einzelfreigabe je Vorgang · kundensichtbare Freitexte nur der Mensch; ohne Zugang wird der
  manuelle Weg ausgeschrieben.

## Verifikation

- Auszuliefernder Stand (Branch + Commit) und Zielumgebung sind benannt; die Liste der
  enthaltenen Änderungen liegt vor.
- Zur Version ist ausgesprochen, ob sie gezogen wurde — mit Fundstelle im Arbeits-Repo oder
  mit der Feststellung, dass das Repo keine Version führt.
- Fehlende CHANGELOG-Einträge sind aufgelistet oder es ist belegt, dass keiner fehlt.
- Für Tests, Lint und Build liegt je Befehl bzw. CI-Lauf und Ergebnis vor; alle sind grün oder
  der rote Zustand ist explizit gemeldet.
- Der Migrationsweg ist benannt oder ausdrücklich als „keine Datenmodell-Änderung" abgehakt.
- Der Rollback-Weg steht in Schritten da, inklusive der Aufzählung dessen, was nicht
  rücknehmbar ist.
- Der Freigabenachweis nennt Abnahme, Review-Stand und die Zustimmung der Rolle
  Maintainer/Admin; fehlt einer der drei, ist er als **offen** ausgewiesen.
- Es wurde nichts ausgeliefert: kein Deploy-Kommando, kein Tag, kein Release — im Verlauf
  nachvollziehbar.
