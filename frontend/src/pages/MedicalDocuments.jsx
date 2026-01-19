import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Upload, 
  X, 
  Download,
  Trash2,
  FolderOpen,
  File,
  Image as ImageIcon
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MedicalDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const documentTypes = ['X-Ray', 'MRI', 'Prescription', 'Lab Report'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/documents`);
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e, type) => {
    e.preventDefault();
    const fileInput = e.target.file;
    const notesInput = e.target.notes;
    
    if (!fileInput.files[0]) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('document', fileInput.files[0]);
    formData.append('documentType', type);
    formData.append('notes', notesInput.value);

    setUploading(true);
    try {
      await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Document uploaded successfully!');
      setUploadModal(false);
      setSelectedType('');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/documents/${documentId}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredDocuments = activeFilter === 'all'
    ? documents
    : documents.filter((doc) => doc.documentType === activeFilter);

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <ImageIcon className="text-blue-600" size={24} />;
    }
    return <File className="text-gray-600" size={24} />;
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'X-Ray': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'MRI': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Prescription': return 'bg-green-100 text-green-700 border-green-300';
      case 'Lab Report': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-10 h-10" />
              <h1 className="text-3xl font-bold">Medical Documents Vault</h1>
            </div>
            <p className="text-primary-100">Securely store and manage your medical records</p>
          </div>
          <button
            onClick={() => setUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-all shadow-lg"
          >
            <Upload size={20} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Documents ({documents.length})
          </button>
          {documentTypes.map(type => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeFilter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* All Documents Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">All Documents</h2>
            <p className="text-sm text-gray-500">
              Showing: {activeFilter === 'all' ? 'All Documents' : activeFilter}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {documents.length} • Visible: {filteredDocuments.length}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg mb-4">
              {activeFilter === 'all' ? 'No documents found' : `No ${activeFilter} documents`}
            </p>
            <p className="text-gray-400 text-sm">Upload a document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <div
                key={doc._id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.fileName)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {doc.fileName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${getDocumentTypeColor(doc.documentType)}`}>
                  {doc.documentType}
                </div>

                {doc.notes && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {doc.notes}
                  </p>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  Size: {(doc.fileSize / 1024).toFixed(2)} KB
                </div>

                <div className="flex gap-2">
                  <a
                    href={`${API_URL}${doc.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 font-semibold rounded-lg hover:bg-primary-200 transition-all"
                  >
                    <Download size={16} />
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="px-3 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Upload Medical Document</h3>
              <button
                onClick={() => {
                  setUploadModal(false);
                  setSelectedType('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {!selectedType ? (
              <div className="grid grid-cols-2 gap-4">
                {documentTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                  >
                    <FileText className="mx-auto mb-3 text-primary-600" size={32} />
                    <p className="font-semibold text-gray-800">{type}</p>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={(e) => handleUpload(e, selectedType)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <div className={`px-4 py-3 rounded-lg border-2 font-semibold ${getDocumentTypeColor(selectedType)}`}>
                    {selectedType}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    name="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supported: PDF, JPG, PNG, DOC (Max 20MB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add any notes about this document..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedType('')}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDocuments;
