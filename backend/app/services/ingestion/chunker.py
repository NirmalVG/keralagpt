"""
Chunker Service
Splits raw text into overlapping chunks of ~400 tokens.
Uses RecursiveCharacterTextSplitter which tries to split on:
  paragraphs → sentences → words → characters
This preserves semantic units better than a naive character split.
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter
import tiktoken

# Use the cl100k_base tokenizer (same as GPT-4 and nomic-embed-text)
_tokenizer = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    return len(_tokenizer.encode(text))


def chunk_text(
    text: str,
    chunk_size: int = 400,
    chunk_overlap: int = 50,
) -> list[dict]:
    """
    Split text into chunks. Returns a list of dicts:
    [
      { "content": "...", "token_count": 387, "chunk_index": 0 },
      { "content": "...", "token_count": 412, "chunk_index": 1 },
      ...
    ]
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=count_tokens,       # count by tokens, not characters
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    raw_chunks = splitter.split_text(text)

    return [
        {
            "content": chunk.strip(),
            "token_count": count_tokens(chunk),
            "chunk_index": i,
        }
        for i, chunk in enumerate(raw_chunks)
        if chunk.strip()  # skip empty chunks
    ]


def chunk_by_sections(sections: list[dict]) -> list[dict]:
    """
    For documents that are already divided into sections.
    sections: [{ "title": "...", "content": "...", "section_num": 1 }, ...]
    Returns chunks with section info attached.
    """
    all_chunks = []
    for section in sections:
        chunks = chunk_text(section["content"])
        for chunk in chunks:
            chunk["section_title"] = section.get("title", "")
            chunk["section_num"] = section.get("section_num", 0)
        all_chunks.extend(chunks)
    return all_chunks