import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Download, MessageSquare, Check, X, Clock, Filter, Search } from 'lucide-react';
import DocumentViewer from '../components/DocumentViewer';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const DocumentReview = () => {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - replace with real API calls
    const mockDocuments = [
        {
            id: 1,
            name: 'Factura_001.pdf',
            type: 'application/pdf',
            size: 245760,
            url: '/api/documents/1/download',
            uploadDate: '2024-10-01T10:30:00Z',
            project: 'Proyecto Educativo San Pedro',
            uploader: 'Juan Pérez',
            status: 'pending', // pending, approved, rejected
            reviewDate: null,
            reviewer: null,
            comments: []
        },
        {
            id: 2,
            name: 'Comprobante_Pago.jpg',
            type: 'image/jpeg',
            size: 156432,
            url: '/api/documents/2/download',
            preview: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
            uploadDate: '2024-09-28T14:15:00Z',
            project: 'Infraestructura Toconao',
            uploader: 'María González',
            status: 'approved',
            reviewDate: '2024-09-29T09:00:00Z',
            reviewer: 'Carlos Mamani',
            comments: [
                {
                    id: 1,
                    user: 'Carlos Mamani',
                    date: '2024-09-29T09:00:00Z',
                    text: 'Documento aprobado. Monto y fecha correctos.'
                }
            ]
        },
        {
            id: 3,
            name: 'Presupuesto_Detallado.xlsx',
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            size: 89234,
            url: '/api/documents/3/download',
            uploadDate: '2024-09-25T16:45:00Z',
            project: 'Desarrollo Rural Socaire',
            uploader: 'Ana López',
            status: 'rejected',
            reviewDate: '2024-09-26T11:30:00Z',
            reviewer: 'Pedro Torres',
            comments: [
                {
                    id: 2,
                    user: 'Pedro Torres',
                    date: '2024-09-26T11:30:00Z',
                    text: 'Faltan detalles en las partidas 3 y 4. Favor corregir y volver a subir.'
                }
            ]
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setDocuments(mockDocuments);
            setFilteredDocuments(mockDocuments);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        let filtered = documents;

        // Apply status filter
        if (filter !== 'all') {
            filtered = filtered.filter(doc => doc.status === filter);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(doc => 
                doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.uploader.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDocuments(filtered);
    }, [documents, filter, searchTerm]);

    const handleViewDocument = (document) => {
        setSelectedDocument(document);
        setShowViewer(true);
    };

    const handleApproveDocument = (document) => {
        const comment = newComment.trim();
        if (!comment) {
            alert('Por favor, agregue un comentario para la aprobación.');
            return;
        }

        // Update document status
        const updatedDocuments = documents.map(doc => 
            doc.id === document.id 
                ? {
                    ...doc,
                    status: 'approved',
                    reviewDate: new Date().toISOString(),
                    reviewer: 'Usuario Actual', // Replace with actual user
                    comments: [...doc.comments, {
                        id: Date.now(),
                        user: 'Usuario Actual',
                        date: new Date().toISOString(),
                        text: comment
                    }]
                }
                : doc
        );

        setDocuments(updatedDocuments);
        setNewComment('');
        setShowViewer(false);
    };

    const handleRejectDocument = (document) => {
        const comment = newComment.trim();
        if (!comment) {
            alert('Por favor, agregue un comentario explicando el motivo del rechazo.');
            return;
        }

        // Update document status
        const updatedDocuments = documents.map(doc => 
            doc.id === document.id 
                ? {
                    ...doc,
                    status: 'rejected',
                    reviewDate: new Date().toISOString(),
                    reviewer: 'Usuario Actual', // Replace with actual user
                    comments: [...doc.comments, {
                        id: Date.now(),
                        user: 'Usuario Actual',
                        date: new Date().toISOString(),
                        text: comment
                    }]
                }
                : doc
        );

        setDocuments(updatedDocuments);
        setNewComment('');
        setShowViewer(false);
    };

    const addComment = (documentId) => {
        const comment = newComment.trim();
        if (!comment) return;

        const updatedDocuments = documents.map(doc => 
            doc.id === documentId 
                ? {
                    ...doc,
                    comments: [...doc.comments, {
                        id: Date.now(),
                        user: 'Usuario Actual',
                        date: new Date().toISOString(),
                        text: comment
                    }]
                }
                : doc
        );

        setDocuments(updatedDocuments);
        setNewComment('');
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { backgroundColor: '#ffc107', color: '#000' },
            approved: { backgroundColor: '#28a745', color: '#fff' },
            rejected: { backgroundColor: '#dc3545', color: '#fff' }
        };

        const labels = {
            pending: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado'
        };

        return (
            <span className="badge" style={styles[status]}>
                {labels[status]}
            </span>
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <Check className="w-4 h-4 text-success" />;
            case 'rejected':
                return <X className="w-4 h-4 text-danger" />;
            default:
                return <Clock className="w-4 h-4 text-warning" />;
        }
    };

    if (loading) {
        return <div className="container py-4"><div>Cargando documentos...</div></div>;
    }

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 text-dark">Revisión de Documentos</h1>
                    <p className="text-muted">Revisa y aprueba documentos subidos por los proyectos.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="dashboard-card mb-4">
                <div className="dashboard-card-content2">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <Search className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre, proyecto o usuario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">Todos los estados</option>
                                <option value="pending">Pendientes</option>
                                <option value="approved">Aprobados</option>
                                <option value="rejected">Rechazados</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex gap-2">
                                <span className="badge bg-warning text-dark">
                                    Pendientes: {documents.filter(d => d.status === 'pending').length}
                                </span>
                                <span className="badge bg-success">
                                    Aprobados: {documents.filter(d => d.status === 'approved').length}
                                </span>
                                <span className="badge bg-danger">
                                    Rechazados: {documents.filter(d => d.status === 'rejected').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="dashboard-card dashboard-card-nohover">
                <div className="dashboard-card-title">
                    Documentos ({filteredDocuments.length})
                </div>
                <div className="dashboard-card-content2">
                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">No se encontraron documentos.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Estado</th>
                                        <th>Documento</th>
                                        <th>Proyecto</th>
                                        <th>Subido por</th>
                                        <th>Fecha</th>
                                        <th>Comentarios</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocuments.map((doc) => (
                                        <tr key={doc.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {getStatusIcon(doc.status)}
                                                    {getStatusBadge(doc.status)}
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-medium">{doc.name}</div>
                                                    <small className="text-muted">
                                                        {Math.round(doc.size / 1024)} KB
                                                    </small>
                                                </div>
                                            </td>
                                            <td>{doc.project}</td>
                                            <td>{doc.uploader}</td>
                                            <td>
                                                <small>
                                                    {new Date(doc.uploadDate).toLocaleDateString('es-ES')}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-1">
                                                    <MessageSquare className="w-4 h-4 text-muted" />
                                                    <span>{doc.comments.length}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleViewDocument(doc)}
                                                        title="Ver documento"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <a
                                                        href={doc.url}
                                                        className="btn btn-sm btn-outline-secondary"
                                                        download={doc.name}
                                                        title="Descargar"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Viewer */}
            {showViewer && selectedDocument && (
                <div>
                    <DocumentViewer
                        document={selectedDocument}
                        onClose={() => setShowViewer(false)}
                        onApprove={handleApproveDocument}
                        onReject={handleRejectDocument}
                        showActions={selectedDocument.status === 'pending'}
                    />
                    
                    {/* Comments Panel */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '80px',
                            right: '20px',
                            width: '350px',
                            maxHeight: 'calc(100vh - 100px)',
                            background: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1051,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div className="p-3 border-bottom">
                            <h6 className="mb-0">Comentarios</h6>
                        </div>
                        
                        <div className="flex-1 p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {selectedDocument.comments.length === 0 ? (
                                <p className="text-muted small">No hay comentarios aún.</p>
                            ) : (
                                selectedDocument.comments.map(comment => (
                                    <div key={comment.id} className="mb-3 p-2 bg-light rounded">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <small className="fw-medium">{comment.user}</small>
                                            <small className="text-muted">
                                                {new Date(comment.date).toLocaleDateString('es-ES')}
                                            </small>
                                        </div>
                                        <p className="mb-0 small">{comment.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="p-3 border-top">
                            <textarea
                                className="form-control mb-2"
                                rows="3"
                                placeholder="Agregar comentario..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="d-flex gap-2">
                                {selectedDocument.status === 'pending' ? (
                                    <>
                                        <button
                                            className="btn btn-sm btn-success flex-1"
                                            onClick={() => handleApproveDocument(selectedDocument)}
                                            disabled={!newComment.trim()}
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger flex-1"
                                            onClick={() => handleRejectDocument(selectedDocument)}
                                            disabled={!newComment.trim()}
                                        >
                                            Rechazar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="btn btn-sm btn-primary w-100"
                                        onClick={() => addComment(selectedDocument.id)}
                                        disabled={!newComment.trim()}
                                    >
                                        Comentar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentReview;