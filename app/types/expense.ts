export interface FileUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
  isLoading: boolean;
}

export interface FileUploadProps {
  onFileChange: (file: File) => void;
  receipt: File | null;
} 