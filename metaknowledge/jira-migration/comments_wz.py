# Traegt EP-Kommentare an den zugehoerigen WZ-Vorgaengen nach (REST v3).
# Aufruf: python comments_wz.py <mcp-export-json>
# Env: JIRA_SITE, JIRA_EMAIL, JIRA_API_TOKEN
# Idempotent ueber comments-map.json (EP-Kommentar-ID -> WZ-Kommentar-ID).
import json
import os
import sys
import time

from import_wz import api, md_to_adf

MAP_PATH = "comments-map.json"


def provenance(author, created):
    """Kopfzeile, die Urheber und Originaldatum des Kommentars erhaelt."""
    stamp = created[:10] if created else "unbekannt"
    return {
        "type": "paragraph",
        "content": [{
            "type": "text",
            "text": f"[Migriert aus EP - {author}, {stamp}]",
            "marks": [{"type": "em"}],
        }],
    }


def main(export_json):
    nodes = json.load(open(export_json, encoding="utf-8"))["issues"]["nodes"]
    key_map = json.load(open("created-map.json", encoding="utf-8"))
    done = {}
    if os.path.exists(MAP_PATH):
        done = json.load(open(MAP_PATH, encoding="utf-8"))

    todo = []
    for node in nodes:
        comments = (node["fields"].get("comment") or {}).get("comments") or []
        for c in comments:
            todo.append((node["key"], c))
    print(f"{len(todo)} Kommentare auf {len({t[0] for t in todo})} Vorgaengen")

    posted = 0
    for ep_key, c in todo:
        cid = f"{ep_key}#{c['id']}"
        if cid in done:
            continue
        wz_key = key_map.get(ep_key)
        if not wz_key:
            print(f"  WARN: kein WZ-Ziel fuer {ep_key}")
            continue
        adf = md_to_adf(c.get("body")) or {
            "type": "doc", "version": 1,
            "content": [{"type": "paragraph", "content": [{"type": "text", "text": "(leer)"}]}],
        }
        author = (c.get("author") or {}).get("displayName") or "unbekannt"
        adf["content"] = [provenance(author, c.get("created"))] + adf["content"]
        res = api("POST", f"/rest/api/3/issue/{wz_key}/comment", {"body": adf})
        done[cid] = f"{wz_key}#{res['id']}"
        with open(MAP_PATH, "w", encoding="utf-8") as f:
            json.dump(done, f, indent=1)
        posted += 1
        print(f"{ep_key} -> {wz_key} (Kommentar {res['id']})")
        time.sleep(0.3)

    print(f"FERTIG: {posted} neu, {len(done)} gesamt")


if __name__ == "__main__":
    main(sys.argv[1])
