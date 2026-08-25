# Node-Doks — Definition der Knotendokumente (Grundsatzdokument)

> **Zweck:** die verbindliche Begriffs- und Bestandsquelle für die **Node-Doks**
> (Knotendokumente) der NovaCore-SSOT — Schwester der
> [`SSOT-Definition`](NovaCore-OS-SSOT-Definition.md), der
> [`Gates-Definition`](NovaCore-OS-Gates-Definition.md), der
> [`CLAUDE-Ebenen-Definition`](NovaCore-OS-CLAUDE-Ebenen-Definition.md), der
> [`Kriterienliste-Definition`](NovaCore-OS-Kriterienliste-Definition.md) und der
> [`Anker-Reservierung-Definition`](NovaCore-OS-Anker-Reservierung-Definition.md).
> **Grundlage:** die Begriffsnorm des Onsite-Vorbilds (dortige Design-Spec **§15.40**,
> Begriffsnormierung 2026-08-17, samt Maintainer-Entscheid 2026-08-21), portiert am
> **2026-08-24** nach Mapping **D25** des
> [Onsite-Delta-Mappings](2026-08-23-onsite-delta-mapping.md) (Nachtrag N2, Phase H — D25 ist
> die Vorbedingung der vier Wissens-Router D7).
> **Verhältnis zur NovaCore-SSOT-Definition:** Der Begriff bleibt dort **verankert** — sie
> nennt ihn und verweist hierher; die Ausführung steht an genau einer Stelle, hier. Dasselbe
> Muster tragen die CLAUDE-Ebenen (Doppelpflege-Verbot, das auch auf Instruktionsebene gilt).
> **Abgeleitetes Dokument** — bei Widerspruch gewinnen die normativen Quellen (jüngster
> Bauplan in `grundwissen/`, dann die Standardprozesse; Quellen-Hierarchie der `AGENTS.md`).

## Definition

**Node-Doks** (Knotendokumente) sind die Dokumente, die **keinen Fachinhalt tragen, sondern
auf ihn verweisen** und ihn erschließen. Sie sind die **Knoten** des Wissensnetzes; die
Fachdokumente sind seine **Blätter**.

Der Begriff ist keine Ordnungsästhetik, sondern trägt eine Konstruktionsregel: Ein
Mechanismus, der Wissen präsent hält, zeigt **auf Knoten** — nicht auf jedes Blatt (siehe
„Kontext-Ökonomie" unten).

## Die Knotendokumente des NovaCore-OS

Pfade relativ zur **Wurzel des OS-Repos**. NovaCore führt seine Knoten bewusst an **drei**
Orten (Wissensbasis · Repo-Wurzel und Kern-Plugin · Sitzungswissen des Arbeits-Repos) — beim
Vorbild liegen alle vier in der Wissensbasis. Die Spalte **„Geltungsbereich"** nennt die
Frage, die der Knoten beantwortet; sie ist das Unterscheidungsmerkmal, nicht der Ordner.

| # | Knoten | Pfad | Erschließt | Geltungsbereich | Geschrieben / gepflegt durch | Zuständiger Router |
|---|---|---|---|---|---|---|
| **1** | **Master-Index** | [`knowledge-base/SSOT-Document-Index.md`](../SSOT-Document-Index.md) | Teil 1 Ordner-Routing (wohin gehört ein Dokument, wann wandert es), Teil 2 Quellen-Triage je Quelle mit Status und Abruf-Situation | **generell** — die **gesamte** Wissensbasis, jede Kategorie, jedes Dokument | jede Änderung an einer Wissensdatei, in derselben Änderung; Vollständigkeit, Linkgültigkeit, Kategorien-Routing und Wurzel-Regel sind testerzwungen (`struktur.test.mjs`) | `/nc:wissen-nachschlagen` |
| **2** | **Änderungs-Matrix** | [`knowledge-base/standardprozesse/aktualisierungs-index.md`](../standardprozesse/aktualisierungs-index.md) | je Änderungsart: Pflichtlektüre vorher (§1), mitzuziehende Dokumente (§2.1–§2.3), Version/Release/Tag (§3), Protokoll- und Indexpflichten (§4), Prüfzyklus (§5), Selbsttest (§6) | **schmal** — die eine Frage „ich ändere X, was muss ich alles anfassen" | wer eine neue Änderungsart einführt (Zeile „Konvention/Prozess geändert" in §2.2 bindet den Index an sich selbst) | `/nc:wissen-aendern` |
| **3** | **Einstiegs-Karte** | [`AGENTS.md`](../../AGENTS.md) | Pflicht-Einstieg je Session (sechs Schritte, danach aufgabenspezifisches Nachladen), Repo-Karte je Pfad, Glossar der Wissensbasis, Sync-Matrix | **schmal** — die eine Frage „wo fange ich an und wo im Repo liegt was" | jede Änderung an Repo-Struktur, Skill-Bestand oder Konvention (§2.1/§2.2 der Änderungs-Matrix); der Pflicht-Einstieg zusätzlich gespiegelt im Session-Start-Hook | `/nc:wissen-nachschlagen` |
| **4** | **Modul-Metadaten** | `plugins/nc/module-registry.json` | Hierarchie Abteilung → Plugin → Modul (Skill-Präfix) → Skills, dazu je Abteilung das `agents`-Objekt und auf Wurzelebene `reservierungen` | **schmal** — die eine Frage „welche Abteilungen, Module, Skills und Subagenten gibt es und wo liegen sie" | jede Änderung an Skills, Modulen, Abteilungen oder Agenten (§2.1); Gleichstand mit `VERSION` und Marketplace ist testerzwungen | `/nc:wissen-aendern` |
| **5** | **Roll-up-Index** | `knowledge-base/sitzungswissen/roll-up.md` | eine Zeile je Arbeitstag: Datum · Thema · Ergebnis — der Streifblick über mehrere Tage | **schmal** — die eine Frage „wie war der Stand der letzten Tage" | geschrieben von `/nc:end-session` und `/nc:journal`, gelesen von `/nc:start` | `/nc:wissen-planen` |
| **6** | **Offene-Stränge-Register** | `knowledge-base/sitzungswissen/offene-straenge-register.md` | jeder ausgelagerte, geplante oder delegierte Strang mit Verbleib und nächstem Schritt; append/update, erledigte Zeilen bleiben mit Erledigt-Datum stehen | **schmal** — die eine Frage „was ist noch offen und wo liegt es" | Pflege-Pflicht in `/nc:end-session`, Rücklese-Pflicht in `/nc:start` | `/nc:wissen-planen` |

Das Sitzungswissen der Knoten 5 und 6 wohnt seit dem 2026-08-24 **committet in der
Wissensbasis** dieses Repos unter `sitzungswissen/` (Entscheid P-E4, Mapping D14) und ist damit
für Nachbarsitzungen lesbar. Roll-up und Register liegen direkt in `sitzungswissen/`, die
Abteilungsebene `sitzungswissen/gemeinsam/` trägt `stand.md` und `journal/<YYYY-MM-DD>.md`.
In einem fremden Arbeits-Repo existieren dieselben zwei Knoten, tragen dort aber
dessen Stand.

### Zwei Grenzfälle, bewusst als Knoten geführt

- **`AGENTS.md` ist ein Hybrid.** Ihre Karten- und Einstiegsteile verweisen (Repo-Karte,
  Glossar, Pflicht-Einstieg, Sync-Matrix), ihre Regelteile **tragen** eigene Norm
  (Standardzyklus, rote Linien, Abschluss-Checkliste). Sie wird hier als Knoten geführt, weil
  ihr Verweis-Teil der einzige vollständige Zugang zur Produkt-Oberfläche ist und weil der
  Session-Start-Zwang genau auf sie zeigt. Wer sie ändert, ändert also möglicherweise
  **beides** — Zeiger und Norm.
- **`plugins/nc/module-registry.json` ist eine Ist-Inventur.** Das Vorbild hat mit dem
  Maintainer-Entscheid 2026-08-21 sein Betriebshandbuch aus der Knotenliste **entfernt**, weil
  eine Ist-Inventur Inhalt trägt statt zu verweisen. Nach demselben Maßstab ist die Registry
  ein Grenzfall: Sie zählt auf und zeigt (`repoSkillsPath`, `rahmen`, `workflow`), trägt aber
  in ihren `status`- und `module`-Texten auch eigene Aussage. NovaCore führt sie als Knoten,
  weil sie der **einzige** maschinenlesbare Bestandsnachweis der Produkt-Oberfläche ist.
  **Offener Punkt:** Diese Einordnung ist ein KI-Vorschlag im Rahmen des D25-Ports und
  wartet auf Maintainer-Bestätigung; fällt sie, wandert Zeile 4 in die Blatt-Klasse, ohne
  dass sich an den Routern etwas ändert (sie dürfen auf benannte Blätter zeigen).

## Mapping zum Onsite-Vorbild

Das Vorbild führt seit dem Entscheid 2026-08-21 **vier** Knoten (nicht mehr fünf — das
Betriebshandbuch ist dort ausdrücklich zum Blatt erklärt worden). NovaCore kommt auf sechs:
vier Pendants plus zwei eigene.

| Onsite-Knoten | NovaCore-Pendant | Abweichung und Grund |
|---|---|---|
| Master-Index `SSOT-Document-Index.md` | `knowledge-base/SSOT-Document-Index.md` | nur der Ordnername (`knowledge base/` → `knowledge-base/`); Funktion 1:1 |
| Änderungs-Matrix `plugin-maintanance-ruleset-source/Aktualisierungs-Index.md` | `knowledge-base/standardprozesse/aktualisierungs-index.md` | Ordner-Mapping der flacheren NC-Struktur plus kleingeschriebener Dateiname. **Gliederung abweichend:** NovaCore zählt §1–§6; Onsites Zwei-Klassen-Buchführung (§0) und Release-Zug-Runbook (§3.6) sind bei uns noch nicht übernommen (Entscheid EN5, Phase I) |
| Roll-up-Index `sitzungswissen/roll-up.md` | `knowledge-base/sitzungswissen/roll-up.md` | Noch **eine** Abweichung: **Zeilensemantik** — je **Tag** statt je **Abteilung**, weil NovaCore genau eine interne Abteilung (`development`) führt und die Kollegen-OS-Satelliten terminal sind (Invariante I8, kein Queue-/Memory-Anschluss). Die frühere **Ort**-Abweichung ist am 2026-08-24 mit dem Umzug in die Wissensbasis entfallen (Entscheide EN1/P-E4) — der Ort entspricht jetzt dem Vorbild |
| Offene-Stränge-Register `sitzungswissen/offene-straenge-register.md` | `knowledge-base/sitzungswissen/offene-straenge-register.md` | Ort wie oben; Semantik und Pflegeregel 1:1 |
| — (dort kein Knoten) | `AGENTS.md` | **NC-Zusatz.** Beim Vorbild existiert die Datei ebenfalls, zählt aber nicht zur Knotenklasse. NovaCore braucht sie als Knoten, weil sein Pflicht-Einstieg und seine Repo-Karte hier und nur hier vollständig stehen |
| — (dort kein Knoten) | `plugins/nc/module-registry.json` | **NC-Zusatz**, siehe Grenzfall oben. Das Vorbild führt eine gleichnamige Datei, zählt sie aber nicht zur Knotenklasse |
| Betriebshandbuch (dort ausdrücklich **kein** Knoten) | **kein Pendant** | NovaCore führt kein Betriebshandbuch. Die Ist-Stand-Frage beantworten `CHANGELOG.md` (autoritativ) und die Modul-Metadaten; entsteht ein Betriebshandbuch, ist es nach dem Vorbild-Entscheid ein **Blatt** |
| `referenz/wissens-router.md` (dort ausgeliefertes Laufzeit-Regelwerk, kein Knoten und nicht im Master-Index) | `plugins/nc/referenz/wissens-router.md` (seit 2026-08-25, Struktur-Paritätsaudit) | Produktklasse (reist im Plugin-Paket, Bump am Release-Zug), steht **nicht** im Master-Index und nicht im Sucheindex; bei Abweichungen gewinnt dieses Dokument als Begriffsquelle. **Übergangszustand:** Die vier Router tragen die Registry-Auflösung heute noch **selbst** (je ein Ablauf-Schritt 1) — die Referenz ist damit vorerst eine fünfte Fassung, nicht deren Ersatz; die Entdopplung ist ein eigener Vorgang (Register 2026-08-25) |

## Der Master-Index ist der einzige generelle Knoten der Wissensbasis

*(Erkenntnis des Vorbilds, hier auf die NovaCore-Topologie übertragen.)*

Vier der sechs Knoten sind **auf je eine schmale Dauerfrage zugeschnitten**: Änderungsumfang ·
Produkt-Oberfläche · Mehrtagesstand · offene Stränge. Nur der **Master-Index** erschließt
einen ganzen **Bestand** statt einer Frage — die gesamte Wissensbasis.

Die zwei NC-Zusätze konkurrieren damit nicht, weil sie über einen **anderen Bestand** liegen:
`AGENTS.md` und die Modul-Metadaten erschließen die **Repo- und Produkt-Oberfläche**, nicht
die Wissensbasis. Zwei generelle Knoten über **demselben** Bestand wären per Definition
Konkurrenz und damit ein Konstruktionsfehler.

Daraus folgen drei Dinge:

1. **Der Master-Index ist der Pflicht-Einstieg der Wissens-Triage,** nicht einer von sechs
   gleichwertigen Zeigern. Die anderen werden **anlassbezogen** gezogen, wenn ihre Frage
   gestellt wird.
2. **Reihenfolge ist keine Geschmacksfrage:** erst triagieren (Master-Index: *welches Dokument
   existiert*), dann Umfang bestimmen (Änderungs-Matrix: *was muss ich anfassen*). Die
   Änderungs-Matrix beantwortet die Bestandsfrage nie.
3. **Ein neuer Knoten entsteht nur, wenn eine neue schmale Dauerfrage entsteht** — nicht,
   wenn ein Dokument wichtig, lang oder häufig gelesen wird.

## Warum Knoten statt Blätter — Kontext-Ökonomie

Die SSOT wirkt nur, wenn ein Agent **weiß, dass ein Dokument existiert**. Ohne benannte
Knotenklasse lässt sich diese Präsenz weder konsistent bauen noch pflegen:

- Ein Mechanismus, der **auf jedes Blatt** zeigt, wächst mit der Dokumentzahl, kostet dauerhaft
  Kontext und veraltet mit jeder neuen Datei. Von jedem Skill liegen `name` + `description`
  (max. 1024 Zeichen) **dauerhaft** im Kontext — ein Router je Dokument wäre ein Vielfaches an
  Dauerkontext für dasselbe Ergebnis.
- Ein Mechanismus, der **auf Knoten** zeigt, erschließt mit **einem** Zeiger eine ganze
  Kategorie und bleibt stabil, weil Knoten selten entstehen.

Daraus die Konstruktionsregel der Wissens-Router: **auf Knoten zeigen, nur ausnahmsweise auf
ein einzelnes Blatt — und immer Zeiger liefern, nie Inhalt.** Der Preis der Router ist
messbar und gedeckelt: Die Summe der vier `description`-Felder bleibt unter **6.000 Zeichen**
(Invariante des Vorbilds, bei uns testerzwungen in `plugins/nc/tests/struktur.test.mjs`). Wer
den Deckel hebt, tut es bewusst.

**Die Ausnahme ist real und gewollt, kein Widerspruch:** Die Zeiger-Tabellen der Router führen
neben den Knoten auch **namentlich benannte Blätter** — die Standardprozesse, die
Begriffsdokumente, die datierten Baupläne, die append-only-Protokolle und -Register;
`/nc:wissen-protokolle` zeigt sogar **ausschließlich** auf solche Blätter. Die Regel begrenzt
die Blatt-Zeiger also nicht auf null, sondern verlangt eine **Begründung je Blatt** — der
Knoten braucht keine.

## Abgrenzungen

- **Node-Dok ist eine Eigenschaft des Dokuments, keine Ordnerkategorie.** Die NovaCore-Knoten
  liegen quer zu den Kategorien (`standardprozesse/`, Wissensbasis-Wurzel) und teils ganz
  außerhalb der Wissensbasis — einen Ordner „node-doks" gibt es nicht und soll es nie geben.
- **Nicht Länge, nicht Wichtigkeit.** Ein Dokument wird nicht dadurch zum Knoten, dass es
  lang, zentral oder viel gelesen ist, sondern dadurch, dass sein **Zweck das Verweisen** ist.
  Der jüngste datierte Bauplan in `grundwissen/` steuert einen ganzen Bauzyklus und ist
  trotzdem ein Blatt: Er trägt Fachinhalt.
- **Knoten ≠ Router.** Die vier Wissens-Router (`/nc:wissen-aendern`, `/nc:wissen-planen`,
  `/nc:wissen-nachschlagen`, `/nc:wissen-protokolle`) **zeigen auf** Knoten; sie sind selbst
  keine Wissensdokumente, sondern ausgelieferter Produktbestandteil und stehen deshalb nicht
  im Master-Index.
- **Der Zeiger-Mechanismus ist zweiteilig** (seit Kern 0.12.0, Delta D4/D7 in derselben
  Phase H): die vier Router-Skills **plus** der `UserPromptSubmit`-Hook
  `nc-wissens-hinweis.js` mit dem handgepflegten Sucheindex `wissen-sucheindex.json` —
  beide zeigen auf Knoten bzw. indizierte Quellen, nie auf Volltexte. Der Regelapparat ist
  seit 2026-08-25 vollständig: `plugins/nc/referenz/wissens-router.md` trägt die gemeinsame
  Laufzeit-Mechanik (Zeiger-Regeln, Registry-Auflösung inkl. NovaCore-Zweitquelle
  `kernSsotPfad`, Hook-Eigenschaften); den Bauweg regelt
  `standardprozesse/wissens-router-bau.md`.
- **Abgrenzung zur SSOT-Definition.** Dort ist der Begriff **verankert** und in die
  Hybrid-Definition der SSOT eingeordnet; hier steht seine **Ausführung** — Bestand,
  Geltungsbereiche, Konstruktionsregel, Abgrenzungen.

## Pflege

Ein Knoten entsteht oder entfällt selten — und wenn, dann ist das ein Eingriff in die
Zeiger-Infrastruktur, nicht nur eine neue Datei. Es greifen dann **zwei** Zeilen der
Änderungs-Matrix gleichzeitig:

- **„Wissensdatei neu"** bzw. **„Wissensdatei verschoben/umbenannt/gelöscht"** (§2.2) — Zeile
  im Master-Index (testerzwungen), `grep` nach dem alten Pfad über das ganze Repo.
- **„Skill neu"** bzw. **„Skill inhaltlich geändert"** (§2.1) — die Router sind Skills des
  Kern-Plugins: Ihre Zeiger-Tabellen werden **gemeinsam** mit dem Knotenbestand nachgezogen,
  sie dürfen nie auseinanderlaufen. Ein Zeiger auf ein verschobenes Dokument ist **schlimmer**
  als kein Zeiger, weil ihm geglaubt wird.

Zusätzlich ist dieses Dokument nachzuziehen, wenn sich der **Bestand** der Knoten oder ihr
**Geltungsbereich** ändert — die Tabelle oben ist die Bestandsaussage.

**Merksatz:** Ein Knoten, der veraltet, ist schlimmer als kein Knoten — ihm wird geglaubt,
ohne dass jemand die Quelle öffnet.

---

*Angelegt 2026-08-24 durch Claude (Opus 5, Claude Code) als beauftragter Subagent unter
Overseer-Aufsicht, auf Weisung des Maintainers. Port der Onsite-Begriffsnorm
(`project-meta-infos/Onsite.ai-OS-Node-Doks-Definition.md`), live abgerufen aus
`origin/main@51e230f` — Begriff, Konstruktionsregel und Kontext-Ökonomie wortnah übernommen.
Bewusste Abweichungen: (a) die Knotenliste ist gegen die reale NovaCore-Struktur verifiziert
statt übernommen — sechs Knoten an drei Orten, Mapping-Tabelle oben; (b) Onsites vierte
Knotenzeile (Roll-up) weicht in Ort und Zeilensemantik ab und ist als solche ausgewiesen;
(c) die zwei NC-Zusatzknoten sind mit Begründung und offenem Maintainer-Punkt geführt statt
stillschweigend; (d) Onsite-Spec-Randnummern und Bauplan-Verweise sind durch NC-Verweise
ersetzt; (e) Personen werden als **Rolle** geführt (Maintainer), nicht als Klarname.*
