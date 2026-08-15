# SSOT-Document-Index — Master-Index aller Dokumente und Ordner

> **Zweck:** Der **Master-Index der Wissensbasis** — die Single Source of Truth darüber, welche
> Dokumente und Ordner es gibt. Zwei Fragen, ein Dokument: **wohin** gehört ein Dokument
> (Teil 1: Ordner-Routing) und **wann** wird eine vorhandene Quelle gebraucht (Teil 2:
> Quellen-Triage). Der Index ist das **einzige Dokument auf der Wurzelebene** der Wissensbasis.
>
> **Benutzung:** Vor dem Anlegen, Verschieben oder Löschen eines Dokuments Teil 1 lesen; vor
> dem Griff in eine Kategorie Teil 2 überfliegen. „Relevant wenn …" nennt die
> Abruf-**Situation**, nicht den Inhalt — triagieren statt Volltexte lesen.
>
> **Nicht hier, sondern im Schwesterdokument:** *was* eine Änderung alles anfassen muss
> (Version, Release, Tag, Protokolle, Tests) steht im
> [`Aktualisierungs-Index`](standardprozesse/aktualisierungs-index.md). Dieser Index sagt,
> **welches** Dokument existiert und wann es gebraucht wird; jener sagt, **was** mitzuändern
> ist. Reihenfolge: erst hier triagieren, dann dort den Änderungsumfang bestimmen.
>
> **Pflege:** Jede neue, verschobene oder gelöschte Wissensdatei wird in derselben Änderung
> hier nachgezogen; `plugins/nc/tests/struktur.test.mjs` erzwingt Vollständigkeit,
> Linkgültigkeit und die Wurzel-Regel.
>
> **Nicht indiziert (bewusst):** `docs/superpowers/specs/` — historische v0.1.0-Design-Spec
> außerhalb der Wissensbasis, bleibt unverändert · die Alt-Backups `_wzs-*-backup-*/`
> (Aufräum-Kandidat des Maintainers).

## Ordner-Mapping zum Onsite-Vorbild

NovaCore nutzt eine **flachere** Struktur als das Vorbild `Onsite.ai-OS`. Wer beide Repos
kennt, findet sich mit dieser Zuordnung zurecht:

| Onsite | NovaCore |
|---|---|
| `project-meta-infos/` | `grundwissen/` |
| `plugin-maintanance-ruleset-source/` | `standardprozesse/` |
| `Debugging + findings/` | `debugging-findings/` |
| `Aktive Baupläne/` | `grundwissen/` — laufende Pläne mit Datumspräfix; die jüngste Datei ist der aktuellste Planungsstand. Dauerhafte Referenzen (ohne Datumspräfix) liegen im selben Ordner |
| `Bauplan-archiv/` | `bauplan-archiv/` — seit 2026-08-11 vorhanden (Entscheid E1, [Bauplan §9 N1](grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md)); die frühere Regel „kein eigener Ordner" ist damit überholt |
| `Feature-idea-backlog/` | `ideen-backlog/` — seit 2026-08-11 vorhanden (Entscheid E1), seit 2026-08-15 mit Inhalt: sieben aus dem Vorbild portierte Ideen. Übernommen wurde ausschließlich der **generische** Teil; Ideen mit Bezug auf fremde Organisationen, Kunden oder deren Zugänge bleiben dort (dieses Repo ist öffentlich) |
| `feature-manuals/`, `sitzungswissen/` | nicht vorhanden: Fremdsystemwissen entsteht erst mit Inhalt; Sitzungswissen liegt in `.nc/erinnerung/` des **Arbeits-Repos**, nicht hier |

## Teil 1 — Ordner-Routing: wohin gehört ein Dokument

| Ordner | Gehört hierher | Gehört **nicht** hierher | Lebenszyklus |
|---|---|---|---|
| `grundwissen/` | Zweierlei: **(a) dauerhafte Referenzen** ohne Datumspräfix — Produktvision, Begriffsnormen, Definitionsdokumente (je Thema eins); **(b) datierte Design-Specs und laufende Baupläne** mit Präfix `YYYY-MM-DD-` — je Vorhaben ein Dokument | Standardprozesse (→ `standardprozesse/`) · Protokolle (→ `debugging-findings/`) · **abgeschlossene oder verworfene Pläne** (→ `bauplan-archiv/`) · Ideen ohne Auftrag (→ `ideen-backlog/`) | Referenzen werden lebend gepflegt (hohe Aufnahmehürde: wenige, dafür tragende Dokumente). Datierte Pläne werden **nicht** rückwirkend umgeschrieben; ist ein Vorhaben abgeschlossen oder verworfen, wird sein Plan **pflichtgemäß** per `git mv` nach `bauplan-archiv/` verschoben (Entscheid E1, 2026-08-11) — sonst verliert der Ordner seine Aussage „das läuft gerade". Der Session-Start-Hook listet die jüngsten fünf |
| `bauplan-archiv/` | Abgeschlossene oder verworfene Baupläne und Design-Specs, **unverändert übernommen** | laufende Arbeit (→ `grundwissen/`) · Prozesswissen (→ `standardprozesse/`) | Zugang **nur** aus `grundwissen/`. Inhalt wird nicht mehr fortgeschrieben (historisch). **Terminal:** keine Quelle Richtung Kern oder Satelliten — es gibt keine Kandidaten-Queue und keine Promotion (Invariante I1 des Bauplans 2026-08-11) |
| `ideen-backlog/` | Ideen ohne aktuellen Auftrag — je Idee ein Dokument mit Datumspräfix | beauftragte Vorhaben (→ Bauplan in `grundwissen/`, der auf die Idee verweist) | Lebend. Eine Idee ist **kein** Bauplan: keine Arbeitspakete, keine Abnahmekriterien, keine Testfälle. Wird sie beauftragt, entsteht ein Bauplan in `grundwissen/`, der auf sie verweist — die Idee **bleibt** liegen (Herkunft ≠ Arbeit). Der `PLATZHALTER.md` ist mit dem ersten echten Eintrag am 2026-08-15 entfallen. **Portierte Ideen** tragen im Kopf die Herkunft und den Vermerk, was gegen dieses Repo nachverifiziert wurde |
| `standardprozesse/` | Die operativen Standardprozesse zum Instandhalten und Erweitern von Repo und Marketplace: Plugin-/Skill-Bau, Satelliten, Versionierung, Doku-Sync — samt der Frage, welche Dokumente voneinander abhängen und was wo mitzuupdaten ist | Verhalten von Fremdsoftware · Einzelvorhaben (→ `grundwissen/`) | Lebend. Fehlt ein wiederkehrender Prozess, wird er **nach der ersten Ausführung** hier dokumentiert |
| `debugging-findings/` | Die **zwei** laufenden Protokolle in Append-Form mit Kurzinfo „was wann wie": **Fehlerprotokoll** `agent-learnings.md` (eigene Fehler der KI bei der Arbeit) und **Debug-Log** `debug-log.md` (gefundene und behobene Bugs, auch an fremdem Material) | Prozesswissen · Pläne · Ideen | **Append-only** — Einträge werden nie rückdatiert oder umgeschrieben; ein widerlegter Eintrag bekommt einen **neuen**, der auf ihn verweist |
| `firmenkernprozesse/` | Firmenexterne Prozess- und Produktdokumente des **Onsite.ai-OS-Vorbilds** und der eigenen Firmenebene, die als Referenz für Ausrichtung und Abgleich dienen: Prozesskarten (Bau- und Pflegeprozesse des Vorbilds), Team-Rollout-Infrastruktur, Feature-/Berichts- und Methodik-Dokumente | NovaCore-eigene normative Prozesse (→ `standardprozesse/`) · Pläne (→ `grundwissen/`) · Protokolle (→ `debugging-findings/`) | Lebend, aber **fremdgeführt**: Inhalte werden nicht hier umgeschrieben, sondern bei neuem Vorbild-Stand als Ganzes aktualisiert; bei Widersprüchen zu NovaCore-Doku gilt die NovaCore-Quellen-Hierarchie |
| `knowledge-base/` (Wurzel) | **Ausschließlich dieser Index.** | alles andere | testerzwungen (Wurzel-Regel) |

## Teil 2 — Quellen-Triage: wann welche Quelle

### `grundwissen/` — Vision, Begriffsnormen, Design-Specs und Baupläne

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Produktarchitektur](grundwissen/NovaCore-OS-Produktarchitektur.md) | lebend | die sechs Schichten der Produktvision erklärt oder gegen einen Plan gehalten werden sollen — Referenz für Vision-Abgleiche |
| [SSOT-Definition](grundwissen/NovaCore-OS-SSOT-Definition.md) | lebend | der Begriff „SSOT" gebraucht, erklärt oder abgegrenzt wird — normative Begriffsquelle (Wortbedeutung, Definition, Ebenen, Funktionen) **inklusive** der verbindlichen Abgrenzung firmenintern ↔ affiliate: kein Memory-Share zwischen Satelliten, keine Queue/Promotion |
| [Gates-Definition](grundwissen/NovaCore-OS-Gates-Definition.md) | lebend | die vier Gates der Kontroll-Schicht erklärt, abgegrenzt oder referenziert werden sollen — Definitionstabelle (Zweck, Mechanik, Menschkontakt, Status, Opt-out) samt Begriffsklärung „FFG 1–3 = Sub-Gates von Gate 1" und den Abgrenzungen Gate 1↔3, Basis-Gate↔Domänen-FFG, Gate 2↔4 |
| [CLAUDE-Ebenen-Definition](grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md) | lebend | die CLAUDE.md-Ebenen erklärt, abgegrenzt oder referenziert werden sollen — normative Begriffsquelle (Ebenen 0/1/2/3/3b mit Träger, Update-Kanal, Owner, Präzedenzregel, NC-Marker-Konvention der Privat-Zone, Kanal-Regel) |
| [Anker-Reservierung-Definition](grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md) | lebend | begründet werden soll, **warum** knappe Bezeichner vor dem Bau reserviert werden — Begriffsnorm „Anker" (Wert folgt dem Zählstand, nicht dem Inhalt), die sechs Kollisionsklassen mit Schadensbild, warum eine Liste die Reservierung nicht trägt (Sichtbarkeit, Durchsetzung) und ein Git-Ref schon (atomar, merge-frei, als Ref-Pattern vom Schutz ausnehmbar), die Rollenteilung frühe Reservierung ↔ späte Testsuite-Invariante sowie die Abgrenzungen zu Worktree-Isolation, Merge-Konflikt, Release-Tag, Registry-Feld `reservierungen` und Kontroll-Schicht |
| [SSOT-Provisionierung — Bauplan 2026-08-10](grundwissen/2026-08-10-ssot-provisionierung-bauplan.md) | lebend | am Setup-Mechanismus gearbeitet wird oder die Frage aufkommt, **wie die Wissensbasis überhaupt auf den Rechner kommt** — verifizierte Ausgangslage (was das Plugin ausliefert und was nicht), die Entscheidung für Weg B (lokaler Klon statt Auslieferung im Plugin), Ablageort und Fast-Forward-Regel sowie die bewusst dokumentierte Grenze bei Nutzern ohne git/Zugang |
| [Onsite-Align-Umbau — Bauplan 2026-08-10](grundwissen/2026-08-10-onsite-align-umbau-bauplan.md) | lebend | am Umbau nach dem Onsite-Vorbild gearbeitet wird — **hier zuerst**: verifizierte Ausgangslage, verbindliche Rename-Regeln, die Arbeitspakete AP1–AP8 in Baureihenfolge, die harten Ausschlüsse (keine Queue/SSOT-Abstufung, kein Memory-Share) und die roten Linien der Umsetzung |
| [Prozesskorpus-Nachzug + Satelliten-SSOT — Bauplan 2026-08-11](grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md) | lebend | der Bau-/Prozesskorpus des Onsite-Vorbilds nachgezogen wird (Zweiteilung `plugin-bau`, `ssot-aufbau`, `sync-nachzug-bauzyklus`, Vorlage `ssot-grundgeruest`) **oder** ein Satellit seine eigene Wissensbasis bekommt — trägt die harten Invarianten I1–I7 (Review-Fokus: **Isolation der Satelliten-SSOT** und korrektes Fail-open), die Arbeitspakete in drei Spuren und den verbindlichen Delegationsschnitt für externen Parallelbau (Kimi K3) |
| [Onsite-Endstand-Nachbau — Bauplan 2026-08-15](grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md) | lebend | der Onsite-Endstand 0.22.0 (alles ab Onsite 0.16.0 plus nie übernommene Ältere: `init`-Reconciler, Residenzpflicht, `update-doks`) nachgebaut wird — **hier zuerst**: verifizierte Ausgangslage samt Mechanik- und Prozesskorpus-Delta, sechs Phasen A–F in Zwangsreihenfolge (SSOT-Kern zuerst, Abteilungs-Skills zuletzt), Invarianten I1–I9 (Review-Fokus: **Härtungs-Erhalt** und Fail-Richtungen je Hook), Testfälle T1–T21 und die offenen Maintainer-Entscheide E1–E6 (Queue-Scope, Sitzungswissen im öffentlichen Repo, Rename `end-session`); adversarial Opus-reviewt am 2026-08-15 (20 Findings eingearbeitet) |
| [**NovaCore Agent SDK & UI (`nc-web`) — Bauplan 2026-08-16**](grundwissen/2026-08-16-novacore-agent-sdk-gui-architektur.md) | lebend (Konzeption; gehärtet durch 3 Subagenten-Reviews 2026-08-16) | eine eigene Desktop-/Web-UI für NovaCore-OS oder ein Custom-Agent-SDK-Host gebaut wird — **hier zuerst**: 4-Schichten-Modell, Prozess-Lifecycle (Win32 Job Objects / PR_SET_PDEATHSIG), dynamische Modell- & Thinking-Budget-Wahl, `canUseTool`-Approval-Brücke (Default-Deny), 100% Gate-Fidelity (FFG v2, Start-Gate, Safety-Gate, PreCompact), RAF 60fps Coalescing und 14 Test-Invarianten INV-01–INV-14 |
| [Multi-Plugin-Architektur — Design-Spec 2026-07-28](grundwissen/2026-07-28-multi-plugin-architektur-design.md) | lebend | der Multi-Plugin-Schnitt begründet oder fortgeschrieben werden muss (Marketplace, Kern + Abteilungen, Versionsmodell); die Nachträge §10 (Felix-Satellit) und §11 (Biggi-Satellit) tragen den Satelliten-Stand |

### `bauplan-archiv/` — abgeschlossene Vorhaben

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Umbau-Plan 2026-07-28](bauplan-archiv/2026-07-28-umbau-plan.md) | historisch | nachvollzogen werden soll, wie der Multi-Plugin-Umbau schrittweise ausgeführt wurde (abgeschlossen; am 2026-08-11 aus `grundwissen/` hierher verschoben) |

### `ideen-backlog/` — Ideen ohne Auftrag

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Anti-Drift-Prüfung der Indizes](ideen-backlog/2026-08-09-anti-drift-pruefung-der-indizes.md) | lebend (Idee offen) | eine automatisierte Kohärenz-Prüfung von Aktualisierungs-Index und SSOT zur Debatte steht — Versionen, Zahlen und Standsaussagen gegen den Repo-Stand; empfohlener Schnitt: Mechanik als Test-Invarianten, Semantik per kleinem Modell oder Prüf-Subagent |
| [Release-Branch-Modell (Live-/Entwicklungslinie)](ideen-backlog/2026-08-10-release-branch-modell-live-dev.md) | lebend (Idee offen) | zur Debatte steht, wie ein Stand ans Team gelangt — heute zieht der Marketplace `nc`/`nc-development` aus `main`, jeder Merge erreicht sofort jede Maschine; das Dokument beschreibt die getrennte Live-Linie samt Umfang, Reihenfolge-Frage und Gegenargumenten |
| [Extraktion `nc-development` in ein Satelliten-Repo](ideen-backlog/2026-08-10-dev-plugin-satelliten-extraktion.md) | lebend (Idee offen) | zur Debatte steht, `nc-development` in ein eigenes Repo zu lösen — Motiv (Kern- von Abteilungs-Governance trennen), Rückstellungsgründe (SHA-Pin-Friktion) und die **Abgrenzung §3a ↔ §3b**, die den Fall von `nc-felix`/`nc-biggi` unterscheidet |
| [FFG-Nachbesserungen (Upstream-Drift, Windows, NotebookEdit)](ideen-backlog/2026-08-10-ffg-nachbesserungen-upstream-windows-notebookedit.md) | lebend (Idee offen) | der FFG-Port gegen das GateGuard-Vorbild gepflegt oder gehärtet wird — **alle drei Lücken sind gegen unseren Code belegt**: fehlender Upstream-Drift-Detektor (Pin nur im Kommentar), fehlende Windows-Destruktivmuster, `NotebookEdit` ohne Datei-Gate |
| [Executor-Delegation + fremde Agenten-CLIs](ideen-backlog/2026-08-10-executor-delegation-und-fremdagenten-integration.md) | lebend (teils erledigt) | die Delegation bulkiger Schreibarbeit oder die Rolle der Affiliate-Plugins zur Debatte steht — hält fest, dass Teil A bereits Standardprozess ist (`sync-nachzug-bauzyklus.md` §2) und welche vier Klärungen zu Fremdanbietern **offen** bleiben (Verteilbarkeit, AGPL-Copyleft, DSGVO) |
| [Web-GUI `/nc:web` — Nachtrag v0.3 (SDK-Pivot)](ideen-backlog/2026-07-22-nc-web-gui-design-nachtrag-v0.3-sdk-pivot.md) | lebend (Idee offen) | die Web-GUI aufgegriffen wird — **hier zuerst**: Standalone-SDK-App statt Plugin-Feature, Approval-Brücke über `canUseTool`, Übersetzungstabelle kimi→Claude. SDK-Belege stammen von 2026-07-22 und sind vor Umsetzung neu abzurufen |
| [Web-GUI `/nc:web` — Design-Spec v0.1/v0.2](ideen-backlog/2026-07-22-nc-web-gui-design.md) | historisch | nur die Vorgeschichte des Web-GUI-Vorhabens oder die Reuse-Map des Read-only-Viewers gebraucht wird; der geltende Stand steht im Nachtrag v0.3 |

### `standardprozesse/` — verbindliche Abläufe

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [**Aktualisierungs-Index**](standardprozesse/aktualisierungs-index.md) | lebend | **irgendetwas im OS geändert wird** — die Nachschlageliste gegen Vergessen: je Änderungsart, welche Dokumente vorher eingelesen und welche in derselben Änderung nachgezogen werden, samt Version, Release, Tag, Protokoll- und Indexpflichten, Prüfzyklus und Selbsttest |
| [Anker-Reservierung](standardprozesse/anker-reservierung.md) | lebend | **mehr als eine Arbeitseinheit gleichzeitig am OS baut** (zwei Sessions, Worktrees oder beauftragte Agenten) — die Handgriffe vor der ersten Zeile: §1 was ein Anker ist (Ziel-Version, Skill-/Agent-/Hook-Name, Abteilungsname, Nachtrags-/AP-Kennung) und was **nicht** reserviert wird · §2 Ablauf fetch → ls-remote → ableiten → annotiert taggen → pushen, `already exists` als Normalfall · **§3 Freigabe: bei NovaCore je Push einzeln, solange Entscheid E4 vertagt ist** · §4 Aufräum-Pflicht nach Merge oder Verwerfen · §5 Branch-Protection-Ausnahme für `refs/tags/reserve/*` · §6 Auflösungsregel für kollidierende Sammelstellen · §7 Verhältnis zur späten Anker-Invariante der Testsuite. Das **Warum** steht stattdessen in der [Anker-Reservierung-Definition](grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md) |
| [Kern-Plugin-Bau](standardprozesse/kern-plugin-bau.md) | lebend | am **Kern-Plugin `nc`** gearbeitet wird — Scope-Tabelle (was gehört in den Kern), **Governance-Zwei-Schichten-Tabelle §1a** (team-shared ↔ individuell, Prüfungs-Eigentum), Bauablauf, **Standardprozess Doks-Autosync §2a** (Marker-Chirurgie, Idempotenz über den Versions-Stempel, atomarer Write, fail-safe bei defekten Markern), die nur den Kern bindenden Regeln inkl. der **Mindest-Client-Schwellen**, offene Gates 3/4. Hervorgegangen aus der Zweiteilung des früheren `plugin-bau.md` (2026-08-11); dessen Git-Historie hängt an **keiner** der beiden Hälften — Vorgeschichte über den alten Pfad lesen (`git log --oneline -- knowledge-base/standardprozesse/plugin-bau.md`, Plan-Nachtrag N4) |
| [Abteilungs-Plugin-Bau](standardprozesse/abteilungs-plugin-bau.md) | lebend | an einem **Abteilungsplugin oder Satelliten** gearbeitet wird: §1 Architektur-Invarianten · **§1a Auslieferungsgrenze** (was beim Nutzer wirklich ankommt — Kopie des Plugin-Verzeichnisses, nicht sparse clone) · §2 harte Mechanik-Fakten · §3 neue Abteilung im Repo · §3a Satelliten-Extraktion · **§3b eigenständiges Kollegen-OS** (pilotiert mit `nc-felix`, inkl. der vier verifizierten Install-Fallen) · §4 Fehlertabelle |
| [Abteilungs-Inhalts-Prüfung](standardprozesse/abteilungs-inhalts-pruefung.md) | lebend | die **Inhalte** eines Abteilungsplugins oder Kollegen-OS-Satelliten wiederkehrend gegen Normlage und verifizierte Fachfakten geprüft werden sollen — Inhalts-Schwester der Struktur-Testsuite (nur Form): zwei unabhängige Läufe (Soll-Anforderungsregister mit Beleg je Anforderung · Ist-Inventur gegen die 12-Punkte-Checkliste), Synthese in einen Bauplan (Sofort-Fixes vs. **Kommende Änderungen** mit benannter Abhängigkeit), Anker-Bedarf-Prüfung, Persistenz-Pflicht der Rohdaten als Bauplan-Anhänge, read-only; Erstanwendungsfall `nc-development` vor der Phase-3-Modernisierung |
| [Subagenten-Bau](standardprozesse/subagenten-bau.md) | lebend | ein **Subagent** (`agents/*.md`) in einem Plugin angelegt oder geändert wird — §2 Faustregel Agent-vs-Skill („im Zweifel Skill") · §3 Scope Kern/Abteilung, Prüfungs-Eigentum, flaches Layout, verbotene Frontmatter-Felder, `isolation` gesperrt bis Team-Mindestversion ≥ 2.1.210 · §4 der 7-Schritt-Ablauf mit **Negativprobe** · §6 rote Linien und die harte Schreibsperren-Regel · §7 YAML-Falle der Auto-Delegation · **§8 Gate-Semantik am realen Code belegt** (Datei- und Start-Gate greifen für Subagenten nicht, Destruktiv-Gate bleibt scharf) · §9 Mitwander-Regel des portablen Prüfbausteins. Das **Dateiformat** regelt stattdessen `agent-authoring.md` des Kern-Plugins |
| [Team-Distribution](standardprozesse/team-distribution.md) | lebend | die Verteilung des OS an das Team über den Claude-Team-Workspace ansteht oder nachvollzogen wird — Admin-Seite (Ebene-0-Textentwurf, Atlassian/Jira-Connector mit Jira-Zwei-Stufen-Regel, öffentliche Marketplace-Quelle), Kollegen-Seite (Verweis auf `ONBOARDING.md`), Update-Workflow samt der zwei bekannten Anthropic-Auto-Update-Bugs (#49410, #60219), Koexistenz (Dev-Checkout vs. installierte Version, `nc` nie parallel zu `nc-felix`/`nc-biggi`) und die Abgrenzungsmatrix Claude Team vs. OS-Domäne — generisch gemappt aus der externen Prozesskarte 06 (Onsite: GitLab, privates Repo) auf NovaCore (GitHub, Atlassian/Jira, öffentliches Repo) |
| [SSOT-Aufbau](standardprozesse/ssot-aufbau.md) | lebend | eine **Wissensbasis** aufgebaut, erweitert oder repliziert wird — die sieben Grundbausteine, der Aufbau-Ablauf (Kategorien und Routing vor jedem Inhalt), **§4 Struktur-Vererbung an Satelliten** und **§4a die Isolations-Invariante** (warum es keine Warteschlange Richtung Kern gibt), Anti-Drift-Prinzipien, Replikationsanleitung |
| [CLAUDE-Netz-Bau](standardprozesse/claude-netz-bau.md) | lebend | an einer **CLAUDE-Ebene, ihrem Payload oder ihrer Verdrahtung** gearbeitet wird — Instruktions-Schwester von `ssot-aufbau.md`: §2 Ebenen-Prinzip 0/1/1b/2/3/3b mit NC-Ist-Status, Kanal-Regel und **`@`-Import-Mechanik** (max. vier Hops, Nutzer-Scope dialogfrei, Import spart keinen Kontext) · §3 Bau-Ablauf (Ebenen-Definition → Verteilweg → Lese-Verdrahtung → Vorlagen-Baustein → Matrix → Verifikation) · §4 **Pfad-Matrix** Quelle → Zielort → Leser → Kanal · §7 Replikation · §8 die bewussten Abweichungen vom Vorbild. Die Autosync-/Privat-Zonen-Mechanik steht **nicht** hier, sondern in `kern-plugin-bau.md` §2a |
| [Sync-Nachzug je Bauzyklus](standardprozesse/sync-nachzug-bauzyklus.md) | lebend | ein Bauzyklus mehrere abhängige Dokumente betrifft — Protokoll während des Baus, gebündelter Executor-Lauf am Zyklusende, Review mit deterministischer Gegenprobe, und die **Konfliktzonen-Regel** für Parallelbau (welche Dateien kein Paketagent anfasst) |
| [OS-Bau-Methode](standardprozesse/os-bau-methode.md) | lebend | Methodenfragen zum Gesamtaufbau des OS anstehen — die an die Firmenphilosophie anpassbare Gesamt-Methode |

### `firmenkernprozesse/` — Vorbild- und Firmen-Prozessdokumente (extern geführt)

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Bericht neue Features und Änderungen 2026-08-14](firmenkernprozesse/2026-08-14-Bericht-Neue-Features-und-Aenderungen-Onsite-OS.md) | extern, lebend | der jüngste Feature-Stand des Onsite-Vorbilds gebraucht wird — welche Skills, Gates und Prozesse dort zuletzt gebaut oder geändert wurden |
| [Entwicklungs-Recap Gesamthistorie 2026-08-15](firmenkernprozesse/2026-08-15-Entwicklungs-Recap-Onsite-OS-Gesamthistorie.md) | extern, lebend | die Entwicklungsgeschichte des Onsite-Vorbilds als Ganzes nachvollzogen werden soll — Etappen, Wendepunkte, gewachsene Entscheidungen |
| [Vorteile, USPs und Engineering-Methodik 2026-08-15](firmenkernprozesse/2026-08-15-Onsite-OS-Vorteile-USPs-und-Engineering-Methodik.md) | extern, lebend | die Methodik und die Alleinstellungsmerkmale des Vorbilds erklärt oder für die eigene Ausrichtung abgeglichen werden sollen |
| [Featurekarte Onsite.ai-OS](firmenkernprozesse/Onsite.ai-OS-Featurekarte.md) | extern, lebend | ein Gesamtüberblick über die Features des Vorbilds gebraucht wird — Landkarte statt Einzeldokument |
| [Prozesskarten — Familie und Verdrahtung](firmenkernprozesse/prozesskarten/00-FAMILIE-UND-VERDRAHTUNG.md) | extern, lebend | die Karten-Familie selbst verstanden werden soll — welche Karte wofür, wie sie zusammenhängen |
| [Prozesskarte Aktualisierungs-Index](firmenkernprozesse/prozesskarten/01-aktualisierungs-index.md) | extern, lebend | die Vorbild-Fassung der Änderungs-Matrix abgeglichen wird (Gegenstück zu `standardprozesse/aktualisierungs-index.md`) |
| [Prozesskarte Abteilungs-Plugin-Bau](firmenkernprozesse/prozesskarten/02-abteilungs-plugin-bau.md) | extern, lebend | die Vorbild-Fassung des Abteilungs-/Satelliten-Baus abgeglichen wird (Gegenstück zu `standardprozesse/abteilungs-plugin-bau.md`) |
| [Prozesskarte Kern-Plugin-Bau](firmenkernprozesse/prozesskarten/03-kern-plugin-bau.md) | extern, lebend | die Vorbild-Fassung des Kern-Plugin-Baus abgeglichen wird (Gegenstück zu `standardprozesse/kern-plugin-bau.md`) |
| [Prozesskarte Kern-SSOT-Aufbau](firmenkernprozesse/prozesskarten/04-kern-ssot-aufbau.md) | extern, lebend | die Vorbild-Fassung des Wissensbasis-Aufbaus abgeglichen wird (Gegenstück zu `standardprozesse/ssot-aufbau.md`) |
| [Prozesskarte Claude-Netz-Bau](firmenkernprozesse/prozesskarten/05-claude-netz-bau.md) | extern, lebend | der Aufbau des CLAUDE.md-Ebenen-Netzes im Vorbild nachvollzogen werden soll |
| [Prozesskarte Claude-Team-Distribution](firmenkernprozesse/prozesskarten/06-claude-team-distribution.md) | extern, lebend | die Verteilung an ein Team im Vorbild nachvollzogen werden soll — Marketplace, Pins, Update-Wege |
| [Prozesskarte Subagenten-Bau](firmenkernprozesse/prozesskarten/07-subagenten-bau.md) | extern, lebend | Subagenten im Vorbild gebaut oder deren Formatregeln abgeglichen werden sollen |
| [Prozesskarte Sync-Nachzug Bauzyklus](firmenkernprozesse/prozesskarten/08-sync-nachzug-bauzyklus.md) | extern, lebend | die Vorbild-Fassung des gebündelten Doku-Nachzugs abgeglichen wird (Gegenstück zu `standardprozesse/sync-nachzug-bauzyklus.md`) |
| [Prozesskarte Anker-Reservierung](firmenkernprozesse/prozesskarten/09-anker-reservierung.md) | extern, lebend | die Namens-/Anker-Reservierung des Vorbilds (Namespaces, Präfixe) nachvollzogen werden soll |
| [Prozesskarte Abteilungs-Inhalts-Prüfung](firmenkernprozesse/prozesskarten/10-abteilungs-inhalts-pruefung.md) | extern, lebend | die fachliche Inhalts-Prüfung von Abteilungsinhalten im Vorbild nachvollzogen werden soll |
| [Prozesskarten — Autorenvertrag](firmenkernprozesse/prozesskarten/AUTORENVERTRAG.md) | extern, lebend | die Verbindlichkeitsregeln der Prozesskarten selbst gebraucht werden — wer sie wie pflegt |
| [Prozesskarten — README](firmenkernprozesse/prozesskarten/README.md) | extern, lebend | der Einstieg in die Prozesskarten-Sammlung gesucht wird |
| [Rollout — Master-Index und Rollout-Katalog](firmenkernprozesse/team-rollout-infrastruktur/00-MASTER-INDEX-UND-ROLLOUT-KATALOG.md) | extern, lebend | der Rollout an ein Team geplant oder nachvollzogen wird — Katalog aller Rollout-Dokumente |
| [Rollout — System-Architektur und Infrastruktur](firmenkernprozesse/team-rollout-infrastruktur/01-SYSTEM-ARCHITEKTUR-UND-INFRASTRUKTUR.md) | extern, lebend | die technische Ziel-Architektur des Team-Rollouts (Verzeichnisse, Sync, Registry) gebraucht wird |
| [Rollout — Feature-, Skill- und Agenten-Katalog](firmenkernprozesse/team-rollout-infrastruktur/02-FEATURE-SKILL-UND-AGENTEN-KATALOG.md) | extern, lebend | ein rolltauglicher Überblick über Skills, Agents und Features des Vorbilds gebraucht wird |
| [Rollout — Meta-Prozesse und Datenflüsse](firmenkernprozesse/team-rollout-infrastruktur/03-META-PROZESSE-UND-DATENFLUESSE.md) | extern, lebend | die Datenflüsse und Meta-Prozesse hinter dem Rollout (SSOT-Sync, Kandidaten-Queues) verstanden werden sollen |
| [Rollout — Rollen, Onboarding und Praxis-Workflows](firmenkernprozesse/team-rollout-infrastruktur/04-ROLLEN-ONBOARDING-UND-PRAXIS-WORKFLOWS.md) | extern, lebend | das Onboarding neuer Teammitglieder oder die Praxis-Workflows je Rolle gebraucht werden |
| [Rollout — Quick-Reference und Cheatsheets](firmenkernprozesse/team-rollout-infrastruktur/05-QUICK-REFERENCE-CHEATSHEETS.md) | extern, lebend | kurze Nachschlagehilfen für das Team gebraucht werden — Befehle, Pfade, Abläufe in Kürze |

### `debugging-findings/` — Protokolle

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Fehlerprotokoll (agent-learnings)](debugging-findings/agent-learnings.md) | lebend, append-only | ein **eigener** Fehler passiert ist (**Pflichteintrag, sofort**) oder vor einer neuen Aufgabe bekannte Fehlermuster geprüft werden |
| [Debug-Log](debugging-findings/debug-log.md) | lebend, append-only | ein **gefundener** Bug oder Fehlbefund dokumentiert wird — an eigenem Code, an Konfiguration, an der Doku oder an einem Vorbild, unabhängig vom Verursacher (**Pflichteintrag, sofort**) — oder vor einer neuen Fehlersuche bekannte Symptome abgeglichen werden |

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus (AP4),
auf Weisung Lucas Vöhringer. Struktur-Vorlage: Onsite-`SSOT-Document-Index.md`; Ordner auf die
flachere NovaCore-Bestandsstruktur gemappt (Mapping-Tabelle oben).*
