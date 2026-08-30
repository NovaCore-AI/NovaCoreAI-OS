# Standardprozess: Jira-Workflow der Abteilung Onsite-OS

> **Zweck:** Das Jira-Projekt `OS` ist das eine **Arbeit-Backlog** der Abteilung Onsite-OS —
> Features, Bugs, Ideen, Priorisierung. Die Wissensbasis dieses Repos bleibt SSOT für
> **Wissen**; Jira trägt Arbeit, nie Wissen. **Herkunft:** formalisiert aus dem
> Maintainer-Musterflow vom 2026-08-24 (Ablage-GO gleichen Tags); Projekt- und Board-Aufbau
> am 2026-08-24 verifiziert (Test-Durchlauf `OS-6` über die volle Statuskette).
> **Ticket-Kopfnorm + Findings-Regel:** Maintainer-Entscheid 2026-08-28, im selben Zug am
> Musterumbau der Karten `OS-62`/`OS-63` entwickelt.

## Ort & Struktur

- Site `https://onsiteai.atlassian.net` (cloudId `74f6bca5-f8ac-4610-b546-591cfa7adb87`),
  Projekt **`OS` „Onsite-OS"** (team-managed Kanban), Board 35
- Issue-Typen: `Epic`, `Story` (Feature-Wunsch), `Task`, `Bug`
- **Epics = Arbeitsstränge, jedes Ticket wird einem zugeordnet:**
  `OS-1` Kern oai · `OS-2` Abteilungs-Plugins (Differenzierung je Abteilung über Labels
  `plugin-<name>`) · `OS-3` OS-Evolution (neue Features/Erweiterungen inkl. genereller
  Infra-Themen des OS) · `OS-4` Schulung & Doku · `OS-5` SSOT-Infrastruktur (Änderungen an
  der SSOT-Logik selbst)
- Rollen: Solo-Dev/Projekt-Admin (Maintainer) · 5 User (Rolle Member) — legen Tickets an,
  kommentieren, priorisieren im Weekly mit; verwalten nicht (prozedurale Regel, team-managed
  kennt keine feinere Rechte-Stufe)

## Spalten & Flow

| Spalte (Status) | Bedeutung |
|---|---|
| **To Do** (`Zu erledigen`) | Sammel- **und** Backlog-Spalte: alle — auch die User — legen neue Tickets direkt hier an; das **wöchentliche Weekly** bespricht Prio und Reihenfolge |
| **In Arbeit** | Dev zieht das Ticket und arbeitet daran |
| **Internal Review** (`Wird überprüft`, `pilot-release`) | PR ans Repo gestellt; Dev und/oder externe Agenten reviewen, CI läuft, Review-Konversationen werden geführt und gelöst, bis keine Findings mehr bestehen. Status `pilot-release` = Review abgeschlossen: **Merge + Pilot-Release** („Release auf Bewährung" — ab jetzt für User sichtbar) |
| **Operative Refining** (`Piloting`) | ~1 Woche Live-Nutzung; User-Feedback wird eingearbeitet. Bei Findings läuft die Karte zurück über In Arbeit → Internal Review → Refining, bis seitens der User keine Findings mehr bestehen |
| **Official Release** | finaler Release mit allen implementierten Feedbacks = erledigt |

## Ticket-Kopf (Pflichtstruktur jeder Karte)

Jedes Ticket trägt drei Abschnitte in fester Reihenfolge — schlank und verständlich, nicht
voll:

1. **Ziele / Erwartetes Verhalten** — bei **Bugs** heißt der Abschnitt „Erwartetes Verhalten"
   (was stattdessen passieren sollte), bei allen anderen Typen „Ziele" (was erreicht sein
   soll). Ein bis drei Sätze.
2. **Ist-Zustand** — was heute tatsächlich passiert oder fehlt, mit Fundstelle (`Datei:Zeile`,
   PR-/Ticket-Verweis, Messwert). Kurz.
3. **DoD (Definition of Done)** — nummerierte, einzeln abhakbare Kriterien; einschlägige
   Prozess-Pflichten benennen (z. B. Zeile im `Aktualisierungs-Index`, Zuständigkeit des
   Release-Zugs).

**Findings, Belege und Beispiele gehören in die Kommentare**, nicht in die Beschreibung: Die
Beschreibung ist die schlanke Arbeitsgrundlage, der Kommentar trägt die Last —
Untersuchungsprotokolle, Messreihen, Zitate, Lang-Fassungen. Beim Umbau einer Bestandskarte
wird der bisherige Text **wortgleich als Kommentar gesichert** („hierher umgezogen") und erst
danach gekürzt — nichts wird verworfen. Musterbeispiele für beides: `OS-62` und `OS-63`
(2026-08-28).

## Regeln

- Release-Stufen (**Pilot** vs. **Official**) werden auf GitHub dokumentiert und gekennzeichnet
  (z. B. im Release-Namen); Jira bildet den Prozess nur ab
- Kein Sprint-Betrieb, keine Dailys; dringende Bugs darf der Dev außerhalb des Weekly-Rhythmus
  ziehen (Dev-Entscheid)
- Tickets, die einen Bauplan brauchen, verlinken ihn aus der Wissensbasis; Baupläne nennen den
  Jira-Key, sobald einer existiert (keine Doppelpflege)
