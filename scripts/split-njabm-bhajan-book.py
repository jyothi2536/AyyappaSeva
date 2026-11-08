"""Split the NJABM bhajan book into one PDF per song under song-library/njabm plus manifest.json (usage: python3 split-njabm-bhajan-book.py book.pdf)."""
import json, os, re, sys, pypdf
import pymupdf
src = sys.argv[1]
d = os.path.join(os.path.dirname(__file__), "..", "song-library", "njabm") + "/"
os.makedirs(d, exist_ok=True)
r = pypdf.PdfReader(src)
book = pymupdf.open(src)
OFFSET = 13
SECTIONS = {  # letter: (name, first pdf page, last pdf page)
 "A": ("Ganapathy", 14, 24), "B": ("Guru", 25, 35), "C": ("Saraswathy", 36, 42),
 "D": ("Murugan", 43, 73), "E": ("Sivan", 74, 84), "F": ("Amman / Devi", 85, 101),
 "G": ("Ramar", 102, 113), "H": ("Krishnan", 114, 149), "I": ("Ayyappan", 150, 255),
 "J": ("Ayyappan - Other Recitals", 256, 267), "K": ("Hanuman", 268, 272),
}
txt = "\n".join((r.pages[i].extract_text() or "") for i in range(1, 12))
sec = None; songs = []
for line in txt.split("\n"):
    line = line.strip()
    m = re.match(r"^([A-L])\.\s+(.+?)[\s\.]*?\s+(\d+)\s*$", line)
    if m: sec = m.group(1); continue
    m = re.match(r"^(\d+)\.\s+(.+?)[\s\.]{3,}\s*(\d+)\s*$", line)
    if m and sec in SECTIONS:
        songs.append([sec, int(m.group(1)), m.group(2).strip(), int(m.group(3)) + OFFSET])
def title_y(page_no, n):
    """Top y of the block that starts with "N." on the given 1-based page, or None."""
    for blk in book[page_no - 1].get_text("blocks"):
        s = re.sub(r"\s+", " ", blk[4]).strip()
        if s.startswith(f"{n}. "):
            return blk[1]
    return None
entries = []
seen = {}
for i, (sec, n, title, start) in enumerate(songs):
    nxt = songs[i + 1] if i + 1 < len(songs) and songs[i + 1][0] == sec else None
    last = SECTIONS[sec][2]
    bottom = None
    if nxt:
        ny = title_y(nxt[3], nxt[1])
        if ny is not None and ny > 90:
            end, bottom = min(nxt[3], last), ny - 6   # next song starts mid-page
        else:
            end = max(start, min(nxt[3] - 1, last))
    else:
        end = last
    end = max(start, end)
    sy = title_y(start, n)
    top = sy - 8 if sy is not None and sy > 90 else None
    seen[(sec, n)] = seen.get((sec, n), 0) + 1
    fid = f"{sec}{n:03d}" + ("x" if seen[(sec, n)] > 1 else "")
    fn = f"njabm-{fid}-tamil.pdf"
    part = pymupdf.open()
    part.insert_pdf(book, from_page=start - 1, to_page=end - 1)
    for idx, pg in enumerate(part):
        h = pg.rect.height
        t0 = top if (idx == 0 and top is not None) else 0
        b0 = bottom if (idx == len(part) - 1 and bottom is not None) else h
        if t0 > 0 or b0 < h:
            pg.set_cropbox(pymupdf.Rect(0, t0, pg.rect.width, b0))
    part.save(os.path.join(d, fn), garbage=4, deflate=True)
    entries.append({"id": f"njabm-{fid}", "title": title, "section": SECTIONS[sec][0], "start": start, "end": end, "file": fn})
DEITY = {"A": "ganesh", "B": "guru", "D": "murugan", "E": "shiva", "F": "durga", "I": "ayyappa", "J": "ayyappa"}
manifest = []
for k, e in enumerate(entries):
    manifest.append({
        "id": e["id"], "title": e["title"], "section": e["section"],
        "deity": DEITY.get(e["id"].split("-")[1][0], "other"), "lang": "ta",
        "file": e["file"], "size": os.path.getsize(d + e["file"]), "order": k,
    })
json.dump(manifest, open(os.path.join(d, "..", "manifest.json"), "w"), ensure_ascii=False, indent=1)
print(len(manifest))
