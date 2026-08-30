# Kern-SSOT-Aufbau — Standardprozess (mit Plugin-Verknüpfungsvorbereitung)

> **Geistiges Eigentum:** Methode und generischer Prozess sind Eigentum von **NovaCore
> (Lucas Vöhringer)**; das OS entstand nicht im Rahmen von Onsite — **Onsite.ai-OS ist die
> erste umgesetzte Instanz** und dient hier als durchgeführtes Beispiel. Gesammelt wird dieses
> Dokument (wie alle generischen Prozessdokumente) in diesem Dev-Repo (private Org des
> Autors); **vor dem Live-Gang in eine Firmen-Org wird es extrahiert** (Folgeplan; vorher die
> schriftliche IP-Vereinbarung — Phasenmodell/IP-Grenze §4, A2).
>
> **Status: lebendes Teilwerk** (2026-08-09). Die Struktur-Ebene ist entschieden und gelebt;
> die markierten **Andockpunkte** füllen sich aus den Arbeitspaketen AP1–AP4 des
> SSOT-Abstufungs-Bauplans (`Bauplan-archiv/2026-08-09-ssot-abstufung-konzeption.md`) — Offenes ist offen
> markiert, nichts erfunden.
> **Kette:** neue Abteilungs-SSOT/-Plugin geplant (`abteilungs-plugin-bau.md`) → **dieser Prozess** → `queue-flow.md` (Promotion-Pipeline)

## 1. Zielbild

Die SSOT ist die Wissensinfrastruktur des OS: **alle** Wissenssammlungen, mit denen es
kooperiert, **plus** deren Orchestrierung und Automatisierung (normative Begriffsquelle:
`project-meta-infos/Onsite.ai-OS-SSOT-Definition.md`). Sie ist **zweistufig** (Spec §15.24):
Die **Kern-SSOT** trägt firmenrelevante und neutrale Inhalte — bewusst kompakt, auf Effizienz
fixiert; die **Abteilungs-SSOTs** dokumentieren vollständig. Verbindungsregel (präzisiert im
Spec-Nachtrag 2026-08-25): **„Kern verdichtet und verweist, Abteilung dokumentiert
vollständig"** — der Kern trägt je beförderter Sache ein **konzentriertes Fakten-Dokument** mit
auflösbarer Fundstelle, nie eine Volltext-Kopie und nie das umgezogene Original; die
Abteilungs-SSOT bleibt privat, Zugriff auf das Vollprotokoll wird bei Bedarf angefragt.

## 2. Grundbausteine (destilliert aus der ersten Instanz)

| # | Baustein | Zweck | Onsite-Beispiel |
|---|---|---|---|
| 1 | **Grundkategorien** mit Aufnahme-/Ablehnungsregel und Lebenszyklus je Ordner | jede Datei hat genau einen richtigen Ort | Enzyklopädie/Meta · Aktive Baupläne · Bauplan-Archiv · Ideen-Backlog · Standardprozesse · Fremdsystem-Manuals · Protokolle |
| 2 | **Master-Dokumenten-Index** — Teil 1 Routing („wohin gehört es"), Teil 2 Triage („relevant wenn …"); einziges Dokument auf der Wurzelebene | Einstieg ohne Volltext-Lektüre; keine zweite Dateiliste (Doppelpflege = Drift-Quelle) | `SSOT-Document-Index.md` |
| 3 | **Änderungs-Matrix** — je Änderungsart: Pflichtlektüre vorher, Nachzüge in derselben Änderung, Mechanik (Version/Release/Protokolle) + Selbsttest | die Nachschlageliste gegen Vergessen; neue Änderungsart = neue Zeile | `Aktualisierungs-Index.md` |
| 4 | **Zwei append-only-Protokolle**: eigene Fehler (mit Präventionsregel) und gefundene Bugs | Lernen der KI aus eigenen Fehlern; Symptom-Abgleich vor neuer Fehlersuche | `agent-learnings.md` · `debug-log.md` |
| 5 | **Norm / Ist / Plan getrennt**: Norm-Dokument nur per Nachtrag änderbar (jüngster gewinnt) · Ist-Inventur des Gebauten · Planungsdokumente mit Lebenszyklus | Widersprüche werden entscheidbar (Quellen-Hierarchie) statt unsichtbar | Design-Spec (+§-Nachträge) · Betriebshandbuch · Roadmap/Baupläne |
| 6 | **Mechanische Wächter**: Test-Invarianten (Index-Vollständigkeit, Linkgültigkeit, Wurzel-Regel, Versions-Gleichstand) + CI | erzwingen, was erzwingbar ist — der Rest steht im Matrix-Selbsttest | `struktur.test.mjs`, `ci.yml` |
| 7 | **Rituale mit Erzwingung**: Pflicht-Einstieg + Sitzungsabschluss als Skills, technisch gestützt durch Gates | die SSOT wird gelesen und gepflegt, nicht nur besessen | `/oai:start` + Start-Gate (§15.25) · `end-session` (§15.27, in Bau) |

## 3. Aufbau-Ablauf

1. **Kategorien + Routing zuerst** (Index Teil 1 vor jedem Inhalt): Ablageregeln definieren,
   bevor Dateien entstehen — nachträgliches Routing ist der teuerste Umbau.
2. **Master-Index anlegen und sofort testerzwingen** (Wächter vor Wachstum): jede Wissensdatei
   braucht ihre Index-Zeile in derselben Änderung, kein Eintrag zeigt ins Leere.
3. **Protokolle anlegen** — Format im Dateikopf, append-only-Regel ausdrücklich (nie
   rückdatieren, nie umschreiben).
4. **Änderungs-Matrix aufsetzen** und als selbst-normativ markieren (ihre eigene Pflegeregel:
   neue Änderungsart → neue Zeile, sonst beginnt die Drift von Neuem).
5. **Norm-Dokument mit Nachtrags-Prinzip** einführen; Versions-Spiegelstellen minimal halten
   und **jede** in der Matrix listen (gelernte Drift-Serie: vier Belegfälle in einer Instanz).
6. **Rituale verankern:** Einstiegs-Skill + Erzwingungs-Gate, Abschluss-Skill sowie eine
   Abschluss-Checkliste mit **benanntem Träger** (mechanischer Teil in der CI, Rest im
   Review — §15.43: eine Checkliste ohne Träger ist ein Appell); die Einstiegs-Injektion
   nennt den lebenden Stand, nie statische Regeln doppelt.
7. **Verifikation:** Suite grün · jeder Pfad im Index · Matrix-Selbsttest („habe ich etwas
   vergessen?") · keine Behauptung ohne Gegenprobe.

## 4. Plugin-Verknüpfungsvorbereitung (die Andockpunkte)

Die Kern-SSOT wird so gebaut, dass Abteilungs-Plugins später **andocken statt umbauen**:

| Andockpunkt | Kontrakt | Stand / Detail aus |
|---|---|---|
| **Struktur-Vererbung** | Jede Abteilungs-SSOT übernimmt die Grundkategorien, einen eigenen Master-Index und die Protokolle — das Kern-Muster ist die Vorlage | **entschieden + erstmals vollzogen** (Satellit `oai-marketing` v0.2.0, §15.24 E1) |
| **Kandidaten-Queue** | Reservierter append-only-Ablageort je Abteilungs-SSOT (Felder: Datum · Einzeiler · Verweis · erfülltes Kriterium · Status); in die Kern-SSOT schreibt allein der Promotions-PR aus `/oai:queue-kern` — und erst nach dem Merge durch den Menschen | Format + Kriterienliste aus **AP1**; Flow normiert in **§15.36** |
| **Promotion-Pipeline** | sofort klassifizieren (end-session, Kriterienliste) · `/oai:queue-abteilung` bündelt wöchentlich zum Abteilungs-PR · `/oai:queue-kern` prüft die gemergte Queue (Kriterien + No-Duplicate) und stellt den Promotions-PR · **kuratiert wird im GitHub-Review des Menschen — es gibt keinen Kurations-Skill** (§15.36.1) · Sofort-Pfad hart begrenzt (Major-Bug teamweit · Sicherheitsvorfall · Release/Tag · Rote-Linien-Verstoß) | entschieden (§15.24 E2), Flow normiert in **§15.36** |
| **„Kern verdichtet und verweist"-Regel** | Kern-Eintrag = **konzentriertes Fakten-Dokument** (firmenweit handlungsnötige Fakten, Datum + Herkunftsabteilung im Kopf, auflösbare Fundstelle in der Abteilung) — nie Volltext-Kopie, nie Umzug; Doppelpflege-Verbot bleibt, weil Belege und Herleitung nur in der Abteilung liegen; ändert sich ein beförderter Fakt, läuft er erneut durch die Queue | **entschieden** (§15.24 E3, präzisiert im Spec-Nachtrag 2026-08-25) |
| **Cross-Abteilungs-Zugriff** | Abteilungs-SSOTs bleiben **privat**; das Vollprotokoll hinter einem Fakten-Dokument wird **auf Anfrage** bei der Abteilung bzw. dem Repo-Owner gelesen — kein Standing-Read, kein Zweit-Plugin, kein Lokal-Klon (wahrt Verteilannahme und Gate-Logik §15.22); bei fehlendem Zugriff definierte Antwort statt Raten | Richtung entschieden (§15.24 E6, umgedeutet im Spec-Nachtrag 2026-08-25); Anfrageweg = **AP3** in neuer Deutung, Bau offen |
| **Arbeits-Repo-Journale** | eigene Kategorie/Pfad-Nennung im Master-Index + eigene Promotion-Regeln (anderes Wissen als Repo-Doku); angrenzende Ströme (z. B. Ticket-Ordner) miterfassen | Regeln aus **AP2** |
| **Pflege-Werkzeuge** | Maintenance-Skills/Hooks des Kerns; Anti-Drift zweistufig: deterministisch (Test/end-session-Check) + semantischer Prüf-Subagent, dessen Wiedervorlage seit §15.36 am `queue-kern`-Bau hängt (der Kurationslauf, an dem er ursprünglich hing, entsteht nie) | aus **AP4** + Backlog-Idee `2026-08-10-anti-drift-architektur-konsolidiert.md` (konsolidiert die Alt-Idee 2026-08-09, jetzt im `Bauplan-archiv/`) |

## 5. Tragende Anti-Drift-Prinzipien

- **Eine Quelle je Fakt**; abgeleitete Dokumente deklarieren sich als abgeleitet — bei
  Widerspruch gewinnt die Quelle, nie die Ableitung.
- **Historisch bleibt historisch**: Protokolle, Archiv und Norm-Alttext werden nie rückwirkend
  umgeschrieben; nachgezogen werden nur lebende Dokumente.
- **Gleicher Change, gleiche Pflege**: Nachzüge passieren in derselben Änderung — „später"
  ist der Anfang jeder Drift.
- **Mechanisch erzwingen, was erzwingbar ist**; der Rest steht als Selbsttest in der Matrix.
- **Keine Behauptung ohne Gegenprobe** — „behoben"/„grün" nur mit gesehener Ausgabe.

## 6. Replikation für eine neue Instanz

1. Grundkategorien ans Firmenwissen anpassen (umbenennen ja, Prinzip je Kategorie beibehalten).
2. Vorhandene Wissensquellen (Confluence, Wikis, Laufwerke) über **Fremdsystem-Manuals
   anbinden**, nicht kopieren — die SSOT orchestriert Quellen, sie dupliziert sie nicht.
3. Indizes und Wächter **ab Tag 1** (Schritte 1–2 vor jedem Inhalt).
4. Die Onsite-Instanz ist die Referenz für Reihenfolge, Formate und die belegten Fehlerbilder
   (Drift-Serie, Park-Zustände, Doppelpflege).

---

*Angelegt 2026-08-09 durch Claude (Fable 5, Claude Code) auf Weisung Lucas Vöhringer.
Generischer NovaCore-Prozess, destilliert aus der ersten Instanz; wächst mit AP1–AP4.
Extraktion vor Live-Gang: Folgeplan `Bauplan-archiv/2026-08-09-folgeplan-nach-kern-abschluss.md`.*
