# Idee: Release-Branch-Modell — getrennte Live- und Entwicklungslinie für den Kern

> **Status:** Idee ohne Auftrag — für NovaCore **nicht entschieden**. Im Vorbild vom Maintainer
> angenommen und bewusst zurückgestellt (erst Rollout, dann Modell); ob diese Reihenfolge auch hier
> gilt, ist offen.
> **Herkunft:** portiert aus dem Onsite-Vorbild (dort festgehalten 2026-08-10) am 2026-08-15. Der
> Problembefund wurde gegen **unser** `.claude-plugin/marketplace.json` nachgeprüft und trifft
> unverändert zu.

## 1. Das Problem

Das Team bekommt seine Updates **nicht** aus Releases, sondern aus `main`. Claude Code aktualisiert
den Marketplace-Klon aus dem Default-Branch; unsere Marketplace-Einträge für `nc` und
`nc-development` zeigen mit `source: "./plugins/<name>"` in dasselbe Repo. Damit gilt:

- **Jeder Merge auf `main` erreicht sofort jeden Rechner im Team.** Es gibt keine Stufe zwischen
  „gemergt" und „ausgerollt".
- **Tags und GitHub-Releases sind reine Dokumentation.** Sie steuern nichts. Ein Versions-Bump ist
  das einzige, was das Auto-Update auslöst. Genau deshalb konnte die Tag-Lücke überhaupt entstehen,
  gegen die heute eine eigene Invariante in `plugins/nc/tests/struktur.test.mjs` steht — der Test ist
  das Pflaster, nicht die Lösung.
- **Inkonsistenz zu den Satelliten:** `nc-felix` und `nc-biggi` liegen in eigenen Repos und sind per
  `ref` + Full-SHA gepinnt (`standardprozesse/abteilungs-plugin-bau.md` §3a); sie werden bewusst
  **umgepinnt**, wenn ein Stand das Team erreichen soll. Der Kern hat diese Stufe nicht — dieselbe
  Kette, zwei Sicherheitsniveaus.

Solange nur der Maintainer mit dem OS arbeitet, ist das ein Schönheitsfehler. Mit dem Team-Rollout
wird es zum Risiko: ein Zwischenstand, ein halb fertiger Hook oder ein rot getesteter Merge landet
ungefiltert in der Arbeitsumgebung aller. Die Kontroll-Schicht gatet die Arbeit **im** Repo — für den
Weg **aus** dem Repo ans Team gibt es bislang kein Gate.

## 2. Das Vorhaben

Zwei Linien statt einer:

| Linie | Rolle | Wer zieht daraus |
|---|---|---|
| **Entwicklungslinie** | hierhin gehen alle PRs; CI läuft, Stände dürfen unfertig sein | niemand außer den Entwickelnden |
| **Live-Linie** | trägt ausschließlich freigegebene Stände; wird beim Release aus der Entwicklungslinie nachgezogen | **der Marketplace-Klon des Teams** |

Der Release-Schritt ist damit nicht länger nur Dokumentation, sondern der Vorgang, der einen Stand
**überhaupt** ans Team lässt: Freigabe → Live-Linie nachziehen → Tag → Release. Das ist genau die
Stufe, die die Satelliten über ihren SHA-Pin schon haben.

**Welche Linie `main` heißt, ist eine bewusste Entscheidung**, keine Nebensache: Der Marketplace
zieht den **Default-Branch**. Entweder bleibt `main` die Live-Linie (dann heißt die
Entwicklungslinie z. B. `develop`, und alle PRs zielen dorthin), oder der Default-Branch wird
umgestellt. Die erste Variante ist die kleinere Änderung an bestehenden Reflexen, die zweite die
gebräuchlichere Namensgebung — vor der Umsetzung zu entscheiden, nicht während.

## 3. Was mitgezogen werden muss (Umfang, nicht Umsetzung)

Beim Aufgreifen ist das ein eigener Bauplan mit mindestens diesen Berührungspunkten:

- **Branch-Schutz/Rulesets** für beide Linien — die Live-Linie braucht den strengeren Schutz.
- **CI-Trigger** in `.github/workflows/`: Läuft die Suite auf beiden Linien? Der Release-Workflow
  hängt am Tag und bleibt davon unberührt.
- **`standardprozesse/aktualisierungs-index.md` §3** („Version, Release und Tag — der vollständige
  Weg ans Team"): Der Release-Weg bekommt den Schritt „Live-Linie nachziehen" und verliert jede
  Formulierung, die `main` als Endpunkt behandelt.
- **`standardprozesse/abteilungs-plugin-bau.md` §3a:** Verhältnis Kern-Linie ↔ Satelliten-Pin
  klarstellen, damit nicht zwei Freigabemechaniken nebeneinander gepflegt werden.
- **Setup-Skill `/nc:setup`:** Er richtet den Marketplace ein — er muss auf die Live-Linie zeigen.
  Anders als im Vorbild ist er bei uns **bereits gebaut** (`plugins/nc/skills/setup/`); die Anpassung
  ist damit Teil des Umbaus, nicht eine Vorbedingung dafür.
- **`CLAUDE.md` / `README.md` / `AGENTS.md`:** Zielbranch-Regeln für PRs, sonst zielt jeder Beitrag
  weiter auf die Live-Linie.
- **Struktur-Invariante** prüfen, ob sie den neuen Zustand abbilden kann (z. B. „Live-Linie trägt
  keinen Stand ohne Tag").

## 4. Grenzen und Gegenargumente

- **Mehr Prozess für ein kleines Repo.** Solange faktisch eine Person merged, kostet die zweite Linie
  Handgriffe und bringt nur Schutz gegen einen Fehler, den dieselbe Person auch vorher hätte machen
  können. Der Nutzen entsteht erst mit dem Team — daher die Reihenfolgefrage.
- **Kein Ersatz für die Kontroll-Schicht.** Das Modell verhindert versehentliche Auslieferung, nicht
  schlechten Inhalt. Rote Linien, Gates und Prüfzyklus bleiben unverändert.
- **Nicht auf Satelliten übertragen.** Die pinnen per SHA und brauchen keine zweite Linie; das Modell
  betrifft ausschließlich das Kern-Repo mit dem Marketplace-Manifest.

---

*Portiert 2026-08-15 aus dem Onsite-Vorbild in die NovaCore-Wissensbasis. Ursprung dort:
Maintainer-Auftrag Lucas Vöhringer, 2026-08-10, aus der Release-Arbeit heraus.*
