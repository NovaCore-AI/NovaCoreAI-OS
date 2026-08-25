# Anker-Reservierung — Standardprozess

> ## ⚠ Normänderung 2026-08-24 (Entscheid P-E2) — das Git-Ref-Mittel ist entfallen
>
> **Tags entstehen bei NovaCore ausschließlich als Teil eines Release**
> ([Aktualisierungs-Index §3.6, Release-Zug](aktualisierungs-index.md)). **Reserve- und
> Anker-Tags (`reserve/*`) gibt es nicht mehr.** Grund: Unter dem Waypoint-Modell wird die
> Version erst am Release-Zug vergeben — der knappste und kollisionsträchtigste Anker existiert
> im Arbeitsstrang also gar nicht mehr, und ein Tag-Namensraum, der nur noch Restfälle trägt,
> kostet mehr Pflege, als er verhindert.
>
> **Was bleibt:** die **Begriffsnorm Anker** (was ein knapper Bezeichner ist, welche
> Kollisionsklassen es gibt —
> [Definition](../grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md)), die **Pflicht zur
> Abstimmung vor der ersten Zeile Arbeit** bei Skill-, Agent-, Hook- und Abteilungsnamen sowie
> Nachtrags-/AP-Kennungen, und die **späte Testsuite-Invariante** gegen doppelt vergebene
> CHANGELOG-Versionsüberschriften (`struktur.test.mjs`, unverändert scharf).
>
> **Was entfällt:** der Ablauf §2, die Aufräum-Pflicht §4, die Branch-Protection-Ausnahme §5
> und die Kollisions-Auflösung §6 — sie beschreiben das abgeschaffte Mittel und stehen ab hier
> **historisch**. Sie werden bewusst nicht gelöscht: Sie erklären die drei Alt-Refs unten.
>
> **Abstimmung ohne Tag:** Der knappe Bezeichner wird im **Bauplan** des Vorhabens
> (`aktive-bauplaene/`) und in der **Zeile im Offene-Stränge-Register** festgeschrieben, bevor
> gebaut wird. Läuft mehr als eine Arbeitseinheit, ist das der gemeinsame Ort — der Overseer
> hält ihn.
>
> **Altbestand (Stand 2026-08-24):** `reserve/nc-0.9.0`, `reserve/abteilung-ui-ux`,
> `reserve/abteilung-automation`. Sie werden **nicht** nachgepflegt und **nicht** erneuert; ihre
> Entfernung ist eine reine Aufräum-Entscheidung des Maintainers, kein Vorgang dieses Prozesses.
> Die Registry-Reservierungen `ui-ux`/`automation` bleiben unberührt — sie stehen in
> `module-registry.json`, nicht in einem Ref.

---

> **Verbindlich**, sobald mehr als eine Arbeitseinheit gleichzeitig am OS arbeitet (zwei
> Sessions, zwei Worktrees, zwei beauftragte Agenten). Reserviert werden **knappe Anker** —
> Bezeichnungen, die genau einmal vergeben werden können und deren Wert sich aus einem
> Zählstand ergibt.
>
> **Das Warum** — was ein Anker ist, warum eine Liste nicht trägt und ein Git-Ref schon —
> steht in
> [`grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md`](../grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md).
> Hier stehen nur die Handgriffe.
>
> **Schwestern:** [`aktualisierungs-index.md`](aktualisierungs-index.md) §3 (parallele
> Arbeitsstränge und Anker — Bump-Regeln) · [`os-bau-methode.md`](os-bau-methode.md)
> (Familien-Verdrahtung: dieser Prozess läuft als **erster**) ·
> [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md) (Konfliktzonen-Regel beim
> Parallelbau) · [`abteilungs-inhalts-pruefung.md`](abteilungs-inhalts-pruefung.md) §7
> (Anker-Bedarf als Pflichtprüfpunkt der Synthese).

---

## 1. Was reserviert wird

| Anker | Ref-Name | Beispiel |
|---|---|---|
| Ziel-Version eines Plugins | `reserve/<plugin>-<version>` | `reserve/nc-0.10.0` |
| Skill-, Agent- oder Hook-Name | `reserve/name-<name>` | `reserve/name-sync-nachzug-executor` |
| Abteilungsname | `reserve/abteilung-<name>` | `reserve/abteilung-ui-ux` |
| Nachtrags- oder Arbeitspaket-Kennung eines lebenden Bauplans | `reserve/nachtrag-<plan>-<kennung>` | `reserve/nachtrag-2026-08-15-N8` |

Die ersten drei sind die **Ist-Anker** des Repos: Die Ziel-Version materialisiert sich als
`## [X.Y.Z]`-Überschrift im `CHANGELOG.md` und als Wert in `plugin.json`/`VERSION`/
`module-registry.json`; Skill-, Agent- und Hook-Namen beanspruchen einen Namespace, der genau
einmal existiert; Abteilungsnamen sind bereits als knappes Gut geführt — das Registry-Feld
`reservierungen` in `plugins/nc/module-registry.json` hält `ui-ux` und `automation` frei,
ohne dass es dafür schon ein Plugin gäbe (Maintainer-Entscheid 2026-08-15, Bauplan-Nachtrag
N6). Dieses Registry-Feld ist die **dauerhafte** Reservierung eines Namens ohne laufendes
Vorhaben; der `reserve/*`-Tag ist die **kurzlebige** Reservierung für die Dauer eines Baus.
Beide schließen einander nicht aus: Wer `ui-ux` tatsächlich baut, reserviert zusätzlich per
Tag, weil erst dann zwei Stränge um denselben Namen konkurrieren können.

Die vierte Zeile ist die NovaCore-Entsprechung des Vorbild-Ankers „Spec-Abschnitt": Wir führen
keine durchnummerierte Einzel-Spec, wohl aber lebende Baupläne in `grundwissen/` mit einer
fortlaufenden Nachtrags-Reihe (`N1`, `N2`, … `N7`) und Arbeitspaket-Kennungen (`AP-C2`).
Schreiben zwei Stränge gleichzeitig einen Nachtrag in **denselben** Bauplan, ist die nächste
freie Nummer ein knapper Anker wie jeder andere.

**Nicht** reserviert werden Dateinamen, Index- und Matrix-Zeilen oder Branch-Namen: Sie folgen
aus dem Inhalt, kollidieren deshalb kaum, und wenn doch, ist es ein gewöhnlicher
Merge-Konflikt — sichtbar und harmlos.

---

## 2. Ablauf

**Vor der ersten Zeile Arbeit am Artefakt** — nicht erst beim Schreiben des CHANGELOG-Eintrags
oder des Nachtrags.

```bash
# 1. Realen Stand holen (Reservierungen anderer Straenge inklusive)
git fetch origin --tags --prune

# 2. Belegte Anker ansehen
git ls-remote --tags origin "refs/tags/reserve/*"

# 3. Naechsten freien Anker aus main ableiten
#    (hoechste vergebene Version bzw. Nachtragsnummer + 1) und gegen Schritt 2 pruefen

# 4. Reservieren — annotiert, damit Zweck und Urheber am Ref haengen
git tag -a reserve/nc-0.10.0 -m "Anker fuer <Vorhaben>, Session <Datum>"
git push origin reserve/nc-0.10.0
```

**Schlägt der Push fehl** (`rejected — already exists`), ist der Anker belegt: den nächsten
nehmen und Schritt 4 wiederholen. Das ist der Normalfall bei paralleler Arbeit und kein
Fehler — genau dafür existiert der Mechanismus. Der lokale Tag wird dabei **zuerst** gelöscht
(`git tag -d reserve/nc-0.10.0`), sonst bleibt eine falsche Reservierung im Klon zurück.

**Der Tag zeigt auf den aktuellen `main`-Stand.** Welcher Commit es genau ist, spielt keine
Rolle — der Tag ist ein Name, kein Inhalt.

**Nebenbefund für Skripte:** `git ls-remote` liefert bei annotierten Tags **zwei** Zeilen —
das Tag-Objekt und, mit `^{}`-Suffix, den Commit. Wer den Commit braucht, nimmt
`git rev-parse <tag>^{commit}`; dieselbe Falle wie beim Satelliten-Pin.

---

## 3. Freigabe — bei NovaCore (noch) **nicht** ausgenommen

**Bis der Maintainer-Entscheid E4 gefallen ist, braucht jeder `reserve/*`-Push eine
Einzel-Freigabe des Maintainers.** Die rote Linie des Repos — „kein Commit, Push, PR, Merge,
Tag/Release ohne ausdrückliche Maintainer-Freigabe, in keinem Repo, auch nicht durch
delegierte Agenten" — gilt vorerst **ohne** Anker-Ausnahme. E4 ist im Bauplan 2026-08-15
ausdrücklich als **vertagt** vermerkt (in den Phasen 1/2 nicht benötigt).

**Bewusste Abweichung vom Vorbild:** Das Onsite-Vorbild hat die Ausnahme (Maintainer-Entscheid
2026-08-14) mit der Begründung, der Ref trage keinen Inhalt, ändere keine Datei und sei
folgenlos löschbar — die Freigabepflicht ziele auf Inhalt, nicht auf Namensvergabe. Dieselbe
Begründung liegt E4 als Vorlage bei. Sie ist bei NovaCore **noch nicht entschieden**, deshalb
gilt sie hier nicht. Praktische Folge: Die Reservierung funktioniert, ist aber je Push an die
Verfügbarkeit des Maintainers gebunden — genau der Nachteil, den E4 auflösen soll.

**Unverändert rote Linie bleibt alles andere:** kein Push auf `main`, kein Release-Tag
(`nc--v*` bzw. `<plugin>--v*`), kein Merge, kein PR ohne Freigabe.

**Wird E4 entschieden**, wird dieser Abschnitt in **derselben** Änderung nachgezogen — samt
`aktualisierungs-index.md` §3, dessen Formulierung „Ablauf, Freigabe-Ausnahme und
Aufräum-Pflicht" bereits auf den Zielzustand zeigt.

---

## 4. Aufräumen

Nach dem **Merge** des zugehörigen PR wird die Reservierung entfernt — ab dann ist das
Artefakt selbst der Beleg (die CHANGELOG-Überschrift, die Agent-Datei, der Registry-Eintrag):

```bash
git push origin --delete reserve/nc-0.10.0
git tag -d reserve/nc-0.10.0
```

Wird ein Vorhaben **verworfen**, wird der Tag genauso gelöscht; der Anker ist dann wieder frei.

Das Aufräumen ist **manuell und Pflicht** — es gibt keinen Hook und keinen Job, der verwaiste
Reservierungs-Tags einsammelt. Ein verwaister Tag ist kein Schaden, aber er lässt einen Anker
unnötig belegt aussehen; deshalb gehört das Löschen in **dieselbe Arbeitseinheit** wie der
Merge (Familien-Verdrahtung: `os-bau-methode.md`, Schritt 4 „Am Zyklusende").

---

## 5. Wenn `main` unter Schutz steht

Sobald Branch Protection oder ein Ruleset auf `main` aktiv ist, muss das Ref-Pattern
`reserve/*` davon **ausgenommen** bleiben. Das ist möglich, weil GitHub **Refs** schützt und
nicht Dateipfade: Ein Ruleset für `refs/tags/nc--v*` (Releases) lässt `refs/tags/reserve/*`
unberührt. Eine Ausnahme für eine einzelne *Datei* wäre dagegen konstruktiv nicht möglich —
darum liegt die Reservierung in einem Ref und nicht in einem Dokument.

Prüfen lässt sich das jederzeit mit einem Testlauf (Freigabe nach §3 vorausgesetzt):

```bash
git tag -a reserve/probe -m "Schutzprobe" && git push origin reserve/probe
git push origin --delete reserve/probe && git tag -d reserve/probe
```

**Stand der Messung:** Beim Vorbild ist dieser Lauf am 2026-08-14 durchgeführt und belegt
worden — Reservieren gelang (`* [new tag] reserve/probe`), der Zweitzugriff eines anderen
Strangs auf denselben Anker wurde abgelehnt (`! [rejected] reserve/probe -> reserve/probe
(already exists)`, Exit-Code 1), Aufräumen gelang (`- [deleted] reserve/probe`), Release-Tags
blieben unberührt. **In diesem Repo ist die Probe noch nicht gelaufen.** Die Atomarität ist
damit hier eine begründete Erwartung aus der Git-/GitHub-Mechanik plus eine fremde Messung —
kein eigener Beleg. Wer den ersten Anker setzt, fährt die Probe mit und trägt das Ergebnis
hier ein.

---

## 6. Wenn zwei reservierte Anker gleichzeitig gemergt werden

Die Reservierung sorgt dafür, dass die **Nummern** verschieden sind. Sie verhindert **nicht**,
dass beide Stränge dieselbe Zeile oder denselben Block anfassen. Betroffen sind bei NovaCore
die **Sammelstellen**, die mehrere Vorhaben gemeinsam führen:

| Sammelstelle | Warum sie kollidiert |
|---|---|
| `CHANGELOG.md`, Block `[Unreleased]` | jeder Strang hängt seine Einträge an denselben Block |
| `SSOT-Document-Index.md`, Teil-2-Tabellen | jede neue Wissensdatei fügt am selben Tabellenende an |
| `plugins/nc/module-registry.json` | Segmente `module`/`agents` je Abteilung; `reservierungen` auf Wurzelebene |
| `AGENTS.md` / `README.md`, Repo-Karten | eine Liste, viele Einträge |
| Versionsspiegel (`VERSION`, `plugin.json`, Registry-`version`) | **eine** Zahl, die jeder Bump neu schreibt |

Genau diese Dateien sind deshalb schon heute die **Konfliktzone** des Parallelbaus: Kein
Paketagent fasst sie an, sie werden gebündelt am Zyklusende nachgezogen
(`sync-nachzug-bauzyklus.md`). Kommt es trotzdem zum Textkonflikt, gilt:

**Auflösungsregel für kollidierende Einträge:**

1. **Beide Einträge behalten**, chronologisch bzw. nach Version sortiert. Kein Eintrag darf
   verschwinden — ein verlorener Eintrag ist **still**: Das Artefakt bleibt im Repo, nur seine
   Herkunft fehlt.
2. Bei Versionsstellen die **höhere** Nummer setzen — und in **allen** Spiegelstellen
   dieselbe (`VERSION`, Kern-`plugin.json`, `module-registry.json`; testerzwungen).
3. Reihenfolge-Angaben („nach dem Merge von X") auf den Zielstand des **später** gemergten
   Branches ziehen.
4. Danach die Suite fahren — sie prüft die Versionsdublette und den Versionsgleichstand (§7).

Dieselbe Regel gilt für jede weitere Sammelstelle, die mehrere Vorhaben führt.

---

## 7. Verhältnis zur Testsuite

Die Reservierung ist die **frühe** Absicherung; die **späte** ist eine Invariante in
`plugins/nc/tests/struktur.test.mjs`:

> `test('CHANGELOG: keine Versionsueberschrift doppelt vergeben (spaete Anker-Invariante)')`

Sie extrahiert alle `## [X.Y.Z]`-Überschriften und schlägt an, sobald eine doppelt vorkommt —
also auch dann, wenn niemand reserviert hat und Git die beiden Blöcke konfliktfrei
nebeneinander gemergt hat. Der Testkopf benennt die Rollenteilung ausdrücklich („Die fruehe
Absicherung gegen parallele Doppelvergabe ist der reserve/*-Tag … diese Invariante ist die
SPAETE Ebene"), die Fehlermeldung verweist zur Auflösung auf genau diese Datei. Der Test
trägt eine **eingebaute Gegenprobe**: Er verifiziert die Extraktion erst an einer
synthetischen Dublette, damit ein Regex-Drift ihn nicht still leeren kann.

**Onsites zweite Anker-Invariante entfällt bewusst.** Das Vorbild prüft zusätzlich, ob „der
jüngste Nachtrag in der Spec-Fußzeile verzeichnet" ist. NovaCore führt **keine** Einzel-Spec
mit Fußzeilen-Kette — es gibt nichts, worauf diese Prüfung zeigen könnte. Der Ausschluss ist
im Testkopf und im Bauplan (AP-C2) als **bewusster** Ausschluss vermerkt, damit er nicht als
stille Lücke missverstanden wird.

**Beide Ebenen sind nötig:** Der Tag verhindert die Kollision, bevor gebaut wird; der Test
fängt, was trotzdem durchrutscht. Verlass dich nie auf nur eine davon.

---

## 8. Einordnung in den Standardzyklus

- **Vor dem Bau:** reservieren (§2) — Teil der Vorbereitung, noch vor dem ersten Artefakt.
  Als erster Schritt der Familien-Verdrahtung (`os-bau-methode.md`), vor jedem Bau-Prozess.
- **Beim Bau:** die Änderungs-Matrix-Zeile des
  [`aktualisierungs-index.md`](aktualisierungs-index.md) sagt, was der gewählte Anker alles
  nach sich zieht; §3 desselben Dokuments regelt, wann eine unveröffentlichte Version
  gemeinsam genutzt werden darf und wann die nächste Nummer Pflicht ist.
- **Nach dem Merge:** aufräumen (§4), im selben Zug wie der gebündelte Executor-Lauf.

---

## 9. Fallen

| Falle | Symptom | Gegenmittel |
|---|---|---|
| Push `already exists` | `rejected`, Exit-Code 1 | Normalfall: lokalen Tag löschen, nächsten Anker, erneut pushen (§2) |
| Lokaler Tag nach Reject stehen gelassen | der Klon hält einen fremden Anker für seinen | `git tag -d …` **vor** dem nächsten Versuch (§2) |
| Reservierung erst nach Baubeginn | die Kollision ist zu diesem Zeitpunkt schon möglich | vor der ersten Zeile (§2) |
| `ls-remote` bei annotierten Tags | zwei Zeilen, `^{}`-Suffix | Commit über `git rev-parse <tag>^{commit}` (§2) |
| Push ohne Freigabe „weil es ja nur ein Tag ist" | rote Linie verletzt, solange E4 offen ist | Einzel-Freigabe einholen (§3) |
| Verwaister Tag nach Merge/Verwerfen | Anker sieht unnötig belegt aus | Aufräumen gehört in dieselbe Arbeitseinheit (§4) |
| Ruleset schützt versehentlich `reserve/*` | Push der Reservierung scheitert | Pattern vom `main`-/`nc--v*`-Schutz ausnehmen, Probe fahren (§5) |
| Sammelstellen-Konflikt „einer gewinnt" | ein Eintrag geht **still** verloren | beide behalten, sortieren, Suite fahren (§6) |
| Nur Tag **oder** nur Test | Lücke früh oder spät | beide Ebenen (§7) |

---

## 10. Verifikation

| Check | Erwartung |
|---|---|
| `git ls-remote --tags origin "refs/tags/reserve/*"` nach dem Push | der eigene Anker ist sichtbar |
| Zweiter Push desselben Ankers | `rejected — already exists` |
| Nach Merge oder Verwerfen | Tag remote **und** lokal weg |
| `node --test plugins/nc/tests/struktur.test.mjs` | grün — keine doppelte CHANGELOG-Versionsüberschrift, Versionsgleichstand gewahrt |
| Probe `reserve/probe` (einmalig, §5) | `new tag` → `deleted`; Release-Tags unberührt |

---

*Angelegt 2026-08-16 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
[`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`](../grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md),
AP-C2). Portiert aus dem Onsite.ai-OS-Vorbild, gelesen aus `origin/main` des Repos
`Onsite.ai-OS`: `knowledge base/plugin-maintanance-ruleset-source/anker-reservierung.md`
(Prozess) und `knowledge base/project-meta-infos/Onsite.ai-OS-Anker-Reservierung-Definition.md`
(Warum-Dokument); die importierte Prozesskarte
`firmenkernprozesse/prozesskarten/09-anker-reservierung.md` diente als Zweitquelle und ist
nicht normativ. **Benannte Abweichungen vom Original:** (a) Die Freigabe-Ausnahme für
`reserve/*`-Pushes gilt hier **nicht** — Maintainer-Entscheid E4 ist vertagt, bis dahin
Einzel-Freigabe je Push (§3); (b) Onsites zweite Testsuite-Invariante (Spec-Fußzeilen-Glied)
entfällt bewusst, weil NovaCore keine Einzel-Spec mit Fußzeilen-Kette führt — die existierende
späte Ebene ist der CHANGELOG-Dubletten-Test in `plugins/nc/tests/struktur.test.mjs` (§7);
(c) als Anker-Typen treten an die Stelle des Spec-Abschnitts die NovaCore-Bezeichner
Ziel-Version, Skill-/Agent-/Hook-Name, **Abteilungsname** (Registry-Feld `reservierungen`
mit `ui-ux`/`automation`, Bauplan-Nachtrag N6) und die Nachtrags-/Arbeitspaket-Kennung
lebender Baupläne (§1); zusätzlich ist der Schutzprobe-Lauf aus §5 als **beim Vorbild**
gemessen und in diesem Repo **noch offen** gekennzeichnet.*
