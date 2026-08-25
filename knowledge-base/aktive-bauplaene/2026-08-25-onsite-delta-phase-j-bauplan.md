# Bauplan 2026-08-25 — Onsite-Delta Phase J (Abteilung, Verteilung, Kontroll-Nachzüge aus 0.27.0)

> **Status:** Entwurf zur Maintainer-Freigabe. Auftrag Lucas Vöhringer, 2026-08-25 („N5 könnte
> ein Agent machen … du machst dann den updateten J-Teil"). Overseer-Planung nach Org-Ruleset
> Punkt 1; anders als Phase I ist Phase J **parallelisierbar** (Mapping Abschnitt 4: „D19/D22
> sind echt unabhängig") — die Pakete J-A und J-B berühren disjunkte Dateien und laufen in
> eigenen Worktrees.
>
> **Erhoben gegen:** Onsite.ai-OS `origin/main@a9927b2`, Kern **0.27.0** (Release `03b4bd1`,
> 2026-08-25) — **nicht** gegen den Phase-I-Anker `2530ced`. Dev-Satellit
> `onsite-ai-devs/Onsite.ai-OS-Development` **v0.13.3** (drei Subagenten). NovaCore-Basis:
> PR #25 (`feat/onsite-delta-phase-i`, Kern **0.13.0**, Suite 315/313 pass/2 skip) — dieser
> Plan setzt den **Merge von #25 voraus** und wird nach dem Release 0.13.0 gebaut.
>
> **Vorgänger:** [Onsite-Delta-Mapping 2026-08-23](2026-08-23-onsite-delta-mapping.md), Nachträge
> N1–N5 (N5 = 0.27.0-Delta, D31 ff.) und der
> [Phase-I-Bauplan](2026-08-24-onsite-delta-phase-i-bauplan.md) (§8 „Bewusst nicht in Phase I").
> Dieser Plan schneidet die Mapping-Phase J aus **und** zieht die fünf Nachzüge aus Onsite
> 0.27.0 hinein, die sonst bis Phase K lägen — vier davon sind Kontroll-Schicht.

---

## 1. Ausgangslage — was sich seit Phase I geändert hat

Onsite hat **am selben Tag**, an dem Phase I fertig wurde, 0.27.0 geschnitten: 37 Commits,
53 Dateien, +2.036/−399 (`2530ced..a9927b2`). Der Phase-I-PR konnte das nicht kennen. Aus
dem Delta folgen fünf Posten (Nummern nach Mapping-Nachtrag N5; bei Abweichung gilt N5):

| Posten | Inhalt (Onsite-Fundstelle) | Befund bei uns | Klasse |
|---|---|---|---|
| **D31** | **Anker-Reservierung ersatzlos aufgehoben** (#138, `7d172c1`): beide Dateien gelöscht, `skill-builder`/`wissen-aendern`/`wissen-planen`/`rubrik.md`/Sucheindex bereinigt; Ersatz ist Mechanik (Merge-Konflikt bei Dateikollision, Suite-Invariante gegen doppelte Spec-Nummern) | **Widerspruch zu PR #25 AP-A5:** wir haben mit P-E2 das Mittel entfernt, die Begriffsnorm aber behalten (Banner in `standardprozesse/anker-reservierung.md` und `grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md`). Nennungen in `wissen-aendern`, `wissen-planen`, `wissen-nachschlagen`, `wissen-sucheindex.json`, `struktur.test.mjs` | P + E |
| **D32** | **Setup-Hinweis-Hook** `oai-setup-hinweis.js` (OS-36, #137): SessionStart, kein Gate, prüft den init-Beleg (Registry-Pflichtfelder, Pfad-Liveness inkl. Worktree-`.git`-Datei und Windows-8.3-Kurzpfad), Anweisung höchstens einmal je Sitzung, bei grünem Beleg stumm, fail-open, Subagenten ausgenommen, Opt-out `OAI_SETUP_HINWEIS=off`; gemeinsame Lese-Lib `hooks/lib/infra-registry.js`; 21 Tests | Fehlt. Neun registrierte Hooks (`hooks.json`), keiner prüft `infra.json`; drei lesen sie ohne gemeinsame Lib (`nc-queue-faelligkeit`, `nc-wissens-hinweis`, `nc-pfad-hinweis`); **`/nc:setup` schreibt `kernRepoPfad` nicht** (Register 2026-08-24) — ohne diese Vorbedingung hätte der Hook nichts Belastbares zu prüfen | N |
| **D33** | **Safety-Gate Fehlalarm-Härtung** (#131): bei `NAME=wert` entscheidet der **Wert** in drei Stufen — deploy-Wort im Wert fragt (`MODE=deploy-prod`), deploy-Wort im Namen mit Prod-Präfix `prod*`/`prd*`/`live*` oder statisch unauflösbarem Wert (`$VAR`, Substitution) fragt, jeder andere Wert bleibt still (`DEPLOYMENT_TYPE=dev`); bewertet werden nur Namen, die im quote-bereinigten Strom **real zugewiesen** sind (`git commit -m "DEPLOYMENT_TYPE=prod"` feuert nicht) | Unser `nc-safety-gate.js` Muster 2 kennt die Verbposition, aber keine Wertentscheidung — die Fehlalarm-Klasse (Alltags-Containerstart mit deploy-benannter Achse) existiert bei uns | N |
| **D34** | **Contributing-Flow S1–S7** (`contributing-flow.md`, #132, Jira OS-14) + Begriffsnorm **Strang-Definition** (`Onsite.ai-OS-Strang-Definition.md`): Strang = Worktree + Branch `<typ>/<thema>` + PR-Memo + Aufräumen; S6 Review/Merge und S7 Release-Zug beim Systemarchitekten; Challenger-Review eingearbeitet | Fehlt vollständig. Unser Pendant ist verteilt auf `AGENTS.md` (Standardzyklus), `aktualisierungs-index.md` §0/§3.6 und `os-bau-methode.md` — ohne Begriffsnorm „Strang" und ohne Stationen | N + E |
| **D35** | **SSOT-Sichtbarkeitsmodell** (#134, `b18016d`): Abteilungs-SSOTs bleiben privat; in den Kern steigt ein **konzentriertes Fakten-Dokument** (Datum, Herkunft, auflösbare Fundstelle), nie Kopie oder Umzug — „Kern verdichtet und verweist, Abteilung dokumentiert vollständig"; `queue-kern` Schritt 9, `queue-flow.md` §5/§6.2, Merksatz in der SSOT-Definition | Unser `queue-kern` Schritt „Kern-Beitrag entwerfen" kennt die Verdichtungsregel nicht; `queue-flow.md` regelt nur den Weg, nicht die Form des Kern-Beitrags | P + E |

Nicht in Phase J, obwohl aus 0.27.0: `oai-development` v0.13.3 (ISENTO-Jira-Konvention, **X**)
und die Backlog-Idee „Referenz-Testbaustein für Satelliten-Suiten" (**B**).

### 1.1 Zwei Produktfehler, die mit dieser Phase geheilt werden

1. **Das Safety-Gate gatet den Alltagsweg.** Ein Arbeits-Repo, dessen Compose-Achse
   `DEPLOYMENT_TYPE` heißt, erzeugt bei uns mit `make up DEPLOYMENT_TYPE=dev` einen
   Freigabedialog — belegter Onsite-Fehlalarm 2026-08-24 in genau der Klasse, die §15.21
   als Abnahmekriterium verbietet („ein Gate, das zu oft fragt, wird weggeklickt"). D33.
2. **Der Queue-Hook erinnert, wo er anweisen müsste.** Unser `nc-queue-faelligkeit.js` trägt
   noch die Onsite-Fassung `5c2c210` („Erinnerung, keine Blockade"). Onsite hat am 2026-08-24
   entschieden, dass die Session den fälligen Lauf **vorbereitet** (Skill ausführen oder
   Subagenten beauftragen), weil nicht-technische Nutzer keine PRs stellen können. D28.

---

## 2. Maintainer-Entscheide dieser Phase (Vorschlag, Default Onsite-Parität nach N1.2)

| # | Frage | Vorschlag |
|---|---|---|
| **J-E1** | Anker-Reservierung (D31) | **Onsite folgen:** `standardprozesse/anker-reservierung.md` und `grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md` **löschen**, Nennungen in den drei `wissen-*`-Skills, im Sucheindex und in `struktur.test.mjs` bereinigen; die Begriffsnorm „Anker" wandert als **ein Absatz** in `os-bau-methode.md` (Mechanik statt Norm: Merge-Konflikt, Suite-Invariante gegen doppelte CHANGELOG-Versionsüberschriften, Pflichtschritt „fremde Worktrees prüfen"). Der PR-#25-Banner P-E2 war der Zwischenschritt, nicht das Ziel |
| **J-E2** | CI-Kostenschnitt (D22) | **Übernehmen:** Regelfall **ein** Job `pruefung` (ubuntu / node 24: Suite + Validierung beider Ebenen als Schritte), kein `push: branches: [main]` mehr, Vollmatrix (ubuntu+windows × 20/22/24) nur bei `workflow_dispatch` und beim Release-Tag — bei uns `nc--v*`, nicht `v*`. `release.yml` bleibt unberührt. **@claude-Bot:** wir führen keine `claude.yml` — die Registerzeile „Bot ohne Reaktion" wird mit dem Vermerk geschlossen, dass keine Bot-Instanz beabsichtigt ist (sonst Entscheid) |
| **J-E3** | `pipeline-praeflight` (D19) | **GitHub-Actions-Zuschnitt:** Grün-Prognose aus lokal nachgestellten Schritten der `ci.yml` (Suite + `claude plugin validate`), Sekundärmodus „warum ist der Lauf rot" **read-only über `gh run list` / `gh run view --log-failed`** — **kein GitLab-MCP**, keine `mcp__*`-Werkzeuge, `tools: Read, Grep, Glob, Bash` mit Allowlist nicht-mutierender Kommandos im Prompt |
| **J-E4** | Contributing-Flow (D34) | **Übernehmen, NovaCore-Zuschnitt (Rollen nach Org-Ruleset):** S1–S5 trägt der bauende Agent unter **Overseer**-Planung und -Review (Plan-Sandwich; der Overseer ist Adressat des Berichtskommentars, nicht der Maintainer), S6 (Review + Merge) und S7 (Release-Zug) beim **Maintainer Lucas Vöhringer** — bewusst kein Agent; Branch-Schema `<typ>/<thema>` übernehmen (Bestands-Branches bleiben); Jira-Spalten als **Platzhalter-Verweis auf D29** (`jira-workflow.md`), solange das Jira-Vorhaben zurückgestellt ist; Worktree-Pflicht mit unserem bereits ignorierten `.worktrees/` |
| **J-E5** | Queue-Handlungsanweisung (D28) | **Übernehmen:** Titel „Queue-Flow fällig: JETZT ausführen (keine Blockade)", Anweisung an die Session (Skill selbst oder Subagent, erster Schritt nach aktueller Arbeit), Begründung, rote Linie (bis zum fertigen PR, Merge bleibt Mensch), Stempel-Kommando — als Suite-Invariante auf Titel, Adressatin, Subagenten-Weg |
| **J-E6** | Setup-Hinweis (D32) | **Übernehmen mit Vorbedingung:** `/nc:setup` schreibt `kernRepoPfad` (Arbeitsklon, nie `kernSsotPfad`) und die Pflichtfelder `schemaVersion`/`abteilungen`/`szenario`; erst dann hat der Hook einen prüfbaren Beleg. Zustände wie Onsite: fehlt / neuer (höhere `schemaVersion` → „Marketplace-Update, nicht setup") / defekt (toter Pfad, Pflichtfeld fehlt) / grün. **Affiliate-Invariante:** Affiliate-Plugins stehen nie in `abteilungen` und werden nie geprüft |
| **J-E7** | Sichtbarkeitsmodell (D35) | **Übernehmen als Vorratsnorm:** Merksatz in `NovaCore-OS-SSOT-Definition.md` (Nachtrag), `queue-kern` Schritt „Kern-Beitrag entwerfen" auf Fakten-Dokument mit auflösbarer Fundstelle, `queue-flow.md` Station Kern-Aufstieg. **Ehrlich benannt (N5.5):** Bei uns gilt der Übergangszustand E1 — die Abteilungs-Queue lebt noch im OS-Repo, es gibt heute keine Grenze, über die angefragt werden müsste. Die Norm wird trotzdem jetzt gesetzt, damit der Satelliten-Split (`nc-development`-Extraktion, Ideen-Backlog 2026-08-10) sie vorfindet statt sie nachzuholen; der Anfrageweg selbst wird **nicht** gebaut |
| **J-E8** | Hook-Norm W4 (D20) | **Übernehmen** inkl. **Struktur-Invariante** in `struktur.test.mjs`: im OS-Repo trägt nur `plugins/nc` ein `hooks/`; ein `plugins/nc-development/hooks/` schlägt die Suite rot. Der Text in `abteilungs-plugin-bau.md` §1 und `kern-plugin-bau.md` löst unser verbliebenes Sequenzierungs-Gate-Vokabular ab |
| **J-E9** | Anlageweg-Weiche (D21) | **Übernehmen** als §3.0 in `abteilungs-plugin-bau.md` (Direktanlage als Satellit ist Regelfall; Reservierungsanlage nur inhaltsleer und befristet; Weichenwechsel ⇒ §3a **vor** dem ersten Inhalt). Folge für die Registry-Reservierungen `ui-ux`/`automation`: sie bleiben, weil inhaltsleer — mit Befristungs-Vermerk |
| **J-E10** | `jira-workflow.md` (D29) | **Vertagen nach K**, solange Jira Block B/C zurückgestellt ist (Weisung 2026-08-24). Contributing-Flow verweist auf die Lücke, statt sie zu füllen (J-9) |

---

## 3. Der Schnitt — fünf Pakete, zwei davon parallel

**Fugen** (Dateien, die mehrere Pakete anfassen — Zwangsreihenfolge, keine Parallelität):

```
knowledge-base/SSOT-Document-Index.md                    ← J-C, J-D
knowledge-base/standardprozesse/aktualisierungs-index.md ← J-C, J-D, J-E
plugins/nc/tests/struktur.test.mjs                       ← J-C (W4-Invariante), J-D (Anker-Bereinigung)
plugins/nc/hooks/hooks.json                              ← J-A (description + Registrierung)
plugins/nc/module-registry.json                          ← J-B (agents), J-E (Bump)
README.md / plugins/nc/README.md                         ← J-E (Hook-Tabelle)
```

**Reihenfolge:**

```
J-D  Anker-Aufhebung + CI-Schnitt          (Overseer, klein, zuerst — räumt die Fugen frei)
 ├─ J-A  Kontroll-Schicht                  (Overseer, infrastrukturkritisch)     ┐ parallel,
 └─ J-B  Abteilung development             (Opus, Plan-Sandwich)                 ┘ eigene Worktrees
J-C  Normen und Prozesse                   (Opus, Plan-Sandwich; Overseer reviewt)
J-E  Nachzugs-Bündel + Bump + Waypoint     (Sonnet-Executor)
```

**Ein Branch, ein PR** (`feat/onsite-delta-phase-j`), Pakete als einzelne Commits in dieser
Reihenfolge — Lehre aus Phase G/H (Stacked-PRs kosten mehr, als sie trennen). J-A und J-B
arbeiten in eigenen Worktrees auf Zweigen des Phase-J-Branches und werden vom Overseer per
Fast-Forward-Merge in den Phase-J-Branch geholt; Konflikte sind ausgeschlossen, weil ihre
Dateimengen disjunkt sind (§5/§6 „Berührt").

**Drei harte Reihenfolge-Zwänge:**

1. **J-D vor allem anderen.** Die Anker-Bereinigung fasst `struktur.test.mjs`, den Index und
   drei Skills an — laufen J-A/J-B gleichzeitig, kollidiert jede Index-Zeile.
2. **Setup-Erweiterung vor Setup-Hinweis** (innerhalb J-A): ein Hook, der einen Beleg prüft,
   den kein Schreiber erzeugt, meldet auf jeder Maschine „defekt".
3. **J-C nach J-B**: die Overlap-Prüfung der Subagenten gegen die Router (Mapping Abschnitt 4)
   und die W4-Invariante brauchen den fertigen `agents/`-Bestand.

---

## 4. Paket J-D — „Freiräumen" (Overseer, klein)

**Berührt:** `knowledge-base/standardprozesse/anker-reservierung.md` (löschen) ·
`knowledge-base/grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md` (löschen) ·
`knowledge-base/standardprozesse/os-bau-methode.md` · `plugins/nc/skills/{wissen-aendern,
wissen-planen, wissen-nachschlagen}/SKILL.md` · `plugins/nc/hooks/wissen-sucheindex.json` ·
`plugins/nc/tests/struktur.test.mjs` · `knowledge-base/SSOT-Document-Index.md` ·
`knowledge-base/firmenkernprozesse/prozesskarten/{09-anker-reservierung.md,
00-FAMILIE-UND-VERDRAHTUNG.md, 01-aktualisierungs-index.md, README.md}` · die lebenden
Fundstellen des Verweis-Sweeps aus Mapping **N5.1** (25 von 31; die sechs historischen bleiben) ·
`.github/workflows/ci.yml`

**No-Diff-Zone:** `release.yml` · alle Hooks · `module-registry.json` · CHANGELOG, Journale,
Bauplan-Archiv, datierte Firmenkernprozess-Berichte (Historie).

| AP | Inhalt | Herkunft |
|---|---|---|
| **D1** | Beide Anker-Dateien per `git rm`; Index-Zeilen entfernen; **kein** Archiv-Umzug (Onsite hat gelöscht, nicht archiviert — eine Norm, die nicht mehr gilt, ist keine historische Quelle). **Prozesskarte 09** ebenfalls `git rm`; Nummernkreis und Familien-Verdrahtung (`00-FAMILIE-UND-VERDRAHTUNG.md`, `01-…`, `README.md`) nachziehen — die Nummer 09 bleibt frei (keine Umnummerierung, sonst brechen externe Verweise). `struktur.test.mjs`: die am Dateinamen hängende Invariante fällt **im selben Commit** | D31, J-E1, N5.1 |
| **D2** | Begriffsnorm „Anker" als **ein Absatz** in `os-bau-methode.md`: knapper Bezeichner, Kollisionsklassen, Absicherung über Mechanik (Merge-Konflikt bei Dateikollision · Suite-Invariante gegen doppelte CHANGELOG-Versionsüberschriften · Pflichtschritt „fremde Worktrees prüfen") — mit Datum des Entscheids | D31 |
| **D3** | `wissen-aendern`/`wissen-planen`/`wissen-nachschlagen`: Reservierungsschritt und Zeiger streichen (nach der N5-Fundstellenliste); Sucheindex: toter Eintrag entfernen; `struktur.test.mjs`: Anker-Prüfungen, die auf die gelöschte Datei zeigen, entfernen — die **CHANGELOG-Versions-Invariante bleibt** (sie ist jetzt die einzige deterministische Anker-Prüfung) | D31 |
| **D4** | `ci.yml` nach J-E2: Job `pruefung` (ubuntu / node 24; Schritte Suite → CLI installieren → `validate .` → `validate plugins/nc --strict` → `validate plugins/nc-development --strict`), Job `vollmatrix` mit `if: github.event_name == 'workflow_dispatch' \|\| startsWith(github.ref, 'refs/tags/nc--v')`; Trigger `pull_request`, `push: tags: ["nc--v*"]`, `workflow_dispatch`; Kopfkommentar mit Kostenbefund und der Regel „Breite reduziert, Prüfung nie" | D22, J-E2 |
| **D5** | Registerzeilen: „@claude-Bot ohne Reaktion" schließen (J-E2), „Reserve-Tag"-Reste prüfen | D22 |

**Abnahme D:** Suite grün · `git grep -i "anker-reservierung"` liefert nur Historie
(Journale, Bauplan-Archiv, CHANGELOG, diesen Plan) · `validate` grün · `ci.yml` per
`actionlint` oder `gh workflow view` syntaktisch geprüft.

---

## 5. Paket J-A — „Kontroll-Schicht" (Overseer, infrastrukturkritisch, parallel zu J-B)

**Berührt:** `plugins/nc/hooks/nc-safety-gate.js` + `tests/safety-gate.test.mjs` ·
`plugins/nc/hooks/nc-queue-faelligkeit.js` + Test · **neu:** `plugins/nc/hooks/nc-setup-hinweis.js`,
`plugins/nc/hooks/lib/infra-registry.js`, `plugins/nc/tests/setup-hinweis.test.mjs` ·
`plugins/nc/hooks/hooks.json` · `plugins/nc/skills/setup/{SKILL.md, infra-registry.md}` ·
`plugins/nc/skills/os-info/SKILL.md` (Zeile Setup-Beleg)

**No-Diff-Zone:** `nc-ffg.js`, `nc-start-gate.js`, `nc-pfad-hinweis.js`, `nc-wissens-hinweis.js`,
`nc-session-start.js`, `lib/bash-analyse.js` (Phase-G/H-Härtungen) · alles aus J-B.

| AP | Inhalt | Herkunft |
|---|---|---|
| **A1** | **Safety-Gate Wertentscheidung** (Port von Onsite `oai-safety-gate.js@a9927b2`, Abschnitt Muster 2): `PROD_PRAEFIXE = ['prod','prd','live']` (Präfix-Vergleich, **maßgeblich allein im Hook**), `UNAUFLOESBAR = /[$\`]/`, `istProdWert`/`istProdZuweisung`/`deployZuweisung`/`zugewieseneNamen`; Zuweisungs-Pass auf dem quote-awaren Strom, Namensschranke aus dem quote-bereinigten Strom; leerer Wert ist kein Prod-Ziel; Dialogtext „richtet den Lauf auf die PROD-Umgebung aus" für Stufe b. **Die vier GLM-Bypass-Härtungen und der WZS-Kopf (BEWUSSTE ABWEICHUNG) bleiben unverändert** (J-1) | D33 |
| **A2** | **Queue-Hook Handlungsanweisung**: `erinnerungsText` nach Onsite `2b8938e` gemappt (`/nc:`-Namespace, Standardprozess `queue-flow.md` statt Spec-§), beide Queue-Skills „Auslösung" auf Session-Start-Auslöser; Suite-Invariante auf Titel, Adressatin („Anweisung an die Session"), Subagenten-Weg, Stempel-Kommando | D28, J-E5 |
| **A3** | **Setup-Erweiterung (Vorbedingung):** `/nc:setup` schreibt `kernRepoPfad` (Arbeitsklon; im OS-Repo selbst = `git rev-parse --show-toplevel`; sonst Frage an den Nutzer, `ausstehend` zulässig) und garantiert die Pflichtfelder; `infra-registry.md` Feldkanon nachziehen; Registerzeile „kernRepoPfad" schließen — **damit endet auch die Ruhe des Pfad-Zeigers D5** | D32, Register 2026-08-24 |
| **A4** | **`lib/infra-registry.js`**: die **eine** Leseimplementierung (`registryDatei`, `ladeRegistry`, `schemaVersionAlsZahl`, String-tolerant), bewertet nicht. Migration der drei Schwester-Leser (`nc-queue-faelligkeit`, `nc-wissens-hinweis`, `nc-pfad-hinweis`) **bewusst nicht** in dieser Phase — wie Onsite: eigener Strang, minimaler Diff (J-1) | D32 |
| **A5** | **`nc-setup-hinweis.js`**: SessionStart, kein Gate; Zustände fehlt / neuer / defekt / grün, erster zutreffender gewinnt; Pfad-Liveness (`.git` als **Datei** zählt, `ausstehend` nur wo erlaubt, Windows-8.3-Tilde ist **kein** Relativpfad-Indiz); Anweisung einmal je Sitzung (Marker in `os.tmpdir()`, atomarer Write, defekter Marker = schweigen); Reihenfolge im Text `/nc:start` → Stempel → `/nc:setup`; Subagenten ausgenommen; Opt-out `NC_SETUP_HINWEIS=off`; Test-Umleitungen `NC_SETUP_STATE_DIR`, `NC_SETUP_SESSION_DIR`; fail-open. `hooks.json`: zehnter registrierter Hook, description-Absatz mit Opt-out | D32, J-E6 |
| **A6** | `os-info`: Zeile „Setup-Beleg: grün / fehlt / defekt (Grund)" aus derselben Bewertung — **ohne** die Bewertung zu duplizieren (Skill ruft den Hook mit `--pruefe` auf oder liest dieselbe Lib) | D32 |

**Abnahme A:** Suite grün · alle Safety-Gate-Bestandstests unverändert grün · T1–T14 belegt ·
Hook-Laufzeit unter 50 ms bei grünem Beleg (null Token Ausgabe) · `hooks.json` description
nennt Opt-out und „kein Gate".

---

## 6. Paket J-B — „Abteilung development" (Opus, Plan-Sandwich, parallel zu J-A)

**Berührt:** **neu:** `plugins/nc-development/agents/{code-reviewer, pipeline-praeflight,
test-luecken-scout}.md` · `plugins/nc-development/README.md` (Overlap-Matrix) ·
`plugins/nc-development/.claude-plugin/plugin.json` (description) · `plugins/nc/module-registry.json`
(`development.agents`) · `plugins/nc-development/workflow.md` · **neu:**
`knowledge-base/standardprozesse/workflow-md-implementierung.md`

**No-Diff-Zone:** `plugins/nc/**` außer `module-registry.json` · `agenten.test.mjs` (Baustein
1.4.2 ist **neuer** als Onsites portabler 1.3.0 — er wird nicht angefasst, sondern erfüllt).

| AP | Inhalt | Herkunft |
|---|---|---|
| **B1** | **`code-reviewer`**: isoliertes 4-Augen-Review eines Diffs, `model: inherit`, `tools: Read, Grep, Glob`, `skills: fe-review, be-review`; Findings BLOCKER/MAJOR/MINOR/NIT als Entwurf; postet, resolvt, approvt nichts. Abgrenzung zu `/nc-development:fe-review`/`be-review` (geführt in der Haupt-Session) | D19 |
| **B2** | **`pipeline-praeflight`** nach J-E3: `model: sonnet`, `tools: Read, Grep, Glob, Bash`, `<!-- nc:diagnose -->`-Marker (Diagnose-Klasse), Allowlist nicht-mutierender Kommandos im Prompt (`node --test …`, `claude plugin validate …`, `gh run list`, `gh run view --log-failed`, `git status/diff/log`), Grün-Prognose je `ci.yml`-Schritt; Abgrenzung zu `flc-commit-prep` | D19, J-E3 |
| **B3** | **`test-luecken-scout`**: `model: sonnet`, `tools: Read, Grep, Glob`, Lückenklassen (keine Tests, Happy-Path-only, fehlende Fehlerpfade, Edge-Cases der Änderung), priorisierte Testgerüst-Vorschläge, schreibt keine Tests; `skills: qs-bugfix` | D19 |
| **B4** | **Overlap-Matrix** Agent × Skill × Router im Plugin-README (kein Agent dupliziert einen `wissen-*`-Router oder einen Skill; Mapping Abschnitt 4 „nach H sinnvoller") | D19, N1.1 |
| **B5** | Registry `development.agents` = drei Einträge mit Einzeiler; `plugin.json`-description „… plus 3 Subagenten (…)" nach der Zähl-Regel D18 | D19 |
| **B6** | **`workflow-md-implementierung.md`** (Port): Anlass-Test mit drei entscheidbaren Fragen, Mindestinhalt, Kollisionsregel gegen `wp-rahmen.md`; `workflow.md` als **optional, WP1–WP7-Abbildung Pflicht**; Registry-Feld `workflow` darf fehlen; Vorlage `abteilungsplugin/` entsprechend | D30 |

**Abnahme B:** `agenten.test.mjs` grün für alle drei Dateien (Frontmatter-Kanon, Allowlist,
Defense-Baseline, Grundsatz 4) · kein `mcp__*`-Werkzeug in `pipeline-praeflight` · jede
Abgrenzung nennt den konkreten Skill · `validate plugins/nc-development --strict` grün.

---

## 7. Paket J-C — „Normen und Prozesse" (Opus, Plan-Sandwich; Overseer reviewt)

**Berührt:** `knowledge-base/standardprozesse/abteilungs-plugin-bau.md` · `kern-plugin-bau.md` ·
`queue-flow.md` · `team-distribution.md` · **neu:** `standardprozesse/contributing-flow.md` ·
**neu:** `grundwissen/NovaCore-OS-Strang-Definition.md` · `grundwissen/NovaCore-OS-SSOT-Definition.md`
(Nachtrag) · `grundwissen/NovaCore-OS-Gates-Definition.md` · `plugins/nc/skills/queue-kern/SKILL.md` ·
`plugins/nc/tests/struktur.test.mjs` (W4-Invariante) · `plugins/nc/hooks/wissen-sucheindex.json`
(Zeilen Contributing-Flow, Strang) · `SSOT-Document-Index.md`

**No-Diff-Zone:** Hook-Code · `agents/` (J-B) · `aktualisierungs-index.md` (J-E zieht die
Matrix-Zeilen gebündelt).

| AP | Inhalt | Herkunft |
|---|---|---|
| **C1** | **Hook-Norm W4** in `abteilungs-plugin-bau.md` §1 und `kern-plugin-bau.md`: „Bei der Auslieferung trägt nur der Kern Hooks; ein etablierter Satellit darf eigene, nicht-redundante, nicht-kollidierende, spezialisierte Hooks — nichts anderes"; Sequenzierungs-Gate-Vokabular streichen; Gates-Definition nachziehen. **Struktur-Invariante** in `struktur.test.mjs`: `plugins/*/hooks/` existiert nur unter `plugins/nc` | D20, J-E8 |
| **C2** | **Anlageweg-Weiche §3.0** (Port, Tabelle „Trägt Inhalt?"), Prüffrage „müsste es morgen wieder herausgezogen werden?", Weichenwechsel-Regel; §3a Atomar-Regel (Pin + Rückbau in **einem** PR) gegen unseren §3a/§3b abgleichen; `team-distribution.md` Reservierungen `ui-ux`/`automation` mit Befristung | D21, D23, J-E9 |
| **C3** | **`contributing-flow.md`** (Port, NovaCore-Zuschnitt): Stationen S1–S7, rote Linien (versionslos, kein Merge, kein Force-Push, Konflikt-Marker-Grep als Kettenglied), Ergebnis-/Abnahmeliste; **S6/S7 = Maintainer**; Jira-Verweise als benannte Lücke auf D29 (J-9); Affiliate-Abgrenzung: Affiliate-Plugins durchlaufen diesen Flow **nicht** über die SSOT (eigene Repos, eigene Regeln) | D34, J-E4 |
| **C4** | **`NovaCore-OS-Strang-Definition.md`** (Port): Definition (ein Ziel-Repo, ein Branch `<typ>/<thema>`, ein Worktree `.worktrees/<branch>`, ein PR-Memo, ein Ende inkl. Aufräumen), Rollen, Prinzipien, Verhältnis zu Register („offener Strang") und Zwei-Klassen-Buchführung | D34 |
| **C5** | **Sichtbarkeitsmodell**: Merksatz-Nachtrag in der SSOT-Definition; `queue-kern` Schritt „Kern-Beitrag entwerfen" → konzentriertes Fakten-Dokument (Datum, Herkunftsabteilung, auflösbare Fundstelle; nie Volltext-Kopie, nie Umzug; fehlt der Verweis, wird die Zeile zurückgestellt); `queue-flow.md` §Kern-Aufstieg | D35, J-E7 |
| **C6** | Sucheindex-Zeilen für Contributing-Flow und Strang-Definition; Index-Zeilen für alle neuen Dokumente | D34 |

**Abnahme C:** Suite grün · T15–T20 belegt · jeder portierte Onsite-Wortlaut trägt die
Affiliate-Abgrenzung des jeweiligen Prozesses (N1.1) · kein Index-Eintrag zeigt ins Leere.

---

## 8. Nachzugs-Bündel J-E (Sonnet-Executor, am PR-Ende)

- Matrix-Zeilen im `aktualisierungs-index.md`: Hook neu (Setup-Hinweis) · Subagent neu ·
  `agents`-Registry · `ci.yml` geändert · Anker-Absatz-Ort
- `README.md` (Wurzel + Plugin): Hook-Tabelle (zehn Hooks), Subagenten-Absatz; `SECURITY.md`
  Garantie-Absatz Setup-Hinweis (kein Gate, kein Netz, fail-open) und Safety-Gate-Wertregel
- `AGENTS.md`: Produktstand, Standardzyklus verweist auf `contributing-flow.md`
- `ONBOARDING.md`: Setup-Hinweis erwähnen
- Mapping-Nachtrag **N6**: Phase-J-Vollzug, Anker-Fortschreibung, Rest für K
- Register: erledigte Zeilen (kernRepoPfad, Bot, Reserve-Tags, W4, Anlageweg, D31–D35) mit Datum
- **Ein** Kern-Bump (0.13.0 → 0.14.0), **ein** Waypoint-CHANGELOG-Schnitt, `nc-development`
  0.2.0 → 0.3.0 (Produktklasse: drei Agenten, `plugin.json`, `workflow.md`)

---

## 9. Bewusst nicht in Phase J

| Posten | Grund |
|---|---|
| **D16** `skill-builder`/`os-info` Metaflow-Stand · **D17** Fit-Prüfung | Phase K; D17 spiegelt den Ruleset-Ordner — erst nach J-C stabil |
| **D29** `jira-workflow.md` | Jira Block B/C zurückgestellt (Weisung 2026-08-24), J-E10 |
| Migration der drei Registry-Leser auf `lib/infra-registry.js` | Eigener Strang, minimaler Diff — wie beim Vorbild (A4) |
| Leitplanken-Korpus Ebene 0 · Achse-2-Maintenance-Skill · `referenz/`-Abnahme · Skill-Größendeckel | Offene Maintainer-Entscheide aus PR #25, eigene Vorgänge |
| WZS-Deploy-Muster im Safety-Gate | Wartet auf die Maintainer-Weiche Actions+SSH vs. Coolify (Register 2026-08-24); die DB-Hälfte ist baubar, aber ein eigener Posten — sie gehört **nicht** in den Fehlalarm-Fix A1 |
| Onsite-Beobachtungsliste D24 (u. a. `setup-hinweis-hook`-Folgeplan, mneme-dreaming, ssot-krake) | in-flight beim Vorbild |

---

## 10. Invarianten (Review-Fokus)

| # | Invariante |
|---|---|
| **J-1** | **Härtungs-Erhalt.** Die vier GLM-Bypass-Härtungen des Safety-Gates, der WZS-Kopf, die FFG-Windows-Muster, die Sperren-Härtung des Queue-Hooks bleiben zeichengleich, soweit A1/A2 sie nicht nennen. **Review-Fokus.** |
| **J-2** | **Fehlalarm-Schutz ist Abnahmekriterium.** Jede Gate-Änderung trägt mindestens so viele Negativ- wie Positivtests. **Review-Fokus.** |
| **J-3** | **Kein neues Gate.** Setup-Hinweis und Queue-Anweisung sind `additionalContext`, Exit immer 0, kein `permissionDecision`, höchstens einmal je Sitzung. |
| **J-4** | **Ein Beleg, ein Schreiber.** `infra.json` schreibt nur `/nc:setup`; Hooks lesen, bewerten, schreiben nie. |
| **J-5** | **Affiliate-Isolation** (N1.1): Affiliate-Plugins stehen in keiner `abteilungen`-Liste, in keiner Overlap-Matrix, in keinem Contributing-Flow-Schritt über die SSOT. |
| **J-6** | **Read-only-Agenten.** Kein Subagent von J-B trägt Write/Edit oder ein `mcp__*`-Werkzeug; `pipeline-praeflight` führt nur Kommandos der Allowlist. |
| **J-7** | **Breite reduziert, Prüfung nie.** Der CI-Regelfall fährt dieselben Schritte wie der lokale Prüfzyklus (Suite + beide Validierungen); nur Plattform-/Node-Breite wandert an Tag und Dispatch. |
| **J-8** | **Ein Bump je Plugin, ein Waypoint.** Im Strang kein Version-Bump, kein CHANGELOG-Eintrag (Aktualisierungs-Index §0). |
| **J-9** | **Nichts erfinden.** Wo Onsite schweigt (Jira-Spalten, Coolify), wird die Lücke benannt. |

---

## 11. Testfälle

| # | Fall | Erwartung |
|---|---|---|
| T1 | `make up DEPLOYMENT_TYPE=dev` | Gate **still** |
| T2 | `make up DEPLOYMENT_TYPE=prod` · `…=prod-eu` · `…=prd-01` · `…=live` | Gate **fragt** („PROD-Umgebung") |
| T3 | `DEPLOY_TARGET=$TARGET ./release.sh` | fragt (unauflösbar, konservativ) |
| T4 | `git commit -m "DEPLOYMENT_TYPE=prod"` · `grep -r "DEPLOYMENT_TYPE=prod" .` | **still** (keine reale Zuweisung) |
| T5 | `MODE=deploy-prod make run` | fragt (deploy-Wort im Wert) |
| T6 | `DEPLOYMENT_TYPE=` · `DEPLOYMENT_TYPE=""` | still (leerer Wert) |
| T7 | Alle Bestandstests des Safety-Gates (Wrapper, Präfix-Kommandos, quote-aware, Lese-Ausnahmen) | unverändert grün |
| T8 | Registry fehlt | Setup-Hinweis injiziert Anweisung mit `/nc:setup`, Exit 0 |
| T9 | Registry grün (Pflichtfelder, lebende Pfade) | **null Ausgabe** |
| T10 | `schemaVersion: "2"` (String, höher) | Zustand „neuer": Marketplace-Update-Hinweis, kein `setup`-Aufruf |
| T11 | `kernRepoPfad` tot · `kernRepoPfad: "ausstehend"` · Pflichtfeld fehlt | „defekt" mit Grund |
| T12 | `.git` als Datei (Worktree) · Pfad mit `~1`-Kurzpfad | grün (kein Fehlalarm) |
| T13 | zweiter SessionStart derselben Sitzung · Subagent · `NC_SETUP_HINWEIS=off` · defekter Marker | still |
| T14 | Queue fällig | Titel „JETZT ausführen (keine Blockade)", Anweisung an die Session, Subagenten-Weg, Stempel-Kommando im Text |
| T15 | `plugins/nc-development/hooks/` angelegt | Suite **rot** (W4) |
| T16 | Drei Agent-Dateien | `agenten.test.mjs` grün; `pipeline-praeflight` ohne `mcp__*`, mit Diagnose-Marker |
| T17 | Registry `development.agents` mit Affiliate-Eintrag | Suite **rot** (Affiliate nie Abteilung) |
| T18 | `ci.yml` bei `pull_request` | genau ein Job läuft; bei Tag `nc--v*` oder Dispatch zusätzlich die Matrix |
| T19 | `git grep -i anker-reservierung` außerhalb Historie | leer |
| T20 | Neues Dokument ohne Index-Zeile (`contributing-flow.md`, Strang-Definition, `workflow-md-implementierung.md`) | Suite **rot** |
| T21 | Produktklassen-Änderung im Strang | kein Bump, kein CHANGELOG-Eintrag |

---

## 12. Abnahme

1. Suite grün, `claude plugin validate` je Plugin grün (Zahlen werden nicht gespiegelt)
2. T1–T21 belegt; T1–T7 und T8–T13 als echte Negativ-/Positivproben in der Suite
3. Kein Index-Eintrag zeigt ins Leere; `grep` auf Altpfade/Altnamen sauber
4. J-A und J-B per Fast-Forward eingeholt, kein Merge-Commit im Phase-Branch
5. Maintainer-Entscheide J-E1–J-E10 am PR bestätigt oder korrigiert (Merge = Bestätigung)
6. Ein Bump je Plugin, ein Waypoint-Schnitt, ein Tag hinter dem Merge — kein Zwischenstand
7. PR-Memo trägt: Verhaltensänderung des Queue-Hooks (weist an statt zu erinnern) und den
   neuen SessionStart-Hook als **teamweit sichtbare** Änderungen

---

*Angelegt 2026-08-25 durch Claude (Fable 5, Claude Code) als Overseer auf Weisung Lucas
Vöhringer. Quellen live gelesen: Onsite.ai-OS `origin/main@a9927b2` (Kern 0.27.0, `ci.yml`,
`oai-setup-hinweis.js`, `lib/infra-registry.js`, `oai-safety-gate.js`-Diff `2530ced..a9927b2`,
`oai-queue-faelligkeit.js` `2b8938e`, `abteilungs-plugin-bau.md` §1/§3.0/§3a,
`contributing-flow.md`, `Onsite.ai-OS-Strang-Definition.md`, `b18016d`), Dev-Satellit
`Onsite.ai-OS-Development@v0.13.3` (`agents/*.md`, `plugin.json`); NovaCore-Gegenprobe im
Worktree auf `feat/onsite-delta-phase-i@3d8bb63`. Entscheide J-E1–J-E10 sind Vorschläge
(Default Onsite-Parität, N1.2) bis zur Maintainer-Bestätigung am Phase-J-PR.*
