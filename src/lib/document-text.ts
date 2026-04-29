import { inflateRawSync } from "node:zlib";

const DOCX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type PdfJsWorkerGlobal = typeof globalThis & {
  pdfjsWorker?: unknown;
};

type PdfParseModule = typeof import("pdf-parse");

let pdfParseReady: Promise<PdfParseModule> | null = null;

class DocumentTextError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 422,
  ) {
    super(message);
    this.name = "DocumentTextError";
  }
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isDocx(file: File) {
  return file.type === DOCX_CONTENT_TYPE || file.name.toLowerCase().endsWith(".docx");
}

function isText(file: File) {
  return file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt");
}

function sanitizeText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function findEndOfCentralDirectory(buffer: Buffer) {
  const minOffset = Math.max(0, buffer.length - 0xffff - 22);
  for (let offset = buffer.length - 22; offset >= minOffset; offset--) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }

  return -1;
}

function readZipEntry(buffer: Buffer, entryName: string) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) return null;

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  let offset = centralDirectoryOffset;

  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) return null;

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer
      .subarray(offset + 46, offset + 46 + fileNameLength)
      .toString("utf8");

    if (fileName === entryName) {
      if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) return null;

      const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);

      if (compressionMethod === 0) return compressed;
      if (compressionMethod === 8) {
        const inflated = inflateRawSync(compressed);
        return uncompressedSize > 0 ? inflated.subarray(0, uncompressedSize) : inflated;
      }

      throw new DocumentTextError(
        "unsupported_docx_compression",
        "This DOCX file uses an unsupported compression method.",
      );
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return null;
}

function extractDocxText(buffer: Buffer) {
  const documentXml = readZipEntry(buffer, "word/document.xml");
  if (!documentXml) {
    throw new DocumentTextError(
      "invalid_docx",
      "Could not read the DOCX document body.",
    );
  }

  const xml = documentXml.toString("utf8");
  const text = xml
    .replace(/<w:tab\s*\/>/g, "\t")
    .replace(/<w:br\s*\/>|<w:cr\s*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n\n")
    .replace(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g, (_, value: string) =>
      decodeXmlEntities(value),
    )
    .replace(/<[^>]+>/g, "");

  return sanitizeText(text);
}

async function extractPdfText(buffer: Buffer) {
  const { PDFParse } = await loadPdfParse();

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return sanitizeText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function loadPdfParse() {
  pdfParseReady ??= configurePdfParse();
  return pdfParseReady;
}

async function configurePdfParse() {
  const pdfParse = await import("pdf-parse");

  try {
    const { getData } = await import("pdf-parse/worker");
    pdfParse.PDFParse.setWorker(getData());
    return pdfParse;
  } catch (workerError) {
    console.error("Bundled PDF worker setup failed:", workerError);
  }

  const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  (globalThis as PdfJsWorkerGlobal).pdfjsWorker = worker;

  return pdfParse;
}

export function getDocumentExtension(file: File) {
  return (file.name.split(".").pop() ?? "bin")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

export function toDocumentTextError(error: unknown) {
  if (error instanceof DocumentTextError) return error;

  console.error("Document text extraction error:", error);
  return new DocumentTextError(
    "text_extraction_failed",
    "Could not extract readable text from this file.",
  );
}

export async function extractDocumentText(file: File, buffer: Buffer) {
  if (isPdf(file)) return extractPdfText(buffer);
  if (isDocx(file)) return extractDocxText(buffer);
  if (isText(file)) return sanitizeText(buffer.toString("utf8"));

  throw new DocumentTextError(
    "unsupported_file_type",
    "Please upload a PDF, TXT, or DOCX file.",
    415,
  );
}
