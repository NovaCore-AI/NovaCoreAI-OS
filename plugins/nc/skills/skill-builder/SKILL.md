---
name: skill-builder
description: >-
  Führt durch den Bau eines neuen Skills nach den OS-Regeln — von der Idee über
  Overlap-Prüfung und Formatregeln (skill-authoring.md) bis zur Merge-Checkliste;
  unterstützt sowohl Sandbox-Skills im eigenen Namespace als auch Beiträge ins OS inklusive
  Fork-back-Weg. Trigger-Begriffe: „Skill bauen", „neuen Skill erstellen", „eigenen Skill",
  „Sandbox-Skill", „Skill einreichen", „Fork-back".
---

# /nc:skill-builder — Eigene Skills nach den OS-Regeln bauen

## Zweck

Sandbox-Unterstützung der ständigen Abteilung `gemeinsam`: Jeder im Team darf eigene Skills
bauen — nach Vorbild und Regeln des OS, ohne den Kern anzufassen. Dieser Skill führt durch
den kompletten Bau (Sandbox **oder** OS-Beitrag) und sichert, dass das Ergebnis den
verbindlichen Formatregeln entspricht und Bewährtes später per Fork-back ins OS wandern kann.

## Ablauf

1. **Einordnen:** Sandbox-Skill (eigener Namespace/Präfix des Nutzers, privat) oder
   OS-Beitrag (geht durch Maintainer-Review)? Bei OS-Beiträgen zusätzlich die
   **Zielabteilung** bestimmen — sie entscheidet über das Plugin und damit den Namespace:
   Kern-Plugin `nc` → `/nc:<name>`, Abteilungsplugin → `/nc-<abteilung>:<name>` (z. B.
   `/nc-development:<name>`). Zweck, Zielgruppe und Trigger-Begriffe in je einem Satz
   festhalten.
2. **Overlap-Prüfung:** Gegen bestehende Skills prüfen (Trigger-Matrix in der `workflow.md`
   der Zielabteilung, `wp-rahmen.md` des Kerns, Skill-Tabelle im README) — bei
   Überschneidung: bestehenden Skill erweitern statt doppeln, oder Trigger disjunkt schärfen.
3. **Formatregeln laden:** `referenz/skill-authoring.md` dieses Kern-Plugins vollständig
   lesen — sie ist die verbindliche Quelle (Frontmatter-Constraints inklusive **YAML-Falle**:
   `description` mit Trigger-Begriffen immer als `>-`-Block, Gliederung, Länge,
   dritte-Person-Description).
4. **Gerüst erzeugen:** `<skills-pfad>/<name>/SKILL.md` mit Frontmatter (`name` =
   Verzeichnisname; `description` in dritter Person mit Trigger-Begriffen) und den vier
   Pflicht-Abschnitten Zweck / Ablauf / Regeln / Verifikation.
5. **Inhalt füllen — inhaltliche Pflichten:** Fakten nur mit Quelle (Quellen-Hierarchie);
   berührte **rote Linien explizit verbieten** (Merges, Deploy-Klicks, Review-Resolves,
   Kundensichtbares); MCP-Verfügbarkeit korrekt behandeln (nur nennen, was real vorhanden
   ist — sonst „wo vorhanden, sonst Web-UI"); **keine personenbezogenen Pfade**
   (Team-Werkzeug, kein Einzelperson-Setup); **Plugin-Grenze wahren**: in ausgelieferten
   Dateien nie ins Elternverzeichnis springen, denn ein installiertes Plugin sieht keine
   Repo-Pfade — auf fremde Inhalte per Plugin-**Name** verweisen (die genaue Regel samt
   verbotener Muster steht in `referenz/skill-authoring.md`).
6. **Checkliste abarbeiten:** die Merge-Checkliste aus `skill-authoring.md` Punkt für Punkt;
   bei OS-Beiträgen zusätzlich `claude plugin validate plugins/<ziel-plugin> --strict` —
   **nicht** nur `claude plugin validate .`: an der Repo-Wurzel prüft der Befehl allein das
   Marketplace-Manifest und lässt Skill-Fehler unentdeckt.
7. **Abschluss je Pfad:**
   - **Sandbox:** Skill im eigenen Skill-Verzeichnis des Nutzers ablegen; bewährt er sich,
     den **Fork-back-Weg** gehen: beim Maintainer einreichen → Review → Übernahme in das
     passende OS-Plugin → Verteilung per Version-Bump.
   - **OS-Beitrag:** Doku-Pflicht über `/nc:doku-sync` (Registry, README, CHANGELOG mit
     Namenszeichnung) — kein Commit/Push ohne Freigabe des Maintainers.

## Regeln

- **Rote Linien sind nicht skillbar:** Kein neuer Skill darf Merges, Deploy-Klicks,
  Review-Resolves/Approvals oder Kundensichtbares automatisieren — der Agent bereitet vor,
  der Mensch handelt.
- **Kein Skill ohne Overlap-Prüfung** (Schritt 2) und ohne vollständige Checkliste
  (Schritt 6).
- **Platzhalter werden nie zu `SKILL.md`**, bevor der Skill wirklich gebaut ist — halbfertige
  Skills werden nicht ausgeliefert (der Struktur-Test prüft auf offene Platzhalter).
- **Fork-back nur über den Maintainer** — kein Selbst-Merge eigener Skills ins OS.
- Bei unklaren Format-Fragen: offizielle Claude-Code-Doku abrufen (Source-of-Truth-Pflicht),
  nie aus dem Gedächtnis.

## Verifikation

- Die Merge-Checkliste aus `skill-authoring.md` ist vollständig abgehakt (jeder Punkt mit
  Beleg: Zeichenzahlen, Gliederung, Trigger-Disjunktheit).
- Bei OS-Beiträgen: `claude plugin validate plugins/<ziel-plugin> --strict` meldet
  „Validation passed" (der Skill-Scan läuft nur bei Angabe des Plugin-Verzeichnisses).
- Die Overlap-Prüfung ist dokumentiert (geprüfte Skills + Ergebnis).
- Frontmatter-`name` entspricht exakt dem Verzeichnisnamen.
