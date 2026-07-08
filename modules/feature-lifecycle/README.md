# Modul: feature-lifecycle

Deckt den kompletten Feature-Lebenszyklus in einer Softwarefirma ab — von der
Anforderungsklärung bis zum PR.

## Skills

| Skill | Zweck |
|---|---|
| `/nc:feature-start` | Anforderung klären, Kontext laden, nächsten Skill empfehlen |
| `/nc:plan` | Task in vertikale, PR-große Slices zerlegen |
| `/nc:commit-prep` | Pre-Commit: Lint/Format/Tests prüfen, Commit-Message vorschlagen |
| `/nc:pr` | PR aus Branch erstellen, Push erst nach Freigabe |

## Typischer Ablauf

```
/nc:feature-start → /nc:plan → (implementieren) → /nc:commit-prep → /nc:pr
```

## Voraussetzungen

- Core-Version ≥ 0.1.0 (siehe `modules/module-registry.json`)
- Repo mit `.nc-os`-Marker und Git-Remote
