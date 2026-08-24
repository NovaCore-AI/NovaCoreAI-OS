# OS-Bau-Methode — wie NovaCore ein Firmen-OS plant und baut

> **Zweck:** Wiederverwendbare Methode, mit der ein Team-Betriebssystem für KI-Arbeit
> (Claude-Code-Plugin-Familie + Marketplace) geplant, gebaut und gepflegt wird — destilliert
> aus zwei realen Durchläufen: NovaCore-OS v0.1–v0.2 (Erstbau) und Onsite.ai-OS v0.1–v0.8
> (Multi-Plugin-Reife). Die Methode ist das Produktwissen der Firma: Sie wird mit jedem
> Durchlauf nachgeschärft (Abschnitt „Pflege") und Schritt für Schritt an die eigene
> Firmenphilosophie angepasst (Abschnitt „Stellschrauben").
> **Stand:** 2026-07-28 · Pflege: NovaCore AI.

---

## Die Methode in einem Satz

Erst die **Vision festschreiben**, dann die **Grenzen schneiden** (Marketplace → Plugin →
Modul → Skill), dann die **Regeln bauen, bevor Masse entsteht** (Normdokumente, Kontroll-Hooks,
Struktur-Tests) — und ab da wächst das OS nur noch entlang realer Use Cases, nie auf Verdacht.

## Phase 0 — Vision festschreiben (einmalig, maschinenlesbar)

- Die Produktvision als **eigenes Dokument** in `knowledge-base/grundwissen/` ablegen
  (hier: `NovaCore-OS-Produktarchitektur.md`, sechs Schichten). Maschinenlesbar, damit jeder
  Agent Vision-Abgleiche fahren kann.
- Jede spätere Stand-Aussage wird gegen **drei Ebenen** geprüft: Vision ↔ Spec ↔ gebaute
  Artefakte. (Onsite-Lehre: Wer nur Spec ↔ Build abgleicht, übersieht, dass die Spec selbst
  hinter der Vision zurückbleibt.)

## Phase 1 — Ist-Analyse und Vorbilder

1. **Referenzsysteme benennen** und ihre Rolle trennen: Methodik-Vorbild (Workflow-Disziplin)
   vs. Architektur-Vorbild (Struktur). Nie vermengen.
2. **Mechanik-Fakten nur aus der Live-Quelle:** Vor jeder Format-Entscheidung die offizielle
   Doku abrufen (code.claude.com/docs: `plugins-reference`, `plugin-marketplaces`, `skills`)
   und die Fakten **mit Abrufdatum** in die Normdokumente schreiben. Trainingswissen ist
   potenziell veraltet — die Live-Quelle gewinnt immer.
3. **Fehlerprotokolle der Vorgänger lesen** (`debugging-findings/agent-learnings.md` beider
   Repos): bekannte Fallen (YAML-Plain-Scalar, Validierungs-Lücken, Marker-Kollisionen,
   `node --test`-Aufrufform) sind Baukosten, die man nur einmal bezahlen muss.

## Phase 2 — Grenzen schneiden (die Architektur-Entscheidung)

Vier Ebenen, jede mit genau einer Verantwortung:

| Ebene | Grenze | Entscheidet über |
|---|---|---|
| **Marketplace** | ein Repo = eine Verteilquelle | wer was installieren KANN; Versionstracking, Auto-Update |
| **Plugin** | Plugin-Grenze = Abteilungsgrenze | wer was aktiviert HAT — die einzige echte Aktivierungsgrenze |
| **Modul** | Namenspräfix innerhalb eines Plugins | fachliche Gruppierung je Arbeitsprozess/Leistungsfeld |
| **Skill** | eine Datei, ein Arbeitsschritt | die geprüfte Arbeitsanleitung selbst |

Regeln, die sich in beiden Durchläufen bewährt haben:

- **Ein Kern-Plugin** trägt die ständige Abteilung (Session-Zyklus), die Kontroll-Hooks, den
  WP-Rahmen, die Registry und die Formatregeln. Jedes Abteilungsplugin deklariert
  `dependencies: ["<kern>"]` — die ständige Abteilung ist damit technisch erzwungen.
- **Hooks nur im Kern.** Die Plattform aggregiert Hooks aller aktiven Plugins; ohne diese
  Regel feuern Gates mehrfach.
- **Version je Plugin an genau einer Stelle** (`plugin.json`); Marketplace-Einträge ohne
  `version`-Feld. Kein Bump = kein Auto-Update.
- **Keine eigene Setup-/Update-CLI.** Verteilung ist Marketplace-Mechanik; jede
  Parallel-Infrastruktur (Staging-Verzeichnisse, Deploy-Manifeste, Marker-Installationen)
  ist doppelte Wahrheit und rottet.
- **Registry ist Metadaten-SSOT, nie Steuerung.** Was ein Nutzer bekommt, entscheidet allein,
  welche Plugins er installiert hat.

## Phase 3 — Regeln vor Masse (Normdokumente zuerst)

Bevor der erste fachliche Skill entsteht, existieren:

1. **`skill-authoring.md`** (im Kern, wird mit ausgeliefert): Frontmatter-Constraints inkl.
   YAML-Falle, Gliederung Zweck/Ablauf/Regeln/Verifikation, Längenlimits, dritte-Person-
   Trigger, Verbot von Pfaden über die Plugin-Grenze, Merge-Checkliste.
2. **`kern-plugin-bau.md`** und **`abteilungs-plugin-bau.md`** (Standardprozesse, seit
   2026-08-11 zweigeteilt): Scope und Governance-Schichten des Kerns samt Autosync-Prozess ·
   Architektur-Invarianten, Mechanik-Fakten mit Abrufdatum, Auslieferungsgrenze, Ablauf „neue
   Abteilung anlegen", Satelliten-Extraktion, Fehlertabelle. Daneben **`ssot-aufbau.md`**
   (Aufbau der Wissensbasis) und **`sync-nachzug-bauzyklus.md`** (gebündelte Nachzüge).
3. **`wp-rahmen.md`** (im Kern): der Pflicht-Zyklus WP0–WP8 mit roten Linien und
   Freigabe-Politik. Jede Abteilung übersetzt WP1–WP7 in ihrer `workflow.md`.
4. **Vorlage `vorlagen/abteilungsplugin/`** (`.vorlage`-Endungen, außerhalb `plugins/`):
   abgeleitet aus real gebauten Plugins, nie spekulativ.

Warum diese Reihenfolge: Formatregeln mit falschen Beispielen reproduzieren ihren Fehler in
jedem neuen Skill (Onsite: 19 von 22 Skills mit toter Frontmatter). Regeln sind ausführbarer
Code — sie zuerst, und gegen den echten Parser geprüft.

## Phase 4 — Kontroll-Schicht (deterministisch, KI hat kein Mitspracherecht)

- **FFG (Fact-Forcing-Gate):** Fakten vorlegen, bevor gehandelt wird — Datei-Gate,
  Destruktiv-Gate, Routine-Bash-Gate. Markerlos aktiv, Opt-out nur per Env-Schalter für
  Menschen; fail-open bei internen Fehlern (ein kaputter Hook darf kein Repo lahmlegen);
  verschärft nur, lockert nie (kein „allow"-Output).
- **Session-Hinweise** (SessionStart) dürfen Marker-gebunden bleiben — Komfort ist scope-bar,
  Gates sind es nicht.
- Firmenspezifische Destruktiv-Muster über eine Env-Variable (`*_FFG_EXTRA_DESTRUCTIVE`)
  statt Code-Fork.

## Phase 5 — Qualität als Struktur, nicht als Appell

1. **Struktur-Invarianten als Testsuite** (`node --test plugins/<kern>/tests/*.test.mjs`):
   Manifest↔Platte-Abgleich, Dependencies-Topologie, „Hooks nur im Kern",
   Frontmatter-Parsbarkeit, Plugin-Grenzen-Verbot, Versions-Gleichstand, Vorlagen-Hygiene.
   Alles, was Policy ist und die Plattform nicht erzwingt, wird hier mechanisch.
2. **Validierung beider Ebenen:** `claude plugin validate .` **und**
   `claude plugin validate plugins/<name> --strict` je Plugin — die Wurzel-Variante prüft
   keine Skills.
3. **Install-Probe** in isoliertem `CLAUDE_CONFIG_DIR` vor jedem Team-Rollout: Kern kommt
   transitiv, nicht installierte Abteilungen bleiben unsichtbar.
4. **Externes Review, Implementierer ≠ Reviewer**, vor jedem Merge; destruktive Codepfade
   brauchen adversariale Fixtures (Fremddaten daneben, deren Überleben assertiert wird).

## Phase 6 — Wissensbasis und lebende Doku

- **Kategorien** in `knowledge-base/` (Pfade ohne Leerzeichen): `grundwissen/` (Vision,
  Specs, Pläne — Datumspräfix, jüngste Spec = Planungsstand), `standardprozesse/`
  (verbindliche Abläufe), `debugging-findings/` (Fehlerprotokoll, append-only). Kategorien
  wachsen bei Bedarf (z. B. `feature-manuals/` für Drittsystem-Wissen).
- **Lebende Doku ist abgeleitet** (CLAUDE.md, AGENTS.md, README): Quelle der Wahrheit sind
  Repo-Struktur, Manifeste, CHANGELOG, Spec. Eine **Sync-Matrix** in der CLAUDE.md legt fest,
  welche Änderung welche Doku nachzieht — in derselben Änderung, nicht „später".
- **Fehlerprotokoll-Pflicht:** Jeder Agenten-Fehler wird sofort protokolliert; vor neuen
  Aufgaben werden bekannte eigene Fehlermuster gelesen.
- **Historisch bleibt historisch:** Alte Specs, CHANGELOG-Einträge und Findings werden nie
  rückwirkend umgeschrieben.

## Phase 7 — Wachstum: Sandbox, Fork-back, Satelliten

- **Sandbox:** Jeder baut eigene Skills nach den OS-Regeln (eigener Präfix), ohne den Kern
  anzufassen. Bewährtes wandert per **Fork-back** ins OS — so entsteht nur, was ein realer
  Use Case verlangt.
- **Neue Abteilung:** Vorlage instanzieren → Marketplace-Eintrag → Registry → Validierung
  beider Ebenen → Install-Probe → Doku-Sync (Standardprozess `abteilungs-plugin-bau.md`).
- **Satellit:** Wächst eine Abteilung aus dem Zentral-Repo heraus (eigenes Team, eigene
  Vertraulichkeit), zieht sie in ein eigenes privates Repo; der Marketplace pinnt per
  GitHub-Source mit vollem Commit-SHA (`ref` nur zur Lesbarkeit). SSH-Falle beim Rollout
  privater Satelliten beachten (`CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`).

## Stellschrauben für die Firmenphilosophie

Die Methode ist bewusst parametrisierbar — das sind die Stellen, an denen NovaCore sie nach
und nach zur eigenen macht, ohne die Struktur zu brechen:

| Stellschraube | Frage an die Firma | NovaCore-Setzung (Stand heute) |
|---|---|---|
| **Rote Linien** | Was darf die KI nie selbst? | Push/Merge/Post/Release/Deploy nur mit Freigabe |
| **WP-Tiefe** | Wie viel Prozess-Zwang pro Abteilung? | Rahmen WP0–WP8 schlank; Fachtiefe je `workflow.md` |
| **Modul-Schnitt** | Nach Prozess-Stufen (Onsite: feat/mr/rev/qs/rel) oder Leistungsfeldern (NovaCore: fe/be/flc/wzs)? | Leistungsfelder + Lifecycle-Modul |
| **Gate-Schärfe** | deny (Fakten erzwingen) vs. ask (nur bestätigen)? | FFG deny; Session-Hinweis Komfort |
| **Scoping** | Gates überall oder nur in markierten Repos? | Gates markerlos, Komfort Marker-gebunden |
| **Memory-Ort** | Wo lebt Projektgedächtnis? | Projekt-Memory im Arbeits-Repo (kein Dateistrom mehr); im OS-Repo selbst committet unter `sitzungswissen/` der Wissensbasis |
| **Sprache/Ton** | Artefakt-Sprache, Du/Sie, Terminologie | Deutsch, direktiv-imperativisch |
| **Review-Regime** | Wer reviewt was, wann extern/adversarial? | Implementierer ≠ Reviewer; kritischer Pfad dual |
| **Versions-Schema** | Wann Minor/Patch/Major? | Neuerung → Minor, Fix → Patch, Strukturbruch → groß |

## Familien-Verdrahtung der Standardprozesse (Kurzkarte)

Die Standardprozesse dieses Ordners rufen einander in festem Takt auf (Onsite-Vorbild:
eigene „Familienkarte"; hier bewusst als Kapitel statt eigener Datei — Entscheid E5,
Bauplan 2026-08-15):

1. **Bei Parallelität zuerst** [`anker-reservierung.md`](anker-reservierung.md) — knappe
   Bezeichner (Version, Skill-/Agent-/Hook-Name, Abteilungsname) vor der ersten Zeile
   reservieren.
2. **Dann der Bau-Prozess:** [`kern-plugin-bau.md`](kern-plugin-bau.md) ·
   [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md) ·
   [`subagenten-bau.md`](subagenten-bau.md) · [`claude-netz-bau.md`](claude-netz-bau.md) ·
   [`ssot-aufbau.md`](ssot-aufbau.md) — je nach Artefakt.
3. **Während des Baus:** [`aktualisierungs-index.md`](aktualisierungs-index.md) („ich
   ändere X — was muss ich mitändern") + Protokoll nach
   [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md).
4. **Am Zyklusende:** gebündelter Executor-Lauf (`sync-nachzug-bauzyklus.md`), Anker
   aufräumen (`anker-reservierung.md`), Abschluss-Checkliste (`AGENTS.md`).
5. **Wiederkehrend:** [`abteilungs-inhalts-pruefung.md`](abteilungs-inhalts-pruefung.md)
   (Inhalts-Audit je Abteilung) · [`team-distribution.md`](team-distribution.md)
   (Rollout an Team-Maschinen).

Drei Schichten als Merkbild: **Wissen** (`ssot-aufbau`) · **Instruktion**
(`claude-netz-bau`) · **Auslieferung** (`kern-`/`abteilungs-plugin-bau`,
`team-distribution`). Wer wen als Schwester nennt, steht im Kopf der jeweiligen Datei.

## Pflege dieser Methode

Diese Datei ist selbst ein Artefakt der Methode: Nach jedem OS-Durchlauf (neue Abteilung,
Satellit, größerer Umbau) wird geprüft, welche Phase gehakt hat, und die Methode **im selben
PR** nachgeschärft — mit Datum und einem Satz Begründung. Eine Methode, die nicht aus den
eigenen Fehlerprotokollen lernt, ist nur eine Checkliste.
