import { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, onChange, maxStars = 5, size = 6, interactive = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= currentRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-all duration-150 transform ${
              interactive ? 'hover:scale-125 focus:outline-none cursor-pointer' : 'cursor-default'
            }`}
          >
            <Star
              className={`w-${size} h-${size} ${
                isActive
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]'
                  : 'text-slate-200 fill-slate-200'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
