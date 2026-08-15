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
| WP3 | Umsetzen | Test-First auf kritischem Pfad (`nc-sync.md` §2.2 des Kerns); Produkt-Invarianten prüfen, wo WZS betroffen ist | *(kein eigener Skill)*, `wzs-*` als Invarianten-Checklisten | — |
| WP4 | Quality-Gate | Format/Lint/Tests/Secrets vor jedem Commit; roter Zustand → erst grün, dann committen | `flc-commit-prep` | Commit-Freigabe durch den Menschen |
| WP5 | Selbst-Review + PR | Gesamtdiff gegen `main` reviewen, PR-Text entwerfen, pushen und PR anlegen | `flc-pr` | Push und PR-Anlage: nur nach expliziter Freigabe |
| WP6 | Review | Fremden oder eigenen Diff prüfen, Befunde nach Severity belegen, Review-Kommentar entwerfen | `fe-review`, `be-review`; `wzs-*` bei WZS-Berührung | Approven/Resolven/Posten: nur der Mensch |
| WP7 | QS & Live-Test | Verhalten in der Zielumgebung prüfen, Befunde reproduzierbar festhalten | **noch ohne eigenen Skill** — manuell nach Verifikationsdisziplin | Jede Freigabe, jedes Deployment: Mensch |
| WP8 | Session-Ende | Stand sichern, Entscheidungen protokollieren | `/nc:end-session` *(Kern)* | — |

**Kern-Abhängigkeit:** WP0/WP8 laufen über die Kern-Skills `/nc:start` und `/nc:end-session`;
einzelne Ereignisse hält `/nc:journal` fest. Sie arbeiten auf dem Sitzungsgedächtnis unter
`.nc/erinnerung/`. Da der Kern als `dependencies`-Eintrag dieses Plugins immer mitkommt, kann
WP0/WP8 nicht fehlen.

**WP3 und WP7 ehrlich ausgewiesen:** Für WP3 gibt es bewusst keinen Generalisten-Skill — die
Umsetzung folgt der Test-First-Regel des Kerns, und die `wzs-*`-Skills liefern die
produktspezifischen Invarianten, sobald das Empfehlungssystem berührt ist. WP7 ist derzeit
**nicht** durch einen Skill abgedeckt: QS und Live-Test laufen manuell; es gilt die
Verifikationsdisziplin (Behauptung nur mit Beleg — Command-Output, grüner Test, beobachtetes
Verhalten), und Befunde gehen als reproduzierbare Beschreibung zurück in WP1.

## Module dieser Abteilung

| Modul | Präfix | Rolle im Zyklus |
|---|---|---|
| Feature-Lifecycle | `flc-` | trägt WP1, WP2, WP4, WP5 — stack-übergreifend |
| Frontend | `fe-` | trägt WP6 für UI-nahe Änderungen |
| Backend | `be-` | trägt WP6 für Server-/API-/Datenänderungen |
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
| Merge, Release, Deployment | **kein Skill** — bewusst nicht automatisiert | Kein Skill dieser Abteilung merged, released oder deployt |

## Trigger-Abdeckung (QA-Matrix)

Trigger-Begriffe sind je Modul disjunkt gehalten, damit sich Skills nicht gegenseitig
wegtriggern:

- `flc-*` triggert auf den Lebenszyklus einer Änderung: „Feature beginnen", „Task slicen",
  „committen / Commit vorbereiten", „Pull Request erstellen"
- `fe-*` triggert auf **Frontend-Review**: „UI-Diff prüfen", „Komponente reviewen",
  „Zugänglichkeit / Web Vitals prüfen" — nie auf das Schreiben von UI-Code
- `be-*` triggert auf **Backend-Review**: „API-Diff prüfen", „Endpoint reviewen",
  „Migration reviewen", „Fehlerpfade prüfen"
- `wzs-*` triggert ausschließlich auf Wasserzisterne-Fachbegriffe: „Attribution", „Reward /
  Auszahlung", „Share-Kanal / Empfehlungsnachricht", „Webhook / Reconciliation",
  „Phasen-Start / Blocker"

Bei neuen Skills: Matrix ergänzen und Overlap-Prüfung laut Checkliste in
`referenz/skill-authoring.md` des Kern-Plugins `nc`.
