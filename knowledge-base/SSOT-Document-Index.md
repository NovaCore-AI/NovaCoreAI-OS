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
| `Aktive Baupläne/` + `Bauplan-archiv/` | **kein eigener Ordner** — Pläne liegen mit Datumspräfix in `grundwissen/`; die jüngste Datei ist der aktuellste Planungsstand (bewusste Abweichung, Bauplan 2026-08-10 §2) |
| `Feature-idea-backlog/`, `feature-manuals/` | heute nicht vorhanden — entstehen erst, wenn es Inhalt dafür gibt |

## Teil 1 — Ordner-Routing: wohin gehört ein Dokument

| Ordner | Gehört hierher | Gehört **nicht** hierher | Lebenszyklus |
|---|---|---|---|
| `grundwissen/` | Zweierlei: **(a) dauerhafte Referenzen** ohne Datumspräfix — Produktvision, Begriffsnormen, Definitionsdokumente (je Thema eins); **(b) datierte Design-Specs und Baupläne** mit Präfix `YYYY-MM-DD-` — je Vorhaben ein Dokument | Standardprozesse (→ `standardprozesse/`) · Protokolle (→ `debugging-findings/`) | Referenzen werden lebend gepflegt (hohe Aufnahmehürde: wenige, dafür tragende Dokumente). Datierte Pläne werden **nicht** archiviert und **nicht** rückwirkend umgeschrieben — sie bleiben als Historie liegen; der Session-Start-Hook listet die jüngsten fünf |
| `standardprozesse/` | Die operativen Standardprozesse zum Instandhalten und Erweitern von Repo und Marketplace: Plugin-/Skill-Bau, Satelliten, Versionierung, Doku-Sync — samt der Frage, welche Dokumente voneinander abhängen und was wo mitzuupdaten ist | Verhalten von Fremdsoftware · Einzelvorhaben (→ `grundwissen/`) | Lebend. Fehlt ein wiederkehrender Prozess, wird er **nach der ersten Ausführung** hier dokumentiert |
| `debugging-findings/` | Laufende Protokolle in Append-Form mit Kurzinfo „was wann wie": **Fehlerprotokoll** (eigene Fehler der KI bei der Arbeit) | Prozesswissen · Pläne | **Append-only** — Einträge werden nie rückdatiert oder umgeschrieben |
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
| [Multi-Plugin-Architektur — Design-Spec 2026-07-28](grundwissen/2026-07-28-multi-plugin-architektur-design.md) | lebend | der Multi-Plugin-Schnitt begründet oder fortgeschrieben werden muss (Marketplace, Kern + Abteilungen, Versionsmodell); die Nachträge §10 (Felix-Satellit) und §11 (Biggi-Satellit) tragen den Satelliten-Stand |
| [Umbau-Plan 2026-07-28](grundwissen/2026-07-28-umbau-plan.md) | historisch | nachvollzogen werden soll, wie der Multi-Plugin-Umbau schrittweise ausgeführt wurde |

### `standardprozesse/` — verbindliche Abläufe

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [**Aktualisierungs-Index**](standardprozesse/aktualisierungs-index.md) | lebend | **irgendetwas im OS geändert wird** — die Nachschlageliste gegen Vergessen: je Änderungsart, welche Dokumente vorher eingelesen und welche in derselben Änderung nachgezogen werden, samt Version, Release, Tag, Protokoll- und Indexpflichten, Prüfzyklus und Selbsttest |
| [Standardprozess Plugin-Bau](standardprozesse/plugin-bau.md) | lebend | irgendetwas an einem Plugin, Skill-Layout oder Marketplace geändert wird: §3 neue Abteilung im Repo · §3a Satelliten-Extraktion · **§3b eigenständiges Kollegen-/Abteilungs-OS** (pilotiert mit `nc-felix`, inkl. der verifizierten Install-Fallen) |
| [OS-Bau-Methode](standardprozesse/os-bau-methode.md) | lebend | Methodenfragen zum Gesamtaufbau des OS anstehen — die an die Firmenphilosophie anpassbare Gesamt-Methode |

### `debugging-findings/` — Protokolle

| Quelle | Status | Relevant wenn … |
|---|---|---|
| [Fehlerprotokoll (agent-learnings)](debugging-findings/agent-learnings.md) | lebend, append-only | ein eigener Fehler passiert ist (**Pflichteintrag, sofort**) oder vor einer neuen Aufgabe bekannte Fehlermuster geprüft werden |

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus (AP4),
auf Weisung Lucas Vöhringer. Struktur-Vorlage: Onsite-`SSOT-Document-Index.md`; Ordner auf die
flachere NovaCore-Bestandsstruktur gemappt (Mapping-Tabelle oben).*
