# Vorlage: Abteilungsplugin

> **Kein Plugin.** Dieses Verzeichnis liegt bewusst außerhalb von `plugins/` und die Dateien
> tragen die Endung `.vorlage`, damit kein Scanner und kein Marketplace-Eintrag sie als Manifest
> interpretiert. Verbindlicher Ablauf: Standardprozess
> `knowledge-base/standardprozesse/abteilungs-plugin-bau.md` (bis 2026-08-11 `plugin-bau.md`,
> seither zweigeteilt — die Kernseite steht in `kern-plugin-bau.md`).

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
  ssot-grundgeruest.md.vorlage         Wissensbasis-Gerüst — NUR für eigenständige Satelliten
  VORLAGE.md                           diese Anleitung
```

Bewusst **nicht** enthalten:

- **`hooks/`** — für ein repo-internes Abteilungsplugin liegt die Kontroll-Schicht ausschließlich
  im Kern; eigene Hooks ließen die Gates doppelt feuern (testerzwungen). Ein **eigenständiger
  Satellit** trägt seine eigene Kontroll-Schicht, weil er Kern-Hooks nicht erreichen kann — sein
  Bauweg steht in `abteilungs-plugin-bau.md` §3b, nicht in dieser Vorlage.
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

`{{ABTEILUNG}}` ist **dieselbe** Variable in `ssot-grundgeruest.md.vorlage` — wer einen
eigenständigen Satelliten aufsetzt, ersetzt sie dort mit demselben Wert (auch in den beiden
Protokollköpfen).

`dependencies: ["nc"]` ist **keine** Variable — der Eintrag ist Pflicht und wird nie entfernt.
Ohne ihn fehlt die transitive Kern-Aktivierung, und die ständige Abteilung ist nicht mehr
erzwungen.

## Instanzieren

1. Verzeichnis kopieren nach `plugins/<plugin-name>/`.
2. `.vorlage`-Endungen entfernen, `VORLAGE.md` **nicht** mitkopieren.
   **`ssot-grundgeruest.md.vorlage` ebenfalls nicht mitkopieren** — sie ist keine Plugin-Datei,
   sondern die Bauanleitung für die Wissensbasis eines **eigenständigen Satelliten**. Man liest
   sie und legt danach `knowledge-base/` im Satelliten-Repo an; ein repo-internes
   Abteilungsplugin braucht sie gar nicht.
3. Variablen ersetzen; danach darf keine `{{…}}`-Stelle übrig sein — Kontrolle:
   `grep -r "{{" plugins/<plugin-name>` liefert keine Treffer.
4. Weiter mit dem Standardprozess `abteilungs-plugin-bau.md` (Marketplace-Eintrag, Registry,
   Validierung beider Ebenen, Install-Probe, Doku-Sync); beim eigenständigen Satelliten §3b und
   zusätzlich `ssot-aufbau.md` §4 für die Wissensbasis.
