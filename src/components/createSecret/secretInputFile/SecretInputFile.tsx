import React, { forwardRef, useImperativeHandle, useState } from "react";
import { FileUploadZone } from "@/components/fileUploadZone/FileUploadZone";
import { validateFile } from "@/helpers/validateFile";
import { ErrorWrapper } from "@/components/form/Form";

interface SecretInputFileProps {
  maxFileSize: number;
}

export interface SecretInputFileHandle {
  getFile: () => File | null;
  getError: () => string;
  isValid: () => boolean;
  validate: () => boolean;
}

export const SecretInputFile = forwardRef<
  SecretInputFileHandle,
  SecretInputFileProps
>(({ maxFileSize }, ref) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    getFile: () => selectedFile,
    getError: () => error,
    isValid: () => !error && selectedFile !== null,
    validate: () => {
      if (!selectedFile) {
        setError("Upload secret file");
        return false;
      }
      return !error;
    },
  }));

  function handleFileSelect(file: File) {
    const validationError = validateFile(file, maxFileSize);
    setSelectedFile(file);
    setError(validationError || "");
  }

  function handleRemove() {
    setSelectedFile(null);
    setError("");
  }

  return (
    <ErrorWrapper
      message={error}
      data-testid="secret-file-error"
    >
      <FileUploadZone
        selectedFile={selectedFile || undefined}
        onFileSelect={handleFileSelect}
        onRemove={handleRemove}
      />
    </ErrorWrapper>
  );
});

SecretInputFile.displayName = "SecretInputFile";
