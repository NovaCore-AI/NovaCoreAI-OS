# Modul: feature-lifecycle

Deckt den kompletten Feature-Lebenszyklus in einer Softwarefirma ab — von der
Anforderungsklärung bis zum PR.

## Skills

| Skill | Zweck |
|---|---|
| `/nc:flc-feature-start` | Anforderung klären, Kontext laden, nächsten Skill empfehlen |
| `/nc:flc-plan` | Task in vertikale, PR-große Slices zerlegen |
| `/nc:flc-commit-prep` | Pre-Commit: Lint/Format/Tests prüfen, Commit-Message vorschlagen |
| `/nc:flc-pr` | PR aus Branch erstellen, Push erst nach Freigabe |

## Typischer Ablauf

```
/nc:flc-feature-start → /nc:flc-plan → (implementieren) → /nc:flc-commit-prep → /nc:flc-pr
```

## Voraussetzungen

- Core-Version ≥ 0.1.0 (siehe `modules/module-registry.json`)
- Repo mit `.nc-os`-Marker und Git-Remote
