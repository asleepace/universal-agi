import React, { useRef, useState } from 'react';

interface FilePickerProps {
  /**
   * Function called when files are selected
   */
  onFilesSelected: (files: File[]) => void;
  
  /**
   * Accepted file types (e.g., "image/*", "image/png")
   * @default "image/*"
   */
  accept?: string;
  
  /**
   * Allow multiple file selection
   * @default true
   */
  multiple?: boolean;
  
  /**
   * Maximum number of files that can be selected
   * @default undefined (no limit)
   */
  maxFiles?: number;
  
  /**
   * Show preview of selected files
   * @default true
   */
  showPreviews?: boolean;
  
  /**
   * Custom button text
   * @default "Select Files"
   */
  buttonText?: string;
  
  /**
   * Custom button class name
   */
  buttonClassName?: string;
  
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
}

export default function FilePicker({
  onFilesSelected,
  accept = "image/*",
  multiple = true,
  maxFiles,
  showPreviews = true,
  buttonText = "Select Files",
  buttonClassName = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors",
  disabled = false
}: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Convert FileList to array
    const fileArray = Array.from(e.target.files);
    
    // Apply max files limit if specified
    const filesToAdd = maxFiles 
      ? fileArray.slice(0, maxFiles - selectedFiles.length) 
      : fileArray;
    
    if (filesToAdd.length === 0) return;
    
    // Filter for accepted file types if needed
    const filteredFiles = accept.includes('*') 
      ? filesToAdd 
      : filesToAdd.filter(file => file.type.match(accept));
    
    // Update selected files
    const newSelectedFiles = multiple 
      ? [...selectedFiles, ...filteredFiles] 
      : filteredFiles;
    
    setSelectedFiles(newSelectedFiles);
    
    // Create preview URLs for images
    if (showPreviews) {
      const newPreviewUrls = filteredFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => multiple ? [...prev, ...newPreviewUrls] : newPreviewUrls);
    }
    
    // Call the callback with selected files
    onFilesSelected(newSelectedFiles);
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Launch file picker
  const handleButtonClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  // Remove a file
  const removeFile = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    if (showPreviews && previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    // Remove the file and its preview
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    if (showPreviews) {
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    }
    
    // Call the callback with updated files
    onFilesSelected(newFiles);
  };

  // Clear all files
  const clearFiles = () => {
    // Revoke all object URLs
    if (showPreviews) {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
    
    setSelectedFiles([]);
    onFilesSelected([]);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
      />
      
      {/* File picker button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className={buttonClassName}
        disabled={disabled || (maxFiles !== undefined && selectedFiles.length >= maxFiles)}
      >
        {buttonText}
      </button>
      
      {/* File previews */}
      {showPreviews && selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
            </span>
            <button
              type="button"
              onClick={clearFiles}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear all
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith('image/') ? (
                  <div className="h-20 w-20 border border-gray-200 rounded overflow-hidden">
                    <img
                      src={previewUrls[index]}
                      alt={`Preview ${index}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center bg-gray-100 border border-gray-200 rounded">
                    <span className="text-xs text-center px-1 truncate">
                      {file.name}
                    </span>
                  </div>
                )}
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 