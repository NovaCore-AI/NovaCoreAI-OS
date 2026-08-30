# Contributing-Flow — Standardprozess

> **Verbindlich**, sobald am Onsite.ai-OS mitgewirkt wird — am Kern-Plugin im OS-Repo oder an
> einem Abteilungs-Satelliten, als Mensch oder als beauftragter Agent: Jeder Beitrag läuft als
> **Strang** (Worktree/Branch → PR → Review → Merge) und endet an der Übergabe an den
> Release-Zug. Der Begriff „Strang" und die tragenden Prinzipien stehen in
> [`project-meta-infos/Onsite.ai-OS-Strang-Definition.md`](<../project-meta-infos/Onsite.ai-OS-Strang-Definition.md>).
> **Abgrenzung:** der Aufstieg von *Wissen* aus Sitzungen ist der Queue-Flow
> ([`queue-flow.md`](<queue-flow.md>)) — hier geht es um den *Arbeits*-Beitrag am Produkt; das
> Release-Runbook selbst steht im [`Aktualisierungs-Index`](<Aktualisierungs-Index.md>) §3.6;
> **was** inhaltlich gebaut wird, regeln `kern-plugin-bau.md` bzw. `abteilungs-plugin-bau.md`
> — dieser Prozess regelt den Weg, nicht das Was; die Jira-Board-Pflege regelt
> [`jira-workflow.md`](<jira-workflow.md>).
> **Kette:** Jira-Ticket gezogen (Status „In Arbeit") oder Maintainer-Auftrag → **dieser
> Prozess** (Stationen S1–S7) → S6: Review + Merge durch den Systemarchitekten
> (Lucas Vöhringer) → S7: Release-Zug auf sein Kommando
> (`Aktualisierungs-Index` §3.6) übernimmt Version, CHANGELOG und Tag

## 1. Anlass — wann dieser Prozess greift

| Fall | Weg |
|---|---|
| Ein Beitrag an Kern oder Satellit steht an (Ticket, Auftrag, Bug, Doku) | **dieser Prozess** |
| Mehrere Beiträge parallel (Multi-Agent-/Loop-Betrieb, Nachtschicht) | **dieser Prozess** — je Strang ein eigener Worktree und Branch (S2) |
| Sitzungsergebnisse sollen als Wissen in die SSOT aufsteigen | **nicht hier** → `queue-flow.md` |
| Ein Release soll geschnitten werden | **nicht hier** → `Aktualisierungs-Index` §3.6 (Release-Zug, Maintainer-Kommando) |
| Ein neues Plugin oder eine Abteilung soll gebaut werden | Weg nach **diesem Prozess**, Inhalt aus `abteilungs-plugin-bau.md` / `kern-plugin-bau.md` |
| Eine einmalige Aufgabe mit Anleitung, keine wiederkehrende Änderungsart | **nicht hier** → Bauplan nach `Aktive Baupläne/` (`standardprozess-authoring.md` §1) |

## 2. Der Flow auf einen Blick

```
Jira-Ticket „In Arbeit" / Maintainer-Auftrag
  └─ S1 Vorlauf          Pflicht-Einstieg, Standardprozess-Check, Worktree-Lage      [Agent]
       └─ S2 Strang anlegen   .worktrees/<branch>, Branch <typ>/<thema>, Anker        [Agent]
            └─ S3 Bauen       versionslos, ein Paket = ein Commit, Matrix je Edit     [Agent]
                 └─ S4 Abschluss   Checkliste: Suite, validate, Grep, PR-Memo         [Agent]
                      └─ S5 Einreichen   Push + PR + Bericht, Jira → Internal Review  [Agent, Freigabe]
                           └─ S6 Review + Merge  Konversationen lösen, aufräumen     [Systemarchitekt]
                                └─ S7 Übergabe an den Release-Zug                     [Systemarchitekt / Release-Zug]
```

**Die eine Regel, die der Flow trägt:** Agenten bereiten bis zum fertigen PR vor, Menschen
entscheiden (wie der Queue-Flow, Spec §15.36.6). Versionen vergibt ausschließlich der
Release-Zug — ein Strang ist immer versionslos.

## 3. Stationen, Verantwortliche, Prüfpunkte

| # | Station | Wer | Was geprüft wird (QS) |
|---|---|---|---|
| S1 | **Vorlauf** | Agent (Mensch liest mit) | Pflicht-Einstieg nach `CLAUDE.md` vollständig (git log/status, CHANGELOG/VERSION, SSOT-Index-Triage); Standardprozess-Check gegen den `Aktualisierungs-Index` (§1/§2 — Pflichtlektüre je Änderungsart); **fremde Worktrees prüfen** (`git worktree list`, je Baum `git status` — Matrix-Zeile 8); Jira: Ticket dem Epic zuordnen, auf „In Arbeit" ziehen |
| S2 | **Strang anlegen** | Agent | `git worktree add .worktrees/<branch> -b <branch>` (Worktree-Pflicht, nie im Main-Checkout schreiben); Branch-Schema **`<typ>/<thema>`** mit `typ` ∈ `feat`/`fix`/`docs`/`chore`/`update` (historische Bestands-Branches anderer Namen bleiben unbenannt); **Basis bewusst wählen** — steht ein anderer PR kurz vor dem Merge, auf dessen Kopf aufsetzen statt auf `main`. **Reserviert wird nichts** — Anker und Tags gehören allein zum Release-Zug (Maintainer-Entscheid 2026-08-25); Namenskollisionen fängt der Merge-Konflikt, doppelte Spec-Nummern die Suite-Invariante |
| S3 | **Bauen** | Agent / Mensch | **versionslos**: kein Version-Bump, kein CHANGELOG-Eintrag, kein Tag — Wissensträger des Strangs ist das PR-Ergebnismemo (S4); Bauplan nach `Aktive Baupläne/` (Ausnahme nur auf ausdrückliches Maintainer-GO, dann Bericht im PR-Memo); je Schreibaktion die passende Zeile der Änderungs-Matrix; **ein Paket = ein Commit** mit **expliziter Dateiliste** (bei Parallelarbeit ist `git add -A` verboten — Fehlerprotokoll 2026-08-22); Scratchpad ist nie final (`scratchpad-nutzung.md`) |
| S4 | **Abschluss** | Agent | Abschluss-Checkliste der `CLAUDE.md` vollständig: Testsuite **wortgleich** (`node --test plugins/oai/tests/*.test.mjs`), Validierung **beider** Ebenen (`claude plugin validate .` + je berührtem Plugin `--strict`), toter-Pfad-Grep über das ganze Repo, Doku-Nachzug je Matrix, Fehlerprotokoll-Einträge; **signiertes PR-Ergebnismemo** (was/why/Entscheide/Verifikation, Produktanteil gekennzeichnet) |
| S5 | **Einreichen** | Agent — **Freigabe nötig** | Push + PR gegen den Standardbranch des Ziel-Repos; Bericht als PR-Kommentar: erledigt je Paket · bewusst nicht gemacht + Grund · offene Fragen · Verifikationsbelege; Jira-Transition auf „Internal Review", sobald der PR steht (Transition nur, soweit im Auftrag zugestanden); nie mergen, nie force-pushen |
| S6 | **Review + Merge** | **Systemarchitekt (Lucas Vöhringer)** — bewusst kein Agent | Review-Konversationen führen und lösen (CI läuft mit); nach jedem aufgelösten Merge-Konflikt ist `grep -rn "^<<<<<<<" .` **leer, bevor committet wird** — als eigenes Kettenglied, nicht als Nebeninformation (Fehlerprotokoll 2026-08-22); **unmittelbar nach dem Merge**: Branch (lokal + Remote) und Worktree aufräumen |
| S7 | **Übergabe an den Release-Zug** | **Release-Zug auf Kommando des Systemarchitekten (Lucas Vöhringer)** | Kein Versions-Chore je PR — der Zug bündelt die Produktanteile aller gemergten PRs des Batches zu **einer** Version je Plugin (Wochen-Takt; der CI-Detektor meldt „Release-Zug fällig", blockt nie); Satelliten: Release im Satelliten-Repo + SHA-Umpinnen des Marketplace-Eintrags im Kern **als Zug-Schritt** (`abteilungs-plugin-bau.md` §3a) |

## 4. Ergebnis/Output

Nach einem vollständigen Durchlauf existieren (Fremdprüfbar ohne den Durchlauf gesehen zu haben):

1. **Ein PR** am Ziel-Repo mit signiertem PR-Ergebnismemo und Berichtskommentar — oder deren
   Merge-Spur auf dem Standardbranch.
2. **Jira-Ticket auf „Internal Review"** (danach: „Operative Refining"/„Official Release"
   nach `jira-workflow.md`) — Status entspricht der PR-Realität.
3. **Aufgeräumte Lage:** `git worktree list` zeigt keinen Strang-Rest, Lokal- und
   Remote-Branch des Strangs sind gelöscht.
4. **Register-Zeile nur bei Resten:** bleibt etwas offen (Folgeauftrag, vertagter Punkt),
   trägt es das Offene-Stränge-Register (`sitzungswissen/offene-straenge-register.md`); ein
   vollständig gemergter Strang ohne Reste braucht
   keine Zeile (das PR-Memo ist der Beleg).
5. **Keine** Versions-/CHANGELOG-Änderung im Strang-Diff (Gegenprobe §6) — Version, CHANGELOG
   und Tag entstehen ausschließlich am Release-Zug.

## 5. Regeln / rote Linien

- **Strang-Verbote (aus dem `Aktualisierungs-Index` §5, hier gebündelt):** kein Version-Bump ·
  kein CHANGELOG-Eintrag · kein Tag/Release · kein Merge · kein Force-Push · keine
  destruktiven Git-Operationen — alles nur mit ausdrücklicher Maintainer-Freigabe; die
  Merge-Freigabe deckt Tag und Release desselben Zuges mit ab (Entscheid 2026-08-10).
- **Ein Schreibweg je Repo, nie direkt auf `main`** — auch kleine Fixes laufen als Strang.
- **Gebaut gilt erst nach Push** (Lehre 2026-08-17): ungepushte Artefakte sind Workspace,
  kein Ergebnis; verloren gegangene lokale Stände sind rekonstruierbar, aber teuer.
- **Fremde Team-Repos (z. B. `offsite`) werden nie direkt geändert** — Finding + Patch
  außerhalb, dann deren Ticket-Prozess (GF1).
- **Kein Konflikt-Marker-Commit:** nach Konflikt-Auflösung greift der Marker-Grep aus S6 als
  hartes Kettenglied — die Merge-Ausgabe „resolved" ist kein Beleg.
- Alles Kundensichtbare (MR-Texte, Jira-Kommentare) bleibt rote Linie — der Berichtskommentar
  im eigenen PR ist zugestanden, fremde Kanäle nicht.

## 6. Verifikation / Abnahme

- [ ] `node --test plugins/oai/tests/*.test.mjs` grün (wortgleiches Kommando, Glob statt
      Verzeichnis) — im OS-Repo; Satelliten fahren ihre eigene Suite
- [ ] `claude plugin validate .` **und** je berührtem Plugin `validate plugins/<name> --strict`
      gelaufen (nur OS-Repo)
- [ ] `git diff <basis>..HEAD` enthält keine Version-Datei, keinen CHANGELOG-Eintrag, keinen
      Tag (Gegenprobe zu §4 Nr. 5)
- [ ] Toter-Pfad-Grep über alte Pfade/Namen leer; jede neue Wissensdatei hat ihre Index-Zeile
      (Suite erzwingt es)
- [ ] PR-Ergebnismemo signiert, Produktanteil gekennzeichnet; Berichtskommentar steht
- [ ] Jira-Status = PR-Realität; `git worktree list` ohne Strang-Rest (nach Merge)
- [ ] Selbsttest: *Könnte ein Kollege morgen allein aus PR, Memo und Jira-Ticket erkennen,
      was gebaut, was bewusst ausgelassen und wo der Stand abgegeben wurde?*

## 7. Verhältnis zu anderen Prozessen

- **Wissen vs. Arbeit:** Wissensaufstieg aus Sitzungen → `queue-flow.md`; dieser Prozess hier
  ist der Arbeits-Beitrag. Beide enden in einem PR, sind aber verschiedene Flüsse.
- **Jira:** `jira-workflow.md` regelt Board, Epics und Spalten; dieser Prozess nutzt die
  Spalten („In Arbeit" → „Internal Review") als Status-Spiegel des Strangs — Jira trägt
  Arbeit, nie Wissen.
- **Inhalt vs. Weg:** `kern-plugin-bau.md` / `abteilungs-plugin-bau.md` regeln das Was des
  Plugin-Baus; `subagenten-bau.md`, `claude-netz-bau.md` usw. deren Fachwege — S3 verweist je
  Änderungsart dorthin (Aktualisierungs-Index §2).
- **Doku-Nachzug am Zyklus-Ende:** `sync-nachzug-bauzyklus.md` ist die Ausprägung von S4 für
  gebündelte Nachzüge per Executor-Subagent.
- **Format dieses Dokuments:** `standardprozess-authoring.md`.

---

*Angelegt 2026-08-24 (Jira OS-14, übernommen aus Desktop-TODOs T11; Nachtschicht Kimi Code im
Auftrag des Maintainers). Stilvorbilder: `queue-flow.md` (Stationen·Wer·QS) und
`kriterien-pflege.md` (Anlass-Tabelle mit Nicht-Fällen); bündelt die bislang verstreuten
Regeln aus `CLAUDE.md`, `Aktualisierungs-Index` §0/§3/§5 und den Fehlerprotokoll-Lehren —
erfindet keine neuen Normen.*
