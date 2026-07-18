import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Briefcase } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import RatingSummary from '../components/RatingSummary.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import reviewService from '../services/review.service.js';
import toast from 'react-hot-toast';

export default function ReviewsProfile() {
  const { userId } = useParams();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getUserStats(userId);
        setStatsData(data);
      } catch (error) {
        toast.error('Failed to load rating statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!statsData || !statsData.user) {
    return (
      <PageShell title="User Not Found" description="The requested profile could not be resolved.">
        <Card className="p-8 text-center text-slate-500">
          <p>Please return to dashboard.</p>
          <Link to="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </Card>
      </PageShell>
    );
  }

  const { user, averageRating, totalReviews, latestReviews, ratingDistribution } = statsData;

  return (
    <PageShell
      eyebrow="User Profile"
      title={`${user.name}'s Ratings`}
      description={user.department ? `${user.department} Team Member` : 'Carpool Participant'}
      action={
        <Link to="/ride-history" className="font-bold text-emerald-700 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
      }
    >
      <div className="space-y-8">
        {/* User Card Header */}
        <Card className="p-6 bg-white border border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar.startsWith('http') ? user.avatar : `/${user.avatar}`}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 font-heading text-2xl font-extrabold text-emerald-700 flex items-center justify-center border-2 border-emerald-200">
                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div>
              <h2 className="font-heading text-2xl font-black text-slate-900 leading-tight">{user.name}</h2>
              <div className="mt-1 flex items-center gap-1 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                <span>{user.designation || 'Employee'} • {user.department || 'Workspace'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2 text-amber-700">
            <span className="font-heading text-xl font-black">{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
            <span className="font-extrabold text-sm">★</span>
            <span className="text-xs font-bold text-slate-400">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
          </div>
        </Card>

        {/* Rating Breakdown Graph Card */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-extrabold text-slate-900">Rating distribution summary</h3>
          <RatingSummary
            averageRating={averageRating}
            totalReviews={totalReviews}
            ratingDistribution={ratingDistribution}
          />
        </div>

        {/* List of Recent reviews received */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
            Recent comments received ({latestReviews.length})
          </h3>

          {latestReviews.length > 0 ? (
            <div className="grid gap-4">
              {latestReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 text-slate-400 font-medium">
              No reviews have been left for {user.name} yet.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
