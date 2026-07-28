# Vorlage: Abteilungsplugin

> **Kein Plugin.** Dieses Verzeichnis liegt bewusst außerhalb von `plugins/` und die Dateien
> tragen die Endung `.vorlage`, damit kein Scanner und kein Marketplace-Eintrag sie als Manifest
> interpretiert. Verbindlicher Ablauf: Standardprozess
> `knowledge-base/standardprozesse/plugin-bau.md`.

## Herkunft dieser Vorlage

Übernommen aus dem erprobten Onsite.ai-OS-Muster (dort abgeleitet aus real gebauten
Abteilungsplugins) und an NovaCore-OS angepasst (Umbau 2026-07-28). Wer beim Instanzieren
eine fehlende Variable oder einen Stolperstein findet, ergänzt **zuerst hier** und dann im
Plugin — die Vorlage bleibt die geprüfte Quelle.

## Inhalt

```
vorlagen/abteilungsplugin/
  .claude-plugin/plugin.json.vorlage   Manifest-Gerüst mit dependencies ["nc"]
  README.md.vorlage                    Abteilungs-README-Gerüst
  VORLAGE.md                           diese Anleitung
```

Bewusst **nicht** enthalten:

- **`hooks/`** — die Kontroll-Schicht liegt ausschließlich im Kern. Ein Abteilungsplugin mit
  eigenen Hooks lässt die Gates doppelt feuern.
- **`skills/`** — ein leeres Verzeichnis lässt sich in Git nicht abbilden und wäre ohnehin
  wirkungslos: Der Scanner ignoriert Ordner ohne `SKILL.md`. Es entsteht erst mit dem ersten
  gebauten Skill.
- **`workflow.md`** — entsteht erst, wenn die Abteilung ihren realen Zyklus auf WP1–WP7 abbildet
  (Vorbild: `plugins/nc-development/workflow.md`). Der Rahmen WP0–WP8 bleibt im Kern.

## Variablen

| Variable | Bedeutung | Beispiel | Regel |
|---|---|---|---|
| `{{ABTEILUNG}}` | Abteilungsname, klein | `marketing` | kebab-case, keine Umlaute |
| `{{PLUGIN_NAME}}` | Plugin- und Marketplace-Name | `nc-marketing` | immer `nc-{{ABTEILUNG}}` |
| `{{NAMESPACE}}` | Aufrufpräfix der Skills | `/nc-marketing:` | folgt zwingend `{{PLUGIN_NAME}}` |
| `{{BESCHREIBUNG}}` | ein Satz, was die Abteilung leistet | „Kampagnen- und Content-Arbeit" | deutsch |
| `{{VERSION}}` | Startversion | `0.1.0` | neue Abteilung startet bei `0.1.0` |
| `{{MIN_CORE}}` | Kern-Mindestversion für die Registry | `0.3.0` | aktuelle Kern-Version |

`dependencies: ["nc"]` ist **keine** Variable — der Eintrag ist Pflicht und wird nie entfernt.
Ohne ihn fehlt die transitive Kern-Aktivierung, und die ständige Abteilung ist nicht mehr
erzwungen.

## Instanzieren

1. Verzeichnis kopieren nach `plugins/<plugin-name>/`.
2. `.vorlage`-Endungen entfernen, `VORLAGE.md` **nicht** mitkopieren.
3. Variablen ersetzen; danach darf keine `{{…}}`-Stelle übrig sein — Kontrolle:
   `grep -r "{{" plugins/<plugin-name>` liefert keine Treffer.
4. Weiter mit dem Standardprozess `plugin-bau.md` (Marketplace-Eintrag, Registry,
   Validierung beider Ebenen, Install-Probe, Doku-Sync).
