# Nachtschicht-Plan 2026-08-24/25 — Onsite-Delta Phase I ausführen

> **Status:** lebend. Ausführungsplan für eine unbeaufsichtigte Nachtschicht auf einer
> **anderen Maschine**. Er führt aus, was der
> [Phase-I-Bauplan](../grundwissen/2026-08-24-onsite-delta-phase-i-bauplan.md) beschreibt —
> dort stehen Begründung, Quellenlage, Invarianten und Testfälle; hier steht nur, **wie**
> gearbeitet wird, **wo gestoppt** wird und **was verboten** ist.
>
> **Auftrag:** Lucas Vöhringer, 2026-08-24 („ich würd's einfach wieder so machen daß ich eine
> Nachtschicht anstoße aber halt nicht hier auf der Maschine").
>
> **Vorbedingung:** Der ausführende Agent ist Overseer seiner Sitzung (Opus oder Fable,
> Org-Ruleset Punkt 1). Phase I ist *cross-cutting infrastructure work* — Planung und
> Durchführung an den drei Fugen-Dateien bleiben beim Overseer; delegierbar ist allein
> AP-B3 (Fundstellen-Sweep) und das Nachzugs-Bündel §7 des Bauplans.

---

## 1. Was die Nachtschicht liefert

Ein **PR** auf einem frischen Branch `feat/onsite-delta-phase-i`, ausgehend von `main`
(`388f0f3`, Kern 0.12.0), mit den Paketen I-A → I-B → I-C in dieser Reihenfolge, dem
Nachzugs-Bündel, **einem** Kern-Bump auf 0.13.0 und **einem** Waypoint-CHANGELOG-Schnitt.

**Nicht geliefert wird:** ein Merge. Der Merge ist Maintainer-Sache.

---

## 2. Die vier Regeln, die diese Nachtschicht von der letzten unterscheiden

Am 2026-08-24 lief eine Nachtschicht in einem anderen Repo ~14 Stunden in einer
Warteschleife, weil sie an einer Bedingung hing, die nur ein Mensch auflösen konnte. Daraus:

| # | Regel |
|---|---|
| **R1** | **Kein Selbst-Loop.** Kein `/loop`, kein `ScheduleWakeup`, kein `CronCreate`, kein Monitor-Heartbeat, keine Wiederholung „bis Bedingung X eintritt". Wenn die Arbeit auf einen Menschen wartet, **endet der Lauf** — mit Übergabetext, nicht mit einem Timer |
| **R2** | **Unbekanntes Kommando wird nie ersetzt.** Ist ein angewiesener Skill oder Slash-Befehl nicht verfügbar: **stoppen und im Abschlussbericht melden.** Niemals „das Nächstbeste" nehmen |
| **R3** | **Blockade ist ein Ergebnis, kein Hindernis.** Ein sauber dokumentierter Stopp mit klarer Frage ist ein vollwertiges Nachtschicht-Ergebnis. Weiterarbeiten an allem, was *nicht* blockiert ist — den Rest liegen lassen |
| **R4** | **Kein Gate wird deaktiviert.** FFG, Start-Gate und Safety-Gate bleiben scharf. Das FFG verlangt vor dem ersten Bash und dem ersten Write je Datei die Faktennennung — das ist der normale Weg, kein Fehler. `ECC_GATEGUARD=off` ist verboten |

---

## 3. Reihenfolge und Stopp-Punkte

```
I-A  Fugen (A1–A10)          → Suite grün → Commit
I-B  Umzug (B1–B6)           → Suite grün → Commit
I-C  Mechanik (C1–C8)        → Suite grün → Commit      ⟵ Vorbehalt S1 bei C3
§7   Nachzugs-Bündel          → Suite grün → Commit
     Bump + Waypoint-Schnitt  → Suite grün → Push + PR
```

**Zwingend, aus dem Bauplan §3:**

1. Alle Testinvarianten aus **A8 stehen, bevor irgendein `git mv` läuft.** Sonst ist die
   Suite zwischen zwei Commits rot und jede Zwischenverifikation wertlos.
2. **C2 (referenz/-Einstufung) vor C3.** Sonst erweitert derselbe PR eine Datei normativ,
   die er als unreviewed markiert.
3. **C1 (Systemachsen) vor C4/C5.** Die Skills zitieren sonst eine Begriffsnorm, die es bei
   uns nicht gibt.
4. **Waypoint-Schnitt zuletzt.**

### Vorbehalt S1 — Kriterienliste v2 (AP-C3)

`kriterien-pflege.md` §2 verlangt eine **nicht überspringbare Maintainer-Wortlaut-Abnahme**
für GL1–GL5. Die Nachtschicht **baut den Textvorschlag vollständig**, markiert ihn aber im
PR-Body ausdrücklich als abnahmepflichtig — nach dem Muster von Phase G:

> **Merge dieses PR = Wortlaut-Abnahme der Kriterienliste v2 und GL1–GL5.**

Kein Stopp des Laufs, sondern ein benannter Vorbehalt. Wenn der Wortlaut an einer Stelle
raten müsste statt zu portieren: **Lücke benennen, nicht füllen** (Invariante I-7).

---

## 4. Delegation

| Arbeit | Wer |
|---|---|
| I-A vollständig | **Overseer selbst.** Drei Fugen-Dateien = Shotgun-Surgery |
| B1, B2, B4, B5, B6 (die `git mv`) | **Overseer selbst.** Atomar, Windows-kritisch |
| **B3 Fundstellen-Sweep** (~40 Dateien) | **Opus-Agent** mit Plan-Sandwich-Vertrag; Overseer reviewt das Ergebnis persönlich |
| I-C vollständig | **Overseer selbst.** Infrastrukturkritisch |
| §7 Nachzugs-Bündel | **Sonnet-Agent**, gebündelt am Ende (Org-Ruleset Punkt 3) |

Vor jeder Delegation prüfen, ob der Agent für die Art der Arbeit geeignet ist. Parallelisierung
zwischen den Paketen ist **ausgeschlossen** — sie kollidieren in denselben zwei Dateien.

---

## 5. Verifikation je Commit

- `npm test` grün (Ausgangswert 312 Tests, 310 pass / 2 skip)
- `claude plugin validate` je Plugin grün
- `git status` sauber, keine Arbeitsartefakte im Diff
- Kein Eintrag im SSOT-Index zeigt ins Leere

**Vor dem Push zusätzlich:** die Testfälle T1–T19 des Bauplans belegt; `grep` auf die
Altpfade (`.nc/erinnerung`, `^vorlagen/`) liefert nur noch Historisches.

**CI-Wahrheit kommt von GitHub, nicht aus einer Selbstauskunft.** Nach dem Push den echten
Status abfragen. Hängt ein Check, wird er **einmal** geprüft und das Ergebnis berichtet —
nicht in einer Schleife überwacht (R1).

---

## 6. Was ausdrücklich nicht Teil dieser Nacht ist

- **Merge** — Maintainer
- **D16, D17** — hängen an Posten dieser Phase, gehören nach K
- **D28/D29/D30** — Phase J
- **Leitplanken-Korpus der Ebene 0** — eigener Vorgang; Phase I verankert nur den Verweis
- **Safety-Gate-Muster 4** — die DB-Hälfte wäre baubar, die Deploy-Hälfte wartet auf einen
  Maintainer-Entscheid. **Nicht anfassen**, um den Phase-I-PR thematisch sauber zu halten
- **Jira** — eigener Strang

---

## 7. Abschlussbericht (Pflicht, im PR-Body und im Journal)

1. Was gebaut wurde, je Paket
2. Suite-Stand und **echter** CI-Stand von GitHub
3. Welche Delegationen liefen, was der Overseer daran korrigiert hat
4. **Der Breaking-Hinweis** aus Invariante I-8: „In fremden Arbeits-Repos wird nichts mehr
   angelegt" ändert das Kern-Verhalten auf allen Team-Maschinen
5. Der Abnahme-Vorbehalt S1
6. Was liegen blieb und warum — mit der konkreten Frage, die der Maintainer beantworten muss
7. `/nc:end-session` am Ende: Journal, Stand, Register, Roll-up, Memory-Spiegel

---

*Angelegt 2026-08-24 durch Claude (Opus 5) als Overseer auf Weisung Lucas Vöhringer.
Ausführungsplan zum [Phase-I-Bauplan](../grundwissen/2026-08-24-onsite-delta-phase-i-bauplan.md);
Regeln R1–R4 aus dem Loop-Vorfall derselben Nacht.*
