---
name: be-review
description: >-
  Reviewt einen Backend-Diff entlang sechs fester Dimensionen — API-Verträge und
  Kompatibilität (Breaking Changes, Versionierung, Response-Envelope), Fehlerpfade (explizit
  behandelt, kein stilles Schlucken, Logging mit Kontext), Input-Validierung an Systemgrenzen,
  Datenzugriff (N+1, fehlende Pagination oder Limits, Transaktionsgrenzen, rückwärtskompatible
  Migrationen), Secrets im Diff und Log sowie Testtiefe auf kritischen Pfaden. Liefert Befunde
  als CRITICAL, HIGH, MEDIUM oder LOW mit Datei und Zeile sowie einen Review-Kommentar als
  Entwurf; der Mensch postet, approved und resolved.
  Trigger-Begriffe: „Backend-Review", „API-Diff prüfen", „Endpoint reviewen", „Migration
  reviewen", „Fehlerpfade prüfen", „Query-Performance im Diff".
---

# /nc-development:be-review — Backend-Diff-Review

## Zweck

WP6 „Review" aus der `workflow.md` dieser Abteilung, Modul `be`: prüft einen Backend-Diff —
eigenen vor dem PR oder fremden im PR — auf Vertragstreue, Fehlerpfade, Validierung,
Datenzugriff, Secrets und Testtiefe. Der Skill bringt die Prüfung in eine feste Reihenfolge,
damit die teuren Fehlerklassen nicht durchrutschen. Er **bewertet**; die Entscheidung über den
PR bleibt beim Menschen.

## Ablauf

1. **Diff erfassen:** Geänderte Dateien und den vollständigen Diff bestimmen (`git diff` gegen
   den Basis-Branch bzw. den PR-Diff). Umfang benennen: Anzahl Dateien, betroffene Endpunkte,
   Modelle, Migrationen. Ohne gelesenen Diff wird nicht reviewt.
2. **Dimension 1 — API-Verträge und Kompatibilität:** **Breaking Changes** an Feldern, Typen,
   Statuscodes oder Pflichtparametern; ist die **Versionierung** gezogen, wenn der Vertrag
   bricht; bleibt der **Response-Envelope** einheitlich; sind Konsumenten des Vertrags benannt.
3. **Dimension 2 — Fehlerpfade:** Wird jeder Fehler **explizit behandelt**; gibt es **stilles
   Schlucken** (leerer catch, verschluckter Fehler, Fallback ohne Signal); enthält das
   **Logging Kontext** (was, wo, mit welchen Bezugsdaten) ohne sensible Inhalte zu leaken.
4. **Dimension 3 — Input-Validierung an Systemgrenzen:** Wird **jeder** externe Input
   validiert, bevor er wirkt (Request-Body, Query, Header, Webhook-Payload, Antworten fremder
   Systeme, Dateiinhalte). Grundsatz: **externem Input nie trauen**, fail fast mit klarer
   Meldung.
5. **Dimension 4 — Datenzugriff:** **N+1**-Abfragen; **fehlende Pagination oder Limits** auf
   unbeschränkten Abfragen; **Transaktionsgrenzen** (gehört zusammen, was zusammen committet
   werden muss); **Migrationen rückwärtskompatibel** — läuft die alte Version während des
   Rollouts weiter.
6. **Dimension 5 — Secrets:** keine Schlüssel, Passwörter, Tokens oder Zugangsdaten **im Diff**
   und keine im **Log**. Ein Fund ist immer mindestens HIGH und wird gemeldet, nicht
   stillschweigend entfernt.
7. **Dimension 6 — Testtiefe kritischer Pfade:** Für Geldfluss, Auth und Datenschutz gilt
   Test-First mit **≥ 80 % Coverage** (`nc-sync.md` §2.2 des Kern-Plugins `nc`; das Arbeits-Repo
   kann eine abweichende Grenze festlegen). Prüfen, ob die Tests **Absicht** prüfen — ein Test,
   der nicht scheitert, wenn sich die Logik ändert, ist schwach.
8. **Befunde einordnen:** Jeden Befund mit **Severity** und **Fundstelle** `Datei:Zeile`
   festhalten:
   - **CRITICAL** — blockiert: Sicherheitslücke, Datenverlust, Geldfluss-Fehler, gebrochener
     Vertrag ohne Migrationspfad.
   - **HIGH** — sollte vor dem Merge behoben werden: klarer Fehler oder deutliche Regression.
   - **MEDIUM** — Wartbarkeit oder Risiko, das absehbar teuer wird.
   - **LOW** — Hinweis, optional.
9. **Review-Kommentar entwerfen:** Befunde nach Severity gruppieren, je Befund Fundstelle,
   Begründung und konkreten Änderungsvorschlag nennen. Den Entwurf ausgeben und ausdrücklich
   als **Entwurf** kennzeichnen. Entwurfssprache nach `nc-sync.md` §6 des Kern-Plugins `nc`.
10. **Übergabe:** Auf die menschliche Entscheidung hinweisen (posten, approven, resolven).

## Regeln

- **Rote Linie: der Skill approved nie, resolved nie und postet nie selbst.** Er liefert einen
  Entwurf; Posten und Freigabe sind menschliche Handlungen.
- **Review-Kette (Rollen):** Implementierer ≠ Reviewer — geprüft wird von einem zweiten Dev
  oder durch dieses Agenten-Review; **abgenommen und gemergt wird von der Rolle
  Maintainer/Admin**. Ein Eigen-Review ersetzt die Fremdprüfung nicht, es geht ihr voraus.
- **Kein Befund ohne Beleg.** Jeder Befund nennt `Datei:Zeile` aus dem tatsächlich gelesenen
  Diff. Vermutungen über nicht gelesene Dateien werden als offene Frage formuliert.
- **Keine Stil-Nörgelei ohne Regelbezug.** Ein Befund braucht eine Regel, eine Konvention des
  Arbeits-Repos oder eine belegbare Auswirkung.
- **Severity wird nicht inflationiert.** CRITICAL ist blockierend und entsprechend selten.
- **Gefundene Secrets werden gemeldet, nicht stillschweigend bereinigt** — ein bereits
  geschriebenes Secret muss der Mensch bewerten und gegebenenfalls rotieren.
- **Der Skill ändert keinen Code** und führt keine Migration aus — er reviewt.
- **Rote Linie:** kein Merge, kein Push, kein Deployment aus diesem Skill heraus.

## Verifikation

- Der geprüfte Diff ist benannt (Basis, Anzahl Dateien, betroffene Endpunkte/Migrationen) und
  die sechs Dimensionen sind **einzeln** abgehandelt — auch die ohne Befund.
- **Jeder Befund trägt Severity und Fundstelle** `Datei:Zeile`; kein Befund ohne beides.
- Für kritische Pfade im Diff ist die Testtiefe konkret belegt (Coverage-Wert oder benannte
  Tests) oder die Lücke ist als Befund erfasst.
- Das Ergebnis der Secrets-Prüfung ist ausgesprochen („kein Fund" oder konkrete Fundstelle).
- Der Review-Kommentar liegt als **Entwurf** im Chat und ist als solcher gekennzeichnet.
- Im Review-Werkzeug wurde **keine** Aktion ausgeführt: kein Kommentar gepostet, nichts
  approved, nichts resolved.
