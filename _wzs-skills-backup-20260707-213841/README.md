# Projekt-Skills — Empfehlungssystem wasserzisterne.de

Project-Scope-Skills für Claude Code in diesem Repo. Jeder Skill kapselt eine kritische Invariante als prüfbare Checkliste. Fakten stammen ausschließlich aus `Dokumente/Projektplan Empfehlungssystem v2.md` (v2.3) und `CLAUDE.md`/`AGENTS.md` — nie aus dem Gedächtnis.

## Skills

| Skill | Zweck | Trigger |
|---|---|---|
| `attribution-spec` | Attribution-Logik: Normalisierung (E.164/lowercase), hart/fuzzy, Zeitfenster, Mehrfach-Match-Guard, Tie-Break | Arbeit an `lib/attribution/`, `lib/normalize/` |
| `reward-guard` | Geldfluss-Invariante: partial-unique Guards, Karenz (`eligible_at` = `delivered_at` + 21 T), Refund-Erlöschen, failed-Recovery, Approval, Audit, Pause | Arbeit an `lib/rewards/`, Reward-Admin |
| `share-invariant` | UWG-Regel: System versendet **nie** Empfehlungsnachrichten an Dritte; Desktop Kopieren+QR, Mobil wa.me+mailto | Arbeit an Share-Flows (D1/D2), Mail-Logik |
| `blocker-gate` | Phasen-Start-Sperre: kein Bau ohne dokumentierte ⛔-Entscheidung in Plan §11.C | Vor jeder Phase / jedem Bau-Schritt |
| `webhook-contract` | Integration-Contract: Idempotenz, Signatur, Refund-/Status-Events, Reconciliation-Fallback | Arbeit an `app/api/webhooks/*`, Integrationen |
| `journal` (bestehend) | Tages-Journal + Jira/Git-Sync | Ende eines Arbeitstags |

## Quellen-Hierarchie

1. `Dokumente/Projektplan Empfehlungssystem v2.md` (v2.3) — Source of Truth.
2. `CLAUDE.md` / `AGENTS.md` — Projekt-Regeln.
3. Diese Skills — kapseln Invarianten, ersetzen nicht die Quelle.

## Pflege

- Ändert sich eine Invariante im Plan (§16 Änderungsprotokoll), ist der zugehörige Skill synchron nachzuziehen.
- Skills sind bewusst klein (Checklisten). Keine Prosa-Wüsten.
- Neue projektspezifische Skills nur, wenn eine Invariante mehrfach verletzt werden könnte — sonst Claude-Code-Standard-Skill (siehe `Dokumente/Skill-Plan.md` §1).
