# Idee: FFG-Nachbesserungen — Upstream-Drift-Ritual, Windows-Shell-Erkennung, NotebookEdit

> **Status:** ~~Idee ohne Auftrag~~ **Beauftragt und umgesetzt 2026-08-23** über das
> [Onsite-Delta-Mapping, Posten D3](../grundwissen/2026-08-23-onsite-delta-mapping.md):
> alle drei Lücken (Upstream-Drift-Ritual + Falltabelle `nc-ffg-drift.test.mjs`,
> Windows-Destruktivmuster, NotebookEdit-Datei-Gate) sind im Phase-G-Port geschlossen.
> Die Idee bleibt als Herkunft liegen (Herkunft ≠ Arbeit).
> **Herkunft:** portiert aus dem Onsite-Vorbild (dort festgehalten 2026-08-10, entstanden aus einem
> Vollvergleich mit dem GateGuard-Vorbild) am 2026-08-15. **Alle drei Lücken wurden gegen unseren
> eigenen Code nachgeprüft und bestehen hier unverändert** — Belegstellen unten.

## 1. Ausgangsbefund

Unsere Erkennungsengine ist ein bewusster Port des ECC-GateGuard (`gateguard-fact-force.js`,
ecc@2.0.0) und diffbar gehalten: `plugins/nc/hooks/lib/shell-substitution.js` als 1:1-Port,
`lib/bash-analyse.js` mit eigenem Zuschnitt, dazu die GHSA-4v57-ph3x-gf55-Härtung (gequotete
Kommandowörter, Newline-Trenner, `sh -c`-Wrapper, `find -exec`). Die eigenen Abweichungen —
pfad-normalisiertes File-Gate-Keying, geteilte `lib/session-key.js`, keine KI-sichtbaren
Abschalt-Hinweise, `NC_FFG_EXEMPT_GLOBS`, `NC_FFG_FULL_DENIALS`, erweiterte Read-only-Allowlist —
sind begründet und im Code dokumentiert. Drei Lücken bleiben.

## 2. Lücke A — Upstream-Drift: der Port hat keinen Drift-Detektor

**Befund (verifiziert):** Der Port-Stand `ecc@2.0.0` existiert ausschließlich in Code-Kommentaren —
`plugins/nc/hooks/nc-ffg.js:3`, `hooks/lib/bash-analyse.js:3`, `hooks/lib/shell-substitution.js:2`.
Es gibt kein Ritual, keinen Diff-Abgleich und keine Übernahme der ECC-Testmatrix. Unsere Suite hat
**26 Verhaltenstests** (`plugins/nc/tests/nc-ffg.test.mjs`); die ECC-Suite ist deutlich größer (im
Vorbild mit 140 Tests angegeben — von uns nicht nachgezählt). Wer `bash-analyse.js` später anfasst,
hat ein dünnes Netz — und ein künftiger Upstream-Fix (GHSA-4v57 war genau so einer) wird nicht
bemerkt.

**Empfehlung (zwei Teile):**

1. **ECC-Engine-Tests als Drift-Detektor importieren:** Die Bash-Erkennungs- und
   Shell-Substitution-Tests aus ECCs `tests/hooks/gateguard-fact-force.test.js` gegen
   `plugins/nc/hooks/lib/bash-analyse.js` und `shell-substitution.js` laufen lassen — die
   Schnittstellen sind identisch (`isDestructiveBash`, `isReadOnlyGitIntrospection`, die drei
   Extraktoren), die Übernahme sollte fast unverändert gelingen. Bekannte Abweichungspunkte:
   Env-Namen (`NC_FFG_EXTRA_DESTRUCTIVE` statt `GATEGUARD_BASH_EXTRA_DESTRUCTIVE`) und die
   erweiterte Read-only-Allowlist — dafür eigene Erwartungen statt der Upstream-Erwartungen.
2. **Upstream-Ritual dokumentieren** (`standardprozesse/kern-plugin-bau.md` bzw.
   `aktualisierungs-index.md`): Pin-Stand (ecc@Version + Datum) an **einer** Stelle führen; bei jedem
   ECC-Release die portierten Dateien diffen; die Übernahme-Entscheidung (auch „bewusst nicht
   übernommen") im `CHANGELOG.md` festhalten.

## 3. Lücke B — Windows-Destruktivmuster fehlen (bei uns die Alltagsrealität)

**Befund (verifiziert):** Die Erkennung ist unix-shell-zentriert (`rm`/`git`/SQL/`dd`/`find -exec`) —
beim Vorbild ebenso. Entwickelt und betrieben wird hier **Windows-first**; Bash-Tool-Aufrufe laufen
über Git Bash, aber Agenten können jederzeit `cmd /c …` oder `powershell.exe -Command …` absenden.
**Heute nicht erkannt:** `Remove-Item -Recurse -Force`, `del /s /q`, `rmdir /s /q` bzw. `rd /s /q`,
`powershell -c "<destruktiv>"`- und `cmd /c`-Wrapper.

Für NovaCore wiegt diese Lücke schwerer als im Vorbild: Neben dem Bash-Werkzeug steht ein
PowerShell-Werkzeug zur Verfügung, und destruktive Aufrufe darüber treffen auf Muster, die
ausschließlich für POSIX-Shells geschrieben sind.

**Empfehlung (zwei Stufen):**

1. **Sofort, ohne Codeänderung:** Standard-Belegung von `NC_FFG_EXTRA_DESTRUCTIVE` als Regex-Satz ins
   Setup-/Rollout-Profil — genau dafür ist die Env gebaut.
2. **Eingebaut und getestet (Kern-Änderung):** Windows-Muster als eigene Erkennungsfunktion in
   `bash-analyse.js`: cmd-/PowerShell-Wrapper analog der `sh -c`-Behandlung (GHSA-Pfad),
   `Remove-Item`-Flag-Logik analog `isDestructiveRm` (rekursiv UND erzwungen). Je Muster ein Test
   plus Fehlalarm-Gegenproben (`dir /s`, `Get-ChildItem -Recurse` dürfen **nicht** feuern) —
   Fehlalarm-Schutz ist Abnahmekriterium. Bewusst entscheiden: `del` **ohne** `/s` ist
   Einzeldatei-Löschen; Empfehlung ist, nur rekursive/erzwungene Formen zu gaten (Konsistenz mit der
   rm-Logik).

## 4. Lücke C — NotebookEdit läuft am Datei-Gate vorbei

**Befund (verifiziert, bei uns bereits dokumentiert):** Das Start-Gate matcht `NotebookEdit`
(`plugins/nc/hooks/hooks.json:32` → `Write|Edit|MultiEdit|NotebookEdit|Bash`), das FFG nicht — weder
im Matcher (`hooks.json:22` → `Write|Edit|MultiEdit|Bash`) noch in der TOOL_MAP (`nc-ffg.js:385`).
Notebook-Edits sind damit das einzige schreibende Werkzeug ohne Fakten-Gate.
`grundwissen/NovaCore-OS-Gates-Definition.md` hält den Zustand bereits fest („verlangt den erledigten
Session-Start …, aber **keine Fakten je Zieldatei** — Gate 1 matcht es nicht") — die Lücke ist also
**bekannt und bewusst**, offen ist nur die Behebung. Beim Vorbild ist es ebenso, es ist also kein
Port-Defizit, sondern eine eigene Erweiterungsstelle.

**Empfehlung:** `NotebookEdit` wie `Edit` behandeln (Datei-Gate auf `notebook_path`):
TOOL_MAP-Eintrag, Matcher in `hooks.json` ergänzen, ein Test nach Vorbild des MultiEdit-Tests. Umfang
grob 10 Zeilen plus Test. Einzelfall-Entscheid: den Edit-Text wörtlich übernehmen statt einen
Notebook-eigenen Text zu erfinden. **Mitzuziehen:** die Zeile in der Gates-Definition und die
Beschreibung in `hooks.json`, die den heutigen Zustand korrekt beschreibt.

## 5. Grenzen / bewusst nicht Teil

- **Keine MCP-Abdeckung:** `mcp__*`-Schreibwege gehören zu Gate 3 (seit 2026-08-23 gebaut, `nc-safety-gate.js` deckt `mcp__.*` ab) — nicht Teil
  dieser Nachbesserungen.
- **Prüfungs-Eigentum unberührt:** A–C duplizieren keine Abteilungs-Prüfung und schwächen keine
  Kern-Prüfung (`standardprozesse/kern-plugin-bau.md` §1a).
- **Satelliten separat:** `nc-felix` und `nc-biggi` tragen **eigene Kopien** von Gate 1. Eine
  Kern-Härtung erreicht sie nicht automatisch; jede der drei Nachbesserungen braucht dort einen
  eigenen Nachzug im jeweiligen Satelliten-Repo (Isolation, `standardprozesse/ssot-aufbau.md` §4a).
- **Keine Eile:** Keine der drei Lücken blockiert den Rollout. B-Stufe 1 ist reine Konfiguration; A
  und C sind kleine, sauber abgegrenzte Kern-Änderungen.

---

*Portiert 2026-08-15 aus dem Onsite-Vorbild in die NovaCore-Wissensbasis; Befunde gegen
`plugins/nc/hooks/` und `plugins/nc/tests/nc-ffg.test.mjs` nachverifiziert. Ursprung dort:
Vollvergleich auf Weisung Lucas Vöhringer, 2026-08-10.*
