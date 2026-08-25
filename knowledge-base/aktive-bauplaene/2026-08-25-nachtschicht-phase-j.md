# Nachtschicht-Plan 2026-08-25/26 — Onsite-Delta Phase J (Ein-Agenten-Betrieb)

> **Status:** lebend. Ausführungsplan für eine unbeaufsichtigte Nachtschicht **einer
> einzigen Session**, die alle Pakete sequenziell baut. Er führt aus, was der
> [Phase-J-Bauplan](2026-08-25-onsite-delta-phase-j-bauplan.md) beschreibt (dort:
> Begründung, Invarianten J-1–J-9, Testfälle T1–T21, Nachträge N1/N2); hier steht nur,
> **in welcher Reihenfolge** gebaut wird, **wo gestoppt** wird und **was verboten** ist.
>
> **Auftrag:** Lucas Vöhringer, 2026-08-25 („mach einen Plan, den ich dem Agenten geben
> kann"). Ursprungsfassung desselben Abends: Zwei-Agenten-Orchestrierung mit
> AGENT-WEST (J-B-Rest→J-C) und AGENT-OST (J-D→J-A→J-E). **Umgestellt auf
> Ein-Agenten-Betrieb** durch Maintainer-Entscheid (später Abend: „ich denke du wirst
> alles machen müssen … wir lassen es eine neue Session machen") — die zweite Session
> ist nicht verlässlich verfügbar. **Anhang A** enthält den Übergabeprompt für den
> Kaltstart der neuen Session.

---

## 0. Vorbedingungen — die Nachtschicht STARTET NUR, wenn alle grün sind

| # | Bedingung | Wie prüfen | Wenn rot |
|---|---|---|---|
| V1 | **PR #30 (Frühzug) ist gemergt** | `gh pr view 30 --json state -q .state` → `MERGED` | **STOPP.** Der Frühzug enthält Muster-4-DB im Safety-Gate, die Jira-Heimat und DIESEN Plan. Nicht selbst mergen — der Merge braucht Maintainer-Freigabe |
| V2 | **main gezogen, Suite grün auf main** | `git switch main && git pull && npm test` | Konflikt/rot → STOPP mit Befund; nichts reben |
| V3 | **Kern-Version notieren** | `cat VERSION` | Erwartet `0.14.0`. **J-E bumpt auf die NÄCHSTE freie Version (voraussichtlich 0.15.0)** — 0.14.0 ist durch Release-Zug #29 verbraucht (Bauplan-Nachtrag N2). Nicht die im Bauplan §8 stehende 0.14.0 nehmen |
| V4 | **Branch `feat/onsite-delta-phase-j` existiert noch nicht mit fremden Commits** | `git fetch && git log origin/feat/onsite-delta-phase-j --oneline -5` | Existiert er mit Commits, die diese Session nicht geschrieben hat: R5 — nicht reben, nicht force-pushen, Befund melden |

**Vor dem Start einmalig:** `git switch main && git pull`, dann
`git switch -c feat/onsite-delta-phase-j` und pushen — **ein** Branch, **ein** PR für die
ganze Phase (Bauplan §3).

---

## 1. Was die Nachtschicht liefert

Ein **PR** auf `feat/onsite-delta-phase-j` (Basis: main nach #30-Merge) mit den Paketen
J-D → J-A → J-B-Rest → J-C → J-E als einzelne Commits, **einem** Kern-Bump auf die nächste
freie Version (§0 V3), `nc-development`-Bump und **einem** Waypoint-CHANGELOG-Schnitt.

**Nicht geliefert wird:** ein Merge, ein Tag, ein GitHub-Release. Alles drei ist
Maintainer-Sache (Runbook §3.6 Schritte 6–7). Der PR-Body benennt die teamweit
sichtbaren Änderungen und die Maintainer-Entscheide J-E1–J-E10 (Merge = Bestätigung).

---

## 2. Die fünf Regeln

Aus der Phase-I-Nachtschicht übernommen (Lehre aus dem 14-Stunden-Loop) plus die
Fremdarbeit-Regel:

| # | Regel |
|---|---|
| **R1** | **Kein Selbst-Loop.** Kein `/loop`, kein `CronCreate`, kein Monitor-Heartbeat, keine Wiederholung „bis Bedingung X eintritt". Wartet die Arbeit auf einen Menschen, **endet der Lauf** mit Übergabetext |
| **R2** | **Unbekanntes Kommando wird nie ersetzt.** Skill/Befehl nicht verfügbar → stoppen und im Abschlussbericht melden |
| **R3** | **Blockade ist ein Ergebnis.** Sauber dokumentierter Stopp mit klarer Frage ist vollwertig. Weiterarbeiten an allem Unblockierten |
| **R4** | **Kein Gate wird deaktiviert.** FFG/Start-Gate/Safety-Gate bleiben scharf — auch wenn sie die Nachtschicht verlangsamen |
| **R5** | **Fremde Arbeit wird nie überschrieben.** Tauchen Commits/Pushes auf, die diese Session nicht selbst geschrieben hat (die alte Parallel-Session ist evtl. noch aktiv): Commits **lesen, stehen lassen, nicht reben/force-pushen** — laufendes Paket sauber committen, dann Lauf-Ende mit Befund (R3 gilt nicht für R5-Brüche: hier ist Stopp, nicht Weiterarbeiten) |

---

## 3. Die Fugen — warum die Reihenfolge zwingend ist

Dateien, die mehrere Pakete anfassen (Bauplan §3). Die Reihenfolge unten vergibt sie
exklusiv — nie zwei Pakete an derselben Fuge, auch nicht „nebenbei":

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
   und drei `wissen-*`-Skills an. → **Deshalb J-D als erstes Paket — nichts anderes
   starten, bevor J-D committed ist.**
2. **Setup-Erweiterung vor Setup-Hinweis** (innerhalb J-A, AP A3 vor A5).
3. **J-C erst nach J-B.** Die W4-Invariante und die Overlap-Prüfung brauchen den fertigen
   `agents/`-Bestand. → J-B-Rest vor J-C bauen.

---

## 4. Ablauf — eine Session, sequenziell

```
Phase 0   Vorbedingungen §0 prüfen (V1: PR #30 MERGED), Worktree/Branch anlegen, Suite grün
Phase 1   J-D  Freiräumen                 → Suite grün → Commit   ⟵ gibt die Fugen frei
Phase 2   J-A  Kontroll-Schicht           → Suite grün → Commit   (A3 vor A5!)
Phase 3   J-B  Abteilung (Rest)           → Suite grün → Commit   (B6 längst erledigt)
Phase 4   J-C  Normen und Prozesse        → Suite grün → Commit   (erst nach J-B, Zwang 3)
Phase 5   J-E  Nachzüge + Bump + Waypoint → Suite + validate grün → Push + PR
```

**Selbst-Disziplin je Paket:** Nach jedem Paket (a) Suite laufen lassen und Zahlen
notieren, (b) die Abnahme-Kriterien des Bauplans je AP abhaken, (c) committen — erst dann
das nächste Paket beginnen. Ist ein Paket nach zwei Korrekturversuchen weiter rot:
zurückstellen (R3), mit dem nächsten weitermachen, im Abschlussbericht festhalten.
**Kein Paket überspringen außer über R3.** Delegation an Subagenten ist erlaubt
(Plan-Sandwich-Vertrag); Arbeit an den Fugen-Dateien bleibt in der Haupt-Session.

---

## 5. Die Pakete im Detail (Arbeitsaufträge je Paket)

### 5.1 J-D — „Freiräumen" (Bauplan §4, AP D1–D5)

Anker-Reservierung beider Dateien per `git rm` löschen (kein Archiv-Umzug — Onsite hat
gelöscht), Prozesskarte 09 ebenfalls, Nummernkreis frei lassen; Begriffsnorm „Anker" als
einen Absatz in `os-bau-methode.md`; `wissen-*`-Skills + Sucheindex + `struktur.test.mjs`
bereinigen (CHANGELOG-Versions-Invariante bleibt); `ci.yml` auf Job `pruefung` (ubuntu,
node 24) plus `vollmatrix` nur bei Dispatch/Tag `nc--v*`; Registerzeilen (Bot schließen,
Reserve-Tags prüfen). **Abnahme:** `git grep -i "anker-reservierung"` → nur Historie;
Suite grün; `ci.yml` syntaktisch geprüft.

### 5.2 J-A — „Kontroll-Schicht" (Bauplan §5, AP A1–A6)

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

### 5.3 J-B-Rest — „Abteilung development" (Bauplan §6, AP B1–B5)

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

### 5.4 J-C — „Normen und Prozesse" (Bauplan §7, AP C1–C6)

Nur starten, wenn J-B im Branch ist (Zwang 3). C1 Hook-Norm W4 (nur Kern trägt Hooks;
Struktur-Invariante in `struktur.test.mjs`: `plugins/*/hooks/` nur unter `plugins/nc`).
C2 Anlageweg-Weiche §3.0 + §3a-Abgleich + Befristung der Registry-Reservierungen. C3
`contributing-flow.md` (S1–S5 Overseer/Agent, **S6/S7 Maintainer**; Jira-Lücke als
Verweis auf `jira-workflow.md` — der existiert seit Frühzug, kein Platzhalter mehr
nötig). C4 `NovaCore-OS-Strang-Definition.md`. C5 Sichtbarkeitsmodell (Merksatz in
SSOT-Definition, `queue-kern`-Schritt, `queue-flow.md`). C6 Index-/Sucheindex-Zeilen für
alle neuen Dokumente. **Abnahme:** Suite grün, T15/T17/T19/T20 belegt, kein Index-Eintrag
ins Leere.

### 5.5 J-E — „Nachzüge + Bump + Waypoint" (Bauplan §8)

Nur wenn J-A, J-B-Rest und J-C committed sind. Matrix-Zeilen im Aktualisierungs-Index
(Hook neu, Subagent neu, `agents`-Registry, `ci.yml`, Anker-Absatz-Ort) ·
README-Wurzel/-Plugin (Hook-Tabelle mit zehntem Hook, Subagenten-Absatz) ·
`SECURITY.md` (Setup-Hinweis-Absatz: kein Gate, kein Netz, fail-open) · `AGENTS.md`
(Produktstand, Standardzyklus → `contributing-flow.md`) · `ONBOARDING.md` ·
Mapping-Nachtrag N6 · Register/Stand/Journal · **ein** Kern-Bump auf die nächste freie
Version (§0 V3, voraussichtlich 0.15.0) + `nc-development`-Bump (Minor: drei Agenten)
+ **ein** Waypoint-CHANGELOG-Schnitt. **Kein Tag, kein Release** (Maintainer).

---

## 6. Was die Session NICHT anfasst

- **Merge von PR #30** (falls doch offen — Vorbedingung V1) und der eigene Phase-J-PR
- Tags, GitHub-Releases, Branch-Löschungen
- Die Phase-G/H-Härtungen (J-1: zeichengleich, außer A1/A2 nennen sie explizit)
- `agenten.test.mjs` (Baustein 1.4.2 ist neuer als das Vorbild)
- Migration der drei Registry-Leser auf `lib/infra-registry.js` (eigener Strang)
- WZS-**Deploy**-Muster im Safety-Gate (wartet auf Maintainer-Weiche Actions+SSH vs.
  Coolify — Registerzeile offen; die DB-Hälfte ist seit Frühzug gebaut, nur erhalten)
- D16/D17 (Phase K), Jira Block B/C, Betriebshandbuch (zurückgestellt), Achse-2-Task,
  Skill-Größendeckel (alles eigene Vorgänge mit Registerzeilen)
- Version-Bumps außerhalb von J-E — **im Strang wird nie gebumpt** (§0
  Zwei-Klassen-Buchführung)

---

## 7. Endprüfung vor dem Push

- [ ] Suite grün, Zahlen notiert (Start: 323/321/2S nach #30-Merge)
- [ ] `claude plugin validate .` / `plugins/nc --strict` / `plugins/nc-development --strict` grün
- [ ] `git grep -i "anker-reservierung"` → nur Historie
- [ ] Kein Index-Eintrag zeigt ins Leere; `grep` auf Altpfade sauber
- [ ] Zwangsreihenfolge J-D → J-A → J-B-Rest → J-C → J-E eingehalten; jedes Paket
      ein eigener Commit
- [ ] **Genau ein** Bump je Plugin, **ein** Waypoint-Schnitt, `[Unreleased]` leer
- [ ] PR-Body nennt: Queue-Hook-Verhaltensänderung (weist an statt zu erinnern), den
      zehnten SessionStart-Hook (beides teamweit sichtbar), die Version (nächste freie
      nach 0.14.0) und die offenen Maintainer-Entscheide J-E1–J-E10 (Merge = Bestätigung)
- [ ] Journale/Stand/Register der Session geschrieben (append-only)

---

## 8. Stopp-Bedingungen (sofortiger Lauf-Ende, Bericht statt Weiterarbeit)

1. PR #30 ist nicht gemergt und der Maintainer nicht erreichbar → **Ende nach V1**
2. Suite nach zwei Korrekturversuchen je Paket weiter rot → Paket zurückstellen (R3)
3. Fremde Commits tauchen auf dem Branch auf → R5: sauber committen, dann Ende mit Befund
4. `claude plugin validate` rot trotz grüner Suite → Ende, Befund (Formatbruch hat
   Vorrang vor Fortschritt)

---

## Anhang A — Übergabeprompt für den Kaltstart (ab der Trennlinie kopieren)

> Dieser Prompt funktioniert erst **nach dem Merge von PR #30** (der Plan liegt darin).
> Vorher startet die neue Session nach Schritt 1 mit einem sauberen Stopp.

---

Arbeite im Repo `C:/Users/luceb/Desktop/NovaCoreAI-OS`. Führe die Nachtschicht
„Onsite-Delta Phase J" aus.

1. Pflicht-Einstieg: `git log --oneline -10`, `git status`, CHANGELOG-Kopf und `VERSION`;
   lies dann `knowledge-base/aktive-bauplaene/2026-08-25-nachtschicht-phase-j.md`
   **vollständig** — er ist dein Auftrag. Existiert die Datei auf main nicht, liegt der
   Plan auf PR #30 (Branch `feat/phase-j-fruehzug`): STOPP, „PR #30 zuerst mergen"
   melden.
2. Prüfe die Vorbedingungen §0 (insbesondere V1: PR #30 = MERGED). Rot → Lauf-Ende
   mit Bericht.
3. Du bist Overseer deiner Session; Delegation an Subagenten erlaubt (Plan-Sandwich),
   Fugen-Dateien bearbeitest du selbst. Baue ALLE Pakete sequenziell nach §4:
   J-D → J-A → J-B-Rest → J-C → J-E. Fachquelle ist der verlinkte Phase-J-Bauplan;
   der Nachtschicht-Plan gibt Reihenfolge, Regeln (R1–R5) und Stopps.
4. Ein Branch `feat/onsite-delta-phase-j` ab main, ein PR, jedes Paket ein Commit.
   Kein Merge, kein Tag, kein Release, kein Bump außer in J-E — dort die nächste freie
   Version nach 0.14.0 (Bauplan-Nachtrag N2).
5. Regeln R1–R5 und die Stopp-Bedingungen §8 gelten ausnahmslos. Fremde Commits auf
   dem Branch: nie überschreiben (R5) — sauber committen, Lauf beenden, Befund melden.
6. Ende: Abschlussbericht mit Suite-Zahlen je Paket, abgehakten Abnahmen, offenen
   Punkten und den Fragen an den Maintainer.

---

*Angelegt 2026-08-25 (spät) durch Kimi K3; Ursprungsfassung als Zwei-Agenten-Orchestrierung
commissioniert („mach einen Plan, den ich dem Agenten geben kann, der euch beide
orchestriert"), am gleichen Abend auf Ein-Agenten-Betrieb umgestellt („wir lassen es eine
neue Session machen"). Quellen: [Phase-J-Bauplan](2026-08-25-onsite-delta-phase-j-bauplan.md)
mit Nachträgen N1/N2, [Nachtschicht-Plan Phase I](2026-08-24-nachtschicht-phase-i.md)
(Regeln R1–R4), PR #25/#27/#28/#29/#30-Verläufe. Der Lauf ersetzt keine
Maintainer-Entscheide: Merge, Tag und Release bleiben menschlich.*
