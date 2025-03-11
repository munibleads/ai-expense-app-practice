import { IMAGE_COMPRESSION } from '@/app/constants/expense';

export async function compressImage(file: File): Promise<File> {
  if (file.type === 'application/pdf') {
    return file; // Don't compress PDFs
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > IMAGE_COMPRESSION.MAX_WIDTH) {
          height = (IMAGE_COMPRESSION.MAX_WIDTH / width) * height;
          width = IMAGE_COMPRESSION.MAX_WIDTH;
        }

        if (height > IMAGE_COMPRESSION.MAX_HEIGHT) {
          width = (IMAGE_COMPRESSION.MAX_HEIGHT / height) * width;
          height = IMAGE_COMPRESSION.MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image with white background to handle transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if the compressed size is still too large
            if (blob.size > IMAGE_COMPRESSION.MAX_FILE_SIZE_BYTES) {
              reject(new Error('Image is too large even after compression'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });

            resolve(compressedFile);
          },
          file.type,
          IMAGE_COMPRESSION.QUALITY
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
} 