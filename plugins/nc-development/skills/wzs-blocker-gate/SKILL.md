---
name: wzs-blocker-gate
description: >-
  Verweigert im Wasserzisterne-Empfehlungssystem den Bau-Start einer Phase, solange der
  zugehörige ⛔-Blocker in Plan §11.C nicht dokumentiert entschieden ist, und unterscheidet
  dabei harte von weichen Abhängigkeiten. Wird VOR Beginn jeder Phase und jedes Bau-Schritts
  angewendet. Kundenspezifisch — gilt ausschließlich für das Wasserzisterne-Projekt. Quelle:
  CLAUDE.md §10, Projektplan v2.3 §11 des Arbeits-Repos. Frische: Stand v2.3, abgeglichen
  2026-07-07 — vor Nutzung gegen den Projektplan im Arbeits-Repo prüfen.
  Trigger-Begriffe: „Phase starten", „Bau-Start", „Blocker A1 bis A5", „offene
  Kundenentscheidung", „Klärungs-Workshop", „darf gebaut werden".
---

# /nc-development:wzs-blocker-gate — Blocker-Gate (Phase-Start-Sperre)

## Zweck

Produkt-Invariante für WP3 (Umsetzen) der `workflow.md` dieser Abteilung, vorgelagert zu jedem
Bau-Schritt: „Kein Phase-Start ohne dokumentierte Entscheidung" (Plan §11.C, `CLAUDE.md` §10
des Arbeits-Repos). Der Baustart ist durch Kunden-Blocker gegated — sonst wird falsch gebaut
und die Arbeit fällt später als Doppelbau an.

## Ablauf

Die Blöcke A–D in dieser Reihenfolge abarbeiten, **bevor** der erste Handgriff der Phase
passiert.

### A. Mappe Phase → Blocker

| Phase | ⛔-Blocker, die VOR Start dokumentiert entschieden sein müssen | Art |
|---|---|---|
| Phase 0 (Infra) | Klärungs-Workshop A1–A5 **anstoßen**; **Infra-Bau selbst ist nicht blocker-abhängig** | weich |
| Phase 1 (Datenmodell+Core) | **A1** | hart |
| Phase 2 (Attribution+Reward) | **A2, A3, A4** | hart |
| Phase 3 (Öffentliche Seiten) | **A5, A3** (E1-Wording hängt an A3) | hart |
| Phase 4 (Admin) | A3/A4 für **Approval-UI-Gestaltung** (Bau möglich, UI-Passung später) | weich |
| Phase 5 (Launch) | alle A1–A5 + Launch-Checkliste §13 | hart |

„hart" = kein Phase-Start ohne Eintrag. „weich" = Bau kann laufen, betroffene UI/Logik-Passung
erst nach Klärung.

### B. Gate-Prüfung (vor jedem Bau-Schritt)

- [ ] `Dokumente/Projektplan Empfehlungssystem v2.md` §11.C geöffnet.
- [ ] Für die aktuelle Phase: jeder zugehörige ⛔-Blocker hat **Ergebnis + Datum + Beleg** eingetragen?
- [ ] Wenn leer oder `_offen_`: **Phase nicht starten**. Default gilt als **nicht bestätigt**.
- [ ] Kunde aktiv auf A3 (Karenz ab Warenerhalt) und A5 (Share-Kanal-Design) ansprechen — beide weichen sichtbar von PDF ab.

### C. Sekundär: 🔶 Annahmen (B3–B10)

- [ ] Annahmen haben baubare Defaults — aber kundenseitig in einem Satz bestätigen lassen.
- [ ] DSGVO-relevante Annahmen (B8 Retention, B9 CTA-Gating) besonders nachverfolgen.

### D. Wenn etwas offen ist

- [ ] Nicht raten, nicht Defaults stillschweigend als bestätigt behandeln.
- [ ] Klärungs-Ticket **benennen** bzw. den **Anlage-Bedarf formulieren**. Anlage oder
      Transition im Jira nur mit **Einzelfreigabe** (Stufe 1); kundensichtbare Freitexte nie
      (Stufe 2 — Mensch). Wo kein Jira-Zugang besteht: **manueller Weg** — Vorgang, Zielstatus
      und Text als kopierfertigen Block an den Menschen übergeben.
- [ ] Projekt-Kürzel: `EP` ist eine **unbestätigte Portierungs-Annahme** aus dem Vorbild und
      keine belegte Fachfakt-Angabe. Vor Nutzung gegen die `CLAUDE.md`/`AGENTS.md` des
      Arbeits-Repos prüfen; fehlt der Beleg, wird der Key **nicht geraten**, sondern der
      Vorgang beschrieben und der Key nachgefordert.
- [ ] Dem Team und der Projektleitung melden; Entscheidung nachtragen lassen, dann erst bauen.

## Regeln

- **Rote Linie: kein Start einer hart gegateten Phase ohne dokumentierte Entscheidung.** Der
  Agent baut nicht „schon mal vor" und legt keine Struktur an, die die offene Entscheidung
  vorwegnimmt.
- **Ein Default ist keine Entscheidung.** Fehlt Ergebnis, Datum oder Beleg in Plan §11.C, gilt
  der Blocker als offen.
- **Weiche Blocker erlauben den Bau, nicht das Festlegen.** Betroffene UI- und Logik-Passung
  bleibt bis zur Klärung ausdrücklich als „nachzuziehen" markiert.
- **Nicht raten, nachfragen.** Widersprüchliche Angaben zwischen PDF und Plan werden gemeldet,
  nicht harmonisiert.
- **Rote Linie:** Der Skill legt keine Jira-Vorgänge eigenmächtig an und postet nichts
  Kundensichtbares — er bereitet den Klärungsbedarf auf, der Mensch kommuniziert. Lesen ist
  frei; Transitionen und Feldänderungen brauchen eine **Einzelfreigabe je Vorgang**.
- **Kein geratener Projekt-Key.** Solange die Projekt-Key(s) nicht aus dem Arbeits-Repo belegt
  sind, wird der Vorgang beschrieben statt benannt (offener Punkt, Maintainer-Nachreichung).
- **Kundenspezifisch:** gilt ausschließlich im Wasserzisterne-Repo.

## Verifikation

- Für die anstehende Phase ist die Zeile aus der Mappe (Block A) benannt und die Art (hart /
  weich) ausgesprochen.
- Zu jedem zugehörigen ⛔-Blocker ist der Stand aus Plan §11.C zitiert: **Ergebnis + Datum +
  Beleg** oder ausdrücklich „offen".
- Bei einem harten offenen Blocker liegt eine explizite **Nicht-Start-Empfehlung** vor und es
  wurde kein Code der Phase geschrieben (`git status` zeigt keine entsprechenden Änderungen).
- Bei weichen Blockern ist die Liste der später nachzuziehenden UI-/Logik-Passungen genannt.
- Für offene Punkte ist das Klärungs-Ticket benannt oder der Bedarf zur Anlage formuliert; ist
  ein Projekt-Key genannt, ist seine Quelle im Arbeits-Repo mitgenannt — sonst steht dort
  ausdrücklich „Key offen".
- Zum Jira ist ausgesprochen, was geschah: nur gelesen, mit Einzelfreigabe geändert oder als
  manueller Schritt an den Menschen übergeben.
