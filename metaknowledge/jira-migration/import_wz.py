# Importiert EP-Export-JSONs (Markdown-Beschreibungen) nach Jira WZ via REST v3.
# Aufruf: python import_wz.py <export-dir>
# Env: JIRA_SITE, JIRA_EMAIL, JIRA_API_TOKEN
import json
import os
import re
import sys
import time
import urllib.request

SITE = os.environ["JIRA_SITE"].rstrip("/")
AUTH = (os.environ["JIRA_EMAIL"], os.environ["JIRA_API_TOKEN"])

STATUS_MAP = {
    "Zu erledigen": "Zu erledigen",
    "In Arbeit": "In Arbeit",
    "Code-Review": "Wird überprüft",
    "Erledigt": "Fertig",
}


def api(method, path, body=None):
    import base64

    req = urllib.request.Request(SITE + path, method=method)
    req.add_header(
        "Authorization",
        "Basic " + base64.b64encode(f"{AUTH[0]}:{AUTH[1]}".encode()).decode(),
    )
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()[:500]}")


# ---------- Markdown -> ADF ----------

def parse_inline(text):
    """Erzeugt ADF-Inline-Nodes mit **bold** und `code` Marks."""
    nodes = []
    pattern = re.compile(r"(\*\*.+?\*\*|`.+?`)")
    for part in pattern.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            nodes.append(
                {"type": "text", "text": part[2:-2], "marks": [{"type": "strong"}]}
            )
        elif part.startswith("`") and part.endswith("`") and len(part) > 2:
            nodes.append(
                {"type": "text", "text": part[1:-1], "marks": [{"type": "code"}]}
            )
        else:
            nodes.append({"type": "text", "text": part})
    return nodes or [{"type": "text", "text": ""}]


def md_to_adf(md):
    if not md:
        return None
    md = md.replace("\\~", "~").replace("\\_", "_")
    content = []
    para = []

    def flush_para():
        if para:
            text = " ".join(para).strip()
            if text:
                content.append({"type": "paragraph", "content": parse_inline(text)})
            para.clear()

    lines = md.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()
        if not stripped:
            flush_para()
            i += 1
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            flush_para()
            content.append(
                {
                    "type": "heading",
                    "attrs": {"level": len(m.group(1))},
                    "content": parse_inline(m.group(2)),
                }
            )
            i += 1
            continue
        mb = re.match(r"^[*-]\s+(.*)$", stripped)
        mn = re.match(r"^\d+[.)]\s+(.*)$", stripped)
        if mb or mn:
            flush_para()
            ordered = mn is not None
            items = []
            while i < len(lines):
                s = lines[i].strip()
                mm = re.match(r"^(\d+[.)]|[*-])\s+(.*)$", s)
                if not mm:
                    break
                items.append(
                    {
                        "type": "listItem",
                        "content": [
                            {"type": "paragraph", "content": parse_inline(mm.group(2))}
                        ],
                    }
                )
                i += 1
            content.append(
                {
                    "type": "orderedList" if ordered else "bulletList",
                    "attrs": {"order": 1} if ordered else {},
                    "content": items,
                }
            )
            continue
        para.append(stripped)
        i += 1
    flush_para()
    if not content:
        return None
    return {"type": "doc", "version": 1, "content": content}


# ---------- Import ----------

def load_issues(export_dir):
    issues = []
    for name in sorted(os.listdir(export_dir)):
        if not name.endswith(".json"):
            continue
        with open(os.path.join(export_dir, name), encoding="utf-8") as f:
            issues.extend(json.load(f))
    # nach Issue-Nummer sortieren
    issues.sort(key=lambda x: int(x["key"].split("-")[1]))
    return issues


def create_issue(issue, parent_wz_key):
    fields = {
        "project": {"key": "WZ"},
        "summary": issue["summary"],
        "issuetype": {"name": issue["issuetype"]},
    }
    adf = md_to_adf(issue.get("description"))
    if adf:
        fields["description"] = adf
    # WZ ist team-managed und hat kein Prioritaetsfeld (per createmeta geprueft).
    # High wird deshalb als Label erhalten, Medium ist der Default und entfaellt.
    labels = list(issue.get("labels") or [])
    if issue.get("priority") == "High":
        labels.append("prio-high")
    if labels:
        fields["labels"] = labels
    if issue.get("duedate"):
        fields["duedate"] = issue["duedate"]
    if parent_wz_key:
        fields["parent"] = {"key": parent_wz_key}
    res = api("POST", "/rest/api/3/issue", {"fields": fields})
    return res["key"]


def set_status(wz_key, target_status):
    if target_status == "Zu erledigen":
        return  # Default nach Erstellung
    transitions = api("GET", f"/rest/api/3/issue/{wz_key}/transitions")["transitions"]
    for t in transitions:
        if t["to"]["name"] == target_status:
            api("POST", f"/rest/api/3/issue/{wz_key}/transitions",
                {"transition": {"id": t["id"]}})
            return
    print(f"  WARN: kein Übergang nach '{target_status}' für {wz_key}")


def main(export_dir):
    issues = load_issues(export_dir)
    print(f"{len(issues)} Issues geladen")
    key_map = {}
    map_path = os.path.join(export_dir, "..", "created-map.json")
    if os.path.exists(map_path):
        with open(map_path, encoding="utf-8") as f:
            key_map = json.load(f)

    def save_map():
        with open(map_path, "w", encoding="utf-8") as f:
            json.dump(key_map, f, indent=1)

    # Pass 1: Epics
    for issue in issues:
        if issue["issuetype"] != "Epic" or issue["key"] in key_map:
            continue
        wz = create_issue(issue, None)
        key_map[issue["key"]] = wz
        save_map()
        print(f"Epic {issue['key']} -> {wz}")
        time.sleep(0.3)

    # Pass 2: Rest mit Parent
    for issue in issues:
        if issue["issuetype"] == "Epic" or issue["key"] in key_map:
            continue
        parent_ep = issue.get("parent")
        parent_wz = key_map.get(parent_ep) if parent_ep else None
        wz = create_issue(issue, parent_wz)
        key_map[issue["key"]] = wz
        save_map()
        print(f"{issue['issuetype']} {issue['key']} -> {wz} (parent {parent_wz})")
        time.sleep(0.3)

    # Pass 3: Status setzen
    for issue in issues:
        wz = key_map.get(issue["key"])
        if not wz:
            continue
        target = STATUS_MAP.get(issue["status"], "Zu erledigen")
        set_status(wz, target)
        print(f"Status {wz} -> {target}")
        time.sleep(0.2)

    print(f"FERTIG: {len(key_map)} Issues angelegt")


if __name__ == "__main__":
    main(sys.argv[1])
