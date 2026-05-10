/**
 * Enterprise Chunking Utility for Evidence Ingestion
 * 
 * Splits large evidence texts into manageable, semantically complete chunks
 * for embedding generation and retrieval-augmented generation (RAG).
 */

export interface Chunk {
  text: string;
  metadata: {
    startIdx: number;
    endIdx: number;
    chunkIndex: number;
  };
}

export function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): Chunk[] {
  if (!text || text.trim() === '') return [];

  // Basic normalization
  const normalizedText = text.replace(/\r\n/g, '\n');
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < normalizedText.length) {
    let endIndex = startIndex + maxChunkSize;
    
    // Ensure we don't split words or sentences abruptly if possible
    if (endIndex < normalizedText.length) {
      // Try to find a paragraph break
      const nextParagraph = normalizedText.indexOf('\n\n', endIndex - 100);
      const prevParagraph = normalizedText.lastIndexOf('\n\n', endIndex);
      
      if (prevParagraph > startIndex + (maxChunkSize / 2)) {
        endIndex = prevParagraph + 2;
      } else {
        // Fall back to finding a sentence break
        const prevSentence = normalizedText.lastIndexOf('. ', endIndex);
        if (prevSentence > startIndex + (maxChunkSize / 2)) {
          endIndex = prevSentence + 2;
        } else {
          // Fall back to finding a space
          const prevSpace = normalizedText.lastIndexOf(' ', endIndex);
          if (prevSpace > startIndex) {
            endIndex = prevSpace + 1;
          }
        }
      }
    } else {
      endIndex = normalizedText.length;
    }

    const chunkText = normalizedText.substring(startIndex, endIndex).trim();
    
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        metadata: {
          startIdx: startIndex,
          endIdx: endIndex,
          chunkIndex: chunkIndex++
        }
      });
    }

    // Advance startIndex, accounting for overlap
    startIndex = endIndex - overlap;
    
    // Safety check to prevent infinite loops if overlap is too large
    if (startIndex <= chunks[chunks.length - 1].metadata.startIdx) {
      startIndex = endIndex;
    }
  }

  return chunks;
}
