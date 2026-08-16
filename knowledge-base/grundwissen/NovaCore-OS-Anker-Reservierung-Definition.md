# Anker-Reservierung — Definition und Herleitung

> **Zweck:** die verbindliche Erklärung, was ein **Anker** ist, warum parallele
> Arbeitseinheiten ihn kollidieren lassen und warum die Reservierung als **Git-Ref** passiert
> und nicht als Eintrag in einem Dokument.
>
> Abgeleitetes Dokument — bei Widerspruch gewinnen die normativen Quellen (jüngster Bauplan in
> `grundwissen/`, dann `standardprozesse/aktualisierungs-index.md` §3, dann `CHANGELOG.md` als
> Produktstand). **Den operativen Ablauf** — welche Kommandos wann laufen — beschreibt
> [`standardprozesse/anker-reservierung.md`](../standardprozesse/anker-reservierung.md);
> hier steht das *Warum*.

## 1. Was ein Anker ist

Ein **Anker** ist eine Bezeichnung, die im Repo **genau einmal vergeben werden kann** und deren
Wert sich aus einer laufenden Reihe ergibt — nicht aus dem Inhalt, den er bezeichnet.

Der Unterschied ist entscheidend: Ein Dateiname wie `2026-08-15-subagenten-bau.md` folgt aus
dem Inhalt; zwei Arbeitseinheiten kommen dort gar nicht erst in Konflikt, weil sie über
verschiedene Themen schreiben. Ein Anker wie die Kern-Version `0.10.0` folgt dagegen **aus dem
Zählstand** — und den lesen zwei parallele Einheiten identisch, weil sie beide auf denselben
`main` schauen. **Zwei korrekt arbeitende Stränge kommen also zwangsläufig zum selben
Ergebnis.** Das ist keine Nachlässigkeit, das ist die Natur einer fortlaufenden Nummer.

## 2. Die Kollisionsklassen

| Klasse | Beispiel | Wie die Kollision auffällt | Schaden |
|---|---|---|---|
| **Ziel-Version** | beide planen Kern `0.10.0` | beim Bump — oder gar nicht, wenn die eine Einheit zuerst released | eine Version wird zweimal ausgeliefert, oder eine Änderung erreicht das Team nie (kein Bump = kein Auto-Update); im `CHANGELOG.md` stehen zwei `## [0.10.0]`-Blöcke |
| **Skill-/Agent-/Hook-Name** | zwei Einheiten bauen `/nc:queue-kern` | erst zur Laufzeit, wenn zwei Dateien denselben Namespace beanspruchen | still: die Plattform lädt eine Datei, die andere fehlt kommentarlos |
| **Abteilungsname** | zwei Stränge greifen nach `ui-ux` | beim Registry-Merge — oder erst beim Marketplace-Eintrag | Namespace `nc-<abteilung>:` doppelt belegt; Repo-Name, Plugin-Name und Registry-Eintrag müssen nachträglich umgezogen werden |
| **Nachtrags-/AP-Kennung eines lebenden Bauplans** | zwei Nachträge belegen `N8` | beim Merge — **aber nur, wenn beide an derselben Stelle einfügen**; bei etwas Abstand mergt Git beide Abschnitte sauber nebeneinander | zwei Nachträge gleicher Nummer; alle Verweise werden mehrdeutig, Umnummerierung durch alle referenzierenden Dokumente |
| **Index-/Matrix-Zeile** | beide fügen an derselben Stelle eine Zeile ein | beim Merge als Konflikt | meist harmlos — beide Zeilen behalten, fertig |
| **Sammelstelle** (Sonderfall) | der `[Unreleased]`-Block im `CHANGELOG.md`, die Versionsspiegel, die Registry-Segmente | beim Merge als Konflikt — aber die Auflösung ist fehleranfällig | ein Eintrag kann beim Auflösen **still** verlorengehen: Das Artefakt bleibt im Repo, nur seine Herkunft fehlt |

Nur die ersten vier Klassen sind echte Anker und brauchen eine Reservierung. Die fünfte ist ein
gewöhnlicher Merge-Konflikt: sichtbar, harmlos.

**Die sechste ist die Ausnahme, die man nicht übersehen darf.** Eine Sammelstelle kollidiert
**auch dann**, wenn die Anker korrekt reserviert und damit verschieden sind — beide Stränge
schreiben denselben physischen Block neu. Die Reservierung hilft hier nicht; sie ist für die
Namensvergabe zuständig, nicht für den Textkonflikt. Was hier hilft, ist zweierlei: die
**Konfliktzonen-Regel** des Parallelbaus (kein Paketagent fasst `CHANGELOG.md`, `AGENTS.md`,
`README.md`, `SSOT-Document-Index.md`, `module-registry.json` oder eine Versionsdatei an —
Nachzüge laufen gebündelt am Zyklusende, `standardprozesse/sync-nachzug-bauzyklus.md`) und
eine feste **Auflösungsregel** für den Fall, dass es trotzdem knallt (Standardprozess §6).

## 3. Warum ein Dokument die Reservierung nicht trägt

Der naheliegende Reflex ist eine Liste — „trag deine Nummer ein, bevor du baust". Sie
funktioniert nicht, aus zwei unabhängigen Gründen:

1. **Sichtbarkeit.** Ein Dokument im Repo ist für den zweiten Strang erst sichtbar, wenn die
   Reservierung auf `main` gemergt ist. Parallele Arbeit findet aber gerade in **ungemergten
   Branches** statt. Trägt Strang A seine Reservierung in seinen eigenen Branch ein, sieht
   Strang B davon nichts — die Liste dokumentiert die Kollision, sie verhindert sie nicht.
2. **Durchsetzung.** Eine Liste ist ein Appell. Sie wirkt nur, wenn jeder Beteiligte sie liest
   und befolgt — und die Beteiligten sind hier **Agenten mit sitzungsgebundenem Gedächtnis**,
   die einander nicht sehen und beim nächsten Mal nicht wissen, dass es die Liste gibt. Das
   Produkt lehnt dieses Muster an anderer Stelle ausdrücklich ab: Die Kontroll-Schicht ist
   deterministisch gebaut, die KI hat dort kein Veto
   ([`NovaCore-OS-Gates-Definition.md`](NovaCore-OS-Gates-Definition.md)). Für Anker gilt
   dasselbe.

**Merksatz:** Wer erst beim Schreiben nummeriert, kann eine parallele Reservierung
grundsätzlich nicht sehen — unabhängig von seiner Sorgfalt.

**Die eine Ausnahme, die kein Widerspruch ist:** Das Registry-Feld `reservierungen` in
`plugins/nc/module-registry.json` hält Abteilungsnamen (`ui-ux`, `automation`) **dauerhaft**
frei, obwohl es ein Dokument ist. Das funktioniert, weil dort kein Wettlauf stattfindet: Der
Eintrag ist längst auf `main`, er entsteht nicht im Minutentakt neben einem zweiten Strang.
Er beantwortet die Frage „ist dieser Name langfristig vergeben?", nicht „wer war eben zuerst
da?". Die zweite Frage beantwortet nur ein Ref.

## 4. Warum ein Git-Ref es trägt

Die Reservierung ist deshalb ein **Tag** unter `reserve/`:

```
git push origin reserve/nc-0.10.0
```

Drei Eigenschaften, die eine Datei nicht hat:

- **Atomar.** Existiert der Tag bereits, lehnt der Server den Push ab. Es entscheidet nicht
  mehr, wer zuerst ein Dokument liest, sondern wer zuerst pusht — und das ist eine Tatsache,
  keine Vereinbarung. Der reservierende Agent erfährt die Kollision, **ohne je vom anderen
  Strang gehört zu haben**.
- **Sofort sichtbar, ohne Merge.** Ein Tag lebt auf dem Remote, nicht in einem Branch. Er
  braucht keinen PR, keinen Review und kein Merge-Fenster.
- **Ref statt Datei — und nur Refs lassen sich von Schutzregeln ausnehmen.** GitHub schützt
  Ref-Patterns (`main`, `release/*`, `refs/tags/nc--v*`), niemals einzelne Dateipfade. Eine
  Regel „diese eine Datei darf ohne PR gepusht werden" ist konstruktiv nicht möglich; ein
  Ref-Pattern `reserve/*` aus dem Schutz herauszunehmen dagegen ist der vorgesehene Weg. Damit
  funktioniert der Mechanismus unverändert weiter, sobald `main` unter Schutz steht.

**Rote-Linien-Stand bei NovaCore (Abweichung vom Vorbild):** Beim Vorbild ist ein Push unter
`reserve/*` von der Freigabepflicht ausgenommen (Maintainer-Entscheid 2026-08-14) — Begründung:
Der Ref trägt keinen Inhalt, ändert keine Datei und ist folgenlos löschbar; die Regel „kein
Commit/Push ohne Freigabe" zielt auf Inhalt, nicht auf Namensvergabe. **Bei NovaCore ist diese
Ausnahme nicht entschieden.** Sie liegt als Maintainer-Entscheid **E4** im Bauplan 2026-08-15
und ist dort ausdrücklich **vertagt**. Bis dahin braucht jeder `reserve/*`-Push eine
Einzel-Freigabe. Der Mechanismus funktioniert damit, hängt aber an der Verfügbarkeit des
Maintainers — genau der Punkt, den E4 auflösen würde.

## 5. Was der Mechanismus nicht leistet — und was ihn ergänzt

Die Reservierung verhindert die **doppelte Vergabe**. Sie verhindert nicht, dass jemand ohne
Reservierung baut — und sie verhindert nicht den Textkonflikt in Sammelstellen (§2, Klasse 6).
Deshalb steht daneben eine deterministische Prüfung in `plugins/nc/tests/struktur.test.mjs`:

- **keine CHANGELOG-Versionsüberschrift doppelt vergeben** („späte Anker-Invariante") — der
  Test gegen die Kollision selbst, mit eingebauter Gegenprobe gegen eine synthetische Dublette,
  damit ein Regex-Drift ihn nicht still leert.

**Onsites zweite Invariante** („der jüngste Nachtrag ist in der Spec-Fußzeile verzeichnet")
**entfällt bewusst**: NovaCore führt keine Einzel-Spec mit Fußzeilen-Kette, es gäbe nichts,
worauf die Prüfung zeigen könnte. Der Ausschluss ist im Testkopf und im Bauplan (AP-C2)
vermerkt — bewusster Ausschluss statt stiller Lücke.

Zusammengenommen:

- **Der Tag** fängt die Kollision **früh** (vor dem Bau) und **ohne Kenntnis des anderen
  Strangs**.
- **Der Test** fängt sie **spät, aber sicher** — auch dann, wenn niemand reserviert hat und
  Git die beiden CHANGELOG-Blöcke sauber nebeneinander gemergt hätte.

Der Test ist dabei der robustere Teil: Er wirkt auch gegen Stränge, die den Prozess gar nicht
kennen. Der Tag ist der billigere: Er kostet einen Push statt einer Umnummerierung durch alle
referenzierenden Dokumente. **Verlass dich nie auf nur eine der beiden Ebenen.**

## 6. Belegter Anlass

Der Anlass stammt aus dem Vorbild und ist der Grund, warum dieser Prozess portiert wurde. Am
**2026-08-14** liefen dort zwei Arbeitseinheiten parallel: eine Satelliten-Extraktion und ein
Standardprozess-Bau. Beide schrieben einen Spec-Nachtrag, beide belegten denselben
Spec-Abschnitt, beide planten dieselbe Kern-Version. Keiner der beiden Stränge hat etwas falsch
gemacht — beide haben den korrekten nächsten freien Anker aus `main` abgeleitet. Aufgefallen
ist es erst beim Merge; die Korrektur kostete eine Umnummerierung durch fünf Dokumente.

**Die Lehre ist nicht „sorgfältiger arbeiten".** Beide Stränge waren sorgfältig. Die Lehre ist,
dass ein knapper Anker einen Vergabe-Mechanismus braucht, sobald mehr als eine Arbeitseinheit
gleichzeitig läuft — und im Multi-Agent-Betrieb ist das der Normalfall, nicht die Ausnahme.

**Bei NovaCore ist die Lehre vorbeugend übernommen**, nicht durch einen eigenen Vorfall
erzwungen. Der bisherige Ersatz war eine **Vorab-Zuweisung** der Zielversionen je Bauphase
(Bauplan 2026-08-15, Entscheid E6: A→0.8.0, B→0.9.0, C→0.10.0 …) — ausdrücklich als
„Ersatz-Anker für das Fenster vor AP-C2" deklariert, mit der Auflage, dass zwei Phasen nur
parallel laufen dürfen, wenn ihre Zielversionen vorab festgeschrieben sind. Das ist genau die
Liste aus §3, nur klein genug, um zu funktionieren: **ein** Planer, **ein** Dokument, alle
Nummern auf einmal. Sie skaliert nicht auf beauftragte Agenten, die einander nicht sehen.

## 7. Abgrenzungen

- **Anker-Reservierung vs. Worktree-Isolation:** Worktrees trennen den **Arbeitsplatz** (zwei
  Stränge stören sich nicht auf der Platte). Sie trennen **nicht** den Namensraum — beide
  Worktrees leiten denselben nächsten freien Anker ab. Die Reservierung ist die fehlende
  zweite Hälfte.
- **Anker-Reservierung vs. Merge-Konflikt:** Ein Merge-Konflikt ist sichtbar und wird
  aufgelöst. Eine Anker-Kollision kann **konfliktfrei durchmergen** und trotzdem falsch sein.
  Deshalb genügt „Git wird es schon melden" hier nicht.
- **Reservierungs-Tag vs. Release-Tag:** Release-Tags (`nc--v0.9.0`) sind Produktgeschichte und
  bleiben für immer; sie entstehen erst **nach** dem Merge auf `main`
  (`aktualisierungs-index.md` §3.6). Reservierungs-Tags (`reserve/nc-0.10.0`) sind
  Arbeitszustand und werden nach dem Merge gelöscht — das Artefakt selbst ist dann der Beleg.
- **`reserve/*`-Tag vs. Registry-Feld `reservierungen`:** Der Tag reserviert **kurzlebig für
  die Dauer eines Baus** und wird aufgeräumt; das Registry-Feld reserviert **dauerhaft einen
  Namen ohne laufendes Vorhaben** (heute `ui-ux` und `automation`, Bauplan-Nachtrag N6) und
  bleibt stehen, bis das Plugin wirklich entsteht. Wer eine dieser Abteilungen baut,
  reserviert **zusätzlich** per Tag — erst dann konkurrieren Stränge um denselben Namen.
- **Anker-Reservierung vs. Kontroll-Schicht:** Die Gates
  ([`NovaCore-OS-Gates-Definition.md`](NovaCore-OS-Gates-Definition.md)) wirken **innerhalb**
  einer Session gegen unbelegte oder destruktive Aktionen. Die Anker-Reservierung wirkt
  **zwischen** Sessions, die einander nicht sehen. Kein Gate kann eine Anker-Kollision
  bemerken: Beide Stränge tun für sich genau das Richtige.

---

*Angelegt 2026-08-16 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
[`2026-08-15-onsite-endstand-nachbau-bauplan.md`](2026-08-15-onsite-endstand-nachbau-bauplan.md),
AP-C2). Portiert aus dem Onsite.ai-OS-Vorbild, gelesen aus `origin/main` des Repos
`Onsite.ai-OS`: `knowledge base/project-meta-infos/Onsite.ai-OS-Anker-Reservierung-Definition.md`
(Herleitung) und `knowledge base/plugin-maintanance-ruleset-source/anker-reservierung.md`
(Prozess); die importierte Prozesskarte
`firmenkernprozesse/prozesskarten/09-anker-reservierung.md` diente als Zweitquelle und ist
nicht normativ. **Benannte Abweichungen vom Original:** (a) Die Freigabe-Ausnahme für
`reserve/*`-Pushes ist bei NovaCore **nicht entschieden** (Maintainer-Entscheid E4 vertagt) —
bis dahin Einzel-Freigabe je Push (§4); (b) Onsites zweite Testsuite-Invariante
(Spec-Fußzeilen-Glied) entfällt bewusst, weil NovaCore keine Einzel-Spec mit Fußzeilen-Kette
führt — die existierende späte Ebene ist der CHANGELOG-Dubletten-Test in
`plugins/nc/tests/struktur.test.mjs` (§5); (c) die Kollisionsklassen sind auf die realen
NovaCore-Anker gemappt — Ziel-Version, Skill-/Agent-/Hook-Name, **Abteilungsname**
(Registry-Feld `reservierungen`, Bauplan-Nachtrag N6) und die Nachtrags-/AP-Kennung lebender
Baupläne statt des Spec-Abschnitts (§2). Der belegte Anlass (§6) ist ausdrücklich der des
Vorbilds; bei NovaCore ist die Lehre vorbeugend übernommen.*
