#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import string
import subprocess
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import cv2


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
    ocr_rotations: tuple[int, ...] = ()
    ocr_psms: tuple[str, ...] = ("4", "11")
    passage_min_length: int = 80
    scan_paragraph_target: int = 0
    scan_max_parts: int = 0
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
        ocr_rotations=(0, 90),
        passage_min_length=120,
        scan_paragraph_target=700,
        scan_max_parts=24,
        links=("excalibur", "ex cal i bur", "het ontkende woord"),
    ),
    SourceConfig(
        slug="boek-der-geruststelling-bron",
        title="Het boek der geruststelling",
        summary="De gescande bron over bevrijdingsgeschrift, hartstaal, woordenschat, spraakkunst en holistisch geometrisch taalgebruik.",
        path=ROOT / "docs" / "bronnen" / "Het boek der geruststelling A4.pdf",
        kind="pdf",
        rotation=90,
        ocr_rotations=(90, 0),
        passage_min_length=120,
        scan_paragraph_target=650,
        scan_max_parts=20,
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


def get_rotation_candidates(config: SourceConfig) -> tuple[int, ...]:
    rotations = config.ocr_rotations or ((config.rotation,) if config.rotation else (0,))
    unique: list[int] = []
    for rotation in rotations:
        normalized = rotation % 360
        if normalized not in unique:
            unique.append(normalized)
    return tuple(unique)


def rotate_grayscale_image(image, rotation: int):
    normalized = rotation % 360
    if normalized == 0:
        return image
    if normalized == 90:
        return cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
    if normalized == 180:
        return cv2.rotate(image, cv2.ROTATE_180)
    if normalized == 270:
        return cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)
    raise RuntimeError(f"Niet-ondersteunde OCR-rotatie: {rotation}")


def prepare_ocr_variants(image_path: Path, rotation: int) -> dict[str, object]:
    image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise RuntimeError(f"Kon pagina-afbeelding niet lezen: {image_path}")

    rotated = rotate_grayscale_image(image, rotation)
    normalized = cv2.normalize(rotated, None, 0, 255, cv2.NORM_MINMAX)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(normalized)
    return {
        "gray": normalized,
        "clahe": clahe,
    }


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


def normalize_ocr_word(value: str) -> str:
    lowered = value.lower().replace("’", "").replace("'", "")
    lowered = re.sub(r"[^a-z0-9]+", "", lowered)
    return lowered.strip()


def parse_tesseract_tsv(tsv_text: str) -> tuple[str, list[str], float, int]:
    grouped_lines: dict[tuple[str, str, str, str], list[str]] = {}
    ordered_keys: list[tuple[str, str, str, str]] = []
    words: list[str] = []
    confidences: list[float] = []

    for raw_line in tsv_text.splitlines()[1:]:
        parts = raw_line.split("\t")
        if len(parts) < 12:
            continue

        text = parts[11].strip()
        if not text:
            continue

        key = (parts[2], parts[3], parts[4], parts[5])
        if key not in grouped_lines:
            grouped_lines[key] = []
            ordered_keys.append(key)
        grouped_lines[key].append(text)
        words.append(text)

        try:
            confidence = float(parts[10])
        except ValueError:
            confidence = -1
        if confidence >= 0:
            confidences.append(confidence)

    line_text = "\n".join(" ".join(grouped_lines[key]) for key in ordered_keys)
    average_confidence = sum(confidences) / len(confidences) if confidences else -1.0
    return clean_ocr_text(line_text), words, average_confidence, len(ordered_keys)


def score_ocr_candidate(words: list[str], average_confidence: float, line_count: int) -> float:
    if not words:
        return -1000.0

    normalized_words = [normalize_ocr_word(word) for word in words]
    normalized_words = [word for word in normalized_words if word]
    if not normalized_words:
        return -1000.0

    readable_words = [word for word in normalized_words if len(word) >= 3]
    readable_with_vowels = [word for word in readable_words if re.search(r"[aeiouy]", word)]
    readable_ratio = len(readable_with_vowels) / len(readable_words) if readable_words else 0.0
    unique_ratio = len(set(readable_words)) / len(readable_words) if readable_words else 0.0
    short_ratio = sum(1 for word in normalized_words if len(word) <= 1) / len(normalized_words)
    average_words_per_line = len(words) / max(line_count, 1)
    line_density_bonus = min(average_words_per_line, 8.0) * 3.5
    fragmentation_penalty = 0.0
    if average_words_per_line < 1.75:
        fragmentation_penalty = (1.75 - average_words_per_line) * 26.0

    return (
        (average_confidence * 1.15)
        + (readable_ratio * 24.0)
        + (unique_ratio * 8.0)
        + (min(len(words), 180) * 0.08)
        - (short_ratio * 18.0)
        + line_density_bonus
        - fragmentation_penalty
    )


def read_tesseract_tsv(image_path: Path, psm: str) -> str:
    result = subprocess.run(
        [
            "tesseract",
            "--tessdata-dir",
            str(TESSDATA_DIR),
            str(image_path),
            "stdout",
            "-l",
            "nld+eng",
            "--psm",
            psm,
            "-c",
            "tessedit_create_tsv=1",
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    return result.stdout


def read_tesseract_text(image_path: Path, psm: str) -> str:
    result = subprocess.run(
        [
            "tesseract",
            "--tessdata-dir",
            str(TESSDATA_DIR),
            str(image_path),
            "stdout",
            "-l",
            "nld+eng",
            "--psm",
            psm,
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    return clean_ocr_text(result.stdout)


def ocr_image(image_path: Path, config: SourceConfig) -> str:
    candidate_dir = TMP_DIR / f"{config.slug}-ocr"
    candidate_dir.mkdir(parents=True, exist_ok=True)

    best_score = -1000.0
    best_variant_path: Path | None = None
    best_psm = ""

    for rotation in get_rotation_candidates(config):
        variants = prepare_ocr_variants(image_path, rotation)
        for variant_name, variant_image in variants.items():
            variant_path = candidate_dir / f"{image_path.stem}-r{rotation}-{variant_name}.png"
            cv2.imwrite(str(variant_path), variant_image)

            for psm in config.ocr_psms:
                tsv_output = read_tesseract_tsv(variant_path, psm)
                text, words, average_confidence, line_count = parse_tesseract_tsv(tsv_output)
                score = score_ocr_candidate(words, average_confidence, line_count)
                if score > best_score:
                    best_score = score
                    best_variant_path = variant_path
                    best_psm = psm

    if not best_variant_path or not best_psm:
        return ""
    return read_tesseract_text(best_variant_path, best_psm)


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


def text_block_metrics(text: str) -> dict[str, float]:
    words = re.findall(r"[A-Za-zÀ-ÿ0-9'’-]+", text)
    nonempty_lines = [line.strip() for line in text.splitlines() if line.strip()]
    char_count = len(text)
    alpha_chars = sum(1 for char in text if char.isalpha())
    long_words = [word for word in words if len(word) >= 3]

    return {
        "word_count": float(len(words)),
        "line_count": float(len(nonempty_lines)),
        "alpha_ratio": alpha_chars / char_count if char_count else 0.0,
        "avg_word_length": (sum(len(word) for word in words) / len(words)) if words else 0.0,
        "long_word_ratio": (len(long_words) / len(words)) if words else 0.0,
    }


def is_visual_scan_page(text: str) -> bool:
    metrics = text_block_metrics(text)
    return bool(
        metrics["line_count"] >= 160
        and metrics["avg_word_length"] < 3.35
        and metrics["long_word_ratio"] < 0.55
    )


def coalesce_scan_paragraphs(paragraphs: list[str], target_length: int, max_parts: int) -> list[str]:
    if not paragraphs or target_length <= 0 or max_parts <= 0:
        return paragraphs

    merged: list[str] = []
    buffer: list[str] = []
    buffer_length = 0

    def flush() -> None:
        nonlocal buffer_length
        if not buffer:
            return
        paragraph = " ".join(buffer)
        paragraph = re.sub(r"\s+", " ", paragraph).strip()
        if paragraph:
            merged.append(paragraph)
        buffer.clear()
        buffer_length = 0

    for paragraph in paragraphs:
        part = paragraph.strip()
        if not part:
            flush()
            continue

        heading_like = len(part) < 42 and part.upper() == part and len(part.split()) <= 5
        if heading_like and buffer_length >= target_length * 0.55:
            flush()

        buffer.append(part)
        buffer_length += len(part) + (1 if buffer_length else 0)

        boundary = part.endswith((".", "!", "?", ":")) or part.endswith("…")
        should_flush = (
            (buffer_length >= target_length and not heading_like)
            or len(buffer) >= max_parts
            or (boundary and buffer_length >= target_length * 0.6)
        )
        if should_flush:
            flush()

    flush()
    return merged


def visual_scan_page_note(config: SourceConfig, page_number: int) -> list[str]:
    return [
        f"Visuele pagina uit {config.title}. Deze scan bevat vooral kaart-, schema- of beeldinformatie en leverde geen betrouwbare doorlopende OCR-tekst op.",
        f"Handmatige annotatie van pagina {page_number} blijft wenselijk als deze beeldlaag later inhoudelijk ontsloten moet worden.",
    ]


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
        if len(paragraph) < config.passage_min_length:
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
        text = ocr_image(image, config)
        paragraphs = text_to_paragraphs(text)
        visual_page = is_visual_scan_page(text)
        if visual_page:
            paragraphs = visual_scan_page_note(config, page_number)
        else:
            paragraphs = coalesce_scan_paragraphs(
                paragraphs,
                config.scan_paragraph_target,
                config.scan_max_parts,
            )
        if paragraphs:
            page_sections.append((f"Pagina {page_number}", paragraphs))
        if visual_page:
            continue
        for index, paragraph in enumerate(paragraphs, start=1):
            if len(paragraph) < config.passage_min_length:
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

    type_counts: dict[str, int] = {}
    source_passage_counts: dict[str, int] = {}
    for entry in all_entries:
        index_type = entry["indexType"]
        type_counts[index_type] = type_counts.get(index_type, 0) + 1
        if index_type == "passage":
            source_slug = entry.get("sourceSlug")
            if source_slug:
                source_passage_counts[source_slug] = source_passage_counts.get(source_slug, 0) + 1

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "entryCount": len(all_entries),
            "typeCounts": type_counts,
            "sourcePassageCounts": source_passage_counts,
        },
        "entries": all_entries,
    }
    SOURCE_CATALOG_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_source_index(SOURCE_CONFIGS, all_entries)


if __name__ == "__main__":
    main()
