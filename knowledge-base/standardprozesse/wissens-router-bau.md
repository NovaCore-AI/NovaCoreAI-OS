# Wissens-Router-Bau — Standardprozess für Router, Sucheindex und Wissens-Zeiger-Hook

> **Verbindlich** für jedes Anlegen oder Ändern eines **Wissens-Routers**
> (`plugins/oai/skills/wissen-*/SKILL.md`), der gemeinsamen **Referenz**
> `plugins/oai/referenz/wissens-router.md`, des **Sucheindex**
> `plugins/oai/hooks/wissen-sucheindex.json` oder des **Wissens-Zeiger-Hooks**
> `plugins/oai/hooks/oai-wissens-hinweis.js`. Normative Grundlage: Spec §15.40;
> Konzeption und Herleitung im (archivierten) Bauplan „SSOT-Präsenz".
> Schwester-Dokument zu `subagenten-bau.md` (dort Prozessebene für `agents/`):
> Das **Dateiformat** der Router (Zeiger-Tabellen, Plugin-Grenzen-Auflösung,
> Kontext-Ökonomie) und die **Hook-Mechanik** (Exit-0-Regel, Fail-open,
> Sitzungsmarker) stehen ausgeliefert in `plugins/oai/referenz/wissens-router.md`
> des Kern-Plugins und reisen mit dem Plugin — hier geht es um die **Prozess-Ebene**:
> wann ein neuer Router gerechtfertigt ist, was in derselben Änderung mitwandert,
> und was die Suite davon testerzwingt.
> **Kette:** **dieser Prozess** → `sync-nachzug-bauzyklus.md`

## 1. Einordnung: zwei Klassen sauber trennen

Router-Skills, Referenz, Sucheindex und Hook sind **Produktklasse** (`plugins/**`):
Sie reisen im Plugin-Paket und fallen damit unter die Zwei-Klassen-Buchführung — **kein Bump, kein
CHANGELOG im Strang** (der Release-Zug hebt beides aus dem PR-Ergebnismemo ab). Die
Zeiger-Tabellen zeigen in die **Wissensklasse** des OS-Repos (`knowledge base/**`);
ändern sich nur die Zeiger (neue Zeile, verschobener Pfad), ist das trotzdem eine
Produktänderung am Router — der Zeiger steht in der ausgelieferten Datei.

## 2. Wann ein neuer Router, wann Erweiterung (der Anlass-Test)

**Faustregel: Ein Router je Arbeitsanlass — nie je Dokument, nie je Ordner.** Ein
neuer Router ist erst dann gerechtfertigt, wenn **kein** bestehender Anlass passt.
Vor jedem Neubau drei Prüfungen:

1. **Trigger-Konkurrenz:** Jede `description` grenzt sich **wechselseitig namentlich**
   gegen alle anderen Router ab. Konkurriert ein neuer Anlass mit einem bestehenden
   Router, wird der bestehende **erweitert** (Zeile in seiner Zeiger-Tabelle, ggf.
   Sucheindex-Eintrag) statt ein neuer gebaut — die Streichung des geplanten
   `wissen-sitzung` (Kollision mit `start`/`end-session`) ist das Muster.
2. **Overlap gegen Router UND Skills** — insbesondere gegen `/oai:firmenwissen-suche`
   (externe Quellen Confluence/Jira) und die Sitzungs-Skills (`start`, `end-session`,
   `journal`), die Sitzungsartefakte **schreiben**. Ein Router liest nur.
3. **Kontext-Budget:** Jede `description` liegt ab Sitzungsstart dauerhaft im Kontext.
   Die Summe aller Router-`description`s ist auf **6.000 Zeichen** gedeckelt und je
   description auf 1.024 — beides testerzwungen. Ein neuer Router muss diesen Preis
   wert sein; meist ist eine Tabellenzeile im bestehenden Router billiger.

## 3. Ablauf: Router bauen oder erweitern (7 Schritte)

1. **Anlass-Test** (§2) mit Ergebnis: neuer Router oder Erweiterung.
2. **Formatregeln laden:** `plugins/oai/referenz/wissens-router.md` (Zeiger-Regeln,
   Plugin-Grenzen) und `plugins/oai/referenz/skill-authoring.md` (YAML-Falle:
   `description` als `>-`-Block).
3. **Router-Datei schreiben/erweitern:** `description` mit Einsatz-Situation und
   Abgrenzungssätzen; Body mit dem dokumentierten fünften Abschnitt `## Zeiger`
   (Tabelle „Quelle ↔ Einschlägig wenn …") zwischen Ablauf und Regeln. Zeiger zeigen
   grundsätzlich auf **Node-Doks** (Knotendokumente), nur ausnahmsweise auf ein
   Blatt — Begriffs- und Bestandsquelle (die vier Knoten samt Geltungsbereich):
   `project-meta-infos/Onsite.ai-OS-Node-Doks-Definition.md`; verankert ist der Begriff
   in `project-meta-infos/Onsite.ai-OS-SSOT-Definition.md`.
4. **Sucheindex-Eintrag pflegen** (`plugins/oai/hooks/wissen-sucheindex.json`):
   `id` eindeutig · `pfad` relativ zur Wissensbasis (oder `basis: "kern-plugin"` für
   Plugin-interne Ziele) · `titel` + `hinweis` (eine Zeile) · `stichworte` · `router`
   mit dem Namen eines **gebauten** Routers. Router-Tabelle und Index dürfen nicht
   auseinanderlaufen — wer einen Zeiger anfasst, fasst beide an.
5. **Stichwort-Regeln:** kleingeschrieben und umlautfrei (der Hook faltet
   ä/ö/ü/ß → ae/oe/ue/ss), mindestens vier Zeichen (linke Wortgrenze, offenes
   Wortende), **Umlaut-Plural bekommt ein eigenes Stichwort** (`bauplaene` enthält
   nicht `bauplan` — dokumentierte Grenze, als Test verankert).
6. **Nachzüge in derselben Änderung** — Zeile „Wissens-Router oder Sucheindex
   geändert" im `Aktualisierungs-Index`: Spec §15.40 (falls Schnitt/Regeln berührt),
   Betriebshandbuch §3 (Skill-Katalog), `plugins/oai/module-registry.json` (Modul
   `wissen`), Plugin-`README.md`.
7. **Abschluss:** Suite (`node --test plugins/oai/tests/*.test.mjs`) und
   `claude plugin validate plugins/oai --strict` — die Router-Invarianten laufen in
   `struktur.test.mjs` mit und werden nur dort rot, nicht im Validator.

## 4. Rote Linien

- **Zeiger, nie Inhalt.** Kein Router kopiert Fachinhalt aus der Wissensbasis in
  seinen Body — kopierter Inhalt ist sofort Doppelpflege und driftet.
- **Der Hook ist kein Gate.** Exit 2 würde bei `UserPromptSubmit` den Prompt löschen
  und ist in keinem Pfad zulässig; jeder defekte Zustand führt zu stillem Schweigen
  (Fail-open). Wer den Hook anfasst, hält die Exit-0-Regel und die Invarianten ein.
- **Router schreiben nichts.** Stand, Journal und Register pflegen die Sitzungs-Skills.
- **Abteilungs-Wissens-Zeiger sind reguliert:** Ein Zeiger auf eine Abteilungs-SSOT
  gehört in das Abteilungsplugin — nach der Hook-Norm W4 (2026-08-21) zulässig, sobald der
  Satellit etabliert ist (spezialisiert, nicht-redundant, nicht-kollidierend) — nicht in
  den Kern.
- **Stufe 3 ist nicht gebaut:** pfad-getriggerte `.claude/rules/` existieren nicht;
  wer sie bauen will, braucht einen eigenen Bauplan und Spec-Nachtrag.

## 5. Drift-Sicherung — was die Suite erzwingt

Vier Invarianten in `plugins/oai/tests/struktur.test.mjs` machen veraltete Zeiger zum
roten Test statt zum stillen Vertrauensverlust:

1. Jeder Pfad, den ein Router, die Referenz oder der Sucheindex nennt, **existiert**
   (unter der Wissensbasis, im Kern-Plugin oder ab Repo-Wurzel).
2. Jeder Sucheindex-Eintrag ist zusätzlich im **Master-Index** (`SSOT-Document-Index.md`)
   geführt und nennt einen **gebauten** Router.
3. Die `description`-Summe bleibt im Kontext-Budget (je ≤ 1.024, Summe ≤ 6.000).
4. Der Hook ist registriert und setzt niemals einen Exit-Code ≠ 0.

Daraus folgt die Pflegepflicht in Gegenrichtung: **Wissensdatei neu** → prüfen, ob ein
Router oder der Sucheindex den neuen Knoten nennen muss; **verschoben/gelöscht** →
Router-Tabellen und Sucheindex sind Pflichtnachzug („ein Zeiger auf ein verschobenes
Dokument ist schlimmer als kein Zeiger"). Beide Zeilen stehen im `Aktualisierungs-Index`.

## 6. Abnahme

Ergebnismemo nach Aktualisierungs-Index §0 (was, warum, Verifikation, Produktanteil gekennzeichnet);
Gegenprobe ist die Suite inklusive der vier Invarianten plus ein realistischer
Probe-Prompt gegen den Hook (Treffer-Zeilen und Injektionstext sichten). Die
Trefferquote der Stichworte ist bewusst ohne Telemetrie — ihre Beurteilung bleibt
eine Leseaufgabe im Sitzungsverlauf, kein Automatismus.

---

*Angelegt 2026-08-17 von Kimi (Kimi Code) auf Weisung Lucas Vöhringer, im Nachzug-PR
zu PR #75 (SSOT-Präsenz, Spec §15.40) — die Prozess-Pflichten waren bis dahin zwischen
Änderungs-Matrix, Plugin-Referenz und Bauplan verteilt. Muster übernommen von
`subagenten-bau.md`.*
