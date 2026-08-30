# Standardprozess: Claude Team Distribution

> **Zweck:** Beschreibt, wie das Onsite.ai-OS als Plugin über einen Claude Team / Enterprise
> Workspace an das gesamte Dev-Team verteilt wird — ohne dass Kollegen MCP-Server manuell
> konfigurieren oder Skills per Hand installieren müssen. OS-internes
> Distributions-Betriebswissen (kein Feature-Manual — die sind nur extern,
> Maintainer-Entscheid 2026-08-14; Titel nachgezogen 2026-08-21).
> **Voraussetzung:** Claude Team oder Enterprise Plan mit Admin-Zugriff.
> **Stand:** 2026-08-17 · Pflege: Onsite.ai-Dev-Team (Wissensklasse: Datum statt Version,
> Leitplanke 7 — die frühere Versions-Historie 1.1.0–1.4.0 steht in der Git-Historie)
> **Kette:** Release-Zug (`Aktualisierungs-Index` §3.6) → **dieser Prozess** → `claude-netz-bau.md` (Autosync je Session beim Team-Mitglied)

---

## 1. Übersicht

### 1.1 Konzept

Das Onsite.ai-OS wird als **Plugin-Familie in einem Marketplace** gepackt: Kern `oai` plus
je Abteilung ein Plugin. Der Marketplace ist ein Git-Repo
(`github.com/onsite-ai-devs/Onsite.ai-OS`). Sobald ein Kollege den Marketplace einmalig
hinzufügt und **sein Abteilungsplugin** installiert, erhält er:

- Die Skills seiner Abteilung (z. B. `oai-development`: 17 Skills in 6 Modulen — Feature, MR,
  Review, QS, Release, PartSens-Betrieb — unter dem Namespace `/oai-development:<skill>`)
- Den Kern `oai` **transitiv** über `dependencies` (Shared-Skills der ständigen Abteilung
  `gemeinsam`, Kontroll-Hooks — FFG v2 ist gebaut und aktiv —, WP-Rahmen WP0–WP8)
- Auto-Updates bei jedem Push in das Repo (mit Version-Bump des betroffenen Plugins)

Zusätzlich wird der **GitLab MCP-Connector** von Admin-Seite org-weit gesetzt und synct
automatisch zu Claude Code CLI — keine manuelle `.claude.json`-Editierung mehr bei jedem
Kollegen.

### 1.2 Was der Plan liefert (und was nicht)

| Claude Team / Enterprise Feature | Verfügbar | Relevanz für OS |
|---|---|---|
| Org-weite Connectors (MCP-Server) | ✅ | GitLab MCP wird zentral gesetzt |
| Org-weite Skills (Auto-Sync zu CLI) | ❌ Nur Web/Desktop/Mobile, nicht CLI | Skills gehen über Plugin, nicht über org-level |
| Org-weite Plugins / Marketplaces | ✅ Auto-Update aus Git-Repo | OS wird darüber verteilt |
| Managed Policy Settings | ✅ Enterprise only | Tool-Permissions org-weit erzwingbar |
| Spend Caps per User | ✅ Enterprise only | Kostenkontrolle |
| Usage Analytics | ✅ Team + Enterprise | Nachvervollständigung der Nutzung |

> **Wichtig (Stand Juli 2026):** Claude Code CLI erhält **keine** auto-installierten
> Plugins oder Skills vom Workspace. Kollegen müssen den Marketplace **einmal manuell
> hinzufügen** (`/plugin marketplace add …`). Danach laufen alle Updates automatisch.
> Siehe [Sean Lynch's Recherche](https://sean.lyn.ch/claude-org-plugins-connectors-skills/).

---

## 2. Voraussetzungen

### 2.1 Auf Anthropic-Seite

- **Claude Team Plan** ($30/User/Monat) oder **Enterprise Plan** (~$60/User/Monat)
- Admin-Zugriff auf den Workspace
- Premium Seats mit Claude Code-Zugriff für alle Entwickler

### 2.2 Auf GitHub-Seite

- GitHub-Organisation `onsite-ai-devs` existiert
- Repo `Onsite.ai-OS` existiert (dieses Repo)
- Admin-Recht auf das Repo für Plugin-Updates

### 2.3 Bei jedem Kollegen

- Claude Code installiert (CLI oder Desktop)
- Node.js ≥ 22.21.1 (für `npx` — der MCP-Server läuft darüber)
- Git mit SSH-Zugriff auf das `offsite`-Repo
- Claude Team Seat zugewiesen

---

## 3. Einrichtung (Admin-Seite)

### 3.1 Repo als Marketplace strukturieren

Das Repo hat folgende Struktur (realer Build-Stand Kern 0.24.0, Spec §15.16/§15.18/§15.33/§15.42 — die
Repo-Wurzel ist **Marketplace-Wurzel**, unter `plugins/` liegt nur noch der Kern; alle drei
Abteilungen sind Satelliten mit eigenen Repos):

```
Onsite.ai-OS/
├── .claude-plugin/
│   └── marketplace.json              ← Marketplace-Manifest (`onsite-ai-os`, vier Einträge; Satelliten per ref+Commit-SHA gepinnt)
├── plugins/
│   ├── oai/                          ← Kern-Plugin (Namespace /oai:)
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/                   ← Abteilung `gemeinsam`, 15 gebaute Skills + Platzhalter grill-me
│   │   ├── agents/                   ← Kern-Subagenten (sync-nachzug-executor, fit-pruefer)
│   │   ├── hooks/                    ← Kontroll-Schicht (FFG, Start, Autosync, Queue, Wissens-Zeiger)
│   │   ├── tests/                    ← node --test
│   │   ├── wp-rahmen.md              ← normativer WP-Rahmen WP0–WP8
│   │   ├── module-registry.json      ← Metadaten-SSOT (steuert nichts aus)
│   │   └── referenz/                 ← skill-authoring.md, agent-authoring.md, wissens-router.md, pflege-auspraegung.md
│   ├── <abteilung>/                  ← Abteilung (Namespace /oai-<abteilung>:)
│   │   ├── .claude-plugin/plugin.json   (dependencies: ["oai"])
│   │   ├── workflow.md               ← Fachablauf WP1–WP7
│   │   └── skills/                   ← Skills, flaches Layout
│   │       ├── feat-start/SKILL.md
│   │       └── …
│   ├── (oai-development, oai-marketing, oai-controlling → Satelliten,
│   │    §15.19/§15.33/§15.42: eigene private Repos)
├── knowledge base/                   ← Wissensbasis (Vision, Specs, Manuals, Protokolle, Regeln)
│   ├── SSOT-Document-Index.md        ← Routing + Triage aller Quellen (einzige Datei oben)
│   ├── project-meta-infos/           ← Spec, Betriebshandbuch, Produktarchitektur
│   ├── Aktive Baupläne/              ← laufend · Bauplan-archiv/ ← abgeschlossen
│   ├── plugin-maintanance-ruleset-source/
│   │   └── vorlagen/abteilungsplugin/  ← Vorlage (kein Plugin, .vorlage-Endungen; seit 2026-08-21 in der SSOT)
│   ├── feature-manuals/
│   └── …
└── README.md
```

> **Strukturegel:** Nur Manifeste (`marketplace.json`, `plugin.json`) leben in
> `.claude-plugin/`. Skills, Hooks, Commands gehören in die jeweiligen Ordner daneben.
> Skills liegen im Default-Verzeichnis `skills/<name>/SKILL.md` und werden **automatisch
> gescannt** — kein Plugin nutzt ein `skills`-Array (§3.3).

### 3.2 Marketplace-Manifest (`marketplace.json`)

Realer Stand seit dem Multi-Plugin-Umbau (`.claude-plugin/marketplace.json` im Repo-Root —
gekürzt, vier Einträge nach demselben Muster; **kein** Eintrag trägt ein `version`-Feld,
siehe Versions-Regel in §3.3):

```json
{
  "name": "onsite-ai-os",
  "owner": {
    "name": "Onsite.ai Dev Team",
    "email": "dev@onsite.ai"
  },
  "description": "Interner Marketplace des Onsite.ai-Teams: verteilt den Kern oai und je Abteilung ein eigenes Plugin.",
  "plugins": [
    {
      "name": "oai",
      "source": "./plugins/oai",
      "description": "Kern des Onsite.ai-OS: ständige Abteilung gemeinsam, Kontroll-Hook FFG, WP-Rahmen, Registry.",
      "category": "kern"
    },
    {
      "name": "oai-controlling",
      "source": {
        "source": "github",
        "repo": "onsite-ai-devs/Onsite.ai-OS-Controlling",
        "ref": "v0.2.0",
        "sha": "a4ff53ae3a77146a9fdeee6b5a8892742fef369c"
      },
      "description": "Abteilung controlling: CEO-/Steuerungsthemen, Module in Planung.",
      "category": "abteilung"
    }
  ]
}
```

### 3.3 Plugin-Manifest (`plugin.json`)

Realer Stand am Beispiel der Abteilung development
(Beispiel `oai-development`; seit 2026-08-14 im Satelliten-Repo an dessen Wurzel unter `.claude-plugin/plugin.json`, Spec §15.33):

```json
{
  "name": "oai-development",
  "displayName": "Onsite.ai-OS — Abteilung development",
  "description": "Abteilung development des Onsite.ai-OS: 17 Skills in 6 Modulen für den offsite-Zyklus",
  "version": "0.13.0",
  "author": { "name": "Onsite.ai Dev Team" },
  "dependencies": ["oai"]
}
```

Kein `skills`-Feld: Die Skills liegen im Default-Verzeichnis `skills/<name>/SKILL.md` und werden
automatisch gescannt. `dependencies: ["oai"]` zieht den Kern beim Installieren **und** beim
Aktivieren transitiv mit.

> **Versions-Regel:** Bei jeder Änderung, die Kollegen erreichen soll, die Version des
> **betroffenen Plugins** hochzählen — **ausschließlich** in
> `plugins/<name>/.claude-plugin/plugin.json`; beim Kern zusätzlich `VERSION` und
> `plugins/oai/module-registry.json`. Abteilungsplugins zählen eigenständig.
> **Nie zusätzlich im Marketplace-Eintrag:** Claude Code löst die Version zuerst aus
> `plugin.json` auf und ignoriert einen Marketplace-Wert ohne Warnung, sodass eine veraltete
> Manifest-Version ihn still maskieren würde (plugin-marketplaces, „Version resolution").
> Kein Version-Bump = kein Auto-Update. Siehe [GitHub Issue #49410](https://github.com/anthropics/claude-code/issues/49410).

### 3.4 GitLab MCP-Connector org-weit setzen

Im Claude Team/Enterprise Admin-Panel:

1. **Settings → Connectors → Add Connector**
2. Connector-Typ: **Custom MCP Server (stdio)**
3. Konfiguration:
   ```
   Command: npx
   Args: -y @zereight/mcp-gitlab
   Env:
     GITLAB_API_URL=https://<gitlab-host>/api/v4
     GITLAB_PERSONAL_ACCESS_TOKEN=<wird pro User gesetzt>
     GITLAB_READ_ONLY_MODE=true
   ```
4. Für alle User im Workspace aktivieren

> **Achtung — Token-Problem:** Der `GITLAB_PERSONAL_ACCESS_TOKEN` ist pro User
> unterschiedlich. Der org-weite Connector kann nur die Connection-Struktur setzen,
> nicht den individuellen Token. Lösung:
> - **Option A:** Jeder Kollege setzt seinen eigenen Token nach der Ersteinrichtung
>   lokal in seiner Claude-Code-Config.
> - **Option B:** Das Admin-Team verwaltet einen Service-Account-Token mit `read_api`
>   Scope und verteilt ihn org-weit (einfacher, aber weniger granular).

> **Token-Verbrauch-Warnung:** Org-weite Connectors werden bei **allen** Claude Code
> CLI-Nutzern automatisch aktiviert. Das kann den Context-Verbrauch massiv erhöhen.
> Kollegen, die den GitLab-Connector nicht wollen, können ihn deaktivieren mit:
> `ENABLE_CLAUDEAI_MCP_SERVERS=false` in ihrer lokalen Config.

---

## 4. Einrichtung (Kollegen-Seite)

### 4.1 Einmalige Installation

Jeder Kollege führt in Claude Code **einmalig** zwei Befehle aus — installiert wird das
**Plugin der eigenen Abteilung**, der Kern `oai` kommt transitiv mit:

```
/plugin marketplace add onsite-ai-devs/Onsite.ai-OS
/plugin install oai-development@onsite-ai-os --scope user
```

(Marketing/Controlling analog: `/plugin install oai-marketing@onsite-ai-os` bzw.
`oai-controlling@onsite-ai-os`. Nur `oai` allein zu installieren liefert keine
Fach-Skills.) Danach: Auto-Update aktiviert. Alle zukünftigen
Skill/Hook/Command-Änderungen erreichen den Kollegen automatisch beim nächsten
Session-Start.

> **Private Satelliten-Repos (ab `oai-marketing`, Spec §15.19):** Der Klon läuft per
> Default über **SSH** — auf Maschinen ohne eingerichteten SSH-Key vor dem ersten Install
> einmalig die Umgebungsvariable `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen, sonst schlägt
> er mit `Permission denied (publickey)` fehl. Mit der Variable greifen die vorhandenen
> gh-Credentials.

### 4.2 Optional: Token lokal setzen

Falls der org-weite Connector den GitLab-Token nicht enthält:

In `~/.claude.json` ergänzen (oder vom Connector überschreiben lassen):

```json
{
  "mcpServers": {
    "gitlab": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@zereight/mcp-gitlab"],
      "env": {
        "GITLAB_API_URL": "https://<gitlab-host>/api/v4",
        "GITLAB_PERSONAL_ACCESS_TOKEN": "glpat-<eigener-token>",
        "GITLAB_READ_ONLY_MODE": "true"
      }
    }
  }
}
```

### 4.3 Projekt-Level Auto-Enable (optional)

Um das Abteilungsplugin für alle automatisch zu aktivieren, die im `offsite`-Repo arbeiten,
eine `.claude/settings.json` ins `offsite`-Repo committen — aktiviert wird
`oai-development` (das aktiviert den Kern transitiv mit; `oai` allein würde die
Abteilung **nicht** aktivieren):

```json
{
  "enabledPlugins": {
    "oai-development@onsite-ai-os": true
  }
}
```

Neue Contributor:innen bekommen das Plugin dann automatisch beim ersten Öffnen des
Projekts — sofern sie den Marketplace einmal hinzugefügt haben.

---

## 5. Update-Workflow

### 5.1 Änderungen veröffentlichen

> **Seit der Zwei-Klassen-Buchführung (§15.37, 2026-08-15) gilt:** die
> Schritte 2 und 4 unten betreffen **nur noch den Release-Zug auf Maintainer-Kommando**.
> Arbeitsstränge bauen versionslos in Worktrees/PRs und schreiben kein CHANGELOG;
> verbindlich ist der `Aktualisierungs-Index` §0/§3.6.

1. Skill/Hook/Command im `Onsite.ai-OS`-Repo (bzw. Satelliten-Repo) per Strang-PR anpassen
2. Version des **betroffenen Plugins** bumpen — **nur** in
   `plugins/<name>/.claude-plugin/plugin.json` → `version`
   (der Marketplace-Eintrag bekommt **kein** `version`-Feld);
   **beim Kern zusätzlich:** `VERSION` und `plugins/oai/module-registry.json` → `version` —
   **vergibt ausschließlich der Release-Zug**, nie der Strang
3. Beide Ebenen validieren: `claude plugin validate .` **und**
   `claude plugin validate plugins/<name> --strict` je berührtem Plugin; dazu
   `node --test plugins/oai/tests/*.test.mjs` (enthält die Struktur-Invarianten)
4. Release-Zug: Tag `v<version>` + GitHub-Release, danach Marketplace-Pin der Satelliten
   per Commit-SHA nachziehen (`abteilungs-plugin-bau.md` §3a)
5. Kollegen erhalten die Änderung beim nächsten Claude-Code-Session-Start

### 5.2 Bekannte Auto-Update-Probleme (Stand Juli 2026)

| Problem | Status | Workaround |
|---|---|---|
| Auto-Update führt `git fetch` aus, aber kein `git pull` — Version bleibt stale | [GitHub Issue #49410](https://github.com/anthropics/claude-code/issues/49410) | Kollege muss `/plugin marketplace update onsite-ai-os` manuell ausführen |
| Auto-Update verwaist alle Versionen, Plugin lädt nicht beim Session-Start | [GitHub Issue #60219](https://github.com/anthropics/claude-code/issues/60219) | `/reload-plugins` nach Session-Start ausführen |

> Diese Bugs sind bekannt und werden von Anthropic bearbeitet. Bis sie gefixt sind,
> sollte im Team-Chat auf Updates hingewiesen werden, damit Kollegen ggf. manuell
> updaten.

### 5.3 Dev-Version für den Maintainer

Der Maintainer (Lucas) arbeitet mit einer lokalen Dev-Version, die direkt aus dem
Arbeitsverzeichnis lädt — nicht aus dem GitHub-Clone:

```
/plugin marketplace add /path/to/lokal/Onsite.ai-OS
```

Änderungen werden nach `/reload-plugins` sofort aktiv, ohne Commit oder Push.
Die Dev-Version und die verteilte Version können koexistieren, wenn der Marketplace-Name
unterschiedlich ist (z.B. `onsite-ai-os-dev` lokal vs. `onsite-ai-os` remote).

---

## 6. Was überflüssig wird und was nicht

### 6.1 Was Claude Team/Enterprise vom OS abdeckt

| OS-Komponente | Ohne Team | Mit Team |
|---|---|---|
| MCP-Server-Config (`~/.claude.json` bei jedem) | Jeder Kollege manuell | Admin setzt Connector org-weit |
| Plugin-Installation | `git clone` + manuell | Einmal `/plugin marketplace add`, dann Auto-Update |
| Permission-Management | Jeder Kollege selbst | Enterprise: Admin erzwingt Policies org-weit |
| Onboarding | MCP + Plugin + Skills manuell | Seat zuweisen → Marketplace einmal add → fertig |
| Offboarding | Lokale Config löschen | Seat entfernen → Zugriff weg |

### 6.2 Was vom OS unersetzlich bleibt

| OS-Komponente | Warum Claude Team es nicht ersetzt |
|---|---|
| **Abteilung development: Feature-Skills** (`feat-*`) | PAR-Ticket → Branch → MR-Slices ist team-spezifisch. Kein Standard-Feature. |
| **Abteilung development: MR-/Review-Skills** (`mr-*`, `rev-*`) | Team-spezifischer GitLab-MR- und zweistufiger Review-Prozess (onsite + isento) für das `offsite`-Repo. |
| **Abteilung development: QS-/Release-Skills** (`qs-*`, `rel-*`) | Jira-QS-Zyklus (QS ≠ Review, Feedback als Jira-Kommentare) und `exec-*`-Prod-Ops-Checklisten. |
| **Incident-Wissen** | PAR-spezifische Fehlermuster (PAR-1593, Blue-Green-Timing) — aktuell in den `qs-*`-Skills, künftig ggf. eigenes Modul. |
| **Core-Anweisungen (CLAUDE.md)** | Projektwissen über Offsite-Architektur, Sync-Direction, Data Model, Auth-Chain. |
| **Hooks** | Domänen-Hooks der Abteilungen sind möglich (Prüfungs-Eigentum, §15.22; **Hook-Norm W4, 2026-08-21**: Auslieferung trägt nur Kern-Hooks — ein etablierter Satellit darf eigene spezialisierte, nicht-redundante, nicht-kollidierende Hooks tragen); ein Pre-Commit-Hook wird es nie geben (§15.43). Das Safety-Gate (Gate 3) ist Kern-Infrastruktur, kein Abteilungsthema (§15.26). |
| **GitLab CE Integration** | Anthropic unterstützt nativ nur GitHub. Das MCP-Setup bleibt nötig. |

---

## 7. Designentscheidungen

### 7.1 Warum Plugin-Marketplace statt org-level Skills?

Claude Team/Enterprise kann Skills direkt auf Org-Ebene verteilen — aber **nur für Claude
Web/Desktop/Mobile, nicht für Claude Code CLI**. Da das Team primär in Claude Code CLI
arbeitet, ist der Plugin-Marketplace der einzige Weg, der dort funktioniert.

Plugins bieten zudem: Auto-Update aus Git-Repo, Versionierung, Bündelung von
Skills + Hooks + Commands + MCP in einer Einheit.

### 7.2 Warum Auto-Update aus dem Git-Repo?

Jeder Merge in den `main`-Branch mit Version-Bump propagiert automatisch zu allen
Kollegen. Das OS entwickelt sich weiter, ohne dass jemand etwas tun muss. Das ist der
Vorteil gegenüber manueller Verteilung oder org-level Skills (die manuell hochgeladen
und manuell aktualisiert werden müssen).

### 7.3 Warum das Read-Only-MCP org-weit setzen?

Die zweifache Sperre (Token-Scope `read_api` + `GITLAB_READ_ONLY_MODE=true`) verhindert,
dass ein AI-Agent versehentlich MRs mergt oder Issues löscht. Im Team-Kontext mit
mehreren Entwicklern ist diese Sicherheitsmaßnahme wichtiger als im Einzelentwickler-Setup.
Details siehe `gitlab-mcp-integration.md` Abschnitt 8.2.

### 7.4 Warum Dev-Version und verteilte Version trennen?

Der Maintainer braucht sofortiges Feedback bei Skill-Änderungen (`/reload-plugins`),
ohne Commit oder Push. Die verteilte Version läuft über GitHub mit Auto-Update.
Durch unterschiedliche Marketplace-Namen (`onsite-ai-os-dev` lokal vs. `onsite-ai-os`
remote) können beide koexistieren, ohne sich zu stören.

### 7.5 Warum das Token-Problem dokumentieren und nicht lösen?

Der org-weite Connector kann die Connection-Struktur (Command, Args, Env-Keys) zentral
setzen, aber keine individuellen User-Tokens. Eine echte Lösung bräuchte entweder:
- **OAuth2-Flow** pro User (technisch möglich, aber komplex im Setup), oder
- Einen **Service-Account-Token** für alle (einfach, aber weniger granular).

Bis eine dieser Optionen umgesetzt wird, ist der pragmatische Weg: Admin setzt die
Connection-Struktur org-weit, jeder Kollege setzt seinen Token einmalig lokal.

### 7.6 Warum trotzdem Onsite.ai-OS bauen, wenn Claude Team vieles abdeckt?

Claude Team/Enterprise löst das **Verteilungs- und Verwaltungsproblem** — nicht das
**Domänenwissen-Problem**. Die Plattform liefert: Seats, Billing, Analytics,
Connector-Distribution, Policy-Enforcement. Aber sie liefert **nicht**: Den
PAR-Ticket-Workflow, den GitLab-MR-Code-Review-Prozess, die Knowledge über
Tryb-Sync-Fehlerquellen, die Blue-Green-Deploy-Logik.

Onsite.ai-OS ist die Schicht **auf** der Plattform — es macht Claude Code erst
nützlich für den konkreten Entwickleralltag des Teams. Das eine kann das andere
nicht ersetzen.
