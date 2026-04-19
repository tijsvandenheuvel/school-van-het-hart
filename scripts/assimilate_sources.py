#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import shutil
import string
import subprocess
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TMP_DIR = ROOT / "tmp" / "pdfs"
TESSDATA_DIR = TMP_DIR / "tessdata"
WIKI_SOURCES_DIR = ROOT / "wiki" / "sources"
WIKI_META_DIR = ROOT / "wiki" / "meta"
SOURCE_CATALOG_PATH = WIKI_META_DIR / "source-catalog.json"
SOURCE_INDEX_PATH = WIKI_META_DIR / "source-index.md"


@dataclass(frozen=True)
class SourceConfig:
    slug: str
    title: str
    summary: str
    path: Path
    kind: str
    rotation: int = 0
    links: tuple[str, ...] = ()


SOURCE_CONFIGS = (
    SourceConfig(
        slug="svhh-basisdoc-bron",
        title="SvHH basisdoc",
        summary="De oorspronkelijke projecttekst over visie, missie, functionaliteit en modelvorming van de School van het Hart.",
        path=ROOT / "docs" / "bronnen" / "svhh basisdoc.docx",
        kind="docx",
        links=("svhh basisdoc", "basisdoc", "projectbeschrijving"),
    ),
    SourceConfig(
        slug="svhh-visietekst-bron",
        title="SvHH visietekst",
        summary="De uitgewerkte visietekst rond overgang, nieuwe wereld, samenleven en de School van het Hart als levende leerschool.",
        path=ROOT / "docs" / "bronnen" / "svhh visietekst.docx",
        kind="docx",
        links=("svhh visietekst", "visietekst", "school van het hart visietekst"),
    ),
    SourceConfig(
        slug="excalibur-bron",
        title="Excalibur",
        summary="De gescande bron over het ontkende woord, karmische ontketening, taalgebruik en letter- of alfabetische orde.",
        path=ROOT / "docs" / "bronnen" / "Excalibur scan A4.pdf",
        kind="pdf",
        links=("excalibur", "ex cal i bur", "het ontkende woord"),
    ),
    SourceConfig(
        slug="boek-der-geruststelling-bron",
        title="Het boek der geruststelling",
        summary="De gescande bron over bevrijdingsgeschrift, hartstaal, woordenschat, spraakkunst en holistisch geometrisch taalgebruik.",
        path=ROOT / "docs" / "bronnen" / "Het boek der geruststelling A4.pdf",
        kind="pdf",
        rotation=90,
        links=("boek der geruststelling", "het boek der geruststelling", "geruststelling"),
    ),
)


def run_command(*args: str, capture: bool = True) -> str:
    result = subprocess.run(
        args,
        check=True,
        cwd=ROOT,
        text=True,
        capture_output=capture,
    )
    return result.stdout if capture else ""


def slugify(value: str) -> str:
    normalized = value.lower().replace("&", " en ")
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return re.sub(r"-{2,}", "-", normalized).strip("-")


def normalize_term(value: str) -> str:
    lowered = value.lower().replace("&", " en ")
    lowered = lowered.replace("’", "").replace("'", "")
    lowered = re.sub(r"[^a-z0-9]+", " ", lowered)
    return re.sub(r"\s+", " ", lowered).strip()


def ensure_dirs() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    TESSDATA_DIR.mkdir(parents=True, exist_ok=True)
    WIKI_SOURCES_DIR.mkdir(parents=True, exist_ok=True)
    WIKI_META_DIR.mkdir(parents=True, exist_ok=True)


def ensure_tessdata() -> None:
    ensure_dirs()
    nld_target = TESSDATA_DIR / "nld.traineddata"
    if not nld_target.exists():
        urllib.request.urlretrieve(
            "https://github.com/tesseract-ocr/tessdata_fast/raw/main/nld.traineddata",
            nld_target,
        )

    system_tessdata = Path("/opt/homebrew/share/tessdata")
    for filename in ("eng.traineddata", "osd.traineddata"):
        target = TESSDATA_DIR / filename
        source = system_tessdata / filename
        if target.exists() or not source.exists():
            continue
        target.symlink_to(source)


def pdf_page_count(path: Path) -> int:
    info = run_command("pdfinfo", str(path))
    match = re.search(r"^Pages:\s+(\d+)$", info, flags=re.MULTILINE)
    if not match:
        raise RuntimeError(f"Kon pagina-aantal niet lezen voor {path}")
    return int(match.group(1))


def render_pdf_pages(config: SourceConfig) -> list[Path]:
    render_dir = TMP_DIR / config.slug
    render_dir.mkdir(parents=True, exist_ok=True)
    prefix = render_dir / "page"
    page_count = pdf_page_count(config.path)
    run_command(
        "pdftoppm",
        "-r",
        "170",
        "-f",
        "1",
        "-l",
        str(page_count),
        "-png",
        str(config.path),
        str(prefix),
    )
    return sorted(render_dir.glob("page-*.png"))


def rotate_image(source: Path, rotation: int) -> Path:
    if rotation == 0:
        return source

    rotated_dir = TMP_DIR / f"{source.parent.name}-rot"
    rotated_dir.mkdir(parents=True, exist_ok=True)
    target = rotated_dir / f"{source.stem}-r{rotation}.png"
    if target.exists():
        return target

    run_command("sips", "-r", str(rotation), str(source), "--out", str(target))
    return target


def clean_ocr_text(text: str) -> str:
    text = text.replace("\x0c", "")
    text = text.replace("|", "I")
    text = text.replace("—", "-").replace("–", "-")
    text = re.sub(r"[ \t]+", " ", text)
    lines = [line.rstrip() for line in text.splitlines()]
    cleaned_lines: list[str] = []

    for raw in lines:
        line = raw.strip()
        if not line:
            cleaned_lines.append("")
            continue
        if re.fullmatch(r"[\W_]+", line):
            continue
        if re.fullmatch(r"\d{1,3}", line):
            continue
        cleaned_lines.append(line)

    compact: list[str] = []
    for line in cleaned_lines:
        if line == "":
            if compact and compact[-1] != "":
                compact.append("")
            continue
        compact.append(line)

    return "\n".join(compact).strip()


def ocr_image(image_path: Path) -> str:
    output = run_command(
        "tesseract",
        "--tessdata-dir",
        str(TESSDATA_DIR),
        str(image_path),
        "stdout",
        "-l",
        "nld+eng",
        "--psm",
        "6",
    )
    return clean_ocr_text(output)


def extract_docx_text(path: Path) -> str:
    raw = run_command("textutil", "-convert", "txt", "-stdout", str(path))
    return clean_ocr_text(raw)


def text_to_paragraphs(text: str) -> list[str]:
    paragraphs: list[str] = []
    buffer: list[str] = []

    def flush() -> None:
        if not buffer:
            return
        paragraph = " ".join(buffer)
        paragraph = re.sub(r"\s+", " ", paragraph).strip()
        if paragraph:
            paragraphs.append(paragraph)
        buffer.clear()

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            flush()
            continue
        heading_like = len(line) < 90 and (line.isupper() or re.fullmatch(r"[A-Z0-9 .,:;!?()'\-/]+", line))
        if heading_like:
            flush()
            paragraphs.append(line)
            continue
        if buffer and buffer[-1].endswith("-"):
            buffer[-1] = buffer[-1][:-1] + line
        else:
            buffer.append(line)

    flush()
    return [paragraph for paragraph in paragraphs if paragraph]


def paragraph_title(text: str, fallback: str) -> str:
    if len(text) <= 72 and text == text.upper():
        return text.title()
    cleaned = re.sub(r"\s+", " ", text).strip()
    if not cleaned:
        return fallback
    words = cleaned.split(" ")
    short = " ".join(words[:10]).strip(" ,.;:-")
    if len(words) > 10:
        short += "…"
    return short


def build_markdown_source(config: SourceConfig, pages_or_sections: list[tuple[str, list[str]]]) -> str:
    lines = [
        "---",
        f"title: {config.title}",
        f"summary: {config.summary}",
        "links:",
    ]
    for link in config.links:
        lines.append(f"  - {link}")
    lines.extend(
        [
            "entryType: text",
            f"sourceFile: {config.path.relative_to(ROOT)}",
            "---",
            "",
            f"# {config.title}",
            "",
            config.summary,
        ]
    )

    for heading, paragraphs in pages_or_sections:
        lines.extend(["", f"## {heading}"])
        for paragraph in paragraphs:
            lines.extend(["", paragraph])

    return "\n".join(lines).strip() + "\n"


def source_entry(config: SourceConfig, body: str) -> dict:
    return {
        "slug": config.slug,
        "title": config.title,
        "summary": config.summary,
        "body": body,
        "links": list(config.links),
        "kind": "source",
        "indexType": "text",
        "resolveAsTerm": False,
        "searchText": f"{config.title}\n{config.summary}\n{body}",
        "sourceFile": str(config.path.relative_to(ROOT)),
    }


def passage_entry(config: SourceConfig, page_label: str, index: int, paragraph: str) -> dict:
    title = paragraph_title(paragraph, f"{config.title} {page_label} #{index}")
    slug = slugify(f"{config.slug}-{page_label}-{index}-{title[:42]}")
    body = "\n".join(
        [
            f"# {title}",
            "",
            paragraph,
            "",
            f"Bron: {config.title} ({page_label}).",
        ]
    )
    return {
        "slug": slug,
        "title": title,
        "summary": f"Passage uit {config.title} ({page_label}).",
        "body": body,
        "links": [],
        "kind": "passage",
        "indexType": "passage",
        "resolveAsTerm": False,
        "searchText": f"{title}\n{paragraph}\n{config.title}\n{page_label}",
        "sourceSlug": config.slug,
        "sourcePage": page_label,
    }


def detect_letters(paragraph: str) -> set[str]:
    hits: set[str] = set()
    upper = paragraph.upper()

    for letter in string.ascii_uppercase:
        if re.search(rf"\b(HOOFDLETTER|LETTER)\s+{letter}\b", upper):
            hits.add(letter)
        if "ALPHAB" in upper and re.search(rf"\b{letter}\b", upper) and len(upper) < 500:
            hits.add(letter)

    if "AB-SOLUTIE" in upper:
        hits.update({"A", "B"})

    return hits


def build_letter_entries(letter_refs: dict[str, list[dict]]) -> list[dict]:
    entries = []
    for letter in string.ascii_uppercase:
        refs = letter_refs.get(letter, [])
        lines = [
            f"# {letter}",
            "",
            f"De letter {letter} staat in de taalbewuste letterindex van de School van het Hart. Deze pagina bundelt bronpassages waarin de letter, het alfabet of de beeldenorde van het schrift besproken worden.",
            "",
            "## Bronverwijzingen",
        ]

        if refs:
            for ref in refs[:8]:
                lines.append(f"- {ref['title']} ({ref['source']}, {ref['page']})")
        else:
            lines.append(f"- Nog geen expliciete bronpassage automatisch gematcht voor {letter}. Verdere handmatige annotatie uit Excalibur en Het boek der geruststelling blijft wenselijk.")

        lines.extend(
            [
                "",
                "## Gerelateerde wiki-ingangen",
                "",
                "- [[Taalbewustzijn]]",
                "- [[Woorden]]",
                "- [[Communicatie]]",
            ]
        )

        entries.append(
            {
                "slug": slugify(f"letter-{letter}"),
                "title": letter,
                "summary": f"Letterpagina voor {letter} binnen de taalbewuste alfabetindex.",
                "body": "\n".join(lines),
                "links": [],
                "kind": "letter",
                "indexType": "letter",
                "resolveAsTerm": False,
                "searchText": "\n".join(
                    [letter, f"letter {letter}", f"alfabet {letter}"] + [ref["excerpt"] for ref in refs[:8]]
                ),
            }
        )
    return entries


def write_source_markdown(config: SourceConfig, markdown: str) -> None:
    path = WIKI_SOURCES_DIR / f"{config.slug}.md"
    path.write_text(markdown, encoding="utf-8")


def process_docx(config: SourceConfig) -> tuple[str, list[dict], dict[str, list[dict]]]:
    text = extract_docx_text(config.path)
    paragraphs = text_to_paragraphs(text)
    markdown = build_markdown_source(config, [("Inhoud", paragraphs)])
    entries = [source_entry(config, markdown)]
    letter_refs: dict[str, list[dict]] = {}

    for index, paragraph in enumerate(paragraphs, start=1):
        if len(paragraph) < 80:
            continue
        entry = passage_entry(config, "sectie", index, paragraph)
        entries.append(entry)
        for letter in detect_letters(paragraph):
            letter_refs.setdefault(letter, []).append(
                {
                    "title": entry["title"],
                    "source": config.title,
                    "page": "sectie",
                    "excerpt": paragraph[:280],
                }
            )

    write_source_markdown(config, markdown)
    return markdown, entries, letter_refs


def process_pdf(config: SourceConfig) -> tuple[str, list[dict], dict[str, list[dict]]]:
    ensure_tessdata()
    images = render_pdf_pages(config)
    page_sections: list[tuple[str, list[str]]] = []
    entries: list[dict] = []
    letter_refs: dict[str, list[dict]] = {}

    for page_number, image in enumerate(images, start=1):
        rotated = rotate_image(image, config.rotation)
        text = ocr_image(rotated)
        paragraphs = text_to_paragraphs(text)
        if paragraphs:
            page_sections.append((f"Pagina {page_number}", paragraphs))
        for index, paragraph in enumerate(paragraphs, start=1):
            if len(paragraph) < 70:
                continue
            entry = passage_entry(config, f"p. {page_number}", index, paragraph)
            entries.append(entry)
            for letter in detect_letters(paragraph):
                letter_refs.setdefault(letter, []).append(
                    {
                        "title": entry["title"],
                        "source": config.title,
                        "page": f"p. {page_number}",
                        "excerpt": paragraph[:280],
                    }
                )

    markdown = build_markdown_source(config, page_sections)
    entries.insert(0, source_entry(config, markdown))
    write_source_markdown(config, markdown)
    return markdown, entries, letter_refs


def merge_letter_refs(base: dict[str, list[dict]], addition: dict[str, list[dict]]) -> None:
    for letter, refs in addition.items():
        base.setdefault(letter, []).extend(refs)


def write_source_index(configs: tuple[SourceConfig, ...], entries: list[dict]) -> None:
    passage_counts = {
        config.slug: sum(
            1
            for entry in entries
            if entry.get("indexType") == "passage" and entry.get("sourceSlug") == config.slug
        )
        for config in configs
    }
    letter_count = sum(1 for entry in entries if entry.get("indexType") == "letter")
    passage_total = sum(passage_counts.values())

    lines = [
        "# Bronnen-index",
        "",
        "## Overzicht",
        "",
        f"- {len(configs)} bronteksten",
        f"- {passage_total} doorzoekbare passages",
        f"- {letter_count} letterpagina's",
    ]

    for config in configs:
        lines.extend(
            [
                "",
                f"## {config.title}",
                "",
                f"- Bronbestand: `{config.path.relative_to(ROOT)}`",
                f"- Doorzoekbare tekstingang: [[{config.title}]]",
                f"- Passages in de broncatalogus: {passage_counts[config.slug]}",
                f"- Samenvatting: {config.summary}",
            ]
        )

    SOURCE_INDEX_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    all_entries: list[dict] = []
    letter_refs: dict[str, list[dict]] = {}

    for config in SOURCE_CONFIGS:
        if config.kind == "docx":
            _, entries, refs = process_docx(config)
        elif config.kind == "pdf":
            _, entries, refs = process_pdf(config)
        else:
            raise RuntimeError(f"Onbekend brontype: {config.kind}")
        all_entries.extend(entries)
        merge_letter_refs(letter_refs, refs)

    all_entries.extend(build_letter_entries(letter_refs))
    all_entries.sort(key=lambda entry: (entry["indexType"], entry["title"].lower()))

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "entries": all_entries,
    }
    SOURCE_CATALOG_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_source_index(SOURCE_CONFIGS, all_entries)


if __name__ == "__main__":
    main()
