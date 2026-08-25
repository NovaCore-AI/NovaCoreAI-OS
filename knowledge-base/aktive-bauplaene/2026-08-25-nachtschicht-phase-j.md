# Nachtschicht-Plan 2026-08-25/26 — Onsite-Delta Phase J mit zwei Agenten ausführen

> **Status:** lebend. Ausführungsplan für eine unbeaufsichtigte Nachtschicht mit **zwei
> bauenden Agenten und einem Orchestrator**. Er führt aus, was der
> [Phase-J-Bauplan](2026-08-25-onsite-delta-phase-j-bauplan.md) beschreibt (dort:
> Begründung, Invarianten J-1–J-9, Testfälle T1–T21, Nachträge N1/N2); hier steht nur,
> **wer** was baut, **in welcher Reihenfolge**, **wo gestoppt** wird und **was verboten**
> ist. Der Orchestrator liest diese Datei vollständig; die bauenden Agenten bekommen je
> ihr Paket-Kapitel plus die Regeln §2.
>
> **Auftrag:** Lucas Vöhringer, 2026-08-25 („mach einen Plan, den ich dem Agenten geben
> kann, der euch beide orchestriert").
>
> **Rollenzuweisung (Maintainer-Vorgabe):**
> - **AGENT-WEST** (= Kimi K3, der den Frühzug baute): Pakete **J-B (Rest) → J-C**
> - **AGENT-OST** (= die Parallel-Session, die N5/Bauplan/Struktur-Audit baute): Pakete
>   **J-D → J-A → J-E**
> - **ORCHESTRATOR**: fährt diesen Plan, verteilt Pakete, prüft Abnahmen, hält die Fugen.

---

## 0. Vorbedingungen — der Nachtschicht STARTET NUR, wenn alle grün sind

| # | Bedingung | Wie prüfen | Wenn rot |
|---|---|---|---|
| V1 | **PR #30 (Frühzug) ist gemergt** | `gh pr view 30 --json state -q .state` → `MERGED` | **STOPP.** Der Frühzug enthält Muster-4-DB im Safety-Gate und die Jira-Heimat. Ohne ihn baut Phase J auf halbem Grund weiter. Nicht selbst mergen — der Merge braucht Maintainer-Freigabe |
| V2 | **main gezogen, Suite grün auf main** | `git switch main && git pull && npm test` | Konflikt/rot → STOPP mit Befund; nichts reben |
| V3 | **Kern-Version notieren** | `cat VERSION` | Erwartet `0.14.0`. **J-E bumpt auf die NÄCHSTE freie Version (voraussichtlich 0.15.0)** — 0.14.0 ist durch Release-Zug #29 verbraucht (Bauplan-Nachtrag N2). Nicht die im Bauplan §8 stehende 0.14.0 nehmen |
| V4 | **Beide Agenten-Sessions können pushen** (Branch-Schutz umgeht nichts — es gilt PR-Pflicht) | — |Ein Agent ohne Push → der Orchestrator übernimmt dessen Commits |

**Vor dem Start einmalig:** `git switch main && git pull`, dann
`git switch -c feat/onsite-delta-phase-j` und pushen — **ein** Branch, **ein** PR für die
ganze Phase (Bauplan §3). Alle Agenten bauen auf diesen Branch (siehe Fugen-Regel §3).

---

## 1. Was die Nachtschicht liefert

Ein **PR** auf `feat/onsite-delta-phase-j` (Basis: main nach #30-Merge) mit den Paketen
J-D → (J-A ∥ J-B) → J-C → J-E als einzelne Commits, **einem** Kern-Bump auf die nächste
freie Version (§0 V3), `nc-development`-Bump und **einem** Waypoint-CHANGELOG-Schnitt.

**Nicht geliefert wird:** ein Merge, ein Tag, ein GitHub-Release. Alles drei ist
Maintainer-Sache (Runbook §3.6 Schritte 6–7). Der PR-Body benennt die Wortlats-Abnahmen
(W3-WZS-Musterliste erweitert durch Muster 4 — Wortlaut im PR prüfen!).

---

## 2. Die fünf Regeln (gelten für ALLE drei Rollen)

Aus der Phase-I-Nachtschicht übernommen (Lehre aus dem 14-Stunden-Loop) plus die
Zwei-Agenten-Regel:

| # | Regel |
|---|---|
| **R1** | **Kein Selbst-Loop.** Kein `/loop`, kein `CronCreate`, kein Monitor-Heartbeat, keine Wiederholung „bis Bedingung X eintritt". Wartet die Arbeit auf einen Menschen, **endet der Lauf** mit Übergabetext |
| **R2** | **Unbekanntes Kommando wird nie ersetzt.** Skill/Befehl nicht verfügbar → stoppen und im Abschlussbericht melden |
| **R3** | **Blockade ist ein Ergebnis.** Sauber dokumentierter Stopp mit klarer Frage ist vollwertig. Weiterarbeiten an allem Unblockierten |
| **R4** | **Kein Gate wird deaktiviert.** FFG/Start-Gate/Safety-Gate bleiben scharf — auch wenn sie die Nachtschicht verlangsamen |
| **R5** | **NEU: Kein Agent pusht auf den Branch des anderen.** Der Orchestrator ist der einzige, der Commits zwischen Agenten transportiert. Ein Agent arbeitet nur in seinem Worktree auf seinem Segment; Übergabe = Bericht an den Orchestrator, nie direkter Fork des anderen Worktrees |

---

## 3. Die Fugen — warum die Reihenfolge zwingend ist

Dateien, die mehrere Pakete anfassen (Bauplan §3). Der Orchestrator vergibt sie
exklusiv:

| Fuge | Darf anfassen | Grund |
|---|---|---|
| `knowledge-base/SSOT-Document-Index.md` | J-D zuerst, dann J-C, zuletzt J-E | jede neue Zeile kollidiert |
| `standardprozesse/aktualisierungs-index.md` | J-C, dann J-E (gebündelte Matrix-Zeilen) | — |
| `plugins/nc/tests/struktur.test.mjs` | J-D (Anker-Bereinigung), J-C (W4-Invariante) | Suite-Invarianten |
| `plugins/nc/hooks/hooks.json` | nur J-A (Setup-Hinweis) und J-E (Beschreibung) | Registrierung |
| `plugins/nc/module-registry.json` | nur J-B (`agents`), J-E (Bump) | — |
| `README.md` (Wurzel + Plugin) | nur J-E | Hook-Tabelle/Subagenten-Absatz |

**Drei harte Zwänge (Bauplan §3, unverhandelbar):**

1. **J-D vor allem anderen.** Die Anker-Bereinigung fasst `struktur.test.mjs`, den Index
   und drei `wissen-*`-Skills an. Startet J-B/J-A vor J-D, kollidiert jede Index-Zeile.
   → **Orchestrator: J-D zuerst an AGENT-OST geben; AGENT-WEST wartet auf Freigabe.**
2. **Setup-Erweiterung vor Setup-Hinweis** (innerhalb J-A, AP A3 vor A5).
3. **J-C erst nach J-B.** Die W4-Invariante und die Overlap-Prüfung brauchen den fertigen
   `agents/`-Bestand. → AGENT-WEST baut J-B zuerst fertig, dann J-C.

---

## 4. Zeitliche Choreografie (für den Orchestrator)

```
Phase 0   Orchestrator: Vorbedingungen §0 prüfen, Branch feat/onsite-delta-phase-j anlegen
Phase 1   AGENT-OST: J-D (Freiräumen)          AGENT-WEST: WARTET (R5/Zwang 1)
Phase 2   AGENT-OST: J-A (Kontroll-Schicht)  ∥ AGENT-WEST: J-B-Rest (Abteilung)
          — disjunkte Dateimengen, eigene Worktrees, kein Kontakt nötig
Phase 3   AGENT-WEST: J-C (Normen/Prozesse)  ∥ AGENT-OST: ruht / livetestet J-A-Hooks
Phase 4   AGENT-OST: J-E (Nachzüge + Bump + Waypoint) — NUR wenn J-B/J-C gemergt sind
Phase 5   Orchestrator: Endprüfung §7, PR-Body, Push, Abschlussbericht
```

Der Orchestrator holt die Pakete der Agenten per **Fast-Forward/Cherry-Pick in den
Phase-J-Branch** (Konflikte sind laut Bauplan ausgeschlossen, da disjunkt — trifft doch
einer auf, war eine Fuge verletzt: STOPP und im Bericht festhalten).

**Übergabeprotokoll je Paket:** Der Agent meldet „Paket X fertig" mit (a) Commits im
eigenen Worktree-Zweig, (b) Suite-Ergebnis (Zahlen), (c) Abnahme-Checkliste des Bauplans
je AP abgehakt, (d) offene Punkte. Der Orchestrator prüft Stichprobe, holt die Commits,
führt die Suite erneut aus, erst dann gilt das Paket als drin.

---

## 5. Die Pakete im Detail (Aufträge zum Kopieren an die Agenten)

### 5.1 AGENT-OST: J-D — „Freiräumen" (Bauplan §4, AP D1–D5)

Anker-Reservierung beider Dateien per `git rm` löschen (kein Archiv-Umzug — Onsite hat
gelöscht), Prozesskarte 09 ebenfalls, Nummernkreis frei lassen; Begriffsnorm „Anker" als
einen Absatz in `os-bau-methode.md`; `wissen-*`-Skills + Sucheindex + `struktur.test.mjs`
bereinigen (CHANGELOG-Versions-Invariante bleibt); `ci.yml` auf Job `pruefung` (ubuntu,
node 24) plus `vollmatrix` nur bei Dispatch/Tag `nc--v*`; Registerzeilen (Bot schließen,
Reserve-Tags prüfen). **Abnahme:** `git grep -i "anker-reservierung"` → nur Historie;
Suite grün; `ci.yml` syntaktisch geprüft.

### 5.2 AGENT-OST: J-A — „Kontroll-Schicht" (Bauplan §5, AP A1–A6)

Reihenfolge beachten: A3 (Setup schreibt `kernRepoPfad` + Pflichtfelder) **vor** A5.
A1 Safety-Gate-Wertentscheidung (`NAME=wert`: Wert entscheidet dreistufig, nur real
zugewiesene Namen; die vier GLM-Härtungen + WZS-Kopf/Muster-4-DB **zeichengleich
lassen** — Invariante J-1). A2 Queue-Hook auf Handlungsanweisung (Titel „JETZT ausführen",
Anweisung an die Session, Subagenten-Weg, Stempel-Kommando). A4 `lib/infra-registry.js`
(eine Leseimplementierung; Migration der drei Schwester-Leser bewusst NICHT). A5
`nc-setup-hinweis.js` (SessionStart, kein Gate, Zustände fehlt/neuer/defekt/grün,
einmal je Sitzung, fail-open, Opt-out `NC_SETUP_HINWEIS=off`). A6 `os-info`-Zeile.
**Abnahme:** Suite grün mit allen neuen Negativ-/Positivproben (T1–T14), Hook < 50 ms bei
grünem Beleg, `hooks.json`-description nennt Opt-out.

### 5.3 AGENT-WEST: J-B-Rest — „Abteilung development" (Bauplan §6, AP B1–B5)

**B6 ist per Frühzug erledigt** (`workflow-md-implementierung.md` existiert; PR #30) —
nicht nochmal bauen, im Bericht als erledigt referenzieren. B1 `code-reviewer`
(`model: inherit`, read-only, Skills fe/be-review, Findings als Entwurf). B2
`pipeline-praeflight` (`model: sonnet`, `tools: Read, Grep, Glob, Bash` mit
nicht-mutierender Allowlist im Prompt, `<!-- nc:diagnose -->`-Marker, **kein `mcp__*`**,
kein GitLab-MCP — J-E3). B3 `test-luecken-scout`. B4 Overlap-Matrix im Plugin-README. B5
Registry `development.agents` + `plugin.json`-description („plus 3 Subagenten"). Format
nach `referenz/agent-authoring.md`; **Baustein `agenten.test.mjs` 1.4.2 nicht anfassen**
(er ist neuer als Onsites 1.3.0). **Abnahme:** `agenten.test.mjs` grün für alle drei;
`validate plugins/nc-development --strict` grün.

### 5.4 AGENT-WEST: J-C — „Normen und Prozesse" (Bauplan §7, AP C1–C6)

Nur starten, wenn J-B im Branch ist (Zwang 3). C1 Hook-Norm W4 (nur Kern trägt Hooks;
Struktur-Invariante in `struktur.test.mjs`: `plugins/*/hooks/` nur unter `plugins/nc`).
C2 Anlageweg-Weiche §3.0 + §3a-Abgleich + Befristung der Registry-Reservierungen. C3
`contributing-flow.md` (S1–S5 Overseer/Agent, **S6/S7 Maintainer**; Jira-Lücke als
Verweis auf `jira-workflow.md` — der existiert seit Frühzug, kein Platzhalter mehr
nötig). C4 `NovaCore-OS-Strang-Definition.md`. C5 Sichtbarkeitsmodell (Merksatz in
SSOT-Definition, `queue-kern`-Schritt, `queue-flow.md`). C6 Index-/Sucheindex-Zeilen für
alle neuen Dokumente. **Abnahme:** Suite grün, T15/T17/T19/T20 belegt, kein Index-Eintrag
ins Leere.

### 5.5 AGENT-OST: J-E — „Nachzüge + Bump + Waypoint" (Bauplan §8)

Nur wenn J-A, J-B-Rest und J-C im Branch sind. Matrix-Zeilen im Aktualisierungs-Index
(Hook neu, Subagent neu, `agents`-Registry, `ci.yml`, Anker-Absatz-Ort) ·
README-Wurzel/-Plugin (Hook-Tabelle mit zehntem Hook, Subagenten-Absatz) ·
`SECURITY.md` (Setup-Hinweis-Absatz: kein Gate, kein Netz, fail-open) · `AGENTS.md`
(Produktstand, Standardzyklus → `contributing-flow.md`) · `ONBOARDING.md` ·
Mapping-Nachtrag N6 · Register/Stand/Journal · **ein** Kern-Bump auf die nächste freie
Version (§0 V3, voraussichtlich 0.15.0) + `nc-development`-Bump (Minor: drei Agenten)
+ **ein** Waypoint-CHANGELOG-Schnitt. **Kein Tag, kein Release** (Maintainer).

---

## 6. Was KEINER der Agenten anfasst

- **Merge von PR #30** (falls doch offen — Vorbedingung V1) und der eigene Phase-J-PR
- Tags, GitHub-Releases, Branch-Löschungen
- Die Phase-G/H-Härtungen (J-1: zeichengleich, außer A1/A2 nennen sie explizit)
- `agenten.test.mjs` (Baustein 1.4.2 ist neuer als das Vorbild)
- Migration der drei Registry-Leser auf `lib/infra-registry.js` (eigener Strang)
- WZS-**Deploy**-Muster im Safety-Gate (wartet auf Maintainer-Weiche
  Actions+SSH vs. Coolify — Registerzeile offen; die DB-Hälfte ist seit Frühzug gebaut)
- D16/D17 (Phase K), Jira Block B/C, Betriebshandbuch (zurückgestellt), Achse-2-Task,
  Skill-Größendeckel (alles eigene Vorgänge mit Registerzeilen)
- Version-Bumps außerhalb von J-E — **im Strang wird nie gebumpt** (§0
  Zwei-Klassen-Buchführung)

---

## 7. Endprüfung des Orchestrators (vor dem Push)

- [ ] Suite grün, Zahlen notiert (Start: 323/321/2S nach #30-Merge)
- [ ] `claude plugin validate .` / `plugins/nc --strict` / `plugins/nc-development --strict` grün
- [ ] `git grep -i "anker-reservierung"` → nur Historie
- [ ] Kein Index-Eintrag zeigt ins Leere; `grep` auf Altpfade sauber
- [ ] J-A und J-B per Fast-Forward geholt, kein Merge-Commit im Phase-Branch
- [ ] **Genau ein** Bump je Plugin, **ein** Waypoint-Schnitt, `[Unreleased]` leer
- [ ] PR-Body nennt: Queue-Hook-Verhaltensänderung (weist an statt zu erinnern), den
      zehnten SessionStart-Hook (beides teamweit sichtbar), die
      Muster-4-Wortlaut-Abnahme aus dem Frühzug (erledigt mit #30-Merge, nur Referenz),
      die Version (nächste freie nach 0.14.0) und die offenen Maintainer-Entscheide
      J-E1–J-E10 (Merge = Bestätigung)
- [ ] Journale/Stand/Register der Session geschrieben (append-only)

---

## 8. Stopp-Bedingungen (sofortiger Lauf-Ende, Bericht statt Weiterarbeit)

1. PR #30 ist nicht gemergt und der Maintainer nicht erreichbar → **Ende nach V1**
2. Suite nach zwei Korrekturversuchen je Paket weiter rot → Paket zurückstellen (R3)
3. Fugen-Konflikt trotz disjunkter Pakete (ein Agent hat doch eine Fuge berührt) →
   **R5-Bruch**: beide Pakete des Konfliktpaares zurückstellen, im Bericht festhalten
4. `claude plugin validate` rot trotz grüner Suite → Ende, Befund (Formatbruch hat
   Vorrang vor Fortschritt)

---

*Angelegt 2026-08-25 (spät) durch Kimi K3 auf Weisung Lucas Vöhringer. Quellen:
[Phase-J-Bauplan](2026-08-25-onsite-delta-phase-j-bauplan.md) mit Nachträgen N1/N2,
[Nachtschicht-Plan Phase I](2026-08-24-nachtschicht-phase-i.md) (Regeln R1–R4), PR
#25/#27/#28/#29/#30-Verläufe. Der Orchestrator ersetzt keine Maintainer-Entscheide:
Merge, Tag und Release bleiben menschlich.*
