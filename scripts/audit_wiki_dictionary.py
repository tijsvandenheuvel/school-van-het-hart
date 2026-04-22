#!/usr/bin/env python3

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ITEMS_DIR = ROOT / "wiki" / "items"
CURATED_INDEX_PATH = ROOT / "wiki" / "meta" / "curated-index.md"


def normalize_term(value: str) -> str:
    lowered = value.lower().replace("&", " en ")
    lowered = lowered.replace("’", "").replace("'", "").replace('"', "")
    lowered = re.sub(r"[^a-z0-9]+", " ", lowered)
    return re.sub(r"\s+", " ", lowered).strip()


def slugify(value: str) -> str:
    normalized = value.lower().replace("&", " en ")
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return re.sub(r"-{2,}", "-", normalized).strip("-")


def variant_keys(normalized: str) -> set[str]:
    if not normalized:
        return set()

    variants = {normalized}
    parts = normalized.split(" ")
    last = parts[-1]

    def add_last_variant(next_last: str) -> None:
        if not next_last or next_last == last:
            return
        variants.add(" ".join([*parts[:-1], next_last]))

    if len(last) > 4 and last.endswith("s") and not last.endswith("ss"):
        add_last_variant(last[:-1])
    if len(last) > 5 and last.endswith("en"):
        add_last_variant(last[:-2])
    if len(last) > 5 and last.endswith("ies"):
        add_last_variant(f"{last[:-3]}ie")
    if len(last) > 3 and not last.endswith("s"):
        add_last_variant(f"{last}s")
    if len(last) > 3 and not last.endswith("en"):
        add_last_variant(f"{last}en")

    return variants


def parse_curated_titles() -> list[str]:
    markdown = CURATED_INDEX_PATH.read_text(encoding="utf-8")
    return [
        line[2:].strip()
        for line in markdown.splitlines()
        if line.strip().startswith("- ")
    ]


def parse_item(path: Path) -> dict:
    markdown = path.read_text(encoding="utf-8")
    parts = markdown.split("---", 2)
    data = {"title": path.stem, "links": []}
    if len(parts) >= 3:
        frontmatter = parts[1]
        title_match = re.search(r"^title:\s*(.+)$", frontmatter, flags=re.MULTILINE)
        if title_match:
            data["title"] = title_match.group(1).strip().strip('"')

        links_match = re.search(r"^links:\n((?:\s*-\s*.+\n?)*)", frontmatter, flags=re.MULTILINE)
        if links_match:
            data["links"] = [
                re.sub(r"^\s*-\s*", "", line).strip().strip('"')
                for line in links_match.group(1).splitlines()
                if line.strip()
            ]

    return data


def main() -> None:
    curated_titles = parse_curated_titles()
    indexed_slugs = {normalize_term(title): title for title in curated_titles}
    expected_files = {f"{slugify(title)}.md": title for title in curated_titles}

    title_index: defaultdict[str, list[str]] = defaultdict(list)
    alias_index: defaultdict[str, list[str]] = defaultdict(list)
    near_collisions: defaultdict[tuple[str, str], set[str]] = defaultdict(set)
    item_paths = sorted(ITEMS_DIR.glob("*.md"))
    unindexed_files: list[str] = []

    for path in item_paths:
        item = parse_item(path)
        normalized_title = normalize_term(item["title"])
        title_index[normalized_title].append(item["title"])

        if normalized_title not in indexed_slugs:
            unindexed_files.append(path.name)

        for term in [item["title"], *item["links"]]:
            normalized = normalize_term(term)
            if not normalized:
                continue
            alias_index[normalized].append(item["title"])
            for variant in variant_keys(normalized):
                if variant != normalized:
                    pair = tuple(sorted((normalized, variant)))
                    near_collisions[pair].add(item["title"])

    duplicate_titles = {key: values for key, values in title_index.items() if len(values) > 1}
    alias_collisions = {
        key: sorted(set(values))
        for key, values in alias_index.items()
        if len(set(values)) > 1
    }
    plural_collisions = {
        pair: sorted(titles)
        for pair, titles in near_collisions.items()
        if pair[0] in alias_index and pair[1] in alias_index and set(alias_index[pair[0]]) != set(alias_index[pair[1]])
    }
    missing_curated_files = [
        f"{filename} :: {title}"
        for filename, title in sorted(expected_files.items())
        if not (ITEMS_DIR / filename).exists()
    ]

    print(f"Curated titles: {len(curated_titles)}")
    print(f"Markdown items: {len(item_paths)}")
    print()

    print("Missing curated item files:")
    if missing_curated_files:
        for item in missing_curated_files:
            print(f"- {item}")
    else:
        print("- none")
    print()

    print("Unindexed item files:")
    if unindexed_files:
        for name in unindexed_files:
            print(f"- {name}")
    else:
        print("- none")
    print()

    print("Duplicate normalized titles:")
    if duplicate_titles:
        for key, values in sorted(duplicate_titles.items()):
            print(f"- {key}: {values}")
    else:
        print("- none")
    print()

    print("Alias collisions across different pages:")
    if alias_collisions:
        for key, values in sorted(alias_collisions.items()):
            print(f"- {key}: {values}")
    else:
        print("- none")
    print()

    print("Potential singular/plural collisions:")
    if plural_collisions:
        for pair, titles in sorted(plural_collisions.items()):
            print(f"- {pair[0]} <-> {pair[1]}: {titles}")
    else:
        print("- none")


if __name__ == "__main__":
    main()
