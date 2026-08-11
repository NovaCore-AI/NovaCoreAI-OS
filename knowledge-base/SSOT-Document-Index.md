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
| `Feature-idea-backlog/` | `ideen-backlog/` — seit 2026-08-11 vorhanden (Entscheid E1), noch leer (`PLATZHALTER.md`) |
| `feature-manuals/`, `sitzungswissen/` | nicht vorhanden: Fremdsystemwissen entsteht erst mit Inhalt; Sitzungswissen liegt in `.nc/erinnerung/` des **Arbeits-Repos**, nicht hier |

## Teil 1 — Ordner-Routing: wohin gehört ein Dokument

| Ordner | Gehört hierher | Gehört **nicht** hierher | Lebenszyklus |
|---|---|---|---|
| `grundwissen/` | Zweierlei: **(a) dauerhafte Referenzen** ohne Datumspräfix — Produktvision, Begriffsnormen, Definitionsdokumente (je Thema eins); **(b) datierte Design-Specs und laufende Baupläne** mit Präfix `YYYY-MM-DD-` — je Vorhaben ein Dokument | Standardprozesse (→ `standardprozesse/`) · Protokolle (→ `debugging-findings/`) · **abgeschlossene oder verworfene Pläne** (→ `bauplan-archiv/`) · Ideen ohne Auftrag (→ `ideen-backlog/`) | Referenzen werden lebend gepflegt (hohe Aufnahmehürde: wenige, dafür tragende Dokumente). Datierte Pläne werden **nicht** rückwirkend umgeschrieben; ist ein Vorhaben abgeschlossen oder verworfen, wird sein Plan **pflichtgemäß** per `git mv` nach `bauplan-archiv/` verschoben (Entscheid E1, 2026-08-11) — sonst verliert der Ordner seine Aussage „das läuft gerade". Der Session-Start-Hook listet die jüngsten fünf |
| `bauplan-archiv/` | Abgeschlossene oder verworfene Baupläne und Design-Specs, **unverändert übernommen** | laufende Arbeit (→ `grundwissen/`) · Prozesswissen (→ `standardprozesse/`) | Zugang **nur** aus `grundwissen/`. Inhalt wird nicht mehr fortgeschrieben (historisch). **Terminal:** keine Quelle Richtung Kern oder Satelliten — es gibt keine Kandidaten-Queue und keine Promotion (Invariante I1 des Bauplans 2026-08-11) |
| `ideen-backlog/` | Ideen ohne aktuellen Auftrag — je Idee ein Dokument mit Datumspräfix | beauftragte Vorhaben (→ Bauplan in `grundwissen/`, der auf die Idee verweist) | Lebend. Solange leer, hält `PLATZHALTER.md` den Ordner in Git (nicht indexpflichtig, testerzwungene Ausnahme) |
| `standardprozesse/` | Die operativen Standardprozesse zum Instandhalten und Erweitern von Repo und Marketplace: Plugin-/Skill-Bau, Satelliten, Versionierung, Doku-Sync — samt der Frage, welche Dokumente voneinander abhängen und was wo mitzuupdaten ist | Verhalten von Fremdsoftware · Einzelvorhaben (→ `grundwissen/`) | Lebend. Fehlt ein wiederkehrender Prozess, wird er **nach der ersten Ausführung** hier dokumentiert |
| `debugging-findings/` | Die **zwei** laufenden Protokolle in Append-Form mit Kurzinfo „was wann wie": **Fehlerprotokoll** `agent-learnings.md` (eigene Fehler der KI bei der Arbeit) und **Debug-Log** `debug-log.md` (gefundene und behobene Bugs, auch an fremdem Material) | Prozesswissen · Pläne · Ideen | **Append-only** — Einträge werden nie rückdatiert oder umgeschrieben; ein widerlegter Eintrag bekommt einen **neuen**, der auf ihn verweist |
| `knowledge-base/` (Wurzel) | **Ausschließlich dieser Index.** | alles andere | testerzwungen (Wurzel-Regel) |

## Teil 2 — Quellen-Triage: wann welche Quelle

### `grundwissen/` — Vision, Begriffsnormen, Design-Specs und Baupläne

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Produktarchitektur](grundwissen/NovaCore-OS-Produktarchitektur.md) | lebend | die sechs Schichten der Produktvision erklärt oder gegen einen Plan gehalten werden sollen — Referenz für Vision-Abgleiche |
| [SSOT-Definition](grundwissen/NovaCore-OS-SSOT-Definition.md) | lebend | der Begriff „SSOT" gebraucht, erklärt oder abgegrenzt wird — normative Begriffsquelle (Wortbedeutung, Definition, Ebenen, Funktionen) **inklusive** der verbindlichen Abgrenzung firmenintern ↔ affiliate: kein Memory-Share zwischen Satelliten, keine Queue/Promotion |
| [Gates-Definition](grundwissen/NovaCore-OS-Gates-Definition.md) | lebend | die vier Gates der Kontroll-Schicht erklärt, abgegrenzt oder referenziert werden sollen — Definitionstabelle (Zweck, Mechanik, Menschkontakt, Status, Opt-out) samt Begriffsklärung „FFG 1–3 = Sub-Gates von Gate 1" und den Abgrenzungen Gate 1↔3, Basis-Gate↔Domänen-FFG, Gate 2↔4 |
| [CLAUDE-Ebenen-Definition](grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md) | lebend | die CLAUDE.md-Ebenen erklärt, abgegrenzt oder referenziert werden sollen — normative Begriffsquelle (Ebenen 0/1/2/3/3b mit Träger, Update-Kanal, Owner, Präzedenzregel, NC-Marker-Konvention der Privat-Zone, Kanal-Regel) |
| [SSOT-Provisionierung — Bauplan 2026-08-10](grundwissen/2026-08-10-ssot-provisionierung-bauplan.md) | lebend | am Setup-Mechanismus gearbeitet wird oder die Frage aufkommt, **wie die Wissensbasis überhaupt auf den Rechner kommt** — verifizierte Ausgangslage (was das Plugin ausliefert und was nicht), die Entscheidung für Weg B (lokaler Klon statt Auslieferung im Plugin), Ablageort und Fast-Forward-Regel sowie die bewusst dokumentierte Grenze bei Nutzern ohne git/Zugang |
| [Onsite-Align-Umbau — Bauplan 2026-08-10](grundwissen/2026-08-10-onsite-align-umbau-bauplan.md) | lebend | am Umbau nach dem Onsite-Vorbild gearbeitet wird — **hier zuerst**: verifizierte Ausgangslage, verbindliche Rename-Regeln, die Arbeitspakete AP1–AP8 in Baureihenfolge, die harten Ausschlüsse (keine Queue/SSOT-Abstufung, kein Memory-Share) und die roten Linien der Umsetzung |
| [Prozesskorpus-Nachzug + Satelliten-SSOT — Bauplan 2026-08-11](grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md) | lebend | der Bau-/Prozesskorpus des Onsite-Vorbilds nachgezogen wird (Zweiteilung `plugin-bau`, `ssot-aufbau`, `sync-nachzug-bauzyklus`, Vorlage `ssot-grundgeruest`) **oder** ein Satellit seine eigene Wissensbasis bekommt — trägt die harten Invarianten I1–I7 (Review-Fokus: **Isolation der Satelliten-SSOT** und korrektes Fail-open), die Arbeitspakete in drei Spuren und den verbindlichen Delegationsschnitt für externen Parallelbau (Kimi K3) |
| [Multi-Plugin-Architektur — Design-Spec 2026-07-28](grundwissen/2026-07-28-multi-plugin-architektur-design.md) | lebend | der Multi-Plugin-Schnitt begründet oder fortgeschrieben werden muss (Marketplace, Kern + Abteilungen, Versionsmodell); die Nachträge §10 (Felix-Satellit) und §11 (Biggi-Satellit) tragen den Satelliten-Stand |

### `bauplan-archiv/` — abgeschlossene Vorhaben

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Umbau-Plan 2026-07-28](bauplan-archiv/2026-07-28-umbau-plan.md) | historisch | nachvollzogen werden soll, wie der Multi-Plugin-Umbau schrittweise ausgeführt wurde (abgeschlossen; am 2026-08-11 aus `grundwissen/` hierher verschoben) |

### `ideen-backlog/` — Ideen ohne Auftrag

| Quelle | Status | Relevant wenn … |
|---|---|---|
| *(noch leer — der erste Eintrag entsteht mit der ersten dokumentierten Idee)* | — | — |

### `standardprozesse/` — verbindliche Abläufe

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [**Aktualisierungs-Index**](standardprozesse/aktualisierungs-index.md) | lebend | **irgendetwas im OS geändert wird** — die Nachschlageliste gegen Vergessen: je Änderungsart, welche Dokumente vorher eingelesen und welche in derselben Änderung nachgezogen werden, samt Version, Release, Tag, Protokoll- und Indexpflichten, Prüfzyklus und Selbsttest |
| [Kern-Plugin-Bau](standardprozesse/kern-plugin-bau.md) | lebend | am **Kern-Plugin `nc`** gearbeitet wird — Scope-Tabelle (was gehört in den Kern), **Governance-Zwei-Schichten-Tabelle §1a** (team-shared ↔ individuell, Prüfungs-Eigentum), Bauablauf, **Standardprozess Doks-Autosync §2a** (Marker-Chirurgie, Idempotenz über den Versions-Stempel, atomarer Write, fail-safe bei defekten Markern), die nur den Kern bindenden Regeln inkl. der **Mindest-Client-Schwellen**, offene Gates 3/4. Hervorgegangen aus der Zweiteilung des früheren `plugin-bau.md` (2026-08-11); dessen Git-Historie hängt an **keiner** der beiden Hälften — Vorgeschichte über den alten Pfad lesen (`git log --oneline -- knowledge-base/standardprozesse/plugin-bau.md`, Plan-Nachtrag N4) |
| [Abteilungs-Plugin-Bau](standardprozesse/abteilungs-plugin-bau.md) | lebend | an einem **Abteilungsplugin oder Satelliten** gearbeitet wird: §1 Architektur-Invarianten · **§1a Auslieferungsgrenze** (was beim Nutzer wirklich ankommt — Kopie des Plugin-Verzeichnisses, nicht sparse clone) · §2 harte Mechanik-Fakten · §3 neue Abteilung im Repo · §3a Satelliten-Extraktion · **§3b eigenständiges Kollegen-OS** (pilotiert mit `nc-felix`, inkl. der vier verifizierten Install-Fallen) · §4 Fehlertabelle |
| [SSOT-Aufbau](standardprozesse/ssot-aufbau.md) | lebend | eine **Wissensbasis** aufgebaut, erweitert oder repliziert wird — die sieben Grundbausteine, der Aufbau-Ablauf (Kategorien und Routing vor jedem Inhalt), **§4 Struktur-Vererbung an Satelliten** und **§4a die Isolations-Invariante** (warum es keine Warteschlange Richtung Kern gibt), Anti-Drift-Prinzipien, Replikationsanleitung |
| [Sync-Nachzug je Bauzyklus](standardprozesse/sync-nachzug-bauzyklus.md) | lebend | ein Bauzyklus mehrere abhängige Dokumente betrifft — Protokoll während des Baus, gebündelter Executor-Lauf am Zyklusende, Review mit deterministischer Gegenprobe, und die **Konfliktzonen-Regel** für Parallelbau (welche Dateien kein Paketagent anfasst) |
| [OS-Bau-Methode](standardprozesse/os-bau-methode.md) | lebend | Methodenfragen zum Gesamtaufbau des OS anstehen — die an die Firmenphilosophie anpassbare Gesamt-Methode |

### `debugging-findings/` — Protokolle

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Fehlerprotokoll (agent-learnings)](debugging-findings/agent-learnings.md) | lebend, append-only | ein **eigener** Fehler passiert ist (**Pflichteintrag, sofort**) oder vor einer neuen Aufgabe bekannte Fehlermuster geprüft werden |
| [Debug-Log](debugging-findings/debug-log.md) | lebend, append-only | ein **gefundener** Bug oder Fehlbefund dokumentiert wird — an eigenem Code, an Konfiguration, an der Doku oder an einem Vorbild, unabhängig vom Verursacher (**Pflichteintrag, sofort**) — oder vor einer neuen Fehlersuche bekannte Symptome abgeglichen werden |

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus (AP4),
auf Weisung Lucas Vöhringer. Struktur-Vorlage: Onsite-`SSOT-Document-Index.md`; Ordner auf die
flachere NovaCore-Bestandsstruktur gemappt (Mapping-Tabelle oben).*
