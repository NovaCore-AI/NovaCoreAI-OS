# Standardprozess Scratchpad-Nutzung — kurzer Arbeitsplatz, kein Aufbewahrungsort

> **Zweck:** Verbindliche Verwendungsregeln für das Session-Scratchpad von Claude Code auf
> allen Maschinen des Claude-Netzes. Anlass: controlling-Havarie 2026-08-17 (gebauter
> Satellit im Scratchpad vom Aufräumlauf gelöscht; Rekonstruktion aus dem Bau-Agenten-Log —
> Belege: [`Debugging + findings/debug-log.md`](<../Debugging + findings/debug-log.md>) und
> [`agent-learnings.md`](<../Debugging + findings/agent-learnings.md>), jeweils 2026-08-17)
> und der Befund 2026-08-23, dass das Scratchpad in keinem normativen Träger erfasst war.
> **Verankerung:** Spec-Nachtrag 2026-08-23 (Scratchpad-Norm); der Scratchpad-Scope ist als
> dritter lokaler Scope in der
> [`Onsite.ai-OS-Systemachsen.md`](<../project-meta-infos/Onsite.ai-OS-Systemachsen.md>)
> definiert.
> **Gilt für:** jede Session, jedes Arbeits-Repo, jede Abteilung. Die Erfassungspflicht (R3)
> fährt im ausgelieferten `end-session`-Skill des Kern-Plugins mit.

## Was das Scratchpad ist — und was es nie ist

Das Session-Scratchpad (`~/.claude/projects/<session-id>/scratchpad/` auf Windows;
`/tmp/claude/<encoded-cwd>/<session-id>/scratchpad/` auf Unix) ist Claude Codes
Arbeitsverzeichnis **einer** Session. Drei Eigenschaften, die alle Regeln tragen:

- **flüchtig** — der Session-Aufräumlauf kann es jederzeit löschen; auch ohne Aufräumlauf
  ist kein Überleben garantiert (Container-Restart, tmpfs, Reboot),
- **sitzungslokal** — kein Teammitglied sieht es, keine Abteilungsmaschine,
- **nicht indizierbar** — wechselnde, sitzungsephemere Inhalte; deshalb hat es bewusst
  **keinen** Eintrag im Pfad-Änderungsindex (§15.49 — dort stehen Pfad-Klassen mit stabilem
  Inhaltssinn).

Es ist **kein** Aufbewahrungs-, Planungs-, Bau- oder Wissens-Ort — Arbeiten und Iterieren
bleiben frei, die Grenze gilt allein der Finalität. Alles, was morgen noch existieren soll,
gehört **sofort** an einen SSOT-Ort — nicht „erst später".

## R1 — Arbeiten: freier Arbeitsplatz der Session, aber nie final

Das Scratchpad bleibt der **freie Arbeitsplatz** der Session — so stark integriert, wie
Claude Code ihn heute nutzt: Entwürfe, Iteration, Zwischenstände, Aufruf-Dateien
(`git commit -F`, `gh pr create --body-file`), Prüf-Skripte außerhalb des geprüften Baums.
Diese Nutzung braucht keine Einzelfall-Prüfung, sie ist erlaubt (Kurskorrektur Maintainer
2026-08-23: Leitplanke statt Minimierung).

Die Leitplanke steht auf der **Finalität**:

- **Nie final im Scratchpad** — keine finalen Fassungen von Dokumenten, keine fertigen
  Artefakte auf Freigabe, keine getragenen Entscheidungen, kein Wissen, das überleben soll
  (Baupläne · GOAL-Dateien · gebaute Artefakte · Unveröffentlichtes · Sitzungswissen ·
  Fachinhalt). Für diese Gegenstände gilt R2.
- **Informationshoheit liegt beim OS** — die SSOT (Master-Index, Standardprozesse,
  Node-Doks, Router) bestimmt allein, wo gültiger Inhalt wohnt. Das Scratchpad ist nie
  Quelle, nie Referenz, nie „Stand"; wer etwas zitieren will, zitiert den SSOT-Ort.
- **Keine zweite gültige Fassung** — existiert ein Inhalt an einem SSOT-Ort, ist der
  Scratchpad-Zwischenstand Entwurf, nie Konkurrenz (Ebene-0-Leitplanke „ein Thema, ein
  Dokument").

## R2 — Ersetzen: der richtige Ort statt Scratchpad

| Gegenstand | SSOT-Ort (sofort, nicht später) |
|---|---|
| Planungsgegenstand / Arbeitsplan | `Aktive Baupläne/` (OS-Repo) bzw. Bauplan-Kategorie der Abteilungs-SSOT |
| Lauf-Steuerung (GOAL-Dateien, Overseer-Kriterien) | Worktree des Laufs + Remote-Branch (`wip/`-Namespace zulässig) — der Overseer prüft gegen einen **gepushten** Stand |
| Gebautes, unveröffentlichtes Artefakt (Satellit, Plugin) | eigener Worktree + **sofort Remote-Branch** — „**Gebaut gilt erst nach Push**" (Lehre 2026-08-17) |
| Sitzungswissen | `/oai:end-session` (Journal/Stand/Memory) |
| Fachinhalt, der erhalten bleiben soll | Fachkategorie der Wissensbasis bzw. Abteilungs-SSOT |

## R3 — Erfassen: Sitzungsabschluss gegen Verlust

`/oai:end-session` behandelt den Scratchpad-Rest als dritte klassifizierende Quelle der
lokalen Stufe (dritter Scope neben Projekt-Scope und User-Scope, Schritt 9a des Skills):

1. **Bestandsaufnahme:** die Scratchpad-Pfade dieser Session überblicken.
2. **Je Fund:** Rettung in Journal/Stand/Memory, bei Firmenrelevanz zusätzlich Queue-Zeile
   über GL1–GL5 — **oder** bewusstes Verwerfen, in der Übergabe (Schritt 11 des Skills)
   ausgewiesen als „bewusst verworfen (Einmal-Mechanik, R1)".
3. **Nichts bleibt unbesehen liegen** — ein stiller Verlust ist ein Ausführungsfehler, kein
   Schicksal.

Die GL-Prüfungen gelten unverändert; Scratchpad-Funde sind keine Ausnahme von GL1–GL5 oder
der Privatsphäre-Grenze (§15.48.6). Existiert das Scratchpad nicht mehr (Aufräumlauf), ist
das **gemeldet** worden — dann trägt die R2-Vorsorge (Remote-Branch/SSOT-Ort) allein, was
sie soll.

## Regeln

- **Arbeiten ja, Finalität nein** — R1 ist eine Leitplanke, kein Verbot: die Nutzung als
  Arbeitsplatz bleibt frei; Finalität (gültige Fassungen, publikationsreife Artefakte,
  getragene Entscheidungen) hat im Scratchpad nichts verloren.
- **Keine zweite Fassung** — ein Inhalt existiert genau einmal als gültige Fassung, und die
  liegt nie im Scratchpad (Quellendrift-Verbot; Ebene-0-Leitplanke „ein Thema, ein
  Dokument").
- **Zeiger, kein Spiegel** — dieser Prozess nennt Eigenschaften und Orte; er kopiert keine
  Inhalte aus dem Fehlerprotokoll, sondern verweist darauf.
- **Upstream-Unsicherheit benennen** — Pfad und Mechanik des Scratchpad sind nicht
  offiziell dokumentiert (Stand 2026-08-23, Issue #21248); bei abweichendem beobachtetem
  Verhalten gilt die Platte, danach wird hier korrigiert.

## Verifikation

- Kein finaler Gegenstand lag im Scratchpad: gültige Fassungen, publikationsreife
  Artefakte und getragene Entscheidungen liegen am SSOT-Ort — andernfalls
  Fehlerprotokoll-Eintrag.
- Am Sitzungsabschluss listet die Übergabe den Scratchpad-Bestand mit Entscheidung
  (gerettet/verworfen je Fund).
- Kein geretteter Fund existiert nur im Scratchpad — nach der Rettung liegt der Inhalt am
  SSOT-Ort, der Scratchpad-Eintrag ist abgeschrieben.

---

*Angelegt 2026-08-23 (Bauplan „Scratchpad-Norm", Spec-Nachtrag 2026-08-23) — lebender
Standardprozess; Änderungen folgen dem Aktualisierungs-Index, Zeile „Konvention/Prozess
geändert".*
