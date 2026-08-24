# CLAUDE-Netz-Bau — Standardprozess für Agenten

> **Geistiges Eigentum:** Methode und generischer Prozess sind Eigentum von **NovaCore
> (Lucas Vöhringer)**. `Onsite.ai-OS` ist die **erste umgesetzte Instanz** und dient als
> durchgeführtes Beispiel; dieses Repo ist die zweite. Wo Beispiel und NovaCore auseinandergehen,
> gilt NovaCore — die Abweichungen stehen begründet in §8.
>
> **Verbindlich** für jede Arbeit an der **Instruktions-Schicht**: neue oder geänderte
> CLAUDE-Ebene, Payload, Marker-Block, `@`-Import-Kante, Pfad-Matrix, Verifikation der
> Instruktions-Ladung. **Schwester** ist [`ssot-aufbau.md`](ssot-aufbau.md) — dort die
> **Wissens**-Schicht, hier deren **Instruktions**-Schicht. Normative Begriffsquelle der Ebenen:
> `grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md`. Die **Autosync-Mechanik** normiert
> [`kern-plugin-bau.md`](kern-plugin-bau.md) §2a und **nur** dort (Doppelpflege-Verbot); *was*
> eine einzelne Änderung anfassen muss, steht im
> [`aktualisierungs-index.md`](aktualisierungs-index.md).
>
> **Kein Trigger:** reiner Wissensinhalt (→ `ssot-aufbau.md`), reiner Plugin-Scaffold
> (→ `kern-plugin-bau.md` / `abteilungs-plugin-bau.md`).
>
> **Status: lebendes Teilwerk** (angelegt 2026-08-15, Bauplan-AP-C1). Die Harness-Fakten in §2.3
> sind gegen die offizielle Claude-Code-Doku (`memory`) verifiziert, abgerufen **2026-08-11** —
> bei Format-Fragen neu abrufen, nie aus dem Gedächtnis.

## 1. Zielbild

Das CLAUDE-Netz ist die **Instruktions- und Orchestrierungs-Schicht der SSOT**, kein davon
getrenntes System: **Jede CLAUDE routet und bindet, die SSOT-Ebene dokumentiert** —
Verweis-Überschneidung ja, Text-Kopie nie. Das Doppelpflege-Verbot gilt damit auch auf
Instruktionsebene, wo es am schnellsten bricht (dieselbe Regel in drei Dateien — zwei veralten).

Das Netz löst drei Probleme, die eine einzelne `CLAUDE.md` nicht lösen kann:

| Problem | Was eine Einzeldatei nicht kann |
|---|---|
| **Reichweite** | Instruktion wirkt in jedem Repo, auch in fremden Arbeitsrepos |
| **Eigentum** | Firma, Abteilung, Repo-Team und Mitarbeiter ändern denselben Ort, ohne sich zu überschreiben |
| **Aktualität** | Instruktion erreicht das Team ohne manuelles Kopieren |

## 2. Ebenen-Prinzip — das Netz

### 2.1 Träger, Kanal, Lade-Mechanik, NC-Ist

| Ebene | Prinzip | Träger / Owner | Update-Kanal | Lade-Mechanik | NC-Ist |
|---|---|---|---|---|---|
| **0** | **org-managed**: die wenigen absoluten Invarianten + Verweis auf die SSOT | Admin-Oberfläche des Team-Workspace / Admin | zentral, ohne Sync-Mechanik | Client holt automatisch, **nicht** abwählbar | **bespielbar, nicht bespielt** (§2.5) |
| **1** | **global-individuell mit Privat-Zone**: firmengeführter Block IM Nutzer-Dokument | `~/.claude/CLAUDE.md` / Firma (Block) + Mitarbeiter (Zone) | Autosync-Hook, **Marker-Chirurgie** | jede Session, vollständig | **gebaut** (2026-08-10) |
| **1b** | **team-sync, vollständig geführt**: eigene Datei ohne Privat-Zone, deshalb als Ganzes ersetzbar | `~/.claude/nc-teamsync.md` / Firma allein | Autosync-Hook, Datei-Ersatz statt Chirurgie | `@`-Import aus Ebene 1 — Nutzer-Scope, **ohne Freigabedialog** | **gebaut** (2026-08-15) |
| **2** | **abteilungs-/plugin-paketiert, zweigeteilt**: Plugin-CLAUDE (ausgeliefert) ≠ Repo-CLAUDE (Werkstatt) | Datei IM Plugin-Verzeichnis / Abteilung | Marketplace-Auto-Update bei Plugin-Bump | Einstiegs-Ritual liest den Plugin-Root — in **jedem** Arbeitsrepo | **gebaut** (2026-08-16, AP-F2: erstes Exemplar `development-abteilungs-claude.md` in `nc-development`; Lese-Verdrahtung in `/nc:start` Schritt 7) |
| **3** | **projekt**: Fachfakten des Arbeitsrepos, nichts Firmenweites | Arbeitsrepo / Repo-Team | Git | Verzeichnisbaum-Ladung beim Start | aktiv |
| **3b** | **Sonderfall Werkstatt**: das Repo, in dem das OS selbst gebaut wird | dieses Repo / Kern-Maintainer | Git (nur `AGENTS.md`) | wie 3 | aktiv — Zweiteilung über **getrackt/un-getrackt** |

Ebene 0 ist Bootstrap und harte Invarianten — sie ersetzt **keine** geführte Ebene 1. Ebene 1b hat
**keine** Privat-Zone und darf deshalb als Ganzes ersetzt werden. Ebene 2 trennt die ausgelieferte
Plugin-CLAUDE von der Werkstatt-Doku des Repos.

### 2.2 Kanal-Regel

**Je schneller sich ein Inhalt ändert, desto automatischer muss sein Kanal sein:**
SessionStart-Injektion (jede Session) > Plugin-Paket via Marketplace-Auto-Update (bei Bump) >
Autosync-Doks (erste Session nach Update) > Git (bei Pull). Die Kanal-Regel entscheidet die
Schicht, nicht umgekehrt: **lebender Stand → Injektion/Skill · stehende Ordnung → CLAUDE-Ebenen ·
Fachwissen → SSOT-Repos.** Inhalt in der falschen Schicht ist entweder ständig veraltet oder
verbraucht in jeder Session Kontext für nichts.

### 2.3 `@`-Import-Mechanik (verifiziert 2026-08-11)

| Fakt | Wert |
|---|---|
| Pfade | relativ **und** absolut |
| Rekursion | maximal **vier** Hops |
| Code-Spans | Backticks halten einen Pfad literal (kein Import) |
| Kontext | Import **spart keinen Kontext** — Importiertes lädt vollständig mit |
| Nutzer-Scope (`~/.claude/CLAUDE.md`, `~/.claude/rules/`) | lädt **ohne** Freigabedialog |
| Projekt-Scope, Pfad aus dem Arbeitsverzeichnis hinaus | einmaliger Dialog; Ablehnen = dauerhaft aus |

Genau darauf ruht Ebene 1b: Die geführte Datei liegt im Nutzer-Scope, der Import ist dialogfrei,
die Firma darf sie komplett ersetzen. In NovaCore steht die Import-Zeile `@~/.claude/nc-teamsync.md`
im Firmen-Block der Ebene 1 (`plugins/nc/doks/global-claude-firmenblock.md`).

### 2.4 Marker und Privat-Zonen-Schutz — Verweis statt Wiederholung

Firmen-Blöcke der Ebene 1 stehen zwischen HTML-Kommentar-Markern
(`<!-- NC:BLOCK:START global -->` … `<!-- NC:BLOCK:ENDE global -->`); erste Blockzeile ist der
**Versions-Stempel** `<!-- NC:BLOCK:VERSION <kern-version> -->` und damit der **einzige** State.
Ebene 1b trägt statt Markern den Ganzdatei-Stempel `<!-- NC:TEAMSYNC:VERSION <kern-version> -->`
in Zeile 1. **Verifiziert 2026-08-11:** block-level HTML-Kommentare werden vor der
Kontext-Injektion gestrippt — Marker und Stempel kosten **keine Tokens** (in Code-Blöcken bleiben
Kommentare erhalten).

**Alles Weitere zum Privat-Zonen-Schutz — Marker-Chirurgie, Fallunterscheidung, Backup,
fail-safe bei defekten Markern, fail-open, Opt-out-Env, atomarer Write — steht abschließend in
[`kern-plugin-bau.md`](kern-plugin-bau.md) §2a und wird hier nicht wiederholt.** Für diesen
Prozess zählt nur: Der Schutz ist **nicht verhandelbar** (ohne ihn verliert das Netz die
Nutzerakzeptanz), und **lieber veraltet als zerstört**.

### 2.5 NC-Besonderheiten der Ebenen 0 und 1b

- **Ebene 0 ist bespielbar:** Ein Claude-**Team-Workspace ist vorhanden**, der Maintainer ist
  Admin (Bauplan 2026-08-15, Nachtrag N6). Sie bleibt trotzdem **klein** — Bootstrap, harte rote
  Linien, SSOT-Verweis; sie ist nicht versioniert, nicht getestet, nicht abteilungsfähig und hat
  keine Privat-Zone. Ein **Textentwurf für Ebene 0 geht zur Maintainer-Freigabe**, bevor er in die
  Admin-Oberfläche wandert; die Verteilwege selbst beschreibt der Team-Distributions-Prozess.
- **Ebene-1b-Payload ist `plugins/nc/nc-sync.md`** — bewusst **keine** Kopie unter `doks/`
  (Bauplan-Nachtrag N2): die Datei wird von über zehn ausgelieferten Dateien referenziert, ein
  Umzug bräche sie alle, eine Kopie wäre verbotene Doppelpflege. Der Hook liest sie direkt.

## 3. Bau-Ablauf (Reihenfolge mit Begründung)

1. **Ebenen-Definition als normatives Dokument zuerst** — je Ebene Ort, Funktion, Owner, Kanal,
   Präzedenzregel, Marker-Format. Ohne benannte Owner entsteht kein Netz, sondern dieselbe Regel
   an vier Orten. Präzedenz ist **normative Konvention, keine Harness-Mechanik**: nichts im Client
   stellt eine Ebene über eine andere. Konflikte werden durch **Umformulierung** aufgelöst —
   Methodik/Prozess/Safety von oben nach unten, Fachfakten vom Projekt vor allen. NC-Ort:
   `grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md`.
2. **Verteilweg vor Inhalt.** Payload ins Plugin-Paket + Autosync-Hook (SessionStart,
   Pfad-Auflösung **relativ zum Hook**, nicht über Env-Ableitungen). Ein Text ohne Kanal ist eine
   Absichtserklärung; Feinschliff lohnt erst, wenn der Kanal trägt. Normierungsort der Mechanik:
   `kern-plugin-bau.md` §2a.
3. **Import-/Lese-Verdrahtung.** Ebene 1 importiert die geführte Ebene 1b; das Einstiegs-Ritual
   (`/nc:start`, gestützt durch Gate 2) liest die Abteilungs-CLAUDE aus dem Plugin-Root. Eine
   ausgelieferte Datei, die niemand lädt, wirkt nicht — **Auslieferung ≠ Wirkung**.
4. **Vorlagen-Baustein für neue Abteilungen.** Der CLAUDE-Baustein liegt im Vorlagen-Verzeichnis
   (`vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`); **alles Auszuliefernde liegt IM
   Plugin-Verzeichnis** — Begründung und Belege in `abteilungs-plugin-bau.md` §1a
   (Auslieferungsgrenze). Die zweite Abteilung entscheidet, ob das Netz Muster oder Einzelfall ist.
5. **Pfad-/Verknüpfungs-Matrix pflegen** (§4): je Ebene Quelle → Zielort → Leser → Kanal. Das Netz
   wird nur wartbar, wenn jede Kante benannt ist; unbenannte Kanten sind die Fundstelle jeder
   späteren Drift. Zusätzlich: neue Ebene oder neuer Payload ⇒ **Zeile in der Änderungs-Matrix**
   des `aktualisierungs-index.md`.
6. **Verifikation.** Tests je Hook-Fall (Erstlauf · No-op bei gleichem Stempel · Privat-Zone
   unverändert · defekte Marker → kein Schreiben · Ziel fehlt; Test-Ziele **immer** über die
   Overrides `NC_AUTOSYNC_TARGET` / `NC_AUTOSYNC_TEAMSYNC_TARGET`, nie echte `~/.claude`-Pfade) ·
   **`/context`-Probe**: die erwarteten Dateien stehen unter „Memory files" · **Zwei-Lauf-No-op**:
   der zweite Lauf ändert kein Byte. Keine Behauptung ohne gesehene Ausgabe.

## 4. Pfad-Matrix (NC-Ist, 2026-08-16)

| Ebene | Quelle im Repo | Zielort auf der Maschine | Leser | Kanal |
|---|---|---|---|---|
| 0 | — (Textentwurf zur Freigabe, noch kein Repo-Artefakt) | Admin-Settings des Team-Workspace | jeder Client der Org | zentral, ohne Sync-Mechanik |
| 1 | `plugins/nc/doks/global-claude-firmenblock.md` | `~/.claude/CLAUDE.md`, Block zwischen `NC:BLOCK`-Markern | jede Session | SessionStart-Autosync `nc-doks-autosync.js` |
| 1b | `plugins/nc/nc-sync.md` | `~/.claude/nc-teamsync.md` (Ganzdatei) | jede Session per `@`-Import aus Ebene 1, zusätzlich Lese-Schritt in `/nc:start` | derselbe Autosync, Datei-Ersatz |
| 2 | `knowledge-base/standardprozesse/vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage` → `plugins/<plugin>/<abteilung>-abteilungs-claude.md` | Plugin-Cache der Maschine | Einstiegs-Ritual `/nc:start` (Schritt 7 liest die Ebene-2-Datei je installiertem Abteilungsplugin; Erstauslieferung `nc-development` 0.2.0) | Marketplace-Auto-Update bei Plugin-Bump |
| 3 | Arbeitsrepo: `CLAUDE.md` / `AGENTS.md` | dort | Verzeichnisbaum-Ladung beim Start | Git |
| 3b | dieses Repo: getrackte `AGENTS.md` + un-getrackte lokale `CLAUDE.md` | dort | wer **im** Repo baut | Git (nur `AGENTS.md`) |

## 5. Anti-Drift-Prinzipien

1. **Eine Quelle je Instruktion.** Ebenen referenzieren einander per Name oder Import, nie per
   Textkopie; Ebene 0 verweist, Ebene 1 führt aus.
2. **Der Versions-Stempel ist der einzige State.** Kein Zweit-Stempel, keine Stempeldatei, kein
   Cron — Instruktionen wirken nur in Sessions, also genügt der Sitzungsstart.
3. **Unter 200 Zeilen je geladenem Dokument** (Doku-Zielwert): jede Ebene lädt in **jede** Session
   vollständig, und Länge senkt die Befolgungsquote. Wächst eine Ebene, wandert Detail in
   pfad-/situationsgebundene Regeln oder Skills — der Import verschiebt nur, er spart nichts.
4. **Neue Ebene oder neuer Payload ⇒ Zeile in der Änderungs-Matrix** des Aktualisierungs-Index.
5. **Payload-Änderung ohne Plugin-Bump erreicht niemanden.**
6. **Erzwingbares mechanisch erzwingen** (Hook-Tests, Marker-Invarianten); der Rest steht als
   Selbsttest in der Matrix.

## 6. Fallen

| Falle | Wirkung |
|---|---|
| Textkopie statt Verweis/Import | Doppelpflege; zwei von drei Fundstellen veralten |
| Inhalt in der falschen Schicht | ständig veraltet **oder** Kontext-Müll in jeder Session |
| Text vor Kanal | Absichtserklärung ohne Wirkung |
| Auslieferung ohne Lese-Verdrahtung | niemand lädt die Datei |
| Payload ohne Plugin-Bump | erreicht keine Maschine |
| defekte Marker, trotzdem schreiben | Privat-Zone zerstört |
| Privat-Zone erst nachträglich schützen | Vertrauen ist weg |
| Ebene 0 überfrachten | nicht versioniert, nicht getestet, nicht abteilungsfähig |
| Import als Kontext-Sparmaßnahme | spart **nichts** |
| unbenannte Matrix-Kante | Fundstelle der nächsten Drift |
| Präzedenz als Harness-Mechanik erwarten | der Client stellt keine Ebene über eine andere |

## 7. Replikation für eine neue Instanz

1. **Ebenen-Definition schreiben, bevor** die erste `CLAUDE.md` entsteht; Owner je Ebene benennen
   — in öffentlichen Repos als **Rolle**, nicht als Klarname (§8).
2. **Ebene 0 klein halten** (Bootstrap + Invarianten) — sie ersetzt keine geführte Ebene 1.
3. **Kanal-Regel je Inhaltsart anwenden**, statt alles in die bequemste Datei zu schreiben.
4. **Privat-Zone von Tag 1 markieren und schützen** — nachträglich ist das Vertrauen weg.
5. **Reihenfolge und Fehlerbilder aus der ersten Instanz übernehmen**; jede Abweichung begründen,
   statt sie zu übergehen.

## 8. Bewusste Abweichungen vom Vorbild (Prozesskarte 05)

- **„Sparse-Clone-Regel" → Auslieferungsgrenze.** Das Vorbild begründet „alles Auszuliefernde liegt
  IM Plugin-Verzeichnis" mit dem sparse clone. NovaCore begründet dieselbe Regel mit der belegten
  Auslieferungsgrenze (`abteilungs-plugin-bau.md` §1a) — der Nutzer erhält eine Kopie des
  Plugin-Verzeichnisses. Ergebnis identisch, Begründung belegt.
- **Spec-Paragraphen → Definitionsdokumente.** NovaCore führt keine Einzel-Spec mit §-Kette;
  Onsite-Verweise (§15.28/§15.32) zeigen hier auf
  `grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md` und den jeweiligen Bauplan.
- **Ebene 0:** Vorbild „aktiv", NovaCore „bespielbar, nicht bespielt" (§2.5) — der Workspace
  existiert, der Text ist Maintainer-Sache.
- **Ebene-1b-Payload** bleibt am eingeführten Ort `plugins/nc/nc-sync.md` statt unter `doks/`
  (Nachtrag N2) — Onsite legt sie als `doks/oai-teamsync.md` ab.
- **Rollen statt Klarnamen** in allen ausgelieferten Payloads: Dieses OS-Repo ist **öffentlich**,
  das Vorbild-Repo ist privat (Bauplan §1f / N6, Invariante I9).
- **Marker-Präfix** `NC:` statt `NS:`/`OAI:`, Envs `NC_*`, Skills `/nc:` (Mapping-Regeln §2 des
  Bauplans).

---

*Angelegt 2026-08-15 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`, AP-C1). Quellen: Prozesskarte
`firmenkernprozesse/prozesskarten/05-claude-netz-bau.md` und die Onsite-Prozessquelle
`knowledge base/plugin-maintanance-ruleset-source/claude-netz-bau.md`, gelesen aus
`origin/feat/queue-flow` (Invariante I6). Der NC-Ist-Stand ist gegen den realen Code geprüft
(`plugins/nc/hooks/nc-doks-autosync.js`, `plugins/nc/doks/global-claude-firmenblock.md`,
`plugins/nc/skills/start/SKILL.md`), nicht aus dem Vorbild übernommen.*
