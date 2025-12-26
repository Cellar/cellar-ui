import React from "react";
import { FileUploadZone } from "@/components/fileUploadZone/FileUploadZone";
import { validateFile } from "@/helpers/validateFile";

interface SecretInputFileProps {
  selectedFile: File | null;
  onFileSelect: (file: File, error: string | null) => void;
  onRemove: () => void;
  maxFileSize: number;
  error?: string;
}

export const SecretInputFile: React.FC<SecretInputFileProps> = ({
  selectedFile,
  onFileSelect,
  onRemove,
  maxFileSize,
  error,
}) => {
  function handleFileSelect(file: File) {
    const validationError = validateFile(file, maxFileSize);
    onFileSelect(file, validationError);
  }

  return (
    <FileUploadZone
      selectedFile={selectedFile}
      onFileSelect={handleFileSelect}
      onRemove={onRemove}
      error={error}
    />
  );
};
