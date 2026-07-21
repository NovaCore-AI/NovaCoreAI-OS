---
name: share-invariant
description: UWG-Invariante „System versendet nie Empfehlungsnachrichten an Dritte" prüfen — bei JEDEM neuen Endpoint/Flow/Share-Logik. Desktop = Kopieren+QR (kein Mail-Schritt), Mobil = wa.me + mailto-in-Mail-App. Quelle: CLAUDE.md §2, Plan v2.3 §1/§3/§16.H3. BGH Urt. v. 12.09.2013 – I ZR 208/12.
---

# Share-Invariante (UWG / rechtssicher)

Zweck: Verhindert den teuersten Fehler dieses Projekts — systemseitigen Versand von Empfehlungs-Mails an Dritte (BGH, Urt. v. 12.09.2013 – I ZR 208/12; § 7 Abs. 2 UWG → unverlangte Werbung, Abmahnung ab erstem Versand). Bei **jedem** neuen Endpoint/Flow/Share-Logik prüfen.

## A. Kern-Invariante (niemals verletzen)

- [ ] Das System versendet **nie** Empfehlungsnachrichten an Dritte.
- [ ] Der **Promotor versendet immer selbst** (WhatsApp, eigene Mail-App, kopierte Nachricht).
- [ ] Kein Endpunkt/Flow, der Empfehlungsnachrichten **systemseitig** an Dritte verschickt.

## B. Kanal-Design (Plan §1/§3)

- [ ] **Mobil (D1):** `wa.me` Click-to-Chat (primär) + `mailto:` → Mail-App des Handys (sekundär, Selbstversand).
- [ ] **Desktop (D2):** Nachricht-/Link-Kopieren + QR-Kanalwechsel — **kein E-Mail-Schritt im Desktop-Web** (Login-Hürde).
- [ ] `mailto:` öffnet die Mail-App des Promotors mit vorbefülltem Text — Versand liegt beim Promotor.

## C. Datenminimierung (Nebeneffekt der Invariante)

- [ ] Keine Speicherung **fremder** Empfängeradressen (das System kennt die Kontakte des Promotors nicht).
- [ ] Kein Upload-/Import-Feld für Empfängerlisten.

## D. ⛔ A5 — Bestätigungspflicht

- [ ] Das Share-Kanal-Design weicht **bewusst** von PDF F5 („nur WhatsApp") und F9–F11 („E-Mail-Weiterleitung über KlickTipp") ab.
- [ ] Kunde hat A5 in Plan §11.C **dokumentiert bestätigt** (vor Phase 3).
- [ ] Sollte der Kunde Unternehmens-Versand über KlickTipp fordern: nur mit **dokumentierter anwaltlicher Freigabe** (Abmahn-/Haftungsrisiko beim Unternehmen).

## E. Gutschein-Code-Mail (AUSNAHME — zulässig)

- [ ] Gutschein-Code-Mail an den Promotor = Empfänger ist **eigener Kunde** → zulässig.
- [ ] Versand via KlickTipp (siehe Skill `reward-guard` §D, `webhook-contract`).

## F. Stopp-Bedingung

- [ ] Sollte ein Flow/Endpoint diese Invariante verletzen: **sofort stoppen**, nicht „reparieren" — Plan/Hein konsultieren.
