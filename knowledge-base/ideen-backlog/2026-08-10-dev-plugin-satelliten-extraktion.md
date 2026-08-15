# Idee: Extraktion von `nc-development` in ein Satelliten-Repo

> **Status:** Idee ohne Auftrag — für NovaCore **nicht entschieden**. Im Vorbild als Ziel angenommen
> und bewusst zurückgestellt (Voraussetzungen dort: Rollout abgeschlossen + Release-Branch-Modell
> umgesetzt).
> **Herkunft:** portiert aus dem Onsite-Vorbild (dort festgehalten 2026-08-10) am 2026-08-15;
> Verfahrens- und Plugin-Angaben gegen dieses Repo verifiziert.

## 1. Das Motiv

Das OS-Repo ist heute zugleich Kern-Repo UND Heimat des Dev-Abteilungsplugins — administrativ sollen
Abteilungen eigene Repos sein. Wir haben dafür bereits zwei Präzedenzfälle: `nc-felix` (Repo
`NovaCore-AI/Felix-OS`, seit 2026-07-28) und `nc-biggi` (Repo `NovaCore-AI/Biggi-OS`, seit
2026-08-05). Die Extraktion trennt Kern-Governance von Abteilungs-Governance sauber: ein Repo, ein
Zuständigkeitsbereich, statt eines Repos mit zwei verschiedenen Freigabekreisen.

## 2. Warum zurückstellen

- **SHA-Pin-Friktion:** Jeder Satelliten-Stand erfordert Umpinnen im Marketplace
  (`standardprozesse/abteilungs-plugin-bau.md` §3a) — in einer aktiven Bauphase des Plugins wäre das
  unverhältnismäßig viel Zusatz-Handgriff pro Änderung. `nc-development` trägt derzeit 11 Skills in
  vier Modulen (`fe` / `be` / `flc` / `wzs`).
- **Die CLAUDE-Ebenen-Architektur entkoppelt die Dringlichkeit:** Die Abteilungs-CLAUDE hängt am
  **Plugin-Paket**, nicht am Repo-Standort — `plugins/nc-development/` kann sie schon heute im
  OS-Repo tragen (`grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md`). Das Problem, das die
  Extraktion ursprünglich mitlösen sollte (Abteilungswissen erreicht Arbeitsrepos), ist bereits über
  den Plugin-Cache-Kanal gelöst.

## 3. Unterschied zu den bestehenden Satelliten (wichtig)

`nc-felix` und `nc-biggi` sind **eigenständige Kollegen-OS** nach
`standardprozesse/abteilungs-plugin-bau.md` **§3b**: Sie hängen *nicht* am Kern, bringen Kernmodul
und Kontroll-Schicht selbst mit und dürfen nicht parallel zum Kern laufen. Eine Extraktion von
`nc-development` wäre der **andere** Fall — §3a, Satelliten-Extraktion: ein Abteilungsplugin, das
seine `dependencies: ["nc"]` behält und lediglich in einem eigenen Repo wohnt. Die beiden Verfahren
nicht verwechseln; die Fallen unterscheiden sich.

## 4. Verfahren bei Umsetzung

Standardprozess `standardprozesse/abteilungs-plugin-bau.md` §3a (Satelliten-Extraktion), inkl.
Registry-Feldern, SHA-Pin und Install-Probe. Beachten — **§1a Auslieferungsgrenze**: Beim Nutzer
kommt eine Kopie des **Plugin-Verzeichnisses** an. Alles Auszuliefernde (inkl. Abteilungs-CLAUDE)
muss darin liegen, nicht an der Repo-Wurzel des neuen Satelliten.

## 5. Querverweis

Verwandte Verteiltopologie-Änderung: Idee
[Release-Branch-Modell](2026-08-10-release-branch-modell-live-dev.md). Beide Ideen verschieben, wie
Stände das Team erreichen; im Vorbild sind sie bewusst in derselben Reihenfolge-Logik zurückgestellt
(erst Rollout, dann strukturelle Umbauten am Verteilmodell).

---

*Portiert 2026-08-15 aus dem Onsite-Vorbild in die NovaCore-Wissensbasis. Ursprung dort:
Maintainer-Konzeption Lucas Vöhringer, 2026-08-10.*
