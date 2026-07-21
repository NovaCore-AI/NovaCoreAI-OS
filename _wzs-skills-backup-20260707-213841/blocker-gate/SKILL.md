---
name: blocker-gate
description: Phasen-Start-Gate — verweigert den Bau-Start, wenn der zugehörige ⛔-Blocker in Plan §11.C nicht dokumentiert entschieden ist. Nutzen VOR Beginn jeder Phase / jedes Bau-Schritts. Quelle: CLAUDE.md §10, Plan v2.3 §11.
---

# Blocker-Gate (Phase-Start-Sperre)

Zweck: „Kein Phase-Start ohne dokumentierte Entscheidung" (Plan §11.C, CLAUDE.md §10). Der Baustart ist durch Kunden-Blocker gegated — sonst wird falsch gebaut.

## A. Mappe Phase → Blocker

| Phase | ⛔-Blocker, die VOR Start dokumentiert entschieden sein müssen |
|---|---|
| Phase 0 (Infra) | Klärungs-Workshop A1–A5 **anstoßen**; **Infra-Bau selbst ist nicht blocker-abhängig** |
| Phase 1 (Datenmodell+Core) | **A1** |
| Phase 2 (Attribution+Reward) | **A2, A3, A4** |
| Phase 3 (Öffentliche Seiten) | **A5, A3** (E1-Wording hängt an A3) |
| Phase 4 (Admin) | (abhängig von A3/A4 für Approval-UI) |
| Phase 5 (Launch) | alle A1–A5 + Launch-Checkliste §13 |

## B. Gate-Prüfung (vor jedem Bau-Schritt)

- [ ] `Dokumente/Projektplan Empfehlungssystem v2.md` §11.C geöffnet.
- [ ] Für die aktuelle Phase: jeder zugehörige ⛔-Blocker hat **Ergebnis + Datum + Beleg** eingetragen?
- [ ] Wenn leer oder `_offen_`: **Phase nicht starten**. Default gilt als **nicht bestätigt**.
- [ ] Kunde aktiv auf A3 (Karenz ab Warenerhalt) und A5 (Share-Kanal-Design) ansprechen — beide weichen sichtbar von PDF ab.

## C. Sekundär: 🔶 Annahmen (B3–B10)

- [ ] Annahmen haben baubare Defaults — aber kundenseitig in einem Satz bestätigen lassen.
- [ ] DSGVO-relevante Annahmen (B8 Retention, B9 CTA-Gating) besonders nachverfolgen.

## D. Wenn etwas offen ist

- [ ] Nicht raten, nicht Defaults stillschweigend als bestätigt behandeln.
- [ ] Klärungs-Ticket im Jira (Projekt EP) bewegen oder anlegen.
- [ ] Dem Team/Hein melden; Entscheidung nachtragen lassen, dann erst bauen.
