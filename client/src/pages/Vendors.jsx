import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  ExternalLink, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Vendors() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Vendor for Profile Drawer
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    companyCode: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    status: 'ACTIVE'
  });

  // Seeded mock suppliers to blend with database records
  const initialMockSuppliers = [
    { id: 101, name: 'Dell Technologies', companyCode: 'DELL789', email: 'corporate@dell.com', phone: '1-800-456-3355', address: '1 Dell Way, Round Rock, TX', website: 'https://dell.com', status: 'ACTIVE' },
    { id: 102, name: 'Microsoft Enterprise', companyCode: 'MSFT456', email: 'licensing@microsoft.com', phone: '1-800-642-7676', address: 'One Microsoft Way, Redmond, WA', website: 'https://microsoft.com', status: 'ACTIVE' },
    { id: 103, name: 'Acme Procurement Corp', companyCode: 'ACME001', email: 'bids@acme.com', phone: '1-888-555-0100', address: '456 industrial Blvd, Chicago, IL', website: 'https://acme.com', status: 'SUSPENDED' },
    { id: 104, name: 'HP Commercial Division', companyCode: 'HPE990', email: 'sales@hp.com', phone: '1-800-752-0900', address: '1501 Page Mill Rd, Palo Alto, CA', website: 'https://hp.com', status: 'ACTIVE' },
    { id: 105, name: 'Staples Business Supplies', companyCode: 'STAP220', email: 'support@staples.com', phone: '1-800-333-3330', address: '500 Staples Dr, Framingham, MA', website: 'https://staples.com', status: 'INACTIVE' }
  ];

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      // Try to load own organization
      let ownOrg = null;
      try {
        const res = await api.get('/organization');
        if (res.data?.data) {
          ownOrg = {
            id: res.data.data.id,
            name: res.data.data.name,
            companyCode: res.data.data.companyCode,
            email: res.data.data.email,
            phone: res.data.data.phone || 'N/A',
            address: res.data.data.address || 'N/A',
            website: res.data.data.website || 'N/A',
            status: res.data.data.status || 'ACTIVE'
          };
        }
      } catch (err) {
        console.warn('Could not fetch own organization details from backend', err);
      }

      // Merge backend organization with mock suppliers list
      const savedVendors = localStorage.getItem('erp-vendors');
      if (savedVendors) {
        let parsed = JSON.parse(savedVendors);
        if (ownOrg && !parsed.some(v => v.id === ownOrg.id)) {
          parsed = [ownOrg, ...parsed];
        }
        setVendors(parsed);
      } else {
        const combined = ownOrg ? [ownOrg, ...initialMockSuppliers] : initialMockSuppliers;
        setVendors(combined);
        localStorage.setItem('erp-vendors', JSON.stringify(combined));
      }
    } catch (e) {
      console.error(e);
      setVendors(initialMockSuppliers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const openAddModal = () => {
    setFormData({
      id: '',
      name: '',
      companyCode: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      status: 'ACTIVE'
    });
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (vendor) => {
    setFormData({ ...vendor });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.companyCode || !formData.email) {
      toast.error('Name, Code, and Email are required fields.');
      return;
    }

    setModalLoading(true);
    try {
      if (modalMode === 'add') {
        // Prepare payload for backend Organization Creation
        const payload = {
          name: formData.name,
          companyCode: formData.companyCode,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          website: formData.website || null,
          status: formData.status
        };

        let newVendor = null;
        
        // Make backend call (only ADMIN roles can execute successfully)
        try {
          const res = await api.post('/organization', payload);
          if (res.data?.data) {
            newVendor = res.data.data;
            toast.success('Vendor registered on backend successfully.');
          }
        } catch (apiErr) {
          console.warn('Backend rejected creation (likely due to role or constraint). Adding locally.', apiErr);
          
          if (apiErr.response?.status === 403) {
            toast.error('Only Admins can write to database. Added to local session instead.');
          }
          
          // Generate a local mock id
          newVendor = {
            id: Date.now(),
            ...payload
          };
        }

        // Add to state and storage
        const updatedList = [newVendor, ...vendors];
        setVendors(updatedList);
        localStorage.setItem('erp-vendors', JSON.stringify(updatedList));
        toast.success(`Vendor "${formData.name}" added successfully.`);
      } else {
        // Edit Mode
        const payload = {
          name: formData.name,
          companyCode: formData.companyCode,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          website: formData.website || null,
          status: formData.status
        };

        // Try put call on backend
        try {
          await api.put(`/organization/${formData.id}`, payload);
          toast.success('Vendor details modified on server.');
        } catch (apiErr) {
          console.warn('Backend rejected update (requires Admin role). Saved locally.', apiErr);
          if (apiErr.response?.status === 403) {
            toast.error('Only Admins can modify server records. Updated local session.');
          }
        }

        // Update locally
        const updatedList = vendors.map(v => v.id === formData.id ? { ...v, ...payload } : v);
        setVendors(updatedList);
        localStorage.setItem('erp-vendors', JSON.stringify(updatedList));
        
        if (selectedVendor?.id === formData.id) {
          setSelectedVendor({ ...selectedVendor, ...payload });
        }
        
        toast.success(`Vendor details updated.`);
      }
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to submit form.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteVendor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove vendor "${name}"?`)) return;

    try {
      // Try delete on backend
      try {
        await api.delete(`/organization/${id}`);
        toast.success('Vendor deleted from database.');
      } catch (apiErr) {
        console.warn('Server rejected deletion (requires Admin role). Removed locally.', apiErr);
      }

      const updatedList = vendors.filter(v => v.id !== id);
      setVendors(updatedList);
      localStorage.setItem('erp-vendors', JSON.stringify(updatedList));
      
      if (selectedVendor?.id === id) {
        setSelectedVendor(null);
      }
      toast.success(`Vendor "${name}" removed from register.`);
    } catch (e) {
      toast.error('Deletion failed.');
    }
  };

  // Filters and Searches
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.companyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate items for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#16A34A]" />
            <span>Supplier Directory</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage enterprise-approved manufacturers, logistics vendors, and software suppliers.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-green-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Main Grid: Directory Table + Selected Drawer Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Listing & Filters */}
        <div className={`space-y-4 ${selectedVendor ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>
          
          {/* Controls: Search, Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor by name, code or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none focus:bg-white focus:border-[#16A34A] transition-all text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Approved (Active)</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

          </div>

          {/* Vendors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#16A34A]" />
                <p className="text-xs font-semibold">Synchronizing Vendor registries...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">No vendors registered</p>
                  <p className="text-xs text-slate-400 font-medium">Try matching other search query filters.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Company Details</th>
                      <th className="px-6 py-4">Supplier Code</th>
                      <th className="px-6 py-4">Commercial Website</th>
                      <th className="px-6 py-4">Compliance Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {currentItems.map((vendor) => {
                      const isSelected = selectedVendor?.id === vendor.id;
                      return (
                        <tr 
                          key={vendor.id}
                          onClick={() => setSelectedVendor(vendor)}
                          className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-green-50/20 hover:bg-green-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center font-bold text-slate-500">
                              {vendor.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm group-hover:text-[#16A34A]">{vendor.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{vendor.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">
                            {vendor.companyCode}
                          </td>
                          <td className="px-6 py-4">
                            {vendor.website && vendor.website !== 'N/A' ? (
                              <a 
                                href={vendor.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[#16A34A] hover:underline font-semibold"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                <span>Visit Web</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {vendor.status === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                APPROVED
                              </span>
                            )}
                            {vendor.status === 'INACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                INACTIVE
                              </span>
                            )}
                            {vendor.status === 'SUSPENDED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                SUSPENDED
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(vendor)}
                                className="p-1.5 hover:bg-slate-100 hover:text-[#16A34A] rounded-lg transition-all"
                                title="Edit Vendor Details"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-650 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                title="Remove Vendor"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500">
              <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} Suppliers</span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all ${
                      currentPage === i + 1 
                        ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-md shadow-green-600/10' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Selected Supplier Details Panel Drawer */}
        {selectedVendor && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6 relative animate-slide-up">
            
            {/* Close toggle */}
            <button 
              onClick={() => setSelectedVendor(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Identity Card */}
            <div className="text-center pb-5 border-b border-slate-100 space-y-3">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-2xl font-extrabold text-[#16A34A]">
                {selectedVendor.name[0].toUpperCase()}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">{selectedVendor.name}</h3>
                <span className="font-mono text-[10px] font-bold text-slate-400">{selectedVendor.companyCode}</span>
              </div>
              <div>
                {selectedVendor.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">
                    APPROVED SUPPLIER
                  </span>
                )}
                {selectedVendor.status === 'INACTIVE' && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                    INACTIVE REGISTER
                  </span>
                )}
                {selectedVendor.status === 'SUSPENDED' && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-750 border border-red-200">
                    SUSPENDED COMPLIANCE
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-4 text-xs font-semibold text-slate-500">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Contact Credentials</h4>
              
              <div className="flex items-start gap-3">
                <Mail className="h-4.5 w-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">EMAIL ADDRESS</span>
                  <a href={`mailto:${selectedVendor.email}`} className="text-slate-800 hover:text-[#16A34A]">{selectedVendor.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4.5 w-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">PHONE NUMBER</span>
                  <span className="text-slate-800">{selectedVendor.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-4.5 w-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">WEBSITE URL</span>
                  <a 
                    href={selectedVendor.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#16A34A] hover:underline"
                  >
                    {selectedVendor.website}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">STREET ADDRESS</span>
                  <span className="text-slate-850 text-slate-800 leading-normal block">{selectedVendor.address}</span>
                </div>
              </div>
            </div>

            {/* Edit trigger */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => openEditModal(selectedVendor)}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Modify Vendor Profile
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ADD / EDIT VENDOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative animate-slide-up space-y-6">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#16A34A]" />
                <span>{modalMode === 'add' ? 'Register Supplier' : 'Edit Supplier Credentials'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Vendor Name */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Vendor Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-semibold"
                    placeholder="e.g. Lenovo Commercial Corp"
                    required
                  />
                </div>

                {/* Company Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Supplier Code</label>
                  <input
                    type="text"
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-semibold uppercase"
                    placeholder="e.g. LENOVO88"
                    required
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-semibold"
                    placeholder="sales@supplier.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all"
                    placeholder="e.g. 1-800-555-1234"
                  />
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Website URL</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-semibold"
                    placeholder="https://supplier.com"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Compliance Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-bold text-slate-700"
                  >
                    <option value="ACTIVE">Approved Supplier (Active)</option>
                    <option value="INACTIVE">Inactive supplier list</option>
                    <option value="SUSPENDED">Suspended compliance lock</option>
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Location Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all leading-normal"
                    placeholder="Enter street suite and location postal code..."
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-md shadow-green-600/10 cursor-pointer disabled:bg-green-400"
                >
                  {modalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{modalMode === 'add' ? 'Register Vendor' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
