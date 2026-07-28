# Skill-Authoring — verbindliche Formatregeln

> Gilt für **jede** `SKILL.md` des OS (Kern wie Abteilungsplugins, auch Sandbox-Skills, die per
> Fork-back übernommen werden sollen). Quelle: offizielle Claude-Code-Doku
> (code.claude.com/docs: `skills`, `plugins-reference`, `plugin-marketplaces`) — Plugin-Layout,
> Skill-Discovery, Dependency-Auflösung und Validierung zuletzt verifiziert am **2026-07-28**.
> Bei künftigen Format-Änderungen: zuerst die Live-Doku erneut abrufen, dann diese Datei
> aktualisieren — nie aus dem Gedächtnis ändern.
>
> **Ablageort:** Diese Datei liegt im Kern-Plugin `nc` unter `referenz/` und wird damit mit dem
> Plugin ausgeliefert — wer Skills baut, braucht sie zur Laufzeit und nicht nur im
> Repo-Checkout.

## Frontmatter (harte Constraints)

```yaml
---
name: flc-plan
description: >-
  <Was der Skill tut + wann er zu nutzen ist, dritte Person, mit Trigger-Begriffen>
---
```

- `name`: max. 64 Zeichen, nur Kleinbuchstaben/Ziffern/Bindestriche, keine reservierten Wörter
  (`anthropic`, `claude`). Muss dem **Verzeichnisnamen** entsprechen.
- `description`: Pflicht (steuert die automatische Skill-Auswahl), max. 1024 Zeichen,
  **dritte Person** („Bereitet … vor", nie „Ich helfe dir …"), enthält konkrete
  Trigger-Begriffe (z. B. „Feature-Branch", „Pull Request", „Review-Befund", „Session-Ende").
- **YAML-Falle — Pflichtregel:** Enthält ein Wert einen **Doppelpunkt gefolgt von einem
  Leerzeichen** (typisch: „Trigger-Begriffe: …"), ein `#` oder beginnt er mit einem
  YAML-Indikator (`>`, `|`, `*`, `&`, `{`, `[`, `-`, `?`, `!`, `%`, `@`), dann ist ein
  unquotierter Plain-Scalar **ungültig**. Immer den Folded-Block-Scalar `>-` verwenden und den
  Text eingerückt darunter setzen (siehe Beispiel oben): Er braucht kein Escaping und verträgt
  Doppelpunkte wie Anführungszeichen. Ein doppelt quotierter String wäre die Alternative,
  erzwingt aber Escaping der im Haus-Stil üblichen `"`-Zeichen.
  **Warum das hart geregelt ist:** Eine nicht parsende Frontmatter bricht nicht sichtbar ab —
  der Skill lädt laut Validator „with empty metadata (all frontmatter fields silently
  dropped)", verliert also `name` und `description` und wird nie automatisch getriggert. In der
  Referenz-Implementierung dieses Musters (Onsite.ai-OS) traf das unbemerkt 19 von 22 Skills,
  bis die Strict-Validierung je Plugin eingeführt wurde.
- Optional nur, wo begründet: `disable-model-invocation: true` — Skill ausschließlich manuell
  aufrufbar. Angebracht bei Skills, die **durch eine rote Linie führen** (Release, Deployment,
  Merge-Freigabe, Kundenkommunikation): Sie sollen nie „hilfsbereit" automatisch anspringen,
  sondern nur, wenn der Mensch sie ausdrücklich ruft.
- Frontmatter beginnt in **Zeile 1** mit `---`, Einrückung mit Leerzeichen, keine Tabs,
  **kein BOM** vor der ersten Zeile.

## Aufbau des Bodys (Haus-Stil)

```markdown
# <aufruf> — <Titel>

## Zweck
<1 Absatz: was, für wen, an welchem Workflow-Punkt (WP-Verweis)>

## Ablauf
1. <nummerierte, imperative Schritte>

## Regeln
- <harte Verhaltensregeln, Verbote fett, rote Linien explizit>

## Verifikation
- <konkret prüfbares Artefakt: Befehl + erwartetes Ergebnis, Test-Status,
  Pipeline-Status, Datei-Existenz — nie „sollte korrekt sein">
```

- **Aufrufform im Titel** folgt dem Plugin, in dem der Skill liegt: Kern → `/nc:<name>`,
  Abteilung → `/nc-<abteilung>:<name>` (z. B. `/nc-development:flc-plan`). Der Namespace ist der
  Name des **Marketplace-Eintrags** — nicht frei wählbar.
- **WP-Verweis:** WP0/WP8 und die Rahmenregeln stehen in `wp-rahmen.md` des Kern-Plugins `nc`,
  WP1–WP7 in der `workflow.md` der jeweiligen Abteilung. Auf die zuständige Datei verweisen,
  nicht beides duplizieren.
- **Länge:** Ziel 60–120 Zeilen, hartes Doku-Limit < 500 Zeilen Body. Detailwissen in eine
  Referenzdatei neben der `SKILL.md` auslagern (max. **eine** Verweis-Ebene tief;
  Referenzdateien über 100 Zeilen brauchen ein Inhaltsverzeichnis).
- **Sprache:** Deutsch, direktiv-imperativisch, keine Floskeln.
- **Eine Datei pro Skill**, flaches Layout: `plugins/<plugin>/skills/<name>/SKILL.md`. Keine
  Use-Case-Unterordner — der Plugin-Scanner liest das Default-Verzeichnis `skills/` und erwartet
  dort `<name>/SKILL.md`; rekursives Discovery ist nicht belegt. Ordner ohne `SKILL.md` (nur
  eine Platzhalter-Datei) ignoriert der Scanner — Platzhalter werden also nie ausgeliefert.
- **Module sind Namenspräfixe**, keine Verzeichnisse: `fe-`, `be-`, `flc-`, `wzs-`. Ein neues
  Modul entsteht durch ein neues Präfix plus Eintrag in `module-registry.json` des Kerns.
- **Keine Pfad-Verweise über die Plugin-Grenze:** Ein installiertes Plugin liegt allein im
  Plugin-Cache; Sprünge ins Elternverzeichnis oder Pfade in die Wissensbasis des Repos lösen
  dort nicht auf. Auf Inhalte eines anderen Plugins per **Name** verweisen („`wp-rahmen.md` des
  Kern-Plugins `nc`"), auf Repo-Dokumente nur als **Quellenangabe** („siehe OS-Repo"), nie als
  Leseanweisung.

## Inhaltliche Pflichten

1. **Fakten nur mit Quelle.** Fachliche Fakten (Schwellenwerte, Datenmodelle, API-Verträge,
   Geschäftslogik, Branch-Konventionen) stammen **ausschließlich** aus dem jeweiligen
   Arbeits-Repo — dessen `CLAUDE.md`/`AGENTS.md`, Projekt-Doku und echtem Quellcode. Die
   methodischen Defaults stehen in `nc-sync.md` des Kern-Plugins `nc`. Selbst generierte Zahlen
   oder Regeln kennzeichnet der Skill als **KI-Vorschlag**. Quelle nicht auffindbar → STOPP,
   benennen, fragen — nicht raten.
2. **Rote Linien verankern.** Pushes auf geteilte Branches, Merges, Review-Resolves/Approvals,
   Releases, Deployments und alles Kundensichtbare führt der Agent **nie selbst** aus — er
   bereitet vor, der Mensch handelt. Jeder Skill, der eine rote Linie berührt, verbietet sie
   explizit in `## Regeln` und führt stattdessen durch den sicheren Ablauf.
3. **Verifikation vor Vertrauen.** Jeder Skill endet mit prüfbaren Abschluss-Nachweisen:
   Befehl plus Ergebnis, grüner Test, Datei-Existenz. Evidence, keine Behauptungen.
4. **Werkzeug-Verfügbarkeit korrekt behandeln.** Nur voraussetzen, was das Produkt-Setup
   garantiert. Das OS bringt **keine** MCP-Server mit; Integrationen sind Sache des
   Arbeits-Repos bzw. des jeweiligen Setups. Schritte, die auf einem optionalen MCP-Server
   beruhen, immer als „wo vorhanden, sonst manuell" formulieren und den manuellen Weg
   ausschreiben. Schreibende Aktionen über externe Dienste bleiben grundsätzlich manuelle
   Schritte des Menschen.
5. **Keine personenbezogenen Pfade/Annahmen** (kein Nutzername, keine lokalen Sonder-Setups).
6. **Nachfragen statt raten** bei widersprüchlichen oder fehlenden Quellen.

## Checkliste vor dem Merge eines Skills

- [ ] `name` = Verzeichnisname, ≤ 64 Zeichen, nur `a-z0-9-`
- [ ] `description` ≤ 1024 Zeichen, dritte Person, Trigger-Begriffe enthalten
- [ ] `description` als `>-`-Block, wenn sie `: `, `#` oder einen führenden YAML-Indikator
      enthält — und `claude plugin validate` meldet **keinen** Frontmatter-Fehler
- [ ] Gliederung Zweck/Ablauf/Regeln/Verifikation vollständig
- [ ] Aufrufform im Titel passt zum Plugin (`/nc:` vs. `/nc-<abteilung>:`)
- [ ] Verifikation nennt konkret prüfbare Artefakte
- [ ] Berührte rote Linien explizit verboten
- [ ] Kein Fakt ohne Quelle im Arbeits-Repo bzw. in der Design-Spec des OS-Repos
- [ ] Kein Pfad-Verweis über die Plugin-Grenze
- [ ] Deutsch, 60–120 Zeilen, keine Personenpfade
- [ ] Kein Trigger-Overlap mit bestehenden Skills (WP-Matrix in der `workflow.md` der Abteilung
      prüfen)
- [ ] `claude plugin validate plugins/<plugin> --strict` läuft fehlerfrei — **nicht** nur
      `claude plugin validate .`: an der Repo-Wurzel prüft der Befehl allein das
      Marketplace-Manifest und lässt Skill-Fehler unentdeckt
