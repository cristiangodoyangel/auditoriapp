import React from 'react';
import DocumentManager from '../components/DocumentManager';
import '../index.css';

const Documentos = () => {
    return (
        <div className="container py-4">
            <DocumentManager showProjectFilter={true} />
        </div>
    );
};

export default Documentos;