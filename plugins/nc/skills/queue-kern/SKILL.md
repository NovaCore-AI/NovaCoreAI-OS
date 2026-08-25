---
name: queue-kern
description: >-
  Liest die gemergte Kandidaten-Queue der Abteilung, prüft je offener Zeile die
  Firmenrelevanz-Kriterien und die No-Duplicate-Regel gegen die Kern-Wissensbasis, entwirft je
  angenommener Zeile das Kern-Dokument samt Index-Zeile und erstellt EINEN Promotions-PR gegen
  das Kern-Repo — mit dem Prüfprotokoll als committeter Datei und im PR-Text. Im Folgelauf
  wertet er je Zeile den gemergten Inhalt der entschiedenen Promotions-PRs aus und schreibt den
  Marker in die Queue zurück. Kennt einen Dry-Run ohne jede Schreibaktion. Zweite Station des
  Queue-Flows (14-tägiger Takt), einen Tag nach /nc:queue-abteilung. Trigger-Begriffe: „Queue
  in den Kern befördern", „queue-kern", „Promotions-PR", „Kern-Aufstieg", „Kandidaten
  befördern", „Queue-Marker zurückschreiben".
---

# /nc:queue-kern — Aufstieg der Kandidaten in die Kern-SSOT

## Zweck

Zweite Station des Queue-Flows (Standardprozess `queue-flow.md` des OS-Repos): Was
`/nc:queue-abteilung` als Zyklus-PR eingereicht hat und der Mensch gemergt hat, wird hier auf
Firmenrelevanz geprüft und als **fertiger Promotions-PR** ans Kern-Repo gestellt. Der Lauf
liegt **einen Tag nach** `/nc:queue-abteilung`, weil er ausdrücklich den **gemergten**
Queue-Stand liest (Versatz-Regel). **Kuration ist kein Skill:** Der Skill bereitet vor und
protokolliert seine Prüfung; die Annahme-, Verdichtungs- und Ablehnungsentscheidung fällt im
GitHub-Review des Menschen (Rolle: Admin), damit Ablehnungsgründe im PR nachlesbar bleiben —
das Warum steht im Definitionsdokument `NovaCore-OS-Kriterienliste-Definition.md` des
OS-Repos. Daraus folgt die Leitregel des Folgelaufs: **Der gemergte Inhalt ist das Ledger,
nicht der PR-Zustand** — ein PR-Gesamtstatus kann eine zeilenweise Entscheidung grundsätzlich
nicht abbilden. Der Skill gehört zum WP8-Zyklus (WP-Rahmen `wp-rahmen.md` dieses
Kern-Plugins). **Auslösung über denselben Session-Start-Fälligkeits-Hook** wie
`/nc:queue-abteilung` (`nc-queue-faelligkeit.js` dieses Kern-Plugins, 14-Tage-Takt plus ein
Tag Versatz, Bauplan Phase J AP A2): Er weist die Session an, den fälligen Lauf **jetzt**
vorzubereiten — selbst ausführen oder einen Subagenten beauftragen; ein manueller Aufruf
ohne fällige Erinnerung bleibt möglich.

**Heutiger Übergangszustand (E1):** Solange keine Abteilung einen Satelliten hat, bricht der
Lauf in Schritt 2 mit dem Übergangs-Befund ab — die Übergangs-Queue im OS-Repo läuft über
dessen regulären Branch/PR-Fluss.

## Ablauf

1. **Modus festlegen und ansagen:** **Dry-Run**, wenn der Aufruf ihn nennt („Probelauf",
   „Dry-Run") **oder** wenn `~/.claude/nc/queue-lauf.json` für **`queue-kern`** noch keinen
   Zeitstempel trägt — genau das heißt „kein Lauf belegt": der **eigene** Eintrag, nie der von
   `queue-abteilung` (dessen Stempel entsteht in jedem Zyklus zuerst und machte den Schutz
   wirkungslos). Dieser Erstlauf-Default ist **überstimmbar**: Nennt der Aufruf ausdrücklich
   den Vollauf („jetzt Vollauf", „Vollauf ausführen"), läuft der Vollauf auch ohne vorhandenen
   Stempel — ohne diesen Override wäre er unerreichbar, denn der Stempel entsteht erst nach
   einem Vollauf (Schritt 14) und ein **Dry-Run stempelt nie**. Im Dry-Run wird alles erhoben
   und protokolliert, aber nichts am Working Tree, an Branches, an der Queue oder auf dem
   Remote geschrieben, kein Branch angelegt, kein PR erstellt — die `git fetch`-Aufrufe der
   Schritte 4–5 laufen wie im Vollauf und aktualisieren dabei ausschließlich den lokalen
   Remote-Spiegel (`origin/*` unter `.git/`), nie den Working Tree.
   Sonst Vollauf. Der gewählte Modus steht als erste Zeile des Ergebnisses — samt der Regel,
   über die er bestimmt wurde (Aufruf, fehlender Eigen-Stempel oder Vollauf-Override).
2. **Pfade auflösen — ausschließlich über die Infra-Registry:** `kernRepoPfad` und den
   Abteilungs-Klon aus `abteilungsRepoPfade` in `~/.claude/nc/infra.json` (Schema:
   `skills/setup/infra-registry.md` dieses Kern-Plugins — `kernRepoPfad` ist ein
   **Arbeitsklon** des OS-Repos, niemals die read-only-Lesekopie unter `kernSsotPfad`), dazu
   `queuePfad` und `kriterienVerweis` aus der `pflege-auspraegung.json` an der Wurzel des
   installierten Abteilungsplugins (Schema und Auflösungsregel:
   `referenz/pflege-auspraegung.md` dieses Kern-Plugins). **Nie raten, nie einen Ersatzort
   anlegen.** Fehlbilder getrennt melden und abbrechen: Registry oder Ausprägung fehlt →
   Setup-Befund, `/nc:setup` ausführen · Abteilungs-Eintrag fehlt oder steht auf
   `"ausstehend"` → die Abteilung hat keinen Satelliten, ihre Übergangs-Queue geht über den
   regulären Fluss ihres Repos, nicht über diesen Skill · `kernRepoPfad` fehlt → auf dieser
   Maschine ist kein Kern-Arbeitsklon registriert; der Aufstiegslauf gehört auf eine Maschine
   mit Arbeitsklon (Rolle: Admin/Maintainer) · Pfad eingetragen, aber Queue-Datei nicht auf
   der Platte → toter Eintrag, per `/nc:setup` reparieren („Platte schlägt Registry").
3. **Remote-Identität beider Klone prüfen — vor jedem Fetch und jedem Push:** je Klon
   `git -C <pfad> remote get-url origin` erheben und gegen die erwartete Owner/Repo-Identität
   halten: Kern-Klon → `NovaCore-AI/NovaCoreAI-OS`, Abteilungs-Klon → das
   **`repository`-Feld** des Abteilungs-Eintrags in der `module-registry.json` dieses
   Kern-Plugins. **Nie** die Identität aus dem Namensfeld `abteilung` interpolieren: Die
   Registry führt dort Kleinbuchstaben (`development`), die Repos heißen anders — ein
   wörtlicher Schema-Vergleich bräche jeden Lauf am intakten Klon ab. Verglichen wird Owner
   und Repo-Name **case-insensitive**, nicht die URL-Form (SSH wie HTTPS zulässig,
   `.git`-Suffix egal). Fehlt das `repository`-Feld, hat die Abteilung keinen Satelliten —
   das fängt bereits Schritt 2; ein eingetragener Pfad **ohne** Registry-`repository` ist ein
   Befund, kein Rateanlass. **Weicht die Identität ab oder fehlt der Remote: hart
   abbrechen** — kein Fetch, kein Commit, kein Push, kein PR. Eine stale oder falsch
   reparierte Registry würde Commits sonst in ein **fremdes** Repository schieben, und ein
   Push ist nicht zurücknehmbar.
4. **Kern-Klon vorprüfen, bevor irgendeine Datei angefasst wird (nur lesend):**
   `git -C <kern> fetch origin`, dann `git -C <kern> status --porcelain` und
   `git -C <kern> rev-list --left-right --count origin/<standardbranch>...HEAD` — der Kern-Klon
   muss **exakt** auf `origin/<standardbranch>` stehen (beide Zählwerte `0`; NC-Verschärfung
   gegenüber dem Vorbild, das nur Divergenz ausschloss): `ahead > 0` hieße, fremde lokale
   Commits reisen in den Promotions-PR ein; `behind > 0` hieße, Entwurf und
   No-Duplicate-Prüfung liefen gegen einen veralteten Kern-Stand. In beiden Fällen
   **abbrechen** mit Befund — `pull`, `rebase` und `reset` sind rote Linien
   dieses Skills, den Klon bringt der Mensch in Ordnung. Dieser Schritt steht **vor** jeder
   Schreibaktion, auch vor dem Marker-Schreiben in Schritt 7: Eine Prüfung, die erst nach den
   ersten Dateiänderungen liefe, prüft nichts mehr.
   **Sauberkeit heißt hier: sauber in den Zielpfaden dieses Laufs** (die entworfenen
   Kern-Dokumente, ihre Index-Zeilen, die Protokolldatei). Fremde uncommittete Arbeit
   **außerhalb** dieser Pfade führt **nicht** zum Abbruch — sie wird im Ergebnis namentlich
   genannt und bleibt unangetastet. Grund: Der Kern-Klon ist auf der Maintainer-Maschine
   zugleich **Werkstatt** (`skills/setup/infra-registry.md`, S2); eine
   Vollständig-sauber-Bedingung ließe den Skill dort praktisch immer abbrechen. Die Sicherheit
   trägt stattdessen Schritt 10: Vor dem Schreiben wird der `status --porcelain`-Stand als
   **Baseline** protokolliert; nach dem Schreiben wird ausschließlich das **Delta gegenüber
   dieser Baseline** geprüft. Fremde, uncommittete Arbeit **außerhalb** der Zielpfade bleibt
   unverändert unangetastet und ist **kein** Abbruchgrund — Schritt 10 bricht nur ab, wenn
   **neue** Änderungen außerhalb der geplanten Pfade entstehen. Liegt fremde Arbeit **in**
   einem Zielpfad, wird abgebrochen — dort wäre nicht mehr unterscheidbar, was der Lauf und
   was der Mensch geschrieben hat.
5. **Gemergten Queue-Stand lesen (nur lesend):** im Abteilungs-Klon `git -C <pfad> fetch
   origin`, dann die Queue aus `origin/<standardbranch>` lesen
   (`git -C <pfad> show "origin/<standardbranch>:<queuePfad>"`) — **nur** der gemergte Stand
   ist Grundlage. Lokale, noch nicht gemergte Zeilen werden nicht befördert, sondern gezählt
   und im Ergebnis benannt. Enthält der gemergte Stand **keine** Zeile mit Status `offen`:
   **No-op** — Meldung „nichts zu befördern", **kein Leer-PR**, Ende.
6. **Entschiedene Läufe erheben — primär aus dem Ledger, nicht aus dem PR-Index:** Das Ledger
   der gemergten Läufe liegt im Merge-Stand des Kern-Klons (des OS-Repos) selbst:
   `git -C <kern> show "origin/<standardbranch>:knowledge-base/queue-protokolle/"` listet
   **alle** gemergten Prüfprotokolle — vollständig, ohne GitHub, ohne Trunkierung; gelesen
   werden die Protokolle **dieser Abteilung** (der Dateiname trägt sie). Jede dort geführte
   Zeile ist entschieden — das ist die Grundlage des Doppelbeförderungs-Abgleichs in Schritt 7,
   konsistent zur eigenen Leitregel („der gemergte Inhalt ist das Ledger, nicht der
   PR-Zustand"). **GitHub (`gh`) kommt nur für das dazu, was im Merge-Stand nicht stehen
   kann:** (i) **offene** Promotions-PRs dieser Abteilung — ist einer offen, wird kein zweiter
   erstellt: Lage melden, Ende (ein PR je Lauf); (ii) Läufe, deren ursprünglicher Head
   (`headRefOid`) **lokal nicht lesbar** ist — gleich ob der PR gemergt ist (etwa nach
   Squash-Merge mit gelöschtem Branch) oder ohne Merge geschlossen — : Ihr
   Ablehnungs-/Verdichtungsprotokoll existiert dann nur im PR-**Text**, der stattdessen
   gelesen wird (`gh pr view <n> --json body`, per Design aus Schritt 9). Der Fallback gilt
   ausdrücklich für **jeden** nicht lesbaren Head: Das Verdichtungssignal in Schritt 7 braucht
   den PR-Kopf-Inhalt auch bei gemergten PRs. Ist der Head nicht lesbar **und** der PR-Text
   nicht abrufbar, gilt jede nur dort geführte Zeile als **ungeklärt** — melden, kein Marker
   (fail-closed statt fälschlich `abgelehnt`); (iii) die **PR-Nummer und der
   `mergeCommit`** je gemergtem Protokoll für die Marker und die Dokument-Prüfung
   (`gh pr view <n> --json state,mergeCommit,headRefOid`). Jede `gh pr list`-Abfrage trägt
   einen Filter mit der **Abteilung** (Branch-Präfix `queue-kern/<abteilung>/`, ersatzweise
   der Abteilungsname im Titel — **nie** nur „Queue-Aufstieg": Sonst blockiert ein offener PR
   einer anderen Abteilung diese) **und** ein `--limit` deutlich über dem realen Bestand
   (z. B. `--limit 200`) oder Pagination — der stillschweigende Default von 30 Einträgen
   verschluckt ältere Läufe, und eine dort abgelehnte Zeile würde erneut vorgeschlagen.
   **Fehlt `gh` oder die Autorisierung, wird der Lauf hier abgebrochen** — nicht „sauber
   offen" weitergearbeitet: Ohne GitHub sind offene PRs und ohne Merge geschlossene Läufe
   unsichtbar, und die Klassifikation in Schritt 8 liefe ohne vollständigen
   Doppelbeförderungs-Abgleich. Ist ein Protokoll weder im Merge-Stand noch im PR-Kopf
   auffindbar, gilt der PR als **ungeklärt** — melden, keine Marker.
7. **Je Protokollzeile am Merge-Stand auswerten und Marker setzen.** Maßgeblich ist das
   **Dokument**, nicht die Index-Zeile und nicht der PR-Gesamtstatus:
   - Zieldokument im Merge-Stand vorhanden (`git -C <kern> show <mergeCommit>:"<pfad>"` liefert
     Inhalt) → `befördert (PR #n)`.
   - Dokument fehlt → `abgelehnt (PR #n)`. Das Streichen einer Datei im Review **ist** die
     maschinenlesbare Einzelablehnung; der Merge bestätigt sie ausdrücklich mit.
   - PR ohne Merge geschlossen → jede seiner Zeilen `abgelehnt (PR #n)`; eingezogen ist nichts.
   - Dokument vorhanden, obwohl das Protokoll „abgelehnt" sagt → `befördert (PR #n)`: Der
     Kurator hat es selbst ergänzt, die Präsenz-Regel liest das richtig.
   - **Widerspruch ⇒ melden, keinen Marker setzen, nie raten.** Als Widerspruch gilt: der
     Merge-Stand trägt ein neu hinzugekommenes Kern-Dokument, das **keine** Protokollzeile als
     Ziel nennt (das typische Bild der **Verdichtung** — der Kurator lässt Dokument A in B
     aufgehen, das Protokoll sagt „angenommen", A fehlt) · oder Dokument und Index-Zeile
     widersprechen einander (eins da, das andere nicht) · oder das Protokoll fehlt im
     Merge-Stand, obwohl der PR gemergt ist. Hier setzt der Mensch genau **einen** Marker von
     Hand — es ist der einzige Fall, den die Maschine nicht wissen kann.
   - **Verdichtungssignal:** Wer beim Review verdichtet, streicht die betreffende
     **Protokollzeile** mit. Stand eine Zeile also im PR-Kopf (`headRefOid`) und fehlt im
     Merge-Stand, ist das **eindeutig Verdichtung** — melden, keinen Marker setzen, den
     Hand-Marker des Menschen anfordern. Ohne dieses Signal wäre „A ging in ein anderes
     akzeptiertes Dokument desselben Laufs auf" von einer schlichten Ablehnung nicht zu
     unterscheiden, und der Skill schriebe `abgelehnt`, bevor der Mensch eingreifen kann.

   **Doppelbeförderung schließen (vor jeder Klassifikation):** Jede Zeile, die in
   **irgendeinem** dieser Protokolle steht, ist bereits entschieden — sie bekommt nur ihren
   Marker und wird **nie neu klassifiziert**, auch wenn die gemergte Queue sie noch als `offen`
   führt (der Marker reist erst mit dem nächsten `/nc:queue-abteilung`-Lauf ein). Die
   No-Duplicate-Prüfung aus Schritt 8 fängt das **nicht**: Sie erkennt nur wieder-beförderte
   **angenommene** Zeilen, deren Dokument existiert; eine **abgelehnte** Zeile würde sonst
   jeden Zyklus erneut vorgeschlagen. Zeilen-Identität ist **Datum + Einzeiler**; treffen
   mehrere Queue-Zeilen auf dieselbe Identität, ist das ein Befund — melden statt Marker raten.
   **Vor dem Marker-Schreiben die lokale Queue-Datei prüfen:**
   `git -C <pfad> diff origin/<standardbranch> -- "<queuePfad>"` — weicht sie über bereits
   lokal gesetzte Marker früherer Läufe hinaus ab (fremde uncommittete Edits), werden die
   Marker **zurückgestellt** und ein Sync-Befund gemeldet; fehlt eine Zielzeile lokal, wird
   kein Marker geraten, sondern gemeldet.
   In der Queue-Datei wird **ausschließlich die Status-Spalte** der betroffenen Zeile geändert;
   nie löschen, umschreiben, umsortieren. Der Skill **committet und pusht diese Änderung
   nicht** — sie reist mit dem nächsten `/nc:queue-abteilung`-Lauf ein. Bleibt danach **keine**
   zu prüfende Zeile übrig: Marker sind gesetzt, **kein PR**, Ende.
8. **Je verbliebener offener Zeile prüfen (Prüfprotokoll mitschreiben):** (i) **Kriterien** —
   die per `kriterienVerweis` geltende Liste; ohne eigene Abteilungsliste die Kriterien a–d
   **und** die Gegenkriterien GF1–GF4 aus `referenz/pflege-auspraegung.md` dieses
   Kern-Plugins. (ii) **No-Duplicate gegen die Kern-SSOT (GF4, Pflichtprüfung):** im Kern-Klon
   zuerst über den SSOT-Document-Index der Wissensbasis triagieren (`knowledge-base/` des
   OS-Repos), dann gezielt in der Zielkategorie suchen. Existiert der Inhalt bereits, wird die
   Zeile **nicht** befördert — Fundstelle als Begründung protokollieren. Jede Zeile endet als
   **angenommen** oder **abgelehnt** mit einem Satz Begründung; im Zweifel abgelehnt.
9. **Kern-Beitrag entwerfen und das Prüfprotokoll als Datei schreiben:** Je angenommener Zeile
   die Zielkategorie nach Teil 1 des SSOT-Document-Index bestimmen, das Kern-Dokument dort
   anlegen **und** die zugehörige Zeile in Teil 2 des Index ergänzen (Link, Status, „Relevant
   wenn …"). Inhalt ist **Einzeiler + Verweis auf die Abteilungsquelle** — „Kern verlinkt,
   Abteilung dokumentiert", nie eine Volltext-Kopie.
   **Das Protokoll ist Pflicht und der Ankerpunkt des Folgelaufs:** Es entsteht im Kern-Klon
   (dem Klon des OS-Repos) als Datei
   `knowledge-base/queue-protokolle/queue-protokoll-<abteilung>-<YYYY-MM-DD>.md`
   und trägt je geprüfter Zeile Identität (Datum + Einzeiler), Entscheid
   (angenommen/abgelehnt), Begründung und — bei Annahme — den **repo-relativen
   Ziel-Dokumentpfad**, exakt so geschrieben, wie die Datei angelegt wurde (Schritt 7 liest
   genau diesen Pfad). **Existiert für diese Abteilung und dieses Datum bereits ein
   Protokoll** (im Merge-Stand, im Working Tree oder als offener PR — zweiter Lauf am selben
   Tag), **abbrechen und Entscheidung einholen, bevor irgendetwas geschrieben wird** — die
   Branch-Prüfung in Schritt 12 käme dafür zu spät. Der PR-Text trägt dasselbe Protokoll; die Datei ersetzt er nicht.
   Auch die Protokolldatei ist eine Wissensdatei des Kern-Repos: Was Teil 1 des Index für die
   Kategorie vorschreibt (eigene Zeile in Teil 2 oder Sammelverweis), wird in **derselben**
   Änderung mitgezogen — die Testsuite des Kern-Repos erzwingt Index-Vollständigkeit.
   **Erstlauf-Pflichten (nur wenn dies das erste Protokoll der Kategorie ist, d. h. der
   Merge-Stand enthält nur die `PLATZHALTER.md`):** Die Platzhalterdatei **löschen** und Teil 2
   des Index auf die echte Protokoll-Tabelle umstellen — beides fordert die `PLATZHALTER.md`
   selbst; ohne Löschung verletzt der Lauf die testerzwungene Platzhalter-Invariante. Löschung
   und Umstellung sind **geplante Pflichtänderungen dieses Laufs** — sie gehören in Schritt 10
   ausdrücklich zur erwarteten Änderungsmenge, nicht zu den ungeplanten Befunden.
   **Ein reiner Ablehnungslauf hat damit trotzdem einen Diff** — das Protokoll — und erzeugt
   deshalb einen PR; ohne ihn gäbe es keine PR-Nummer für die Ablehnungs-Marker. No-op bleibt
   allein die leere Queue (Schritt 5) und „nichts mehr zu prüfen" (Schritt 7).
10. **Nachprüfen, dass ausschließlich Geplantes geändert ist:** `git -C <kern> status
    --porcelain` gegen die **Baseline aus Schritt 4** halten — neu geändert sein dürfen
    **nur** die entworfenen Kern-Dokumente, ihre Index-Zeilen, die Protokolldatei und die
    Erstlauf-Pflichten aus Schritt 9 (Platzhalter-Löschung, Index-Umstellung). Jede weitere
    **neue** Änderung ist ein Befund: **abbrechen**, nichts wegwerfen, nichts zurücksetzen.
    In der Baseline bereits vorhandene fremde Änderungen bleiben unangetastet — sie waren
    erlaubt und sind kein Abbruchgrund.
11. **Secrets-Preflight — vor Commit, Push und `gh pr create`:** alle Inhalte prüfen, die den
    Klon verlassen (Queue-Einzeiler, Begründungen, Zieldokumente, Protokolldatei, Commit-Betreff,
    PR-Titel und -Text): Token- und Schlüsselmuster (`gh[pousr]_`, `sk-`, `AKIA`,
    `-----BEGIN … PRIVATE KEY-----`, lange Hex-/Base64-Ketten), Credential-URLs
    (`https://<nutzer>:<geheimnis>@…`), Kundendaten und absolute Benutzerpfade (`C:\Users\…`,
    `/home/…`, `/Users/…`). **Treffer ⇒ die betroffene Zeile nicht übernehmen und den Lauf
    abbrechen** — nicht stillschweigend filtern, nicht maskieren: Der Fund gehört dem Menschen
    gemeldet, denn die Quelle steht in der Queue und muss dort korrigiert werden. Eine
    Prosa-Regel ohne eigenen Prüfschritt hat diesen Fall nie erwischt.
12. **Branch, Commit, Push — Push nur mit Freigabe** (offener Entscheid zur stehenden
    Queue-Flow-Freigabe, siehe Regeln): Branch `queue-kern/<abteilung>/<YYYY-MM-DD>` im Kern-Klon anlegen
    — die Abteilung gehört in den Namen, sonst kollidieren zwei Abteilungen am selben Tag —,
    die entworfenen Dokumente, Index-Zeilen und die Protokolldatei committen (Nachricht nennt
    die beförderten Queue-Zeilen; **nie `git add -A`, immer die explizite Pfadliste**),
    `git -C <kern> push -u origin queue-kern/<abteilung>/<YYYY-MM-DD>` — normaler Push, nie
    mit `--force`. Existiert der Branch bereits, wird er **nicht** überschrieben: Lage melden
    und Entscheidung einholen.
13. **Einen Promotions-PR erstellen:** `gh pr create` gegen den Standardbranch des Kern-Repos.
    Titel `Queue-Aufstieg <YYYY-MM-DD> — <Abteilung>` (der Abteilungsname im Titel trägt den
    Suchfilter aus Schritt 6 mit); der PR-Text trägt das **vollständige Prüfprotokoll** und
    nennt den Pfad der Protokolldatei (PR-Body immer per `--body-file`). Fällt `gh` erst
    **hier** aus (in Schritt 6 war es verfügbar, sonst wäre der Lauf dort abgebrochen — dieser
    Fallback deckt nur den Ausfall zwischen den Schritten): Branch ist gepusht, der PR-Schritt
    wird **sauber als offen** ausgewiesen (samt Web-URL zum Anlegen von Hand);
    Doppelbeförderungs-Abgleich und Marker aus Schritt 6/7 sind in diesem Lauf bereits
    erledigt. Nichts wird geraten.
14. **Lauf-Marker setzen (schließt den Fälligkeits-Kreis):**
    `node "<hooks-Pfad>/nc-queue-faelligkeit.js" --lauf queue-kern` ausführen — derselbe Hook,
    der beim Sitzungsstart erinnert, führt den 14-Tage-Takt in `~/.claude/nc/queue-lauf.json`.
    **Ohne diesen Schritt erinnert er nach einem erfolgreichen Lauf weiter**, bis der Nutzer
    ihn abschaltet. Erst **nach** dem PR-Schritt stempeln, und **nur im Vollauf** — ein
    **Dry-Run stempelt nie**, sonst gälte eine Probe als erledigter Zyklus-Lauf und der
    nächste echte Lauf würde 14 Tage lang nicht erinnert. (Bleibt allein der PR-Schritt
    manuell offen — Schritt-13-Fallback —, wird trotzdem gestempelt: Der Marker bezeugt den
    gelaufenen Zyklus, und die Fälligkeits-Mechanik erinnert über die noch nicht gemergten
    Commits ohnehin weiter, bis der Merge da ist — dokumentierte Eigenschaft in
    `queue-flow.md` des OS-Repos.)
15. **Ergebnis ausgeben:** Modus, gelesener Queue-Stand (Commit des gemergten Stands), Zahl
    geprüfter/angenommener/abgelehnter Zeilen, gesetzte Marker, **ungeklärte Zeilen samt
    Widerspruchsgrund**, Branch, Protokollpfad, PR-Nummer/URL oder der offene Rest-Schritt —
    plus der Hinweis, dass Review und Merge beim Menschen (Rolle: Admin) liegen und die
    Marker-Änderung im Abteilungs-Klon auf `/nc:queue-abteilung` wartet.

## Regeln

- **Nie mergen — und Push/PR nur mit Freigabe.** Eine stehende Freigabe für die PR-Erstellung
  (wie im Vorbild in dessen Ebene-1-Payload) hat NovaCore **nicht** — sie ist ein offener
  Maintainer-Entscheid (`queue-flow.md` des OS-Repos, Abschnitt „Offene Punkte"); bis dahin
  holt der Lauf vor Push und `gh pr create` die ausdrückliche Freigabe des Menschen ein.
  Merge, Review-Resolves und alles Kundensichtbare bleiben immer beim Menschen — auch bei
  einem trivialen PR, auch nicht per Auto-Merge-Flag.
- **Nie force-pushen, nie History umschreiben** (kein `rebase -i`, kein `reset --hard`, kein
  `commit --amend` auf gepushten Stand) und nie im Kern-Klon aufräumen, was der Mensch nicht
  freigegeben hat.
- **Kein Netzzugriff ohne geprüfte Remote-Identität** (Schritt 3) und **keine Dateiänderung vor
  der Klon-Vorprüfung** (Schritt 4).
- **Kein PR ohne Protokolldatei** — sie ist der Ankerpunkt des Folgelaufs, nicht Beiwerk zum
  PR-Text.
- **Nie raten, wo Protokoll und Merge-Stand auseinandergehen.** Widersprüchliche Zeilen bleiben
  ohne Marker und werden gemeldet; den einen Marker der Verdichtung setzt der Mensch.
- **Keine Schreibrechte in fremde Arbeits-Repos.** Geschrieben wird ausschließlich im
  Kern-Klon (Branch + PR) und — als reine Marker-Änderung ohne Commit — in der Queue-Datei des
  eigenen Abteilungs-Klons. Bugs und Findings fremder Repos gehören nie in diesen Flow (GF1).
  Kollegen-OS-Satelliten (Felix-OS, Biggi-OS) sind NIE Gegenstand dieses Skills (I8).
- **Queue append-only.** Zulässig ist einzig der Statuswechsel einer bestehenden Zeile; nie
  löschen, nie umschreiben, nie umsortieren. Eine Korrektur ist eine neue Zeile.
- **Kein Volltext im Kern** — Einzeiler + Verweis; die Quelle bleibt in der Abteilung.
- **Nichts raten.** Fehlende Registry, Ausprägung, Queue oder GitHub-Autorisierung sind
  Befunde mit Handlungsschritt, kein Anlass für Ersatzorte, geschätzte Pfade oder erfundene
  PR-Nummern.
- **Keine Secrets, Tokens, Kundendaten oder personenbezogenen Pfade** in Dokument, Protokoll,
  Commit oder PR-Text — geprüft wird das in Schritt 11, nicht nur behauptet.
- **Ein PR je Lauf**, und keiner, solange ein Promotions-PR **dieser Abteilung** offen ist.

## Verifikation

- Der Modus steht im Ergebnis; im Dry-Run belegen `git -C <kern> status --porcelain` und
  `git -C <pfad> status --porcelain`, dass **keine** Datei angefasst wurde, und `gh pr list`
  zeigt keinen neuen PR.
- `git -C <kern> remote get-url origin` und `git -C <pfad> remote get-url origin` stehen mit
  der erwarteten Owner/Repo-Identität im Ergebnis — sonst ist der Lauf hier abgebrochen.
- `git -C <pfad> show origin/<standardbranch>:<queuePfad>` belegt, welcher **gemergte** Stand
  gelesen wurde (Commit-SHA im Ergebnis nennen).
- Je entschiedenem Vorlauf-PR belegt `git -C <kern> show <mergeCommit>:"<pfad>"` pro
  Protokollzeile Vorhandensein oder Fehlen des Zieldokuments — der gesetzte Marker entspricht
  genau diesem Befund, ungeklärte Zeilen tragen **keinen** Marker.
- Für jede angenommene Zeile existiert im Branch genau ein Zieldokument **und** eine neue
  Index-Zeile in Teil 2, dazu genau **eine** Protokolldatei des Laufs
  (`git -C <kern> show --name-only --pretty=format: HEAD`) — und nichts sonst.
- Der Diff der Queue-Datei zeigt ausschließlich Statuswechsel: gleiche Zeilenzahl, je
  geänderter Zeile nur die letzte Spalte anders (`git -C <pfad> diff -- <queuePfad>`).
- `git -C <kern> rev-parse --abbrev-ref HEAD` liefert `queue-kern/<abteilung>/<YYYY-MM-DD>`.
- `gh pr view --json number,url,state` (bzw. die gemeldete offene Alternative) belegt genau
  **einen** neuen PR im Zustand `OPEN`; sein Text enthält je geprüfter Queue-Zeile eine
  Protokollzeile mit Entscheid und Begründung.
- Die Zahl der Protokollzeilen in Datei und PR-Text stimmt mit der Zahl der in Schritt 8
  geprüften Zeilen überein — keine Zeile wurde stillschweigend übergangen.
- Der Secrets-Preflight ist belegt: geprüfte Musterklassen und Ergebnis („kein Treffer" bzw.
  die abgebrochene Zeile) stehen im Ergebnis.
- Im Vollauf ist der **Lauf-Marker gesetzt**: Bestätigungszeile von
  `nc-queue-faelligkeit.js --lauf queue-kern` liegt vor, `~/.claude/nc/queue-lauf.json` trägt
  für `queue-kern` das heutige Datum. Im **Dry-Run ist er ausdrücklich nicht gesetzt** — die
  Datei ist unverändert (per Zeitstempel oder Diff belegen).
