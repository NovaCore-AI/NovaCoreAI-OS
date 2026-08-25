# Pflicht-Workflow der Abteilung `development` (WP0–WP8 im NovaCore-Zyklus)

> **Normative Landkarte dieser Abteilung.** Sie übersetzt den WP-Rahmen des Kerns auf den
> realen NovaCore-Entwicklungszyklus: **GitHub-Flow** — Auftrag/Issue → Feature-Branch → PR →
> Review → Merge nach `main`. Grundsatz, globale Freigabe-Politik, die abteilungsübergreifenden
> roten Linien und die Bedeutung von WP0/WP8 stehen **nicht** hier, sondern in `wp-rahmen.md`
> des Kern-Plugins `nc`; bei Widerspruch gilt für Rahmenpunkte der Kern, für den Fachablauf
> diese Datei. Rahmenregeln werden hier **nicht** dupliziert.

## Der Zyklus

Aufruf der Abteilungs-Skills: `/nc-development:<skill>` (z. B. `/nc-development:flc-plan`).
Die Kern-Skills behalten `/nc:` — sie kommen aus dem Kern-Plugin, das als Dependency dieses
Plugins immer mitinstalliert und mitaktiviert wird.

| WP | Punkt | Pflicht | Skill(s) | Menschliches Gate |
|---|---|---|---|---|
| WP0 | Session-Start | Kontext laden (Stand, Journal, Git-Status) — kein Blind-Start | `/nc:start` *(Kern)* | — |
| WP1 | Verstehen | Anforderung klären, Abgrenzung bestätigen, betroffene Stellen finden, Branch vorbereiten | `flc-feature-start` | Ziel/Abgrenzung bestätigen; Branch-Name freigeben |
| WP2 | Planen | Aufgabe in vertikale, PR-große Slices zerlegen, Abhängigkeiten und Risiken benennen | `flc-plan` | Plan bestätigen, bevor Code entsteht |
| WP3 | Umsetzen | Test-First auf kritischem Pfad (`nc-teamsync.md` §2.2 des Kerns); Produkt-Invarianten prüfen, wo WZS betroffen ist | *(kein eigener Skill)*, `wzs-*` als Invarianten-Checklisten | — |
| WP4 | Quality-Gate | Format/Lint/Tests/Secrets vor jedem Commit; roter Zustand → erst grün, dann committen | `flc-commit-prep` | Commit-Freigabe durch den Menschen |
| WP5 | Selbst-Review + PR | Gesamtdiff gegen `main` reviewen, PR-Text entwerfen, pushen und PR anlegen | `flc-pr` | Push und PR-Anlage: nur nach expliziter Freigabe |
| WP6 | Review | Fremden oder eigenen Diff prüfen, Befunde nach Severity belegen, Review-Kommentar entwerfen | `fe-review`, `be-review`; `wzs-*` bei WZS-Berührung | Approven/Resolven/Posten: nur der Mensch |
| WP7 | QS & Abnahme | Fehler reproduzieren und beheben, Ergebnis in der Zielumgebung abnehmen, Auslieferung vorbereiten und nachweisen | `qs-bugfix`, `qs-abnahme`, `rel-vorbereitung`, `rel-verifikation` | Abnahme, Merge, Release und jedes Deployment: Mensch |
| WP8 | Session-Ende | Stand sichern, Entscheidungen protokollieren | `/nc:end-session` *(Kern)* | — |

**Kern-Abhängigkeit:** WP0/WP8 laufen über die Kern-Skills `/nc:start` und `/nc:end-session`;
einzelne Ereignisse hält `/nc:journal` fest. Sie arbeiten auf dem Sitzungsgedächtnis: im
**OS-Repo** unter `knowledge-base/sitzungswissen/`, weil diese Abteilung repo-intern ist und
das OS-Repo eine eigene Wissensbasis führt (kein Dateistrom mehr in fremden Arbeits-Repos ohne
eigene Wissensbasis). Da der Kern als `dependencies`-Eintrag dieses Plugins immer mitkommt,
kann WP0/WP8 nicht fehlen.

**WP3 ehrlich ausgewiesen:** Für WP3 gibt es bewusst keinen Generalisten-Skill — die Umsetzung
folgt der Test-First-Regel des Kerns, und die `wzs-*`-Skills liefern die produktspezifischen
Invarianten, sobald das Empfehlungssystem berührt ist.

**WP7 in zwei Zyklen geschnitten:** Der **QS-Zyklus** (`qs-*`) trägt Fehlerbehebung und
Abnahme — `qs-bugfix` reproduziert einen Fehler zuerst als roten Test und sichert die Behebung
gegen Rückfall, `qs-abnahme` prüft den fertigen Stand gegen die Anforderung und legt je
Abnahmepunkt einen Beleg vor. Der **Release-Zyklus** (`rel-*`) trägt die Auslieferung, ohne sie
auszulösen: `rel-vorbereitung` stellt Stand, Nachweise, Migrations- und Rückweg sowie den
Freigabenachweis zusammen, `rel-verifikation` belegt nach der vom Menschen ausgelösten
Auslieferung read-only, dass der erwartete Stand trägt. Für alle vier gilt die
Verifikationsdisziplin: Behauptung nur mit Beleg — Command-Output, grüner Test, beobachtetes
Verhalten. Befunde gehen als reproduzierbare Beschreibung zurück in WP1.

## Module dieser Abteilung

| Modul | Präfix | Rolle im Zyklus |
|---|---|---|
| Feature-Lifecycle | `flc-` | trägt WP1, WP2, WP4, WP5 — stack-übergreifend |
| Frontend | `fe-` | trägt WP6 für UI-nahe Änderungen |
| Backend | `be-` | trägt WP6 für Server-/API-/Datenänderungen |
| QS-Zyklus | `qs-` | trägt WP7 für Fehlerbehebung und Abnahme — stack-übergreifend |
| Release-Zyklus | `rel-` | trägt WP7 für Auslieferungs-Vorbereitung und -Nachweis; beide Skills nur manuell aufrufbar |
| Empfehlungssystem WZS | `wzs-` | Produkt-Invarianten in WP3 und WP6, kundenspezifisch |

Die `wzs-*`-Skills gelten **ausschließlich** für das Wasserzisterne-Empfehlungssystem. In
anderen Arbeits-Repos sind sie fachlich falsch und dürfen nicht angewendet werden.

## Rote-Linien-Ownership dieser Abteilung

Die roten Linien selbst definiert der Kern (`wp-rahmen.md`): keine automatischen Pushes,
Merges, Posts, Releases oder Deployments ohne explizite Nutzerfreigabe — der Agent bereitet
vor, der Mensch handelt. Hier steht, **welcher Skill welche Linie trägt**: Der Skill trägt das
**Verbot** und führt durch den sicheren Ablauf — er führt die Aktion **nie selbst** aus.

| Rote Linie | Verankert in (Skill trägt das Verbot) | Regel |
|---|---|---|
| Push und PR-Anlage | `flc-pr` | Entwurf zeigen, Freigabe einholen; erst danach `git push` und PR anlegen |
| Commit ohne Freigabe | `flc-commit-prep` | Bereitet vor und schlägt die Message vor; committet erst nach Bestätigung, nie mit `--no-verify` |
| Review approven/resolven | `fe-review`, `be-review` | Nur menschliche Reviewer approven und resolven; der Agent liefert Befunde |
| Kundensichtbares posten (PR-Text, Review-Kommentar) | `flc-pr`, `fe-review`, `be-review` | Agent entwirft Texte, Mensch postet |
| Abnahme erteilen | `qs-abnahme` | Der Skill legt Belege je Abnahmepunkt vor; abgenommen wird von der Rolle Maintainer/Admin |
| Release vorbereiten statt auslösen | `rel-vorbereitung` | Stellt Stand, Nachweise, Migrations- und Rückweg zusammen; taggt nicht, releast nicht, deployt nicht — nur manuell aufrufbar |
| Auslieferung nachweisen ohne Eingriff | `rel-verifikation` | Prüft ausschließlich lesend; empfiehlt den Rückweg, löst ihn nie aus — nur manuell aufrufbar |
| Merge, Release, Deployment | **kein Skill** — bewusst nicht automatisiert | Kein Skill dieser Abteilung merged, released oder deployt |

### Domänen-rote-Linien der Abteilung (Produktivsystem WZS)

Zusätzlich zu den Linien des Kerns gelten drei Linien der Domäne. Ihre **deklarative Quelle**
ist `pflege-auspraegung.json` an der Wurzel dieses Plugins (Feld `roteLinienDomaene`, von den
Pflege-Skills des Kerns gelesen); hier stehen sie wortgleich mit ihrer Skill-Ownership. Ändert
sich eine Linie, werden beide Orte im selben Zug nachgezogen — dieselben Sätze führt auch die
Abteilungs-CLAUDE `development-abteilungs-claude.md` dieses Plugins.

| Domänen-rote Linie (wortgleich zur Ausprägung) | Getragen von |
|---|---|
| Deploys am WZS-Produktivsystem führt ausschließlich der Mensch aus. | `rel-vorbereitung` (bereitet vor), `rel-verifikation` (prüft lesend nach) |
| Eingriffe in die Datenbank des WZS-Produktivsystems führt ausschließlich der Mensch aus. | `rel-vorbereitung` (benennt Migrations- und Rückweg), `rel-verifikation` (bestätigt lesend), `wzs-reward-guard` |
| Änderungen an Webhooks des WZS-Produktivsystems führt ausschließlich der Mensch aus. | `wzs-webhook-contract` (Contract-Prüfung), `rel-vorbereitung` (benennt den Schritt für den Menschen) |

## Trigger-Abdeckung (QA-Matrix)

Trigger-Begriffe sind je Modul disjunkt gehalten, damit sich Skills nicht gegenseitig
wegtriggern:

- `flc-*` triggert auf den Lebenszyklus einer Änderung: „Feature beginnen", „Task slicen",
  „committen / Commit vorbereiten", „Pull Request erstellen"
- `fe-*` triggert auf **Frontend-Review**: „UI-Diff prüfen", „Komponente reviewen",
  „Zugänglichkeit / Web Vitals prüfen" — nie auf das Schreiben von UI-Code
- `be-*` triggert auf **Backend-Review**: „API-Diff prüfen", „Endpoint reviewen",
  „Migration reviewen", „Fehlerpfade prüfen"
- `qs-*` triggert auf **Fehlerbehebung und Abnahme nach der Umsetzung**: „Bug reproduzieren /
  Fehlermeldung nachstellen", „Regressionstest schreiben", „QS-Schleife" (`qs-bugfix`) ·
  „Abnahme / Abnahmelauf", „Abnahme-Checkliste", „Livetest planen", „Ergebnis in der
  Zielumgebung prüfen" (`qs-abnahme`) — nie auf das Prüfen eines Diffs, das trägt `fe-`/`be-`
- `rel-*` triggert auf die **Auslieferung** und wird ausschließlich manuell gerufen (im
  Frontmatter beider Skills verdrahtet): „Release vorbereiten / Pre-Deploy-Check", „Releasestand
  fixieren", „Rollback-Weg benennen", „Freigabenachweis zusammenstellen"
  (`rel-vorbereitung`) · „Post-Deploy-Verifikation", „nach der Auslieferung prüfen", „Release
  verifizieren", „Smoke-Check nach dem Deploy" (`rel-verifikation`)
- `wzs-*` triggert ausschließlich auf Wasserzisterne-Fachbegriffe: „Attribution", „Reward /
  Auszahlung", „Share-Kanal / Empfehlungsnachricht", „Webhook / Reconciliation",
  „Phasen-Start / Blocker"

Die Module bleiben gegeneinander trennscharf: `flc-*` endet mit dem Pull Request, `fe-*`/`be-*`
prüfen **Diffs**, `qs-*` prüft **laufendes Verhalten**, `rel-*` prüft **Auslieferungen**.
Bei neuen Skills: Matrix ergänzen und Overlap-Prüfung laut Checkliste in
`referenz/skill-authoring.md` des Kern-Plugins `nc`.

## Wissens-Routing und Queue-Anbindung (SSOT)

Diese Abteilung ist **repo-intern** und führt **keine eigene Wissensbasis**. Zuständig ist die
Wissensbasis des **OS-Repos**; Einstieg ist immer die Triage über deren Dokuindex
(`knowledge-base/SSOT-Document-Index.md` im OS-Repo — Teil 1 routet Kategorien, Teil 2 nennt je
Dokument „Relevant wenn …"), erst triagieren, dann lesen. Lokal liegt die Wissensbasis als
**Lesekopie** unter `~/.nc/ssot/`, angelegt und nachgezogen von `/nc:setup`. Pfade werden gegen
den Index bestimmt, nicht geraten.

**Sitzungswissen-Residenz:** Diese Abteilung ist repo-intern; seit Phase I führt das **OS-Repo**
selbst eine eigene Wissensbasis, darum wohnen Stand, Journal und offene Stränge dort committet
unter `knowledge-base/sitzungswissen/development/` bzw. `knowledge-base/sitzungswissen/`
(Register, Roll-up) — geschrieben und gelesen von `/nc:start` bzw. `/nc:end-session`. Der
frühere lokale Strom `.nc/erinnerung/` ist abgeschafft; das OS-Repo bleibt trotzdem
kundenkontextfrei — die Residenz trägt ausschließlich den Baustand des OS selbst, nie
Kundenkontext eines fremden Arbeits-Repos.

**Queue-Anbindung:** Die **Klassifikation** eines Pflegekandidaten leistet der Kern in Station 1
des Queue-Flows, dem Abschlussschritt von `/nc:end-session`; die Abteilung liefert dazu nur ihre
**Ausprägung** (`pflege-auspraegung.json` an der Wurzel dieses Plugins: Queue-Pfad,
Kriterienverweis, Journal-Sonderregeln, Domänen-rote-Linien, Übergangsregel). Ein eigener
Abteilungs-Queue-Skill ist **nicht** vorgesehen und wird nicht gebaut. Solange die Abteilung
keinen eigenen Satelliten hat, lebt ihre Queue als **Übergangs-Queue im OS-Repo** und wird über
dessen regulären Branch/PR-Fluss eingebracht — **`/nc:queue-abteilung` ist hier nicht der Weg**
(er gilt für Abteilungs-Satelliten-Klone). Die Kriterien selbst stehen in
`referenz/pflege-auspraegung.md` des Kern-Plugins `nc` und werden hier nicht dupliziert; eine
eigene Abteilungs-Kriterienliste gibt es bis zum Maintainer-Entscheid bewusst nicht.

Das Routing für alle Sitzungen der Abteilung steht zusätzlich in der Abteilungs-CLAUDE
`development-abteilungs-claude.md` an der Wurzel dieses Plugins, die `/nc:start` beim
Einstiegs-Ritual lädt.
