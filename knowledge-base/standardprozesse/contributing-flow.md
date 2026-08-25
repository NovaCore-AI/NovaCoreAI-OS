# Contributing-Flow — Standardprozess

> **Verbindlich** für jeden Strang, der einen Code- oder Wissens-Beitrag ins OS-Repo trägt —
> Skill, Hook, Standardprozess, Definitionsdokument, Bauplan-Vollzug. Begriffliche Grundlage
> ist die [`NovaCore-OS-Strang-Definition.md`](../grundwissen/NovaCore-OS-Strang-Definition.md)
> (was ein „Strang" ist); dieser Prozess sagt, **welche Stationen** ein Strang durchläuft und
> **wer** an welcher Station steht.
>
> **Abgrenzung/Schwestern:** Der Prüfzyklus selbst (Tests, `validate`) steht in
> [`aktualisierungs-index.md`](aktualisierungs-index.md) §5 — hier wird nur referenziert, nicht
> dupliziert. Die Ergebnismemo-Pflicht des Strangs (statt CHANGELOG/Bump im Strang) steht ebenso
> dort (§0 Zwei-Klassen-Buchführung). Für **Affiliate-Plugins** (`kimi-code-plugin-cc` und
> vergleichbare persönliche/externe Werkzeuge) gilt dieser Flow **nicht über die SSOT dieses
> Repos** — sie leben in eigenen Repos mit eigenen Regeln (Affiliate-Invariante N1.1,
> [`NovaCore-OS-SSOT-Definition.md`](../grundwissen/NovaCore-OS-SSOT-Definition.md)).
>
> **Kette:** ein Vorhaben ist beauftragt (Bauplan in `aktive-bauplaene/` oder Maintainer-Auftrag
> im Chat) → **dieser Prozess** → Merge auf `main` = Ende des Strangs
> ([`ssot-aufbau.md`](ssot-aufbau.md) für die Wissens-Nachzüge, `aktualisierungs-index.md` §3.6
> für den Release-Zug).
>
> **Herkunft:** Port aus Onsite.ai-OS `origin/main@a9927b2`
> (`plugin-maintanance-ruleset-source/contributing-flow.md`), NovaCore-Zuschnitt: Rollen nach
> Org-Ruleset statt Onsite-Rollennamen, `/nc:`-Skill-Namen statt Onsite-Skills, Jira-Lücke
> benannt statt gefüllt (Mapping D34, Entscheid J-E4 des
> [Phase-J-Bauplans](../aktive-bauplaene/2026-08-25-onsite-delta-phase-j-bauplan.md)).

## 1. Anlass

| Fall | Weg |
|---|---|
| Ein beauftragtes Vorhaben (Bauplan oder direkter Maintainer-Auftrag) soll umgesetzt werden | **dieser Prozess** — S1–S7 |
| Eine einzelne Registerzeile wird abgehakt, ohne dass Code oder Wissensdateien sich ändern (z. B. reine Kenntnisnahme) | **nicht hier** — Registerpflege direkt im [Offene-Stränge-Register](../sitzungswissen/offene-straenge-register.md) |
| Eine Änderung landet **nicht** über die SSOT dieses Repos (Affiliate-Plugin, fremdes Arbeits-Repo) | **nicht hier** — eigener Prozess des Zielrepos, keine NovaCore-Stationen |
| Eine reine `erinnerung/`- bzw. Sitzungswissen-Änderung (Nicht-Code, append-only) | **verkürzt**: Branch → PR bleibt Pflicht (Branch-Protection ist nicht pfad-granular), aber Selbst-/Auto-Merge ohne inhaltliche Code-Review ist zulässig — siehe S6 |

## 2. Ablauf — die sieben Stationen S1–S7

Rollen nach dem Org-Ruleset dieser Instanz: S1–S5 trägt der **bauende Agent** unter
**Overseer**-Planung und -Review (Plan-Sandwich — der Overseer plant den Auftrag vor und liest
das Ergebnis danach; er ist der Adressat des Berichtskommentars am Ende von S5, **nicht** der
Maintainer). S6 (Review + Merge) und S7 (Release-Zug) liegen beim **Maintainer Lucas
Vöhringer** — bewusst **kein Agent**, an keiner der beiden Stationen.

| # | Station | Wer | Was passiert |
|---|---|---|---|
| **S1** | **Worktree + Branch anlegen** | Agent | `git worktree add .worktrees/<branch> -b <typ>/<thema>` (Branch-Schema `<typ>/<thema>`, z. B. `feat/…`, `fix/…`, `docs/…`); **nie** im Haupt-Checkout schreiben, sobald eine zweite Session oder ein zweiter Agent parallel arbeitet. `git worktree list` **vor** dem ersten Schreiben prüfen (fremde, ungemergte Arbeit) |
| **S2** | **Pflicht-Einstieg** | Agent | Log-Stand, Produktstand (`CHANGELOG.md`, `VERSION`), Planungsstand (`aktive-bauplaene/`), Triage über `SSOT-Document-Index.md`, Änderungsumfang über `aktualisierungs-index.md` — wie in `AGENTS.md` beschrieben, hier nicht dupliziert |
| **S3** | **Umsetzung** | Agent | Standardprozess-Check vor jeder inhaltlichen Änderung (existiert schon ein Standardprozess für diese Tätigkeit?); Tests zuerst, wo ein Prüfzyklus existiert; jeder eigene Fehler sofort ins Fehlerprotokoll (`debugging-findings/agent-learnings.md`) |
| **S4** | **Selbst-Review + Prüfzyklus** | Agent | `node --test plugins/nc/tests/*.test.mjs` · `claude plugin validate .` **und** `claude plugin validate plugins/<name> --strict` je berührtem Plugin · Konflikt-Marker-Grep (`git grep -n "<<<<<<< \|=======\|>>>>>>> "`) als **Kettenglied vor jedem Commit** — ein übersehener Marker ist kein Stilfehler, sondern ein kaputter Build |
| **S5** | **PR-Memo an den Overseer** | Agent | Ergebnisbericht: was/warum, getroffene Entscheide, Verifikationsbelege (Testzahlen, `validate`-Ausgabe), offene Punkte — **kein** CHANGELOG-Eintrag, **kein** Version-Bump (Zwei-Klassen-Buchführung, `aktualisierungs-index.md` §0). Der Overseer liest das Memo, stichprobt den Diff, gibt frei oder schickt zurück |
| **S6** | **Review + Merge** | **Maintainer** | Fachliche und Sicherheits-Prüfung, Freigabe oder Änderungswunsch, Merge nach `main` — **kein direkter Push auf `main`**, immer über PR. Ausnahme für reine `erinnerung/`-Änderungen (Nicht-Code, append-only): Selbst-/Auto-Merge ohne inhaltliche Review ist zulässig, der Branch/PR-Weg bleibt trotzdem Pflicht (Branch-Protection ist nicht pfad-granular) |
| **S7** | **Release-Zug** | **Maintainer** | Version-Bump, CHANGELOG-Waypoint, Tag — ausschließlich am Release-Zug, nie im Strang (`aktualisierungs-index.md` §3.6). Ein Strang endet mit dem Merge; der Release-Zug ist ein eigener, gebündelter Vorgang über mehrere Stränge hinweg |

## 3. Regeln / rote Linien

- **Versionslos im Strang.** Kein `plugin.json`-Bump, kein CHANGELOG-Eintrag, kein Git-Tag
  entsteht innerhalb S1–S6 — das ist ausschließlich S7 (Zwei-Klassen-Buchführung).
- **Kein Merge durch den Agenten.** S6 ist Maintainer-only, ausnahmslos — auch bei einem
  trivialen, einzeiligen Diff.
- **Kein Force-Push, keine History-Umschreibung** auf einem geteilten Branch (kein
  `push --force`, kein `rebase -i` über bereits gepushte Commits, kein `commit --amend` auf
  veröffentlichtem Stand).
- **Konflikt-Marker-Grep ist ein Kettenglied, kein optionaler Schritt.** Ein Merge-Konflikt, der
  unaufgelöst committet wird, bricht `main` leise — S4 prüft das **vor** jedem Commit-Vorschlag.
- **Worktree-Pflicht bei Parallelarbeit.** Zweite Session, zweiter Agent oder Nachtschicht
  schreiben nie im Haupt-Checkout (`.worktrees/` ist gitignored, siehe `CLAUDE.md`).
- **Jira-Lücke benannt, nicht gefüllt.** Onsite führt an dieser Stelle Jira-Spalten (Board,
  Status-Übergänge je Station); NovaCore hat dafür heute **kein** vollständiges Pendant —
  Ticket-Anbindung läuft, wo sie existiert, über [`jira-workflow.md`](jira-workflow.md)
  (zwei Sites, MCP vs. REST, Freigabe-Pflicht für Schreibläufe). Diese Lücke wird hier verwiesen,
  nicht stillschweigend geschlossen (Invariante J-9 des Phase-J-Bauplans: „nichts erfinden").
- **Affiliate-Isolation.** Affiliate-Plugins durchlaufen diesen Flow **nicht über die SSOT**
  dieses Repos — keine Station hier ist für sie zuständig (Invariante J-5).

## 4. Ergebnis / Output

Nach einem vollständigen Durchlauf existieren: ein gemergter Commit auf `main` (S6), ein
PR-Ergebnismemo als PR-Beschreibung oder -Kommentar (S5), bei Bedarf eine
Registerzeile im [Offene-Stränge-Register](../sitzungswissen/offene-straenge-register.md) für
Nachfolgeschritte, sowie — **nur** am Release-Zug (S7) — ein Version-Bump, ein
CHANGELOG-Waypoint-Abschnitt und ein Git-Tag. Ein Dritter prüft den Abschluss eines Strangs am
Merge-Commit auf `main` plus dem PR-Memo, das die getroffenen Entscheide dokumentiert.

## 5. Verifikation / Abnahme

- [ ] Branch folgt dem Schema `<typ>/<thema>`, Worktree unter `.worktrees/`, `git worktree list`
      vor dem ersten Schreiben geprüft.
- [ ] `node --test plugins/nc/tests/*.test.mjs` grün, `claude plugin validate .` und
      `claude plugin validate plugins/<name> --strict` je berührtem Plugin grün.
- [ ] Konflikt-Marker-Grep sauber unmittelbar vor dem Commit-Vorschlag.
- [ ] PR-Memo an den Overseer trägt was/warum, Entscheide, Verifikationsbelege, offene Punkte —
      keinen Bump, keinen CHANGELOG-Eintrag.
- [ ] Merge und Release-Zug sind ausschließlich beim Maintainer erfolgt, nie durch einen Agenten.
- [ ] Affiliate-Plugins sind an keiner Station dieses Flows über die SSOT beteiligt.

---

*Angelegt 2026-08-26 durch AGENT-WEST (Claude, Sonnet 5, Claude Code) im Rahmen der
Phase-J-Nachtschicht, Paket J-C, AP C3. Quelle: Onsite.ai-OS `origin/main@a9927b2`,
`plugin-maintanance-ruleset-source/contributing-flow.md`, NovaCore-Zuschnitt nach dem
[Phase-J-Bauplan](../aktive-bauplaene/2026-08-25-onsite-delta-phase-j-bauplan.md) §7 AP C3 und
Entscheid J-E4.*
