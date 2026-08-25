# ONBOARDING — Ersteinrichtung NovaCore-OS

## Voraussetzungen

- **Claude Code ≥ 2.1.193** (`claude --version`) — das Abteilungsmodell braucht die
  Dependency-Mechanik dieser Version
- **Node.js ≥ 18** (`node --version`) — für die Kontroll-Hooks
- GitHub-Zugriff auf `NovaCore-AI/NovaCoreAI-OS`

## 1. Installation (einmal pro Rechner)

In einer Claude-Code-Session:

```
/plugin marketplace add NovaCore-AI/NovaCoreAI-OS
/plugin install nc-development@novacore-os
```

Der Kern `nc` wird als Dependency **automatisch** mitinstalliert und -aktiviert.
Verifikation: `/plugin list` zeigt `nc` und `nc-development`.

Für lokale Entwicklung am OS selbst: `/plugin marketplace add <pfad-zum-checkout>` und
identisch installieren.

> **Privates Repo + SSH:** GitHub-Shorthand-Quellen klonen per Default über SSH. Ohne
> geladenen SSH-Key schlägt die Installation mit `Permission denied (publickey)` fehl —
> dann `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen (nutzt die gh/git-Credentials) oder
> einen SSH-Key einrichten.

## 1a. Wissensbasis bereitstellen (einmal pro Rechner)

Der Marketplace liefert **nur das Plugin** aus — Hooks, Skills, Formatregeln, WP-Rahmen.
Die **Wissensbasis liegt im OS-Repo außerhalb des Plugin-Verzeichnisses** und reist deshalb
nicht mit. `/nc:start` braucht sie aber, und der Firmen-Block in der globalen `CLAUDE.md`
verweist auf sie. Deshalb nach der Installation **einmal**:

```
/nc:setup
```

Der Skill ist seit Kern 0.8.0 ein **Reconciler über sechs Soll-Schichten S0–S6**: Er prüft
Voraussetzungen und Plugin-Stand, klont die nötigen Quellen vollständig nach
`~/.nc/ssot/<repo-name>/` (die Verlinkung läuft über diesen festen Pfad, den der
Firmen-Block in der globalen `CLAUDE.md` als Einstieg nennt), legt das
Sitzungswissen-Gerüst im Arbeits-Repo an, verifiziert die CLAUDE-Lokaldokumente und
schreibt die Infra-Registry `~/.claude/nc/infra.json`. Er ist idempotent: bei jedem
weiteren Aufruf zieht er nur per Fast-Forward nach und überspringt Erledigtes. Später
erneut aufrufen, wenn die Wissensbasis veraltet ist — automatisch geschieht das **nicht**.

> **Windows-Hinweis:** `git config --global core.autocrlf input` setzen. Der
> Doks-Autosync vergleicht seine Ziele inzwischen zeilenenden-normalisiert (kein
> Dauer-Rewrite mehr durch CRLF), aber einheitliche LF-Zeilenenden ersparen Diff-Rauschen
> in allen anderen Werkzeugen.

- **Voraussetzung:** `git` im PATH **und** Zugriff auf das private OS-Repo (z. B. per
  `gh auth login` oder Git-Credential-Helper). Fehlt eines von beidem, sagt der Skill das
  klar — er täuscht keinen Erfolg vor.
- **Was er nie tut:** mergen, rebasen, zurücksetzen oder eine lokal veränderte Kopie
  überschreiben. Solche Fälle meldet er, statt sie zu überfahren.
- **Satelliten brauchen das nicht:** Bei `nc-felix`/`nc-biggi` ist das Repo das Plugin —
  ihr Wissen reist im Paket mit und aktualisiert sich über den Marketplace.

> **WSL zählt als eigener Rechner.** Windows und WSL haben getrennte Home-Verzeichnisse,
> getrennte `~/.claude`-Konfigurationen und getrennte Git-Credentials. Wer Claude Code
> (auch) in WSL nutzt, führt Installation (§1) und `/nc:setup` dort **einmal separat**
> aus; die Voraussetzungen gelten je Umgebung — Node.js, `git` und Zugang zum privaten
> Repo (z. B. `gh auth login` innerhalb von WSL). `NC_SSOT_DIR` nie auf einen
> `/mnt/c/…`-Pfad legen: zwei Umgebungen teilten sich sonst einen Klon mit
> unterschiedlichem Locking- und Zeilenenden-Verhalten.

## 1b. Kollegen-OS installieren (Satelliten `nc-felix` / `nc-biggi`)

Die eigenständigen Abteilungs-OS installieren sich aus demselben Marketplace:

```
/plugin marketplace add NovaCore-AI/NovaCoreAI-OS
/plugin install nc-biggi@novacore-os      # bzw. nc-felix@novacore-os
```

- Sie bringen Kernmodul **und** Kontroll-Schicht selbst mit und hängen **nicht** am Kern
  `nc` — `/plugin list` zeigt nur das eine Plugin.
- **Koexistenz:** `nc`/`nc-development`, `nc-felix` und `nc-biggi` nie parallel in
  derselben Session betreiben (doppelte Gates) — wer mehrere installiert hat, deaktiviert
  alle bis auf eines (`/plugin disable …`).
- Private Satelliten-Repos: der SSH-Hinweis oben gilt auch hier
  (`CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`).
- **Alle markerlos (Stand 2026-08-12):** Kern `nc`, **Biggi-OS** und **Felix-OS** arbeiten
  **markerlos** — ihr Session-Start-Zwang injiziert den Pflicht-Einstieg in jede Session und
  blockt schreibende Aktionen bis zum Fakten-Stempel (Opt-out nur per Env
  `NC_START_GATE=off`). Die frühere Ausnahme des Felix-OS — ein marker-gebundener
  Begrüßungs-Hook an einer `.nc-os`-**Datei** im Repo-Root, der nur Komfort-Hinweis statt Gate
  war — ist mit `nc-felix` **0.4.1** entfallen.

## Migration von v0.2.0 (altes Single-Plugin + `ncos`-CLI)

Die alte Install-Identität `novacoreai-os@novacoreai` hat **keinen** Auto-Upgrade-Pfad auf
die neue Struktur. Einmalig:

```
/plugin uninstall novacoreai-os@novacoreai
/plugin marketplace remove novacoreai
/plugin marketplace add NovaCore-AI/NovaCoreAI-OS
/plugin install nc-development@novacore-os
```

Zusätzlich aufräumen (stammt vom alten Setup-Skript, wird nicht mehr genutzt):
Staging-Verzeichnis `~/.nc-os/` löschen; einen globalen `ncos`-Befehl aus dem PATH nehmen.
Sitzungswissen wohnt seit Kern 0.13.0 **nicht mehr** unter `.nc/erinnerung/` (BREAKING) —
siehe Abschnitt 2 für den aktuellen Ablageort.

## 2. Arbeits-Repo einrichten (einmal pro Repo)

**Es gibt keinen manuellen Einrichtungsschritt mehr.** Seit Phase I (Kern 0.13.0) bestimmt
`/nc:start` selbst, wo das Sitzungswissen wohnt:

- **Repo mit eigener Wissensbasis** (SSOT-Kategorie mit Master-Index — im OS-Repo:
  `knowledge-base/`): Das Sitzungswissen liegt **committet** unter `sitzungswissen/`
  (`roll-up.md`, `offene-straenge-register.md`, je Abteilung `stand.md` + `journal/`).
  Fehlende Bausteine legt `/nc:start` nach dem Fakten-Stempel selbst an — nichts ist vorab
  von Hand zu erzeugen.
- **Repo ohne eigene Wissensbasis** (der Regelfall bei Kunden- und Fremd-Repos): **kein
  Dateistrom.** Der Stand wird ausschließlich ins Projekt-Memory von Claude Code geschrieben
  (`~/.claude/projects/<projekt-slug>/memory/`) — kein Verzeichnis, keine Datei, kein
  `.gitignore`-Eintrag nötig.

**Altstand:** Wer noch einen `.nc/erinnerung/`-Bestand aus früheren Kern-Versionen im Repo
findet — der frühere lokale Strom ist abgeschafft. `/nc:start` meldet den Fund, liest ihn aber
nicht als Quelle; Migration oder Löschung entscheidet der Mensch.

**Wichtig — es gibt keinen Marker-Schritt mehr.** Seit dem Umbau 2026-08-10 arbeitet der
Kern `nc` vollständig **markerlos**: Ein Gate, das man vergessen kann, ist kein Gate. Aktiv
ist alles überall dort, wo der Kern installiert ist:

| Was | Wirkung | Opt-out (menschliche Entscheidung, kein Agenten-Schalter) |
|---|---|---|
| **Gate 1 — FFG** | verlangt Fakten vor schreibenden Aktionen | `NC_FFG=off` |
| **Gate 2 — Session-Start-Zwang** | injiziert Pflicht-Einstieg + lebenden Stand; **blockt jede schreibende Aktion**, bis `/nc:start` mit dem Fakten-Stempel abgeschlossen ist | `NC_START_GATE=off` (ein Schalter für beide Teile) |
| **Doks-Autosync** | hält den Firmen-Block in `~/.claude/CLAUDE.md` aktuell; die Privat-Zone außerhalb der Marker bleibt unberührt | `NC_AUTOSYNC=off` |

Eine noch vorhandene `.nc-os`-Datei aus früheren Setups **stört nicht** und kann gelöscht
werden — sie hat keine Funktion mehr; seit `nc-felix` 0.4.1 gilt das auch für das
**Felix-OS**, dessen frühere Marker-Ausnahme entfallen ist (§1b).

**Erste Session nach der Installation:** Vor der ersten Änderung `/nc:start` ausführen. Wer
das überspringt, bekommt beim ersten Schreibversuch eine Ablehnung, die den exakten
Stempel-Befehl nennt — Lesen, Fragen und Read-only-Git bleiben jederzeit frei.

## 3. Arbeiten mit dem OS

| Wann | Was |
|---|---|
| Session-Beginn | `/nc:start` |
| Neues Feature | `/nc-development:flc-feature-start` → `/nc-development:flc-plan` |
| Vor jedem Commit | `/nc-development:flc-commit-prep` |
| Bereit für Review | `/nc-development:flc-pr` |
| Review durchführen | `/nc-development:fe-review` bzw. `/nc-development:be-review` |
| WZS-Arbeit | `/nc-development:wzs-…` (Attribution, Blocker-Gate, Reward-Guard, …) |
| Zwischendurch | `/nc:journal` (Ereignis sofort festhalten) |
| Session-Ende | `/nc:end-session` (bis Kern 0.7.x: `/nc:save-session`) |

Der Rahmen WP0–WP8 steht in `wp-rahmen.md` des Kern-Plugins, der Fachablauf in
`workflow.md` der Abteilung.

## 4. Aktualisieren

Updates kommen über den Marketplace: `/plugin update` (bzw. Auto-Update). Ein Update
erscheint nur, wenn die Plugin-Version in `plugin.json` gebumpt wurde.

## Fehlerbehebung

- **Skills erscheinen nicht:** `/plugin list` prüfen; ggf. `/plugin update` und Claude Code
  neu starten. Bei lokalem Checkout: `/reload-plugins`.
- **Kein Pflicht-Einstieg-Block beim Start:** Steht `NC_START_GATE` auf einem Aus-Wert
  (`off`/`0`/`false`/`disabled`)? Der Block ist markerlos und erscheint sonst in jeder
  Session. (Ein `.nc-os`-Marker wird seit 2026-08-10 nicht mehr ausgewertet.)
- **Das Start-Gate lässt nichts schreiben:** Das ist das erwartete Verhalten vor
  `/nc:start`. Die Ablehnung nennt den exakten Stempel-Befehl samt Session-Schlüssel —
  `/nc:start` ausführen (oder dessen Schritte selbst erledigen), dann stempeln.
- **Der Firmen-Block taucht in `~/.claude/CLAUDE.md` auf:** gewollt (Doks-Autosync). Alles
  **außerhalb** der `NC:BLOCK`-Marker ist Privat-Zone und wird nie verändert; vor jedem
  Schreiben liegt eine Sicherung unter `<datei>.nc-autosync-backup`. Abschalten:
  `NC_AUTOSYNC=off`.
- **FFG blockt einen Aufruf:** Das ist das erwartete Verhalten — geforderte Fakten im
  Antworttext nennen und denselben Aufruf wiederholen. Gate-Texte erklären genau, was
  fehlt.
- **Nach `/nc:setup` liegt im Klon fast nur `knowledge-base/`:** Sparse-Relikt der
  Erstfassung des Skills (vor Kern 0.6.1). `/plugin update`, dann `/nc:setup` erneut
  ausführen — der Lauf erweitert die Kopie automatisch zum vollen Arbeitsbaum und meldet
  das. Kommt stattdessen `lokal-veraendert` zurück, liegen eigene Dateien oder Änderungen
  im Klon: sichern oder entfernen, dann `/nc:setup` erneut.
- **`Permission denied (publickey)` bei der Installation:** siehe SSH-Hinweis oben.
