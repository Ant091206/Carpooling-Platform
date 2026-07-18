import RatingStars from './RatingStars.jsx';

export default function ReviewCard({ review }) {
  const reviewer = review.reviewer || {};
  const dateFormatted = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-md hover:border-emerald-100 transition-all duration-200">
      <div className="flex items-start gap-4">
        {reviewer.avatar ? (
          <img
            src={reviewer.avatar.startsWith('http') ? reviewer.avatar : `/${reviewer.avatar}`}
            alt={reviewer.name}
            className="w-12 h-12 rounded-full object-cover border border-emerald-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-emerald-100 font-heading font-extrabold text-emerald-700 flex items-center justify-center border border-emerald-200">
            {reviewer.name ? reviewer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <h4 className="font-heading font-extrabold text-slate-900 truncate">{reviewer.name || 'Anonymous User'}</h4>
              <p className="text-xs text-slate-500 font-medium">
                {reviewer.department || 'Workspace'} {reviewer.designation ? `• ${reviewer.designation}` : ''}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{dateFormatted}</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={review.rating} size={4} />
            <span className="text-xs font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              {review.rating}.0 ★
            </span>
          </div>

          <p className="mt-3 text-slate-700 text-sm font-medium leading-relaxed bg-slate-50/50 border border-slate-100/50 rounded-2xl p-3">
            {review.review}
          </p>
        </div>
      </div>
    </div>
  );
}
