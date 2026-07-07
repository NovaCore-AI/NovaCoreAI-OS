---
name: nc:wzs-attribution
description: Attribution-Logik im Wasserzisterne-Empfehlungssystem prüfen/bauen — Normalisierung, hart/fuzzy Matching, Zeitfenster, Mehrfach-Match-Guard, Tie-Break. Nutzen VOR und WÄHREND Arbeit an `lib/attribution/` oder `lib/normalize/` (Phase 2). Quelle: Projektplan v2.3 §4/§5, CLAUDE.md §5. Kundenspezifisch — nur Wasserzisterne.
---

# /nc:wzs-attribution — Attribution-Spezifikation (Geld-Pfad)

Zweck: Jede Änderung an Matching/Normalisierung muss diese Checkliste passieren.
Fakten **nur** aus `Dokumente/Projektplan Empfehlungssystem v2.md` §4/§5 und
`CLAUDE.md` §5 — niemals aus dem Gedächtnis.

## A. Normalisierung (Pflicht — ohne sie matcht „hart" praktisch nie)

- [ ] E-Mail: `lowercase` + `trim`.
- [ ] Telefon: Normalisierung auf **E.164** (z. B. `+49 151…` und `0151…` → gleiche Repräsentation).
- [ ] Normalisierung auf **allen** Match-Feldern (E-Mail, Telefon, Name separiert).
- [ ] Indizes auf den normalisierten Feldern.

## B. Matching

- [ ] **Hart:** normalisierte E-Mail **und/oder** Telefon (aus E1-Lead ↔ Order).
- [ ] **Fuzzy:** Name → `match_confidence` (Score-basiert, nur Vorschlag).
- [ ] **Fuzzy-Schwelle:** ab welchem Score gilt ein Fuzzy-Match als Treffer? ⛔ **A2** — nicht selbst festnageln, nicht raten.
- [ ] **Zeitfenster:** Link-Öffnung → Kauf innerhalb Default **90 Tage** (🔶 B5 — kundenseitig bestätigen).
- [ ] **Bidirektional:** Lead↔Order in beiden Richtungen auflösbar.
- [ ] `referrals.match_method ∈ {hard, fuzzy, manual}` gesetzt.

## C. Guards

- [ ] **Mehrfach-Match-Guard:** eine Order → genau **ein** Reward.
- [ ] **Tie-Break:** höchste `match_confidence`; bei Gleichstand frühestes `referral`.
- [ ] Kein automatischer Auto-Block — Match wird vorgeschlagen, nicht blind ausgeführt.

## D. Karenz / Bedingung (Verzweigung nach reward-guard)

- [ ] `eligible_at` = **Warenerhalt/`delivered_at` + Karenz** (Default 21 T, § 356 II Nr. 1a BGB).
- [ ] Fallback `completed_at` + **größerer Puffer (Default +35 Tage, Plan §4.5)**, falls kein Lieferdatum.
- [ ] Refund/Storno vor Ablauf → Bedingung erlischt (siehe Skill `/nc:wzs-reward-guard`).

## E. Reihenfolge-Falle (Plan §10)

- [ ] E1-Lead-/Attribution-Strategie (⛔ **A1/A2**, Plan §9/§10) muss **vor Phase 3 final** sein, sonst wird E1 zweimal gebaut.
- [ ] Lead-Feld-Priorisierung (E-Mail vs. Telefon) hängt von ⛔ **A2** ab — nicht vorab festnageln.

## F. Test-Pflicht (CLAUDE.md §12)

- [ ] Test-first, **≥ 80 % Coverage** auf Match/Reward.
- [ ] Benannte Tests: `+49 151…` ≡ `0151…`, Normalisierung, Zeitfenster-Grenze, Mehrfach-Order→1 Reward, Refund-vor-Karenz.

## G. Manueller Fallback

- [ ] Kein/unsicherer Match → Admin verknüpft `referral ↔ order` manuell (Status `manual`, Audit-Pflicht).
