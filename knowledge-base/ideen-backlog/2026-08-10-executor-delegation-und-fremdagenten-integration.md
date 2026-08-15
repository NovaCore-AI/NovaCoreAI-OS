# Idee: Executor-Delegation als OS-Best-Practice + Integration fremder Agenten-CLIs

> **Status:** **Teil A bei uns erledigt**, Teil B teilweise entschieden, Restfragen offen.
> **Herkunft:** portiert aus dem Onsite-Vorbild (dort festgehalten 2026-08-10 als zweiteilige Idee)
> am 2026-08-15. Beim Abgleich gegen unseren Stand zeigte sich, dass NovaCore in beiden Teilen
> weiter ist als das Vorbild — das Dokument hält deshalb fest, **was hier schon gilt** und welche
> Fragen wirklich offen sind, statt einen Zustand zu behaupten, den wir überholt haben.

## Teil A — Executor-Delegation als Best Practice → **bei uns bereits Standardprozess**

Die Idee: Bulkige Schreib-/Doku-Arbeit (viel Text, klare Vorgabe) wird an günstigere
Executor-Subagenten delegiert; der führende Agent liefert vollständige Instruktionen und reviewt das
Ergebnis, statt den Text selbst zu produzieren. Das schont Kontext und Budget des führenden Agenten.

**Stand NovaCore:** Das ist kein Kandidat mehr, sondern geltender Standardprozess —
`standardprozesse/sync-nachzug-bauzyklus.md` §2 beschreibt den Executor-Lauf am Zyklusende samt der
tragenden Regeln: Der Executor bekommt Protokoll, **zitierte** Matrix-Zeilen und die betroffenen
Sync-Matrix-Zeilen, arbeitet ausschließlich die Nachzüge ab und ändert nichts Inhaltliches am Bau;
„der Executor darf ein delegierter Agent sein oder der führende Agent selbst — entscheidend ist die
**Trennung der Rolle**, nicht die Person". Dazu: ein Zyklus = ein Branch/Worktree = ein
Executor-Lauf, der Executor arbeitet nie auf `main`, Commit-Hoheit bleibt beim führenden Agenten.

**Was daraus noch offen ist:** Die Verankerung in Skills, die viel Text produzieren (`journal`,
`save-session`, `doku-sync`), und ein Referenz-Abschnitt neben
`plugins/nc/referenz/skill-authoring.md`. Der Standardprozess deckt heute den
**Nachzug-Anwendungsfall** ab, nicht die Delegation als generelle Arbeitsweise.

## Teil B — fremde Agenten-CLIs als OS-Werkzeug → **teilweise entschieden**

Die Idee im Vorbild: ein externes Kimi-Code-Plugin für Executor-/Review-Zwecke ins OS integrieren.

**Stand NovaCore:** Wir führen bereits **zwei Affiliates** im Marketplace — `kimi-code-plugin-cc`
(MIT, `ArchiDoxx/Kimi-code-Plugin-CC`: headless CLI-Agent als Zweitmeinung, Review-/Planning-Loops,
adversariale Dual-Reviews) und `mneme-kimi-code` (AGPL-3.0, `ArchiDoxx/mneme-kimi-code`: persistentes
Projekt-Gedächtnis). Beide sind bewusst als **Affiliate** geführt, nicht als Abteilung — die
Zuordnung „kein Firmen-Kernbestandteil" ist damit im Marketplace explizit gemacht statt
stillschweigend vermengt.

**Die offenen Klärungen des Vorbilds — hier neu bewertet:**

1. **Trennungsfrage (Privat- vs. Firmen-Tooling):** durch die Affiliate-Kategorie **beantwortet**.
   Die Plugins sind sichtbar abgegrenzt und tragen keine Abteilungsrolle.
2. **Team-Verteilbarkeit:** **weiterhin offen.** Beide Affiliates haben Host-Anforderungen (`uv`,
   für `kimi-code-plugin-cc` zusätzlich die `kimi`-CLI und ein eigener Account/API-Key je Nutzer).
   Das ist genau die Pro-Nutzer-Setup-Abhängigkeit, die das OS an anderer Stelle vermeidet. Solange
   die Affiliates optional bleiben, ist das tragbar; sobald ein Kern- oder Abteilungs-Skill sie
   **voraussetzt**, wird es zur Rollout-Blockade.
3. **Lizenz/IP:** dokumentiert (MIT bzw. AGPL-3.0). **Achtung AGPL:** bei `mneme-kimi-code` ist die
   Copyleft-Wirkung vor jeder Bündelung oder Ableitung zu prüfen — Nutzung als separat installiertes
   Plugin ist etwas anderes als Vendoring.
4. **Kosten-/Datenschutz-Freigabe** für ein Fremd-LLM im Firmenkontext: **weiterhin offen.** Die
   DSGVO-Absicherung muss für diesen konkreten Fall eingeholt werden, nicht angenommen — insbesondere
   dafür, welche Repo-Inhalte in Review-Loops an einen Zweitanbieter gehen.

## Abgrenzung

Unabhängig von den bordeigenen Subagenten-Möglichkeiten von Claude Code (Task-/Agent-Mechanik) — die
Idee zielt auf einen **heterogenen Zweitanbieter** als Executor/Reviewer, nicht auf einen Ersatz der
bordeigenen Subagenten-Nutzung. Der Wert liegt gerade in der Verschiedenheit: Implementierer ≠
Reviewer, und beide nicht dasselbe Modell.

---

*Portiert 2026-08-15 aus dem Onsite-Vorbild in die NovaCore-Wissensbasis und dabei an den hiesigen
Stand angeglichen (Teil A gegen `sync-nachzug-bauzyklus.md`, Teil B gegen
`.claude-plugin/marketplace.json` geprüft). Ursprung dort: Maintainer-Wunsch Lucas Vöhringer,
2026-08-10.*
