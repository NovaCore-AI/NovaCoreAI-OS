# Team-Distribution — Standardprozess für NovaCore-OS

> **Verbindlich** für die Verteilung des NovaCore-OS an das Team über den vorhandenen
> Claude-Team-Workspace. **Dies ist eine Übersetzung, keine wörtliche Kopie:** Vorbild ist
> [`firmenkernprozesse/prozesskarten/06-claude-team-distribution.md`](../firmenkernprozesse/prozesskarten/06-claude-team-distribution.md)
> (extern geführt, für NovaCore **nicht normativ**) — Onsite verteilt über GitLab +
> GitLab-MCP + ein **privates** Repo, NovaCore verteilt über GitHub + Atlassian/Jira + ein
> **öffentliches** Marketplace-Repo. Firmenspezifische Grundlage: Bauplan
> [`2026-08-15-onsite-endstand-nachbau-bauplan.md`](../grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md)
> §9 N6 (Maintainer-Befragung, nach Merge PR #19).
>
> **Installation selbst steht nur in [`ONBOARDING.md`](../../ONBOARDING.md)** — hier keine
> Duplizierung, nur Verweis. Install-Fallen (SSH-Falle, Install-Probe in isoliertem
> `CLAUDE_CONFIG_DIR`) stehen in [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md)
> §3a/§3b — ebenfalls nur Verweis.
>
> **Rollen-Prinzip, weil dieses Repo öffentlich ist:** Dieses Dokument nennt **Rollen**,
> nie Klarnamen — **Admin** (Maintainer, CEO/CTO, Workspace-Admin, Merge-Recht), **Dev 1**
> (Design/Frontend/UX), **Dev 2** (Automatisierung/Hardware/Prozessoptimierung). Wer diese
> Rollen real innehat, steht **nicht** hier und gehört auch in künftige Payloads nie hinein
> (Invariante I9 des Bauplans).

## 1. Zweck in einem Satz

Das NovaCore-OS wird als **Plugin-Marketplace** aus dem öffentlichen Repo
`NovaCore-AI/NovaCoreAI-OS` verteilt; der vorhandene Claude-Team-Workspace übernimmt
Seat-Verwaltung, eine kleine Org-Ebene (Ebene 0) und die zentrale Freischaltung eines
Atlassian/Jira-Connectors — der Marketplace-Kanal selbst bleibt (wie beim Vorbild) der
einzige Weg, mit dem Claude Code CLI Skills, Hooks und Kern transitiv bekommt (Karte 06
§3.1: Org-Skills syncen **nicht** zur CLI, nur zu Web/Desktop/Mobile).

## 2. Admin-Seite — Claude-Team-Workspace

Der Workspace **existiert bereits**, **Admin** hat dort Admin-Rechte (Bauplan N6). Drei
Bausteine:

### 2.1 Ebene 0 — Org-Instructions (klein halten, Textentwurf freigabepflichtig)

[`NovaCore-OS-CLAUDE-Ebenen-Definition.md`](../grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md)
führt Ebene 0 (Org-Instructions, Team-Plan-Admin-Oberfläche, kein Sync-Mechanismus,
wirkt in CLI **und** Desktop-App) — Status dort (Stand 2026-08-10): **„nicht genutzt"**.
Bauplan N6 (2026-08-15) hält fest, dass der Workspace inzwischen vorhanden und Ebene 0
damit **bespielbar** ist; die Statuszeile der Ebenen-Definition selbst nachzuziehen ist
**nicht** Teil dieses Dokuments (kein Diff dort) und bleibt offen — die Diskrepanz wird
hier bewusst benannt statt still geglättet.

Ebene 0 bleibt bewusst **klein** — Doku-Inhalt bleibt Sache der Plugin-Ebenen (1/1b/2),
nicht der Org-Instructions (Grenze laut Ebenen-Definition: „klein halten, selten ändern,
keine Duplikation von Ebene-1-Inhalt"):

> **Textentwurf (freigabepflichtig, noch nicht in die Workspace-Settings eingetragen):**
> „Code-Artefakte (Branches, Commits, PR-Titel/-Texte, Code-Kommentare) englisch;
> Kommunikation, Tickets und Doku deutsch. Jira: Lesen frei, Statusübergänge/Felder nur
> mit Einzelfreigabe, kundensichtbare Freitexte nur durch einen Menschen. Das OS-Repo ist
> öffentlich — keine Klarnamen, keine Kundendaten, keine Zugänge in Commits oder
> Dateien."

Dieser Text ist ein **Entwurf**, keine vollzogene Änderung. Eintragen in die echten
Workspace-Settings verlangt ausdrückliche Freigabe (rote Linie: alles
Kundensichtbare/Konfigurationsseitige bleibt Mensch-only).

### 2.2 Zentrale Connector-Freischaltung — Atlassian/Jira

Onsite schaltet einen GitLab-MCP-Connector org-weit frei (Karte 06 §5.4); NovaCore hat
kein GitLab. Das Pendant ist der **Atlassian-Connector** für Jira:

- Freischaltung im Workspace-Admin-Panel durch **Admin** (analog Karte 06 §5.4: Settings
  → Connectors → Add Connector), org-weit für alle Seats.
- **Zwei-Stufen-Regel als Befugnisrahmen** (Bauplan N6 — NovaCore-eigene Spezifik, kein
  Karte-06-Wortlaut): Lesen frei · Stufe 1 (Transitionen, Feldänderungen) nur mit
  Einzelfreigabe · Stufe 2 (kundensichtbare Freitexte, Kommentare) ausschließlich durch
  einen Menschen. Diese Regel ersetzt bei NovaCore, was Onsite über
  `GITLAB_READ_ONLY_MODE=true` rein mechanisch am MCP-Server erzwingt (Karte 06 §5.4/§9
  D3): bei NovaCore ist die Zwei-Stufen-Regel der **Befugnisrahmen**, nicht (nur) eine
  Server-Flag — sie gilt unabhängig davon, was der Connector technisch zuließe.
- **Token-/Auth-Problem wie im Vorbild dokumentiert, nicht „gelöst"** (Karte 06 §5.4): der
  org-weite Connector setzt die Verbindungsstruktur, nicht die individuelle Anmeldung
  jedes Kollegen. Ob NovaCore Option A (jeder meldet sich selbst an) oder Option B
  (Service-Account) fährt, ist zum Erstellungsdatum dieses Dokuments **offen** — ebenso
  der/die Jira-Projekt-Key(s) (Bauplan N6, dort als „Offen" geführt).
- **Kein GitLab-MCP nötig:** NovaCore arbeitet nativ auf GitHub, Repo-Aktionen laufen über
  `gh`/direkte GitHub-Integration statt über einen MCP-Umweg. Karte 06 §8.2 nennt „Anthropic
  unterstützt nativ nur GitHub, das MCP-Setup bleibt nötig" als bleibenden Onsite-Nachteil
  — für NovaCore entfällt diese Zeile als strukturelle Vereinfachung, kein Workaround nötig.

### 2.3 Marketplace-Quelle

Anders als beim Vorbild (privates Repo `onsite-ai-devs/Onsite.ai-OS`) ist die
Marketplace-Quelle bei NovaCore das **öffentliche** Repo `NovaCore-AI/NovaCoreAI-OS`
(Marketplace-Name `novacore-os`, `.claude-plugin/marketplace.json`). Das ändert an der
Verteilungsmechanik nichts — Kollegen brauchen keinen privaten Repo-Zugriff, um den
Marketplace hinzuzufügen —, verschärft aber die Rollen-Regel (Kopf dieses Dokuments) und
die Sitzungswissen-Frage (Bauplan-Entscheide E2/E3: `.nc/erinnerung/` im Arbeits-Repo
bleibt Wohnort, nicht `sitzungswissen/` im öffentlichen OS-Repo).

## 3. Kollegen-Seite — Installation

Einmalig `marketplace add` + `plugin install`, danach `/nc:setup` als Reconciler:

1. **Einmalig pro Rechner:** `/plugin marketplace add NovaCore-AI/NovaCoreAI-OS` +
   `/plugin install nc-development@novacore-os` (Kern `nc` kommt transitiv mit) — Wortlaut
   und alle Details in [`ONBOARDING.md`](../../ONBOARDING.md) §1, hier **nicht**
   dupliziert.
2. **`/nc:setup` als Reconciler:** stellt die Wissensbasis bereit (Klon nach
   `~/.nc/ssot/<repo-name>/`), ist idempotent und läuft bei jedem weiteren Aufruf nur per
   Fast-Forward nach (`ONBOARDING.md` §1a). Das ist NovaCores Antwort auf Karte 06 §4.1 —
   Onsite dokumentiert dort keinen vergleichbaren Reconciler-Skill; `/nc:setup` ist
   NovaCore-eigene Mechanik, kein Port.
3. **Auto-Update aktiviert sich mit der Installation** — jeder Merge auf `main` mit
   Version-Bump des betroffenen Plugins erreicht den Kollegen beim nächsten
   Claude-Code-Session-Start (Karte 06 §5.1, unverändert übernommen).

## 4. Update-Workflow

### 4.1 Normalfall

Mechanik unverändert gegenüber dem Kern-Prozess — hier **nicht** dupliziert, siehe
[`aktualisierungs-index.md`](aktualisierungs-index.md) §3 (Bump-Schema, Ort, Validierung,
Release-Weg) und §5 (Prüfzyklus vor jedem Commit-Vorschlag). Kurzform: Version bumpen im
betroffenen `plugin.json` (Kern zusätzlich `VERSION` + `module-registry.json`) →
`claude plugin validate .` + `claude plugin validate plugins/<name> --strict` +
`node --test plugins/nc/tests/*.test.mjs` → Commit + Push `main` **nur mit ausdrücklicher
Maintainer-Freigabe** → Kollegen erhalten die Änderung beim nächsten Session-Start.

### 4.2 Bekannte Auto-Update-Bugs (aus Karte 06 §7.2 übernommen, Nummern unverändert)

Beide Bugs sind bei Anthropic gemeldet und **nicht** NovaCore-spezifisch — Karte 06 hält
sie „nicht behoben" fest, dieselbe Aussage gilt hier unverändert:

| Problem | Beleg | Workaround (auf `novacore-os` gemappt) |
|---|---|---|
| Auto-Update führt `git fetch` aus, aber kein `git pull` — Version bleibt stale | [GitHub Issue #49410](https://github.com/anthropics/claude-code/issues/49410) | Kollege führt manuell `/plugin marketplace update novacore-os` aus |
| Auto-Update verwaist alle Versionen, Plugin lädt nicht beim Session-Start | [GitHub Issue #60219](https://github.com/anthropics/claude-code/issues/60219) | `/reload-plugins` nach dem Session-Start ausführen |

Bis beide Issues von Anthropic geschlossen sind: bei einer teamrelevanten Änderung im
Team-Chat auf den Bump hinweisen, damit Kollegen bei ausbleibendem Auto-Update selbst
manuell nachziehen.

## 5. Koexistenz

### 5.1 Dev-Checkout vs. installierte Version (Karte 06 §7.3, unverändert übernommen)

Wer am OS-Repo selbst entwickelt, nutzt einen **lokalen** Marketplace-Checkout parallel
zur verteilten Version — unter **unterschiedlichem** Marketplace-Namen, sonst Kollision:

```
/plugin marketplace add <pfad-zum-lokalen-checkout>      # z. B. novacore-os-dev
```

Änderungen werden nach `/reload-plugins` sofort aktiv, ohne Commit oder Push. Dev- und
verteilte Version koexistieren, solange die Namen getrennt bleiben — `ONBOARDING.md` §1
nennt denselben Mechanismus bereits für „lokale Entwicklung am OS selbst".

### 5.2 NC-Koexistenz-Falle (NovaCore-eigen, kein Karte-06-Gegenstück)

Karte 06 kennt diese Falle nicht — sie entsteht erst durch NovaCores eigenständige
Kollegen-OS (Felix, Biggi; Bauplan-Invariante I8). Bestandsregel aus `ONBOARDING.md` §1b:
**`nc` (bzw. `nc-development`), `nc-felix` und `nc-biggi` niemals parallel in derselben
Session** betreiben — alle drei tragen eigene, markerlose Session-Start-Gates, die sich
sonst doppeln. Wer mehrere installiert hat, deaktiviert bis auf eines
(`/plugin disable …`).

## 6. Abgrenzungs-Matrix — was Claude Team abdeckt vs. was OS-Domäne bleibt

Gemappt aus Karte 06 §8 (dort §8.1/§8.2 der Prozesskarte): GitLab-Zeilen entfallen (kein
GitLab bei NovaCore), die Jira-Zwei-Stufen-Regel ersetzt die PAR-/Review-Workflow-Zeilen
des Vorbilds.

### 6.1 Was Claude Team abdeckt

| OS-Komponente | Ohne Team | Mit Team |
|---|---|---|
| Atlassian/Jira-MCP-Config | Jeder Kollege manuell in `~/.claude.json` | **Admin** setzt Connector org-weit (§2.2) |
| Plugin-Installation | `git clone` + manuell | Einmal `/plugin marketplace add`, danach Auto-Update |
| Org-Ebene (Ebene 0) | Keine gemeinsame Org-Instructions-Ebene | Kleine, freigabepflichtige Textebene (§2.1) |
| Onboarding | MCP + Plugin + Skills manuell erklären | Seat zuweisen → Marketplace einmal add → `ONBOARDING.md` §1–§2 |
| Offboarding | Lokale Config manuell löschen | Seat entfernen → Zugriff weg |

### 6.2 Was OS-Domäne bleibt (unersetzlich)

| OS-Komponente | Warum Claude Team es nicht ersetzt |
|---|---|
| **Abteilung `nc-development`: Feature-/Review-/QS-Skills** (`flc-*`, `fe-review`, `be-review`, `wzs-*`) | GitHub-Flow- und WZS-Produktivsystem-spezifisch — kein Standard-Team-Feature |
| **Jira-Zwei-Stufen-Regel als Befugnisrahmen** | Der Team-Connector liefert nur die Verbindungsstruktur; Freigabe-/Mensch-only-Logik ist NovaCore-eigene Skill-/Prozess-Logik, kein Anthropic-Feature |
| **CLAUDE-Netz (Ebenen 0–3b)** | Projektwissen über NovaCore-Architektur, Sync-Richtung, Datenmodell — Org-Instructions decken nur Ebene 0 ab |
| **Hooks** (FFG, Session-Start-Zwang, Doks-Autosync, PreCompact-Mahnung) | Teamspezifische Kontroll-Schicht, ausschließlich im Kern-Plugin, keine Team-Plattform-Funktion |
| **Kollegen-OS-Isolation** (Felix, Biggi — keine Queue, keine Promotion) | Firmeninterne Architekturentscheidung (Invariante I8), keine Plattform-Funktion |
| **GitHub-Direktintegration** (kein MCP-Umweg für Repo-Aktionen) | Für NovaCore bereits gelöst, weil nativ auf GitHub gearbeitet wird — bei Onsite bleibt das GitLab-CE-MCP-Setup nötig; hier entfällt die Zeile ersatzlos statt eines Workarounds |

Kurz wie im Vorbild (Karte 06 §8.2 a. E.): Die Plattform übernimmt **Verteilung und
Verwaltung** (Seats, Connectors, Marketplace-Kanal). Das OS ist die Schicht **darauf** und
macht Claude Code für den NovaCore-Alltag nützlich. Das eine ersetzt das andere nicht.

## 7. Preise — bewusst nicht übernommen

Karte 06 §4.1 nennt konkrete Monatspreise für Onsites Team- und Enterprise-Plan. Diese
Zahlen werden **hier bewusst nicht übernommen** — sie veralten, und dieses Repo ist
öffentlich. Aktuelle Preise: offizielle Anthropic-Preisseite, nicht dieses Dokument.

## 8. Kopplungen

| Kopplung | Inhalt |
|---|---|
| [`firmenkernprozesse/prozesskarten/06-claude-team-distribution.md`](../firmenkernprozesse/prozesskarten/06-claude-team-distribution.md) | Vorbild-Quelle dieser Übersetzung, extern geführt, nicht normativ für NovaCore |
| Bauplan `2026-08-15-onsite-endstand-nachbau-bauplan.md` §9 N6 | Firmenspezifische Grundlage: Team/Rollen, Jira-Zwei-Stufen-Regel, Workspace-Vorhandensein, Sprachmuster |
| [`ONBOARDING.md`](../../ONBOARDING.md) §1/§1a/§1b/§4 | Installationsschritte, Wissensbasis-Bereitstellung, Kollegen-OS-Install, Aktualisierungshinweis — Quelle der Wahrheit für Befehle |
| [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md) §3a/§3b | SSH-Falle, Install-Probe in isoliertem `CLAUDE_CONFIG_DIR`, Koexistenz-Regel für eigenständige Satelliten |
| [`aktualisierungs-index.md`](aktualisierungs-index.md) §3/§5 | Vollständiger Update-/Release-/Prüfzyklus, hier nur referenziert |
| [`NovaCore-OS-CLAUDE-Ebenen-Definition.md`](../grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md) | Ebene 0 im Gesamtbild der CLAUDE-Ebenen; Status-Diskrepanz zu Bauplan N6 (§2.1) |
| Anthropic Issues #49410, #60219 | Auto-Update-Fallen, aus Karte 06 unverändert übernommen |

## 9. Verifikation / Abschluss

1. `claude plugin validate .` (Marketplace-Ebene) — unverändert durch dieses Dokument,
   keine Manifest-Änderung.
2. `node --test plugins/nc/tests/*.test.mjs` — Struktur-Invarianten bleiben grün, da
   dieses Dokument keine Plugin-Dateien anfasst.
3. `SSOT-Document-Index.md` Teil 2 trägt die Indexzeile für dieses Dokument (Pflicht bei
   jeder neuen Wissensdatei).

---

*Angelegt 2026-08-15 durch Claude (Fable 5, Claude Code) auf Weisung Lucas Vöhringer, Teil
von AP-C5/E5 des Bauplans `2026-08-15-onsite-endstand-nachbau-bauplan.md`. Struktur-Vorbild:
`firmenkernprozesse/prozesskarten/06-claude-team-distribution.md` (Onsite.ai-OS, extern
geführt) — generisch auf NovaCore gemappt (GitHub statt GitLab, Atlassian/Jira statt
GitLab-MCP, öffentliches statt privates Marketplace-Repo), keine wörtliche Kopie.*
