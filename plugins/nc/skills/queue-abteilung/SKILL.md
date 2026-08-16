---
name: queue-abteilung
description: >-
  Hebt die lokal gesammelten SSOT-Commits des Abteilungs-Satelliten-Klons samt neuer
  Kandidaten-Queue-Zeilen auf einen Zyklus-Branch und erstellt daraus EINEN PR gegen das
  Abteilungs-Repo. Prüft vorher, dass ausschließlich Wissensbasis-Pfade berührt sind und die
  neuen Queue-Zeilen dem Queue-Format entsprechen; bricht bei fremden Pfaden oder
  Formatverstößen ab. Erste Station des Queue-Flows (14-tägiger Takt), einen Tag vor jedem
  Lauf von /nc:queue-kern. Trigger-Begriffe: „Queue der Abteilung einreichen",
  „queue-abteilung", „Abteilungs-Queue-PR", „Zyklus-PR", „Queue einreichen", „SSOT-Commits
  hochheben", „Wissensstand einreichen".
---

# /nc:queue-abteilung — Zyklus-PR der Abteilungs-Queue

## Zweck

Erste Station des Queue-Flows (Standardprozess `queue-flow.md` des OS-Repos; Format und
Kriterien: `referenz/pflege-auspraegung.md` dieses Kern-Plugins `nc`): Während des
14-Tage-Zyklus schreiben `/nc:end-session` und `/nc:journal` Stand, Journale und
Kandidaten-Queue in die Wissensbasis des Abteilungs-Satelliten-Klons. Dieser Skill bündelt
diesen lokalen Wissenszuwachs **einmal** zu einem Pull Request — statt vieler Einzel-PRs und
statt ungesicherter lokaler Commits. Er gehört an das Ende des WP8-Zyklus eines Arbeitszyklus
(WP-Rahmen `wp-rahmen.md` dieses Kern-Plugins). Was hier gemergt wird, liest einen Tag später
`/nc:queue-kern` als Grundlage seines Promotions-PR (Versatz-Regel des Queue-Flows) — dieser
Skill schreibt **nie** in den Kern. Auslösung heute **manuell**; zusätzlich **erinnert** der
Fälligkeits-Check im Sitzungsstart (Hook `nc-queue-faelligkeit.js` dieses Kern-Plugins,
14-Tage-Takt) an den fälligen Zyklus-Lauf — er erinnert nur, er startet nichts.

**Heutiger Übergangszustand (E1):** Die interne Abteilung `development` ist repo-intern und
hat keinen Satelliten — ihre Übergangs-Queue lebt im OS-Repo und wird über dessen regulären
Branch/PR-Fluss eingebracht, **nicht** über diesen Skill (Regel `uebergang` der
Pflege-Ausprägung). Dieser Skill wird mit dem ersten Abteilungs-Satelliten wirksam.

## Ablauf

1. **Klon bestimmen:** den Klon-Pfad der Abteilung aus der Infra-Registry lesen
   (`~/.claude/nc/infra.json`, Map `abteilungsRepoPfade` — Schema:
   `skills/setup/infra-registry.md` dieses Kern-Plugins). Die drei Fehlbilder **getrennt**
   melden, weil sie verschiedene Folgeschritte auslösen: **(a) Registry-Datei fehlt** → das
   Setup lief auf dieser Maschine nie, `/nc:setup` erstmalig ausführen · **(b) Registry
   vorhanden, aber der Eintrag der Abteilung fehlt oder steht auf `"ausstehend"`** → die
   Abteilung hat noch keinen Satelliten; ihre Queue lebt am Übergangsort und wird über den
   regulären Branch/PR-Fluss des betreffenden Repos eingereicht, **nicht** über diesen Skill ·
   **(c) Pfad eingetragen, aber auf der Platte nicht vorhanden** → toter Registry-Eintrag,
   per `/nc:setup` reparieren lassen. In allen drei Fällen abbrechen — nichts klonen, nichts
   anlegen.
2. **Lage erheben (nur lesend):** im Klon `git -C <pfad> status --porcelain`,
   `git -C <pfad> rev-parse --abbrev-ref HEAD` und die noch nicht eingereichten Commits
   (`git -C <pfad> log --oneline <upstream>..HEAD`, Basis = Standardbranch des Remote).
   Alles im Ergebnis ausweisen — Zahl der Commits, Branch, ob der Baum sauber ist.
3. **Remote-Identität prüfen, dann Standardbranch-Sync (Vorlauf, nur lesend):** **Vor dem
   ersten Fetch** die Identität des Klons prüfen — derselbe Check wie in `/nc:queue-kern`
   Schritt 3: `git -C <pfad> remote get-url origin` gegen das **`repository`-Feld** des
   Abteilungs-Eintrags in der `module-registry.json` dieses Kern-Plugins halten (Owner und
   Repo-Name **case-insensitive**, URL-Form egal — SSH wie HTTPS, `.git`-Suffix egal; die
   Identität **nie** aus dem Kleinbuchstaben-Feld `abteilung` interpolieren). **Weicht sie ab
   oder fehlt der Remote: hart abbrechen** — kein Fetch, kein Commit, kein Push, kein PR. Eine
   vertauschte oder kopierte `infra.json` (etwa ein Abteilungs-Pfad, der auf den Kern-Klon
   zeigt) würde den Zyklus-PR sonst gegen ein **fremdes** Remote eröffnen, und ein Push ist
   nicht zurücknehmbar. Danach `git -C <pfad> fetch origin` und den lokalen Stand gegen den
   Remote-Standardbranch stellen
   (`git -C <pfad> rev-list --left-right --count origin/<standardbranch>...HEAD`).
   **Divergiert** — der typische Zustand, nachdem ein Vor-PR gemergt oder gesquasht wurde —
   führt zum **Abbruch**: den Menschen aktualisieren lassen, denn `pull`, `rebase` und `reset`
   sind rote Linien dieses Skills. Ohne diesen Vorlauf reisen die bereits eingereichten Commits
   als scheinbar neue Arbeit ein **zweites Mal** in den Zyklus-PR.
   **`behind > 0` ohne Ahead ist kein Weiterlauf-Freibrief:** In diesem Zustand darf der Skill
   **keinen neuen Commit erzeugen** — sobald in Schritt 5 einer entstünde, wäre aus „nur behind"
   genau die Divergenz geworden, die dieser Schritt selbst als Abbruchgrund führt. Liegt also
   Einzureichendes oder Uncommittetes vor und ist `behind > 0`: **abbrechen** mit dem Befund
   „Standardbranch nachziehen lassen". Abbruch ist die einzige konsistente Variante, weil der
   Skill weder pullen noch rebasen darf. Beide Zählwerte und den Befund im Ergebnis nennen.
4. **Pfad-Prüfung (harte Bedingung):** die berührten Dateien aller dieser Commits erheben
   (`git -C <pfad> diff --name-only <upstream>..HEAD`). Liegt **jede** Datei im SSOT-Ordner
   `knowledge-base/` des Klons (Kategorie-Konvention der `ssot-grundgeruest.md.vorlage` des
   OS-Repos), geht es weiter. **Sonst: abbrechen, die fremden Pfade auflisten, nichts
   umbauen** — kein Splitten, kein Cherry-Pick, kein Zurücksetzen. Der Mensch entscheidet, was
   mit Nicht-SSOT-Arbeit passiert.
5. **Uncommittete SSOT-Änderungen vorlegen:** Liegt Ungesichertes im Working Tree, **zuerst den
   Zählwert aus Schritt 3 prüfen — `behind > 0` ⇒ abbrechen statt committen** (ein neuer Commit
   erzeugte hier die Divergenz). Sonst den geplanten Commit (Dateiliste + Nachricht)
   **vorlegen** und erst nach Zustimmung committen. Die vorgelegten Inhalte durchlaufen bereits
   hier die Musterklassen des Secrets-Preflight (Schritt 7) — ein Treffer stoppt **vor** dem
   Commit. Nichts außerhalb der Wissensbasis (`knowledge-base/` des Abteilungs-Klons) wird
   gestaged.
   **Danach die harte Pfad-Prüfung auf dem neu erzeugten Commit wiederholen**
   (`git -C <pfad> show --name-only --pretty=format: HEAD`): Erscheint dort ein Pfad außerhalb
   der Wissensbasis, **abbrechen** und den Befund auflisten — Schritt 4 konnte diesen Commit
   noch nicht sehen, also ist er hier zum ersten Mal prüfbar.
6. **Queue-Format prüfen (harte Bedingung) — strukturierter Tabellenvergleich, kein
   Zeilen-Diff:** Queue-Datei bestimmen — `queuePfad` aus der `pflege-auspraegung.json` an der
   Wurzel des installierten Abteilungsplugins, aufgelöst gegen den Klon-Pfad (Schema und
   Auflösungsregel: `referenz/pflege-auspraegung.md` dieses Kern-Plugins). Beide Fassungen der
   Tabelle **vollständig** einlesen (`git -C <pfad> show <upstream>:<queuePfad>` als Vorher,
   `git -C <pfad> show HEAD:<queuePfad>` als Nachher) und Zeile für Zeile in ihre fünf Spalten
   zerlegen (Datum · Einzeiler · Verweis · erfülltes Kriterium · Status). Dann prüfen:
   - **Schlüssel** einer Zeile sind die **ersten vier Spalten**; die Status-Spalte bleibt außen
     vor, weil genau sie sich ändern darf.
   - **Multimengen-Vergleich:** je Schlüssel die exakte Anzahl vorher und nachher vergleichen.
     Sinkt eine Anzahl, ist eine Zeile **gelöscht** → Abbruch. Steigt sie, ist es eine neue
     Zeile.
   - **One-to-one-Verbrauch:** jede Vorher-Zeile wird genau **einer** Nachher-Zeile desselben
     Schlüssels zugeordnet, und jede Nachher-Zeile deckt höchstens **eine** Vorher-Zeile. Eine
     bereits verbrauchte Gegenzeile darf keine zweite Löschung decken — an genau dieser Stelle
     rutschen Löschungen bei doppelten oder ähnlichen Zeilen durch.
   - **Einzige erlaubte Transition** ist `offen` → `befördert (PR #n)` bzw.
     `offen` → `abgelehnt (PR #n)`, gesetzt allein von `/nc:queue-kern` nach seinem Abgleich.
     Jede andere Statusänderung — Rückfall auf `offen`, Wechsel zwischen zwei Endstatus,
     geänderte PR-Nummer — ist ein Verstoß.
   - **Neue Zeilen** tragen fünf **nicht-leere** Spalten, ein reales ISO-Kalenderdatum, ein
     Kriterienkürzel, das sich gegen die per `kriterienVerweis` geltende Liste **auflöst**,
     bleiben **einzeilig** (kein Volltext) und entstehen immer mit Status `offen`.
   - **Doppeldeutige Identität** (zwei Zeilen mit gleichem Datum **und** gleichem Einzeiler) ist
     selbst ein Befund und wird gemeldet: `/nc:queue-kern` ordnet seine Marker über genau diese
     Identität zu und kann sie dann nicht mehr eindeutig treffen.

   Bei Verstoß **abbrechen**, die verletzenden Zeilen samt gebrochener Regel benennen und
   **nichts selbst reparieren** — eine Korrektur ist eine neue Zeile des Menschen. Unveränderte
   Queue ist kein Fehler: Befund „keine neuen Queue-Zeilen" und weiter.
7. **Secrets-Preflight — vor Branch, Push und `gh pr create`** (derselbe strukturierte
   Prüfschritt wie in `/nc:queue-kern` Schritt 11): alle Inhalte prüfen, die den Klon
   verlassen — den vollen Diff `<upstream>..HEAD` (einschließlich des in Schritt 5 erzeugten
   Commits), die neuen Queue-Zeilen, Commit-Nachrichten, PR-Titel und -Text. Musterklassen:
   Token- und Schlüsselmuster (`gh[pousr]_`, `sk-`, `AKIA`,
   `-----BEGIN … PRIVATE KEY-----`, lange Hex-/Base64-Ketten), Credential-URLs
   (`https://<nutzer>:<geheimnis>@…`), Kundendaten und absolute Benutzerpfade (`C:\Users\…`,
   `/home/…`, `/Users/…`). **Treffer ⇒ Lauf abbrechen, vor dem Push** — nicht stillschweigend
   filtern, nicht maskieren: Der Fund gehört dem Menschen gemeldet, die betroffene Queue-Zeile
   oder Datei korrigiert er selbst. Eine Prosa-Regel ohne eigenen Prüfschritt hat diesen Fall
   nie erwischt.
8. **Branch heben:** `queue/<YYYY-MM-DD>` (heutiges Datum) im Klon anlegen und die Commits
   dorthin nehmen — vom aktuellen Stand aus, ohne History zu schreiben. Existiert der Branch
   bereits, wird er **nicht** überschrieben: Lage melden und Entscheidung einholen.
9. **Pushen — nur mit Freigabe:** Eine stehende Freigabe für Push und PR-Erstellung (wie im
   Vorbild) hat NovaCore **nicht** — sie ist ein offener Maintainer-Entscheid (`queue-flow.md`
   des OS-Repos, Abschnitt „Offene Punkte"); bis dahin vor diesem Schritt die **ausdrückliche
   Freigabe des Menschen** einholen — sie deckt den Push **und** die PR-Anlage (Schritt 10)
   dieses Laufs ab. Dann `git -C <pfad> push -u origin queue/<YYYY-MM-DD>` —
   normaler Push, nie mit `--force`. Schlägt der Push fehl (kein Zugriff, Remote weiter),
   Fehlertext im Original melden.
10. **Einen Sammel-PR erstellen:** per `gh pr create` gegen den Standardbranch. Titel
    `SSOT-Sammel-PR <YYYY-MM-DD> — <Abteilung>`; Beschreibung enthält die Liste der enthaltenen
    Commits (Kurz-SHA + Betreff) **und** die im Zyklus neu angehängten Queue-Zeilen als
    Einzeiler. Ist `gh` nicht vorhanden oder nicht autorisiert: Branch ist gepusht, PR-Schritt
    sauber als **offen** melden samt der Web-URL, unter der er von Hand entsteht.
11. **Lauf-Marker setzen (schließt den Fälligkeits-Kreis):**
    `node "<hooks-Pfad>/nc-queue-faelligkeit.js" --lauf queue-abteilung` ausführen — derselbe
    Hook, der beim Sitzungsstart erinnert, führt den 14-Tage-Takt in
    `~/.claude/nc/queue-lauf.json`. **Ohne diesen Schritt erinnert er nach einem erfolgreichen
    Lauf weiter**, bis der Nutzer ihn abschaltet. Erst **nach** dem PR-Schritt stempeln: Der
    Marker bezeugt einen gelaufenen Zyklus, nicht einen versuchten. Ist der Lauf in Schritt 3,
    4, 6 oder 7 abgebrochen, wird **nicht** gestempelt. (Bleibt allein der PR-Schritt manuell
    offen, wird gestempelt — die Fälligkeit erinnert über die vor dem Standardbranch stehenden
    Commits ohnehin weiter, bis der Merge da ist; dokumentierte Eigenschaft in `queue-flow.md`
    des OS-Repos.)
12. **Ergebnis ausgeben:** Branch, Commit-Liste, PR-Nummer/URL oder der offene Rest-Schritt —
    plus der ausdrückliche Hinweis, dass der Merge beim Menschen (Rolle: Admin) liegt **und**
    dass nach dem Merge der lokale Standardbranch des Klons vom Menschen zu synchronisieren
    ist, **bevor** der nächste Zyklus-Lauf startet. Genau dieses unterlassene Nachziehen
    erzeugt die Divergenz, die Schritt 3 im nächsten Lauf abbrechen lässt.

## Regeln

- **Nie mergen — und Push/PR nur mit Freigabe.** Merges führt ausschließlich der Mensch aus
  (Rolle: Admin) — auch nicht „weil der PR trivial ist", auch nicht per Auto-Merge-Flag. Für
  Push und PR-Erstellung gilt die rote Linie „keine Pushes ohne ausdrückliche Freigabe"
  unverändert fort, solange der Maintainer-Entscheid zur stehenden Queue-Flow-Freigabe
  aussteht (`queue-flow.md` des OS-Repos, Abschnitt „Offene Punkte").
- **Nie force-pushen, nie History umschreiben** (kein `rebase -i`, kein `reset --hard`, kein
  `commit --amend` auf bereits gepushten Stand).
- **Kein neuer Commit, solange der Klon hinter dem Standardbranch liegt** (`behind > 0`) —
  er erzeugte die Divergenz, die der Skill selbst als Abbruchgrund führt. Synchronisiert wird
  vom Menschen; `pull`, `rebase` und `reset` bleiben rote Linien.
- **Nichts heilen, was nicht SSOT ist.** Fremde Pfade und Queue-Formatverstöße führen zum
  Abbruch mit Befund, nie zu einer Reparatur auf eigene Faust.
- **Die Queue bleibt append-only.** Der Skill hängt selbst nichts an (das leistet
  `/nc:end-session`) und schreibt erst recht keine Altzeile um — er prüft und reicht ein.
- **Nur der eigene Abteilungs-Klon.** Keine Commits im Kern-Repo-Klon, keine fremden
  Abteilungs-Repos. Kollegen-OS-Satelliten (Felix-OS, Biggi-OS) sind NIE Gegenstand dieses
  Skills (I8 — sie hängen an keiner Queue).
- **Kein Netzzugriff ohne geprüfte Remote-Identität** (Schritt 3) — Fetch, Push und PR setzen
  den bestandenen Owner/Repo-Abgleich voraus.
- **Keine Secrets, Tokens oder Kundendaten** in Diff, Queue-Zeilen, Commit-Nachricht oder
  PR-Text; keine personenbezogenen Pfade — geprüft im Preflight (Schritt 7), nicht nur
  behauptet.
- **Ein PR je Lauf.** Wird ein zweiter Lauf am selben Tag nötig, entscheidet der Mensch, ob der
  bestehende PR erweitert wird.

## Verifikation

- `git -C <pfad> remote get-url origin` steht mit der erwarteten Owner/Repo-Identität aus dem
  `repository`-Feld der Registry im Ergebnis — sonst ist der Lauf **vor dem ersten Fetch**
  abgebrochen.
- `git -C <pfad> diff --name-only <upstream>..HEAD` listet ausschließlich Pfade unterhalb der
  Wissensbasis — im Ergebnis vollständig ausgewiesen.
- `git -C <pfad> rev-parse --abbrev-ref HEAD` liefert `queue/<YYYY-MM-DD>`, und
  `git -C <pfad> status --porcelain` zeigt danach **keine `knowledge-base/`-Pfade des
  Abteilungs-Klons mehr**. Die
  Ausgabe darf nicht-leer sein: fremde uncommittete Pfade bleiben ausdrücklich unangetastet
  und werden im Ergebnis namentlich genannt.
- `git -C <pfad> rev-list --left-right --count origin/<standardbranch>...HEAD` belegt, dass
  Schritt 3 lief, weder Divergenz noch — bei anstehendem Commit — `behind > 0` bestand (bzw.
  der Lauf genau daran abgebrochen ist); beide Zählwerte stehen im Ergebnis.
- Der Tabellenvergleich aus Schritt 6 ist ausgewiesen: Zahl der Schlüssel vorher/nachher, Zahl
  neuer Zeilen, Zahl der zugeordneten Statuswechsel — jede Vorher-Zeile genau einmal verbraucht,
  keine Anzahl je Schlüssel gesunken, jede Transition aus `offen` heraus. Verstöße stehen mit
  Zeile und gebrochener Regel im Ergebnis, ebenso doppeldeutige Identitäten.
- Der Secrets-Preflight ist belegt: geprüfte Musterklassen und Ergebnis („kein Treffer" bzw.
  der abgebrochene Befund) stehen im Ergebnis.
- `git -C <pfad> log --oneline origin/queue/<YYYY-MM-DD> -1` belegt den Push.
- Der **Lauf-Marker ist gesetzt**: Die Bestätigungszeile von
  `nc-queue-faelligkeit.js --lauf queue-abteilung` liegt vor, und
  `~/.claude/nc/queue-lauf.json` trägt für `queue-abteilung` das heutige Datum — ohne ihn
  erinnert der Fälligkeits-Check weiter, obwohl der Zyklus-Lauf erledigt ist.
- `gh pr view --json number,url` (bzw. die gemeldete offene Alternative) belegt genau **einen**
  neuen PR; sein Text nennt jeden enthaltenen Commit.
- Der PR ist **offen**, nicht gemergt (`gh pr view --json state` → `OPEN`).
