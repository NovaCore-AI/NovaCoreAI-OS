---
name: wzs-reward-guard
description: >-
  Prüft und baut die Reward-State-Machine und die Geldfluss-Invarianten im
  Wasserzisterne-Empfehlungssystem — partial-unique Guards gegen Doppelzahlung, Karenz
  (`eligible_at`), Refund-Erlöschen, failed-Recovery, manuelles Approval-Gate, Fraud-Flags,
  Audit-Log und Pause-Schalter. Wird bei JEDEM Eingriff in `lib/rewards/` oder in das
  Reward-Admin (Phase 2/4) angewendet. Kundenspezifisch — gilt ausschließlich für das
  Wasserzisterne-Projekt. Quelle: CLAUDE.md §6, Projektplan v2.3 §4.4/§6/§9 des Arbeits-Repos.
  Frische: Stand v2.3, abgeglichen 2026-07-07 — vor Nutzung gegen den Projektplan im
  Arbeits-Repo prüfen.
  Trigger-Begriffe: „Reward", „Auszahlung", „Doppelzahlung", „Karenz eligible_at", „Refund",
  „Approval-Gate", „Gutschein-Code".
---

# /nc-development:wzs-reward-guard — Reward-Guardrails (kritische Geld-Invariante)

## Zweck

Produkt-Invariante für WP3 (Umsetzen) und WP6 (Review) der `workflow.md` dieser Abteilung:
verhindert Doppelzahlung und Fehl-Auszahlung. **Echtes Geld, hohes Risiko.** Jede Änderung an
`rewards` muss diese Checkliste passieren. Fakten aus `CLAUDE.md` §6 und
`Dokumente/Projektplan Empfehlungssystem v2.md` §4.4/§6 des Arbeits-Repos.

## Ablauf

Die Blöcke A–E und G in dieser Reihenfolge abarbeiten; jeder Haken braucht einen Beleg aus
Schema, Code oder Test. Die Test-Pflicht (Block F der Quelle) steht unter „Verifikation".

### A. Idempotenz / Doppelzahlungs-Guard (Pflicht)

- [ ] **Partial-unique** auf `rewards.referral_id`, **nur** für `status ∈ {approved, sent}`.
- [ ] **Partial-unique** auf `rewards.matched_order_id`, **nur** für `status ∈ {approved, sent}`.
- [ ] `failed`-Zeilen erlaubt (sauberer Neuversuch = neue Zeile, alte **nicht** mutieren) → deshalb *partial*-unique, nicht voll-unique.
- [ ] Mehrfach-Empfehlung einer Order → trotzdem genau **ein** ausgezahlter Reward.

### B. Karenzzeit (§ 356 II Nr. 1a BGB)

- [ ] `rewards.eligible_at` = **`orders.delivered_at` (Warenerhalt) + Karenz** (Default 21 T).
- [ ] Widerrufsfrist beginnt bei Waren erst mit **Erhalt**, nicht mit Kaufabschluss.
- [ ] Fallback `completed_at` + **größerer Puffer (Default +35 Tage, Plan §4.5)**, falls kein `delivered_at`.
- [ ] Approval frühestens ab `eligible_at` — nie davor.

### C. Refund / Storno

- [ ] Refund/Storno **vor** Ablauf der Karenz → Bedingung erlischt (`reward_condition_met = false`).
- [ ] Refund **nach** Auszahlung → **nicht** zurückgefordert, nur geloggt/reportet (akzeptiertes Restrisiko, Plan §10).

### D. Approval & Audit

- [ ] **Manuelles Approval-Gate** vor jeder Auszahlung (kein Auto-Payout).
- [ ] Karenz-Status und Fraud-Flags (`referrals.risk_flags`) **sichtbar** im Approval.
- [ ] Alle vier Fraud-Flag-Typen implementiert (CLAUDE.md §5.6): Self-Referral, IP-/Session-Nähe, Velocity, Wegwerf-Domains.
- [ ] Audit-Log (`admin_audit_log`) mit before/after je Reward-Aktion.
- [ ] Gutschein-Code-Versand per E-Mail an Promotor, `code_sent_to_email` protokolliert.

### E. Notfall-Hebel

- [ ] **Programm-Pause-Schalter** vorhanden und getestet.
- [ ] Monats-Report der Reward-Ausgaben (Notbremse bei Fraud/Incident).

### G. Grenze (by design)

- [ ] Refund nach Auszahlung wird **nicht** zurückgefordert — siehe Block C und Plan §9/§10 (dokumentiertes Restrisiko).

## Regeln

- **Rote Linie: kein Auto-Payout.** Vor jeder Auszahlung steht ein manuelles Approval durch
  einen Menschen; der Agent bereitet vor und löst nie selbst aus.
- **`failed`-Zeilen werden nie mutiert.** Ein Neuversuch erzeugt eine neue Zeile — sonst geht
  die Historie verloren und der partial-unique Guard verliert seine Wirkung.
- **Voll-unique statt partial-unique ist ein Fehler**, kein Vereinfachungsspielraum: er
  blockiert den legitimen Neuversuch nach `failed`.
- **Approval nie vor `eligible_at`.** Die Karenz ist eine gesetzliche Frist
  (§ 356 II Nr. 1a BGB), keine Konvention.
- **Fakten nur aus der Quelle** (`CLAUDE.md` §6, Plan §4.4/§6/§9). Fristen, Defaults und
  Statuswerte nie aus dem Gedächtnis setzen; Quelle nicht auffindbar → **STOPP**, fragen.
- **Kundenspezifisch:** gilt ausschließlich im Wasserzisterne-Repo.

## Verifikation

- **Test-Pflicht:** Test-first, **≥ 80 % Coverage** auf Match/Reward — der Coverage-Report
  weist die Grenze für diese Pfade nach.
- Die adversariellen Tests liegen grün vor: Doppel-Order → 1 Reward, Refund-vor-Karenz,
  Refund-nach-Auszahlung, Webhook-Wiederholung, `failed` → Neuversuch.
- Das Schema bzw. die Migration zeigt **beide** partial-unique Indizes mit der Bedingung
  `status ∈ {approved, sent}`.
- Ein Testlauf oder Log-Auszug belegt, dass der Programm-Pause-Schalter greift.
- Das Audit-Log enthält zu einer Beispiel-Reward-Aktion einen before/after-Eintrag.
- **Jeder Reward-PR ist im Vier-Augen-Review** — die zweite Person ist im PR benannt.
