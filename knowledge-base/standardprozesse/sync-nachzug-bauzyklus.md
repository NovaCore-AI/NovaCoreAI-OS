# Standardprozess: Sync-Nachzug je Bauzyklus (Protokoll + Executor)

> **Problem:** Bei jedem Bauzyklus müssen abhängige Dokumente nachgezogen werden
> (Änderungs-Matrix des `Aktualisierungs-Index`). Macht der
> führende Agent das verstreut nebenbei, fehlt erfahrungsgemäß etwas und es kostet Stunden;
> macht er es gar nicht, driftet die Doku (Belegfälle: Drift-Serie, Struktur-Umbau
> 2026-07-29). **Lösung (Maintainer-Auftrag 2026-08-11):** Nachzüge werden pro Bauzyklus
> **protokolliert statt sofort erledigt** und am Zyklusende **gebündelt von einem
> Executor-Subagenten** abgearbeitet — der führende Agent liefert Anweisung + Review,
> nicht die Schreibarbeit (vgl. Backlog-Idee Executor-Delegation, 2026-08-10).
> **Kette:** Bauzyklus-Ende → **dieser Prozess** → Review, Integration (`Aktualisierungs-Index`)

## Ablauf

1. **Während des Baus — Protokoll führen:** Der führende Agent hält je inhaltlicher
   Änderung eine Zeile in einer Zyklus-Protokolldatei fest (im Arbeits-Worktree, z. B.
   `sync-protokoll.md` auf oberster Ebene — **nicht committen**, vor Commit entfernen):
   `Änderungsart laut Änderungs-Matrix · was geändert · welche Nachzüge fällig`.
   Quelle der Nachzugsliste ist **immer** die passende Matrix-Zeile des
   `Aktualisierungs-Index` — nie das Gedächtnis.
2. **Am Zyklusende — Executor beauftragen:** Ein Subagent erhält (a) das Protokoll,
   (b) die zitierten Matrix-Zeilen des `Aktualisierungs-Index`, und
   arbeitet ausschließlich die Nachzüge ab (README/CLAUDE/AGENTS/Betriebshandbuch/
   SSOT-Index/CHANGELOG/Registry …). Er ändert **nichts Inhaltliches** am Bau selbst.
3. **Review + deterministische Gegenprobe durch den führenden Agenten:**
   `git diff` des Executor-Ergebnisses lesen · `node --test plugins/oai/tests/*.test.mjs`
   (Index-Vollständigkeit, Linkgültigkeit, Versions-Invarianten) ·
   `grep`-Sweep nach Alt-Pfaden/Alt-Begriffen aus dem Protokoll · Matrix-Selbsttest
   („habe ich etwas vergessen?").
4. **Protokolldatei löschen** (ihr Inhalt ist jetzt CHANGELOG + Diff), dann normale
   Abschluss-Checkliste der `CLAUDE.md`.

## Regeln

- Das Protokoll ersetzt keine Pflicht: **die Index-Zeile jeder neuen Wissensdatei entsteht
  weiterhin in derselben Änderung** (testerzwungen). Ein **CHANGELOG-Eintrag entsteht im
  Strang dagegen gar nicht mehr** — die Sektion schreibt der Release-Zug aus den PR-Memos,
  und nur für Produktklassen-Anteile (Aktualisierungs-Index §0/§3.6). Ins Protokoll gehören die
  *abgeleiteten* Nachzüge (READMEs, Betriebshandbuch, Glossar-Karte, Trigger-Matrizen,
  Verweis-Sweeps).
- Ein Zyklus = ein Branch/Worktree = ein Executor-Lauf. Bei sehr kleinen Zyklen (< 3
  Nachzüge) darf der führende Agent selbst nachziehen — das Protokoll bleibt trotzdem
  Pflicht (drei Zeilen sind billig, Vergessen ist teuer).
- Der Executor arbeitet im selben Worktree, nie auf `main`; Commit-Hoheit bleibt beim
  führenden Agenten bzw. Maintainer.

---

*Angelegt 2026-08-11 durch Claude „Saga" (Fable 5, Claude Code) auf Maintainer-Auftrag
(„schlaues Setup aus den Indexen" gegen vergessene Abhängigkeits-Nachzüge).*
