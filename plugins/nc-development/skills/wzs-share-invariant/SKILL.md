---
name: wzs-share-invariant
description: >-
  Prüft die UWG-Invariante „Das System versendet nie Empfehlungsnachrichten an Dritte" im
  Wasserzisterne-Empfehlungssystem — bei JEDEM neuen Endpoint, Flow oder jeder Share-Logik.
  Desktop = Kopieren und QR ohne Mail-Schritt, Mobil = wa.me und mailto in der Mail-App des
  Promotors. Kundenspezifisch — gilt ausschließlich für das Wasserzisterne-Projekt. Quelle:
  CLAUDE.md §2, Projektplan v2.3 §1/§3/§16.H3 des Arbeits-Repos; BGH Urt. v. 12.09.2013 –
  I ZR 208/12.
  Trigger-Begriffe: „Share-Kanal", „Empfehlungsnachricht", „Teilen-Flow", „wa.me",
  „mailto", „UWG", „Empfängerliste".
---

# /nc-development:wzs-share-invariant — Share-Invariante (UWG / rechtssicher)

## Zweck

Produkt-Invariante für WP3 (Umsetzen) und WP6 (Review) der `workflow.md` dieser Abteilung:
verhindert den teuersten Fehler dieses Projekts — den systemseitigen Versand von
Empfehlungs-Mails an Dritte (BGH, Urt. v. 12.09.2013 – I ZR 208/12; § 7 Abs. 2 UWG →
unverlangte Werbung, Abmahnung ab erstem Versand). Bei **jedem** neuen Endpoint, Flow oder
jeder Share-Logik prüfen.

## Ablauf

Die Blöcke A–F in dieser Reihenfolge abarbeiten; jeder Haken braucht einen Beleg aus dem Code
oder der Routen-Übersicht.

### A. Kern-Invariante (niemals verletzen)

- [ ] Das System versendet **nie** Empfehlungsnachrichten an Dritte.
- [ ] Der **Promotor versendet immer selbst** (WhatsApp, eigene Mail-App, kopierte Nachricht).
- [ ] Kein Endpunkt/Flow, der Empfehlungsnachrichten **systemseitig** an Dritte verschickt.

### B. Kanal-Design (Plan §1/§3)

- [ ] **Mobil (D1):** `wa.me` Click-to-Chat (primär) + `mailto:` → Mail-App des Handys (sekundär, Selbstversand).
- [ ] **Desktop (D2):** Nachricht-/Link-Kopieren + QR-Kanalwechsel — **kein E-Mail-Schritt im Desktop-Web** (Login-Hürde).
- [ ] `mailto:` öffnet die Mail-App des Promotors mit vorbefülltem Text — Versand liegt beim Promotor.

### C. Datenminimierung (Nebeneffekt der Invariante)

- [ ] Keine Speicherung **fremder** Empfängeradressen (das System kennt die Kontakte des Promotors nicht).
- [ ] Kein Upload-/Import-Feld für Empfängerlisten.

### D. ⛔ A5 — Bestätigungspflicht

- [ ] Das Share-Kanal-Design weicht **bewusst** von PDF F5 („nur WhatsApp") und F9–F11 („E-Mail-Weiterleitung über KlickTipp") ab.
- [ ] Kunde hat A5 in Plan §11.C **dokumentiert bestätigt** (vor Phase 3).
- [ ] Sollte der Kunde Unternehmens-Versand über KlickTipp fordern: nur mit **dokumentierter anwaltlicher Freigabe** (Abmahn-/Haftungsrisiko beim Unternehmen).

### E. Gutschein-Code-Mail (AUSNAHME — zulässig)

- [ ] Gutschein-Code-Mail an den Promotor = Empfänger ist **eigener Kunde** → zulässig.
- [ ] Versand via KlickTipp (siehe Skill `/nc-development:wzs-reward-guard` Block D und
      `/nc-development:wzs-webhook-contract`).

### F. Stopp-Bedingung

- [ ] Sollte ein Flow/Endpoint diese Invariante verletzen: **sofort stoppen**, nicht „reparieren" — Plan und Projektleitung konsultieren.

## Regeln

- **Rote Linie: kein systemseitiger Versand an Dritte** — unter keinen Umständen, auch nicht
  als Testpfad, Feature-Flag, Migrationshilfe oder „nur im Adminbereich".
- **Bei Verletzung wird gestoppt, nicht nachgebessert.** Ein Flow, der die Invariante bricht,
  ist kein Bug im Detail, sondern ein falsches Design — er geht zurück in die Klärung.
- **Die einzige zulässige System-Mail ist die Gutschein-Code-Mail an den Promotor** (eigener
  Kunde). Jede weitere Mail an Personen, die nicht selbst Kunde sind, ist unzulässig.
- **Keine Empfängerdaten Dritter erheben oder speichern** — kein Import, kein Upload, kein
  verstecktes Feld.
- **⛔ A5 gilt als nicht bestätigt, solange kein dokumentierter Eintrag in Plan §11.C
  existiert.** Defaults nicht stillschweigend als Zustimmung behandeln.
- **Kundenspezifisch:** gilt ausschließlich im Wasserzisterne-Repo.

## Verifikation

- Eine Durchsicht der Routen-/Endpoint-Übersicht belegt: kein Endpunkt versendet
  Empfehlungsnachrichten an Dritte; die gefundenen Versandstellen sind einzeln benannt.
- Für jede gefundene Versandstelle ist der Empfänger nachweislich der **Promotor selbst**
  (Gutschein-Code-Mail) — mit Datei und Fundstelle belegt.
- Das Schema enthält kein Feld für fremde Empfängeradressen; die UI hat kein Upload- oder
  Importfeld für Empfängerlisten.
- Der Desktop-Flow zeigt Kopieren und QR **ohne** E-Mail-Schritt; der Mobil-Flow zeigt `wa.me`
  und `mailto:` als Selbstversand.
- Der Status von ⛔ A5 ist im Ergebnis ausdrücklich genannt (dokumentiert bestätigt oder offen).
