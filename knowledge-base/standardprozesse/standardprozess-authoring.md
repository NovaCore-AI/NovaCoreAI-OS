# Standardprozess-Authoring — der Standardprozess für Standardprozesse

> **Verbindlich** beim Anlegen oder inhaltlichen Überarbeiten eines Dokuments in
> `knowledge-base/standardprozesse/` (Ausnahme: der Unterordner `vorlagen/` — das sind
> Bausteine, keine Standardprozesse). Gilt **nicht** für reine Wortlaut-Politur ohne
> Struktur- oder Bedeutungsänderung.
>
> **Normative Grundlage:** [`AGENTS.md`](../../AGENTS.md), Standardzyklus Nr. 3
> („Standardprozess-Check … fehlt er und die Tätigkeit ist wiederkehrend, ihn dort im Anschluss
> dokumentieren") und [`aktualisierungs-index.md`](aktualisierungs-index.md) §1 Nr. 5, der
> denselben Check als Pflichtschritt vor jeder Änderung führt.
>
> **Abgrenzung:** Formatregeln für *Skills* stehen in `plugins/nc/referenz/skill-authoring.md`,
> für *Subagenten* in `plugins/nc/referenz/agent-authoring.md`, für *Wissens-Router* in
> `plugins/nc/referenz/wissens-router.md` — alle drei reisen im Kern-Plugin, weil sie zur
> Laufzeit gebraucht werden. Standardprozess-Dokumente reisen **nicht** aus; sie bleiben
> Wissensklasse im OS-Repo. Deshalb steht diese Formatregel hier und nicht im Plugin.
>
> **Kette:** wiederkehrende Tätigkeit ohne Prozess erkannt (Standardprozess-Check) → **dieser
> Prozess** → Zeile in der Änderungs-Matrix des
> [`aktualisierungs-index.md`](aktualisierungs-index.md) + Zeile im
> [`SSOT-Document-Index`](../SSOT-Document-Index.md) Teil 2 →
> [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md)
>
> **Portiert am 2026-08-25 aus Onsite.ai-OS `a9927b2` (Struktur-Paritätsaudit);
> NovaCore-Abweichungen an Ort und Stelle begründet.**

## 1. Anlass — wann dieser Prozess greift, wann nicht

| Fall | Weg |
|---|---|
| Eine wiederkehrende Tätigkeit hat noch keinen Standardprozess (Befund aus dem Standardprozess-Check) | **dieser Prozess** |
| Ein bestehender Standardprozess bekommt einen neuen Abschnitt oder eine geänderte Ablauf-Reihenfolge | **dieser Prozess** |
| Ein bestehender Standardprozess wird nur sprachlich geschärft, ohne dass Gliederung oder Aussage sich ändern | **nicht hier** — normale Bearbeitung, keine Formatprüfung fällig |
| Eine **einmalige** Aufgabe braucht eine Anleitung (Bauplan, Vorhaben) | **nicht hier** → `aktive-bauplaene/`. Ein Standardprozess ist per Definition wiederholbar, ein Bauplan ist es nicht |
| Ein Begriff soll normiert werden (was etwas *ist*, nicht wie man es *tut*) | **nicht hier** → Definitionsdokument in `grundwissen/` |
| Ein Formatbaustein ändert sich für **alle** Standardprozesse zugleich | **dieser Prozess**, plus Nachzug in **allen** Bestandsdokumenten — eigener, angekündigter Lauf, nie Nebenwirkung eines anderen |

**Geltung der Standardprozesse:** Sie binden den Kern und alle firmeninternen Abteilungen sowie
die eigenständigen Kollegen-OS-Satelliten. **Affiliate-Plugins** (`kimi-code-plugin-cc`,
`mneme-kimi-code`) sind **ausgenommen** — sie sind nicht an die SSOT angeschlossen, tragen keine
Router und keinen Sucheindex-Anschluss (Entscheid P-E7, Affiliate-Invariante N1.1).

## 2. Kopf-Form

Jedes Standardprozess-Dokument beginnt mit einer Blockquote, die vier Dinge in dieser
Reihenfolge trägt:

1. **Verbindlichkeit + Scope:** ein Satz, wann das Dokument bindet („Verbindlich, sobald …").
2. **Normative Grundlage / das „Warum":** wenn Systematik und Handgriffe getrennt dokumentiert
   sind (Definitionsdokument in `grundwissen/` gegen Prozessdokument hier), sagt der Kopf, wo
   das Warum steht — der Prozess selbst bleibt Handgriffe. Musterbeispiel:
   [`kriterien-pflege.md`](kriterien-pflege.md), das auf die Kriterienliste-Definition verweist.
3. **Abgrenzung:** was der Prozess ausdrücklich *nicht* regelt, mit Verweis auf das zuständige
   Dokument — plus die **Schwestern**, also die Nachbarprozesse mit angrenzendem Scope
   (Muster: [`subagenten-bau.md`](subagenten-bau.md), [`ssot-aufbau.md`](ssot-aufbau.md)).
4. **`**Kette:**`** — auslösendes Ereignis oder Vorgänger-Prozess → **dieser Prozess** (fett, in
   der Mitte markiert) → Nachfolger. Eine Kette ohne Vorgänger beginnt mit dem auslösenden
   Ereignis in Prosa; eine Kette ohne Nachfolger endet ausdrücklich auf dem Punkt, an dem die
   Verantwortung an Review oder Integration übergeht.

> **NovaCore-Abweichung, offen benannt:** Die Elemente 1–3 sind in den Bestandsdokumenten
> durchgängig gelebt. Element 4 ist es **nicht** — **kein** Bestandsdokument trägt heute eine
> `**Kette:**`-Zeile; die Nachbarschaft wird stattdessen in Prosa („Schwestern", „Abgrenzung")
> ausgedrückt. Beim Vorbild ist die Zeile Standard. Sie wird hier als Norm **für neue und
> inhaltlich überarbeitete** Dokumente gesetzt; ein rückwirkender Nachzug in die
> Bestandsdokumente ist damit **nicht** beauftragt (§1, letzte Zeile: eigener, angekündigter
> Lauf).

## 3. Ablauf

1. **Anlass belegen** (§1) — welche Tabellenzeile trifft zu, mit Beleg: fehlende Zeile in der
   Änderungs-Matrix, Maintainer-Entscheid oder wiederholt beobachteter Ad-hoc-Vorgang.
2. **Vorbilder lesen, nicht überfliegen:** mindestens zwei bestehende Standardprozesse mit
   ähnlichem Scope ganz lesen — empfohlen [`kriterien-pflege.md`](kriterien-pflege.md) für einen
   mehrstufigen Prozess mit Nachzug-Matrix und [`wissens-router-bau.md`](wissens-router-bau.md)
   für einen kompakten Anlass-Test-Prozess. Ziel ist gleiche Kopf-Form, gleiche Zeichensetzung,
   gleiche Nüchternheit — kein neuer Stil je Dokument.
3. **Skelett füllen**, feste Reihenfolge, keine siebte Rubrik erfinden:
   Kopf (§2) → **Anlass** → **Ablauf** → **Ergebnis/Output** (§4) → **Regeln / rote Linien** →
   **Verifikation / Abnahme**. Zwischenüberschriften dürfen die Rubriken feiner gliedern
   (Schritte, Tabellen); die sechs Rubriken selbst bleiben vollständig.
4. **Nachzüge bestimmen** — bei NovaCore sind es vier, und die ersten beiden sind Pflicht:
   - **Zeile im [`SSOT-Document-Index`](../SSOT-Document-Index.md) Teil 2**, Tabelle
     `standardprozesse/`: Link · Status (`lebend`/`historisch`) · „Relevant wenn …".
     **Testerzwungen** — ohne die Zeile ist `plugins/nc/tests/struktur.test.mjs` rot.
   - **Zeile in der Änderungs-Matrix** ([`aktualisierungs-index.md`](aktualisierungs-index.md)
     §2, meist §2.2 „Konvention/Prozess geändert"), wenn eine wiederkehrende **Änderungsart**
     betroffen ist. Muster: die Kriterienliste-Zeile in §2.1, die auf
     [`kriterien-pflege.md`](kriterien-pflege.md) verweist.
   - **Eintrag im Sucheindex** `plugins/nc/hooks/wissen-sucheindex.json` und ggf. eine Zeile in
     der Zeiger-Tabelle des Routers `/nc:wissen-aendern` — beides Produktklasse, Ablauf in
     [`wissens-router-bau.md`](wissens-router-bau.md). *(NovaCore-Zusatz gegenüber dem Vorbild:
     unsere Zeiger-Schicht ist zweiteilig — Router **und** Prompt-Hook.)*
   - **Pfad-Änderungsindex** `plugins/nc/hooks/pfad-aenderungsindex.json`: Die Klasse
     `standardprozess` existiert bereits; ein neues Dokument braucht dort **keinen** eigenen
     Eintrag (Präfix-Auflösung nach längstem Treffer).
5. **Länge und Sprache prüfen:** Deutsch, nüchtern, keine Emojis; Zeilenlänge an den Vorbildern
   (~95 Zeichen). Keine Grenzfall-Kasuistik im Fließtext, wenn ein Definitionsdokument dafür
   existiert. **Keine Zahlen-Spiegel** — Dokument-, Skill- oder Testzahlen gehören an so wenige
   Orte wie möglich (Sparsamkeits-Regel des Aktualisierungs-Index).
6. **Abnahme fahren** (§6).

## 4. Ergebnis / Output — die Rubrik, die am ehesten fehlt

Ein Prozess, der nur Anlass, Ablauf und Regeln nennt, beschreibt eine **Tätigkeit** — er sagt
nicht, woran ein Dritter erkennt, dass sie **abgeschlossen** ist. Ohne benanntes Ergebnis lässt
sich ein Standardprozess nur behaupten, nie abnehmen: Wer die Schritte ausgeführt hat, aber nicht
sagen kann, welche Index-Zeile jetzt existiert, hat keinen Beleg, sondern eine Erinnerung an
eigenes Tun.

Jeder Standardprozess füllt diese Rubrik nach demselben Muster:

1. **Artefakt-Liste:** die konkreten Dateien und Zeilen, die nach einem vollständigen Durchlauf
   neu existieren oder geändert sind — **mit Pfad, nicht mit Kategorie.** „Eine Zeile im
   `SSOT-Document-Index` Teil 2, Tabelle `standardprozesse/`" ist eine Ergebnis-Aussage; „die
   Dokumentation ist aktualisiert" ist keine.
2. **Trägerzuordnung:** welches Dokument welche Art von Zeile danach trägt und welche Invariante
   sie hält (Muster: [`wissens-router-bau.md`](wissens-router-bau.md) §6 — vier benannte
   Test-Invarianten, die veraltete Zeiger rot statt still werden lassen).
3. **Fremdprüfbarkeit:** ein Satz, an dem ein Dritter den Abschluss ohne den Durchlauf selbst
   verifizieren kann. Diese Prüfbarkeit ist dasselbe, was §6 danach als Checkliste ausformuliert
   — Ergebnis/Output benennt das **Was**, Verifikation/Abnahme das **Womit-prüfen**.

**Bestandslage:** Die meisten Bestandsdokumente tragen diese Rubrik heute nicht. Das ist **kein**
Anlass, sie in einem laufenden Vorgang nachzuziehen — für neue und inhaltlich überarbeitete
Standardprozesse gilt sie ab sofort verbindlich.

## 5. Regeln / rote Linien

- **Sechs Rubriken, nicht mehr, nicht weniger.** Eine siebte Rubrik ist ein Anzeichen, dass zwei
  Prozesse in einem Dokument stecken — dann trennen, statt eine neue Kategorie zu erfinden.
- **Kette nie im luftleeren Raum.** Ein Prozess ohne Vorgänger nennt das auslösende Ereignis in
  Prosa; ein erfundener Pseudo-Vorgänger ist schlechter als ein offen benanntes „nichts davor".
- **Keine Grenzfall-Kasuistik im Prozess selbst**, wenn ein Definitionsdokument existiert — der
  Prozess bleibt kurz, weil er zur Arbeitszeit gelesen wird.
- **Kein Prozess ohne Anlass-Tabelle**, die auch den Nicht-Fall nennt — sonst wächst der
  Geltungsbereich schleichend.
- **Ergebnis/Output referenziert reale Pfade**, keine Kategorienamen.
- **Wissensklasse:** Ein Standardprozess wird **nicht** versioniert und erzeugt **keinen**
  CHANGELOG-Eintrag; seine Aktualität tragen Datumsstempel und Status
  ([`aktualisierungs-index.md`](aktualisierungs-index.md) §0). Wer im selben PR das Plugin
  anfasst, kennzeichnet den Produktanteil im Ergebnismemo.
- **Norm nur mit Auftrag.** Eine neue verbindliche Aussage, die nicht aus einem
  Maintainer-Entscheid oder einem beauftragten Bauplan folgt, wird als **Vorschlag**
  gekennzeichnet (Muster: §7) — kein Agent setzt Governance allein.

## 6. Verifikation / Abnahme

- [ ] Kopf trägt alle vier Elemente aus §2, `**Kette:**` eingeschlossen.
- [ ] Alle sechs Rubriken aus §3 Nr. 3 sind vorhanden, in der festen Reihenfolge.
- [ ] Ergebnis/Output nennt reale Pfade, keine Kategorienamen (§4 Nr. 1).
- [ ] Anlass-Tabelle nennt mindestens einen Nicht-Fall.
- [ ] **Zeile im `SSOT-Document-Index` Teil 2 gesetzt** (testerzwungen); Matrix-Zeile gesetzt,
      falls eine wiederkehrende Änderungsart betroffen ist; Sucheindex-Eintrag und ggf.
      Router-Zeiger nach §3 Nr. 4 gepflegt.
- [ ] `node --test plugins/nc/tests/*.test.mjs` grün — Ausgabe gesehen, nicht behauptet.
- [ ] Deutsch, keine Emojis, Zeilenlänge an den Vorbildern; keine neue Spiegelstelle für eine
      Zahl geschaffen.
- [ ] Selbsttest: *Könnte ein Dritter, der nur dieses Dokument liest, nach einem Durchlauf sagen,
      welche konkrete Datei sich geändert hat — und woran er das ohne Rückfrage prüft?*

## 7. Vorrang unter Standardprozessen — **Vorschlag, nicht in Kraft**

> **Governance-Status:** Dieser Abschnitt ist der **einzige** Teil des Dokuments, der **nicht**
> verbindlich ist. Er schließt eine unbesetzte Lücke, folgt aber keinem Maintainer-Entscheid und
> tritt erst mit einem ausdrücklichen GO in Kraft. Bis dahin gilt bei einem Widerspruch zweier
> Standardprozesse ausschließlich Nummer 3: Maintainer fragen.

Die Quellen-Hierarchie in [`AGENTS.md`](../../AGENTS.md) regelt nur die Ebenen *jüngste
Design-Spec / Bauplan → Standardprozesse → Produktvision*, nichts **innerhalb** dieses Ordners.
**Vorschlag (Maintainer-Prüfung offen):**

1. **Der spezifischere Prozess schlägt den allgemeineren.** Ein Prozess, dessen Anlass-Tabelle
   den Fall namentlich nennt, gewinnt gegen einen, der ihn nur als Unterfall mitträgt.
2. **Bei gleicher Spezifität gewinnt das jüngere Datum** (Fußzeile „Angelegt …" bzw. jüngster
   inhaltlicher Nachtrag) — dieselbe Regel, die §0 des Aktualisierungs-Index für die
   Wissensklasse setzt.
3. **Ein Widerspruch, der sich damit nicht auflöst, ist ein Maintainer-Fall.** Er wird als
   offener Punkt im betroffenen Dokument eingetragen (Muster: die offenen Entscheide in
   [`queue-flow.md`](queue-flow.md) §6) statt eigenmächtig ausgelegt.

---

*Angelegt 2026-08-25 als Port des Onsite-Standardprozesses `standardprozess-authoring.md`, live
gelesen aus `origin/main@a9927b2` (Struktur-Paritätsaudit). Anlass: Die Bestandsdokumente in
`standardprozesse/` folgen bereits einer gemeinsamen, nie aufgeschriebenen Form — dieses Dokument
schreibt sie fest. Bewusste Abweichungen vom Vorbild: (a) dessen Zahlenangaben zum Dokumentbestand
sind nicht übernommen (Sparsamkeits-Regel); (b) die `**Kette:**`-Zeile ist bei NovaCore **nicht**
gelebt und deshalb als Neuerung ohne Rückwirkung markiert statt als Bestandsaufnahme behauptet;
(c) die Nachzugsliste ist um Sucheindex und Pfad-Änderungsindex erweitert, weil NovaCore eine
zweiteilige Zeiger-Schicht führt; (d) die Wissensklassen-Regel (kein Bump, kein CHANGELOG) folgt
dem NC-Waypoint-Modell; (e) der Vorrang-Abschnitt steht als letzter Abschnitt, damit die sechs
verbindlichen Rubriken zusammenhängend lesbar bleiben.*
