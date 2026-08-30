# Skill-Bau — Standardprozess für Architektur und Anschluss eines Skills

> **Verbindlich**, sobald für den Kern oder eine Abteilung eine neue Fähigkeit als **Skill**
> entstehen soll — **vor** dem ersten Artefakt. Vier Fragen in fester Folge: auf welcher
> **Ebene** die Fähigkeit liegt, **ob** sie ein Skript braucht, **wie** sie an ein Fremdsystem
> andockt, **wer** die Vorlagepflicht trägt. Nicht: wie die Datei aussieht.
> **Abgrenzung — dieses Dokument dupliziert von alledem nichts, es verweist:**
> **SKILL.md-Format** (Frontmatter, YAML-Falle, Gliederung, Merge-Checkliste) →
> `skill-authoring.md` im Kern-Plugin (`plugins/oai/referenz/`); geführter Bau-Durchlauf → Skill
> `/oai:skill-builder` · **Plugin-/Marketplace-Ebene** →
> [`abteilungs-plugin-bau.md`](<abteilungs-plugin-bau.md>) §1–§2 +
> [`kern-plugin-bau.md`](<kern-plugin-bau.md>) · **Subagenten** →
> [`subagenten-bau.md`](<subagenten-bau.md>) · **Wissens-Router** →
> [`wissens-router-bau.md`](<wissens-router-bau.md>) · **Fachablauf** →
> [`workflow-md-implementierung.md`](<workflow-md-implementierung.md>) · **Abteilungs-Hook/FFG** →
> die gleichnamige Zeile im [`Aktualisierungs-Index`](<Aktualisierungs-Index.md>) §2.1.
> **Das Warum:** Ein Skill ist die **Anleitung**; ein Skript ist das **Werkzeug**, das die
> Anleitung an bestimmten Schritten in die Hand nimmt. Wird die Trennung vor dem Bau gezogen,
> entsteht weder ein Skill, der Determinismus nachbaut, noch ein Skript, das Ermessen an sich
> zieht. Herkunft: Architekturvorgabe der Sales-Sitzung 2026-08-28.
> **Mechanik-Fakten** gegen die offizielle Claude-Code-Doku verifiziert (abgerufen
> **2026-08-28**: `code.claude.com/docs/en/skills`). Vor Format-Änderungen erneut abrufen —
> nie aus dem Gedächtnis.
> **Kette:** Fachbedarf einer Abteilung (Bauplan, Jira-Ticket oder Lücke in der
> `workflow.md`) → **dieser Prozess** → `skill-authoring.md` + `/oai:skill-builder` (Format
> und Durchlauf) → [`sync-nachzug-bauzyklus.md`](<sync-nachzug-bauzyklus.md>)

## 1. Anlass — wann greift dieser Prozess, wann nicht

| Fall | Weg |
|---|---|
| Eine Abteilung oder der Kern braucht eine **neue Fähigkeit**, und es ist noch offen, ob sie Skill, Skript, Subagent oder bloßer Ablaufschritt ist | **dieser Prozess** |
| Ein bestehender Skill soll ein **Fremdsystem** anbinden (REST, MCP, UI-only) oder ein **Skript** bekommen | **dieser Prozess** — die Anschlussfrage (§2.3) und die Gate-Frage (§2.4) stellen sich neu |
| Ein bestehender Skill wird nur **inhaltlich geschärft** (Wortlaut, Trigger, ein Ablaufschritt), ohne dass Ebene, Skript oder Anschluss sich ändern | **nicht hier** — Zeile „Skill inhaltlich geändert" im `Aktualisierungs-Index` §2.1 |
| Es geht allein um **Frontmatter, Gliederung, Länge, Trigger-Overlap** eines bereits eingeordneten Skills | **nicht hier** → `skill-authoring.md` bzw. `/oai:skill-builder` |
| Die Arbeit würde den Haupt-Kontext fluten oder braucht einen eigenen; oder gesucht ist ein reiner **Zeiger in die Wissensbasis** | **nicht hier** → `subagenten-bau.md` §1 („im Zweifel Skill") bzw. `wissens-router-bau.md` |

## 2. Ablauf

### 2.1 Schritt 1 — Ebene bestimmen (drei Ebenen, klar getrennt)

Vor jedem Artefakt wird die Fähigkeit genau **einer** Ebene zugeordnet; Vermischen erzeugt Doppelpflege.

| Ebene | Träger | Regelt | Regelt **nicht** |
|---|---|---|---|
| **Fachablauf** | `workflow.md` der Abteilung (Anlass-Test in `workflow-md-implementierung.md`) | welche Skills in welcher Reihenfolge einen Fachprozess bedienen; WP1–WP7-Abbildung, Trigger-Matrix | den Ablauf **innerhalb** eines Skills |
| **Skill** | `SKILL.md` | den **Urteils- und Dialoganteil**: Zuständigkeit (`description`), Vorbedingungen prüfen, Rückfragen an den Menschen, Vorlage vor Freigabe, Verifikation danach | alles, was reproduzierbar und ermessensfrei ist |
| **Skript** | `scripts/` im Skill-Ordner **oder** gemeinsames Werkzeugkasten-Skript im Plugin (§2.3 b) | den **deterministischen Anteil**: reproduzierbar, testbar, protokolliert — kein Ermessen | Entscheidungen, Rückfragen, Freigaben |

**Belegte Mechanik (Abruf 2026-08-28):** Ein Skill-Ordner darf neben der `SKILL.md`
Referenzdateien und ein `scripts/`-Unterverzeichnis tragen („Skills can include multiple files
in their directory"; im Doku-Beispielbaum `scripts/helper.py` als „utility script — executed,
not loaded"). Referenzdateien werden aus der `SKILL.md` heraus **benannt**, damit klar ist, was
sie enthalten und wann sie zu laden sind — gelebter Stand im OS (`bericht-erstellen` im
Mikrobiologie-Satelliten, drei Referenzdateien); ein `scripts/`-Verzeichnis gibt es bislang in
**keinem** Plugin des OS.

### 2.2 Schritt 2 — Skript oder kein Skript (die Entscheidungsregel)

**Bild, das trägt:** Ein Werkzeugkasten (REST/API/CLI) ist immer richtig. Aber wer ein **Haus**
baut — Bulk-Import von 1.500 Datensätzen, Feld-Mapping, Dedupe, Monatsläufe — braucht einen
methodischen Bauplan, also ein Skript. Wer einen **Nagel** einschlägt — einen Datensatz lesen
oder ändern — braucht Anleitung plus Einzeiler, kein Skript.

Fünf Kriterien; **zwei oder mehr „ja" → Skript**. Fällt die Entscheidung dagegen, bleibt der Schritt
eine Anweisung in der `SKILL.md` samt Einzeiler — **nicht** ein halbes Skript im Text.

1. **Wiederholung** — läuft der Schritt regelmäßig (Monatslauf, je Kampagne, je Auftrag)?
2. **Datenmenge** — mehr als eine Handvoll Datensätze je Lauf?
3. **Fehlerkosten** — kostet ein stiller Teilfehler mehr als der Lauf selbst (halb importierte
   Bestände, Dubletten im Fremdsystem)?
4. **Reproduzierbarkeit** — muss ein Dritter den Lauf gleich wiederholen und belegen können?
5. **Freigabepflicht** — braucht der Lauf **Dry-Run → Vorlage → `--apply`**, weil er schreibt?

### 2.3 Schritt 3 — Anschlussart wählen

| # | Anschluss | Wählen, wenn … | Preis |
|---|---|---|---|
| **a** | **Direkter REST-Aufruf** (Einzeiler aus der `SKILL.md`) | Einzelfall, Nagel-Fall nach §2.2, kein wiederkehrender Lauf | Auth, Pagination und Rate-Limit trägt jeder Aufruf selbst |
| **b** | **Werkzeugkasten-Skript** je Fremdsystem | mindestens zwei Skills desselben Plugins sprechen dasselbe System, oder §2.2 fällt positiv aus | einmalig Bau und Tests — dafür einmal gelöst statt je Skill neu |
| **c** | **MCP-Server** | er liefert etwas, das (a)/(b) **nicht** können | hoch, siehe Präzedenz unten |
| **d** | **Anleitungs-Skill** für UI-only-Funktionen | das System bietet die Funktion nur in der Oberfläche | Klickpfad, Vorlage und Prüfliste veralten mit der fremden UI |
| **e** | **Subagent** | eigener Kontext oder ein Read-only-Vertrag nötig | Delegations-Schritt; Prozess in `subagenten-bau.md` |

**Werkzeugkasten-Skript (b) — einmal je Fremdsystem, nie je Skill.** Es kapselt Auth über die
Referenz `OAI_SECRETS_REF` (nie ein Wert im Repo), Pagination, Rate-Limit/429, die Feld-Keys des
Systems, ein Protokoll je Lauf und `--dry-run` als **Default** — sonst baut jeder
Kleinigkeits-Skill den Hammer neu, und einer vergisst das Rate-Limit.
**Ort — innerhalb der Plugin-Grenze** (`abteilungs-plugin-bau.md` §2 Nr. 4: installierte
Plugins sehen keine Repo-Pfade). Beide Lagen sind zulässig, die Doku belegt je eine Variable
(Abruf 2026-08-28): `${CLAUDE_SKILL_DIR}` löst auf das **Skill-Unterverzeichnis** auf,
`${CLAUDE_PLUGIN_ROOT}` auf das **Installationsverzeichnis des Plugins** — letztere
ausdrücklich für „scripts or files bundled anywhere in the plugin, including resources shared
between the plugin's skills". **Hausregel daraus:** Skript für genau einen Skill →
`skills/<name>/scripts/` über `${CLAUDE_SKILL_DIR}`; Werkzeugkasten für mehrere →
`scripts/<system>.mjs` an der Plugin-Wurzel über `${CLAUDE_PLUGIN_ROOT}`. Beide werden an
**zwei** Stellen ersetzt: im Markdown-Body **und** in Bash-Regeln des `allowed-tools`-Frontmatters
(Muster `allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)`) — so läuft genau der
Aufruf ohne Rückfrage, den der Body anweist. `allowed-tools` **erlaubt** nur und schränkt nichts
ein („It does not restrict which tools are available"); der Grant verfällt mit der nächsten
Nutzernachricht — Bequemlichkeit, nie Schutzschicht.

**Präzedenz zu (c) — MCP nicht parallel zu REST (Sales/Pipedrive, 2026-08-28):** Deckt ein
MCP-Server nur eine **Teilmenge** der REST-API ab, wird er **nicht** zusätzlich gebaut — zwei
Zugangswege erzeugen Drift (welcher kann was?) und einen zweiten Gate-Pfad (§2.4). Er kostet
zudem einen Kern-Nachzug: die Zeile „Ein Plugin bekommt einen MCP-Server" (`Aktualisierungs-Index`
§2.1) verlangt, dass der FFG-Matcher `mcp__*` mit abdeckt. Konnektoren werden skill-geführt
eingerichtet — der Marketplace liefert keine Server.

### 2.4 Schritt 4 — Gate-Anschluss prüfen (Ist-Stand, nicht Annahme)

Belegt aus `plugins/oai/hooks/hooks.json` (gelesen 2026-08-28):

- **FFG** (`oai-ffg.js`) und **Start-Gate** matchen `Write|Edit|MultiEdit|NotebookEdit|Bash` — **kein** `mcp__`.
- **Safety-Gate** (Gate 3, `oai-safety-gate.js`) matcht `Bash|mcp__.*`, greift dort aber nur
  über eine Musterliste: Infrastruktur/Deploy/Prod auf dem Bash-Pfad und eine **Verb-Heuristik**
  auf dem MCP-Pfad (`send`/`post`/`publish`/`connect`/`invite`/`comment`/`message` über Werkzeug-
  **und** Parameternamen; Lese-Präfixe `get`/`list`/`search`/`read`/`fetch` an der Verbposition
  ausgenommen). Bei Treffer `permissionDecision: "ask"` — ein echter Freigabedialog.

**Konsequenz, die jeder Skill-Bau tragen muss:** Eine Schreibaktion an ein Fremdsystem ist
**nicht automatisch gegated** — ein REST-Schreibaufruf über `Bash` trifft keines der
Gate-3-Muster, ein MCP-Aufruf nur, wenn Werkzeug- oder Parametername zufällig ein Schreibverb
trägt. **Der Skill trägt die Vorlagepflicht also selbst.** Ein **Domänen-Gate** dafür ist nach
Hook-Norm W4
(`abteilungs-plugin-bau.md` §1) Sache eines **etablierten** Satelliten, nicht des Erstbaus.
Genau deshalb lohnen selbst benannte Skript-Subkommandos in der Form
`<system> <entität> <aktion> --apply`: Das gegatete Vokabular gehört dann uns statt einem
fremden Tool-Namensschema.

### 2.5 Schritt 5 — Pflichtbausteine, wenn ein Skript entsteht

1. **`--dry-run` ist Default**; jede Schreibwirkung braucht ein ausdrückliches `--apply`.
2. **Protokoll je Lauf** im Session-Scratchpad nach `scratchpad-nutzung.md` (R1) — kein Endlager.
3. **Keine Personendaten, keine Secrets** in Logs oder Ausgaben; der Wert hinter
   `OAI_SECRETS_REF` wird nie gelesen, geloggt oder in Kontext geschrieben.
4. **Idempotenz:** Ein zweiter Lauf mit gleicher Eingabe erzeugt keine Dubletten.
5. **Verifikationsabschnitt in der `SKILL.md`** mit prüfbarem Artefakt (Exit-Code, Protokollpfad,
   Trefferzahl gegen Erwartung) — nie „sollte korrekt sein".
6. **Skript-Tests im Plugin** (`node --test`): Dry-Run schreibt nichts · Fehlerpfad bricht ab
   statt halb zu schreiben · Idempotenz-Probe.
7. **Referenzdateien** für Laufzeit-Fakten des Skills — **nichts** über die Plugin-Grenze lesen.

### 2.6 Schritt 6 — Nachzüge und Abschluss

Zeile **„Skill neu"** bzw. **„Skill inhaltlich geändert"** im `Aktualisierungs-Index` §2.1 vollständig abarbeiten; berührt
der Bau einen Subagenten, ein Modul oder einen MCP-Server, gelten deren Zeilen zusätzlich (Vereinigung, nicht Auswahl).
Danach Standardzyklus `node --test plugins/oai/tests/*.test.mjs` + `claude plugin validate plugins/<plugin> --strict`.
**Kein Bump, kein CHANGELOG im Strang** (§0/§3.6) — Wissensträger ist das PR-Ergebnismemo.

## 3. Ergebnis/Output

Nach vollständigem Durchlauf existieren — mit Pfad, nicht als Kategorie:

1. **Die Einordnung als Text** im Bauplan unter `knowledge base/Aktive Baupläne/` oder im
   PR-Ergebnismemo: Ebene (§2.1), Skript-Entscheid samt erfüllter Kriterien (§2.2), Anschlussart
   mit Begründung (§2.3). Auch ein „kein Skript" wird hingeschrieben.
2. **`<plugin>/skills/<name>/SKILL.md`**, bei Skript zusätzlich
   `<plugin>/skills/<name>/scripts/<datei>` **oder** `<plugin>/scripts/<system>.mjs` samt
   Test-Datei unter `<plugin>/test/` bzw. `plugins/oai/tests/`.
3. **Der Vorlage-Abschnitt in der `SKILL.md`**, der Dry-Run, Vorlage und Freigabe vor jeder
   Schreibwirkung verlangt (§2.4) — weil kein Gate sie trägt.
4. **Die Nachzugsspuren** aus §2.6: Registry-Segment, Plugin-`README.md`, Trigger-Matrix,
   Betriebshandbuch §3.

**Fremdprüfbar:** Ein Dritter liest `SKILL.md` und Nr. 1 und kann ohne Rückfrage sagen, welcher
Schritt deterministisch (Skript) und welcher Ermessen (Skill) ist — und wo der Mensch freigibt.

## 4. Regeln / rote Linien

- **Kein Skript trifft eine Entscheidung, kein Skill baut Determinismus nach.** Ein Skript, das
  nachfragt, und ein Skill, der Datensätze in Schleifen abarbeitet, sind falsch eingeordnet.
- **Kein Skill automatisiert eine rote Linie.** Merges, Deploy-Klicks, Review-Resolves und alles
  Kundensichtbare bleiben Mensch; wer eine berührt, verbietet sie ausdrücklich in `## Regeln`.
- **Nie auf ein Gate vertrauen, das nicht belegt ist** — `plugins/oai/hooks/hooks.json` lesen und
  nachweisen, welches greift; sonst trägt der Skill die Vorlagepflicht (§2.4).
- **Kein zweiter Zugangsweg zu einem Fremdsystem**, solange der erste die Aufgabe deckt (§2.3 c).
- **Nichts über die Plugin-Grenze lesen** — Repo-Pfade nur als Quellenangabe, nie als Leseanweisung.

## 5. Verifikation / Abnahme

- [ ] Einordnung nach §2.1–§2.3 schriftlich belegt (§3 Nr. 1)
- [ ] Bei Skript: alle sieben Pflichtbausteine aus §2.5 vorhanden, Dry-Run-Test grün
- [ ] Gate-Prüfung durchgeführt und Ergebnis genannt — Datei-/Matcher-Beleg, wenn ein Gate
      greift; sonst der Vorlage-Abschnitt der `SKILL.md` als Ersatz
- [ ] Merge-Checkliste aus `skill-authoring.md` abgehakt (Format prüft dort, nicht hier)
- [ ] `node --test plugins/oai/tests/*.test.mjs` + `claude plugin validate <plugin> --strict` grün
- [ ] Nachzüge nach `Aktualisierungs-Index` §2.1 erledigt, kein Bump, kein CHANGELOG
- [ ] Selbsttest: *Könnte ein Teammitglied, das nur diesen Skill und sein Skript vor sich hat, den
      Lauf morgen wiederholen und belegen, was geschrieben und von wem freigegeben wurde?*

---

*Angelegt 2026-08-28 auf Maintainer-GO (Lucas Vöhringer, SSOT-Leitplanke 6). Autor: Claude
(Opus, Claude Code) auf Weisung Lucas Vöhringer; Architekturvorgabe aus der Sales-Sitzung mit
Saga (Fable 5) 2026-08-28. Anlass: Die Ruleset-Source normierte Plugin-, Subagenten-, Router- und
`workflow.md`-Bau, aber nicht die Architektur- und Anschlussebene eines Skills —
`skill-authoring.md` regelt allein das Dateiformat. Muster: `workflow-md-implementierung.md`
und `subagenten-bau.md`.*
