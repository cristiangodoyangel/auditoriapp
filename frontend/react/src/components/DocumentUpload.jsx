import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Download, Eye } from 'lucide-react';

const DocumentUpload = ({ 
    onFileSelect, 
    onFileRemove, 
    acceptedTypes = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif",
    maxSize = 10 * 1024 * 1024, // 10MB
    multiple = false,
    previewEnabled = true,
    existingFiles = []
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState(existingFiles);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        const errors = [];
        
        // Check file size
        if (file.size > maxSize) {
            errors.push(`Archivo demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
        
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!acceptedTypes.includes(fileExtension)) {
            errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${acceptedTypes}`);
        }
        
        return errors;
    };

    const handleFiles = (fileList) => {
        const newFiles = Array.from(fileList);
        const validFiles = [];
        const allErrors = [];

        newFiles.forEach(file => {
            const fileErrors = validateFile(file);
            if (fileErrors.length === 0) {
                const fileWithId = {
                    id: Date.now() + Math.random(),
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: null
                };

                // Generate preview for images
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        fileWithId.preview = e.target.result;
                        setFiles(prev => prev.map(f => f.id === fileWithId.id ? fileWithId : f));
                    };
                    reader.readAsDataURL(file);
                }

                validFiles.push(fileWithId);
            } else {
                allErrors.push(...fileErrors);
            }
        });

        if (multiple) {
            setFiles(prev => [...prev, ...validFiles]);
        } else {
            setFiles(validFiles);
        }

        setErrors(allErrors);

        // Notify parent component
        if (onFileSelect) {
            onFileSelect(multiple ? [...files, ...validFiles] : validFiles[0] || null);
        }
    };

    const removeFile = (fileId) => {
        const newFiles = files.filter(f => f.id !== fileId);
        setFiles(newFiles);
        
        if (onFileRemove) {
            onFileRemove(fileId);
        }
        
        if (onFileSelect) {
            onFileSelect(multiple ? newFiles : null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="w-6 h-6 text-red-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="w-6 h-6 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <FileText className="w-6 h-6 text-green-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Image className="w-6 h-6 text-purple-500" />;
            default:
                return <File className="w-6 h-6 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="document-upload">
            {/* Upload Area */}
            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragActive ? '#7b4d1d' : '#ccc'}`,
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: dragActive ? '#f8f9fa' : '#fff',
                    transition: 'all 0.3s ease'
                }}
            >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700">
                    {dragActive ? 'Suelta los archivos aquí' : 'Haz clic o arrastra archivos aquí'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Tipos permitidos: {acceptedTypes}
                </p>
                <p className="text-sm text-gray-500">
                    Tamaño máximo: {Math.round(maxSize / 1024 / 1024)}MB
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                multiple={multiple}
                onChange={handleFileInput}
                style={{ display: 'none' }}
            />

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="mt-3">
                    {errors.map((error, index) => (
                        <div key={index} className="alert alert-danger py-2">
                            {error}
                        </div>
                    ))}
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-4">
                    <h6 className="font-medium text-gray-700 mb-3">
                        Archivos seleccionados ({files.length})
                    </h6>
                    <div className="space-y-2">
                        {files.map((fileData) => (
                            <div 
                                key={fileData.id} 
                                className="file-item d-flex align-items-center justify-content-between p-3 border rounded bg-light"
                            >
                                <div className="d-flex align-items-center">
                                    {previewEnabled && fileData.preview ? (
                                        <img 
                                            src={fileData.preview} 
                                            alt={fileData.name}
                                            className="me-3"
                                            style={{ 
                                                width: '48px', 
                                                height: '48px', 
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    ) : (
                                        <div className="me-3">
                                            {getFileIcon(fileData.name)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="mb-0 font-medium text-gray-800">
                                            {fileData.name}
                                        </p>
                                        <p className="mb-0 text-sm text-gray-500">
                                            {formatFileSize(fileData.size)}
                                        </p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    {previewEnabled && fileData.preview && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Open preview modal or new window
                                                const newWindow = window.open('', '_blank');
                                                newWindow.document.write(`
                                                    <html>
                                                        <head><title>${fileData.name}</title></head>
                                                        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
                                                            <img src="${fileData.preview}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${fileData.name}">
                                                        </body>
                                                    </html>
                                                `);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(fileData.id);
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;