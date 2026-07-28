---
name: wzs-webhook-contract
description: >-
  Prüft den Webhook- und Integrations-Contract im Wasserzisterne-Empfehlungssystem —
  Idempotenz je Source, Signatur- und Authentizitätsprüfung, Refund- und Status-Events,
  Reconciliation-Fallback gegen Webhook-Verlust und den Architektur-Schnitt „alle
  Fremdsystem-Verbindungen gehören n8n". Wird bei Arbeit an `app/api/webhooks/*` oder an
  Integrations-Logik (KlickTipp, WooCommerce, Streamendous) angewendet. Kundenspezifisch — gilt
  ausschließlich für das Wasserzisterne-Projekt. Quelle: CLAUDE.md §3/§8/§9, Projektplan v2.3
  §4.3 des Arbeits-Repos.
  Trigger-Begriffe: „Webhook", „Idempotenz", „Signaturprüfung", „Reconciliation",
  „WooCommerce", „KlickTipp", „n8n".
---

# /nc-development:wzs-webhook-contract — Webhook-Contract (Integrationen)

## Zweck

Produkt-Invariante für WP3 (Umsetzen) und WP6 (Review) der `workflow.md` dieser Abteilung:
Attribution darf nicht an verlorenen Webhooks scheitern, und jedes Event wird genau einmal
verarbeitet. Architektur-Schnitt: **n8n** besitzt alle Fremdsystem-Verbindungen — Eigencode
baut nie direkt gegen Fremdsysteme. Fakten aus `CLAUDE.md` §3/§8/§9 und Plan §4.3 des
Arbeits-Repos.

## Ablauf

Die Blöcke A–F in dieser Reihenfolge abarbeiten; jeder Haken braucht einen Beleg aus Code,
Schema oder n8n-Workflow. Die Test-Pflicht (Block G der Quelle) steht unter „Verifikation".

### A. Idempotenz (Pflicht)

- [ ] `webhook_events.idempotency_key` **unique pro Source** (woocommerce, klicktipp, …).
- [ ] Wiederholtes Event → keine Doppelverarbeitung.
- [ ] Reihenfolge-Toleranz (Events können ungeordnet eintreffen).

### B. Signatur / Authentizität

- [ ] WooCommerce-Webhook **signiert** geprüft (Woo per Konvention HMAC-SHA256).
- [ ] KlickTipp-Webhook authentifiziert — **Methode geklärt?** (⛔ A4 — nicht raten; falls unklar, offen markieren).
- [ ] Signatur-Fehler → Event **ablehnen**, nicht silent verarbeiten.

### C. Refund-/Status-Events (Geld-Pfad-kritisch)

- [ ] WooCommerce `webhook_events` verarbeitet **inkl. Status- und Refund-Updates** (Plan H1/H4).
- [ ] `orders.woo_status`, `completed_at`, `delivered_at`, `refunded_at` aktualisiert.
- [ ] Refund-Erkennung → verknüpft mit Skill `/nc-development:wzs-reward-guard` (Bedingung erlischt).

### D. Reconciliation-Fallback (gegen Webhook-Verlust)

- [ ] n8n-Cron pollt WooCommerce-REST (Default 48 h) als Webhook-Fallback.
- [ ] Idempotenter Nachtrag über `woo_order_id` (keine Duplikate).
- [ ] Monitoring-Alert, falls Webhooks/Reconciliation ausfallen.
- [ ] `POST /api/internal/orders/reconcile` als Cron-Ziel vorhanden + idempotent.

### E. Externe Systeme (nur über n8n)

- [ ] Eigencode ruft **nie** direkt KlickTipp/WooCommerce/Streamendous auf.
- [ ] Gutschein-Trigger idempotent wiederholbar (n8n-SPOF-Absicherung).

### F. ⛔-Abhängigkeiten

- [ ] **A2** geklärt: Woo-Webhook verfügbar? Felder? Refund-Events? REST-Zugriff? → bestimmt auch E1-Lead-Feld-Priorisierung.
- [ ] **A4** geklärt: Streamendous API/Webhook + `failed`-Handling.

## Regeln

- **Rote Linie: kein Direktaufruf eines Fremdsystems aus dem Eigencode.** Alle Verbindungen zu
  KlickTipp, WooCommerce und Streamendous laufen über n8n — auch „nur kurz zum Testen" nicht.
- **Signatur-Fehler führen zur Ablehnung**, nie zu stiller Verarbeitung und nie zu einem
  Bypass-Schalter für die Entwicklungsumgebung, der in Produktion wirken kann.
- **Kein Event ohne Idempotenzschlüssel.** Wiederholung und ungeordnete Zustellung sind der
  Normalfall, nicht der Ausnahmefall.
- **Offene ⛔-Blocker (A2, A4) werden nicht durch Annahmen ersetzt** — unklare
  Authentifizierungsmethoden werden ausdrücklich als offen markiert
  (Gate: `/nc-development:wzs-blocker-gate`).
- **Refund-Events sind Geld-Pfad.** Änderungen daran gehen zusätzlich durch
  `/nc-development:wzs-reward-guard`.
- **Kundenspezifisch:** gilt ausschließlich im Wasserzisterne-Repo.

## Verifikation

- **Test-Pflicht:** Die drei benannten Tests liegen grün vor — Webhook-Wiederholung ohne
  Doppelverarbeitung, Signatur-Fehler → Ablehnung, Reconciliation trägt eine fehlende Order
  idempotent nach.
- Das Schema zeigt den Unique-Constraint auf `webhook_events.idempotency_key` **pro Source**.
- Eine Suche über den Eigencode belegt, dass kein direkter Aufruf gegen KlickTipp, WooCommerce
  oder Streamendous existiert; gefundene Aufrufe sind mit Fundstelle benannt.
- Der Cron-Endpunkt `POST /api/internal/orders/reconcile` existiert und ist nachweislich
  idempotent (zweiter Lauf erzeugt keine Duplikate).
- Der Stand von ⛔ A2 und ⛔ A4 ist im Ergebnis ausdrücklich genannt (geklärt oder offen).
