# Strang — Definition (Grundsatzdokument)

> **Zweck:** die normative Begriffsquelle für „**Strang**" im NovaCore-OS — Schwester der
> [`SSOT-Definition`](NovaCore-OS-SSOT-Definition.md), der
> [`Gates-Definition`](NovaCore-OS-Gates-Definition.md), der
> [`Node-Doks-Definition`](NovaCore-OS-Node-Doks-Definition.md). Der Ablauf, den ein Strang
> durchläuft, steht **nicht** hier, sondern im Standardprozess
> [`contributing-flow.md`](../standardprozesse/contributing-flow.md) (Stationen S1–S7) — dieses
> Dokument sagt nur, **was** ein Strang *ist*, nicht wie man ihn *durchführt*.
>
> **Grundlage:** Port aus Onsite.ai-OS `origin/main@a9927b2`
> (`project-meta-infos/Onsite.ai-OS-Strang-Definition.md`), NovaCore-Zuschnitt nach dem
> [Phase-J-Bauplan](2026-08-25-onsite-delta-phase-j-bauplan.md) §7 AP C4 (Mapping D34,
> Entscheid J-E4). **Abgeleitetes Dokument** — bei Widerspruch gewinnen die normativen Quellen
> (jüngster Bauplan, dann Standardprozesse, dann Produktvision — Quellen-Hierarchie der
> `AGENTS.md`).

## Definition

Ein **Strang** ist die kleinste vollständige Arbeitseinheit im NovaCore-OS: **ein** Ziel-Repo,
**ein** Branch nach dem Schema `<typ>/<thema>` (z. B. `feat/…`, `fix/…`, `docs/…`), **ein**
Worktree unter `.worktrees/<branch>` bei Parallelarbeit, **ein** PR-Memo als Ergebnisbericht
und **ein** definiertes Ende — Merge auf `main` **oder** ausdrücklicher Abbruch, in beiden
Fällen mit Aufräumen (Worktree entfernen, Registerzeile schließen).

Ein Strang ist damit weder ein Commit (zu klein — trägt keinen abgeschlossenen Bericht) noch
ein Bauplan (zu groß — ein Bauplan kann mehrere Stränge auslösen, etwa die fünf Pakete einer
Phase). Die Beziehung ist: **ein Bauplan → ein oder mehrere Stränge → je Strang ein PR.**

## Bestandteile

| Bestandteil | Regel |
|---|---|
| **Ziel-Repo** | genau eines je Strang — ein Strang schreibt nie gleichzeitig in zwei Repos |
| **Branch** | `<typ>/<thema>`, angelegt vom bauenden Agenten (Station S1 des Contributing-Flows); Bestands-Branches, die vor dieser Norm entstanden, bleiben gültig und werden nicht rückwirkend umbenannt |
| **Worktree** | `.worktrees/<branch>` (gitignored) — Pflicht, sobald eine zweite Session, ein zweiter Agent oder eine Nachtschicht parallel arbeitet; sonst optional, aber empfohlen |
| **PR-Memo** | der Ergebnisbericht am Ende von Station S5 — was/warum, Entscheide, Verifikationsbelege, offene Punkte; trägt **keinen** Version-Bump und **keinen** CHANGELOG-Eintrag (Zwei-Klassen-Buchführung) |
| **Ende** | Merge auf `main` (Regelfall) oder ausdrücklicher, dokumentierter Abbruch (Stopp-Bedingung, Blockade) — beides zählt als „zu Ende gebracht"; unbeendet ist nur ein Strang ohne beides |
| **Aufräumen** | Worktree entfernen (`git worktree remove`), Registerzeile im [Offene-Stränge-Register](../sitzungswissen/offene-straenge-register.md) mit Erledigt-Datum schließen — ein Strang, dessen Worktree nach dem Merge stehen bleibt, ist nicht zu Ende, nur ungepflegt |

## Rollen

Nach dem Org-Ruleset dieser Instanz (nicht Onsite-Rollennamen — siehe
[`contributing-flow.md`](../standardprozesse/contributing-flow.md) §2): der **bauende Agent**
trägt die Umsetzung (S1–S5) unter **Overseer**-Planung und -Review; der **Overseer** plant den
Auftrag vor und liest das Ergebnis danach, ist aber nicht identisch mit dem **Maintainer**, der
allein Merge (S6) und Release-Zug (S7) verantwortet. Ein Strang kennt also **mindestens** zwei,
typischerweise **drei** beteiligte Rollen — nie entscheidet der bauende Agent allein über den
eigenen Merge.

## Prinzipien

1. **Ein Strang, ein Zweck.** Vermischt ein Branch zwei unabhängige Vorhaben, ist das kein
   Effizienzgewinn, sondern ein PR, den niemand sauber reviewen oder zurückrollen kann.
2. **Versionslos, bis zum Release-Zug.** Ein Strang trägt sein Ergebnis im PR-Memo, nicht in
   CHANGELOG oder Versionsnummer — beides entsteht ausschließlich am Release-Zug
   (`aktualisierungs-index.md` §0/§3.6), gebündelt über mehrere Stränge.
3. **Kein Strang ohne Ende.** Ein Strang, der weder gemergt noch abgebrochen wird, ist eine
   offene Baustelle, keine abgeschlossene Arbeitseinheit — genau dafür existiert das
   Offene-Stränge-Register.
4. **Parallelarbeit trennt sich über Worktrees, nicht über Disziplin.** Zwei Agenten im selben
   Checkout sind ein Konfliktrisiko, das die Worktree-Pflicht strukturell verhindert, statt es
   der Vorsicht zu überlassen.

## Verhältnis zu anderen Konzepten

- **Zum Offene-Stränge-Register:** Ein Strang, der eine Sitzung überdauert, bekommt dort eine
  Zeile (Datum, Strang, Verbleib, nächster Schritt, Status). Ein „**offener Strang**" im
  Register ist einer, dessen Ende (Merge oder Abbruch) noch nicht eingetreten ist — das Register
  ist der Gedächtnisträger dieses Dokuments über Sessions hinweg, nicht eine zweite Definition.
- **Zur Zwei-Klassen-Buchführung** (`aktualisierungs-index.md` §0): Ein Strang liefert die
  **Wissensklasse** sofort (Standardprozesse, Definitionsdokumente — mit dem Merge lebend) und
  die **Produktklasse** nur als Diff, nie als Version — Version, CHANGELOG-Waypoint und Tag
  entstehen erst am gebündelten Release-Zug, der mehrere Stränge zusammenfasst.
- **Zum Bauplan:** Ein Bauplan in `aktive-bauplaene/` beauftragt einen oder mehrere Stränge; er
  ist nicht selbst ein Strang, sondern dessen Auslöser (Kette in
  [`contributing-flow.md`](../standardprozesse/contributing-flow.md)).

---

*Angelegt 2026-08-26 durch AGENT-WEST (Claude, Sonnet 5, Claude Code) im Rahmen der
Phase-J-Nachtschicht, Paket J-C, AP C4. Quelle: Onsite.ai-OS `origin/main@a9927b2`,
`project-meta-infos/Onsite.ai-OS-Strang-Definition.md`, NovaCore-Zuschnitt nach dem
[Phase-J-Bauplan](2026-08-25-onsite-delta-phase-j-bauplan.md) §7 AP C4 und Entscheid J-E4.*
