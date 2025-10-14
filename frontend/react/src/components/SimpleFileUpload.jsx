import React, { useState } from 'react';
import { Upload, X, File, FileText, Image } from 'lucide-react';

const SimpleFileUpload = ({ 
    onFileSelect, 
    acceptedTypes = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif",
    currentFile = null
}) => {
    const [selectedFile, setSelectedFile] = useState(currentFile);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (onFileSelect) {
                onFileSelect(file);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (onFileSelect) {
            onFileSelect(null);
        }
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return <File className="w-5 h-5 text-gray-500" />;
        
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="w-5 h-5 text-red-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="w-5 h-5 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <FileText className="w-5 h-5 text-green-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Image className="w-5 h-5 text-purple-500" />;
            default:
                return <File className="w-5 h-5 text-gray-500" />;
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
        <div className="simple-file-upload">
            <div className="d-flex align-items-center gap-3">
                <input
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileChange}
                    className="form-control"
                    style={{ maxWidth: '300px' }}
                />
                {selectedFile && (
                    <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
                        {getFileIcon(selectedFile.name)}
                        <div>
                            <div className="small font-medium">{selectedFile.name}</div>
                            <div className="small text-muted">{formatFileSize(selectedFile.size)}</div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={removeFile}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleFileUpload;