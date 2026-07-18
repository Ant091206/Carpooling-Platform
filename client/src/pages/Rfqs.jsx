import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Layers, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Rfqs() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Selection for Detail/Timeline Drawer
  const [selectedRfq, setSelectedRfq] = useState(null);

  // Form Drawer State
  const [showDrawer, setShowDrawer] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'IT Procurement',
    itemRequested: '',
    rfqCode: '',
    specifications: '',
    quantity: 5,
    status: 'Petrol', // Mapped to Petrol (Draft)
    priority: false
  });

  // Seeded mock RFQs to combine with database records for high fidelity
  const initialMockRfqs = [
    {
      id: 1,
      title: 'Design Station Upgrades',
      category: 'IT Procurement',
      itemRequested: 'Apple Studio Display 27"',
      rfqCode: 'RFQ-2026-001',
      specifications: 'Nano-texture glass, tilt-adjustable stand, AppleCare+',
      quantity: 4,
      status: 'Electric', // Approved
      priority: true,
      createdAt: '2026-07-10T10:00:00.000Z'
    },
    {
      id: 2,
      title: 'Executive Room Seating',
      category: 'Office Assets',
      itemRequested: 'Herman Miller Aeron Chair',
      rfqCode: 'RFQ-2026-002',
      specifications: 'Size B, Graphite, posturefit SL, fully adjustable arms',
      quantity: 8,
      status: 'Diesel', // Sent
      priority: false,
      createdAt: '2026-07-12T14:30:00.000Z'
    },
    {
      id: 3,
      title: 'Corporate HQ Network Router',
      category: 'IT Procurement',
      itemRequested: 'Cisco Catalyst 9300 Switch',
      rfqCode: 'RFQ-2026-004',
      specifications: '48 ports PoE+, Network Essentials licensing, dual power supply',
      quantity: 2,
      status: 'CNG', // Under Review
      priority: true,
      createdAt: '2026-07-15T09:00:00.000Z'
    }
  ];

  // Helper: translate fuel_type code to readable ERP RFQ status text
  const getStatusDetails = (fuelType) => {
    switch (fuelType) {
      case 'Petrol':
        return { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-200', step: 1 };
      case 'Diesel':
        return { label: 'Sent to Vendors', bg: 'bg-blue-50 text-blue-700 border-blue-200', step: 2 };
      case 'CNG':
        return { label: 'Under Review', bg: 'bg-amber-50 text-amber-700 border-amber-200', step: 3 };
      case 'Electric':
        return { label: 'Approved', bg: 'bg-green-50 text-green-700 border-green-200', step: 4 };
      case 'Hybrid':
        return { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200', step: 5 };
      default:
        return { label: 'Unknown', bg: 'bg-slate-150 text-slate-550 border-slate-200', step: 1 };
    }
  };

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      
      let backendRfqs = [];
      try {
        const res = await api.get('/vehicle');
        if (res.data?.data) {
          backendRfqs = res.data.data.map(v => ({
            id: v.id,
            title: v.vehicle_name,
            category: v.brand,
            itemRequested: v.model,
            rfqCode: v.registration_number,
            specifications: v.color || 'N/A',
            quantity: v.seat_capacity,
            status: v.fuel_type,
            priority: v.is_default || false,
            createdAt: v.created_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('Could not fetch RFQs/vehicles from server. Falling back to local.', err);
      }

      const savedRfqs = localStorage.getItem('erp-rfqs');
      if (savedRfqs) {
        let parsed = JSON.parse(savedRfqs);
        // Sync backend items that are missing
        backendRfqs.forEach(b => {
          if (!parsed.some(p => p.id === b.id && p.rfqCode === b.rfqCode)) {
            parsed = [b, ...parsed];
          }
        });
        setRfqs(parsed);
      } else {
        const combined = [...backendRfqs, ...initialMockRfqs];
        setRfqs(combined);
        localStorage.setItem('erp-rfqs', JSON.stringify(combined));
      }
    } catch (e) {
      setRfqs(initialMockRfqs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateRfq = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.itemRequested || !formData.rfqCode) {
      toast.error('Title, Item Name, and RFQ Code are required.');
      return;
    }

    setSubmitLoading(true);
    try {
      // Map to backend fields
      const payload = {
        vehicle_name: formData.title,
        brand: formData.category,
        model: formData.itemRequested,
        registration_number: formData.rfqCode.toUpperCase(),
        color: formData.specifications || 'N/A',
        fuel_type: formData.status, // e.g. Petrol
        seat_capacity: parseInt(formData.quantity, 10), // Limit is 1 to 10 on backend validator!
        is_default: formData.priority
      };

      let newRfq = null;
      try {
        const res = await api.post('/vehicle', payload);
        if (res.data?.data) {
          const v = res.data.data;
          newRfq = {
            id: v.id,
            title: v.vehicle_name,
            category: v.brand,
            itemRequested: v.model,
            rfqCode: v.registration_number,
            specifications: v.color || 'N/A',
            quantity: v.seat_capacity,
            status: v.fuel_type,
            priority: v.is_default || false,
            createdAt: v.created_at || new Date().toISOString()
          };
          toast.success('RFQ saved on backend.');
        }
      } catch (apiErr) {
        console.warn('Backend rejected creation of vehicle/RFQ. Adding locally.', apiErr);
        
        const generatedId = Date.now();
        newRfq = {
          id: generatedId,
          title: formData.title,
          category: formData.category,
          itemRequested: formData.itemRequested,
          rfqCode: formData.rfqCode.toUpperCase(),
          specifications: formData.specifications || 'N/A',
          quantity: parseInt(formData.quantity, 10),
          status: formData.status,
          priority: formData.priority,
          createdAt: new Date().toISOString()
        };
      }

      const updatedList = [newRfq, ...rfqs];
      setRfqs(updatedList);
      localStorage.setItem('erp-rfqs', JSON.stringify(updatedList));
      
      toast.success(`RFQ "${formData.title}" created successfully.`);
      setShowDrawer(false);
      
      // Reset form
      setFormData({
        title: '',
        category: 'IT Procurement',
        itemRequested: '',
        rfqCode: '',
        specifications: '',
        quantity: 5,
        status: 'Petrol',
        priority: false
      });
    } catch (e) {
      toast.error('Failed to create RFQ.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStatusChange = async (rfqId, newFuelType) => {
    try {
      const updatedList = rfqs.map(r => {
        if (r.id === rfqId) {
          const updated = { ...r, status: newFuelType };
          if (selectedRfq?.id === rfqId) {
            setSelectedRfq(updated);
          }
          return updated;
        }
        return r;
      });
      setRfqs(updatedList);
      localStorage.setItem('erp-rfqs', JSON.stringify(updatedList));

      // Try updating on backend (if it has matching ID)
      try {
        await api.put(`/vehicle/${rfqId}`, { fuel_type: newFuelType });
      } catch (e) {}

      toast.success('RFQ status updated successfully.');
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  // Filter lists
  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rfqCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.itemRequested.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#16A34A]" />
            <span>Requests for Quotations (RFQs)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Publish procurement items, track vendor submission deadlines, and monitor approval pipelines.
          </p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-green-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Procurement RFQ</span>
        </button>
      </div>

      {/* Grid: RFQs Table + Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table & Filters */}
        <div className={`space-y-4 ${selectedRfq ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>
          
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search RFQs by title, code or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none focus:bg-white focus:border-[#16A34A] transition-all text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="IT Procurement">IT Hardware</option>
                <option value="Office Assets">Office Assets</option>
                <option value="Operational Support">Operational Support</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none focus:bg-white focus:border-[#16A34A] transition-all text-slate-700 w-full md:w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="Petrol">Draft</option>
              <option value="Diesel">Sent</option>
              <option value="CNG">Under Review</option>
              <option value="Electric">Approved</option>
              <option value="Hybrid">Cancelled</option>
            </select>

          </div>

          {/* Listing Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#16A34A]" />
                <p className="text-xs font-semibold">Synchronizing RFQ records...</p>
              </div>
            ) : filteredRfqs.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">No RFQs Found</p>
                  <p className="text-xs text-slate-400 font-medium">Try adding a new request for quotation.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">RFQ Details</th>
                      <th className="px-6 py-4">Reference ID</th>
                      <th className="px-6 py-4">Item Requested</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Current Status</th>
                      <th className="px-6 py-4">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredRfqs.map((rfq) => {
                      const isSelected = selectedRfq?.id === rfq.id;
                      const status = getStatusDetails(rfq.status);
                      return (
                        <tr
                          key={rfq.id}
                          onClick={() => setSelectedRfq(rfq)}
                          className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-green-50/20 hover:bg-green-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm">{rfq.title}</span>
                                {rfq.priority && (
                                  <span className="bg-red-100 text-red-700 text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">{rfq.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">
                            {rfq.rfqCode}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-750">
                            {rfq.itemRequested}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {rfq.quantity} units
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.bg}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-semibold">
                            {new Date(rfq.createdAt).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Selected RFQ Timeline/Details Panel */}
        {selectedRfq && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6 relative animate-slide-up">
            
            {/* Close Toggle */}
            <button 
              onClick={() => setSelectedRfq(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Identity */}
            <div className="pb-4 border-b border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">{selectedRfq.title}</h3>
                {selectedRfq.priority && (
                  <span className="bg-red-50 text-red-650 text-[9px] font-extrabold px-2 py-0.2 rounded border border-red-200 uppercase">
                    Urgent
                  </span>
                )}
              </div>
              <p className="font-mono text-[10px] font-bold text-slate-400">{selectedRfq.rfqCode}</p>
            </div>

            {/* Specifications Details */}
            <div className="space-y-3.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Specifications</h4>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 leading-relaxed">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Item Requested</span>
                  <span className="text-slate-800 font-bold text-xs">{selectedRfq.itemRequested}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Requested Volume</span>
                  <span className="text-slate-800 font-bold">{selectedRfq.quantity} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Technical Specs</span>
                  <p className="text-slate-600 font-medium mt-0.5">{selectedRfq.specifications}</p>
                </div>
              </div>
            </div>

            {/* Timeline Progress Stepper */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Procurement Timeline</h4>
              
              <div className="relative border-l-2 border-slate-150 pl-5 ml-2.5 py-1 space-y-5">
                {/* Step 1: Draft */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 ${
                    getStatusDetails(selectedRfq.status).step >= 1 
                      ? 'bg-[#16A34A] border-[#16A34A] text-white' 
                      : 'bg-white border-slate-350 text-slate-400'
                  }`}>
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className={`font-bold ${getStatusDetails(selectedRfq.status).step >= 1 ? 'text-slate-950' : 'text-slate-400'}`}>Draft Created</p>
                    <p className="text-[10px] text-slate-400 font-semibold">RFQ specifications finalized.</p>
                  </div>
                </div>

                {/* Step 2: Sent */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 ${
                    getStatusDetails(selectedRfq.status).step >= 2 
                      ? 'bg-[#16A34A] border-[#16A34A] text-white' 
                      : 'bg-white border-slate-350 text-slate-400'
                  }`}>
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className={`font-bold ${getStatusDetails(selectedRfq.status).step >= 2 ? 'text-slate-950' : 'text-slate-400'}`}>Sent to Suppliers</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Bidding link published to vendors.</p>
                  </div>
                </div>

                {/* Step 3: Under Review */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 ${
                    getStatusDetails(selectedRfq.status).step >= 3 
                      ? 'bg-[#16A34A] border-[#16A34A] text-white' 
                      : 'bg-white border-slate-350 text-slate-400'
                  }`}>
                    3
                  </div>
                  <div className="space-y-0.5">
                    <p className={`font-bold ${getStatusDetails(selectedRfq.status).step >= 3 ? 'text-slate-950' : 'text-slate-400'}`}>Under Review</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Quotations received and compared.</p>
                  </div>
                </div>

                {/* Step 4: Approved */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 ${
                    getStatusDetails(selectedRfq.status).step >= 4 
                      ? 'bg-[#16A34A] border-[#16A34A] text-white' 
                      : 'bg-white border-slate-350 text-slate-400'
                  }`}>
                    4
                  </div>
                  <div className="space-y-0.5">
                    <p className={`font-bold ${getStatusDetails(selectedRfq.status).step >= 4 ? 'text-slate-950' : 'text-slate-400'}`}>Procurement Approved</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Approved by budget administration.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Attachment Repository Mock Section */}
            <div className="space-y-3.5 text-xs pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Technical Specifications</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    <span className="font-bold text-slate-700">specification_sheet.pdf</span>
                  </div>
                  <button 
                    onClick={() => toast.success('Mock download initiated.')}
                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Status Modifiers for Hackathon simulation */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Simulate Status Transition</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedRfq.id, 'Diesel')}
                  className="px-3 py-2 border border-slate-200 hover:border-blue-500 rounded-xl text-[10px] font-bold text-slate-600 hover:text-blue-600 text-center transition-all cursor-pointer"
                >
                  Send to Vendors
                </button>
                <button
                  onClick={() => handleStatusChange(selectedRfq.id, 'CNG')}
                  className="px-3 py-2 border border-slate-200 hover:border-amber-500 rounded-xl text-[10px] font-bold text-slate-600 hover:text-amber-600 text-center transition-all cursor-pointer"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleStatusChange(selectedRfq.id, 'Electric')}
                  className="px-3 py-2 border border-slate-200 hover:border-green-500 rounded-xl text-[10px] font-bold text-slate-600 hover:text-green-600 text-center transition-all cursor-pointer col-span-2"
                >
                  Approve Procurement
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* CREATE RFQ FORM DRAWER (RIGHT SLIDEOVER) */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDrawer(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-fade-in">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#16A34A]" />
                  <span>Create Procurement RFQ</span>
                </h3>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateRfq} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold text-slate-600">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Procurement Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-semibold"
                    placeholder="e.g. Design Studio Monitor Upgrades"
                    required
                  />
                </div>

                {/* RFQ Reference Code */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">RFQ Reference Code</label>
                  <input
                    type="text"
                    name="rfqCode"
                    value={formData.rfqCode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-semibold uppercase"
                    placeholder="e.g. RFQ-2026-005"
                    required
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Asset Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all text-slate-700"
                  >
                    <option value="IT Procurement">IT Hardware Procurement</option>
                    <option value="Office Assets">Office Assets & Furnishing</option>
                    <option value="Operational Support">Operational Support Services</option>
                  </select>
                </div>

                {/* Item Requested */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Specific Item Name</label>
                  <input
                    type="text"
                    name="itemRequested"
                    value={formData.itemRequested}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all font-semibold"
                    placeholder="e.g. Apple Studio Display 27-inch"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Quantity (Units / Batches)</label>
                    <span className="text-[10px] text-slate-400 font-bold">Max 10 per request</span>
                  </div>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    max="10"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all"
                    required
                  />
                  <div className="bg-amber-50 border border-amber-250 text-amber-850 p-2.5 rounded-lg flex items-start gap-1.5 text-[10px] font-medium leading-normal mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Backend table columns constraint restricts raw seat capacity between 1 and 10. For larger requirements, specify as batch boxes.</span>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Technical Specs & Notes</label>
                  <textarea
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none focus:border-[#16A34A] focus:bg-white transition-all leading-normal"
                    placeholder="Enter detailed model numbers, configurations, delivery location, and inspection terms..."
                  />
                </div>

                {/* Priority */}
                <div className="flex items-center gap-2.5 py-2 bg-slate-50/50 border border-slate-100 rounded-xl px-3.5">
                  <input
                    type="checkbox"
                    id="priority"
                    name="priority"
                    checked={formData.priority}
                    onChange={handleInputChange}
                    className="h-4.5 w-4.5 text-[#16A34A] border-slate-200 focus:ring-[#16A34A]"
                  />
                  <label htmlFor="priority" className="font-bold text-slate-800 text-xs cursor-pointer select-none">
                    Mark RFQ as High Priority / Urgent
                  </label>
                </div>

              </form>

              {/* Action Buttons */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3.5 bg-slate-50/20">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRfq}
                  disabled={submitLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-md shadow-green-600/10 cursor-pointer disabled:bg-green-400"
                >
                  {submitLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Submit RFQ</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
