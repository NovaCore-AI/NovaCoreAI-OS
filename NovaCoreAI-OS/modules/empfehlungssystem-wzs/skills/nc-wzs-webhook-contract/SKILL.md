---
name: nc:wzs-webhook-contract
description: Webhook/Integration-Contract im Wasserzisterne-Empfehlungssystem prüfen — Idempotenz, Signatur, Refund-/Status-Events, Reconciliation-Fallback. Nutzen bei Arbeit an `app/api/webhooks/*` oder Integrations-Logik (KlickTipp, WooCommerce, Streamendous). Quelle: CLAUDE.md §3/§8/§9, Plan v2.3 §4.3. Kundenspezifisch — nur Wasserzisterne.
---

# /nc:wzs-webhook-contract — Webhook-Contract (Integrationen)

Zweck: Attribution darf nicht an verlorenen Webhooks scheitern, und jedes Event
genau einmal verarbeiten. Architektur-Schnitt: **n8n** besitzt alle Fremdsystem-
Verbindungen — Eigencode baut nie direkt gegen Fremdsysteme. Fakten aus
`CLAUDE.md` §3/§8/§9 und Plan §4.3.

## A. Idempotenz (Pflicht)

- [ ] `webhook_events.idempotency_key` **unique pro Source** (woocommerce, klicktipp, …).
- [ ] Wiederholtes Event → keine Doppelverarbeitung.
- [ ] Reihenfolge-Toleranz (Events können ungeordnet eintreffen).

## B. Signatur / Authentizität

- [ ] WooCommerce-Webhook **signiert** geprüft (Woo per Konvention HMAC-SHA256).
- [ ] KlickTipp-Webhook authentifiziert — **Methode geklärt?** (⛔ A4 — nicht raten; falls unklar, offen markieren).
- [ ] Signatur-Fehler → Event **ablehnen**, nicht silent verarbeiten.

## C. Refund-/Status-Events (Geld-Pfad-kritisch)

- [ ] WooCommerce `webhook_events` verarbeitet **inkl. Status- und Refund-Updates** (Plan H1/H4).
- [ ] `orders.woo_status`, `completed_at`, `delivered_at`, `refunded_at` aktualisiert.
- [ ] Refund-Erkennung → verknüpft mit Skill `/nc:wzs-reward-guard` (Bedingung erlischt).

## D. Reconciliation-Fallback (gegen Webhook-Verlust)

- [ ] n8n-Cron pollt WooCommerce-REST (Default 48 h) als Webhook-Fallback.
- [ ] Idempotenter Nachtrag über `woo_order_id` (keine Duplikate).
- [ ] Monitoring-Alert, falls Webhooks/Reconciliation ausfallen.
- [ ] `POST /api/internal/orders/reconcile` als Cron-Ziel vorhanden + idempotent.

## E. Externe Systeme (nur über n8n)

- [ ] Eigencode ruft **nie** direkt KlickTipp/WooCommerce/Streamendous auf.
- [ ] Gutschein-Trigger idempotent wiederholbar (n8n-SPOF-Absicherung).

## F. ⛔-Abhängigkeiten

- [ ] **A2** geklärt: Woo-Webhook verfügbar? Felder? Refund-Events? REST-Zugriff? → bestimmt auch E1-Lead-Feld-Priorisierung.
- [ ] **A4** geklärt: Streamendous API/Webhook + `failed`-Handling.

## G. Test-Pflicht

- [ ] Webhook-Wiederholung ohne Doppelverarbeitung.
- [ ] Signatur-Fehler → Ablehnung.
- [ ] Reconciliation trägt fehlende Order nach (idempotent).
