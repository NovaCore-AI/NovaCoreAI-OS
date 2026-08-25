# metaknowledge/ — Artefakt-Heimat für Metawissen

> **Zweck:** Ablageort für **Artefakte und Metawissen**, die zur Arbeit *am* OS gehören,
> aber keine indexpflichtigen Wissensdokumente der `knowledge-base/` sind —
> Migrations-Skripte, Export-Batches, Zugangs-Zeiger, Arbeitsdaten von parallelen
> Vorgängen. **Maintainer-Entscheid 2026-08-25** (Auflösung der offenen Jira-Heimat-Frage
> aus dem Offene-Stränge-Register): Artefakte dieser Klasse wohnen hier, **nicht** unter
> `.nc/` (strikt nach Onsite kein Ablageort) und nicht in der Wissensbasis (dort erzwingt
> der SSOT-Index Vollständigkeit je Datei — für Batch-Exporte falsch gewichtet).
>
> **Abgrenzung:** Normative Prozesse und Wissen gehören in `knowledge-base/` (mit
> Index-Zeile); Sitzungsstände in `knowledge-base/sitzungswissen/`; flüchtige
> Arbeitsartefakte eines laufenden Strangs in dessen Worktree (Scratchpad-Norm,
> `standardprozesse/scratchpad-nutzung.md`). Hier landet, was **zwischen** beidem liegt:
> dauerhaft referenzierbar, aber nicht normativ.
>
> **Secrets-Regel gilt auch hier:** niemals Tokens, Passwörter oder Schlüssel in diesen
> Dateien — Zugänge nur als Zeiger auf Umgebungsvariablen (Vorbild:
> `jira-rest-zugang.md`).

## Bestand

| Pfad | Inhalt | Herkunft |
|---|---|---|
| `jira-migration/` | EP→WZ-Migrationswerkzeug (2026-08-24/25): `import_wz.py`, `comments_wz.py`, `links_wz.py`, Link-/Kommentar-Maps, `export/` (EP-Batches EP-1–EP-87 als JSON) | Jira-Vorgang, aus `.nc/jira-migration/` (Scratchpad-Fund D27) übernommen |

**Nicht hier, sondern in der Wissensbasis:** Der Zugangs-Zeiger
`jira-rest-zugang.md` wohnt als Fremdsystem-Manual in
`knowledge-base/feature-manuals/` (dorthin zuvor via PR #28 migriert — die
metaknowledge-Kopie des Frühzugs wurde als Dublette fallen gelassen; Maintainer-Lage:
Manuals in die Wissensbasis, Arbeitsartefakte hier).
