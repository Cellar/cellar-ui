import React, { useState, useRef } from "react";
import { formatFileSize } from "../../helpers/formatFileSize";
import classes from "./FileUploadZone.module.css";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File;
  onRemove?: () => void;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  selectedFile,
  onRemove,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleZoneClick = () => {
    if (!disabled && !selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  const zoneClasses = [
    classes.zone,
    isDragging ? classes.dragging : "",
    disabled ? classes.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes.container}>
      <div
        data-testid="file-upload-zone"
        className={zoneClasses}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          data-testid="file-input"
          className={classes.input}
          onChange={handleFileChange}
          disabled={disabled}
        />

        {!selectedFile && (
          <div className={classes.uploadText}>
            <p>Drag and drop a file here or click to browse</p>
          </div>
        )}

        {selectedFile && (
          <div data-testid="selected-file-info" className={classes.fileInfo}>
            <div className={classes.fileName}>{selectedFile.name}</div>
            <div data-testid="selected-file-size" className={classes.fileSize}>
              {formatFileSize(selectedFile.size)}
            </div>
            <button
              type="button"
              data-testid="remove-file-button"
              className={classes.removeButton}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
