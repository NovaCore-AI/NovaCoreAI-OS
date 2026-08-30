# Debug-Log — gefundene und behobene Bugs

> Gegenstück zum [Fehlerprotokoll](agent-learnings.md): Dort stehen die **eigenen** Fehler des
> Agenten, hier die **gefundenen Bugs und Fehlbefunde** an Code, Konfiguration, Doku und
> Vorbildern — unabhängig davon, wer sie verursacht hat. Vor jeder neuen Fehlersuche zuerst hier
> die Symptome abgleichen: Ein bekanntes Symptom spart die halbe Analyse.
>
> **Append-only.** Nie rückdatieren, nie umschreiben. Wird ein Eintrag später widerlegt oder
> ergänzt, entsteht ein **neuer** Eintrag, der auf den alten verweist.
>
> Format pro Eintrag: **Datum · Symptom · Ursache · Fix · Beleg** — das ist das **Minimum**.
> Trägt ein Fall mehr, sind weitere Felder erlaubt (etwa *Wirkung*, wenn die Folge nicht aus dem
> Symptom folgt, oder *Präventionsregel*, wenn sich aus dem Bug eine Regel ableiten lässt).

## Einträge

### 2026-08-14 — Start-Gate blockte seinen eigenen Pflicht-Einstieg (Read-only-Git-Allowlist zu eng)

- **Symptom:** `/nc:start` (WP0) war in einer Linux-Session nicht ausführbar: das
  Start-Gate lehnte selbst read-only Git-Aufrufe ab — kombinierte Befehle, Befehle mit
  Pfadwechsel (`cd <repo> && git status`, `git -C <dir> status`), `git worktree list`
  und `git status -sb`. Nur nacktes `git status` im aktuellen Verzeichnis ging durch.
- **Ursache:** `isReadOnlyGitIntrospection()` in `plugins/nc/hooks/lib/bash-analyse.js`
  (geteilt von FFG und Start-Gate) lehnte jede Kommandozeile mit `;&|` pauschal ab,
  las das Subkommando blind als `tokens[1]` (globale Optionen wie `-C <dir>` brachen
  die Erkennung, obwohl `findGitSubcommand()` dafür existierte) und kannte `worktree`
  sowie kombinierte Kurzflags (`-sb`) nicht. Die Allowlist war gegen den Upstream-Stand
  gehärtet, aber nie gegen den **eigenen** Pflicht-Einstieg aus `AGENTS.md` geprüft
  worden (`git worktree list` + `git status --short` je Worktree).
- **Fix:** Segmentweise Prüfung (quote-aware Zerlegung an unquoted `;`, `&`, Newline):
  jedes Segment muss reiner Pfadwechsel (`cd <pfad>`, ein Argument, keine Flags) oder
  allowlistetes Git-Kommando sein; Subkommando-Ermittlung über `findGitSubcommand()`;
  `worktree list` und Kurzflags aus {s, b} ergänzt; Pipes/Redirects/Substitutionen
  bleiben per unquoted-Scan ausgeschlossen. Kern 0.7.1.
- **Beleg:** Reproduktion per `node -e` vor dem Fix (6 von 9 Pflicht-Einstieg-Formen
  geblockt); write-first-Tests in `nc-ffg.test.mjs`/`nc-start-gate.test.mjs` (vor Fix
  rot, nach Fix grün); Negativproben (`git -C … push`, `worktree remove`, Verkettung
  mit `rm -rf`, Pipe, Redirect) gaten weiter; Suite 97/97 grün.
- **Wirkung:** Der Bug saß auch im FFG-Durchlass (gleiche Lib) — dort fiel er nur
  nicht auf, weil das Routine-Gate ohnehin einmal je Session feuert. Die Satelliten
  (`nc-felix`, `nc-biggi`) tragen eigene FFG-Kopien mit demselben Stand: **je eigener
  Fix-Vorgang dort** (kein Rück-Nachzug vom Kern).
- **Präventionsregel:** Allowlist-Härtungen an Sicherheitsgates immer gegen die
  **eigene** vorgeschriebene Nutzung testen (hier: der Pflicht-Einstieg aus
  `AGENTS.md`), nicht nur gegen den Upstream-Befund.

### 2026-08-12 — Drei Wächter-Invarianten prüften weniger, als ihr Name zusagte

- **Symptom:** `plugins/nc/tests/struktur.test.mjs` meldete grün für Datenlagen, die die
  jeweilige Regel klar verletzen. Drei Fälle, alle mit Gegenprobe belegt:
  **(a)** Die neue Invariante „jede Kategorie ist im Routing erfasst" blieb grün, **nachdem** die
  Teil-1-Routing-Zeile für `ideen-backlog/` gelöscht war. **(b)** Zwei Dateien mit echtem Inhalt,
  benannt `PLATZHALTER.md`, in den **nicht** leeren Kategorien `grundwissen/` und
  `standardprozesse/` liefen an der Indexpflicht vorbei. **(c)** Für den Platzhalter
  `{{ABTEILUNG}}` in `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` beruft sich der
  Aktualisierungs-Index auf die Invariante „Vorlage ist kein Plugin" — die prüfte ihn nie.
- **Ursache:** **(a)** Volltextsuche nach dem in Backticks gesetzten Kategorienamen über die
  **ganze** Index-Datei statt über den Abschnitt Teil 1. Ein Kategoriename steht dort mehrfach: in der
  Mapping-Tabelle, in der Spalte „gehört nicht hierher" fremder Zeilen und in den
  Teil-2-Überschriften — jede dieser Nennungen hielt den Test grün. **(b)** Die
  `PLATZHALTER.md`-Ausnahme war **unbedingt** implementiert, obwohl sie an drei Stellen
  **bedingt** dokumentiert ist („solange leer" · „sobald das erste Dokument hier liegt, wird
  diese Datei gelöscht" · „`PLATZHALTER.md` entfernen, sobald die erste echte Idee liegt").
  **(c)** Der Test las nur `plugin.json.vorlage`; die zweite Vorlagendatei war nie erfasst.
- **Wirkung:** Alle drei sind stille Ausfälle — die Suite bleibt grün, während die Regel
  praktisch verschwindet. Bei (b) kommt eine Umgehung hinzu: Wissen entkommt der Indexpflicht,
  indem es `PLATZHALTER.md` heißt; die Triage sieht es nie.
- **Fix:** (a) Prüfung auf den Abschnitt Teil 1 eingeschränkt und auf eine echte
  **Tabellenzeile** verschärft (Zeilenanfang `|` plus Kategoriename), plus Guard, der rot wird,
  falls die Überschrift „## Teil 1 …" verschwindet (sonst prüfte die Invariante wieder nichts). (b) Ausnahme gilt nur, wenn
  `PLATZHALTER.md` der **einzige** Eintrag seines Ordners ist — damit erzwingt der Test die
  dokumentierte Bedingung. (c) Die Vorlagen-Invariante deckt jetzt beide Vorlagendateien ab.
- **Beleg:** Gegenprobe je Fall vor und nach dem Fix, Ausgabe zitiert: vorher „✔ … Kategorie ist
  im Routing erfasst" bzw. „✔ … jede Wissensdatei ist indiziert" trotz kaputter Datenlage;
  nachher „✖ Kategorie ohne Routing-Zeile in Teil 1: ideen-backlog" bzw. „✖ nicht im
  SSOT-Document-Index.md erfasst: grundwissen/PLATZHALTER.md, standardprozesse/PLATZHALTER.md"
  bzw. „✖ ssot-grundgeruest.md.vorlage ohne Platzhalter {{ABTEILUNG}}". Volllauf danach:
  93 Tests grün.
- **Präventionsregel:** Eine neue Invariante wird **mit** ihrer Gegenprobe geliefert: Datenlage
  gezielt verletzen, roten Lauf zitieren, zurücksetzen. Und: Prüft ein Test einen Textabschnitt,
  wird der Abschnitt **abgegrenzt** und seine Existenz mitgeprüft — eine Volltextsuche über ein
  Dokument, das denselben Begriff mehrfach führt, prüft die Regel nicht, sondern nur das Vokabular.

### 2026-08-12 — Vier lebende Dokumente sagten zu, `kern-plugin-bau.md` trage die Git-Historie

- **Symptom:** `AGENTS.md`, `CHANGELOG.md`, `SSOT-Document-Index.md` und der Kopf von
  `kern-plugin-bau.md` behaupteten, die Kernhälfte der Zweiteilung trage „per `git mv` die
  Historie" des früheren `plugin-bau.md`. `git log --follow` auf die Datei liefert **nur** den
  Zweiteilungs-Commit.
- **Ursache:** Git speichert kein Rename; die Zuordnung entsteht **inhaltsbasiert beim Lesen**.
  Der größere Textanteil des Vorgängers liegt in `abteilungs-plugin-bau.md` (Rename-Erkennung:
  43 %), der Kernteil ist überwiegend neu geschrieben. Bei der Standardschwelle (50 %) erkennt
  Git gar kein Rename — dann gilt `plugin-bau.md` als gelöscht. `git mv` ist Komfort für
  `mv` + `git add` und sichert nichts zu.
- **Wirkung:** Der Prüfbefehl, den die Drift-Regel in `AGENTS.md` vorschreibt, widerlegt die
  eigene Zusage. Wer die Vorgeschichte einer Kernregel sucht, geht mit leerem Ergebnis weg.
- **Fix:** Alle vier Fundstellen auf den belegten Zustand korrigiert und um den Weg ergänzt, der
  die Historie wirklich liefert (`git log --oneline -- knowledge-base/standardprozesse/plugin-bau.md`);
  Abweichung von AP1.1/E2 als **Plan-Nachtrag N4** dokumentiert. Kein History-Rewrite (rote Linie
  §7) — und eine Rename-Zuordnung ließe sich ohnehin nicht verordnen.
- **Beleg:** `git log --follow --oneline -- .../kern-plugin-bau.md` → ein Commit ·
  `git diff origin/main HEAD --summary -M -- knowledge-base/standardprozesse/` → `create`/`delete`,
  kein Rename · `... -M5% --summary` → `rename {plugin-bau.md => abteilungs-plugin-bau.md} (43%)` ·
  `git log --oneline -- .../plugin-bau.md` → vollständige Kette bis `b04cc0d`.
- **Präventionsregel:** „Trägt die Historie" ist keine planbare Eigenschaft eines `git mv`, sondern
  ein Messergebnis. Nach dem Commit mit `git log --follow` prüfen und das **Ergebnis** hinschreiben,
  nie die Absicht.

### 2026-08-11 — Vorbild-Regel „ref/SHA-Pin klont nur das Plugin-Subverzeichnis" ist falsch

- **Symptom:** Der Prozesskorpus des Vorbilds (`Onsite.ai-OS@5d335a7`,
  `abteilungs-plugin-bau.md` §1) begründet die Auslieferungsgrenze eines Satelliten damit, dass
  Claude Code bei einem `ref`/`sha`-Pin einen **sparse clone nur des Plugin-Subverzeichnisses**
  mache. Der Bauplan 2026-08-11 hat diese Begründung in §1d übernommen; AP1.3 sollte sie als
  „Sparse-Clone-Regel" nach NovaCore portieren.
- **Ursache:** Verwechslung zweier Mechaniken. Der sparse/partial clone hängt am **Source-Typ
  `git-subdir`** („Claude Code uses a sparse, partial clone to fetch only the subdirectory") bzw.
  am Opt-in-Flag `claude plugin marketplace add … --sparse <paths…>` — **nicht** am Pin. Ein
  `github`-Source mit `ref`/`sha`, die Pin-Form beider NovaCore-Satelliten, klont das ganze Repo
  („Git-based marketplaces clone the entire repository"). Die reale Grenze entsteht erst beim
  Install: „when users install a plugin, Claude Code copies **the plugin directory** to a cache
  location" (`~/.claude/plugins/cache`).
- **Wirkung:** Die **Schlussfolgerungen** des Bauplans blieben richtig (Kern: nur `plugins/nc/`
  wird kopiert, also kommt `knowledge-base/` nie mit; Satellit: Repo-Wurzel ist das
  Plugin-Verzeichnis, also fährt die Wissensbasis mit). Falsch war allein die Begründung — die
  aber hätte bei einem Wechsel auf `git-subdir` zur gegenteiligen Konsequenz geführt.
- **Fix:** `abteilungs-plugin-bau.md` §1a heißt jetzt **Auslieferungsgrenze (Kopie des
  Plugin-Verzeichnisses)** und nennt die belegte Mechanik samt Tabelle je Source-Typ; die beiden
  verbreiteten Irrtümer sind dort ausdrücklich ausgeräumt. Plan-Nachtrag **N3** dokumentiert die
  Abweichung vom Vorbild.
- **Beleg:** offizielle Doku `plugin-marketplaces`, abgerufen 2026-08-11 über
  `code.claude.com/docs/en/plugin-marketplaces` (die frühere Adresse
  `docs.claude.com/en/docs/claude-code/plugin-marketplaces` antwortet mit `301` auf diesen Host).
  Gegengeprüft in `.claude-plugin/marketplace.json`: NovaCore benutzt keinen
  `git-subdir`-Source — Kern relativ (`./plugins/nc`), Satelliten `github` + `ref` + `sha`.
- **Präventionsregel:** Aus einem Vorbild wird der **Inhalt** übernommen, nicht dessen Beleglage.
  Trägt eine portierte Regel eine Mechanik-Begründung mit Abrufdatum, wird die Quelle **vor** dem
  Port erneut abgerufen — auch dann, wenn das Vorbild sie erst kürzlich geprüft hat.

### 2026-08-30 — OAI-Prozessumstellung ohne Index-Nachzug: fünf Suite-Tests rot

- **Symptom:** Nach den Maintainer-Commits `57e5368` (Jira-Workflow) und `626d0c6`
  („Standardprozesse auf OAI-Struktur umgestellt", Umbenennungen u. a.
  `team-distribution.md` → `claude-team-distribution.md`, `ssot-aufbau.md` →
  `kern-ssot-aufbau.md`, `aktualisierungs-index.md` → `Aktualisierungs-Index.md`, Ersatz
  `os-bau-methode.md` → `skill-bau.md`) war die Suite mit **fünf** roten Tests auf `main`:
  zwei SSOT-Document-Index-Invarianten (tote Pfade, fehlende Zeilen), Sucheindex-Pfad-
  Invariante, T-7 Takt (queue-flow.md hatte den Wochentakt des Onsite-Vorbilds übernommen
  statt der Firmenspezifikation N6 „14-tägig") und Drift-Invariante 2 (drei `matrixKey`-
  Anker des Pfad-Änderungsindex passten nicht mehr zur neuen Änderungs-Matrix).
- **Ursache:** Strukturumstellung direkt auf `main` ohne den durch die Änderungs-Matrix
  erzwungenen Nachzug (SSOT-Index, wissen-sucheindex.json, pfad-aenderungsindex.json,
  AGENTS/README-Verweise) — und der Port brachte Onsite-Instanz-Bezüge mit (Wochentakt,
  `/oai:`-Skill-Namen, Onsite-Pfade), die der NovaCore-Produktrealität (14-Tage-Hook
  `nc-queue-faelligkeit.js`, `/nc:`-Skills, `~/.claude/nc/`) widersprechen.
- **Fix:** Release-Nachzug 2026-08-30 (Branch `chore/release-0.15.1`): Index-Zeilen
  umgestellt/ersetzt, beide Hook-Indizes nachgezogen, queue-flow.md auf 14-Tage-Takt und
  `/nc:`-Realität zurückgestellt, AGENTS.md/README.md-Verweise repariert. Suite wieder grün
  (352 Pass/0 Fail). Onsite-Instanz-Bezüge in den portierten Prozessen (v. a. §6-Historie in
  `queue-flow.md`, `claude-team-distribution.md`, Spec-§15-Referenzen) bleiben als **benannte
  Lücke** im PR-Memo offen.
- **Beleg:** `node --test plugins/nc/tests/*.test.mjs` vor/nach dem Nachzug (5 Fail → 0 Fail);
  `plugins/nc/hooks/nc-queue-faelligkeit.js` Zeile 171 (`FAELLIG_NACH_MS = 14 * TAG_MS`,
  Firmenspezifikation N6).
- **Präventionsregel:** Umbenennungs-/Ersetzungs-Kommitts auf `main` laufen vor dem Push einmal
  durch die Suite — genau die vier Invarianten (Index-Vollständigkeit, Link-Gültigkeit,
  Sucheindex-Pfade, matrixKey-Anker) decken diesen Fehlertyp ab. Und: Beim Port von
  Vorbild-Prozessen werden Takts- und Namensangaben gegen die eigene Produktrealität
  gegengeprüft (Hook-Konstanten, Skill-Namespace), bevor sie übernommen werden.
