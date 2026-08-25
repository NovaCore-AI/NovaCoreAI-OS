# nc-development — Abteilung `development`

Die Abteilung `development` des NovaCore-OS bündelt die Werkzeuge für den realen
Entwicklungszyklus: **GitHub-Flow** — Auftrag/Issue → Feature-Branch → PR → Review → Merge
nach `main`. Sie liefert 15 Skills in sechs Modulen und übersetzt den WP-Rahmen des Kerns auf
diesen Zyklus.

**Aufruf:** `/nc-development:<skill>` (z. B. `/nc-development:flc-plan`). Der Kern `nc` ist als
Dependency dieses Plugins eingetragen und wird bei Installation und Aktivierung transitiv
mitgezogen — die Kern-Skills `/nc:start`, `/nc:end-session` und `/nc:journal` stehen damit
immer zur Verfügung und können nicht fehlen.

## Installation

Einmalig pro Rechner, in dieser Reihenfolge:

1. `/plugin marketplace add NovaCore-AI/NovaCoreAI-OS` — den Marketplace `novacore-os`
   registrieren.
2. `/plugin install nc-development@novacore-os` — die Abteilung installieren; der Kern `nc`
   kommt **transitiv** mit und muss nicht separat installiert werden.
3. `/nc:setup` — Reconciler des Kerns: legt die Lesekopie der Wissensbasis unter `~/.nc/ssot/`
   an, zieht sie bei jedem weiteren Aufruf nach und ist idempotent.

Danach beginnt jede Sitzung mit `/nc:start` und endet mit `/nc:end-session`. Der ausführliche
Wortlaut samt Fallen steht im Onboarding-Dokument des **OS-Repos** (`ONBOARDING.md`, §1) und
wird hier nicht dupliziert.

> **Koexistenz-Regel (harte Bestandsregel):** `nc` bzw. `nc-development`, `nc-felix` und
> `nc-biggi` **niemals parallel in derselben Session** betreiben. Alle drei tragen eigene,
> markerlose Session-Start-Gates und Begrüßungen, die sich sonst doppeln. Wer mehrere
> installiert hat, deaktiviert bis auf eines (`/plugin disable …`).

## Module und Skills

| Modul | Skill | Zweck | WP |
|---|---|---|---|
| **flc** — Feature-Lifecycle | `flc-feature-start` | Anforderung klären, Kontext laden, betroffene Stellen finden, Feature-Branch vorbereiten | WP1 |
| | `flc-plan` | Task in 2–7 vertikale, PR-große Slices zerlegen (Richtwert unter 400 Zeilen je Slice) | WP2 |
| | `flc-commit-prep` | Pre-Commit: Format, Lint, Tests, Secrets-Check, Commit-Message nach Conventional Commits | WP4 |
| | `flc-pr` | PR aus dem Feature-Branch erstellen; Push und Anlage erst nach Freigabe | WP5 |
| **fe** — Frontend | `fe-review` | Frontend-Diff-Review: Zugänglichkeit, Web-Vitals-Risiken, Design-Qualität, Komponenten-Hygiene | WP6 |
| **be** — Backend | `be-review` | Backend-Diff-Review: API-Verträge, Fehlerpfade, Validierung, Datenzugriff, Secrets, Testtiefe | WP6 |
| **qs** — QS-Zyklus | `qs-bugfix` | Fehler zuerst als roten Test reproduzieren, minimal beheben, Regression sichern, Befund festhalten | WP7 |
| | `qs-abnahme` | Abnahmelauf: Kriterien aus der Anforderung, Livetest-Plan, Abnahme-Checkliste mit je einem Beleg | WP7 |
| **rel** — Release-Zyklus | `rel-vorbereitung` | Pre-Deploy-Check: Stand, Version, CHANGELOG, Nachweise, Migrations- und Rückweg, Freigabenachweis — nur manuell aufrufbar | WP7 |
| | `rel-verifikation` | Post-Deploy-Verifikation read-only: Ankunft des Stands, Smoke-Umfang, Fehlerbild, Empfehlung — nur manuell aufrufbar | WP7 |
| **wzs** — Empfehlungssystem | `wzs-attribution` | Attribution: Normalisierung (lowercase, E.164), hart/fuzzy Matching, Zeitfenster, Mehrfach-Match-Guard, Tie-Break | WP3/WP6 |
| | `wzs-reward-guard` | Geldfluss-Invariante: partial-unique Guards, Karenz (`eligible_at`), Refund-Erlöschen, Approval-Gate, Audit, Pause-Schalter | WP3/WP6 |
| | `wzs-share-invariant` | UWG-Invariante: das System versendet nie Empfehlungsnachrichten an Dritte; Desktop Kopieren und QR, Mobil `wa.me` und `mailto:` | WP3/WP6 |
| | `wzs-blocker-gate` | Phasen-Start-Sperre: kein Bau ohne dokumentierte ⛔-Entscheidung in Plan §11.C | WP3 |
| | `wzs-webhook-contract` | Integrations-Contract: Idempotenz, Signatur, Refund-/Status-Events, Reconciliation-Fallback, n8n als alleiniger Fremdsystem-Zugang | WP3/WP6 |

## Subagenten (isolierter Kontext)

Drei Subagenten unter `agents/` ergänzen die geführten Skills um Arbeit, die einen vom
Erstellungskontext getrennten oder gebündelten Lauf braucht. Aufruf per `@`-Mention unter
`nc-development:<agent>`. Format nach `referenz/agent-authoring.md` des Kern-Plugins `nc`;
Invarianten testerzwungen in `plugins/nc/tests/agenten.test.mjs`.

| Agent | `tools` | Trägt (isoliert) | Nächstliegender Skill (geführt in der Haupt-Session) | Abgrenzung |
|---|---|---|---|---|
| `code-reviewer` | Read, Grep, Glob | 4-Augen-Review eines übergebenen Diffs im eigenen, frischen Kontextfenster; Findings als Severity-Entwurf (BLOCKER/MAJOR/MINOR/NIT) | `fe-review`, `be-review` | Die beiden Skills führen das Review geführt mit dem Menschen in der Haupt-Session; der Agent liefert nur einen isolierten Entwurf und postet, resolvt, approvt nichts |
| `pipeline-praeflight` | Read, Grep, Glob, Bash (Diagnose-Klasse, Command-Allowlist im Prompt) | Grün-Prognose der GitHub-Actions-Pipeline (`ci.yml`) vor dem Push; sekundär Root-Cause eines roten Laufs, read-only über `gh run` | `flc-commit-prep` | `flc-commit-prep` prüft Format/Lint/Tests geführt im Commit-Fluss vor dem ersten Commit; dieser Agent bündelt alle CI-Schritte nachträglich in einem isolierten, nachgestellten Lauf und liest bei Bedarf einen realen Lauf nach — kein `mcp__*`-Werkzeug, kein GitLab-MCP |
| `test-luecken-scout` | Read, Grep, Glob | Querschnitts-Analyse fehlender Testabdeckung über einen Modul- oder PR-Scope; priorisierte Testgerüst-Vorschläge als Entwurf | `qs-bugfix` | `qs-bugfix` reproduziert einen konkreten Fehler geführt im Slice-Zyklus als roten Test; der Agent analysiert Bestandslücken über viele Dateien und schreibt selbst keine Tests |

Keiner der drei Agenten dupliziert einen `wissen-*`-Router des Kern-Plugins `nc`
(`wissen-aendern`/`wissen-planen`/`wissen-nachschlagen`/`wissen-protokolle`) — sie greifen
auf keine Wissensbasis zu und lösen dort keine Kollision aus. Alle drei sind read-only im
Sinne der Abteilung: kein Agent merged, released, deployt, postet oder approvt; das bleibt
den geführten Skills und dem Menschen vorbehalten (Rote Linien unten).

## Kundenspezifisches Modul `wzs`

> **Achtung:** Die `wzs-*`-Skills sind **kein** generisches Stack-Modul. Sie gelten
> ausschließlich für das Empfehlungssystem **wasserzisterne.de** und referenzieren dessen
> verbindlichen Projektplan (`Dokumente/Projektplan Empfehlungssystem v2.md`, aktuell v2.3)
> sowie die projekt-eigene `CLAUDE.md`/`AGENTS.md`. In anderen Arbeits-Repos sind sie fachlich
> **falsch** und dürfen nicht angewendet werden.
>
> **Frische:** Stand v2.3, abgeglichen 2026-07-07 — vor Nutzung gegen den Projektplan im
> Arbeits-Repo prüfen. Die Quelle liegt außerhalb dieses Repos; die Zahlen in den `wzs-*`-Skills
> werden hier **nicht** geraten, sondern gegen den Plan verifiziert.

Quellen-Hierarchie im Wasserzisterne-Repo: **1.** Projektplan v2.3 (Source of Truth) →
**2.** `CLAUDE.md` / `AGENTS.md` des Projekts → **3.** diese Skills (sie kapseln Invarianten,
sie ersetzen die Quelle nicht). Ändert sich eine Invariante im Plan (§16 Änderungsprotokoll),
ist der zugehörige Skill synchron nachzuziehen. Neue Invarianten nur, wenn sie mehrfach
verletzt werden könnten; Skills bleiben kleine Checklisten, keine Prosa-Wüsten.

## Typischer Ablauf

```
/nc:start → flc-feature-start → flc-plan → (umsetzen, Test-First)
          → flc-commit-prep → flc-pr → fe-review / be-review
          → qs-bugfix (bei Befunden) → qs-abnahme
          → rel-vorbereitung → [Mensch liefert aus] → rel-verifikation → /nc:end-session
```

Bei Arbeit am Wasserzisterne-Empfehlungssystem laufen die passenden `wzs-*`-Checklisten
zusätzlich in WP3 und WP6 mit — `wzs-blocker-gate` bereits **vor** dem ersten Handgriff einer
Phase. Die beiden `rel-*`-Skills springen nie automatisch an; sie werden ausdrücklich gerufen.

## Pflege-Queue und Ausprägung der Abteilung

Was diese Abteilung an der Pflege-Mechanik des Kerns abweichend braucht, steht **deklarativ**
in `pflege-auspraegung.json` an der Wurzel dieses Plugins: Queue-Pfad, Kriterienverweis,
Journal-Sonderregeln, die drei Domänen-roten-Linien des Produktivsystems und die
Übergangsregel. Die Mechanik selbst liegt im Kern — `/nc:end-session` klassifiziert die
Pflegekandidaten, ein eigener Abteilungs-Queue-Skill ist nicht vorgesehen.

Solange die Abteilung keinen eigenen Satelliten hat, lebt ihre Kandidaten-Queue als
**Übergangs-Queue im OS-Repo** und wird über dessen regulären Branch/PR-Fluss eingebracht —
`/nc:queue-abteilung` ist hier **nicht** der Weg. Die geltenden Kriterien stehen in
`referenz/pflege-auspraegung.md` des Kern-Plugins `nc`; eine eigene Abteilungs-Kriterienliste
gibt es bis zum Maintainer-Entscheid bewusst nicht.

## Rote Linien

Kein Skill dieser Abteilung merged, released oder deployt. Push und PR-Anlage laufen
ausschließlich über `flc-pr` nach expliziter Freigabe; `fe-review` und `be-review` approven,
resolven und posten nie selbst; `qs-abnahme` legt Belege vor, abgenommen wird von der Rolle
Maintainer/Admin; `rel-vorbereitung` bereitet die Auslieferung nur vor und `rel-verifikation`
prüft sie ausschließlich lesend nach. Details und die Zuordnung Linie → Skill stehen in
`workflow.md`.

## Weiterlesen

- `development-abteilungs-claude.md` (dieses Plugin) — Abteilungs-CLAUDE der Ebene 2:
  Selbstverständnis, Domänen-rote-Linien, Routing, Werkzeuge; wird von `/nc:start` geladen
- `workflow.md` (dieses Plugin) — WP0–WP8 im NovaCore-Zyklus, Rote-Linien-Ownership,
  Trigger-Matrix, Wissens-Routing und Queue-Anbindung
- `wp-rahmen.md` des Kern-Plugins `nc` — normativer WP-Rahmen für alle Abteilungen
- `referenz/skill-authoring.md` des Kern-Plugins `nc` — verbindliche SKILL.md-Formatregeln
