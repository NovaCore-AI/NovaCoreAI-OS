# nc-sync — Globale Agenten-Anweisung (NovaCoreAI-OS)

Diese Anweisung gilt für alle Agenten-Sessions in Repos mit `.nc-os`-Marker.

## Arbeitsweise

1. **Session-Start:** Beginne jede Session mit `/nc:start` — lädt Stand (`.nc/erinnerung/stand.md`), letztes Journal und Git-Status.
2. **Session-Ende:** Beende jede Session mit `/nc:save-session` — schreibt append-only ins Journal (`.nc/erinnerung/journal/<YYYY-MM-DD>.md`) und konsolidiert den Stand.
3. **Feature-Arbeit:** Nutze den Feature-Lifecycle: `/nc:feature-start` → `/nc:plan` → implementieren → `/nc:commit-prep` → `/nc:pr`.

## Verbindliche Regeln

- **Sprache:** Alle Artefakte (Commits, PRs, Doku, Journal) auf Deutsch.
- **Safety:** Keine automatischen Pushes, Merges, Posts oder Deployments ohne explizite Nutzerfreigabe. Vor destruktiven Befehlen (`git push --force`, `git reset --hard`, `git clean -fd`, `rm -rf`, `DROP TABLE`, `deploy`, `terraform destroy`) Fakten nennen — das Safety-Gate erzwingt dies.
- **Branching:** Feature-Branch → PR → Review → Merge. Kein direkter Push auf `main`.
- **Memory:** Kundenkontext bleibt im Arbeits-Repo unter `.nc/` (in `.gitignore`); nichts davon ins OS-Repo übertragen.
- **Fehlender Kontext:** Nachfragen statt raten; im Zweifel auf `/nc:start` zurückgreifen.
- **Journal:** Append-only — bestehende Einträge nie verändern oder löschen.

## Namespace

Alle Skills dieses Team-OS laufen unter dem Namespace `nc:`. Kollisionsfrei zu `uni:` und `ecc:`; deren Dateien werden nie verändert.
