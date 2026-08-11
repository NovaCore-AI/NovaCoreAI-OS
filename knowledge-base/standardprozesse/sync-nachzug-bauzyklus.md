# Sync-Nachzug je Bauzyklus — Standardprozess (Protokoll + Executor)

> **Problem:** Bei jedem Bauzyklus müssen abhängige Dokumente nachgezogen werden (Änderungs-Matrix
> des [`aktualisierungs-index.md`](aktualisierungs-index.md), Repo-Karte und Sync-Matrix in
> `AGENTS.md`). Macht der führende Agent das verstreut nebenbei, fehlt erfahrungsgemäß etwas und
> die Suche kostet Stunden; macht er es gar nicht, driftet die Doku. **Lösung:** Nachzüge werden
> pro Bauzyklus **protokolliert statt sofort erledigt** und am Zyklusende **gebündelt**
> abgearbeitet.
>
> **Abgrenzung:** Dieses Dokument regelt die *abgeleiteten* Nachzüge. Was eine einzelne
> Änderungsart überhaupt anfassen muss, steht im `aktualisierungs-index.md`; wie die Wissensbasis
> aufgebaut ist, in [`ssot-aufbau.md`](ssot-aufbau.md).

## Ablauf

1. **Während des Baus — Protokoll führen.** Der führende Agent hält je inhaltlicher Änderung eine
   Zeile in einer Zyklus-Protokolldatei fest (im Arbeits-Worktree, `sync-protokoll.md` auf
   oberster Ebene — **nicht committen**, vor dem Commit-Vorschlag löschen):

   ```
   Änderungsart laut Änderungs-Matrix · was geändert · welche Nachzüge fällig
   ```

   Quelle der Nachzugsliste ist **immer** die passende Matrix-Zeile des
   `aktualisierungs-index.md` — nie das Gedächtnis. Steht dort keine passende Zeile, ist das
   selbst ein Befund: neue Änderungsart anlegen (die Matrix ist selbst-normativ).
2. **Am Zyklusende — Executor beauftragen.** Der Executor erhält (a) das Protokoll, (b) die
   **zitierten** Matrix-Zeilen, (c) die betroffenen Sync-Matrix-Zeilen aus `AGENTS.md`, und
   arbeitet **ausschließlich** die Nachzüge ab (README · AGENTS · ONBOARDING · SSOT-Index ·
   CHANGELOG · Registry · Marketplace-Beschreibungen). Er ändert **nichts Inhaltliches** am Bau
   selbst.
   Der Executor darf ein delegierter Agent sein oder der führende Agent selbst — entscheidend ist
   die **Trennung der Rolle**, nicht die Person: gebündelt, gegen die zitierten Zeilen, ohne
   inhaltliche Eigenmacht.
3. **Review und deterministische Gegenprobe durch den führenden Agenten:** `git diff` des
   Executor-Ergebnisses lesen · `node --test plugins/nc/tests/*.test.mjs` (Index-Vollständigkeit,
   Linkgültigkeit, Kategorie-Routing, Versions-Invarianten) · `grep`-Sweep nach Alt-Pfaden und
   Alt-Begriffen aus dem Protokoll · Matrix-Selbsttest („habe ich etwas vergessen?").
4. **Protokolldatei löschen** — ihr Inhalt ist jetzt CHANGELOG plus Diff —, dann die normale
   Abschluss-Checkliste.

## Regeln

- **Das Protokoll ersetzt keine Pflicht.** CHANGELOG-Eintrag und die **Index-Zeile einer neu
  angelegten Wissensdatei** entstehen weiterhin in derselben Änderung (testerzwungen). Ins
  Protokoll gehören nur die *abgeleiteten* Nachzüge: READMEs, Repo-Karten, Glossar, Produktstand,
  Trigger-Matrizen, Verweis-Sweeps.
- **Ein Zyklus = ein Branch/Worktree = ein Executor-Lauf.** Bei sehr kleinen Zyklen (unter drei
  Nachzügen) darf der führende Agent direkt nachziehen — das Protokoll bleibt trotzdem Pflicht:
  drei Zeilen sind billig, Vergessen ist teuer.
- **Der Executor arbeitet im selben Worktree, nie auf `main`.** Commit-Hoheit bleibt beim
  führenden Agenten beziehungsweise beim Maintainer.
- **Konfliktzone bei Parallelbau:** Laufen mehrere Pakete gleichzeitig, fasst **kein**
  Paketagent `CHANGELOG.md`, `AGENTS.md`, `README.md`, `SSOT-Document-Index.md`,
  `module-registry.json` oder eine Versionsdatei an. Diese Dateien gehören ausschließlich dem
  Executor-Lauf am Zyklusende — sonst kollidieren die Pakete genau dort, wo Konflikte am
  teuersten sind. Ausnahme bleibt die testerzwungene Index-Zeile einer neuen Wissensdatei.

---

*Angelegt 2026-08-11 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
`grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md`, AP2). Quelle:
`Onsite.ai-OS@5d335a7` `sync-nachzug-bauzyklus.md`, gelesen aus `origin/main`; auf die
NovaCore-Artefakte gemappt und um die Konfliktzonen-Regel des Parallelbaus ergänzt.*
