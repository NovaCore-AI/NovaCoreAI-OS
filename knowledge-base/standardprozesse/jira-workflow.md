# Jira-Workflow — Standardprozess für Jira-Arbeit am NovaCore-OS

> **Verbindlich**, sobald Jira-Tickets gelesen, angelegt, migriert oder über den REST-API
> bzw. den Atlassian-MCP bearbeitet werden. **Eigenbau 2026-08-25** (Mapping D29, Phase-J-
> Frühzug) — das Onsite-Vorbild hat **kein** Pendant (verifiziert: kein `jira-*` in
> `plugin-maintanance-ruleset-source/`); dieser Prozess ist aus dem realen Ablauf der
> EP→WZ-Migration (2026-08-24/25) abgeleitet, nicht portiert.
> **Status:** Grundregeln stehen; die Jira-**Projekt-Keys und Workflows je Projekt sind
> Maintainer-nachzureichen** (Bauplan 2026-08-16 §3 J3 — „Skills raten nichts"). Solange
> die Blöcke B (NCOS-Konzept) und C (EP-Umzug) zurückgestellt sind (Weisung 2026-08-24),
> gilt dieser Prozess für die laufende Restarbeit.
> **Kette:** Jira-Arbeit angefragt → **dieser Prozess** → Zugangs-/Artefakt-Lage in
> `metaknowledge/` → Fundstellen in `debugging-findings/`, falls etwas bricht

## 1. Zugang — zwei Sites, zwei Wege (verifiziert 2026-08-25)

| Site | Projekte | Weg | Zugangs-Lage |
|---|---|---|---|
| `novacore-ai.atlassian.net` | EP, NC, NCOS | **nur Atlassian-MCP** (MCP-Connector) | Connector-Freigabe je Site |
| `novacore-ai-team.atlassian.net` | SCRUM, WZ | **nur REST** (API v3, Basic Auth) | Env: `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_SITE` |

**Regeln:**

1. **Token niemals in Dateien, Commits oder Konversation** — nur Env-Variablen
   (Windows: `setx`). Zeiger-Dokument: `metaknowledge/jira-rest-zugang.md`.
2. **Ein MCP-Connector gibt nur EINE Site frei.** Nach Re-Authenticate zeigt
   `getAccessibleAtlassianResources`, welche gilt. Site-übergreifende Arbeit läuft nach
   dem Muster der EP→WZ-Migration: **Quelle per MCP lesen, Ziel per REST schreiben.**
3. Bei 401 zuerst Token-Rotation prüfen (rotiert regelmäßig; dann `setx` erneuern).

## 2. Artefakt-Heimat (Maintainer-Entscheid 2026-08-25)

Jira-Artefakte — Migrations-Skripte, Export-Batches, Maps, Zugangs-Zeiger — wohnen unter
**`metaknowledge/jira-migration/`** bzw. **`metaknowledge/`** (Bestandsübersicht in
`metaknowledge/README.md`). Sie sind **keine** Wissensbasis-Dokumente (keine
Index-Pflicht) und liegen **nie** unter `.nc/` (kein Ablageort, strikt nach Onsite).
Neue Skripte folgen dem Bestandsmuster: Env-only-Zugang, Kopfkommentar mit Zweck/Verbrauch.

## 3. Ablauf einer Jira-Arbeit

1. **Auftrag klären:** Welches Projekt, welche Site? → Weg nach §1 wählen.
2. **Zugang verifizieren** bevor gebaut wird: REST `/rest/api/3/myself`, MCP
   `getAccessibleAtlassianResources`. Schlägt es fehl: Rotation/Connector prüfen (§1).
3. **Lesen vor Schreiben:** Bestand (Tickets, Epics, Links) erst vollständig lesen und
   lokal zwischenspeichern (Map-Dateien in `metaknowledge/jira-migration/`), dann
   schreiben — der REST-Zugang ist gedrosselt, Bulk-Lesen vermeiden.
4. **Schreibende Aufrufe** (Tickets anlegen, aktualisieren, verlinken, kommentieren):
   Der Agent **entwirft**, der Maintainer gibt die Ausführung frei — Jira-Kommentare sind
   potenziell kundensichtbar (rote Linie „Kundensichtbares posten", `wp-rahmen.md`).
  REST-Schreibläufe dokumentieren die erzeugten IDs in einer `created-map.json` (Vorbild:
   EP→WZ-Migration), damit Fehlläufe rückverfolgbar bleiben.
5. **Migrationen specially:** Export-Batches je Projekt (`export/batch_<KEY>-<n>_<m>.json`),
   Import-ID-Mapping führen, Kommentare/Links in eigenen Läufen nachziehen — nie alles in
   einem Lauf.
6. **Protokoll:** Fundstellen in `knowledge-base/debugging-findings/debug-log.md`
   (append-only); Abschlüsse im Sitzungs-Journal.

## 4. Benannte Lücken (nicht raten)

| Lücke | Zuständigkeit |
|---|---|
| Projekt-Keys und -Workflows (Status-Spalten, Resolution) je Site | Maintainer-Nachreichung (J3, N6) — bis dahin live per API/MCP erheben, nicht aus Gedächtnis |
| Jira-Spalten im Contributing-Flow (S-Stationen) | Platzhalter-Verweis auf diesen Prozess, bis Block B/C läuft |
| Automatische Syncs (Jira ↔ Git) | Nicht beschlossen — kein Automatismus bauen |

## 5. Verifikation / Abnahme

- [ ] Zugangs-Zeiger aktualisiert (Rotation, neue Env-Variable) — nur in
      `metaknowledge/jira-rest-zugang.md`
- [ ] Schreiblauf-IDs in der Map dokumentiert (§3.4)
- [ ] Kein Token/Secret in irgendeiner committeten Datei (grep-Sweep)
- [ ] Fundstellen protokolliert (§3.6)

---

*Angelegt 2026-08-25 (Mapping D29, Phase-J-Frühzug) aus dem verifizierten Ablauf der
EP→WZ-Migration; Onsite hat kein Pendant — Eigenbau mit benannten Lücken statt Erfindung.*
