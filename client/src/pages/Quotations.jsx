import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Layers, 
  Check, 
  X, 
  ArrowUpRight, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  AlertTriangle,
  Building2,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quotations() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock initial quotations linked to seeded RFQs for immediate high fidelity UI
  const initialMockQuotations = [
    {
      id: 11,
      rfqId: 1, // Linked to RFQ-2026-001 (Studio Display, Qty: 4)
      vendorName: 'Dell Technologies Inc.',
      vendorCode: 'DELL789',
      unitPrice: 1399,
      totalPrice: 5596,
      leadTimeDays: 5,
      specDetails: 'Dell UltraSharp 27" alternative. IPS black panel, 100% sRGB, 3-year warranty included.',
      status: 'Scheduled', // Submitted
      score: 85
    },
    {
      id: 12,
      rfqId: 1, // Linked to RFQ-2026-001 (Studio Display, Qty: 4)
      vendorName: 'Apple Enterprise Store',
      vendorCode: 'APPLE02',
      unitPrice: 1599,
      totalPrice: 6396,
      leadTimeDays: 2,
      specDetails: 'Official Apple Studio Displays with standard glass and tilt-adjustable stand. Next-day dispatch.',
      status: 'Scheduled', // Submitted
      score: 92 // Highlighted as best because of official match + fast delivery
    },
    {
      id: 13,
      rfqId: 1, // Linked to RFQ-2026-001 (Studio Display, Qty: 4)
      vendorName: 'Acme Commercial Solutions',
      vendorCode: 'ACME001',
      unitPrice: 1350,
      totalPrice: 5400,
      leadTimeDays: 14,
      specDetails: 'OEM alternative monitor supplier. Extended lead time but lowest bid pricing.',
      status: 'Scheduled', // Submitted
      score: 78
    },
    {
      id: 21,
      rfqId: 2, // Linked to RFQ-2026-002 (Herman Miller, Qty: 8)
      vendorName: 'Acme Commercial Solutions',
      vendorCode: 'ACME001',
      unitPrice: 1150,
      totalPrice: 9200,
      leadTimeDays: 6,
      specDetails: 'Official Herman Miller retail reseller. Standard postureshift support included.',
      status: 'Scheduled',
      score: 88
    },
    {
      id: 22,
      rfqId: 2, // Linked to RFQ-2026-002 (Herman Miller, Qty: 8)
      vendorName: 'Staples Business Supplies',
      vendorCode: 'STAP220',
      unitPrice: 1080,
      totalPrice: 8640,
      leadTimeDays: 10,
      specDetails: 'Volume discount pricing on commercial ergonomics chairs. Equivalent posturefit SL support.',
      status: 'Scheduled',
      score: 90 // Best price
    }
  ];

  // Helper status translations
  const getQuotationStatus = (rideStatus) => {
    switch (rideStatus) {
      case 'Scheduled':
        return { label: 'Pending Review', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'Started':
        return { label: 'Under Negotiation', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'Completed':
        return { label: 'Accepted (Approved)', bg: 'bg-green-50 text-green-700 border-green-200' };
      case 'Cancelled':
        return { label: 'Rejected (Cancelled)', bg: 'bg-red-50 text-red-750 border-red-200' };
      default:
        return { label: 'Submitted', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch RFQs/Vehicles to fill dropdown
      let loadedRfqs = [];
      try {
        const res = await api.get('/vehicle');
        if (res.data?.data) {
          loadedRfqs = res.data.data.map(v => ({
            id: v.id,
            title: v.vehicle_name,
            rfqCode: v.registration_number,
            quantity: v.seat_capacity
          }));
        }
      } catch (e) {}

      // Add mock RFQs if empty
      if (loadedRfqs.length === 0) {
        loadedRfqs = [
          { id: 1, title: 'Design Station Upgrades', rfqCode: 'RFQ-2026-001', quantity: 4 },
          { id: 2, title: 'Executive Room Seating', rfqCode: 'RFQ-2026-002', quantity: 8 },
          { id: 3, title: 'Corporate HQ Network Router', rfqCode: 'RFQ-2026-004', quantity: 2 }
        ];
      }
      setRfqs(loadedRfqs);

      // Select first RFQ by default
      const defaultId = loadedRfqs[0]?.id.toString() || '';
      setSelectedRfqId(defaultId);
      
      // 2. Fetch Quotations/Rides
      let backendQuotes = [];
      try {
        const res = await api.get('/rides/my');
        if (res.data?.data) {
          backendQuotes = res.data.data.map(r => ({
            id: r.id,
            rfqId: r.vehicle_id,
            vendorName: r.pickup_name,
            vendorCode: 'SUPPLIER-' + r.driver_id,
            unitPrice: parseFloat(r.fare_per_seat),
            totalPrice: parseFloat(r.fare_per_seat) * r.available_seats,
            leadTimeDays: r.distance_km ? Math.ceil(r.distance_km / 10) : 5,
            specDetails: r.notes || 'No terms description provided.',
            status: r.ride_status,
            score: 80
          }));
        }
      } catch (e) {}

      const savedQuotes = localStorage.getItem('erp-quotations');
      let combinedQuotes = initialMockQuotations;
      if (savedQuotes) {
        combinedQuotes = JSON.parse(savedQuotes);
      }
      
      // Merge backend items
      backendQuotes.forEach(bq => {
        if (!combinedQuotes.some(cq => cq.id === bq.id)) {
          combinedQuotes = [bq, ...combinedQuotes];
        }
      });

      setQuotations(combinedQuotes);
      localStorage.setItem('erp-quotations', JSON.stringify(combinedQuotes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveQuote = async (quoteId, vendorName) => {
    if (!window.confirm(`Are you sure you want to ACCEPT the quotation from "${vendorName}"?`)) return;

    setActionLoading(true);
    try {
      // 1. Try to call backend ride status updates
      try {
        // Complete the approved ride (accept quotation)
        await api.patch(`/rides/${quoteId}/complete`);
        
        // Cancel/reject other rides associated with same RFQ
        const relatedQuotes = quotations.filter(q => q.rfqId === parseInt(selectedRfqId, 10) && q.id !== quoteId);
        for (const reqQ of relatedQuotes) {
          try {
            await api.patch(`/rides/${reqQ.id}/cancel`);
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Backend ride status update failed or route unavailable. Updating locally.', e);
      }

      // 2. Update local state
      const updatedList = quotations.map(q => {
        if (q.rfqId === parseInt(selectedRfqId, 10)) {
          return {
            ...q,
            status: q.id === quoteId ? 'Completed' : 'Cancelled'
          };
        }
        return q;
      });

      setQuotations(updatedList);
      localStorage.setItem('erp-quotations', JSON.stringify(updatedList));
      toast.success(`Quotation from "${vendorName}" accepted. Other bids rejected.`);
    } catch (err) {
      toast.error('Failed to complete approval process.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuote = async (quoteId, vendorName) => {
    if (!window.confirm(`Reject this quotation from "${vendorName}"?`)) return;

    setActionLoading(true);
    try {
      try {
        await api.patch(`/rides/${quoteId}/cancel`);
      } catch (e) {}

      const updatedList = quotations.map(q => {
        if (q.id === quoteId) {
          return { ...q, status: 'Cancelled' };
        }
        return q;
      });

      setQuotations(updatedList);
      localStorage.setItem('erp-quotations', JSON.stringify(updatedList));
      toast.success(`Bid from "${vendorName}" rejected.`);
    } catch (err) {
      toast.error('Failed to reject quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter quotations for the currently selected RFQ
  const activeRfq = rfqs.find(r => r.id === parseInt(selectedRfqId, 10));
  const activeQuotes = quotations.filter(q => q.rfqId === parseInt(selectedRfqId, 10));

  // Pricing analysis calculations
  const validPrices = activeQuotes
    .filter(q => q.status !== 'Cancelled')
    .map(q => q.totalPrice);
  
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const avgPrice = validPrices.length > 0 ? (validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;

  // Highlight the best score/lowest price bid algorithmically
  const getRecommendationText = (quote) => {
    if (quote.status === 'Cancelled') return null;
    if (quote.totalPrice === minPrice && minPrice > 0) {
      return { text: 'Lowest Cost Proposal', bg: 'bg-green-500 text-white shadow-sm' };
    }
    if (quote.score === Math.max(...activeQuotes.map(q => q.score))) {
      return { text: 'Best Overall Match', bg: 'bg-[#16A34A] text-white shadow-md' };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#16A34A]" />
            <span>Quotation Evaluation Console</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Perform side-by-side evaluations of vendor submissions, run cost analysis algorithms, and finalize purchase approvals.
          </p>
        </div>
        
        {/* RFQ Selector Dropdown */}
        <div className="relative w-full sm:w-64">
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="w-full pl-3 pr-9 py-2.5 bg-white border border-slate-200 text-xs font-bold rounded-xl outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] transition-all text-slate-700 cursor-pointer appearance-none shadow-sm"
          >
            {rfqs.map(r => (
              <option key={r.id} value={r.id}>
                {r.rfqCode} - {r.title} ({r.quantity} qty)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Statistics summaries & cards */}
      {activeQuotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
            <Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">No Bids Submitted Yet</p>
            <p className="text-xs text-slate-400 font-medium">
              We haven't received quotations from suppliers for this request. Simulated bids can be added.
            </p>
          </div>
          
          {/* Simulation Injector */}
          <button
            onClick={() => {
              const resetList = initialMockQuotations;
              setQuotations(resetList);
              localStorage.setItem('erp-quotations', JSON.stringify(resetList));
              toast.success('Simulated supplier bids populated.');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
          >
            Inject Mock Supplier Bids
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* High Fidelity Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 bg-green-50 rounded-xl text-[#16A34A]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Lowest Vendor Offer</span>
                <h4 className="text-lg font-extrabold text-slate-900">${minPrice.toLocaleString()}</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Average Quotation cost</span>
                <h4 className="text-lg font-extrabold text-slate-900">${Math.round(avgPrice).toLocaleString()}</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                <Award className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Cost Savings Buffer</span>
                <h4 className="text-lg font-extrabold text-slate-900">
                  {avgPrice > 0 ? Math.round(((avgPrice - minPrice) / avgPrice) * 100) : 0}% potential saving
                </h4>
              </div>
            </div>

          </div>

          {/* Quotations comparison cards list (grid side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {activeQuotes.map((quote) => {
              const recommendation = getRecommendationText(quote);
              const statusDetails = getQuotationStatus(quote.status);
              return (
                <div 
                  key={quote.id}
                  className={`bg-white rounded-2xl border-2 shadow-sm transition-all flex flex-col justify-between overflow-hidden group hover:shadow-lg ${
                    recommendation 
                      ? 'border-[#16A34A] scale-[1.02] shadow-green-150/10' 
                      : 'border-slate-200'
                  } ${
                    quote.status === 'Cancelled' ? 'opacity-65 border-dashed bg-slate-50/50' : ''
                  }`}
                >
                  {/* Top recommendation banner */}
                  {recommendation && (
                    <div className={`text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider ${recommendation.bg}`}>
                      {recommendation.text}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Supplier info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4.5 w-4.5 text-[#16A34A]" />
                        <span className="font-extrabold text-slate-900 text-sm truncate">{quote.vendorName}</span>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-slate-400 uppercase block">{quote.vendorCode}</span>
                    </div>

                    {/* Pricing block */}
                    <div className="py-3.5 border-y border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">UNIT COST</span>
                        <span className="text-base font-extrabold text-slate-900">${quote.unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">TOTAL VALUE</span>
                        <span className="text-lg font-extrabold text-[#16A34A]">${quote.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Delivery & Specs */}
                    <div className="space-y-3.5 text-xs">
                      
                      <div className="flex items-center justify-between font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>Delivery Lead-time</span>
                        </span>
                        <span className="font-bold text-slate-800">{quote.leadTimeDays} days</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Proposal Specs</span>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                          "{quote.specDetails}"
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1 font-semibold">Bidding Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full rounded-full ${
                                quote.score >= 90 ? 'bg-green-500' : quote.score >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${quote.score}%` }} 
                            />
                          </div>
                          <span className="font-bold text-slate-700">{quote.score}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between pt-1 font-semibold text-slate-500">
                        <span>Compliance status</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${statusDetails.bg}`}>
                          {statusDetails.label}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Actions footer */}
                  <div className="bg-slate-50/50 border-t border-slate-100 p-4">
                    {quote.status === 'Scheduled' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleRejectQuote(quote.id, quote.vendorName)}
                          disabled={actionLoading}
                          className="py-2 border border-slate-200 hover:bg-red-50 hover:text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer text-center text-slate-500 disabled:opacity-50"
                        >
                          Reject Bid
                        </button>
                        <button
                          onClick={() => handleApproveQuote(quote.id, quote.vendorName)}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center gap-1 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept Bid</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-1.5 text-xs text-slate-450 font-bold uppercase text-slate-400">
                        {quote.status === 'Completed' ? 'ACCEPTED PROPOSAL' : 'DISQUALIFIED / CANCELLED'}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
