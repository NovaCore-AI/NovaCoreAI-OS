# Standardprozess Scratchpad-Nutzung — kurzer Arbeitsplatz, kein Aufbewahrungsort

> **Zweck:** Verbindliche Verwendungsregeln für das **Session-Scratchpad** von Claude Code auf
> allen Maschinen des NovaCore-Netzes.
>
> **Anlass:** Portiert aus dem Onsite-Vorbild (`plugin-maintanance-ruleset-source/scratchpad-nutzung.md`,
> live gelesen gegen `origin/main@2530ced`, Kern 0.26.0) als **D27**. Der Posten entstand dort
> nach einer Havarie am 2026-08-17, bei der ein **fertig gebauter Satellit** im Scratchpad lag
> und vom Session-Aufräumlauf gelöscht wurde; er musste aus dem Log des Bau-Agenten
> rekonstruiert werden. **Bei NovaCore ist kein solcher Vorfall belegt** — wir übernehmen die
> Norm vorbeugend, nicht als Reaktion. Der Merksatz der Lehre lautet: **„Gebaut gilt erst nach
> Push."**
>
> **Verankerung:** Der Scratchpad-Scope ist als **dritter lokaler Scope** in den
> [Systemachsen](../grundwissen/NovaCore-OS-Systemachsen.md) definiert (neben Projekt- und
> User-Scope). Die Erfassungspflicht **R3** fährt im ausgelieferten `end-session`-Skill des
> Kern-Plugins mit (Schritt 9a).
>
> **Gilt für:** jede Session, jedes Arbeits-Repo, jede Abteilung.

## Was das Scratchpad ist — und was es nie ist

Das Session-Scratchpad ist Claude Codes Arbeitsverzeichnis **einer** Session. Drei
Eigenschaften tragen alle Regeln:

- **flüchtig** — der Session-Aufräumlauf kann es jederzeit löschen; auch ohne Aufräumlauf ist
  kein Überleben garantiert (Container-Restart, tmpfs, Reboot),
- **sitzungslokal** — kein Teammitglied sieht es, keine andere Maschine,
- **nicht indizierbar** — wechselnde, sitzungsephemere Inhalte. Deshalb hat es bewusst
  **keinen** Eintrag im Pfad-Änderungsindex: Dort stehen Pfadklassen mit **stabilem
  Inhaltssinn**, und genau den hat ein Session-Verzeichnis nicht.

Es ist **kein** Aufbewahrungs-, Planungs-, Bau- oder Wissens-Ort. Arbeiten und Iterieren
bleiben frei — die Grenze gilt allein der **Finalität**. Alles, was morgen noch existieren
soll, gehört **sofort** an einen SSOT-Ort, nicht „erst später".

> **Pfad-Hinweis:** Ort und Mechanik des Scratchpad sind nicht offiziell dokumentiert. Dieser
> Prozess nennt deshalb **keinen** festen Pfad — er beschreibt Eigenschaften und Regeln. Wer den
> konkreten Ort braucht, liest ihn zur Laufzeit aus der eigenen Umgebung; bei abweichendem
> beobachtetem Verhalten gilt die Platte, danach wird hier korrigiert.

## R1 — Arbeiten: freier Arbeitsplatz der Session, aber nie final

Das Scratchpad bleibt der **freie Arbeitsplatz** der Session: Entwürfe, Iteration,
Zwischenstände, Aufruf-Dateien (`git commit -F`, `gh pr create --body-file`), Prüf-Skripte
außerhalb des geprüften Baums. Diese Nutzung braucht **keine** Einzelfall-Prüfung, sie ist
erlaubt. **Leitplanke statt Minimierung.**

Die Leitplanke steht auf der Finalität:

- **Nie final im Scratchpad** — keine finalen Fassungen von Dokumenten, keine fertigen
  Artefakte auf Freigabe, keine getragenen Entscheidungen, kein Wissen, das überleben soll
  (Baupläne · Lauf-Steuerungsdateien · gebaute Artefakte · Unveröffentlichtes · Sitzungswissen ·
  Fachinhalt). Für diese Gegenstände gilt **R2**.
- **Informationshoheit liegt beim OS** — die SSOT (Master-Index, Standardprozesse,
  Knotendokumente, Router) bestimmt allein, wo gültiger Inhalt wohnt. Das Scratchpad ist **nie**
  Quelle, **nie** Referenz, **nie** „Stand". Wer etwas zitieren will, zitiert den SSOT-Ort.
- **Keine zweite gültige Fassung** — existiert ein Inhalt an einem SSOT-Ort, ist der
  Scratchpad-Zwischenstand **Entwurf**, nie Konkurrenz.

## R2 — Ersetzen: der richtige Ort statt Scratchpad

| Gegenstand | SSOT-Ort (sofort, nicht später) |
|---|---|
| Planungsgegenstand / Arbeitsplan | `knowledge-base/aktive-bauplaene/` (OS-Repo) bzw. die Bauplan-Kategorie der Abteilungs-SSOT |
| Lauf-Steuerung (Ziel- und Kriterien-Dateien eines beauftragten Laufs) | Worktree des Laufs **plus Remote-Branch** — der Overseer prüft gegen einen **gepushten** Stand, nie gegen einen nur lokalen |
| Gebautes, unveröffentlichtes Artefakt (Satellit, Plugin) | eigener Worktree **plus sofort Remote-Branch** — **„Gebaut gilt erst nach Push"** |
| Sitzungswissen | `/nc:end-session` (Journal, Stand, Register, Roll-up, Projekt-Memory) |
| Fachinhalt, der erhalten bleiben soll | die zuständige Fachkategorie der Wissensbasis bzw. der Abteilungs-SSOT |

## R3 — Erfassen: Sitzungsabschluss gegen Verlust

`/nc:end-session` behandelt den Scratchpad-Rest als **dritte klassifizierende Quelle** der
lokalen Stufe — dritter Scope neben Projekt-Scope und User-Scope (Schritt **9a** des Skills):

1. **Bestandsaufnahme:** die Scratchpad-Inhalte dieser Session überblicken.
2. **Je Fund wird entschieden** — Rettung in Journal, Stand oder Memory (bei Firmenrelevanz
   zusätzlich eine Queue-Zeile über GL1–GL5) **oder** bewusstes Verwerfen, in der Übergabe
   ausgewiesen als **„bewusst verworfen"**.
3. **Nichts bleibt unbesehen liegen** — ein stiller Verlust ist ein **Ausführungsfehler**, kein
   Schicksal.

Die GL-Prüfungen gelten unverändert: Scratchpad-Funde sind **keine** Ausnahme von GL1–GL5 oder
der Privatsphäre-Grenze. Existiert das Scratchpad nicht mehr (Aufräumlauf), ist das **zu
melden** — dann trägt die R2-Vorsorge (Remote-Branch, SSOT-Ort) allein, was sie soll.

## Regeln in Kurzform

- **Arbeiten ja, Finalität nein** — R1 ist eine Leitplanke, kein Verbot.
- **Keine zweite Fassung** — ein Inhalt existiert genau einmal als gültige Fassung, und die
  liegt nie im Scratchpad.
- **Zeiger, kein Spiegel** — dieser Prozess nennt Eigenschaften und Orte; er kopiert keine
  Inhalte aus anderen Dokumenten, sondern verweist auf sie.
- **Upstream-Unsicherheit benennen** — Pfad und Mechanik des Scratchpad sind nicht offiziell
  dokumentiert; abweichendes Verhalten wird beobachtet und hier korrigiert, nicht geraten.

## Verifikation

- Kein finaler Gegenstand lag im Scratchpad: gültige Fassungen, publikationsreife Artefakte und
  getragene Entscheidungen liegen am SSOT-Ort — andernfalls Eintrag im
  [Fehlerprotokoll](../debugging-findings/agent-learnings.md).
- Am Sitzungsabschluss listet die Übergabe den Scratchpad-Bestand **mit Entscheidung je Fund**
  (gerettet oder bewusst verworfen).
- Kein geretteter Fund existiert nur im Scratchpad — nach der Rettung liegt der Inhalt am
  SSOT-Ort, der Scratchpad-Eintrag ist abgeschrieben.

---

*Angelegt 2026-08-24 durch Claude (Opus 5, Claude Code) als Overseer auf Weisung Lucas
Vöhringer — AP-C7 des Phase-I-Bauplans, Mapping-Position D27. Quelle: Onsite.ai-OS
`origin/main@2530ced` (Kern 0.26.0), live gelesen; der auslösende Vorfall ist ein
Onsite-Vorfall und wird hier als Herkunft benannt, nicht als eigener ausgegeben. Lebender
Standardprozess; Änderungen folgen dem Aktualisierungs-Index, Zeile „Konvention/Prozess
geändert".*
