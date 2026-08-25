# Stand (konsolidiert) — 2026-08-26, nach der Nachtschicht Phase J (Orchestrator-Lauf)

## Aktueller Arbeitsstand

- **Onsite-Delta Phase J vollständig gebaut** auf `feat/onsite-delta-phase-j` (Basis: main
  nach PR #30): Pakete J-D → J-A ∥ J-B → J-C → J-E als einzelne Commits, Suite **354/354
  grün** (Start 323; +31 durch Safety-Gate-Werttests, Queue-Anweisungs-Invariante,
  Setup-Hinweis-Hook-Tests), beide `--strict`-Validierungen grün.
- Gefahrenlage sauber: alle vier Baupakete von zwei Sonnet-Bau-Agenten (per Claude-Code-CLI
  headless gespawnt, eigene Worktrees) gebaut; der Orchestrator (Kimi K3) hat je Paket
  Suite + Abnahmen verifiziert und die Commits per Cherry-Pick in den Phase-Branch geholt
  (kein Merge-Commit, Fugen unversehrt).
- **J-E (Nachzüge + Bump + Waypoint)** vom Orchestrator selbst gezogen: README/AGENTS/
  SECURITY/ONBOARDING/Aktualisierungs-Index, Mapping-Nachtrag N6, Register-Abschlüsse,
  Kern-Bump **0.14.0 → 0.15.0**, `nc-development` **0.2.1 → 0.3.0**, ein
  Waypoint-CHANGELOG-Schnitt.

## Offene Punkte

- **Phase-J-PR:** Review durch Maintainer (Merge = Bestätigung der Entscheide J-E1–J-E10
  sowie Nachtrag N3 Diagnose-Klasse); danach Tag `nc--v0.15.0` + GitHub-Release
  (Release-Zug; Orchestrator hat einmalige Freigabe, siehe PR-Body).
- **Reserve-Tag-Reste:** `reserve/abteilung-automation`, `reserve/abteilung-ui-ux`,
  `reserve/nc-0.9.0` liegen noch auf origin — Löschung braucht Maintainer-Freigabe
  (Registerzeile 59).
- Phase K laut Mapping-N6-Restliste (D16/D17, Registry-Leser-Migration, WZS-Deploy,
  Jira Block B/C, Skill-Größendeckel, Satellitenanschluss Queue-Flow).

## Zuletzt getroffene Entscheidungen

- **N3 (Bauplan Phase J):** Diagnose-Klasse im Agenten-Prüfbaustein 1.4.3 — löst den
  Konflikt J-E3 (`pipeline-praeflight` braucht Bash) gegen die No-Diff-Zone des Bausteins;
  Marker `<!-- nc:diagnose -->`, genau Bash, Allowlist-Disziplin.
- **J-E1–J-E10** wie Bauplan §2 vorgeschlagen (Default Onsite-Parität), Bestätigung am PR.
- Anker-Reservierung endgültig Mechanik-only (D31): „Es wird nichts reserviert".

## Aktive Branches und offene Pull Requests

- `feat/onsite-delta-phase-j` — der einzige aktive Strang (Phase J komplett, siehe oben).
- Worktree-Zweige `agent-ost/*`, `agent-west/*` sind eingeholt und können nach PR-Merge
  aufgeräumt werden.

## Bekannte Risiken

- Der zehnte Hook (`nc-setup-hinweis.js`) und die Queue-**Anweisung** (statt Erinnerung)
  sind teamweit sichtbare Verhaltensänderungen — im PR-Body genannt.
- Die Laufzeitmessung des Setup-Hinweises ist prozessdominiert (~43–54 ms inkl.
  Node-Start); reine Bewertungslogik wenige Millisekunden — unkritisch für SessionStart.

## Nächster Schritt

**Maintainer:** Phase-J-PR lesen (Wortlaut-Abnahmen: Queue-Anweisungstitel,
Setup-Hinweis-Zustände, Safety-Gate-Wertstufen, Muster-4-Referenz aus #30), mergen;
Orchestrator taggt und releast `nc--v0.15.0` im selben Zug (einmalige Freigabe erteilt).
Danach: gemeinsame Durchsprache der Phase-K-Restliste.
