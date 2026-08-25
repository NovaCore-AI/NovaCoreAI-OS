# development — Abteilungs-CLAUDE (Ebene 2)

## Teil 1 — Für alle Sessions der Abteilung

### Identität und Auftrag

Die Abteilung `development` trägt den Software-Entwicklungszyklus: Auftrag oder Ticket
verstehen, in Pull-Request-große Scheiben planen, test-first umsetzen, vor dem Commit prüfen,
Pull Request stellen, fremdprüfen lassen, das Ergebnis in der Zielumgebung abnehmen und ein
Release vorbereiten und nachverifizieren. Gearbeitet wird im **GitHub-Flow** der Organisation
`NovaCore-AI`: Auftrag/Issue → Feature-Branch → Pull Request → Review → Merge nach `main`.
Ausdrücklich **nicht** zur Abteilung gehören der Betrieb des Produktivsystems (Deploy,
Datenbank, Webhooks), Kundenkommunikation und alles Kundensichtbare sowie die Felder, für die
eigene Abteilungsnamen reserviert sind (Design/UX, Automatisierung) — sie werden benannt und
abgegeben, nicht mitgemacht.

### Rote Linien der Domäne

Die roten Linien des OS gelten immer und werden hier nicht wiederholt (Ebene 1/1b).
Domänenspezifisch kommen die Linien des Produktivsystems **WZS** hinzu — wortgleich zur
`pflege-auspraegung.json` an der Wurzel dieses Plugins, die dieselben Sätze deklarativ für die
Pflege-Skills des Kerns führt. Ändert sich eine Linie, werden beide Orte im selben Zug
nachgezogen:

- Deploys am WZS-Produktivsystem führt ausschließlich der Mensch aus.
- Eingriffe in die Datenbank des WZS-Produktivsystems führt ausschließlich der Mensch aus.
- Änderungen an Webhooks des WZS-Produktivsystems führt ausschließlich der Mensch aus.

Grund: Ein Fehlgriff dort trifft laufenden Geldfluss und Kundendaten und ist nicht durch einen
Revert zu heilen. Die Skills `rel-vorbereitung` und `rel-verifikation` bereiten solche
Eingriffe vor bzw. belegen sie im Nachgang read-only; ausgelöst werden sie nie von einem
Agenten. Welcher Skill welche Linie trägt, steht in der `workflow.md` dieses Plugins.

### Routing in die Wissensbasis

Einstieg ist immer der **Dokuindex** der zuständigen Wissensbasis — erst triagieren, dann
lesen.

- Zuständig ist die Wissensbasis des **OS-Repos** (`knowledge-base/SSOT-Document-Index.md`);
  lokal liegt sie als **Lesekopie** unter `~/.nc/ssot/`, angelegt und nachgezogen von
  `/nc:setup`. Eine eigene Abteilungs-Wissensbasis hat diese repo-interne Abteilung nicht.
- **Sitzungswissen** (Stand, Journal, offene Stränge) wohnt im **OS-Repo** unter
  `knowledge-base/sitzungswissen/`, weil diese Abteilung repo-intern ist und das OS-Repo eine
  eigene Wissensbasis führt; in einem fremden Arbeits-Repo ohne eigene Wissensbasis legt das
  OS nichts an — dessen Projekt-Memory trägt den Stand allein, kein Dateistrom. Geschrieben
  und gelesen wird der zutreffende Fall von `/nc:start` bzw. `/nc:end-session`.
- **Pflegekandidaten** klassifiziert `/nc:end-session`. Queue-Pfad, Kriterienverweis und
  Übergangsregel dieser Abteilung stehen deklarativ in `pflege-auspraegung.json` dieses
  Plugins; ein eigener Abteilungs-Queue-Skill ist nicht vorgesehen.
- **Firmenweites, Kern-Regeln und Produktstand** stehen in den Ebenen 1/1b und werden hier
  nicht wiederholt.

### Fachablauf

Die WP-Zuordnung der Abteilung samt Trigger-Matrix steht in `workflow.md` desselben Plugins;
der Rahmen WP0–WP8 bleibt im Kern (`wp-rahmen.md` des Kern-Plugins `nc`). Diese Datei
wiederholt beides nicht.

### Werkzeuge und Konnektoren der Abteilung

- **GitHub, Organisation `NovaCore-AI`** (Repos, Issues, Pull Requests, Actions-CI): Lesen
  frei · lokale Branches und Commits nach Bestätigung · Push und PR-Anlage führt der Agent
  **nur nach ausdrücklicher Einzelfreigabe** aus (Ablauf: `flc-pr`) ·
  **Review-Approval, Review-Resolve, Merge und Release bleiben ausschließlich menschliche
  Handlungen**.
- **Jira (Atlassian), Zwei-Stufen-Regel:** Lesen frei · **Stufe 1** (Transitionen, Felder) nur
  mit Einzelfreigabe je Vorgang · **Stufe 2** (kundensichtbare Freitexte, Kommentare) nur der
  Mensch. **Offen:** Die Projekt-Key(s) sind noch nicht benannt und werden vom Maintainer
  nachgereicht — bis dahin wird kein Key geraten, sondern der Vorgang beschrieben.
- **Kein MCP-Server im Lieferumfang des OS.** Jeder Schritt, der einen optionalen Konnektor
  voraussetzt, gilt als „wo vorhanden, sonst manuell"; den manuellen Weg schreibt der jeweilige
  Skill aus.
- **Produktivsystem WZS:** kein Agenten-Zugang. Die `wzs-*`-Skills sind Invarianten-Checklisten
  für Umsetzung und Review, kein Betriebszugang; ihre Fachfakten stehen im Arbeits-Repo, nicht
  hier.

## Teil 2 — Werkstatt: wer an diesem Plugin baut

Gilt **nur** für Sitzungen, die am Abteilungsplugin selbst arbeiten (Skills bauen, Ausprägung
pflegen, Plugin veröffentlichen) — nicht für die Alltagsarbeit der Abteilung.

- **Schreibmodell:** regulärer Branch-/PR-Fluss des OS-Repos; **Merge, Tag und Release bleiben
  rote Linie** (Rolle Maintainer/Admin). Kein Push ohne ausdrückliche Freigabe.
- **Skill-Bau:** strikt nach `referenz/skill-authoring.md` des Kern-Plugins `nc`; Module sind
  Namenspräfixe, flaches Layout, keine Hooks (die Kontroll-Schicht liegt testerzwungen im
  Kern). Ein neues Modul braucht zusätzlich den Registry-Eintrag im Kern — der läuft über den
  Nachzug am Zyklusende, nicht nebenbei.
- **Version:** jede Änderung, die das Team erreichen soll, zählt `.claude-plugin/plugin.json`
  **dieses** Plugins hoch — plus CHANGELOG-Eintrag im OS-Repo. Kein Bump = kein Auto-Update.
  Auch eine Änderung an dieser Datei ist eine Payload-Änderung und braucht den Bump.
- **Validierung vor jedem Commit-Vorschlag:** `claude plugin validate` für dieses Plugin mit
  `--strict` plus die Testsuite des Repos. Änderungen an Kern-Mechanik gehören nicht hierher,
  sondern als Anforderung an den Kern.
