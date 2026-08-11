# Debug-Log — gefundene und behobene Bugs

> Gegenstück zum [Fehlerprotokoll](agent-learnings.md): Dort stehen die **eigenen** Fehler des
> Agenten, hier die **gefundenen Bugs und Fehlbefunde** an Code, Konfiguration, Doku und
> Vorbildern — unabhängig davon, wer sie verursacht hat. Vor jeder neuen Fehlersuche zuerst hier
> die Symptome abgleichen: Ein bekanntes Symptom spart die halbe Analyse.
>
> **Append-only.** Nie rückdatieren, nie umschreiben. Wird ein Eintrag später widerlegt oder
> ergänzt, entsteht ein **neuer** Eintrag, der auf den alten verweist.
>
> Format pro Eintrag: **Datum · Symptom · Ursache · Fix · Beleg** — das ist das **Minimum**.
> Trägt ein Fall mehr, sind weitere Felder erlaubt (etwa *Wirkung*, wenn die Folge nicht aus dem
> Symptom folgt, oder *Präventionsregel*, wenn sich aus dem Bug eine Regel ableiten lässt).

## Einträge

### 2026-08-11 — Vorbild-Regel „ref/SHA-Pin klont nur das Plugin-Subverzeichnis" ist falsch

- **Symptom:** Der Prozesskorpus des Vorbilds (`Onsite.ai-OS@5d335a7`,
  `abteilungs-plugin-bau.md` §1) begründet die Auslieferungsgrenze eines Satelliten damit, dass
  Claude Code bei einem `ref`/`sha`-Pin einen **sparse clone nur des Plugin-Subverzeichnisses**
  mache. Der Bauplan 2026-08-11 hat diese Begründung in §1d übernommen; AP1.3 sollte sie als
  „Sparse-Clone-Regel" nach NovaCore portieren.
- **Ursache:** Verwechslung zweier Mechaniken. Der sparse/partial clone hängt am **Source-Typ
  `git-subdir`** („Claude Code uses a sparse, partial clone to fetch only the subdirectory") bzw.
  am Opt-in-Flag `claude plugin marketplace add … --sparse <paths…>` — **nicht** am Pin. Ein
  `github`-Source mit `ref`/`sha`, die Pin-Form beider NovaCore-Satelliten, klont das ganze Repo
  („Git-based marketplaces clone the entire repository"). Die reale Grenze entsteht erst beim
  Install: „when users install a plugin, Claude Code copies **the plugin directory** to a cache
  location" (`~/.claude/plugins/cache`).
- **Wirkung:** Die **Schlussfolgerungen** des Bauplans blieben richtig (Kern: nur `plugins/nc/`
  wird kopiert, also kommt `knowledge-base/` nie mit; Satellit: Repo-Wurzel ist das
  Plugin-Verzeichnis, also fährt die Wissensbasis mit). Falsch war allein die Begründung — die
  aber hätte bei einem Wechsel auf `git-subdir` zur gegenteiligen Konsequenz geführt.
- **Fix:** `abteilungs-plugin-bau.md` §1a heißt jetzt **Auslieferungsgrenze (Kopie des
  Plugin-Verzeichnisses)** und nennt die belegte Mechanik samt Tabelle je Source-Typ; die beiden
  verbreiteten Irrtümer sind dort ausdrücklich ausgeräumt. Plan-Nachtrag **N3** dokumentiert die
  Abweichung vom Vorbild.
- **Beleg:** offizielle Doku `plugin-marketplaces`, abgerufen 2026-08-11 über
  `code.claude.com/docs/en/plugin-marketplaces` (die frühere Adresse
  `docs.claude.com/en/docs/claude-code/plugin-marketplaces` antwortet mit `301` auf diesen Host).
  Gegengeprüft in `.claude-plugin/marketplace.json`: NovaCore benutzt keinen
  `git-subdir`-Source — Kern relativ (`./plugins/nc`), Satelliten `github` + `ref` + `sha`.
- **Präventionsregel:** Aus einem Vorbild wird der **Inhalt** übernommen, nicht dessen Beleglage.
  Trägt eine portierte Regel eine Mechanik-Begründung mit Abrufdatum, wird die Quelle **vor** dem
  Port erneut abgerufen — auch dann, wenn das Vorbild sie erst kürzlich geprüft hat.
