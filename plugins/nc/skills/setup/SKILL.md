---
name: setup
description: >-
  Stellt die Wissensbasis (SSOT) des OS lokal bereit — in einem Schritt. Klont die
  benötigten Quellen vollständig in eine feste Ablage unterhalb des Home-Verzeichnisses
  (`~/.nc/ssot/<repo-name>/`) und zieht eine vorhandene Kopie per Fast-Forward nach. Die
  Verlinkung ist der feste Pfad, den der Firmen-Block in der globalen CLAUDE.md nennt.
  Einmal nach der Installation ausführen, später bei Bedarf
  erneut. Trigger-Begriffe: „Setup", „Ersteinrichtung", „SSOT einrichten", „Wissensbasis
  fehlt", „Wissensbasis aktualisieren", „nach der Installation".
---

# /nc:setup — Wissensbasis lokal bereitstellen

## Zweck

Der Marketplace liefert **nur das Plugin** aus: Hooks, Skills, Formatregeln, WP-Rahmen,
Registry. Die **Wissensbasis liegt im OS-Repo außerhalb des Plugin-Verzeichnisses** und
reist deshalb nicht mit. `/nc:start` braucht sie aber, und der Firmen-Block in der globalen
`CLAUDE.md` verweist auf sie („vor Vermutungen dort triagieren") — ohne lokale Kopie zeigt
das ins Leere. Dieser Skill schließt genau diese Lücke.

**Verhältnis zu `/nc:start`:** eine reine Abhängigkeit, kein Eingriff. `/nc:start` *braucht*
die Wissensbasis, dieser Skill *liefert* sie. Der Start-Skill wird davon nicht verändert
und ruft diesen Skill nicht auf; wer ihn braucht, ruft ihn selbst.

## Ablauf

**Ein Befehl, mehr nicht:**

```
node "<skills-pfad>/setup/ssot-provision.js" --json
```

Er ist idempotent und entscheidet selbst, was zu tun ist: Fehlende Quellen werden **voll
geklont**, vorhandene per **Fast-Forward** nachgezogen. Welche Quellen nötig sind, liest er
aus der Registry des Kerns — der Kern immer, dazu jede installierte Abteilung mit **eigenem
Repo und eigenem Wissen außerhalb ihres Plugins**. Satelliten brauchen nichts: bei ihnen ist
das Repo das Plugin.

**Voller Klon, kein Teilausschnitt.** Die SSOT-Skills verweisen nicht nur auf die
Wissensbasis, sondern auch auf Repo-Inhalte daneben (etwa die Formatregeln unter
`referenz/`). Ein Ausschnitt würde genau diese Verweise brechen — und das ganze Repo sind
wenige Megabyte.

**Sparse-Relikte der Erstfassung werden geheilt.** Die erste Fassung dieses Skills klonte
nur den Wissenspfad (Sparse-Checkout). Trifft der Lauf auf eine solche **unveränderte**
Kopie, erweitert er sie vor dem Nachziehen automatisch zum vollen Arbeitsbaum
(`git sparse-checkout disable`) und meldet das im Ergebnis — ein erneuter Aufruf von
`/nc:setup` genügt dann als Reparatur. Eine lokal **veränderte** Sparse-Kopie wird nie
angefasst: Sie kommt als `lokal-veraendert` samt Sparse-Hinweis zurück — Änderungen
sichern oder entfernen, dann erneut aufrufen.

**Die Verlinkung ist der feste Pfad.** Der Klon landet deterministisch unter
`~/.nc/ssot/<repo-name>/`, und der Firmen-Block in der globalen `CLAUDE.md` nennt genau
diesen Pfad als Einstieg. Dadurch lösen die relativen Pfadangaben der Skills auf, ohne dass
ein Skill geändert werden müsste.

Danach das Ergebnis berichten: je Quelle Zustand (`angelegt` · `aktualisiert` ·
`lokal-veraendert` · `fehler`), Zielpfad und Commit. Bei `fehler` den genannten Grund
**wörtlich** weitergeben — die häufigen Fälle (git fehlt · kein Zugang zum privaten Repo ·
Kopie divergiert) formuliert das Skript bereits handlungsfähig.

## Regeln

- **Nur Fast-Forward.** Kein Merge, kein Rebase, kein Reset, kein Force. Eine lokal
  veränderte Kopie wird **gemeldet, nicht überschrieben** — dort könnte unversicherte
  Arbeit liegen.
- **Geschrieben wird ausschließlich in der SSOT-Ablage** unterhalb des Home-Verzeichnisses
  (Override `NC_SSOT_DIR`). Arbeits-Repo und globale `CLAUDE.md` werden **nie** angefasst.
- **Keine personenbezogenen Pfade** im Bericht fest verdrahten — der Pfad kommt aus dem
  Skript, nicht aus Annahmen über den Rechner.
- **Nie behaupten, die Wissensbasis sei da, ohne die Ausgabe gesehen zu haben.**
- **Rote Linien unberührt:** Dieser Skill pflegt eine Lesekopie. Er committet nichts, pusht
  nichts, ändert nichts an einem Arbeits-Repo.
- **Bekannte Grenze, offen benennen:** Das OS-Repo ist privat. Ohne git und ohne Zugang
  bleibt die Wissensbasis unerreichbar — dann sagt der Skill das klar, statt einen Erfolg
  vorzutäuschen.

## Verifikation

- Die Ausgabe nennt für **jede** Quelle einen Zustand; keine steht auf `fehler`.
- Der Zeiger `index.json` liegt in der Ablage und führt je Quelle `pfad`, `commit` und
  `stand_am`.
- Im Zielpfad liegt der Wissenspfad wirklich auf der Platte, nicht nur ein `.git`.
- Der Klon trägt Repo-Inhalt auch **außerhalb** des Wissenspfads (etwa `plugins/`) — eine
  Kopie, die nur den Wissenspfad enthält, ist ein Sparse-Relikt und gehört gemeldet.
- Der Bericht nennt je Quelle Zustand, Pfad und Commit — oder den wörtlichen Fehlergrund.
