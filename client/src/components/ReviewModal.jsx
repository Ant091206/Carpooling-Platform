import { useState, useEffect } from 'react';
import RatingStars from './RatingStars.jsx';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import toast from 'react-hot-toast';
import reviewService from '../services/review.service.js';

export default function ReviewModal({ isOpen, onClose, rideId, revieweeId, revieweeName, revieweeRole, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minLength = 5;
  const maxLength = 500;

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setReviewText('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    const trimmedText = reviewText.trim();
    if (trimmedText.length < minLength) {
      setError(`Review must be at least ${minLength} characters long.`);
      return;
    }

    if (trimmedText.length > maxLength) {
      setError(`Review cannot exceed ${maxLength} characters.`);
      return;
    }

    setLoading(true);
    try {
      await reviewService.createReview({
        rideId,
        revieweeId,
        rating,
        review: trimmedText
      });
      toast.success(`Review for ${revieweeName} submitted successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={`Submit Review`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center bg-[#EAF6EF] border border-emerald-100 rounded-3xl p-5">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Review Target</p>
          <h3 className="mt-1 font-heading text-lg font-extrabold text-slate-900">{revieweeName}</h3>
          <span className="mt-1 inline-block bg-white text-xs font-extrabold text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            {revieweeRole}
          </span>
        </div>

        <div className="space-y-2 text-center flex flex-col items-center">
          <label className="text-sm font-bold text-slate-700">How was your ride experience?</label>
          <RatingStars rating={rating} onChange={setRating} size={8} interactive={true} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-bold text-slate-700">
            <label>Write your feedback</label>
            <span className={`text-xs ${reviewText.length > maxLength ? 'text-red-500' : 'text-slate-400'}`}>
              {reviewText.length}/{maxLength}
            </span>
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            disabled={loading}
            placeholder="Share details of your pooling experience (e.g. timeliness, safe driving, friendly communication)..."
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50 bg-slate-50/30"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" className="w-1/2" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="w-1/2" loading={loading} disabled={loading}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
