"""
PDF text extraction and chunking utilities.

Mirrors Node.js UniversalPDFPreprocessor from PDFProcessingService.ts.
"""

import re
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ChunkingOptions:
    max_chunk_size: int = 1000
    overlap_size: int = 200
    respect_sentences: bool = True
    respect_paragraphs: bool = True


class PDFPreprocessor:
    """Clean and chunk extracted text, matching Node.js UniversalPDFPreprocessor."""

    def __init__(self, options: ChunkingOptions | None = None) -> None:
        opts = options or ChunkingOptions()
        self.max_chunk_size = opts.max_chunk_size
        self.overlap_size = opts.overlap_size
        self.respect_sentences = opts.respect_sentences
        self.respect_paragraphs = opts.respect_paragraphs

    def process_text(self, text: str) -> list[str]:
        cleaned = self._clean_text(text)
        return self._chunk_text(cleaned)

    # ------------------------------------------------------------------
    # Cleaning
    # ------------------------------------------------------------------
    @staticmethod
    def _clean_text(text: str) -> str:
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"[\f\r]", " ", text)
        text = text.replace("\u201c", '"').replace("\u201d", '"')
        text = text.replace("\u2018", "'").replace("\u2019", "'")
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
        return text.strip()

    # ------------------------------------------------------------------
    # Chunking
    # ------------------------------------------------------------------
    def _chunk_text(self, text: str) -> list[str]:
        if self.respect_paragraphs:
            return self._chunk_by_paragraphs(text)
        if self.respect_sentences:
            return self._chunk_by_sentences(text)
        return self._chunk_by_characters(text)

    def _chunk_by_paragraphs(self, text: str) -> list[str]:
        chunks: list[str] = []
        paragraphs = re.split(r"\n\s*\n", text)
        current = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(para) > self.max_chunk_size:
                # If a single paragraph is too large, split it by characters
                if current:
                    chunks.append(current.strip())
                    current = ""
                
                # Split large para into smaller bits
                para_chunks = self._chunk_by_characters(para)
                chunks.extend(para_chunks)
                continue

            if current and (len(current) + len(para)) > self.max_chunk_size:
                chunks.append(current.strip())
                overlap = self._get_overlap(current)
                current = (overlap + "\n\n" + para) if overlap else para
            else:
                current += ("\n\n" if current else "") + para

        if current.strip():
            chunks.append(current.strip())

        return [c for c in chunks if len(c) > 10]

    def _chunk_by_sentences(self, text: str) -> list[str]:
        chunks: list[str] = []
        sentences = self._split_into_sentences(text)
        current = ""

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            if len(sentence) > self.max_chunk_size:
                # If a single sentence is too large, split it by characters
                if current:
                    chunks.append(current.strip())
                    current = ""
                
                sentence_chunks = self._chunk_by_characters(sentence)
                chunks.extend(sentence_chunks)
                continue

            if current and (len(current) + len(sentence)) > self.max_chunk_size:
                chunks.append(current.strip())
                overlap = self._get_overlap(current)
                current = (overlap + " " + sentence) if overlap else sentence
            else:
                current += (" " if current else "") + sentence

        if current.strip():
            chunks.append(current.strip())

        return [c for c in chunks if len(c) > 10]

    def _chunk_by_characters(self, text: str) -> list[str]:
        chunks: list[str] = []
        start = 0

        while start < len(text):
            end = min(start + self.max_chunk_size, len(text))

            if end < len(text):
                last_space = text.rfind(" ", start, end)
                if last_space > start:
                    end = last_space

            chunk = text[start:end].strip()
            if len(chunk) > 10:
                chunks.append(chunk)

            start = max(end - self.overlap_size, end)

        return chunks

    @staticmethod
    def _split_into_sentences(text: str) -> list[str]:
        return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text) if s.strip()]

    def _get_overlap(self, text: str) -> str:
        if len(text) <= self.overlap_size:
            return text

        overlap_text = text[-self.overlap_size :]

        # Try sentence boundary
        m = re.search(r"[.!?]\s+[A-Z]", overlap_text)
        if m:
            return overlap_text[m.start() + 2 :]

        # Try word boundary
        space_idx = overlap_text.find(" ")
        if space_idx != -1:
            return overlap_text[space_idx + 1 :]

        return overlap_text


def extract_text_from_file(file_path: str) -> str:
    """Extract text from a file based on its extension."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".txt", ".md"]:
        return extract_text_from_text(file_path)
    elif ext == ".docx":
        # Check if python-docx is installed
        try:
            from docx import Document
            doc = Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except ImportError:
            raise ImportError("python-docx is required for .docx files. Please install it.")
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF (fitz)."""
    import fitz  # PyMuPDF

    text_parts: list[str] = []
    with fitz.open(file_path) as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n\n".join(text_parts)


def extract_text_from_text(file_path: str) -> str:
    """Extract text from a plain text or markdown file."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def estimate_token_count(text: str) -> int:
    """Rough estimation: ~4 characters per token for English text."""
    return max(1, len(text) // 4)
