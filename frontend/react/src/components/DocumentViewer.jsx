import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Image as ImageIcon } from 'lucide-react';

const DocumentViewer = ({ document, onClose, onApprove, onReject, showActions = true }) => {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    if (!document) return null;

    const getFileExtension = (filename) => {
        return filename.split('.').pop().toLowerCase();
    };

    const isImage = document.type?.startsWith('image/') || 
                   document.nombre?.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i) ||
                   document.name?.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i);
    
    const isPDF = document.type === 'application/pdf' || 
                  document.nombre?.endsWith('.pdf') ||
                  document.name?.endsWith('.pdf');

    const documentUrl = document.archivo || document.url;
    const documentName = document.nombre || document.name;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    const downloadDocument = () => {
        if (documentUrl) {
            const link = document.createElement('a');
            link.href = documentUrl;
            link.download = documentName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="document-viewer-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div className="document-viewer-header" style={{
                background: '#fff',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div className="d-flex align-items-center">
                    <div className="me-3">
                        {isImage ? (
                            <ImageIcon className="w-6 h-6 text-purple-500" />
                        ) : isPDF ? (
                            <FileText className="w-6 h-6 text-red-500" />
                        ) : (
                            <FileText className="w-6 h-6 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <h5 className="mb-0">{document.name}</h5>
                        <small className="text-muted">
                            {document.size && `Tamaño: ${Math.round(document.size / 1024)} KB`}
                        </small>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* Viewer Controls */}
                    {isImage && (
                        <>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={handleZoomOut}
                                disabled={zoom <= 50}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="px-2 text-sm">{zoom}%</span>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={handleZoomIn}
                                disabled={zoom >= 200}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={handleRotate}
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {/* Download Button */}
                    <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={downloadDocument}
                    >
                        <Download className="w-4 h-4 me-1" />
                        Descargar
                    </button>

                    {/* Action Buttons */}
                    {showActions && (
                        <>
                            <button 
                                className="btn btn-sm btn-success"
                                onClick={() => onApprove && onApprove(document)}
                            >
                                Aprobar
                            </button>
                            <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => onReject && onReject(document)}
                            >
                                Rechazar
                            </button>
                        </>
                    )}

                    {/* Close Button */}
                    <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onClose}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="document-viewer-content" style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                overflow: 'auto'
            }}>
                {isImage ? (
                    <img 
                        src={document.url || document.preview}
                        alt={document.name}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            objectFit: 'contain'
                        }}
                    />
                ) : isPDF ? (
                    <div className="pdf-container" style={{
                        width: '100%',
                        height: '100%',
                        background: '#fff',
                        borderRadius: '8px'
                    }}>
                        <iframe
                            src={`${document.url}#view=FitH`}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                            title={document.name}
                        />
                    </div>
                ) : (
                    <div className="unsupported-document text-center" style={{
                        background: '#fff',
                        padding: '3rem',
                        borderRadius: '8px',
                        maxWidth: '400px'
                    }}>
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <h5>Vista previa no disponible</h5>
                        <p className="text-muted mb-3">
                            Este tipo de archivo no se puede previsualizar directamente.
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={downloadDocument}
                        >
                            <Download className="w-4 h-4 me-2" />
                            Descargar para ver
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentViewer;