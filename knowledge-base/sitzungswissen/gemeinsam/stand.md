# Stand (konsolidiert) — 2026-09-05, nach Queue-Triage und Pull

## Aktueller Arbeitsstand

- `main` = `origin/main` = b4406f0. Kern `nc` 0.15.1, `nc-development` 0.3.0. Gemergt seit dem
  Stand vom 2026-08-26: Phase J (PR #31), Waypoint 0.15.1 (PR #32), Marketplace-Beschreibungen
  unter 500 Zeichen (PR #33). Keine offenen PRs, keine offenen Issues im OS-Repo.
- Working Tree sauber bis auf das Sitzungswissen dieser Sitzung (Journal, Stand, Roll-up,
  Register, Debug-Log) — uncommittet, braucht Branch + PR.
- Vier lokale Queue-Zeilen vom 2026-09-04 (Stiftung-OS-Kontext) wurden geprüft und verworfen;
  Details im Journal 2026-09-05.

## Offene Punkte

- **Norm-Verlust §1a/§3b** in `abteilungs-plugin-bau.md` seit 626d0c6 (OAI-Umstellung); Verweise
  leben weiter in AGENTS/README/SSOT-Index/VORLAGE und in ausgelieferten Payloads
  (`nc-teamsync.md`, `pfad-aenderungsindex.json`, `wissen-sucheindex.json`, `wissen-aendern`).
  Maintainer-Frage: Absicht oder Verlust? Danach Verweise bereinigen oder Norm zurückholen;
  Payload-Anteil → Kern-Bump am Release-Zug.
- **Vorlage-/Ideen-Lebenszyklus-Drift:** `ssot-grundgeruest.md.vorlage` (grundwissen statt
  aktive-bauplaene, kein sitzungswissen) und „Idee bleibt stehen" (AGENTS Z. 88, Index Z. 71)
  gegen SSOT-Leitplanke 1.
- **Normlücke Kriterienliste:** Vorrang GF3 gegen GL5(i) Fall 3 bei eigenem Fehler in
  Kollegen-OS-Arbeit ist in 5.5.3 nicht geregelt — Maintainer-Entscheid, Kriterien-Pflege.
- **Stiftung-OS-Übergangs-PR** ans OS-Repo (Bauplan 2026-09-02 §4a Punkte 1–7) noch nicht
  gestellt — trägt beide Drift-Befunde oben.
- **Lesekopie** `~/.nc/ssot` auf 405ab4e (drei Merges zurück) → `/nc:setup`.
- **Journal 2026-08-26 ohne Roll-up-Zeile** → `/nc:end-session nachzug` durch den Menschen.
- Weiter offen aus dem Register: Phase-K-Restliste, Reserve-Tag-Reste auf origin, LICENSE,
  E5 `firmenwissen-suche`, `firmenkernprozesse/`-Entscheid, `referenz/`-Approval, Deploy-Hälfte
  Safety-Gate. Der Register-Altbestand ist gegen den Merge-Stand nicht neu geprüft.

## Zuletzt getroffene Entscheidungen

- 2026-09-05: GF3-Zeilen aus Kollegen-OS-Arbeit gehören nicht in die OS-Queue (GL5(i) Fall 3);
  Befunde am OS-Repo gehen als Doku-Bugs in `debug-log.md` + Register, nicht in die Queue.
- 2026-09-04 (Maintainer, PR #33): Marketplace-Beschreibungen kürzen statt umlagern; Grenze als
  Mechanik-Fakt in `abteilungs-plugin-bau.md` §2 Punkt 8.

## Aktive Branches und offene Pull Requests

- Keine offenen PRs. Lokal nur `main`. Auf origin steht der gemergte Branch
  `fix/marketplace-beschreibungen-500` noch (Löschung = Maintainer).

## Bekannte Risiken

- Ausgelieferte Payloads zeigen auf Abschnitte, die es nicht mehr gibt (§1a/§3b) — teamweit
  sichtbare Doku-Lücke, bis der Maintainer-Entscheid fällt.

## Nächster Schritt

Sitzungswissen dieser Sitzung per Branch `docs/sitzungswissen-2026-09-05` + PR einbringen
(Freigabe des Sitzungsführers, Merge beim Maintainer). Dann Maintainer zu 626d0c6 fragen und
`/nc:setup` für die Lesekopie ausführen.
