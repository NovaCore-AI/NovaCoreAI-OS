---
name: wzs-attribution
description: >-
  Prüft und baut die Attribution-Logik im Wasserzisterne-Empfehlungssystem — Normalisierung
  (lowercase, E.164), hartes und Fuzzy-Matching, Zeitfenster, Mehrfach-Match-Guard, Tie-Break,
  Karenz-Übergabe und manueller Fallback. Wird VOR und WÄHREND jeder Arbeit an
  `lib/attribution/` oder `lib/normalize/` (Phase 2) angewendet. Kundenspezifisch — gilt
  ausschließlich für das Wasserzisterne-Projekt. Quelle: Projektplan v2.3 §4/§5, CLAUDE.md §5
  des Arbeits-Repos. Frische: Stand v2.3, abgeglichen 2026-07-07 — vor Nutzung gegen den
  Projektplan im Arbeits-Repo prüfen.
  Trigger-Begriffe: „Attribution", „Lead-Order-Matching", „match_confidence", „Normalisierung
  E.164", „Zeitfenster 90 Tage", „Mehrfach-Match".
---

# /nc-development:wzs-attribution — Attribution-Spezifikation (Geld-Pfad)

## Zweck

Produkt-Invariante für WP3 (Umsetzen) und WP6 (Review) der `workflow.md` dieser Abteilung:
Jede Änderung an Matching oder Normalisierung muss diese Checkliste passieren. Attribution ist
der Eingang zum Geld-Pfad — ein falscher Match erzeugt eine falsche Auszahlung. Fakten **nur**
aus `Dokumente/Projektplan Empfehlungssystem v2.md` §4/§5 und `CLAUDE.md` §5 des Arbeits-Repos,
niemals aus dem Gedächtnis.

## Ablauf

Die Blöcke A–E und G in dieser Reihenfolge abarbeiten; jeder Haken braucht einen Beleg aus dem
Code oder der Migration. Die Test-Pflicht (Block F der Quelle) steht unter „Verifikation".

### A. Normalisierung (Pflicht — ohne sie matcht „hart" praktisch nie)

- [ ] E-Mail: `lowercase` + `trim`.
- [ ] Telefon: Normalisierung auf **E.164** (z. B. `+49 151…` und `0151…` → gleiche Repräsentation).
- [ ] Normalisierung auf **allen** Match-Feldern (E-Mail, Telefon, Name separiert).
- [ ] Indizes auf den normalisierten Feldern.

### B. Matching

- [ ] **Hart:** normalisierte E-Mail **und/oder** Telefon (aus E1-Lead ↔ Order).
- [ ] **Fuzzy:** Name → `match_confidence` (Score-basiert, nur Vorschlag).
- [ ] **Fuzzy-Schwelle:** ab welchem Score gilt ein Fuzzy-Match als Treffer? ⛔ **A2** — nicht selbst festnageln, nicht raten.
- [ ] **Zeitfenster:** Link-Öffnung → Kauf innerhalb Default **90 Tage** (🔶 B5 — kundenseitig bestätigen).
- [ ] **Bidirektional:** Lead↔Order in beiden Richtungen auflösbar.
- [ ] `referrals.match_method ∈ {hard, fuzzy, manual}` gesetzt.

### C. Guards

- [ ] **Mehrfach-Match-Guard:** eine Order → genau **ein** Reward.
- [ ] **Tie-Break:** höchste `match_confidence`; bei Gleichstand frühestes `referral`.
- [ ] Kein automatischer Auto-Block — Match wird vorgeschlagen, nicht blind ausgeführt.

### D. Karenz / Bedingung (Verzweigung nach reward-guard)

- [ ] `eligible_at` = **Warenerhalt/`delivered_at` + Karenz** (Default 21 T, § 356 II Nr. 1a BGB).
- [ ] Fallback `completed_at` + **größerer Puffer (Default +35 Tage, Plan §4.5)**, falls kein Lieferdatum.
- [ ] Refund/Storno vor Ablauf → Bedingung erlischt (siehe Skill `/nc-development:wzs-reward-guard`).

### E. Reihenfolge-Falle (Plan §10)

- [ ] E1-Lead-/Attribution-Strategie (⛔ **A1/A2**, Plan §9/§10) muss **vor Phase 3 final** sein, sonst wird E1 zweimal gebaut.
- [ ] Lead-Feld-Priorisierung (E-Mail vs. Telefon) hängt von ⛔ **A2** ab — nicht vorab festnageln.

### G. Manueller Fallback

- [ ] Kein/unsicherer Match → Admin verknüpft `referral ↔ order` manuell (Status `manual`, Audit-Pflicht).

## Regeln

- **Fakten nur aus der Quelle.** Schwellenwerte, Felder und Fristen stammen aus Plan §4/§5 und
  `CLAUDE.md` §5 des Arbeits-Repos. Quelle nicht auffindbar → **STOPP**, sagen, fragen.
- **Offene ⛔-Blocker werden nicht eigenmächtig entschieden.** Insbesondere die Fuzzy-Schwelle
  (**A2**) und die Lead-Feld-Priorisierung bleiben offen, bis eine dokumentierte Entscheidung
  vorliegt — Defaults gelten als **nicht bestätigt** (Gate: `/nc-development:wzs-blocker-gate`).
- **Kein blind ausgeführter Match.** Fuzzy-Ergebnisse sind Vorschläge; der Mehrfach-Match-Guard
  darf nie durch eine Sonderlogik umgangen werden.
- **Rote Linie:** Dies ist der Geld-Pfad. Der Agent löst keine Auszahlung aus, ändert keine
  Reward-Zeile und postet nichts Kundensichtbares — er bereitet vor, der Mensch entscheidet.
- **Kundenspezifisch:** Diese Checkliste gilt ausschließlich im Wasserzisterne-Repo. In anderen
  Repos ist sie fachlich falsch und darf nicht angewendet werden.

## Verifikation

- **Test-Pflicht (Plan/CLAUDE.md §12):** Test-first, **≥ 80 % Coverage** auf Match/Reward —
  der Coverage-Report weist die Grenze für diese Pfade nach.
- Die benannten Tests liegen grün vor: `+49 151…` ≡ `0151…`, Normalisierung, Zeitfenster-Grenze,
  Mehrfach-Order → 1 Reward, Refund-vor-Karenz.
- Die Migration bzw. das Schema zeigt Indizes auf den **normalisierten** Feldern.
- Eine Stichprobe-Query belegt, dass `referrals.match_method` gesetzt ist und nur Werte aus
  `{hard, fuzzy, manual}` enthält.
- Jeder offene ⛔-Blocker dieses Bereichs (A1/A2) ist im Ergebnis ausdrücklich als offen oder
  als dokumentiert entschieden benannt — keine stillschweigende Annahme.
