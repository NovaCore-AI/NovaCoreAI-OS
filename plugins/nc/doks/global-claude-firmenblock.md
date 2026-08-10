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

Die verbindliche Wissensbasis ist das OS-Repo `NovaCore-AI/NovaCoreAI-OS`. Es liegt **lokal
geklont** unter:

```
~/.nc/ssot/NovaCoreAI-OS/
```

Dieses Verzeichnis IST das OS-Repo (vollständiger Klon).
**Einstieg ist dort** `knowledge-base/SSOT-Document-Index.md` — der Master-Index nennt je
Quelle die Abruf-Situation. Vor Vermutungen dort triagieren.
Alle Pfadangaben der Skills, die sich auf das OS-Repo beziehen, sind relativ zu diesem
Verzeichnis zu lesen — solange nicht ohnehin im OS-Repo selbst gearbeitet wird.

Fehlt das Verzeichnis, ist die Wissensbasis auf diesem Rechner noch nicht bereitgestellt:
einmal `/nc:setup` ausführen. Bis dahin gilt — Aussagen, die die Wissensbasis bräuchten,
werden als **nicht belegbar** gekennzeichnet, nicht geraten.

---

Alles außerhalb der NC-Marker ist persönliche Zone des Mitarbeiters und wird von Updates
nie verändert.
