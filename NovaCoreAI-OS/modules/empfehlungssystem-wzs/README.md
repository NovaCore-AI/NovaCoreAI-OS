# Modul: empfehlungssystem-wzs

Kundenspezifische Invarianten-Skills für das **Empfehlungssystem wasserzisterne.de**.
Namespace `nc:wzs-*`. Jeder Skill kapselt eine kritische fachliche Invariante des
Projekts als prüfbare Checkliste.

> **Achtung — kundenspezifisch:** Diese Skills sind **kein** generisches Stack-Modul.
> Sie gelten ausschließlich für das Wasserzisterne-Empfehlungssystem und referenzieren
> den verbindlichen Projektplan (`Dokumente/Projektplan Empfehlungssystem v2.md`,
> aktuell v2.3) sowie die projekt-eigene `CLAUDE.md`/`AGENTS.md`. In anderen Repos
> sind sie fachlich **falsch** und dürfen nicht angewendet werden.

## Skills

| Skill | Zweck | Trigger |
|---|---|---|
| `/nc:wzs-attribution` | Attribution-Logik: Normalisierung (E.164/lowercase), hart/fuzzy, Zeitfenster, Mehrfach-Match-Guard, Tie-Break | Arbeit an `lib/attribution/`, `lib/normalize/` (Phase 2) |
| `/nc:wzs-reward-guard` | Geldfluss-Invariante: partial-unique Guards, Karenz (`eligible_at` = `delivered_at` + 21 T), Refund-Erlöschen, failed-Recovery, Approval, Audit, Pause | Arbeit an `lib/rewards/`, Reward-Admin (Phase 2/4) |
| `/nc:wzs-share-invariant` | UWG-Regel: System versendet **nie** Empfehlungsnachrichten an Dritte; Desktop Kopieren+QR, Mobil wa.me+mailto | Arbeit an Share-Flows (D1/D2), Mail-Logik |
| `/nc:wzs-blocker-gate` | Phasen-Start-Sperre: kein Bau ohne dokumentierte ⛔-Entscheidung in Plan §11.C | Vor jeder Phase / jedem Bau-Schritt |
| `/nc:wzs-webhook-contract` | Integration-Contract: Idempotenz, Signatur, Refund-/Status-Events, Reconciliation-Fallback | Arbeit an `app/api/webhooks/*`, Integrationen |

## Quellen-Hierarchie (im Wasserzisterne-Repo)

1. `Dokumente/Projektplan Empfehlungssystem v2.md` (v2.3) — Source of Truth.
2. `CLAUDE.md` / `AGENTS.md` — Projekt-Regeln.
3. Diese Skills — kapseln Invarianten, ersetzen nicht die Quelle.

## Pflege

- Ändert sich eine Invariante im Plan (§16 Änderungsprotokoll), ist der zugehörige
  Skill synchron nachzuziehen.
- Neue Invarianten nur, wenn eine mehrfach verletzt werden könnte.
- Skills bleiben klein (Checklisten), keine Prosa-Wüsten.

## Voraussetzungen

- Core-Version ≥ 0.1.0 (siehe `modules/module-registry.json`).
- Aktiv: bringt keine eigenen Hooks mit.
