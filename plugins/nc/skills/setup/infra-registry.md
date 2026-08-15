# Referenz: Infra-Registry und Ist-Checkliste S0–S6 (zu `/nc:setup`)

> Vorbild: `infra-registry.md` des Onsite-OS (`/oai:init`), auf die NovaCore-Topologie
> gemappt (Bauplan 2026-08-15, AP-A1). Zentrale Abweichung: NovaCore führt **keine
> Arbeitsklone in einem Wurzelordner** — die Wissensbasis kommt als **Lesekopie** unter
> `~/.nc/ssot/<repo-name>/` (Weg B der SSOT-Provisionierung, Bestandsentscheid); die
> interne Abteilung `nc-development` lebt im Kern-Repo, und die Kollegen-OS-Satelliten
> (Felix, Biggi) sind eigenständig und werden hier weder provisioniert noch gelesen.

## Infra-Registry

**Ort:** `~/.claude/nc/infra.json` — maschinenlokal, bewusst **außerhalb** des
Plugin-Cache (der wird bei jedem Auto-Update ersetzt) und ohne `CLAUDE_PLUGIN_DATA`-Bezug
(zwischen Prozessen inkonsistent, Onsite-Lesson Kern 0.11.1). Bei Windows+WSL-Doppelumgebung
führt **jede Umgebung ihre eigene Registry**.

**Felder (Schema v1):**

```json
{
  "schemaVersion": 1,
  "abteilungen": ["development"],
  "szenario": "windows",
  "ssotAblage": "C:\\Users\\<nutzer>\\.nc\\ssot",
  "kernSsotPfad": "C:\\Users\\<nutzer>\\.nc\\ssot\\NovaCoreAI-OS",
  "zuletztGeprueft": { "S0": "2026-08-15", "S2": "2026-08-15" }
}
```

- **Pfadfelder sind absolute, plattformnative Pfade — keine Tilde, keine
  Umgebungsvariablen.** Die Leser der Registry sind nicht immer die Shell, die sie
  schrieb (Windows, WSL und MSYS lösen `~` unterschiedlich auf). Dem Nutzer wird die
  Ablage weiterhin als `~/.nc/ssot/` kommuniziert; **geschrieben** wird der aufgelöste
  Pfad.
- `abteilungen` listet die installierten **internen** Abteilungsplugins (heute:
  `development`); Kollegen-OS-Satelliten erscheinen hier **nie** (Isolations-Invariante —
  sie haben eine eigene zweidimensionale SSOT und hängen an keiner Kern-Mechanik).
- `zuletztGeprueft` ist ein **reines Diagnose-Feld** (Datum je Schicht, `YYYY-MM-DD`) —
  nie Beleg-Ersatz. Grundregel: **die Platte ist die Wahrheit**; ein Registry-Pfad ohne
  echten Bestand dahinter gilt als „fehlt".
- Liest ein Kern-Skill eine **höhere `schemaVersion`** als die ihm bekannte, arbeitet er
  nicht einfach weiter, sondern meldet „Registry neuer als der installierte Kern" — nie
  stillschweigend überschreiben.
- **Leser:** `start` (Kontextaufbau, tolerant bei Fehlen: Hinweis auf `/nc:setup`) und
  `update-doks` (F2-Konsistenzlauf). `journal` und `end-session` schreiben in die von
  `/nc:start` bestimmte Ablage und hängen nur **indirekt** an ihr.
- **Schreiber:** allein `/nc:setup` (einmal je Lauf, als letzter Schreibschritt). Vor dem
  Schreiben die Datei **erneut lesen** und fremde/unbekannte Felder unverändert
  übernehmen — parallele Sitzungen sind real, verworfene Felder wären stiller
  Datenverlust.

## Klon- und Auth-Weg (S2)

- Das Kern-Repo ist **öffentlich** — der Klon (`ssot-provision.js`) braucht keine Auth.
- Sobald eine Registry-Quelle **privat** ist (künftige interne Abteilung mit eigenem
  Repo): Primärweg `gh repo clone` (fragt nie interaktiv); `git clone` (HTTPS) nur bei
  konfiguriertem Credential-Helper (`git config --get credential.helper` liefert einen
  Wert) — sonst liefe der Klon in einen interaktiven Credential-Prompt (Abbruchregel der
  SKILL.md). Windows und WSL sind getrennte Credential-Welten.
- Keine Token- oder Credential-Werte in Ausgaben, Bericht oder Registry.

## Ist-Checkliste S0–S6 (Prüfbefehle je Schicht)

| Schicht | Soll | Prüfung (nur lesend) |
|---|---|---|
| **S0** Voraussetzungen | git · Node ≥ 20 · Claude Code ≥ 2.1.193 · (`gh` empfohlen) · Erreichbarkeit des Kern-Repos | `git --version` · `node --version` · `claude --version` (unter MSYS/Git-Bash ggf. `claude.exe`) · `git ls-remote https://github.com/NovaCore-AI/NovaCoreAI-OS` (öffentlich — kein Auth-Beleg nötig) |
| **S1** Plugin-Ebene | Kern `nc` + erwartete interne Abteilungsplugins installiert | `claude plugin list` — alle Plugins mit Präfix `nc` erfassen; schlägt der Befehl fehl: Plugin-Cache `~/.claude/plugins/cache` lesen (`plugin.json` je Plugin). Bei SSH-/Auth-Fehlern des Marketplace-Bezugs privater Satelliten: `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` (belegte Falle; `abteilungs-plugin-bau.md` §3a des OS-Repos) |
| **S2** SSOT-Lesekopie | Kern-Wissensbasis (und Wissen registrierter Abteilungen) als voller Klon unter `~/.nc/ssot/` | `ssot-provision.js --json` (idempotent; Zustand je Quelle `angelegt`/`aktualisiert`/`lokal-veraendert`/`fehler`); Stichprobe `git -C <pfad> remote get-url origin`; Sparse-Relikt-Check: Repo-Inhalt außerhalb des Wissenspfads vorhanden? |
| **S3** Verknüpfung | Registry vorhanden, Schema aktuell, Pfade real (absolut, keine Tilde) | Datei lesen, `schemaVersion` prüfen (höher als bekannt → melden, nie stillschweigend überschreiben), jeden Pfad gegen S2 re-checken |
| **S4** Sitzungswissen-Gerüst | im aktuellen Arbeits-Repo `.nc/erinnerung/` mit **allen vier** Bausteinen: `stand.md` · `journal/` · `offene-straenge-register.md` · `roll-up.md` (+ `.gitignore`-Eintrag `.nc/`) | Existenz-Check je Baustein; `.gitignore` auf `.nc/`-Eintrag prüfen (fehlend → Hinweis, keine eigenmächtige Änderung); außerhalb eines Arbeits-Repos: **nicht anwendbar** |
| **S5** CLAUDE-Lokaldokumente | Firmen-Block in `~/.claude/CLAUDE.md` (Ebene 1, Marker intakt, Import-Zeile vorhanden) + Team-Sync-Datei `nc-teamsync.md` im **Home**-Ordner `~/.claude/` (Ebene 1b, Ganzdatei ohne Marker) — beide maschinenweit, **nicht** im projektlokalen `.claude/` | in `~/.claude/CLAUDE.md` das `NC:BLOCK:START/ENDE`-Paar + den `NC:BLOCK:VERSION`-Stempel **und** die Import-Zeile `@~/.claude/nc-teamsync.md` nachweisen; in `~/.claude/nc-teamsync.md` den Stempel `NC:TEAMSYNC:VERSION` in der **ersten Zeile**; frisch installiertes Plugin → Zwischenzustand „Sync fällig beim nächsten Session-Start" ist grün |
| **S6** Verifikation | alles grün bzw. sauber „nicht anwendbar", Bericht mit Belegen | Abschlussbericht + `/nc:os-info` |

## Grenzfälle

- **Verschobene Lesekopie:** Registry-Pfad tot, aber Klon am Konventionspfad
  `~/.nc/ssot/<repo-name>/` gefunden → Registry reparieren, **nicht** neu klonen
  (Duplikat-Klone mit divergierendem Stand sind der teuerste Folgefehler).
- **Abbruch mitten im Lauf:** folgenlos — der nächste Lauf erhebt den Ist-Zustand neu;
  kein Schritt hinterlässt halbe Zustände, die ein Folgeschritt stillschweigend braucht.
- **Registry nennt eine Abteilung, deren Plugin fehlt (oder umgekehrt):** melden und
  fragen statt überschreiben — Plugin-Installation ist Marketplace-Sache, nicht die
  dieses Skills.
