# CLAUDE-Netz-Bau — Standardprozess (Instruktions-Schicht der SSOT-Dimension)

> **Geistiges Eigentum:** Methode und generischer Prozess sind Eigentum von **NovaCore
> (Lucas Vöhringer)**; das OS entstand nicht im Rahmen von Onsite — **Onsite.ai-OS ist die
> erste umgesetzte Instanz** und dient hier als durchgeführtes Beispiel, nicht als Pflicht.
> Gesammelt wird dieses Dokument (wie alle generischen Prozessdokumente) in diesem Dev-Repo
> (private Org des Autors); **vor dem Live-Gang in eine Firmen-Org wird es extrahiert**
> (Folgeplan; vorher die schriftliche IP-Vereinbarung — Phasenmodell/IP-Grenze §4, A2).
>
> **Status: lebendes Teilwerk** (2026-08-11). Schwesterdokument von
> [`kern-ssot-aufbau.md`](<kern-ssot-aufbau.md>): dort die **Wissens**-Schicht der SSOT, hier
> deren **Instruktions**-Schicht. Normative Begriffsquelle der ersten Instanz:
> `project-meta-infos/Onsite.ai-OS-CLAUDE-Ebenen-Definition.md`; Herleitung und
> Maintainer-Entscheidungen: `Bauplan-archiv/2026-08-10-claude-ebenen-architektur-konzeption.md`.
> Die Harness-Fakten unten sind gegen die offizielle Claude-Code-Doku (`memory`) verifiziert,
> abgerufen **2026-08-11** — bei Format-Fragen neu verifizieren, nie aus dem Gedächtnis.
> **Kette:** Payload-Änderung → **dieser Prozess** → Kern-Bump / Autosync (Achse 2)

## 1. Zielbild

Das CLAUDE-Netz ist die **Instruktions- und Orchestrierungs-Schicht der SSOT**, kein davon
getrenntes System: die Wissensebenen dokumentieren, die CLAUDE-Ebenen routen und binden.
Leitsatz: **Jede CLAUDE routet und bindet, die SSOT-Ebene dokumentiert** — Verweis-Überschneidung
ja, Text-Kopie nie. Damit gilt das Doppelpflege-Verbot auch auf Instruktionsebene, wo es sonst
am schnellsten bricht (dieselbe Regel steht in drei Dateien, zwei veralten).

Das Netz löst drei Probleme, die eine einzelne CLAUDE.md nicht lösen kann: **Reichweite**
(Instruktion wirkt in jedem Repo, auch in fremden Arbeitsrepos), **Eigentum** (Firma, Abteilung,
Repo-Team und Mitarbeiter ändern denselben Ort, ohne sich zu überschreiben) und **Aktualität**
(Instruktion erreicht das Team ohne manuelles Kopieren).

## 2. Grundbausteine — das Ebenen-Prinzip

| Ebene | Prinzip | Träger / Owner | Update-Kanal | Lade-Mechanik |
|---|---|---|---|---|
| **0** | **org-managed**: die wenigen absoluten Invarianten + Verweis auf die SSOT | zentrale Admin-Oberfläche bzw. Managed-Policy-Ort / Admin | zentral, ohne Sync-Mechanik | vom Client automatisch geholt; **nicht** durch Nutzer-Settings abwählbar |
| **1** | **global-individuell mit Privat-Zone**: firmengeführter Block IM Nutzer-Dokument | `~/.claude/CLAUDE.md` / Firma (Block) + Mitarbeiter (Zone) | Autosync-Hook, **Marker-Chirurgie** | jede Session, vollständig |
| **1b** | **team-sync, vollständig geführt**: eigene Datei ohne Privat-Zone, deshalb als Ganzes ersetzbar | eigene Datei im Nutzer-Scope / Firma allein | Autosync-Hook, Datei-Ersatz statt Chirurgie | per `@`-Import aus Ebene 1 — Nutzer-Scope-Imports laden **ohne Freigabedialog** |
| **2** | **abteilungs-/plugin-paketiert, zweigeteilt**: Plugin-CLAUDE (ausgeliefert) ≠ Repo-CLAUDE (Werkstatt) | Datei IM Plugin-Verzeichnis / Abteilung | Marketplace-Auto-Update bei Plugin-Bump | vom Einstiegs-Ritual aus dem Plugin-Root gelesen — in **jedem** Arbeitsrepo |
| **3** | **projekt**: Fachfakten des Arbeitsrepos, nichts Firmenweites | Arbeitsrepo / Repo-Team | Git | Verzeichnisbaum-Ladung beim Start |
| **3b** | **Sonderfall Werkstatt**: das Repo, in dem das OS selbst gebaut wird — zweigeteilt „daran arbeiten" / „es betreiben" | Werkstatt-Repo / Maintainer | Git | wie 3 |

**Kanal-Regel (entscheidet die Schicht, nicht umgekehrt):** *Je schneller sich ein Inhalt ändert,
desto automatischer muss sein Kanal sein.* SessionStart-Injektion (jede Session) > Plugin-Paket
via Auto-Update (bei Bump) > Autosync-Doks (erste Session nach Update) > Git (bei Pull).
Konsequenz: lebender Stand → Injektion/Skill · stehende Ordnung → CLAUDE-Ebenen · Fachwissen →
SSOT-Repos. Inhalt, der die falsche Schicht bekommt, ist entweder ständig veraltet oder
verbraucht in jeder Session Kontext für nichts.

**Marker-Konvention** (Träger der Privat-Zone auf Ebene 1): Firmen-Blöcke stehen zwischen
HTML-Kommentar-Markern (`<!-- NS:BLOCK:START name -->` … `<!-- NS:BLOCK:ENDE name -->`), erste
Blockzeile ist ein **Versions-Stempel**. Der Stempel ist der **einzige** State — kein externer
Stempelspeicher, damit idempotent und No-op bei identischem Stand. **Verifiziert 2026-08-11:**
block-level HTML-Kommentare werden vor der Kontext-Injektion **gestrippt** (nur der Read-Tool-Blick
zeigt sie) — Marker und Stempel kosten also **keine Tokens**; in Code-Blöcken bleiben Kommentare
erhalten.

**`@`-Import-Mechanik (verifiziert 2026-08-11):** `@pfad` in einer CLAUDE.md zieht die Datei beim
Start hinein; relative **und** absolute Pfade erlaubt, rekursiv **maximal vier Hops**; Import-Parsing
überspringt Code-Spans (Backticks halten einen Pfad literal). Wichtig: **Import spart keinen
Kontext** — Importiertes lädt vollständig mit. Ein Import in einer **Projekt**-Datei, der aus dem
Arbeitsverzeichnis hinausführt, löst einen einmaligen Freigabedialog aus (Ablehnen = dauerhaft
aus); Imports in **Nutzer-Scope**-Dateien (`~/.claude/CLAUDE.md`, `~/.claude/rules/`) laden ohne
Dialog. Genau darauf ruht Ebene 1b: die geführte Datei liegt im Nutzer-Scope, der Import ist
dialogfrei, die Firma darf sie komplett ersetzen.

**Privat-Zonen-Schutz** (nicht verhandelbar, sonst verliert das Netz die Nutzerakzeptanz): nur
zwischen den Markern schreiben, alles außerhalb bleibt **byte-identisch** · **Backup** vor jedem
Schreiblauf · **fail-safe bei defekten Markern** (START ohne ENDE → nichts schreiben, Hinweis auf
stderr: lieber veraltet als zerstört) · Schreib-Hook **fail-open**, Subagenten ausgenommen,
Opt-out per Env.

## 3. Bau-Ablauf (Reihenfolge mit Begründung)

1. **Ebenen-Definition als normatives Dokument zuerst** — je Ebene Ort, Funktion, Owner, Kanal,
   Präzedenzregel, Marker-Format. Grund: ohne benannte Owner entsteht kein Netz, sondern
   dieselbe Regel an vier Orten. Präzedenz ist **normative Konvention, keine Harness-Mechanik**
   (nichts im Client stellt eine Ebene über eine andere) — Konflikte werden durch
   **Umformulierung** aufgelöst: Methodik/Prozess/Safety von oben nach unten, Fachfakten vom
   Projekt vor allen.
2. **Verteilweg vor Inhalt:** Payload-Dateien ins Plugin-Paket legen + Autosync-Hook bauen
   (SessionStart, Pfad-Auflösung **relativ zum Hook**, nicht über Env-Ableitungen). Grund: ein
   Text ohne Kanal ist eine Absichtserklärung. Erst wenn der Kanal trägt, lohnt Feinschliff am
   Text. Normierungsort der Autosync-Mechanik ist der Kern-Plugin-Bau-Prozess, nicht ein
   Einzeldokument (erste Instanz: [`kern-plugin-bau.md`](<kern-plugin-bau.md>) §2a).
3. **Import-/Lese-Verdrahtung:** Ebene 1 importiert die geführte Ebene 1b; das Einstiegs-Ritual
   (Gate „Sitzungsstart") liest die Abteilungs-CLAUDE aus dem Plugin-Root. Grund: eine
   ausgelieferte Datei, die niemand lädt, wirkt nicht — Auslieferung ≠ Wirkung.
4. **Vorlagen-Baustein für neue Abteilungen** anlegen (CLAUDE-Baustein im Plugin-Vorlagen-
   Verzeichnis, samt Regel „alles Auszuliefernde liegt IM Plugin-Verzeichnis" — Satelliten werden
   als **sparse clone** nur des Plugin-Unterordners geholt, Repo-Wurzel-Dateien kommen nicht mit).
   Grund: die zweite Abteilung entscheidet, ob das Netz Muster oder Einzelfall ist.
5. **Pfad-/Verknüpfungs-Matrix als Nachschlageteil pflegen:** je Ebene Quelle → Zielort →
   Leser → Kanal. Grund: das Netz wird nur wartbar, wenn jede Kante benannt ist; unbenannte
   Kanten sind die Fundstelle jeder späteren Drift.
6. **Verifikation:** Tests je Hook-Fall (Erstlauf · No-op bei gleichem Stempel · Privat-Zone
   unverändert · defekte Marker → kein Schreiben · Ziel fehlt) · **`/context`-Probe**: die
   erwarteten Dateien stehen unter „Memory files" (optional der `InstructionsLoaded`-Hook, der
   protokolliert, welche Instruktionsdateien wann geladen wurden) · **Zwei-Lauf-No-op**: zweiter
   Lauf ändert kein Byte. Keine Behauptung ohne gesehene Ausgabe.

## 4. Anti-Drift-Prinzipien

- **Eine Quelle je Instruktion.** Ebenen referenzieren einander per Name oder Import, nie per
  Textkopie; Ebene 0 verweist, Ebene 1 führt aus.
- **Versions-Stempel ist der einzige State.** Kein Zweit-Stempel, keine Stempeldatei, kein Cron —
  Instruktionen wirken nur in Sessions, also genügt der Sitzungsstart.
- **Unter 200 Zeilen je geladenem Dokument** (Doku-Zielwert): jede Ebene lädt in **jede** Session
  vollständig, und Länge senkt die Befolgungsquote. Wächst eine Ebene, wandert Detail in
  pfad-/situationsgebundene Regeln oder Skills — Import verschiebt nur, er spart nichts.
- **Neue Ebene oder neuer Payload ⇒ Zeile in der Änderungs-Matrix** des Aktualisierungs-Index;
  ohne diese Zeile beginnt die Drift von Neuem.
- **Payload-Änderung ohne Plugin-Bump erreicht niemanden** — kein Bump, kein Auto-Update.
- **Erzwingbares mechanisch erzwingen** (Hook-Tests, Marker-Invarianten), der Rest steht als
  Selbsttest in der Matrix.

## 5. Replikation für eine neue Instanz

1. Ebenen-Definition schreiben, **bevor** eine CLAUDE.md entsteht; Owner je Ebene namentlich.
2. Ebene 0 klein halten (Bootstrap + Invarianten) — sie ersetzt keine geführte Ebene 1: nicht
   versioniert, nicht getestet, nicht abteilungsfähig, keine Privat-Zone.
3. Kanal-Regel je Inhaltsart anwenden, statt alles in die bequemste Datei zu schreiben.
4. Privat-Zone von Tag 1 markieren und schützen — nachträglich ist das Vertrauen weg.
5. Die Onsite-Instanz ist die Referenz für Reihenfolge und Fehlerbilder; ihr Stand (2026-08-11):
   Ebene 0 und 3/3b aktiv, Ebene 1 firmengeführt per Marker-Chirurgie seit Kern 0.12.0,
   Ebenen 1b und 2 gebaut seit Kern 0.17.0 (§15.32 — Team-Sync-Payload mit Ganzdatei-Sync
   und `@`-Import; Abteilungs-CLAUDE zweigeteilt, Erstausprägung development), die
   Zweiteilung der Werkstatt-CLAUDE (3b) offen.

---

*Angelegt 2026-08-11 durch Opus-Builder nach Konzept Claude „Saga" (Fable 5) auf Weisung
Lucas Vöhringer. Generischer NovaCore-Prozess, destilliert aus der ersten Instanz.
Extraktion vor Live-Gang: Folgeplan `Bauplan-archiv/2026-08-09-folgeplan-nach-kern-abschluss.md`.*
