import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Eye, Download, Plus, Search, Filter, FileText, Image, File } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import DocumentViewer from './DocumentViewer';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const DocumentManager = ({ projectId = null, showProjectFilter = true }) => {
    const [documents, setDocuments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(projectId || '');
    const [selectedDocument, setSelectedDocument] = useState(null);
    
    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewerModal, setShowViewerModal] = useState(false);
    
    // Form states
    const [documentForm, setDocumentForm] = useState({
        nombre: '',
        descripcion: '',
        proyecto: projectId || '',
        archivo: null
    });
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Load data
    useEffect(() => {
        loadDocuments();
        if (showProjectFilter) {
            loadProjects();
        }
    }, [selectedProject]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/documentos/');
            let docs = response.data;
            
            // Filter by project if selected
            if (selectedProject) {
                docs = docs.filter(doc => doc.proyecto == selectedProject);
            }
            
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/proyectos/');
            setProjects(response.data);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    // CRUD Operations
    const handleAddDocument = async () => {
        if (uploadedFiles.length === 0) {
            alert('Por favor selecciona al menos un archivo');
            return;
        }

        try {
            for (const fileData of uploadedFiles) {
                const formData = new FormData();
                formData.append('archivo', fileData.file);
                formData.append('nombre', documentForm.nombre || fileData.name);
                formData.append('descripcion', documentForm.descripcion);
                formData.append('proyecto', documentForm.proyecto);

                await axios.post('http://127.0.0.1:8000/api/documentos/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setShowAddModal(false);
            resetForm();
            loadDocuments();
            alert('Documentos agregados exitosamente');
        } catch (error) {
            console.error('Error adding documents:', error);
            alert('Error al agregar documentos');
        }
    };

    const handleEditDocument = async () => {
        try {
            const formData = new FormData();
            formData.append('nombre', documentForm.nombre);
            formData.append('descripcion', documentForm.descripcion);
            formData.append('proyecto', documentForm.proyecto);
            
            if (uploadedFiles.length > 0) {
                formData.append('archivo', uploadedFiles[0].file);
            }

            await axios.put(`http://127.0.0.1:8000/api/documentos/${selectedDocument.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowEditModal(false);
            resetForm();
            loadDocuments();
            alert('Documento actualizado exitosamente');
        } catch (error) {
            console.error('Error updating document:', error);
            alert('Error al actualizar documento');
        }
    };

    const handleDeleteDocument = async () => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/documentos/${selectedDocument.id}/`);
            setShowDeleteModal(false);
            setSelectedDocument(null);
            loadDocuments();
            alert('Documento eliminado exitosamente');
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error al eliminar documento');
        }
    };

    const resetForm = () => {
        setDocumentForm({
            nombre: '',
            descripcion: '',
            proyecto: projectId || '',
            archivo: null
        });
        setUploadedFiles([]);
        setSelectedDocument(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (doc) => {
        setSelectedDocument(doc);
        setDocumentForm({
            nombre: doc.nombre,
            descripcion: doc.descripcion || '',
            proyecto: doc.proyecto,
            archivo: null
        });
        setUploadedFiles([]);
        setShowEditModal(true);
    };

    const openDeleteModal = (doc) => {
        setSelectedDocument(doc);
        setShowDeleteModal(true);
    };

    const openViewer = (doc) => {
        setSelectedDocument(doc);
        setShowViewerModal(true);
    };

    const downloadDocument = (doc) => {
        window.open(doc.archivo, '_blank');
    };

    const getFileIcon = (fileName) => {
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

    const formatFileSize = (url) => {
        // This would need to be implemented on the backend to return file size
        return 'N/A';
    };

    const filteredDocuments = documents.filter(doc =>
        doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.descripcion && doc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="document-manager">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="h4 text-dark">Gestión de Documentos</h2>
                    <p className="text-muted">
                        {projectId ? 'Documentos del proyecto' : 'Administra todos los documentos del sistema'}
                    </p>
                </div>
                <button
                    className="btn"
                    style={{ backgroundColor: '#7b4d1d', color: 'white', borderColor: '#7b4d1d' }}
                    onClick={openAddModal}
                >
                    <Plus className="w-4 h-4 me-2" />
                    Agregar Documento
                </button>
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
                                    placeholder="Buscar documentos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        {showProjectFilter && (
                            <div className="col-md-6">
                                <select
                                    className="form-select"
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                >
                                    <option value="">Todos los proyectos</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="dashboard-card">
                <div className="dashboard-card-title">
                    Documentos ({filteredDocuments.length})
                </div>
                <div className="dashboard-card-content2">
                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-5">
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">No hay documentos disponibles</p>
                            <button
                                className="btn btn-primary"
                                onClick={openAddModal}
                            >
                                Agregar primer documento
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>Tipo</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        {showProjectFilter && <th>Proyecto</th>}
                                        <th style={{ width: '150px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocuments.map(doc => (
                                        <tr key={doc.id}>
                                            <td className="text-center">
                                                {getFileIcon(doc.nombre)}
                                            </td>
                                            <td>
                                                <div className="fw-medium">{doc.nombre}</div>
                                                <small className="text-muted">
                                                    {formatFileSize(doc.archivo)}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="text-muted">
                                                    {doc.descripcion || 'Sin descripción'}
                                                </span>
                                            </td>
                                            {showProjectFilter && (
                                                <td>
                                                    {projects.find(p => p.id === doc.proyecto)?.nombre || 'N/A'}
                                                </td>
                                            )}
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => openViewer(doc)}
                                                        title="Ver documento"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-success"
                                                        onClick={() => downloadDocument(doc)}
                                                        title="Descargar"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-warning"
                                                        onClick={() => openEditModal(doc)}
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => openDeleteModal(doc)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

            {/* Add Document Modal */}
            {showAddModal && (
                <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Agregar Documento</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAddModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombre del documento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={documentForm.nombre}
                                        onChange={(e) => setDocumentForm({
                                            ...documentForm,
                                            nombre: e.target.value
                                        })}
                                        placeholder="Nombre del documento (opcional)"
                                    />
                                    <small className="text-muted">
                                        Si no se especifica, se usará el nombre del archivo
                                    </small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={documentForm.descripcion}
                                        onChange={(e) => setDocumentForm({
                                            ...documentForm,
                                            descripcion: e.target.value
                                        })}
                                        placeholder="Descripción del documento"
                                    />
                                </div>
                                {showProjectFilter && (
                                    <div className="mb-3">
                                        <label className="form-label">Proyecto</label>
                                        <select
                                            className="form-select"
                                            value={documentForm.proyecto}
                                            onChange={(e) => setDocumentForm({
                                                ...documentForm,
                                                proyecto: e.target.value
                                            })}
                                            required
                                        >
                                            <option value="">Seleccionar proyecto</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Archivos</label>
                                    <DocumentUpload
                                        onFileSelect={setUploadedFiles}
                                        multiple={true}
                                        previewEnabled={true}
                                        existingFiles={uploadedFiles}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddDocument}
                                    disabled={!documentForm.proyecto || uploadedFiles.length === 0}
                                >
                                    Agregar Documentos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Document Modal */}
            {showEditModal && selectedDocument && (
                <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Documento</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombre del documento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={documentForm.nombre}
                                        onChange={(e) => setDocumentForm({
                                            ...documentForm,
                                            nombre: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={documentForm.descripcion}
                                        onChange={(e) => setDocumentForm({
                                            ...documentForm,
                                            descripcion: e.target.value
                                        })}
                                    />
                                </div>
                                {showProjectFilter && (
                                    <div className="mb-3">
                                        <label className="form-label">Proyecto</label>
                                        <select
                                            className="form-select"
                                            value={documentForm.proyecto}
                                            onChange={(e) => setDocumentForm({
                                                ...documentForm,
                                                proyecto: e.target.value
                                            })}
                                            required
                                        >
                                            <option value="">Seleccionar proyecto</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">
                                        Reemplazar archivo (opcional)
                                    </label>
                                    <DocumentUpload
                                        onFileSelect={setUploadedFiles}
                                        multiple={false}
                                        previewEnabled={true}
                                        existingFiles={uploadedFiles}
                                    />
                                    <small className="text-muted">
                                        Solo selecciona un archivo si deseas reemplazar el actual
                                    </small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Archivo actual</label>
                                    <div className="d-flex align-items-center gap-2">
                                        {getFileIcon(selectedDocument.nombre)}
                                        <span>{selectedDocument.nombre}</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openViewer(selectedDocument)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleEditDocument}
                                    disabled={!documentForm.nombre || !documentForm.proyecto}
                                >
                                    Actualizar Documento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedDocument && (
                <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar Eliminación</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="me-3">
                                        {getFileIcon(selectedDocument.nombre)}
                                    </div>
                                    <div>
                                        <h6 className="mb-1">{selectedDocument.nombre}</h6>
                                        <p className="text-muted mb-0">
                                            {selectedDocument.descripcion || 'Sin descripción'}
                                        </p>
                                    </div>
                                </div>
                                <div className="alert alert-warning">
                                    <strong>¿Estás seguro?</strong> Esta acción no se puede deshacer.
                                    El archivo se eliminará permanentemente del sistema.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteDocument}
                                >
                                    <Trash2 className="w-4 h-4 me-2" />
                                    Eliminar Documento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {showViewerModal && selectedDocument && (
                <DocumentViewer
                    document={selectedDocument}
                    onClose={() => setShowViewerModal(false)}
                />
            )}
        </div>
    );
};

export default DocumentManager;