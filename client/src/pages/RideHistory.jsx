import { useState, useEffect } from 'react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import HistoryCard from '../components/HistoryCard.jsx';
import EmptyHistory from '../components/EmptyHistory.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import historyService from '../services/history.service.js';
import toast from 'react-hot-toast';

export default function RideHistory() {
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [historyData, setHistoryData] = useState({ upcoming: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedRevieweeId, setSelectedRevieweeId] = useState(null);
  const [selectedRevieweeName, setSelectedRevieweeName] = useState('');
  const [selectedRevieweeRole, setSelectedRevieweeRole] = useState('');

  const loadHistory = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await historyService.getMyRides();
      setHistoryData(data || { upcoming: [], completed: [], cancelled: [] });
    } catch (error) {
      toast.error('Failed to load ride history.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleReviewClick = (rideId, partnerId, partnerName, partnerRole) => {
    setSelectedRideId(rideId);
    setSelectedRevieweeId(partnerId);
    setSelectedRevieweeName(partnerName);
    setSelectedRevieweeRole(partnerRole);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    // Re-fetch quietly to update review status
    loadHistory(false);
  };

  const currentRides = historyData[activeTab] || [];

  return (
    <PageShell
      eyebrow="My Trips"
      title="Commute History"
      description="Track your active, past completed, or cancelled carpool sessions."
    >
      <div className="space-y-6">
        {/* Tab selection buttons */}
        <div className="flex border-b border-slate-100 gap-6">
          {['upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-heading font-extrabold text-sm capitalize transition-all border-b-2 relative -bottom-[2px] ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab} ({historyData[tab]?.length || 0})
            </button>
          ))}
        </div>

        {/* List content */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-slate-100 rounded-full" />
                  <div className="h-6 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-10 w-2/3 bg-slate-100 rounded-2xl" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-8 w-20 bg-slate-100 rounded-full" />
                  <div className="h-8 w-24 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : currentRides.length > 0 ? (
          <div className="grid gap-6">
            {currentRides.map((ride) => (
              <HistoryCard
                key={ride.id}
                ride={ride}
                onReviewClick={handleReviewClick}
              />
            ))}
          </div>
        ) : (
          <EmptyHistory tabName={activeTab} />
        )}
      </div>

      {/* Shared feedback submit modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        rideId={selectedRideId}
        revieweeId={selectedRevieweeId}
        revieweeName={selectedRevieweeName}
        revieweeRole={selectedRevieweeRole}
        onSuccess={handleReviewSuccess}
      />
    </PageShell>
  );
}
