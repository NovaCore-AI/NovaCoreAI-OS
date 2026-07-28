# NovaCore-OS — Produktarchitektur (maschinenlesbare Fassung)

> **Quelle:** `NovaCore-OS-Produktarchitektur.html` (NovaCore AI, Original Juli 2026) —
> 1:1-Konvertierung ohne inhaltliche Änderung, optimiert für Agenten-Konsum (2026-07-24;
> aus dem Onsite.ai-OS-Repo in dieses Heimat-Repo übernommen am 2026-07-28).
> **Rolle in diesem Repo:** Master-Produktvision des NovaCore-OS. Jeder Vision-Abgleich
> (Vision ↔ Spec ↔ gebaute Artefakte) läuft gegen dieses Dokument; die jüngste Design-Spec
> in `grundwissen/` ist die daraus abgeleitete Planungsgrundlage.

**Claim:** Ein erweiterbares Team-Betriebssystem für KI-Arbeit: eine Methode für alle statt
drei Privat-Setups. *(Motto: Per aspera ad astra.)*

**Kernsatz:** Der **Kern** erzwingt Aktualität und Sicherheit (Pflicht-Workflow, FFG, Hooks) ·
das **Wissen** ist geteilt und versioniert (CLAUDE-Dateien, Memory) · die **Skill-Module**
spezialisieren pro Leistungsfeld · die **Sandbox** lässt jeden am Use Case erweitern · die
**Integrationen** docken die echten Systeme kontrolliert an.

## 1. Die sechs Schichten

### 1.1 Verteilung — „eine Methode, ein Stand"

- **Plugin + Marketplace** — versioniert; Updates am Global-CLAUDE und allen Skills erreichen
  automatisch das ganze Team.

### 1.2 Wissen (SSOT — Single Source of Truth)

- **Global-CLAUDE.md** — gemeinsame Regeln, Rolle, Workflow-Pflichten; zentral updatebar.
- **Projekt-CLAUDE.md** — Aufbau, Regeln, QS-Standards je Repo.
- **Projekt-Memory** — gemeinsamer Stand + Journal, von allen gepflegt und gelesen.

### 1.3 Pflicht-Workflow — „nicht optional"

`/start` → WP1 Verstehen → WP2 Planen → WP3 Umsetzen (TDD) → WP4 Quality-Gate →
WP5–6 Review → WP7 Live-Test → `/save`

- Status-Hinweis (Original): Für NovaCore AI noch zu definieren — Vorbild ist der 9-stufige
  Workflow (WP0–WP8) aus dem Referenzsystem. *(Einlösung: `plugins/nc/wp-rahmen.md`,
  Umbau 2026-07-28.)*
- **Commands als Einstiegspunkte** — feste Slash-Befehle (`/start`, `/save`, `/update`):
  Der Mensch löst aus, ein Befehl startet für alle denselben Ablauf — niemand muss Prompts
  formulieren.
- Jeder Workflow-Punkt hat fest zugeordnete Skills als Werkzeug (Referenzsystem z. B.
  WP3 → `tdd-workflow`, WP4 → `quality-gate`, WP6 → `review-pr`). Hält Memory, Kontext und
  Projektstand für **alle** zwingend aktuell — die KI arbeitet nie „aus der Erinnerung".

### 1.4 Leistungsfelder (Skill-Module)

- **Skills sind die Arbeitseinheit des OS** — fertige, geprüfte Arbeitsanleitungen für
  wiederkehrende Aufgaben, gebündelt als namespaced Pakete je Leistungsfeld; zentral
  registriert, einzeln aktivierbar (Opt-in).
- **Maßstab aus dem Referenzsystem** — 52 spezialisierte Skills über die vier
  NovaCore-Leistungsfelder (Systemarchitektur, Backend-Engineering, Agenten-Orchestrierung,
  Technische Projektleitung) plus gemeinsame Basis-Skills, jeweils in die Workflow-Schritte
  eingebettet.

### 1.5 Kontrolle (deterministisch) — Gate-Schicht, kritisch ⚠️

Drei Gates; hier hat die KI **kein Mitspracherecht**:

1. **Session-Start-Zwang** — Regeln und Projektstand werden geladen, bevor gearbeitet wird.
2. **FFG — Fact-Forcing-Gate** — Fakten vorlegen, **bevor** gehandelt wird.
3. **Safety-Gate** — blockiert destruktive Befehle strukturell.

### 1.6 Sandbox — „bewusst offen, wächst mit dem Team"

- **Eigene Skills bauen** — jeder Nutzer individualisiert und spezialisiert eigene Skills je
  nach Use-Case-Bedarf, nach Vorbild und Regeln des OS (eigener Namespace/Prefix,
  Namenskonventionen), ohne den Kern anzufassen — und nutzt sie sofort im OS.
- **Fork-back-Pfad** — bewährte Eigen-Skills können später ins OS übernommen werden. So
  entsteht nur, was ein realer Use Case verlangt: nah am Bedarf, keine Features auf Verdacht.

## 2. Integrationen — via MCP

- Eigenständige Bausteine — gehören zum **Produkt-Setup, nicht zum Plugin-Code**.
- Beispiele: GitHub-MCP (Repos & Issues); weitere MCPs & Plugins nach Bedarf.
- MCP (Model Context Protocol) = die Standard-Schnittstelle, über die die KI in den echten
  Systemen arbeitet. **Rechte werden am Anschluss begrenzt:** Was der Zugang nicht hergibt
  (z. B. Löschen), existiert für das Modell technisch nicht.

## 3. Deterministik-Prinzip

Deterministische Schicht = hier gelten **Garantien statt Wahrscheinlichkeiten** — die
Grundlage aller Sicherheitszusagen.

## 4. Baugruppen — warum jedes Teil dazugehört

| Baustein | Was es ist | Warum es Teil des Produkts ist |
|---|---|---|
| Global-CLAUDE.md | Gemeinsame Grundinstruktion für alle: Umgangsregeln, Rolle, Workflow-Pflichten | Die eine Stelle, an der sich Teamverhalten zentral ändern lässt — ein Update, alle arbeiten sofort nach neuem Stand |
| Projekt-CLAUDE.md | Projektwissen je Repo: Aufbau, Regeln, QS-Standards, Abhängigkeiten | Die KI kennt die impliziten Standards — ohne sie rät sie |
| Gemeinsame Projekt-Memory | Stand + append-only Journal, von allen Sessions gepflegt | Wissen überlebt Session- und Personenwechsel — der Unterschied zwischen Weiterarbeiten und Neuanfangen |
| Pflicht-Workflow `/start` → WP-Gates → `/save` | Erzwungener Rahmen jeder Session: Kontext laden → Verstehen → Planen → Umsetzen (TDD) → Quality-Gate → Review → Live-Test → Stand sichern; Vorbild: WP0–WP8 aus dem Referenzsystem | Deshalb ist Memory verlässlich und Qualität wiederholbar: Aktualität und Prüfschritte sind kein Appell, sondern Prozessbestandteil |
| Commands (`/start`, `/save`, `/update` …) | Feste Slash-Befehle für vordefinierte Abläufe — der manuelle Einstiegspunkt für Menschen (Abgrenzung: Skills kann die KI auch selbst heranziehen, Commands löst immer der Mensch aus) | Macht den Pflicht-Workflow bedienbar ohne Prompt-Können: ein Befehl = derselbe Ablauf für alle |
| Leistungsfeld-Module (Skills) | Geprüfte Arbeitsanleitungen als namespaced Pakete je Leistungsfeld, zentral registriert; Referenzsystem: 52 Skills über 4 Leistungsfelder + gemeinsame Basis | Jedes Leistungsfeld bekommt Spezialisierung, ohne die anderen zu belasten — Module einzeln adoptierbar (Opt-in) |
| Hooks inkl. FFG | Deterministische Gates: Session-Start-Zwang, Fact-Forcing (erst Fakten vorlegen, dann handeln), Safety-Gate | Die Schicht, in der die KI kein Mitspracherecht hat — hier wohnen die Garantien |
| Sandbox + Namenskonventionen | Bewusst offene Erweiterungsschicht: eigene Skills nach Vorbild und Regeln des OS (eigener Namespace/Prefix), ohne Kern-Änderung; Bewährtes wandert per Fork-back zurück ins OS | Das OS wächst mit dem Team statt an ihm vorbei; Erweiterung ist Feature, nicht Wildwuchs |
| Verteilmechanik (Plugin/Marketplace) | Versioniertes Paket, Updates für alle | Eine Team-Methode statt drei Privat-Setups; Verbesserungen skalieren automatisch |
| Integrationen via MCP (GitHub, …) | Andockpunkte an die echten Systeme über MCP — eigenständig, aber vom OS orchestriert | Ohne sie redet die KI über die Arbeit; mit ihnen arbeitet sie *in* ihr — Rechte am Anschluss begrenzt |

---

*© 2026 NovaCore AI — NovaCore-OS · Produktarchitektur · Original Juli 2026 ·
maschinenlesbare Konvertierung 2026-07-24 (Quod erat demonstrandum.)*
