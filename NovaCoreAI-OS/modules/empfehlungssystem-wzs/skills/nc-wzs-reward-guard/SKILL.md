---
name: nc:wzs-reward-guard
description: Reward-State-Machine & Geldfluss-Invarianten im Wasserzisterne-Empfehlungssystem prüfen/bauen — partial-unique Guards, Karenz (eligible_at), Refund-Erlöschen, failed-Recovery, Approval-Gate, Audit, Pause-Schalter. Nutzen bei JEDEM Eingriff in `lib/rewards/` oder Reward-Admin (Phase 2/4). Quelle: CLAUDE.md §6, Plan v2.3 §4.4/§6/§9. Kundenspezifisch — nur Wasserzisterne.
---

# /nc:wzs-reward-guard — Reward-Guardrails (kritische Geld-Invariante)

Zweck: Doppelzahlung und Fehl-Auszahlung verhindern. **Echtes Geld, hohes Risiko.**
Jede Änderung an `rewards` muss diese Checkliste passieren. Fakten aus `CLAUDE.md`
§6 und `Dokumente/Projektplan Empfehlungssystem v2.md` §4.4/§6.

## A. Idempotenz / Doppelzahlungs-Guard (Pflicht)

- [ ] **Partial-unique** auf `rewards.referral_id`, **nur** für `status ∈ {approved, sent}`.
- [ ] **Partial-unique** auf `rewards.matched_order_id`, **nur** für `status ∈ {approved, sent}`.
- [ ] `failed`-Zeilen erlaubt (sauberer Neuversuch = neue Zeile, alte **nicht** mutieren) → deshalb *partial*-unique, nicht voll-unique.
- [ ] Mehrfach-Empfehlung einer Order → trotzdem genau **ein** ausgezahlter Reward.

## B. Karenzzeit (§ 356 II Nr. 1a BGB)

- [ ] `rewards.eligible_at` = **`orders.delivered_at` (Warenerhalt) + Karenz** (Default 21 T).
- [ ] Widerrufsfrist beginnt bei Waren erst mit **Erhalt**, nicht mit Kaufabschluss.
- [ ] Fallback `completed_at` + **größerer Puffer (Default +35 Tage, Plan §4.5)**, falls kein `delivered_at`.
- [ ] Approval frühestens ab `eligible_at` — nie davor.

## C. Refund / Storno

- [ ] Refund/Storno **vor** Ablauf der Karenz → Bedingung erlischt (`reward_condition_met = false`).
- [ ] Refund **nach** Auszahlung → **nicht** zurückgefordert, nur geloggt/reportet (akzeptiertes Restrisiko, Plan §10).

## D. Approval & Audit

- [ ] **Manuelles Approval-Gate** vor jeder Auszahlung (kein Auto-Payout).
- [ ] Karenz-Status und Fraud-Flags (`referrals.risk_flags`) **sichtbar** im Approval.
- [ ] Alle vier Fraud-Flag-Typen implementiert (CLAUDE.md §5.6): Self-Referral, IP-/Session-Nähe, Velocity, Wegwerf-Domains.
- [ ] Audit-Log (`admin_audit_log`) mit before/after je Reward-Aktion.
- [ ] Gutschein-Code-Versand per E-Mail an Promotor, `code_sent_to_email` protokolliert.

## E. Notfall-Hebel

- [ ] **Programm-Pause-Schalter** vorhanden und getestet.
- [ ] Monats-Report der Reward-Ausgaben (Notbremse bei Fraud/Incident).

## F. Test-Pflicht

- [ ] Test-first, **≥ 80 % Coverage** auf Match/Reward.
- [ ] Adversarielle Tests: Doppel-Order→1 Reward, Refund-vor-Karenz, Refund-nach-Auszahlung, Webhook-Wiederholung, `failed`→Neuversuch.
- [ ] Jeder Reward-PR im **Vier-Augen-Review**.

## G. Grenze (by design)

- [ ] Refund nach Auszahlung wird **nicht** zurückgefordert — siehe §C und Plan §9/§10 (dokumentiertes Restrisiko).
