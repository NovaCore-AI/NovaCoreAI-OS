# Idee: Anti-Drift-Prüfung der beiden Indizes (automatisiert)

> **Status:** Idee ohne Auftrag — für NovaCore **nicht entschieden**. Wird sie beauftragt, entsteht
> ein Bauplan in `grundwissen/`, der auf dieses Dokument verweist (Lebenszyklus laut
> `SSOT-Document-Index` Teil 1).
> **Herkunft:** portiert aus dem Onsite-Vorbild (dort festgehalten 2026-08-09) am 2026-08-15;
> Terminologie auf NovaCore gemappt, Pfad- und Werkzeugangaben gegen dieses Repo verifiziert.

## Problem

Beide Indizes und die Standsaussagen der lebenden Doku sind handgepflegt und driften. Die
Struktur-Tests prüfen heute nur **Vollständigkeit, Linkgültigkeit, Kategorie-Routing und die
Wurzel-Regel** des SSOT-Index sowie den Leitversions-Gleichstand — nicht, ob die **Inhalte** noch
stimmen. Im Vorbild sind vier Drift-Fälle belegt (Spec-Versions-Drift zweimal, veraltete
Skill-Katalog-Überschrift, toter Vorlagen-Pfad); die Bauart der Indizes ist bei uns dieselbe, also
ist es dieselbe Angriffsfläche.

## Idee

1. **Aktualisierungs-Index prüfen:** Entsprechen die Matrix-Zeilen dem aktuellen Stand — existieren
   alle genannten Dateien/Pfade, existieren die genannten Tests/Kommandos, verweist keine Zeile auf
   zurückgezogene Entscheidungen?
2. **SSOT / SSOT-Index prüfen:** Stimmt alles im Repo mit den genannten Versionen überein, und
   besteht **inhaltliche Kohärenz** zwischen den Standsaussagen — `CHANGELOG.md` ↔ `VERSION` ↔
   `plugin.json` ↔ Scope-/Zahlenangaben (Skills, Tests, Module) ↔ `README.md`/`AGENTS.md` müssen
   jeweils mit dem letzten Stand übereinstimmen?

Bei uns ist Punkt 2 unmittelbar belegbar: Die Plugin-Beschreibung in
`plugins/nc/.claude-plugin/plugin.json` nennt die Skill-Zahl des Kerns im Fließtext — eine Zahl, die
bei jedem neuen Skill mitwandern muss und die heute kein Test gegen `plugins/nc/skills/` zählt.

## Umsetzungsoptionen (unverbindliche Ersteinschätzung)

- **Deterministisch** (Node-Skript / Ausbau von `plugins/nc/tests/struktur.test.mjs`): schnell,
  zuverlässig, CI-fähig — richtig für alles Mechanische: Pfad-Existenz, Versions-Gleichstand,
  Zahlen-Abgleich (Skill-/Test-/Modulzahlen per Zählung gegen die Doku-Nennungen), verbotene Muster.
- **Kleines Modell** (z. B. Haiku) als periodischer Prüf-Lauf: nötig für echte **semantische**
  Kohärenz („widersprechen sich zwei Standsaussagen?") — langsamer und nicht deterministisch, fängt
  dafür die Fälle, die Regex nie sieht.
- **Empfohlener Schnitt:** Mechanik als Test-Invarianten (Stufe 1, sofort CI-tauglich), Semantik als
  skill-geführter Prüflauf (Stufe 2, z. B. in `/nc:doku-sync` oder als eigener Skill) — **nicht** als
  PostToolUse-Hook je Edit (zu teuer, zu laut).

## Anknüpfungspunkte

- `plugins/nc/tests/struktur.test.mjs` (bestehende Index-Invarianten) · `/nc:doku-sync`
  (Abschluss-Checkliste) · `standardprozesse/aktualisierungs-index.md` §6 (Selbsttest — heute
  manuell, klarer Automatisierungskandidat) · `standardprozesse/ssot-aufbau.md` §5 (die
  **manuellen** Anti-Drift-Prinzipien, die diese Idee maschinell unterlegen würde).
- **Abgrenzung:** Im Vorbild hing diese Idee an dessen SSOT-Abstufung (Queue-Mechanik). Die ist für
  NovaCore **ausgeschlossen** (Bauplan 2026-08-10 §0; Invariante I1 des Bauplans 2026-08-11) — die
  Prüfung läuft hier ausschließlich im Kern-Repo und in jedem Satelliten **für sich**; es gibt
  keinen Prüfweg über die Satellitengrenze hinweg.

## Nachtrag: eigener Prüf-Subagent?

**Bewertung:** sinnvoll — aber nur für die **semantische Hälfte** (Stufe 2). Die mechanische Hälfte
(Versionen, Links, Zahlen, Pfade) bleibt deterministischer Code — schneller, kostenlos, CI-fähig,
halluzinationsfrei; die im Vorbild belegte Drift-Serie hätte eine kleine Test-Invariante gefangen,
dafür braucht es kein Modell. Für Widersprüche zwischen Standsaussagen und unbelegte
„behoben"-Meldungen ist ein **Subagent** dagegen die richtige Form: eigener Kontext (liest viele
Dokumente, ohne den Hauptkontext zu fluten), eigene Systemanweisung mit Prüfmethode,
plugin-verteilbar (`agents/` im Kern), passt zum Baustein „Arbeitsteilung/Agents". Aufruf durch
einen periodischen Kurationslauf, nicht je Edit (Kosten).

---

*Portiert 2026-08-15 aus dem Onsite-Vorbild in die NovaCore-Wissensbasis. Ursprung dort:
Maintainer-Einfall Lucas Vöhringer, 2026-08-09.*
