# Wissens-Router-Bau — Standardprozess für Router, Sucheindex und Wissens-Zeiger-Hook

> **Verbindlich** für jedes Anlegen oder Ändern eines **Wissens-Routers**
> (`plugins/nc/skills/wissen-*/SKILL.md`), der gemeinsamen **Referenz**
> `plugins/nc/referenz/wissens-router.md`, des **Sucheindex**
> `plugins/nc/hooks/wissen-sucheindex.json` oder des **Wissens-Zeiger-Hooks**
> `plugins/nc/hooks/nc-wissens-hinweis.js`.
>
> **Normative Grundlage:** die [`NovaCore-OS-Node-Doks-Definition.md`](../grundwissen/NovaCore-OS-Node-Doks-Definition.md)
> (Begriff, Knotenbestand, Kontext-Ökonomie-Regel), verankert in der
> [`NovaCore-OS-SSOT-Definition.md`](../grundwissen/NovaCore-OS-SSOT-Definition.md). Das Vorbild
> zitiert hier eine Spec-Randnummer; **eine solche Design-Spec führt NovaCore nicht** — die Norm
> tragen die beiden Definitionsdokumente, die Herleitung das
> [Onsite-Delta-Mapping](../aktive-bauplaene/2026-08-23-onsite-delta-mapping.md) (Positionen D4,
> D7, D25).
>
> **Abgrenzung — das Dateiformat regelt dieser Prozess ausdrücklich nicht.** Zeiger-Regeln,
> Plugin-Grenzen-Auflösung, Kontext-Ökonomie und Hook-Mechanik (Exit-0-Regel, Fail-open,
> Sitzungsmarker) stehen ausgeliefert in `plugins/nc/referenz/wissens-router.md` des
> Kern-Plugins; die Frontmatter-Regeln in `plugins/nc/referenz/skill-authoring.md`. Beide reisen
> mit dem Plugin, weil Skills und Hook sie zur Laufzeit brauchen. Hier geht es um die
> **Prozess-Ebene**: wann ein neuer Router gerechtfertigt ist, was in derselben Änderung
> mitwandert, und was die Suite davon erzwingt.
>
> **Schwestern:** [`subagenten-bau.md`](subagenten-bau.md) (dieselbe Prozess-/Format-Teilung für
> `agents/`) · [`kern-plugin-bau.md`](kern-plugin-bau.md) (Router und Hook sitzen im Kern) ·
> [`aktualisierungs-index.md`](aktualisierungs-index.md) (Änderungsumfang je Änderungsart).
>
> **Kette:** neuer Arbeitsanlass oder verschobene Wissensdatei → **dieser Prozess** →
> [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md)
>
> **Portiert am 2026-08-25 aus Onsite.ai-OS `a9927b2` (Struktur-Paritätsaudit);
> NovaCore-Abweichungen an Ort und Stelle begründet.**

## 1. Einordnung: zwei Klassen sauber trennen

Router-Skills, Referenz, Sucheindex und Hook sind **Produktklasse** (`plugins/**`): Sie reisen im
Plugin-Paket und fallen damit unter die Zwei-Klassen-Buchführung des
[`aktualisierungs-index.md`](aktualisierungs-index.md) §0 — **kein Bump und kein CHANGELOG im
Arbeitsstrang**; beides hebt der Release-Zug (§3.6) aus dem PR-Ergebnismemo ab.

Die Zeiger-Tabellen zeigen dagegen in die **Wissensklasse** des OS-Repos (`knowledge-base/**`).
Ändern sich nur die Zeiger (neue Zeile, verschobener Pfad), ist das trotzdem eine
Produktänderung am Router — der Zeiger steht in der ausgelieferten Datei.

**Affiliate-Grenze:** Wo dieser Prozess von „allen Plugins" oder „allen Abteilungen" spricht,
sind **Affiliate-Plugins** (`kimi-code-plugin-cc`, `mneme-kimi-code`) **nicht** gemeint. Sie
fallen in keine der beiden Klassen, sind nicht an die SSOT angeschlossen und tragen weder Router
noch Sucheindex-Anschluss (Entscheid P-E7, Affiliate-Invariante N1.1 des Delta-Mappings).

## 2. Wann ein neuer Router, wann Erweiterung (der Anlass-Test)

**Faustregel: Ein Router je Arbeitsanlass — nie je Dokument, nie je Ordner.** Ein neuer Router
ist erst gerechtfertigt, wenn **kein** bestehender Anlass passt. Vor jedem Neubau drei Prüfungen:

1. **Trigger-Konkurrenz:** Jede `description` grenzt sich **wechselseitig namentlich** gegen die
   anderen Router ab. Konkurriert ein neuer Anlass mit einem bestehenden Router, wird der
   bestehende **erweitert** (Zeile in seiner Zeiger-Tabelle, ggf. Sucheindex-Eintrag) statt ein
   neuer gebaut.
2. **Overlap gegen Router UND Skills** — insbesondere gegen die Sitzungs-Skills `/nc:start`,
   `/nc:end-session` und `/nc:journal`, die Sitzungsartefakte **schreiben**, sowie gegen
   `/nc:wissen-aendern` als Einstieg in die Änderungs-Matrix. Ein Router liest nur.
   *(NovaCore-Abweichung: Das Vorbild prüft hier zusätzlich gegen einen Firmenwissens-Skill für
   externe Quellen — das OS bringt keinen solchen Skill und keinen MCP-Server mit.)*
3. **Kontext-Budget:** Jede `description` liegt ab Sitzungsstart dauerhaft im Kontext. Die Summe
   aller Router-`description`s ist auf **6.000 Zeichen** gedeckelt und je `description` auf
   **1.024** — beides testerzwungen in `plugins/nc/tests/struktur.test.mjs`. Ein neuer Router muss
   diesen Preis wert sein; meist ist eine Tabellenzeile im bestehenden Router billiger.

**Nicht hier:** ein Zeiger, der nur in einem einzelnen Arbeits-Repo gilt (gehört in dessen
`CLAUDE.md`), und die Frage, *welches Dokument* überhaupt existiert — die beantwortet der
Master-Index, nicht ein neuer Router.

## 3. Ablauf: Router bauen oder erweitern

1. **Anlass-Test** (§2) mit Ergebnis: neuer Router oder Erweiterung — samt Beleg, gegen welche
   bestehenden `description`s abgegrenzt wurde.
2. **Formatregeln laden:** `plugins/nc/referenz/wissens-router.md` (Zeiger-Regeln,
   Plugin-Grenzen-Auflösung, Hook-Mechanik) und `plugins/nc/referenz/skill-authoring.md`
   (**YAML-Falle**: `description` als `>-`-Block).
3. **Router-Datei schreiben oder erweitern:** `description` mit Einsatz-Situation,
   Trigger-Begriffen und Abgrenzungssätzen; Body im Haus-Stil (`## Zweck`, `## Ablauf`,
   `## Regeln`, `## Verifikation`) mit dem zusätzlichen Abschnitt **`## Zeiger`** (Tabelle
   „Quelle ↔ Einschlägig wenn …") zwischen Ablauf und Regeln. Zeiger zeigen grundsätzlich auf
   **Node-Doks**, auf ein einzelnes Blatt nur mit Begründung — Begriffs- und Bestandsquelle ist
   die [`NovaCore-OS-Node-Doks-Definition.md`](../grundwissen/NovaCore-OS-Node-Doks-Definition.md).
   *(Abweichung, offen: Der Abschnitt `## Zeiger` ist im Haus-Stil der `skill-authoring.md`
   heute **nicht** aufgeführt — die vier gebauten Router tragen ihn trotzdem. Bis das dort
   nachgezogen ist, gilt die gelebte Form der vier Bestandsrouter als Vorbild.)*
4. **Sucheindex-Eintrag pflegen** (`plugins/nc/hooks/wissen-sucheindex.json`): `id` eindeutig ·
   `pfad` **relativ zur Repo-Wurzel** des OS-Repos, also mit `knowledge-base/`-Präfix (oder
   `basis: "kern-plugin"` für plugin-interne Ziele) · `titel` + `hinweis` (eine Zeile) ·
   `stichworte` · `router` mit dem Namen eines **gebauten** Routers. Router-Tabelle und Index
   dürfen nicht auseinanderlaufen — wer einen Zeiger anfasst, fasst beide an.
5. **Stichwort-Regeln:** kleingeschrieben und umlautfrei (der Hook faltet ä/ö/ü/ß →
   ae/oe/ue/ss), mindestens vier Zeichen, höchstens acht Stichworte je Eintrag (linke
   Wortgrenze, offenes Wortende). **Umlaut-Plural bekommt ein eigenes Stichwort** (`bauplaene`
   enthält nicht `bauplan`) — dokumentierte Grenze, als Test verankert.
6. **Nachzüge in derselben Änderung** — es gilt die Zeile **„Wissens-Router oder Zeiger-Index
   geändert"** in [`aktualisierungs-index.md`](aktualisierungs-index.md) §2.1: die vier
   Router-SKILL.mds und die Indizes im selben Zug, `plugins/nc/module-registry.json` (Modul
   `wissen`), Plugin-`README.md`, `AGENTS.md`, dazu die Node-Doks-Definition, falls sich der
   **Knotenbestand** oder ein Geltungsbereich ändert. *(NovaCore führt kein Betriebshandbuch;
   die entsprechende Vorbild-Zeile entfällt ersatzlos.)*
7. **Abschluss:** Suite (`node --test plugins/nc/tests/*.test.mjs` — wortgleich) und
   `claude plugin validate plugins/nc --strict`. Die Router- und Sucheindex-Invarianten laufen in
   `struktur.test.mjs` und `nc-wissens-hinweis.test.mjs` mit, nicht im Validator.

## 4. Ergebnis / Output

Nach einem vollständigen Durchlauf existieren — mit Pfad benannt, nicht als Kategorie:

- die neue oder geänderte `plugins/nc/skills/wissen-<anlass>/SKILL.md` mit gefülltem Abschnitt
  `## Zeiger`,
- je neuem Ziel eine Zeile in `plugins/nc/hooks/wissen-sucheindex.json` mit `router`-Feld,
- bei berührter Mechanik die nachgezogene `plugins/nc/referenz/wissens-router.md`,
- die Nachzüge aus §3 Nr. 6, jeweils belegt gegen die Matrix-Zeile,
- ein PR-Ergebnismemo, das den **Produktanteil** kennzeichnet (Aktualisierungs-Index §0).

**Fremdprüfbar** ist der Abschluss daran, dass ein Dritter den Sucheindex öffnet, den neuen
Eintrag findet, dessen `pfad` auf der Platte existiert, dessen `router` gebaut ist — und die
Suite grün läuft.

## 5. Rote Linien

- **Zeiger, nie Inhalt.** Kein Router kopiert Fachinhalt aus der Wissensbasis in seinen Body —
  kopierter Inhalt ist sofort Doppelpflege und driftet.
- **Der Hook ist kein Gate.** Exit 2 würde bei `UserPromptSubmit` den Prompt löschen und ist in
  keinem Pfad zulässig; jeder defekte Zustand führt zu stillem Schweigen (Fail-open). Wer den
  Hook anfasst, hält die Exit-0-Regel und belegt die **Negativprobe**.
- **Router schreiben nichts.** Stand, Journal, Roll-up und Register pflegen die Sitzungs-Skills.
- **Kein Zeiger auf eine Satelliten-SSOT aus dem Kern.** Ein Zeiger auf die Wissensbasis eines
  eigenständigen Kollegen-OS gehört in dessen eigenes Plugin — die Satelliten sind terminal
  (`ssot-aufbau.md` §4a, Invariante I8).
- **Keine Zahlen-Spiegel.** Weder Router noch Referenz nennen, wie viele Dokumente, Knoten oder
  Sucheindex-Einträge es gibt — jede solche Zahl veraltet mit der nächsten Datei
  (Sparsamkeits-Regel des Aktualisierungs-Index).

## 6. Drift-Sicherung — was die Suite heute erzwingt

1. Jeder Pfad des **Sucheindex** existiert real (`nc-wissens-hinweis.test.mjs`).
2. Jeder Sucheindex-Eintrag mit Wissensbasis-Pfad ist zusätzlich im **Master-Index**
   (`SSOT-Document-Index.md`) geführt (ebenda).
3. Die `description`-Summe der vier Router bleibt im Kontext-Budget (`struktur.test.mjs`).
4. Der Hook endet in jedem Pfad mit Exit-Code 0 (`nc-wissens-hinweis.test.mjs`).

**Zwei Lücken gegenüber der Vorbild-Norm, offen benannt statt weggeschrieben:** dass ein
Sucheindex-Eintrag einen **gebauten** Router nennt (der Test verzichtet darauf ausdrücklich, weil
die Router später entstanden), und dass die Pfade der **Router-Zeiger-Tabellen** real existieren
— beides ist heute nicht testerzwungen und bleibt Leseaufgabe dieses Prozesses.

Daraus folgt die Pflegepflicht in Gegenrichtung: **Wissensdatei neu** → prüfen, ob ein Router
oder der Sucheindex den neuen Knoten nennen muss; **verschoben oder gelöscht** → Router-Tabellen
und Sucheindex sind Pflichtnachzug („ein Zeiger auf ein verschobenes Dokument ist schlimmer als
kein Zeiger"). Beide Zeilen stehen in der Änderungs-Matrix (§2.1 und §2.2).

## 7. Verifikation / Abnahme

- [ ] Anlass-Test (§2) durchgeführt und die Abgrenzung gegen die bestehenden `description`s
      benannt.
- [ ] Suite grün — Ausgabe gesehen, nicht behauptet; `claude plugin validate plugins/nc --strict`
      bestanden.
- [ ] Realistischer **Probe-Prompt** gegen den Hook gefahren, Treffer-Zeilen und Injektionstext
      gesichtet. Die Trefferquote der Stichworte ist bewusst ohne Telemetrie — ihre Beurteilung
      bleibt eine Leseaufgabe im Sitzungsverlauf, kein Automatismus.
- [ ] Nachzüge aus §3 Nr. 6 erledigt, je Eintrag mit Fundstelle in der Matrix.
- [ ] PR-Ergebnismemo geschrieben, Produktanteil gekennzeichnet; **kein Bump, kein CHANGELOG im
      Strang** (§1).

---

*Angelegt 2026-08-25 als Port des Onsite-Standardprozesses `wissens-router-bau.md`, live
gelesen aus `origin/main@a9927b2` (Struktur-Paritätsaudit). Die Prozess-Pflichten waren bei
NovaCore bis dahin zwischen Änderungs-Matrix, Node-Doks-Definition und dem Delta-Mapping
verteilt. Bewusste Abweichungen: (a) Spec-Randnummern durch die NC-Definitionsdokumente ersetzt;
(b) die Zwei-Klassen-Buchführung folgt dem NC-Waypoint-Modell (§0/§3.6), nicht der
Vorbild-Fassung; (c) die Betriebshandbuch-Zeile entfällt (NovaCore führt keines); (d) die zwei
Test-Lücken gegenüber der Vorbild-Norm sind benannt statt übernommen; (e) Rubrik
Ergebnis/Output nach `standardprozess-authoring.md` §4 ergänzt.*
