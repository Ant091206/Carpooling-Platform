import RatingStars from './RatingStars.jsx';

export default function RatingSummary({ averageRating = 0, totalReviews = 0, ratingDistribution = {} }) {
  const ratingsList = [5, 4, 3, 2, 1];

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-8 grid gap-6 md:grid-cols-[0.8fr_1.2fr] items-center hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
        <h2 className="font-heading text-6xl font-black text-slate-900 tracking-tight">
          {averageRating ? averageRating.toFixed(1) : '0.0'}
        </h2>
        <div className="mt-3 flex justify-center">
          <RatingStars rating={Math.round(averageRating)} size={6} />
        </div>
        <p className="mt-3 text-slate-500 font-extrabold text-sm uppercase tracking-wider">
          {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'} Received
        </p>
      </div>

      <div className="space-y-3">
        {ratingsList.map((stars) => {
          const count = ratingDistribution[stars] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <span className="font-extrabold text-slate-700 w-8 text-right shrink-0">{stars} ★</span>
              <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="font-bold text-slate-400 w-12 text-left shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
