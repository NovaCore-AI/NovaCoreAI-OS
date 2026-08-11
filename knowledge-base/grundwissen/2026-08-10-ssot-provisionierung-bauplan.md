# Bauplan 2026-08-10 — SSOT-Provisionierung (`/nc:setup` + Frischeprüfung in `/nc:start`)

> **Status:** beschlossen (Maintainer-Auftrag Lucas Vöhringer, 2026-08-10, im Anschluss an
> PR #10). Umsetzung Claude Opus 5. Grundlage für Branch `feat/ssot-provisionierung`
> (gestapelt auf `feat/onsite-align-umbau`).

## 1. Anlass — der Router zeigt ins Leere

Das Kern-Plugin liefert Hooks, Skills, `nc-sync.md`, `referenz/`, `wp-rahmen.md`,
`module-registry.json` und `doks/` aus. Die **Wissensbasis liegt auf Repo-Ebene, außerhalb
des Plugin-Verzeichnisses** — sie reist also **nicht** mit.

Mit PR #10 schreibt der Doks-Autosync in die globale `CLAUDE.md` **jedes** Teammitglieds:

> Die verbindliche Wissensbasis liegt im OS-Repo `NovaCore-AI/NovaCoreAI-OS`; Einstieg ist
> dort der Master-Index `knowledge-base/SSOT-Document-Index.md`. Vor Vermutungen dort
> triagieren.

Wer keinen Checkout hat, bekommt damit eine **Pflichtanweisung auf etwas, das bei ihm nicht
existiert**. Vorher war das eine latente Lücke; mit dem Rollout wird es eine aktiv
irreführende Anweisung — genau das, was der Aktualisierungs-Index verbietet. Das Vorbild
kennt dieselbe Lücke und nennt den fehlenden Setup-Skill in seinem Folgeplan einen
**Rollout-Blocker**.

## 2. Verifizierte Ausgangslage (2026-08-10)

| Artefakt | Kommt beim Nutzer an? | Beleg |
|---|---|---|
| Kern-Plugin (Hooks, 6 Skills, `nc-sync.md`, `referenz/`, `wp-rahmen.md`, Registry, `doks/`) | **ja**, über den Marketplace-Cache | `find plugins/nc -type f` |
| Kern-**Wissensbasis** (`knowledge-base/`, 12 Dateien, 176 KB) | **nein** — liegt außerhalb von `plugins/nc/` | dito |
| `nc-development` | ja — liegt **im Kern-Repo**, kein eigenes Repo | Registry: kein `repository`-Feld |
| Satelliten `nc-felix`, `nc-biggi` | **ja, vollständig** — das Repo **ist** das Plugin (`AGENTS.md`, `referenz/`, `*-sync.md`, `wp-rahmen.md` liegen im Plugin-Paket), Aktualisierung über den Marketplace-Pin | `gh api repos/NovaCore-AI/{Felix,Biggi}-OS/contents` — **keine** `knowledge-base/` |

**Konsequenz:** Real fehlt heute **genau ein** Artefakt — die `knowledge-base/` des
Kern-Repos. Der Mechanismus wird trotzdem **registry-getrieben** gebaut (Maintainer-Vorgabe
„Kern und jeweilige installierte Abteilung"), damit eine künftige Abteilung mit eigenem
Wissen außerhalb ihres Plugins **ohne Codeänderung** mitversorgt wird.

## 3. Entscheidungen

1. **Weg B** (Setup-Skill mit lokalem Klon), nicht Weg A (Wissensbasis ins Plugin
   ausliefern) — Maintainer-Entscheid 2026-08-10.
2. **Ablageort:** `<home>/.nc/ssot/<repo-name>/` (über `os.homedir()`, nie ein
   personenbezogener Pfad im Code). Ein Zeiger `<home>/.nc/ssot/index.json` hält je Quelle
   Pfad, Commit und Zeitpunkt fest, damit Skills die Kopie **finden**, statt sie zu suchen.
3. **Sparse:** `git clone --filter=blob:none --sparse` + `sparse-checkout set <pfad>` — es
   wird nur die Wissensbasis materialisiert, nicht das ganze Repo.
4. **Quellenauflösung:**
   - **Kern:** Repo-URL aus dem **ausgelieferten** `plugin.json` (Feld `repository`) — die
     einzige Stelle, die im installierten Plugin verfügbar ist. Wissenspfad:
     `knowledge-base`.
   - **Abteilungen:** aus `module-registry.json`; provisioniert wird eine Abteilung nur,
     wenn sie **beides** führt: `repository` **und** das neue optionale Feld
     `repoKnowledgePath`. Heute setzt das keine — die Satelliten brauchen es nicht, weil ihr
     Repo das Plugin ist. Das Feld ist der dokumentierte Andockpunkt.
5. **Aktualisierung:** idempotent. Existiert der Klon, wird **`git pull --ff-only`**
   gefahren — nie ein Merge, nie ein Rebase, nie ein Reset. Eine lokal veränderte Kopie
   wird nicht überschrieben, sondern gemeldet.
6. **`/nc:start` wird NICHT verändert** (Maintainer-Weisung 2026-08-10, ausdrücklich).
   Die Verbindung zwischen den beiden Skills ist eine **Abhängigkeit, kein Eingriff**:
   `/nc:start` *braucht* die lokale Wissensbasis, `/nc:setup` *liefert* sie. Der Start-Skill
   wurde gelesen, um den Setup-Skill passend zuzuschneiden — mehr nicht. Ob und wie eine
   automatische Frischeprüfung später angebunden wird, ist eine eigene Entscheidung des
   Maintainers und **nicht Teil dieses Bauplans**. Solange sie nicht beauftragt ist, gibt es
   auch keine Vorbereitung dafür im Code — kein Prüf-Modus, kein Frische-Fenster. Der Skill
   wird von Hand aufgerufen, sonst von niemandem.
7. **Auth-Realität:** Das OS-Repo ist privat. Fehlt git oder die Berechtigung, **scheitert
   der Skill sichtbar mit einer handlungsfähigen Meldung** — nie still. Das ist die
   dokumentierte Grenze von Weg B (und der Grund, warum Weg A für nicht-technische
   Kolleginnen und Kollegen die robustere Alternative bleibt; siehe §6).

## 4. Arbeitspakete

- **AP1** `plugins/nc/skills/setup/ssot-provision.js` — deterministisches Skript,
  **ein Modus, ein Aufruf** (`[--json]`): Quellen auflösen, klonen bzw. per Fast-Forward
  nachziehen, Zeiger schreiben. Idempotent. **Bewusst ohne `--check`-Modus und ohne
  Frische-Fenster** (Vereinfachung auf Maintainer-Weisung 2026-08-10): beides existierte nur
  für die gestrichene automatische Start-Anbindung und wäre ohne sie Ballast — ein Skill,
  ein Schritt.
- **AP2** `plugins/nc/skills/setup/SKILL.md` — `/nc:setup`
  (Zweck/Ablauf/Regeln/Verifikation).
- **AP3** ~~`/nc:start` um einen Frischeschritt erweitern~~ — **gestrichen**
  (Maintainer-Weisung 2026-08-10). Der Start-Skill bleibt unangetastet; siehe §3.6.
- **AP4** Tests `plugins/nc/tests/nc-ssot-provision.test.mjs` — gegen ein **lokales
  `file://`-Origin-Repo**, damit die Suite ohne Netz und ohne Auth läuft.
- **AP5** Doku: Registry (`repoKnowledgePath` dokumentieren + Kern-Modulliste), README
  (Skill-Tabelle), ONBOARDING (Ersteinrichtung: `/nc:setup` als Schritt), SSOT-Index,
  CHANGELOG. **Kein** zweiter Version-Bump: 0.6.0 ist unveröffentlicht, mehrere Änderungen
  dürfen sie gemeinsam nutzen (Aktualisierungs-Index §3.3).

## 5. Rote Linien

Kein Commit/Push/PR/Merge ohne Freigabe. Der Skill klont **ausschließlich** nach
`<home>/.nc/ssot/` und fasst weder das Arbeits-Repo noch die globale `CLAUDE.md` an. Kein
`pull` mit Merge/Rebase/Reset — nur Fast-Forward.

## 6. Bekannte Grenze (bewusst)

Weg B setzt git **und** Zugriff auf das private Repo voraus. Für Nutzerinnen und Nutzer der
Desktop-App ohne git-Einrichtung bleibt die Wissensbasis damit unerreichbar; der Skill sagt
das dann klar, statt es zu verschleiern. Falls sich das in der Praxis als Hürde erweist, ist
Weg A (Wissensbasis ins Plugin-Paket) die Nachiteration — die beiden schließen einander
nicht aus.

## 7. Nachtrag N1 (2026-08-11, nach dem Livetest — PR #13)

Der Livetest der Erstfassung scheiterte an zwei Fehlern; beide Entscheidungen aus §3 werden
hiermit **revidiert** (Spec-Nachtrag statt stiller Abweichung):

1. **§3.2 revidiert — der Zeiger allein „verlinkt" nicht.** `index.json` wurde geschrieben,
   aber **von niemandem gelesen** (per `grep` über `plugins/` verifiziert), und alle
   SSOT-Verweise sind relative Pfade, die im Klon unter `~/.nc/ssot/` nicht auflösen. Die
   Verlinkung ist jetzt der **feste Pfad plus Firmen-Block**: der Klon liegt deterministisch
   unter `~/.nc/ssot/<repo-name>/`, und `doks/global-claude-firmenblock.md` — das einzige
   Artefakt, das ausgeliefert **und** in jeder Session gelesen wird — nennt genau diesen
   Pfad als Einstieg. Der Zeiger bleibt als Bestandsaufnahme, ist aber nicht mehr der
   beschriebene Findemechanismus. `/nc:start` bleibt unangetastet (§3.6 steht weiter).
2. **§3.3 revidiert — voller Klon statt Sparse.** Gemessen: `knowledge-base` 184K,
   `plugins` 425K, `docs` 20K. Der Ausschnitt schnitt `plugins/` weg — genau das, worauf
   `doku-sync` mit `referenz/skill-authoring.md` verweist — und sparte dafür 445 KB.
   Funktionsverlust für nichts. Jetzt `git clone` ohne `--filter`/`--sparse`; der
   Regressionstest verlangt, dass Repo-Inhalt außerhalb der Wissensbasis mit ankommt.

## 8. Nachtrag N2 (2026-08-11, Feldbefund nach dem Vollklon-Fix)

Feldbefund: Ein Teammitglied hatte `/nc:setup` mit der Erstfassung (PR #12) ausgeführt und
behielt dauerhaft einen Sparse-Klon unter `~/.nc/ssot/<repo-name>/` — nur `knowledge-base/`
plus Wurzeldateien. Drei Punkte werden nachgezogen:

1. **N1.2 ergänzt — der Vollklon-Fix heilt Bestandskopien jetzt mit.** PR #13 stellte nur
   den **Erstlauf** um; bei vorhandenem Klon lief nur `pull --ff-only`, `core.sparseCheckout`
   blieb stehen, und das Skript meldete trotzdem „aktualisiert" — ein stiller Falscherfolg,
   weil der Wissenspfad-Check im Sparse-Ausschnitt besteht. Jetzt: steht
   `core.sparseCheckout` auf `true`, läuft vor dem Pull `git sparse-checkout disable`
   (offizielle git-Doku, abgerufen 2026-08-11: deaktiviert den Schalter und stellt den
   vollen Working Tree wieder her); das Ergebnis trägt eine explizite Migrations-Meldung.
   Der Regressionstest stellt das Relikt exakt so nach, wie die Erstfassung es anlegte
   (Suite 90 → 91).
2. **§4/AP5 revidiert — Patch-Bump 0.6.0 → 0.6.1.** „Kein zweiter Bump, 0.6.0 ist
   unveröffentlicht" gilt nicht mehr: Die Erstfassung ist nachweislich im Feld installiert
   (der Feldbefund setzt sie voraus), und ohne Bump erreicht weder der Vollklon-Fix noch
   die Migration ein installiertes Plugin — kein Bump = kein Auto-Update. 0.6.0 wurde nie
   getaggt; der Tag-/Release-Schnitt liegt damit erst bei 0.6.1.
3. **WSL braucht keine eigene Spezifikation** (Maintainer-Frage 2026-08-11). Skript und
   Pfade sind plattformneutral (`os.homedir()`, tilde-relativer Pfad im Firmen-Block), die
   CI testet Ubuntu. Festgehalten wird nur die Betriebsregel als ONBOARDING-Hinweis:
   **WSL zählt als eigener Rechner** — eigenes Home, eigene Credentials, eigenes
   `~/.claude`; Installation und `/nc:setup` laufen dort einmal separat, `NC_SSOT_DIR`
   nie auf `/mnt/c/…`.

---
*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer.*
*Nachtrag N1: 2026-08-11, Livetest-Befunde durch das NovaCore-Team, Doku-Nachzug Kimi Code.*
*Nachtrag N2: 2026-08-11, Feldbefund durch das NovaCore-Team, Fix und Doku Claude (Fable 5).*
