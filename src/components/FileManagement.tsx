import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Calendar,
  Tag,
  X,
  Save,
  Upload,
  Download,
  Eye,
  Clock,
  Grid,
  List as ListIcon,
  Pin,
  PinOff
} from 'lucide-react';
import { Category, User } from '../types';

interface FileData {
  id: string;
  name: string;
  category_id: string;
  spreadsheet_url: string;
  created_at: string;
  updated_at: string;
  file_size?: number;
  description?: string;
  is_pinned?: boolean;
}

interface FileManagementProps {
  categories: Category[];
  currentUser: User;
}

const FileManagement: React.FC<FileManagementProps> = ({ categories, currentUser }) => {
  // Files state - starts empty, will be populated from database in real implementation
  const [files, setFiles] = useState<FileData[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showModal, setShowModal] = useState(false);
  const [editingFile, setEditingFile] = useState<FileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    spreadsheet_url: '',
    description: '',
  });

  // Check if current user is superadmin
  const isAdmin = currentUser.role === 'superadmin';

  const getCategoryName = (categoryId: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getCategoryColor = (categoryId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    const index = categories.findIndex(cat => cat.id === categoryId);
    return colors[index % colors.length] || 'bg-gray-100 text-gray-800';
  };

  // Filter files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getCategoryName(file.category_id).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || file.category_id === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [files, searchTerm, categoryFilter, categories]);

  // Sort files: pinned first, then by date (newest first)
  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      // First sort by pinned status
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      // Then sort by date (newest first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [filteredFiles]);

  const pinnedFiles = sortedFiles.filter(file => file.is_pinned);
  const unpinnedFiles = sortedFiles.filter(file => !file.is_pinned);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    if (editingFile) {
      setFiles(prev => prev.map(file => 
        file.id === editingFile.id 
          ? { ...file, ...formData, updated_at: now }
          : file
      ));
    } else {
      const newFile: FileData = {
        id: Date.now().toString(),
        ...formData,
        created_at: now,
        updated_at: now,
        file_size: Math.floor(Math.random() * 4000) + 500, // Random size for demo
        is_pinned: false,
      };
      setFiles(prev => [newFile, ...prev]);
    }
    
    closeModal();
  };

  const handleEdit = (file: FileData) => {
    setEditingFile(file);
    setFormData({
      name: file.name,
      category_id: file.category_id,
      spreadsheet_url: file.spreadsheet_url,
      description: file.description || '',
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingFile(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      spreadsheet_url: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(file => file.id !== id));
    }
  };

  const handleTogglePin = (id: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, is_pinned: !file.is_pinned, updated_at: new Date().toISOString() }
        : file
    ));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFile(null);
    setFormData({
      name: '',
      category_id: '',
      spreadsheet_url: '',
      description: '',
    });
  };

  const openSpreadsheet = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
            <p className="text-gray-600">
              {isAdmin ? 'Manage your spreadsheets and documents' : 'View available spreadsheets and documents'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={handleAdd}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add File</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{files.length}</div>
                <p className="text-sm text-gray-600">Total Files</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                <Pin className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pinnedFiles.length}</div>
                <p className="text-sm text-gray-600">Pinned Files</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {files.filter(f => f.spreadsheet_url).length}
                </div>
                <p className="text-sm text-gray-600">Linked Sheets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search files by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pinned Files Section */}
        {pinnedFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Pin className="w-5 h-5 text-yellow-600" />
                <span>Pinned Files</span>
              </h2>
              <span className="text-sm text-gray-500">{pinnedFiles.length} pinned files</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedFiles.map((file) => (
                <div key={file.id} className="bg-white rounded-xl border-2 border-yellow-200 bg-yellow-50 p-6 hover:shadow-lg transition-shadow relative">
                  <div className="absolute top-3 right-3">
                    <Pin className="w-4 h-4 text-yellow-600" />
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 pr-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{file.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(file.category_id)}`}>
                          {getCategoryName(file.category_id)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {file.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{file.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(file.updated_at)}</span>
                    </span>
                    <span>{formatFileSize(file.file_size)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => openSpreadsheet(file.spreadsheet_url)}
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">Open Sheet</span>
                    </button>
                    
                    {isAdmin && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTogglePin(file.id)}
                          className="p-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                          title="Unpin file"
                        >
                          <PinOff className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(file)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Files List */}
        {unpinnedFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">All Files</h2>
              <span className="text-sm text-gray-500">{unpinnedFiles.length} files</span>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unpinnedFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{file.name}</div>
                              {file.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{file.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(file.category_id)}`}>
                            {getCategoryName(file.category_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(file.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(file.file_size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => openSpreadsheet(file.spreadsheet_url)}
                              className="text-purple-600 hover:text-purple-700 transition-colors"
                              title="Open Spreadsheet"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleTogglePin(file.id)}
                                  className="text-gray-400 hover:text-yellow-600 transition-colors"
                                  title="Pin File"
                                >
                                  <Pin className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(file)}
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Edit File"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(file.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                  title="Delete File"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Files State */}
        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {files.length === 0 ? 'No files yet' : 'No files match your search'}
            </h3>
            <p className="text-gray-600 mb-4">
              {files.length === 0 
                ? isAdmin 
                  ? 'Get started by adding your first file'
                  : 'No files have been added yet'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {files.length === 0 && isAdmin && (
              <button
                onClick={handleAdd}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Your First File
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal - Only show for admin */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingFile ? 'Edit File' : 'Add New File'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter file name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spreadsheet URL *
                  </label>
                  <input
                    type="url"
                    value={formData.spreadsheet_url}
                    onChange={(e) => setFormData({ ...formData, spreadsheet_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full URL to your Google Sheets or Excel Online document
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter file description (optional)"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingFile ? 'Update' : 'Add'} File</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileManagement;
