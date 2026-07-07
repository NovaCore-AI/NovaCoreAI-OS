---
name: nc-setup
description: NovaCoreAI-OS initial installieren — deployt Skills und Hooks, legt den .nc-os-Marker und die Memory-Struktur an. Nutze diesen Skill, wenn ein Repo oder ein Rechner erstmalig mit dem Team-OS ausgestattet werden soll.
---

# /nc:setup — Team-OS installieren

## Zweck

Führt die Erstinstallation von NovaCoreAI-OS aus: global (Skills/Hooks deployen)
und pro Arbeits-Repo (Marker + Memory-Struktur).

## Ablauf

### Globale Installation (einmal pro Rechner)

1. **Voraussetzung prüfen:** Node.js v18+ (`node --version`).
2. **Setup ausführen:** Im OS-Repo `node setup.js` starten (oder `ncos setup`, falls die CLI installiert ist).
   - Liest `modules/module-registry.json` und stagt Core-Skills, Skills aktivierter Module und Hooks nach `~/.nc-os/plugin/`.
   - Schreibt das Deploy-Manifest nach `~/.nc-os/installed-manifest.json`.
   - Registriert das Plugin bei Claude Code (`claude plugin marketplace add` + `claude plugin install novacoreai-os@novacoreai`) — erst dadurch werden Skills und Hooks geladen.
3. **Ergebnis prüfen:** Ausgabe des Setups auf Warnungen kontrollieren (z.B. übersprungene Module wegen `minCoreVersion` oder fehlgeschlagene Claude-Registrierung — dann die genannten Befehle manuell ausführen).

### Repo-Einrichtung (einmal pro Arbeits-Repo)

4. **Marker anlegen:** Leere Datei `.nc-os` im Repo-Root erstellen — erst dadurch werden SessionStart-Hook und Safety-Gate in diesem Repo aktiv.
5. **Memory-Struktur anlegen:** `.nc/erinnerung/journal/` erstellen und eine initiale `.nc/erinnerung/stand.md` mit Projektüberblick schreiben.
6. **Ignorieren:** `.nc/` in `.gitignore` des Arbeits-Repos eintragen.

## Regeln

- Setup fasst nur eigene Dateien an (Deploy-Manifest); ECC-, uni:- oder User-Dateien werden nie verändert.
- Bei Fehlern abbrechen und den Fehler melden, nicht teilinstalliert weitermachen.
