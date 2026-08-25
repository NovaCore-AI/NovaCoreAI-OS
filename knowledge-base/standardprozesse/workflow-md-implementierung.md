# Workflow-md-Implementierung — Standardprozess für die Abteilungs-`workflow.md`

> **Verbindlich**, sobald geprüft wird, ob eine Abteilung eine eigene `workflow.md` braucht,
> oder eine bestehende gebaut/erweitert wird. Normative Grundlage: `plugins/nc/wp-rahmen.md`
> (Abschnitt „Für Abteilungsplugins verbindlich", Punkt 1) — dort steht nur der Verweis
> hierher, damit der Rahmen nicht mit Ablauf-Prosa wächst.
> **Port 2026-08-25** aus Onsite `workflow-md-implementierung.md` (Mapping D30, Phase-J-
> Frühzug). Onsite-Fundstellen (`plugins/oai/…`, `oai:start`) sind auf NovaCore-Pendants
> (`plugins/nc/…`, `/nc:start`) umgeschrieben; die Beleg-Instanzen sind auf unseren Bestand
> umgeschrieben (`nc-development` positiv; `nc-felix`/`nc-biggi` als Satelliten-Negativfälle).
> **Abgrenzung zu `wp-rahmen.md`:** Der Rahmen definiert **WP0–WP8 selbst** und liegt im
> Kern — er gilt unverändert für jede Abteilung. Dieser Prozess entscheidet und beschreibt
> nur, **wo** eine Abteilung ihre Übersetzung von WP1–WP7 auf den eigenen Fachzyklus ablegt:
> in einer eigenen `workflow.md` oder in der Abteilungs-CLAUDE. Er ändert an WP0–WP8 nichts.
> **`workflow.md` ist optional, die WP1–WP7-Abbildung ist Pflicht** — der Anlass-Test
> entscheidet nur den Ort, nie ob.
> **Kette:** Abteilungsplugin angelegt (`abteilungs-plugin-bau.md`) oder Norm-Schub-
> Modernisierung (`abteilungs-inhalts-pruefung.md`) → **dieser Prozess** → Registry-/
> Doku-Nachzug (Änderungs-Matrix des `aktualisierungs-index.md`, Zeile „WP-Rahmen /
> `workflow.md` geändert")

## 1. Anlass-Test — entscheidbar, nicht „bei Bedarf"

Eine Abteilung braucht eine eigene `workflow.md` genau dann, wenn **mindestens eine** der
drei folgenden Fragen mit „ja" beantwortet wird. Alle drei „nein" → **keine** `workflow.md`;
der Fachablauf steht in der Abteilungs-CLAUDE.

1. **Eigene Stationen:** Hat der reale Fachzyklus Schritte, die WP1–WP7 nicht kennt — eigene
   Werkzeuge, eigene Systeme, eigene Freigabepunkte, die nicht als „Planen"/„Umsetzen"/
   „Review" beschreibbar sind, ohne Bedeutung zu verlieren?
2. **Übersetzungsbedarf:** Braucht ein Dritter eine **Tabelle** (Fachschritt → WP-Punkt), um
   den Zyklus zu verstehen — weil Reihenfolge, Terminologie oder Rollen der Abteilung von
   WP1–WP7 abweichen?
3. **Modul-Komplexität:** Bündelt die Abteilung mehrere Skill-Module mit eigenen
   Trigger-Begriffen, sodass eine **Trigger-Matrix** nötig ist, um Doppel-Trigger und Lücken
   je WP-Punkt zu vermeiden?

**Positivbeispiel (belegt):** `nc-development` — der reale Zyklus (Feature → Planung →
Implementierung → QS → Release, sechs Module `fe`/`be`/`flc`/`wzs`/`qs`/`rel` mit eigenen
Triggern) trägt eine Trigger-Matrix, ohne die Doppel-Trigger drohen;
`plugins/nc-development/workflow.md` existiert und steht im Registry-Eintrag.

**Negativbeispiele (belegt):** Die Satelliten `nc-felix` und `nc-biggi` führen **keine**
`workflow.md` — ihre Kernmodule (start, save-session, journal, os-info …) sind
Rahmen-Abbildungen ohne eigene Fachstationen; der Ablauf steht in der jeweiligen
Satelliten-Anweisung. Das Registry-Feld `workflow` fehlt dort bewusst (Feld darf fehlen,
siehe `module-registry.json`).

**Die Abbildung bleibt in jedem Fall Pflicht** (`wp-rahmen.md` Punkt 1): Fällt der Test
negativ aus, steht die WP1–WP7-Abbildung trotzdem — in der Abteilungs-CLAUDE. Sie entfällt
nie ersatzlos.

## 2. Mindestinhalt, wenn eine `workflow.md` entsteht

Abgeleitet aus `wp-rahmen.md` („Für Abteilungsplugins verbindlich") und der
Prüf-Checkliste in `abteilungs-inhalts-pruefung.md` (Punkt 8: „Trigger-Matrix vollständig,
WP-Mapping konsistent, SSOT-Abschnitt korrekt"):

1. **WP-Mapping-Tabelle:** WP1–WP7 → reale Fachstation → tragender Skill (mit
   Modul-Präfix). Jeder WP-Punkt hat **mindestens einen** auto-triggerbaren Skill.
2. **Trigger-Matrix:** Skill → Trigger-Begriffe, **disjunkt** über alle Skills der
   Abteilung (`wp-rahmen.md` Punkt 1). Keine zwei Skills teilen sich einen Trigger-Begriff.
3. **Rote-Linien-Ownership:** je roter Linie (Merge, Deployment, Review-Resolve/Approve,
   Kundensichtbares — `wp-rahmen.md`, Abschnitt „Rote Linien") der Skill, der sie **trägt
   und verweigert**, statt sie auszuführen.
4. **SSOT-Abschnitt:** Verweis auf die reale Residenz des Sitzungswissens der Abteilung
   (`knowledge-base/sitzungswissen/<abteilung>/`, Kandidaten-Queue bzw.
   Satelliten-Äquivalent) — keine geratenen Pfade (`abteilungs-inhalts-pruefung.md`
   Punkt 6).
5. **Verweis, keine Duplikation:** `wp-rahmen.md` wird verlinkt, sein Inhalt (die neun
   WP-Punkte, die Freigabe-Politik, die roten Linien selbst) steht dort **nicht** noch
   einmal (`wp-rahmen.md` Punkt 4).

## 3. Ablauf

1. **Anlass-Test** (§1) durchlaufen und das Ergebnis (positiv/negativ + Begründung) im
   Bauplan oder PR-Ergebnismemo festhalten — auch ein negatives Ergebnis ist ein Ergebnis.
2. Bei negativem Ergebnis: Fachablauf in der Abteilungs-CLAUDE (Teil 1) beschreiben,
   Registry-Feld `workflow` **nicht** setzen — **hier endet der Prozess**.
3. Bei positivem Ergebnis: realen Fachzyklus erheben — Stationen, Werkzeuge,
   Freigabepunkte, Rollen (Quelle: Domänenwissen der Abteilung, ggf. verifizierte
   Fachfakten).
4. WP-Mapping-Tabelle und Trigger-Matrix entwerfen (§2 Punkte 1–2), Disjunktheit der
   Trigger gegenprüfen.
5. Rote-Linien-Ownership je Skill zuordnen (§2 Punkt 3).
6. SSOT-Abschnitt schreiben (§2 Punkt 4).
7. Datei ablegen: an der Plugin-Wurzel — im OS-Repo `plugins/nc-<abteilung>/workflow.md`
   (nur bis zur Extraktion), danach an der Satelliten-Wurzel `workflow.md`.
8. Registry-Feld `workflow` im Abteilungseintrag der `plugins/nc/module-registry.json`
   setzen (`"workflow": "workflow.md"`). Das Feld **darf fehlen** — fehlt es bei
   existierender Datei (oder umgekehrt), ist das ein unvollständiger Durchlauf (§4).
9. Plugin-README der Abteilung verweist auf die `workflow.md` (Kurzabsatz + Link).
10. Abteilungs-CLAUDE Teil 1 nennt die `workflow.md` als Fachablauf-Quelle neben
    `/nc:start`.

## 4. Ergebnis/Output

Nach positivem Durchlauf existiert: die Datei `workflow.md` an der Plugin- bzw.
Satelliten-Wurzel · das gesetzte Registry-Feld `workflow` · ein Verweis im Plugin-README ·
ein Verweis in der Abteilungs-CLAUDE. Ein Dritter erkennt den durchlaufenen Prozess daran,
dass **alle vier** vorhanden und **untereinander konsistent** sind.

Nach negativem Durchlauf existiert **keine** `workflow.md`, das Registry-Feld `workflow`
fehlt im Abteilungseintrag (wie bei den Satelliten), und die WP-Abbildung steht in der
Abteilungs-CLAUDE.

## 5. Verhältnis zu `wp-rahmen.md` bei Widerspruch (Kollisionsregel)

Beide Dokumente regeln unterschiedliche Ebenen — die Kollisionsregel trennt sie nach
**Zuständigkeit**, nicht nach Rang:

| Bereich | Gewinnt bei Widerspruch |
|---|---|
| Existenz und Reihenfolge von WP0–WP8, die Freigabe-Politik, die roten Linien selbst, wer WP0/WP8 trägt | `wp-rahmen.md` |
| Reihenfolge, Werkzeuge und Freigabepunkte **innerhalb** eines WP-Punkts im realen Fachzyklus; Modul-/Trigger-Zuschnitt der Abteilung | die Abteilungs-`workflow.md` |

Eine `workflow.md` darf WP0–WP8 nicht umdefinieren, keine rote Linie aufweichen und keine
Freigabe-Politik lockern — tut sie das, ist das ein Fehler in der `workflow.md`, keine
zulässige Abteilungs-Ausprägung. Umgekehrt regelt `wp-rahmen.md` keinen Fachschritt konkret
— tut ein Änderungsvorschlag das, gehört er in die `workflow.md`, nicht in den Rahmen.

## 6. Verifikation / Abnahme

- [ ] Anlass-Test-Ergebnis im Bauplan bzw. PR-Ergebnismemo dokumentiert (§1)
- [ ] `abteilungs-inhalts-pruefung.md` Punkt 8 gegengeprüft: Trigger-Matrix vollständig,
      WP-Mapping konsistent, SSOT-Abschnitt korrekt
- [ ] `claude plugin validate plugins/<name> --strict` (OS-Repo) bzw. Satelliten-Suite
      (eigenes Repo) fehlerfrei
- [ ] Registry-Feld `workflow` und tatsächliche Dateiexistenz stimmen überein (§4)
- [ ] Nachzug nach der Änderungs-Matrix des `aktualisierungs-index.md` durchlaufen:
      Registry, Plugin-README, Abteilungs-CLAUDE
- [ ] Selbsttest: *Findet ein neues Abteilungsmitglied über die `workflow.md` allein von
      einem Fachereignis zum tragenden Skill, ohne den Rahmen `wp-rahmen.md` parallel lesen
      zu müssen?*

---

*Angelegt 2026-08-25 als Port von Onsite `workflow-md-implementierung.md`
(`plugin-maintanance-ruleset-source/`, Onsite-Anker `a9927b2`) im Phase-J-Frühzug
(Mapping D30). Onsite hat den Prozess 2026-08-22 zur Entschärfung von `wp-rahmen.md`
(„workflow.md ist optional, nicht universell") angelegt — der Anlass-Test fehlte bis
dahin, obwohl das Feld bereits als Kann-Feld geführt wurde.*
