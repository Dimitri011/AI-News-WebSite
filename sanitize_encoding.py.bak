# -*- coding: utf-8 -*-
# Sanitize project files: remove special quotes/dashes, strip accents, save as UTF-8.

from pathlib import Path
import unicodedata

ROOT = Path(__file__).resolve().parent
EXCLUDE_DIRS = {".venv", "__pycache__", ".git", "media", "staticfiles"}
EXTS = {".py", ".html", ".css", ".js", ".json", ".txt"}

# map a few common special characters to plain ASCII
REPLACEMENTS = {
    "\u2018": "'",  # left single quote
    "\u2019": "'",  # right single quote
    "\u201c": '"',  # left double quote
    "\u201d": '"',  # right double quote
    "\u2013": "-",  # en dash
    "\u2014": "-",  # em dash
    "\u2022": "*",  # bullet
    "\u00a0": " ",  # non-breaking space
}

def is_text_file(p: Path) -> bool:
    return p.suffix.lower() in EXTS

def clean_text(text: str) -> str:
    # replace common typographic chars
    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)
    # normalize and strip accents
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    # normalize newlines
    return text.replace("\r\n", "\n").replace("\r", "\n")

def process_file(p: Path) -> bool:
    try:
        raw = p.read_bytes()
        try:
            original = raw.decode("utf-8")
        except UnicodeDecodeError:
            original = raw.decode("latin-1", errors="ignore")
        new = clean_text(original)
        if new != original:
            bak = p.with_suffix(p.suffix + ".bak")
            if not bak.exists():
                bak.write_bytes(raw)  # one-time backup
            p.write_text(new, encoding="utf-8", newline="\n")
            print(f"[CLEAN] {p.relative_to(ROOT)}")
            return True
        return False
    except Exception as e:
        print(f"[SKIP]  {p} -> {e}")
        return False

changed = 0
for path in ROOT.rglob("*"):
    if any(part in EXCLUDE_DIRS for part in path.parts):
        continue
    if path.is_file() and is_text_file(path):
        if process_file(path):
            changed += 1

print(f"\nDone. Files cleaned: {changed}")
