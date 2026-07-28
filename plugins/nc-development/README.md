# nc-development — Abteilung `development`

Die Abteilung `development` des NovaCore-OS bündelt die Werkzeuge für den realen
Entwicklungszyklus: **GitHub-Flow** — Auftrag/Issue → Feature-Branch → PR → Review → Merge
nach `main`. Sie liefert 11 Skills in vier Modulen und übersetzt den WP-Rahmen des Kerns auf
diesen Zyklus.

**Aufruf:** `/nc-development:<skill>` (z. B. `/nc-development:flc-plan`). Der Kern `nc` ist als
Dependency dieses Plugins eingetragen und wird bei Installation und Aktivierung transitiv
mitgezogen — die Kern-Skills `/nc:start`, `/nc:save-session` und `/nc:journal` stehen damit
immer zur Verfügung und können nicht fehlen.

## Module und Skills

| Modul | Skill | Zweck | WP |
|---|---|---|---|
| **flc** — Feature-Lifecycle | `flc-feature-start` | Anforderung klären, Kontext laden, betroffene Stellen finden, Feature-Branch vorbereiten | WP1 |
| | `flc-plan` | Task in 2–7 vertikale, PR-große Slices zerlegen (Richtwert unter 400 Zeilen je Slice) | WP2 |
| | `flc-commit-prep` | Pre-Commit: Format, Lint, Tests, Secrets-Check, Commit-Message nach Conventional Commits | WP4 |
| | `flc-pr` | PR aus dem Feature-Branch erstellen; Push und Anlage erst nach Freigabe | WP5 |
| **fe** — Frontend | `fe-review` | Frontend-Diff-Review: Zugänglichkeit, Web-Vitals-Risiken, Design-Qualität, Komponenten-Hygiene | WP6 |
| **be** — Backend | `be-review` | Backend-Diff-Review: API-Verträge, Fehlerpfade, Validierung, Datenzugriff, Secrets, Testtiefe | WP6 |
| **wzs** — Empfehlungssystem | `wzs-attribution` | Attribution: Normalisierung (lowercase, E.164), hart/fuzzy Matching, Zeitfenster, Mehrfach-Match-Guard, Tie-Break | WP3/WP6 |
| | `wzs-reward-guard` | Geldfluss-Invariante: partial-unique Guards, Karenz (`eligible_at`), Refund-Erlöschen, Approval-Gate, Audit, Pause-Schalter | WP3/WP6 |
| | `wzs-share-invariant` | UWG-Invariante: das System versendet nie Empfehlungsnachrichten an Dritte; Desktop Kopieren und QR, Mobil `wa.me` und `mailto:` | WP3/WP6 |
| | `wzs-blocker-gate` | Phasen-Start-Sperre: kein Bau ohne dokumentierte ⛔-Entscheidung in Plan §11.C | WP3 |
| | `wzs-webhook-contract` | Integrations-Contract: Idempotenz, Signatur, Refund-/Status-Events, Reconciliation-Fallback, n8n als alleiniger Fremdsystem-Zugang | WP3/WP6 |

## Kundenspezifisches Modul `wzs`

> **Achtung:** Die `wzs-*`-Skills sind **kein** generisches Stack-Modul. Sie gelten
> ausschließlich für das Empfehlungssystem **wasserzisterne.de** und referenzieren dessen
> verbindlichen Projektplan (`Dokumente/Projektplan Empfehlungssystem v2.md`, aktuell v2.3)
> sowie die projekt-eigene `CLAUDE.md`/`AGENTS.md`. In anderen Arbeits-Repos sind sie fachlich
> **falsch** und dürfen nicht angewendet werden.

Quellen-Hierarchie im Wasserzisterne-Repo: **1.** Projektplan v2.3 (Source of Truth) →
**2.** `CLAUDE.md` / `AGENTS.md` des Projekts → **3.** diese Skills (sie kapseln Invarianten,
sie ersetzen die Quelle nicht). Ändert sich eine Invariante im Plan (§16 Änderungsprotokoll),
ist der zugehörige Skill synchron nachzuziehen. Neue Invarianten nur, wenn sie mehrfach
verletzt werden könnten; Skills bleiben kleine Checklisten, keine Prosa-Wüsten.

## Typischer Ablauf

```
/nc:start → flc-feature-start → flc-plan → (umsetzen, Test-First)
          → flc-commit-prep → flc-pr → fe-review / be-review → /nc:save-session
```

Bei Arbeit am Wasserzisterne-Empfehlungssystem laufen die passenden `wzs-*`-Checklisten
zusätzlich in WP3 und WP6 mit — `wzs-blocker-gate` bereits **vor** dem ersten Handgriff einer
Phase.

## Rote Linien

Kein Skill dieser Abteilung merged, released oder deployt. Push und PR-Anlage laufen
ausschließlich über `flc-pr` nach expliziter Freigabe; `fe-review` und `be-review` approven,
resolven und posten nie selbst. Details und die Zuordnung Linie → Skill stehen in
`workflow.md`.

## Weiterlesen

- `workflow.md` (dieses Plugin) — WP0–WP8 im NovaCore-Zyklus, Rote-Linien-Ownership,
  Trigger-Matrix
- `wp-rahmen.md` des Kern-Plugins `nc` — normativer WP-Rahmen für alle Abteilungen
- `referenz/skill-authoring.md` des Kern-Plugins `nc` — verbindliche SKILL.md-Formatregeln
