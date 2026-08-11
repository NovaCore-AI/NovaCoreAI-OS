# SSOT-Aufbau — Standardprozess für Agenten

> **Geistiges Eigentum:** Methode und generischer Prozess sind Eigentum von **NovaCore
> (Lucas Vöhringer)**. `Onsite.ai-OS` ist die **erste umgesetzte Instanz** und dient hier als
> durchgeführtes Beispiel; dieses Repo ist die zweite. Wo das Beispiel und NovaCore
> auseinandergehen, gilt NovaCore — die Abweichungen sind an Ort und Stelle begründet.
>
> **Verbindlich** für den Aufbau und die Pflege einer Wissensbasis — der des Kerns **und** der
> eines eigenständigen Satelliten (§4). Den Plugin-Bau regeln daneben
> [`kern-plugin-bau.md`](kern-plugin-bau.md) und
> [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md); *was* eine einzelne Änderung anfassen
> muss, steht im [`aktualisierungs-index.md`](aktualisierungs-index.md); *wie* die abgeleiteten
> Nachzüge gebündelt werden, in [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md).
>
> **Status: lebendes Teilwerk** (angelegt 2026-08-11, Bauplan-AP2). Die Struktur-Ebene ist
> entschieden und gelebt.

## 1. Zielbild

Die SSOT ist die Wissensinfrastruktur des OS: **alle** Wissenssammlungen, mit denen es
kooperiert, **plus** deren Orchestrierung und Pflege. Normative Begriffsquelle:
`grundwissen/NovaCore-OS-SSOT-Definition.md` — dort steht, was „SSOT" bedeutet und wo die
Grenzen firmenintern ↔ affiliate verlaufen.

**Redaktionsregel „Kern kompakt, Satellit vollständig":** Die Wissensbasis des OS-Repos trägt,
was für **alle** gilt — Standardprozesse, Begriffsnormen, Produktdefinitionen — und bleibt
bewusst schlank. Ein eigenständiger Satellit dokumentiert sein eigenes Vorhaben-, Fehler- und
Ideenwissen **vollständig** bei sich. Daraus folgt das Doppelpflege-Verbot: **dieselbe Sache
wird nicht zweimal ausformuliert.** Das ist eine Regel für Menschen und Agenten beim Schreiben —
**keine Mechanik** (§4a).

## 2. Die sieben Grundbausteine

| # | Baustein | Zweck | In diesem Repo |
|---|---|---|---|
| 1 | **Grundkategorien** mit Aufnahme-/Ablehnungsregel und Lebenszyklus je Ordner | jede Datei hat genau einen richtigen Ort | `grundwissen/` · `bauplan-archiv/` · `ideen-backlog/` · `standardprozesse/` · `debugging-findings/` |
| 2 | **Master-Dokumenten-Index** — Teil 1 Routing („wohin gehört es"), Teil 2 Triage („relevant wenn …"); **einziges** Dokument auf der Wurzelebene | Einstieg ohne Volltext-Lektüre; keine zweite Dateiliste, denn Doppelpflege ist eine Drift-Quelle | `knowledge-base/SSOT-Document-Index.md` |
| 3 | **Änderungs-Matrix** — je Änderungsart: Pflichtlektüre vorher, Nachzüge in derselben Änderung, Mechanik (Version/Release/Protokolle) und Selbsttest | die Nachschlageliste gegen Vergessen; neue Änderungsart = neue Zeile | `standardprozesse/aktualisierungs-index.md` |
| 4 | **Zwei append-only-Protokolle**: eigene Fehler (mit Präventionsregel) und gefundene Bugs | Lernen aus eigenen Fehlern; Symptom-Abgleich **vor** neuer Fehlersuche | `debugging-findings/agent-learnings.md` · `debugging-findings/debug-log.md` |
| 5 | **Norm / Ist / Plan getrennt**: Norm nur per Nachtrag änderbar (der jüngste gewinnt) · Ist-Inventur des Gebauten · Planungsdokumente mit Lebenszyklus | Widersprüche werden entscheidbar statt unsichtbar | Definitionsdokumente in `grundwissen/` (Norm) · `README.md`/`AGENTS.md` (Ist) · datierte Baupläne in `grundwissen/`, nach Abschluss in `bauplan-archiv/` (Plan) |
| 6 | **Mechanische Wächter**: Test-Invarianten (Index-Vollständigkeit, Linkgültigkeit, Wurzel-Regel, Kategorie-Routing, Versions-Gleichstand) plus CI | erzwingen, was erzwingbar ist — der Rest steht im Matrix-Selbsttest | `plugins/nc/tests/struktur.test.mjs` · `.github/workflows/` |
| 7 | **Rituale mit Erzwingung**: Pflicht-Einstieg und Sitzungsabschluss als Skills, technisch gestützt durch Gates | die Wissensbasis wird gelesen und gepflegt, nicht nur besessen | `/nc:start` + Gate 2 (Start-Gate und Fakten-Stempel) · `/nc:save-session` · `/nc:doku-sync` |

## 3. Aufbau-Ablauf

1. **Kategorien und Routing zuerst** (Index Teil 1 **vor** jedem Inhalt): Ablageregeln
   definieren, bevor Dateien entstehen — nachträgliches Routing ist der teuerste Umbau.
2. **Master-Index anlegen und sofort testerzwingen** (Wächter vor Wachstum): Jede Wissensdatei
   bekommt ihre Index-Zeile in **derselben** Änderung, und kein Eintrag zeigt ins Leere.
3. **Protokolle anlegen** — Format im Dateikopf, append-only-Regel ausdrücklich: nie
   rückdatieren, nie umschreiben.
4. **Änderungs-Matrix aufsetzen** und als selbst-normativ markieren (ihre eigene Pflegeregel:
   neue Änderungsart → neue Zeile, sonst beginnt die Drift von Neuem).
5. **Norm-Dokumente mit Nachtrags-Prinzip** einführen; Versions-Spiegelstellen minimal halten und
   **jede** in der Matrix listen. Dieselbe Zahl an zwei Orten ist eine Drift-Verabredung.
6. **Rituale verankern:** Einstiegs-Skill plus Erzwingungs-Gate, Abschluss-Skill plus
   Doku-Sync-Checkliste. Die Einstiegs-Injektion nennt den **lebenden Stand**, nie statische
   Regeln ein zweites Mal.
7. **Verifikation:** Suite grün · jeder Pfad im Index · Matrix-Selbsttest („habe ich etwas
   vergessen?") · keine Behauptung ohne Gegenprobe.

## 4. Struktur-Vererbung an eigenständige Satelliten

Die Wissensbasis wird so gebaut, dass ein eigenständiger Satellit sie **erbt statt umbaut**.
Erste Instanz: `nc-felix`.

| Andockpunkt | Kontrakt |
|---|---|
| **Struktur-Vererbung** | Jeder eigenständige Satellit übernimmt die Grundkategorien, einen **eigenen** Master-Index als einzige Wurzeldatei und **beide** Protokolle. Verbindliche Vorlage: `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` |
| **Eigene Pflege** | Gepflegt wird ausschließlich von den **eigenen** Hooks und Skills des Satelliten (`/nc-<name>:doku-sync`, eigener Session-Start), mit **eigenem** mechanischem Wächter `test/wissensbasis.test.mjs`. Kein Kern-Artefakt pflegt eine Satelliten-Wissensbasis |
| **Auslieferung** | Beim Satelliten fährt die Wissensbasis im Paket mit (`abteilungs-plugin-bau.md` §1a). Sie ist deshalb **Arbeitsmaterial des Repos, nie Laufzeit-Abhängigkeit** eines Skills — ein Skill, der sie zum Laufen braucht, ist falsch gebaut |
| **Quellenangabe statt Pfad** | Der Satellit darf die Standardprozesse dieses Repos **benennen** („die Standardprozesse im OS-Repo"), aber nie als Lesepfad führen. Maschinenpfade auf einen Kern-Checkout sind verboten |

**Repo-interne Abteilungsplugins erben nichts** — für sie ist die Wissensbasis dieses Repos
zuständig. Die Vererbung gilt nur für eigenständige Satelliten mit eigener Kontroll-Schicht.

### 4a. Isolations-Invariante — was hier bewusst NICHT gebaut wird

**Ein Satellit schreibt nie in Kerndokumente** — weder direkt noch über eine Vorstufe. Daraus
folgt zwingend, was **nicht** existiert: keine **Kandidaten-Queue**, keine Kriterienliste, kein
**Kurationslauf**, keine **Promotion**-Pipeline, kein Cross-Satelliten-Zugriff. Das ist kein
„noch nicht", sondern gegenstandslos: Eine Queue ist die Warteschlange **vor einem
Schreibvorgang in den Kern**; fällt der Schreibvorgang weg, hat sie keinen Gegenstand mehr.

Konkret heißt das:

- **`bauplan-archiv/` ist Historie, keine Staging-Fläche.** Das Vorbild begründet den Ordner
  zusätzlich als Quelle Richtung Kern; **diese Begründung wird gestrichen.** Der Ordner bleibt
  aus eigenem Recht: Nachvollziehbarkeit abgeschlossener Vorhaben.
- **Kein Feld, kein Format, kein Ablageort** für weitergereichte Einträge entsteht — auch nicht
  „reserviert". Ein reservierter Platz ist eine halbe Warteschlange und lädt zum Auffüllen ein.
- **Keine Leseanweisung über die Repo-Grenze**, in keine Richtung: Ausgelieferte
  Satelliten-Dateien benutzen keinen Kern-Checkout als Pfad, und kein Kern-Artefakt liest eine
  Satelliten-Wissensbasis. Der Kern kennt vom Satelliten nur Marketplace-Pin und Registry-Zeile.
- **Was bleibt, ist Redaktionsdisziplin ohne Mechanik** (§1): „Kern verlinkt, Abteilung
  dokumentiert".

Braucht der Kern später doch Satellitenwissen, ist das eine **eigene Nachiteration mit eigener
Konzeption und eigener Maintainer-Entscheidung** — kein Nebenbei-Schritt und nichts, wofür man
heute etwas offenhält.

## 5. Tragende Anti-Drift-Prinzipien

- **Eine Quelle je Fakt.** Abgeleitete Dokumente deklarieren sich als abgeleitet; bei Widerspruch
  gewinnt die Quelle, nie die Ableitung.
- **Historisch bleibt historisch.** Protokolle, Archiv und Norm-Alttext werden nie rückwirkend
  umgeschrieben; nachgezogen werden ausschließlich lebende Dokumente.
- **Gleicher Change, gleiche Pflege.** Nachzüge passieren in derselben Änderung — „später" ist
  der Anfang jeder Drift. Ausnahme mit Protokollzwang: `sync-nachzug-bauzyklus.md`.
- **Mechanisch erzwingen, was erzwingbar ist**; der Rest steht als Selbsttest in der Matrix.
- **Keine Behauptung ohne Gegenprobe** — „behoben" oder „grün" nur mit gesehener Ausgabe.
- **Quelle schlägt Gedächtnis.** Wer aus einem Vorbild portiert, liest die Datei aus dessen
  `origin/main` (`git show "origin/main:<pfad>"`), statt sie zu rekonstruieren.

## 6. Replikation für eine neue Instanz

1. Grundkategorien ans Firmenwissen anpassen: umbenennen ja, das Prinzip je Kategorie beibehalten.
2. Vorhandene Wissensquellen (Wikis, Laufwerke, Ticketsysteme) über Fremdsystem-Beschreibungen
   **anbinden**, nicht kopieren — die Wissensbasis orchestriert Quellen, sie dupliziert sie nicht.
   Eine solche Kategorie entsteht erst mit dem ersten realen Inhalt.
3. Indizes und Wächter **ab Tag 1** (Schritte 1 und 2 vor jedem Inhalt).
4. Reihenfolge, Formate und Fehlerbilder aus der ersten Instanz übernehmen; jede Abweichung
   begründen, statt sie zu übergehen.

---

*Angelegt 2026-08-11 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
`grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md`, AP2). Quelle:
`Onsite.ai-OS@5d335a7` `kern-ssot-aufbau.md`, gelesen aus `origin/main`. §4 ersetzt die dortige
„Plugin-Verknüpfungsvorbereitung" durch Struktur-Vererbung plus Isolations-Invariante — der harte
Ausschluss des Bauplans, hier positiv begründet.*
