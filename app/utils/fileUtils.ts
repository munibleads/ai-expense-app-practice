import * as pdfjs from 'pdfjs-dist';
import { SUPPORTED_FORMATS } from '../constants/expense';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function convertPDFToImage(file: File): Promise<File> {
  if (file.type !== SUPPORTED_FORMATS.PDF) {
    return file;
  }

  try {
    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set the scale for better quality
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Prepare canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 1.0);
    });

    // Create a new file from the blob
    const convertedFile = new File([blob], file.name.replace('.pdf', '.png'), {
      type: 'image/png'
    });

    return convertedFile;
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw new Error('Failed to convert PDF to image');
  }
} 