# Traegt EP-Vorgangsverknuepfungen an den WZ-Gegenstuecken nach (REST v3).
# Aufruf: python links_wz.py
# Env: JIRA_SITE, JIRA_EMAIL, JIRA_API_TOKEN
# Idempotent ueber links-map.json (EP-Paar -> angelegt).
import json
import os
import time

from import_wz import api

MAP_PATH = "links-map.json"


def main():
    pairs = json.load(open("links.json", encoding="utf-8"))
    key_map = json.load(open("created-map.json", encoding="utf-8"))
    done = json.load(open(MAP_PATH, encoding="utf-8")) if os.path.exists(MAP_PATH) else {}

    available = {t["name"] for t in api("GET", "/rest/api/3/issueLinkType")["issueLinkTypes"]}
    missing = {t for _, t, _ in pairs} - available
    if missing:
        raise SystemExit(f"Link-Typ im Ziel nicht vorhanden: {sorted(missing)}")

    created = 0
    for src, ltype, dst in pairs:
        ident = f"{src}|{ltype}|{dst}"
        if ident in done:
            continue
        wz_src, wz_dst = key_map.get(src), key_map.get(dst)
        if not (wz_src and wz_dst):
            print(f"  WARN: kein WZ-Ziel fuer {src} oder {dst}")
            continue
        api("POST", "/rest/api/3/issueLink", {
            "type": {"name": ltype},
            "outwardIssue": {"key": wz_dst},
            "inwardIssue": {"key": wz_src},
        })
        done[ident] = f"{wz_src}|{ltype}|{wz_dst}"
        with open(MAP_PATH, "w", encoding="utf-8") as f:
            json.dump(done, f, indent=1)
        created += 1
        print(f"{src} {ltype} {dst}  ->  {wz_src} {ltype} {wz_dst}")
        time.sleep(0.3)

    print(f"FERTIG: {created} neu, {len(done)} gesamt")


if __name__ == "__main__":
    main()
