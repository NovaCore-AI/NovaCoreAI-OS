---
name: setup
description: >-
  Richtet eine Maschine vollständig fürs NovaCore-OS ein oder repariert ein bestehendes
  Setup (Reconciler über sechs Soll-Schichten S0–S6) — prüft Voraussetzungen und
  Plugin-Stand, stellt die SSOT-Lesekopie bereit (voller Klon, Fast-Forward,
  Sparse-Heilung), verknüpft über die Infra-Registry, legt fehlendes Sitzungswissen-Gerüst an
  (sofern das Repo eine eigene Wissensbasis führt) und verifiziert die CLAUDE-Lokaldokumente.
  Mehrfach ausführbar, kein
  Schritt legt doppelt an. Trigger-Begriffe: „OS einrichten", „Setup", „Ersteinrichtung",
  „neuer Rechner", „Onboarding", „SSOT einrichten", „Wissensbasis fehlt", „Wissensbasis
  aktualisieren", „Registry reparieren", „was fehlt noch".
---

# /nc:setup — Infrastruktur-Initiierung (Setup je Maschine)

## Zweck

Führt einen Nutzer bzw. eine Maschine vollständig ins OS. Der Skill ist ein
**Reconciler**: Er erhebt den Ist-Zustand der sechs Soll-Schichten S0–S6 (Detail:
Referenzdatei `infra-registry.md` neben dieser SKILL.md) und stellt nur her, was fehlt —
dadurch ist jeder Wiederholungslauf nach Abbruch, Userfehler oder fehlender Abhängigkeit
sicher. Läuft nach `/nc:start` (WP0) und vor jeder fachlichen Arbeit auf einer neuen
Maschine. (Vorbild: `/oai:init` des Onsite-OS; die frühere NC-Fassung deckte nur den
Klon-Schritt S2 — Bauplan 2026-08-15, AP-A1.) **S-Nummern bezeichnen Schichten, nicht
Reihenfolge** — ausgeführt wird in der nummerierten Schrittfolge unten (S3 bewusst
zuletzt).

Der Marketplace liefert **nur das Plugin** aus: Hooks, Skills, Formatregeln, WP-Rahmen,
Registry. Die **Wissensbasis liegt im OS-Repo außerhalb des Plugin-Verzeichnisses** und
reist deshalb nicht mit; der Firmen-Block in der globalen `CLAUDE.md` verweist auf ihre
lokale Kopie. S2 schließt genau diese Lücke.

## Ablauf

0. **Gate-Lage:** Ist das Start-Gate aktiv und die Session ungestempelt, mit klarer
   Anweisung abbrechen: „erst `/nc:start` ausführen, danach `/nc:setup` erneut" — keine
   Skill-Verschachtelung; der Zweitlauf überspringt Erledigtes automatisch. Pragmatische
   Prüfung: Ohne Stempel bricht das Start-Gate den ersten Schreibschritt ohnehin ab —
   dessen Ablehnungstext ist der Beleg. Jede Datei-Neuanlage dieses Skills benennt vorher
   Ziel und Einbindungsort (FFG-konform).
1. **Argumente lesen:** freie Szenario-Angaben (z. B. `wsl`, abweichende SSOT-Ablage) als
   Umgebungsbeschreibung interpretieren und gegen die bestehende Infra-Registry halten —
   bei Widerspruch **fragen, nicht raten**. Belegte Szenarien: Windows nativ · WSL ·
   macOS/Linux. Trägt die vorgefundene Registry eine **höhere `schemaVersion`** als
   Schema v1, nicht einfach weiterarbeiten, sondern melden („Registry neuer als der
   installierte Kern") — nie stillschweigend überschreiben.
2. **Ist-Checkliste S0–S6 erheben** (nur Lesezugriffe; Prüfbefehle je Schicht in
   `infra-registry.md`) und als Lagebild ausgeben: je Schicht grün / fehlt / defekt /
   nicht anwendbar.
3. **S0/S1 nur verifizieren:** Voraussetzungen (git, Node, Claude Code ≥ 2.1.193;
   **`gh`** wird empfohlen und ist Pflicht, sobald eine installierte Quelle privat ist —
   das **Kern-Repo `NovaCore-AI/NovaCoreAI-OS` ist öffentlich** und braucht keinen
   Zugang, die Kollegen-OS-Satelliten-Repos sind privat, brauchen hier aber nichts:
   bei ihnen ist das Repo das Plugin) und Plugin-Stand (Kern + erwartete
   Abteilungsplugins; kommt über den Marketplace). Fehlt etwas: den konkreten
   Anleitungsschritt ausgeben und **abbrechen ohne Teilschreiben** — S0/S1 herzustellen
   ist Nutzer-/Admin-Aufgabe. Nie in einen interaktiven Credential-Prompt laufen.
4. **S2 SSOT-Lesekopie reconcilen — ein Befehl, mehr nicht:**

   ```
   node "<skills-pfad>/setup/ssot-provision.js" --json
   ```

   Er ist idempotent und entscheidet selbst: Fehlende Quellen werden **voll geklont**,
   vorhandene per **Fast-Forward** nachgezogen (nie Merge/Rebase/Reset). Welche Quellen
   nötig sind, liest er aus der Registry des Kerns — der Kern immer, dazu jede
   installierte Abteilung mit eigenem Repo und eigenem Wissen außerhalb ihres Plugins.
   **Sparse-Relikte der Erstfassung heilt er** (unveränderte Teil-Kopie →
   `git sparse-checkout disable`, gemeldet). Zustand je Quelle **dreiwertig auf
   Lesekopie-Semantik**: `angelegt`/`aktualisiert` = grün · `lokal-veraendert` = Warnung
   („die Lesekopie wird nicht bearbeitet — Änderungen sichern oder entfernen, dann
   erneut"), **nie überschreiben** · `fehler` = den genannten Grund **wörtlich**
   weitergeben. Die Verlinkung ist der feste Pfad `~/.nc/ssot/<repo-name>/`, den der
   Firmen-Block nennt (Ablage-Override für Tests/Sonderfälle: `NC_SSOT_DIR` — Standard
   bleibt `~/.nc/ssot/`).
5. **S4 Sitzungswissen-Gerüst reconcilen — nur bei eigener Wissensbasis:** Führt das aktuelle
   Arbeits-Repo eine eigene Wissensbasis (SSOT-Kategorie mit Master-Index — im OS-Repo
   `knowledge-base/`), dort fehlende Bausteine unter `sitzungswissen/` **alle** anlegen
   (Onsite-Lehre 0.18.2: halbe Gerüste erzeugen Folgefehler): `roll-up.md` ·
   `offene-straenge-register.md` · je Abteilung `<abteilung>/stand.md` ·
   `<abteilung>/journal/` — je Datei mit Kopf-Blockquote **und der Struktur, die
   `/nc:end-session` erwartet** (Register: Tabelle
   `Datum · Strang · Verbleib · Nächster Schritt · Status`; Roll-up: eine Zeile je
   Arbeitstag, jüngster oben), nie Bestandsdateien überschreiben. **Führt das Repo keine
   eigene Wissensbasis** (der Regelfall bei Kunden- und Fremd-Repos)**, ist S4 nicht
   anwendbar** — dort legt dieser Skill nichts mehr an; das Projekt-Memory von Claude Code
   trägt den Stand allein (kein Dateistrom, kein Verzeichnis, keine Datei, kein
   `.gitignore`-Eintrag). Der frühere lokale Strom `.nc/erinnerung/` ist abgeschafft: Ein
   gefundener Altbestand wird **gemeldet, nicht benutzt und nicht weitergeschrieben**.
6. **S5 CLAUDE-Lokaldokumente verifizieren:** `NC:BLOCK`-Marker + Versions-Stempel in
   `~/.claude/CLAUDE.md`, die Import-Zeile `@~/.claude/nc-teamsync.md` im Firmen-Block
   und den `NC:TEAMSYNC:VERSION`-Stempel in der **ersten Zeile** von
   `~/.claude/nc-teamsync.md`. Anlage/Update erledigt der Doks-Autosync des Kerns selbst;
   wurde das Plugin in dieser Session installiert, gilt „Payload installiert, Sync fällig
   beim nächsten Session-Start" als grün. Defekte Marker nur melden (Reparaturweg
   `/nc:update-doks`) — nie selbst überschreiben.
7. **S3 Registry schreiben (bewusst zuletzt, obwohl Schicht 3):** die während des Laufs
   festgestellten Werte einmal am Ende in die Infra-Registry `~/.claude/nc/infra.json`
   persistieren — Pfade **absolut und aufgelöst**, nie mit Tilde (Ort und Feldregeln:
   `infra-registry.md`). Vor dem Schreiben die Datei erneut lesen und fremde/unbekannte
   Felder unverändert übernehmen, nie verwerfen. Die Registry ist Komfort-Cache — die
   Platte bleibt der Beleg; ein Eintrag mit totem Pfad gilt beim nächsten Lauf als
   „fehlt". **Pflichtfelder garantieren** (Bauplan Phase J AP A3): `schemaVersion`,
   `abteilungen` (leere Liste zulässig, nie fehlend) und `szenario` müssen nach diesem
   Schritt gesetzt sein — fehlt eines und lässt es sich aus dem Lauf nicht belegen, wird
   nachgefragt statt geraten. **`kernRepoPfad` mitschreiben** (Vorbedingung des
   Setup-Hinweis-Hooks `nc-setup-hinweis.js`, D32): absoluter Pfad des **Arbeitsklons**
   des OS-Repos auf dieser Maschine — läuft dieser Lauf **im OS-Repo selbst**, ist das
   `git rev-parse --show-toplevel`; sonst beim Nutzer nachfragen, ob und wo ein
   Arbeitsklon existiert. Ohne Arbeitsklon (reines Kunden-/Fremd-Repo ohne Kern-Klon)
   trägt das Feld `"ausstehend"` — **niemals** die Lesekopie `kernSsotPfad` eintragen,
   die beiden Felder haben unterschiedliche Leser (`infra-registry.md`).
8. **S6 Abschlussbericht:** Tabelle S0–S6 mit Beleg je Schicht (Befehl + Ergebnis, Pfad,
   Version, Marker-Fund), offene Punkte, Gegenprobe per `/nc:os-info`. Zusätzlich
   **`NC_SECRETS_REF` nicht-blockierend prüfen**: nur „gesetzt" oder „nicht gesetzt"
   vermerken, ihr Wert wird **nie** gelesen oder ausgegeben — fehlt sie, ist das ein Hinweis,
   **kein Abbruch** und keine der sechs Schichten.

## Regeln

- **Rote Linien:** Der Skill klont und legt lokal an, aber er **committet, pusht und
  merged nie selbst**. Nichts wird an Dritte gesendet.
- **Kein Schritt legt doppelt an:** vor jedem Herstellen der deterministische Ist-Check;
  vorhandene Bestände werden gemeldet („vorhanden, Beleg …"), nie überschrieben.
- **Nur Fast-Forward in S2.** Eine lokal veränderte Lesekopie wird **gemeldet, nicht
  überschrieben** — dort könnte ungesicherte Arbeit liegen.
- **Geschrieben wird ausschließlich** in der SSOT-Ablage (Override `NC_SSOT_DIR`), im
  Sitzungswissen-Gerüst einer **eigenen** Wissensbasis (S4) und in der Infra-Registry (S3).
  Ohne eigene Wissensbasis schreibt S4 nichts. Die globale `CLAUDE.md` wird **nie** von diesem
  Skill beschrieben (S5 verifiziert nur).
- **Nie Skill-Dateien patchen:** Die Verknüpfung läuft ausschließlich über den festen
  SSOT-Pfad und die Infra-Registry — der Plugin-Cache wird bei jedem Auto-Update ersetzt.
- **Kollegen-OS-Satelliten (Felix, Biggi) brauchen hier nichts:** ihr Repo ist das
  Plugin, ihre SSOT ist eigenständig und bleibt es (Isolations-Invariante). Dieser Skill
  provisioniert sie weder, noch liest er sie.
- Keine Token- oder Credential-Werte in Lagebild, Bericht oder Registry. Keine
  personenbezogenen Pfade annehmen.
- Bei unbekannten Szenarien oder widersprüchlichen Angaben **nachfragen statt raten**.
- **Nie behaupten, eine Schicht sei grün, ohne die Ausgabe gesehen zu haben.**

## Verifikation

- Der Abschlussbericht zeigt alle sechs Schichten grün **mit Beleg je Schicht** — oder
  benennt die offenen Schichten samt nächstem Schritt.
- Die Infra-Registry existiert, ihre Pfade sind absolut und zeigen auf echte Bestände
  (Stichprobe: `git -C <ssot-pfad> remote get-url origin`).
- Der SSOT-Klon trägt Repo-Inhalt auch **außerhalb** des Wissenspfads (etwa `plugins/`) —
  eine Kopie, die nur den Wissenspfad enthält, ist ein Sparse-Relikt und gehört gemeldet.
- Ein unmittelbarer Zweitlauf meldet **100 % Skip aller Herstellungsschritte**; einzige
  Schreibaktion ist die Registry-Aktualisierung (`zuletztGeprueft`) — Idempotenz-Probe.
- `/nc:os-info` listet Kern + installierte Abteilungsplugins.
