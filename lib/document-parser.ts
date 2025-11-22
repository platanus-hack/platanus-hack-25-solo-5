import mammoth from "mammoth";
import * as XLSX from "xlsx";
import MarkdownIt from "markdown-it";

const MAX_CHARS = 100000;

export function truncateText(text: string, maxChars: number = MAX_CHARS): { text: string; wasTruncated: boolean } {
  if (text.length <= maxChars) {
    return { text, wasTruncated: false };
  }
  return {
    text: text.substring(0, maxChars) + "\n\n[... Contenido truncado por límite de caracteres ...]",
    wasTruncated: true,
  };
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/extract-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to extract PDF text");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("No se pudo extraer texto del PDF");
  }
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("No se pudo extraer texto del DOCX");
  }
}

export async function extractTextFromXLSX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const textParts: string[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      textParts.push(`=== Hoja: ${sheetName} ===\n${csv}`);
    });

    return textParts.join("\n\n");
  } catch (error) {
    console.error("Error extracting XLSX text:", error);
    throw new Error("No se pudo extraer texto del XLSX");
  }
}

export async function extractTextFromCSV(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error("Error extracting CSV text:", error);
    throw new Error("No se pudo extraer texto del CSV");
  }
}

export async function extractTextFromMarkdown(file: File): Promise<string> {
  try {
    const text = await file.text();
    const md = new MarkdownIt();
    const rendered = md.render(text);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rendered;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    return plainText;
  } catch (error) {
    console.error("Error extracting Markdown text:", error);
    throw new Error("No se pudo extraer texto del Markdown");
  }
}

export async function extractTextFromDocument(file: File): Promise<{ text: string; wasTruncated: boolean }> {
  let extractedText = "";

  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    if (mimeType === "application/pdf") {
      extractedText = await extractTextFromPDF(file);
      return { text: extractedText, wasTruncated: false };
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      extractedText = await extractTextFromDOCX(file);
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileName.endsWith(".xlsx")
    ) {
      extractedText = await extractTextFromXLSX(file);
    } else if (mimeType === "text/csv" || fileName.endsWith(".csv")) {
      extractedText = await extractTextFromCSV(file);
    } else if (mimeType === "text/markdown" || fileName.endsWith(".md")) {
      extractedText = await extractTextFromMarkdown(file);
    } else if (mimeType.startsWith("text/")) {
      extractedText = await file.text();
    } else {
      return { text: "", wasTruncated: false };
    }

    return truncateText(extractedText);
  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error);
    return { text: "", wasTruncated: false };
  }
}
