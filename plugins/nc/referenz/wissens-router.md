# Referenz: Wissens-Router und Node-Doks

> Gemeinsame Grundlage der vier Wissens-Router `wissen-aendern`, `wissen-planen`,
> `wissen-nachschlagen` und `wissen-protokolle` sowie des `UserPromptSubmit`-Hooks
> `nc-wissens-hinweis.js`. Sie steht **einmal** hier, statt in jedem Router zu stehen — fünf
> Kopien derselben Mechanik wären Doppelpflege und würden auseinanderlaufen.
>
> **Ablageort:** Diese Datei liegt im Kern-Plugin `nc` unter `referenz/` und reist mit dem
> Plugin — die Router brauchen sie zur Laufzeit, auch in fremden Arbeits-Repos. Der
> **Standardprozess** (wann ein neuer Router gerechtfertigt ist, was mitwandert, was die Suite
> erzwingt) liegt als `wissens-router-bau.md` in der Wissensbasis des **OS-Repos** und ist nach
> Installation nicht erreichbar. Diese Referenz regelt die **Mechanik**, nicht den Prozess.
>
> **Portiert am 2026-08-25 aus Onsite.ai-OS `a9927b2` (Struktur-Paritätsaudit); NovaCore-Abweichungen
> an Ort und Stelle begründet.** Das Vorbild führt diese Datei unter einer Spec-Randnummer;
> NovaCore hat keine solche Design-Spec — die Begriffsnorm trägt bei uns die
> `NovaCore-OS-Node-Doks-Definition.md` der Wissensbasis des **OS-Repos**.

## 1 · Was „Node-Doks" sind

**Node-Doks** (Knotendokumente) sind die Dokumente einer Wissensbasis, die **keinen Fachinhalt
tragen, sondern auf ihn verweisen** und ihn erschließen. Sie sind die **Knoten** des
Wissensnetzes; die Fachdokumente sind seine **Blätter**.

Die **Begriffs- und Bestandsquelle** — welche Knoten es gibt, mit Pfad, Geltungsbereich und
zuständigem Router — ist die `NovaCore-OS-Node-Doks-Definition.md` der Wissensbasis des
**OS-Repos**; verankert ist der Begriff in der dortigen `NovaCore-OS-SSOT-Definition.md`. Diese
Datei hier trägt die **Laufzeit-Mechanik**. Sie wiederholt die Begriffserklärung, weil ein
installiertes Plugin keine Repo-Pfade lesen kann; sie führt **weder Bestand noch
Geltungsbereich** — schon deshalb nicht, weil NovaCore seine Knoten an drei Orten führt
(Wissensbasis · Repo-Wurzel und Kern-Plugin · Sitzungswissen) und diese Aufzählung hier sofort
driften würde. **Bei Abweichungen gewinnt die Node-Doks-Definition;** diese Referenz wird in
derselben Änderung nachgezogen.

Warum der Begriff nötig ist: Ein Router, der auf einen Knoten zeigt, erschließt mit **einem**
Zeiger eine ganze Kategorie. Ein Router, der auf jedes Blatt zeigt, kostet Dauerkontext im
Verhältnis zur Dokumentzahl und veraltet mit jeder neuen Datei. Die Router zeigen deshalb
grundsätzlich auf Knoten — und auf ein einzelnes Blatt nur mit Begründung.

## 2 · Das Problem, das die Router lösen

Die Wissensbasis ist vollständig und indiziert — und trotzdem faktisch unsichtbar, solange ihre
Nutzung allein an Agent-Disziplin hängt. Zwei Fehlerzustände, die **nicht** gleich schwer wiegen:

| Zustand | Was passiert | Schwere |
|---|---|---|
| **Unwissen** | Der Agent weiß nicht, dass ein Dokument existiert | gefährlich — er kann nicht einmal nachsehen |
| **Ermessen** | Er weiß es, hält es aber für nicht einschlägig | tragbar — eine Fehleinschätzung, keine Blindheit |

Die Router beseitigen **Unwissen**: Ihre `description` liegt ab Sitzungsstart im Kontext, der
Body wird erst bei Bedarf geladen (Progressive Disclosure). Ermessen bleibt bestehen und wird
nur durch den Hinweis-Hook (§5) weiter eingeengt.

## 3 · Kontext-Ökonomie — die tragende Konstruktionsregel

Geladen wird je Skill dauerhaft nur `name` + `description` (max. 1.024 Zeichen). Ein Router je
**Dokument** hieße Dutzende Beschreibungen für dasselbe Ergebnis. Deshalb gilt:

- **Ein Router je Arbeitsanlass, nicht je Dokument** — der Anlass ist das, was der Nutzer
  formuliert („ich ändere einen Hook"), nicht die Kategorie.
- **Jede `description` grenzt sich namentlich gegen die anderen Router ab**, sonst konkurrieren
  sie um dieselben Prompts.
- **Bodies liefern Zeiger, niemals Inhalt.** Kopierter Quelltext wäre sofort Doppelpflege und
  driftet gegen die Quelle — ein Router, der Falsches behauptet, ist schlimmer als keiner.
- Die Summe der vier Router-`description`s ist **testerzwungen gedeckelt** (Einzelgrenze 1.024,
  Summe 6.000 Zeichen; `tests/struktur.test.mjs` des Kern-Plugins). Wer den Deckel hebt, tut es
  bewusst.

## 4 · Plugin-Grenze: wie der Zielpfad aufgelöst wird

Die Router reisen im Plugin-Paket und laufen damit auch in fremden Arbeits-Repos, in denen die
Wissensbasis des **OS-Repos** nicht existiert. Ein fester Repo-Pfad zeigte dort ins Leere.

**Auflösungsweg — verbindlich:**

1. Infra-Registry `~/.claude/nc/infra.json` lesen (Schema und Felder: `skills/setup/infra-registry.md`
   des Kern-Plugins `nc`).
2. **Zuerst `kernRepoPfad`** — absoluter Pfad eines Arbeitsklons des **OS-Repos** auf dieser
   Maschine (aktueller Stand, Fixes sind committierbar; heute ein optionales Feld).
3. **Sonst `kernSsotPfad`** — die von `/nc:setup` angelegte Lesekopie. **NovaCore-Abweichung
   vom Vorbild** (Overseer-Entscheid Phase H): Das Vorbild kennt nur den Arbeitsklon. Für reine
   **Zeiger** ist die Lesekopie legitim; **geschrieben wird in ihr nie** — ein Eintrag dort wäre
   beim nächsten Fast-Forward verloren.
4. Ist die `schemaVersion` **höher** als die dem Kern bekannte, wird das gemeldet statt geraten.

**Fehlen beide Felder, stehen sie auf `ausstehend` oder zeigen sie ins Leere:** Der Router sagt
das **ausdrücklich** als Übergangs-Befund und nennt `/nc:setup`. Er rät nicht, erfindet keinen
Pfad und schweigt nicht — eine erfundene Pfadangabe ist der teuerste Ausgang, weil sie wie eine
Auskunft aussieht. **Die Platte ist die Wahrheit:** ein Registry-Pfad ohne Bestand dahinter gilt
als fehlend. (Der **Hook** verhält sich im selben Fall umgekehrt: er schweigt, siehe §5.)

**Affiliate-Grenze:** Die Router und der Hook reisen im Kern `nc` und in den daran hängenden
Abteilungs- und Kollegen-OS-Plugins. **Affiliate-Plugins** (Marketplace-Kategorie `affiliate`,
heute `kimi-code-plugin-cc` und `mneme-kimi-code`) sind davon **ausgenommen**: Sie sind nicht an
die SSOT angeschlossen, tragen keine Router, keinen Sucheindex-Anschluss und keine
Registry-Auflösung. Wo diese Referenz „alle Plugins" sagt, sind sie nicht gemeint.

## 5 · Der Hinweis-Hook (`UserPromptSubmit`)

`nc-wissens-hinweis.js` gleicht Prompt-Stichworte gegen den vorgebauten Sucheindex
`hooks/wissen-sucheindex.json` ab und injiziert Treffer als `additionalContext`. Harte
Eigenschaften, die nicht verhandelbar sind:

- **Kein Gate.** Für `UserPromptSubmit` löscht Exit 2 den Prompt; er ist deshalb in **keinem**
  Pfad zulässig. Der Hook ist reine Injektion, fail-open überall, jeder defekte Zustand führt zu
  Schweigen — auch eine fehlende oder tote Registry.
- **Kein Live-Parsing.** Der Hook feuert bei jedem Prompt; er liest ausschließlich den kompakten
  Sucheindex, nie ein Markdown-Dokument, und macht keinen Netzzugriff.
- **Höchstens drei Treffer**, je eine Zeile, und **denselben Treffer höchstens einmal je Sitzung.**
- **Opt-out** per Env `NC_WISSEN_HINWEIS=off`.
- **Pfadbezug — NovaCore-Abweichung:** Feld `pfad` ist relativ zur Wurzel des **OS-Repos** (also
  mit dem `knowledge-base/`-Präfix der Wissensbasis), nicht relativ zur Wissensbasis. Das
  Vorbild schiebt dort ein festes Wissensbasis-Segment ein; unsere flachere Struktur braucht das
  nicht, und ein repo-relativer Pfad ist gegen die Platte prüfbar, ohne eine zweite Regel zu
  kennen. `basis: "kern-plugin"` löst stattdessen gegen die Wurzel des Kern-Plugins auf.

## 6 · Drift-Sicherung

Router-Tabellen und Sucheindex sind **abgeleitete** Artefakte. Ohne Verdrahtung driften sie
gegen die Wissensbasis, und ein Zeiger auf ein verschobenes Dokument ist schlimmer als kein
Zeiger, weil ihm vertraut wird. Deshalb:

- Jeder Pfad, den der Sucheindex nennt, muss real existieren — testerzwungen
  (`tests/nc-wissens-hinweis.test.mjs`).
- Jeder Sucheindex-Eintrag mit Wissensbasis-Pfad muss zusätzlich im Master-Index geführt sein —
  testerzwungen ebenda. **Offene Lücke gegenüber dem Vorbild:** dass ein Eintrag einen
  **gebauten** Router nennt und dass die Pfade der **Router-Zeiger-Tabellen** real existieren,
  ist bei uns heute **nicht** testerzwungen; beides bleibt Leseaufgabe.
- Der Hook endet in jedem Pfad mit Exit-Code 0 — testerzwungen ebenda.
- Wird eine Wissensdatei angelegt, verschoben oder gelöscht, gehören Router-Tabellen und
  Sucheindex zum Änderungsumfang. Die Zeile dazu steht in der Änderungs-Matrix
  (`standardprozesse/aktualisierungs-index.md` der Wissensbasis des **OS-Repos**, Abschnitt 2.1,
  „Wissens-Router oder Zeiger-Index geändert").
