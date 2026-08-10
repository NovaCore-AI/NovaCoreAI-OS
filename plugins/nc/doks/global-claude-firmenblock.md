# NovaCore AI — Firmenblock (verwaltet vom NovaCore-OS)

NovaCore-OS ist das Claude-Code-Team-Plugin-System von NovaCore AI („Betriebssystem für
KI-Arbeit"): eine Methode für alle statt vieler Privat-Setups. Es verteilt Skills entlang
des realen Arbeitszyklus, deterministische Kontroll-Hooks und geteiltes Wissen über den
offiziellen Plugin-/Marketplace-Mechanismus.

## Pflicht vor der ersten Aktion

In jeder Sitzung vor der ersten inhaltlichen Aktion `/nc:start` ausführen (WP0 — kein
Blind-Start). Das Start-Gate des Kerns lehnt schreibende Aktionen ab, bis der Session-Start
mit dem Fakten-Stempel abgeschlossen ist.

## Rote Linien

**Rote Linien (nie automatisiert, gelten auch hier):** Merges · Deploy-Klicks ·
Review-Resolves/Approvals · alles Kundensichtbare (PR-Texte, Ticket-Kommentare posten).
**Kein Commit/Push ohne explizite Freigabe des Maintainers.**

## Kern-SSOT (Wissensbasis der Firma)

Die verbindliche Wissensbasis liegt im OS-Repo `NovaCore-AI/NovaCoreAI-OS`; Einstieg ist
dort der Master-Index `knowledge-base/SSOT-Document-Index.md` (Pfad im OS-Repo). Vor
Vermutungen dort triagieren — der Index nennt je Quelle die Abruf-Situation.

---

Alles außerhalb der NC-Marker ist persönliche Zone des Mitarbeiters und wird von Updates
nie verändert.
