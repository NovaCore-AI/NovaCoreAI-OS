# Standardprozess-Authoring — Standardprozess für Standardprozesse

> **Verbindlich** beim Anlegen oder inhaltlichen Überarbeiten eines Dokuments in
> `knowledge base/plugin-maintanance-ruleset-source/` (Ausnahme: `vorlagen/` — das sind Templates,
> keine Standardprozesse). Gilt **nicht** für reine Wortlaut-Politur ohne Struktur- oder
> Bedeutungsänderung. Normative Grundlage: `CLAUDE.md` (Abschnitt „Repointerne Arbeiten"
> Schritt 2 — „falls ja, ihm folgen; fehlt er … ihn dort dokumentieren") und
> `Aktualisierungs-Index.md` §1 Nr. 4 („Standardprozess-Check").
> **Warum dieses Dokument selbst ein Standardprozess ist:** Die dreizehn vorhandenen Dokumente
> sind an einer gemeinsamen Form entstanden, ohne dass diese Form je aufgeschrieben wurde — jedes
> neue Dokument leitete sie aus dem zuletzt gelesenen Vorbild ab. `**Kette:**` ist so bereits in
> 13 von 14 Dokumenten Standard (einzige Ausnahme: `Aktualisierungs-Index.md`, das die Wurzel der
> Kette ist und keine eigene braucht). Das hier normiert diese gelebte Form, statt sie zu erfinden.
> **Kette:** neue wiederkehrende Änderungsart ohne Prozess erkannt (`Aktualisierungs-Index.md` §1
> Nr. 4 / §6 Selbsttest) → **dieser Prozess** → Zeile in der Änderungs-Matrix des
> `Aktualisierungs-Index` + Zeile im `SSOT-Document-Index.md`

## 1. Anlass — wann greift dieser Prozess, wann nicht

| Fall | Weg |
|---|---|
| Eine wiederkehrende Änderungsart hat noch keinen Standardprozess (Lücke im `Aktualisierungs-Index` §6 Selbsttest) | **dieser Prozess** |
| Ein bestehender Standardprozess bekommt einen neuen Abschnitt oder eine geänderte Ablauf-Reihenfolge | **dieser Prozess** |
| Ein bestehender Standardprozess wird nur sprachlich geschärft, ohne dass sich Gliederung oder Aussage ändert | **nicht hier** — normale Bearbeitung, keine Format-Prüfung fällig |
| Eine **einmalige** Aufgabe braucht eine Anleitung (Bauplan, Vorhaben) | **nicht hier** → gehört nach `Aktive Baupläne/`, nicht in dieses Verzeichnis. Ein Standardprozess ist per Definition wiederholbar; ein Bauplan ist es nicht |
| Ein Formatbaustein ändert sich für **alle** Standardprozesse zugleich (z. B. eine siebte Pflichtrubrik käme hinzu) | **dieser Prozess**, plus Nachzug in **allen** 13 Bestandsdokumenten — eigener, angekündigter Lauf, keine Nebenwirkung eines anderen |

**Abgrenzung:** Formatregeln für *Skills* liegen in `plugins/oai/referenz/skill-authoring.md`, für
*Subagenten* in `plugins/oai/referenz/agent-authoring.md` — beide reisen im Kern-Plugin, weil
Skills/Agenten sie zur Laufzeit brauchen. Standardprozess-Dokumente reisen **nicht** aus, sie
bleiben Wissensklasse im OS-Repo; deshalb steht diese Formatregel hier und nicht im Plugin.

## 2. Kopf-Form (normiert, kein Neubau)

Jedes Standardprozess-Dokument beginnt mit einer Blockquote, die vier Dinge in dieser Reihenfolge
trägt — die ersten drei sind in den 13 Bestandsdokumenten bereits durchgängig gelebt:

1. **Verbindlichkeit + Scope:** Ein Satz, wann das Dokument bindet („Verbindlich, sobald …").
2. **Abgrenzung:** was der Prozess ausdrücklich *nicht* regelt, mit Verweis auf das zuständige
   Dokument (Musterbeispiel: `kriterien-pflege.md` §1-Tabelle, letzte drei Zeilen).
3. **Verweis auf das „Warum":** wenn Systematik und Handgriffe getrennt dokumentiert sind
   (Definitionsdokument vs. Prozessdokument), sagt der Kopf, wo das Warum steht — der Prozess
   selbst bleibt Handgriffe.
4. **`**Kette:**`** — Vorgänger-Prozess/-Anlass → **dieser Prozess** (fett, in der Mitte markiert)
   → Nachfolger-Prozess. Eine Kette ohne Vorgänger beginnt mit dem auslösenden Ereignis in Prosa
   (nicht jeder Prozess hat einen Standardprozess als Vorgänger); eine Kette ohne Nachfolger endet
   explizit auf dem Punkt, an dem die Verantwortung an Review/Integration übergeht.

## 3. Ablauf

1. **Anlass belegen** (§1) — welche Zeile der Tabelle trifft zu, mit Beleg (fehlende Zeile im
   `Aktualisierungs-Index`, Maintainer-Entscheid, oder wiederholt beobachteter Ad-hoc-Vorgang).
2. **Vorbilder lesen, nicht nur überfliegen:** mindestens zwei bestehende Standardprozesse mit
   ähnlichem Scope ganz lesen (Empfehlung: `kriterien-pflege.md` für einen mehrstufigen Prozess mit
   Nachzug-Matrix, `wissens-router-bau.md` für einen kompakten Anlass-Test-Prozess). Ziel ist
   gleiche Kopf-Form, gleiche Zeichensetzung, gleiche Nüchternheit — kein neuer Stil je Dokument.
3. **Skelett füllen**, feste Reihenfolge, keine siebte Rubrik erfinden:
   Kopf (§2) → Anlass → Ablauf → **Ergebnis/Output** (§4 dieses Dokuments) → Regeln/rote Linien
   → Verifikation/Abnahme. Zwischenüberschriften dürfen die Rubriken feiner gliedern (Schritte,
   Tabellen), die sechs Rubriken selbst bleiben vollständig.
4. **Nachzüge bestimmen:** Betrifft der neue/geänderte Prozess eine wiederkehrende Änderungsart,
   bekommt der `Aktualisierungs-Index` eine Zeile, die auf das Dokument verweist (Muster: die
   Kriterienliste-Zeile in `Aktualisierungs-Index.md` §2.1, die auf `kriterien-pflege.md`
   verweist). Trägt das Dokument selbst neues Fachwissen, bekommt es eine Zeile im
   `SSOT-Document-Index.md` (Teil 2, Tabelle `plugin-maintanance-ruleset-source/`).
5. **Länge und Sprache prüfen:** Deutsch, Zeilenlänge orientiert an den Vorbildern (~95 Zeichen),
   keine Grenzfall-Beispiele im ausgelieferten Fließtext, wenn ein Definitionsdokument dafür
   existiert (Muster: `kriterien-pflege.md` §2 Schritt 2, letzter Punkt).
6. **Abnahme fahren** (§7).

## 4. Ergebnis/Output — die eigentliche Lücke

**Das ist die Rubrik, die den 13 Bestandsdokumenten fehlt, und der Grund, warum dieses Dokument
existiert.** Ein Prozess, der nur Anlass, Ablauf und Regeln nennt, beschreibt eine Tätigkeit —
er sagt nicht, woran ein Dritter erkennt, dass sie **abgeschlossen** ist. Ohne benanntes Ergebnis
lässt sich ein Standardprozess nur behaupten, nie abnehmen: Ein Agent, der Schritt 1 bis 5
ausgeführt hat, aber nicht sagen kann, welche SSOT-Zeile jetzt existiert, hat keinen Beleg, nur
eine Erinnerung an eigenes Tun. Genau diese Lücke erzeugt die Drift, die dieses Repo wiederholt
beobachtet hat (Struktur-Umbau 2026-07-29, Skelett-Fehler in `agent-learnings.md`): Prozesse liefen
„gefühlt richtig" ohne dass jemand prüfen konnte, was am Ende wirklich dastand.

Jeder Standardprozess füllt diese Rubrik nach demselben Muster:

1. **Artefakt-Liste:** die konkreten Dateien/Zeilen, die nach einem vollständigen Durchlauf neu
   existieren oder geändert sind — mit Pfad, nicht mit Kategorie. „Eine Zeile im
   `Aktualisierungs-Index` §2.1" ist eine Ergebnis-Aussage; „die Dokumentation ist aktualisiert"
   ist keine.
2. **Trägerzuordnung:** welches SSOT-Dokument welche Art von Zeile danach trägt (Beispiel:
   `wissens-router-bau.md` §5 — vier benannte Invarianten in `struktur.test.mjs`, die veraltete
   Zeiger rot statt still werden lassen).
3. **Fremdprüfbarkeit:** ein Satz, an dem ein Dritter — ohne den Durchlauf selbst gesehen zu haben
   — den Abschluss verifizieren kann (Muster: `kriterien-pflege.md` §7 letzter Punkt, der
   Selbsttest „Wenn ein Teammitglied morgen … anwendet — steht das Ziel-Routing da, oder muss es
   raten?"). Diese Prüfbarkeit ist identisch mit dem, was §7 (Verifikation/Abnahme) danach als
   Checkliste ausformuliert — Ergebnis/Output benennt das **Was**, Verifikation/Abnahme das
   **Womit-prüfen**.

Fehlt diese Rubrik in einem bestehenden Dokument, ist das kein Anlass, es in diesem Lauf
nachzuziehen (§6 dieses Dokuments regelt den Vorrang, Auftrag B dieses Laufs eine reine
Befundliste ohne Änderung) — aber jeder künftige Neubau oder jede inhaltliche Überarbeitung eines
Standardprozesses trägt sie ab sofort verbindlich.

## 5. Regeln / rote Linien

- **Sechs Rubriken, nicht mehr, nicht weniger.** Eine siebte Rubrik ist ein Anzeichen, dass zwei
  Prozesse in einem Dokument stecken — dann eher trennen als eine neue Kategorie erfinden.
- **Kette nie im luftleeren Raum.** Ein Prozess ohne Vorgänger nennt das auslösende Ereignis in
  Prosa; ein erfundener Pseudo-Vorgänger ist schlechter als ein offen benanntes „nichts davor".
- **Keine Grenzfall-Kasuistik im Prozess selbst**, wenn ein Definitionsdokument existiert — der
  Prozess bleibt kurz, weil er zur Laufzeit gelesen wird (Prinzip aus `kriterien-pflege.md` §2
  Schritt 2).
- **Kein Prozess ohne Anlass-Tabelle oder -Test**, der auch den Nicht-Fall nennt (wann *nicht*
  hier) — sonst wächst der Geltungsbereich schleichend.
- **Ergebnis/Output referenziert reale Pfade**, keine Kategorienamen. „Die Wissensbasis ist
  aktualisiert" ist keine prüfbare Aussage.

## 6. Vorrang unter Standardprozessen — **noch nicht in Kraft**

> **Governance-Status:** Dieser Abschnitt ist der **einzige** Teil dieses Dokuments, der **nicht**
> verbindlich ist. Er schließt eine unbesetzte Lücke, folgt aber keinem Maintainer-Entscheid und
> tritt erst mit einem ausdrücklichen GO in Kraft (Ebene-0-Leitplanke: neue Normaussagen brauchen
> ein Maintainer-GO). Bis dahin gilt bei einem Widerspruch zweier Standardprozesse ausschließlich
> Nummer 3 unten: Maintainer fragen. Die Nummern 1 und 2 sind Entscheidungsvorschlag, keine Norm.

Bislang gibt es keine generelle Regel für den Fall, dass zwei Standardprozess-Dokumente sich künftig
widersprechen — `CLAUDE.md` regelt nur die Hierarchie Design-Spec → Feature-Manuals →
Produktarchitektur, nichts für dieses Verzeichnis. **Vorschlag (Maintainer-Prüfung offen):**

1. **Der spezifischere Prozess schlägt den allgemeineren.** Ein Prozess, dessen Anlass-Tabelle den
   Fall namentlich nennt, gewinnt gegen einen Prozess, der ihn nur als Unterfall eines
   allgemeineren Anlasses mitträgt.
2. **Bei gleicher Spezifität gewinnt das jüngere Datum** (Fußzeile „Angelegt …" bzw. letzter
   inhaltlicher Nachtrag).
3. **Ein Widerspruch, der sich damit nicht auflösen lässt, ist ein Maintainer-Fall.** Er wird als
   offener Punkt im betroffenen Dokument eingetragen (Muster: „6.2 Was offen bleibt" in
   `queue-flow.md`) statt eigenmächtig ausgelegt — kein Agent entscheidet Governance-Fragen zweier
   verbindlicher Dokumente allein.

Dieser Abschnitt ist bewusst als Vorschlag markiert: Er folgt nicht aus einem bestehenden
Maintainer-Entscheid, sondern schließt eine bislang unbesetzte Lücke. Vor der ersten Anwendung auf
einen echten Konflikt gehört er zur Abnahme vorgelegt.

## 7. Verifikation / Abnahme

- [ ] Kopf trägt alle vier Elemente aus §2, `**Kette:**` eingeschlossen.
- [ ] Alle sechs Rubriken aus §3 Schritt 3 sind vorhanden und in der festen Reihenfolge.
- [ ] Ergebnis/Output nennt reale Pfade, keine Kategorienamen (§4 Nr. 1).
- [ ] Anlass-Tabelle nennt mindestens einen Nicht-Fall.
- [ ] Zeile im `Aktualisierungs-Index` gesetzt, falls eine wiederkehrende Änderungsart betroffen
      ist; Zeile im `SSOT-Document-Index.md` (Teil 2) gesetzt, falls neues Fachwissen entstand.
- [ ] Länge unter 200 Zeilen, Deutsch, Zeilenlänge an den Vorbildern orientiert.
- [ ] Selbsttest: *Könnte ein Dritter, der nur dieses Dokument liest, nach einem Durchlauf sagen,
      welche konkrete Datei sich geändert hat und woran er das ohne Rückfrage prüft?*

---

*Angelegt 2026-08-22 im Rahmen eines beauftragten Doku-Nachzugs. Anlass: 14 Dokumente in
`plugin-maintanance-ruleset-source/` (13 Standardprozesse + `vorlagen/`) folgen bereits einer
gemeinsamen, ungeschriebenen Form — dieses Dokument schreibt sie fest und schließt die einzige
tatsächlich fehlende Rubrik (Ergebnis/Output). Muster übernommen von `kriterien-pflege.md` und
`wissens-router-bau.md`.*
