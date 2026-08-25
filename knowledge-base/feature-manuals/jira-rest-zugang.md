# Jira-REST-Zugang (Zeiger, kein Secret)

> **Herkunft:** Sitzungsnotiz 2026-08-24 (Nachtschicht Jira-Migration), am 2026-08-25 als
> Fremdsystem-Manual in die Wissensbasis übernommen (Kategorie `feature-manuals/`,
> Onsite-Parität). Zeiger auf Zugangsweg und Site-Zuordnung — enthält kein Secret.

Stand: 2026-08-24 — angelegt nach der Nachtschicht „Plan v2 & Architektur Review".

- **Token-Ablage:** Windows-User-Umgebungsvariable `JIRA_API_TOKEN` (per `setx` gesetzt).
  Niemals den Token selbst in Dateien, Repo, Commits oder Konversation schreiben.
- **Rotation:** Der Token rotiert regelmäßig (Maintainer-Entscheid). Nach jeder Rotation
  muss `setx JIRA_API_TOKEN "<neuer-token>"` erneut ausgeführt werden — alter Wert wird
  überschrieben. Bei 401-Antworten zuerst prüfen, ob eine Rotation stattfand.
- **Nutzung:** Atlassian REST API v3, Basic Auth = `email:token` (Base64).
  Beispiel: `curl -u "$JIRA_EMAIL:$JIRA_API_TOKEN" "https://<site>.atlassian.net/rest/api/3/..."`
- **Hinterlegt (2026-08-24, verifiziert via `/rest/api/3/myself`):**
  `JIRA_EMAIL` = lucas.voehringer@novacore-ai.dev · `JIRA_SITE` = https://novacore-ai-team.atlassian.net
  (beide als User-Umgebungsvariablen per `setx`).
- **Neues Hauptprojekt dort:** `SCRUM` („Novacore-OS") — 60 Tickets (8 Epics E1–E8,
  52 Tasks als B-/M-Nummern), angelegt in der Nacht 2026-08-24 ~05:16 Uhr (lokal).
- **Kontext (korrigiert 2026-08-25):** Die beiden Sites sind ueber verschiedene Wege erreichbar,
  und die Zuordnung ist genau umgekehrt zur urspruenglichen Notiz:
  - `novacore-ai.atlassian.net` (EP, NC, NCOS): **nur ueber den Atlassian-MCP**. Der
    `JIRA_API_TOKEN` gilt dort NICHT (`/myself` -> 401, `BROWSE_PROJECTS: false`) — das
    Konto ist auf dieser Site kein Mitglied. cloudId `4b7443ff-fe4b-4c2e-9eb6-9971270c3138`.
  - `novacore-ai-team.atlassian.net` (SCRUM, WZ): **nur per REST** mit `JIRA_API_TOKEN`.
    cloudId `e5651757-dcc3-42ca-82bd-14b792145354`.
  - Der MCP-Connector gibt offenbar immer nur EINE Site frei. Nach `/mcp` -> atlassian ->
    Re-Authenticate zeigt `getAccessibleAtlassianResources`, welche gerade gilt; ein Wechsel
    kostet eine erneute Freigabe. Fuer Site-uebergreifende Arbeit: Quelle per MCP lesen,
    Ziel per REST schreiben — so lief die EP->WZ-Migration.
- **Hinweis 2026-08-24:** Der initiale Token stand einmal im Klartext in einer
  Konversation — bei nächster Gelegenheit rotieren (war ohnehin geplant).
