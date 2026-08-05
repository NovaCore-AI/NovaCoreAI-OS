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
- **Marker-Unterschied:** Der `.nc-os`-Marker aus Abschnitt 2 scoped nur die
  Session-Begrüßung des Kerns `nc` (und des Felix-OS, das den Marker-Hook portiert hat).
  Das **Biggi-OS arbeitet markerlos** — sein Session-Start-Zwang injiziert den
  Pflicht-Einstieg in jede Session (Opt-out nur per Env `NC_START_GATE=off`).

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
Projekt-Memory unter `.nc/erinnerung/` bleibt unverändert gültig.

## 2. Arbeits-Repo einrichten (einmal pro Repo)

```bash
touch .nc-os                          # Marker-DATEI — aktiviert die Session-Begrüßung
mkdir -p .nc/erinnerung/journal
echo ".nc/" >> .gitignore             # Kunden-Interna nie committen
```

Initialen Stand anlegen (`.nc/erinnerung/stand.md`):

```markdown
# Stand — <Projektname>

## Überblick
<Kurzbeschreibung des Projekts>

## Aktueller Zustand
<Branches, offene PRs, bekannte Risiken>
```

**Wichtig:** Der Marker muss eine **Datei** sein (`touch .nc-os`), kein Verzeichnis — und
er scoped nur die Begrüßung. Das Fact-Forcing-Gate (FFG) ist **überall** aktiv, wo der
Kern installiert ist; Opt-out ausschließlich per Umgebungsvariable `NC_FFG=off`
(menschliche Entscheidung, kein Agenten-Schalter). Für das **Biggi-OS** entfällt der
Marker-Schritt komplett (markerloser Session-Start-Zwang, §1b).

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
| Session-Ende | `/nc:save-session` |

Der Rahmen WP0–WP8 steht in `wp-rahmen.md` des Kern-Plugins, der Fachablauf in
`workflow.md` der Abteilung.

## 4. Aktualisieren

Updates kommen über den Marketplace: `/plugin update` (bzw. Auto-Update). Ein Update
erscheint nur, wenn die Plugin-Version in `plugin.json` gebumpt wurde.

## Fehlerbehebung

- **Skills erscheinen nicht:** `/plugin list` prüfen; ggf. `/plugin update` und Claude Code
  neu starten. Bei lokalem Checkout: `/reload-plugins`.
- **Keine Begrüßung beim Start:** Liegt im Repo-Root eine Marker-**Datei** `.nc-os`?
  (Ein Verzeichnis zählt nicht — bewusste Härtung nach Bug 0.1.1.)
- **FFG blockt einen Aufruf:** Das ist das erwartete Verhalten — geforderte Fakten im
  Antworttext nennen und denselben Aufruf wiederholen. Gate-Texte erklären genau, was
  fehlt.
- **`Permission denied (publickey)` bei der Installation:** siehe SSH-Hinweis oben.
