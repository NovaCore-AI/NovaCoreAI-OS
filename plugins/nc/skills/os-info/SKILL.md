---
name: os-info
description: >-
  Erklärt das NovaCore-OS und seine Bestandteile auf Basis dessen, was beim Nutzer wirklich
  installiert ist — ermittelt alle installierten nc-Plugins (Kern und Abteilungen) mit
  Version und Quelle, liest die Abteilungs-Registry des Kerns, zählt je Plugin real
  vorhandene Skills (nutzbar vs. geplant) samt Namespace, prüft die Kontroll-Hooks im
  aktuellen Repo und die verfügbaren Konnektoren. Trigger-Begriffe: „Was ist das
  NovaCore-OS", „was kann das OS", „welche Skills gibt es", „welche Abteilungen", „welche
  Plugins sind installiert", „OS erklären", „Orientierung im OS", „Hilfe zum OS".
---

# /nc:os-info — Das OS erklären, wie es wirklich installiert ist

## Zweck

Orientierungs-Skill der ständigen Abteilung `gemeinsam`: erklärt Aufbau und Bestandteile des
NovaCore-OS **auf Basis des realen Installationszustands beim Nutzer** — nie aus
Doku-Erinnerung. Er unterscheidet strikt zwischen „bei dir installiert und nutzbar" und „im
Produkt vorhanden, aber bei dir nicht installiert", damit niemand Features erklärt bekommt,
die er nicht hat. Das OS besteht aus **mehreren Plugins**: dem Kern `nc` und je Abteilung
einem eigenen Plugin (`nc-development`); Kollegen-OS wie `nc-felix`/`nc-biggi` sind
eigenständige Satelliten ohne Kern-Dependency.

## Ablauf

1. **Installation ermitteln:** `claude plugin list` ausführen und **alle** Plugins mit
   Namenspräfix `nc` erfassen — Name, Version, Quelle, gemeldete Fehler. Schlägt der Befehl
   fehl: im Plugin-Cache suchen (`~/.claude/plugins/cache`, je installierter Version ein
   Verzeichnis) und die `plugin.json` je Plugin lesen. **Alle weiteren Dateien aus genau
   diesen Installationen lesen** — nicht aus einem zufällig ausgecheckten OS-Repo.
2. **Kern prüfen:** Ist `nc` installiert und aktiv? Er ist Dependency jedes
   Abteilungsplugins und wird beim Installieren/Aktivieren einer Abteilung automatisch
   mitaktiviert. Fehlt er, obwohl eine Abteilung installiert ist, ist das ein Fehlerfall —
   `claude plugin list` nennt ihn dann als Dependency-Problem; genau so ausweisen.
3. **Struktur laden:** `module-registry.json` des Kerns lesen — Hierarchie Abteilung →
   Plugin → Module (Skill-Präfix) → Skills, inklusive `staendig`-Flag (ständige Abteilung =
   immer aktiv, nie deaktivierbar). Die Registry beschreibt das **Produkt**, nicht die
   Installation: Abteilungen ohne installiertes Plugin klar als „nicht installiert"
   kennzeichnen.
4. **Skills real zählen:** Je installiertem Plugin das Verzeichnis `skills/` scannen — Ordner
   **mit** `SKILL.md` = nutzbar, Ordner nur mit `PLATZHALTER.md` = geplant, nicht nutzbar.
   Den Aufruf-Namespace je Plugin aus dessen Namen bilden: Kern → `/nc:<name>`, Abteilung →
   `/nc-<abteilung>:<name>`. Weicht die Registry vom Scan ab, die Abweichung offen benennen.
5. **Kontroll-Hooks:** `hooks/hooks.json` des Kerns lesen und für **jedes** Gate prüfen, ob
   sein Opt-out auf einem Aus-Wert steht (`off`/`0`/`false`/`disabled`): `NC_FFG` (Gate 1),
   `NC_START_GATE` (Gate 2, beide Teile), `NC_AUTOSYNC` (Doks-Autosync). Die Hooks liegen im
   Kern und sind überall scharf, wo der Kern installiert ist — außer bei gesetztem Opt-out.
   Klar sagen, ob die Gates HIER gerade scharf sind.
6. **Konnektoren:** verfügbare MCP-Werkzeuge prüfen (sichtbar via `/mcp`) und **nur** die
   nennen, die tatsächlich vorhanden sind — nichts vorwegnehmen, was erst eingerichtet
   werden müsste.
7. **Übersicht ausgeben** — kompakt und mit Quelle je Angabe: Plugin-Tabelle (Plugin,
   Version, Quelle, aktiv ja/nein) · Abteilungs-Tabelle (je Abteilung: Plugin installiert
   ja/nein, Module, nutzbare Skills mit Namespace, geplante Skills, ständig ja/nein) ·
   Gate-Status im aktuellen Repo · Konnektoren-Status · wie eine fehlende Abteilung
   nachinstalliert wird (`/plugin install nc-<abteilung>@novacore-os`; der Kern kommt
   transitiv mit) · Verweis auf das README **der Installation** für Details (CHANGELOG und
   Wissensbasis liegen im OS-Repo, nicht in der Installation).
8. **Koexistenz-Warnung:** Sind neben `nc` auch Satelliten-Plugins (`nc-felix`, `nc-biggi`)
   installiert und aktiv, das ausdrücklich melden — sie tragen eigene Kopien der Gates, die
   dann **doppelt** feuern. Empfehlung: zum Arbeiten eines deaktivieren.
9. Liegt zusätzlich ein lokal ausgechecktes OS-Repo vor, dessen Stand von der Installation
   abweicht: den Unterschied explizit benennen — **nutzbar ist der Installationsstand.**

## Regeln

- **Nur belegen, nie erinnern:** Jede Aussage stammt aus einer in diesem Lauf gelesenen
  Datei oder einem ausgeführten Befehl — Nicht-Auffindbares wird als „nicht ermittelbar"
  ausgewiesen, nie ergänzt.
- **Installationsstand schlägt Repo-Stand** — erklärt wird, was der Nutzer wirklich hat.
- **Nicht installierte Abteilungen nie als verfügbar darstellen** — und Platzhalter-Skills
  nie als Feature verkaufen; geplant heißt geplant.
- **Namespace nie raten:** Er folgt dem Namen des Marketplace-Eintrags — Abteilungs-Skills
  laufen unter `/nc-<abteilung>:`, nur Kern-Skills unter `/nc:`.
- **Nur lesen.** Dieser Skill ändert nichts: keine Dateien, keine Einstellungen, keine
  Installationen, nichts Kundensichtbares (rote Linien unberührt).
- Bei mehreren Versionen im Cache: die von `claude plugin list` gemeldete bzw. die jüngste
  installierte Version verwenden und das im Ergebnis benennen.

## Verifikation

- Die Ausgabe nennt **jedes** gefundene `nc`-Plugin mit Version und Quelle, jeweils mit
  Beleg (Befehl oder Dateipfad).
- Der Kern-Status ist explizit ausgewiesen (installiert/aktiv, oder als Dependency-Fehler).
- Die Skill-Zählung je Plugin stammt nachvollziehbar aus dem realen Verzeichnis-Scan (Anzahl
  nutzbar / geplant, Namespace je Plugin ausgewiesen).
- Abteilungen aus der Registry ohne installiertes Plugin sind als „nicht installiert"
  markiert.
- Der Gate-Status ist für alle drei Schalter belegt (`NC_FFG`, `NC_START_GATE`,
  `NC_AUTOSYNC`: Opt-out gesetzt ja/nein).
- Der Verlauf enthält ausschließlich Lese-Operationen.
