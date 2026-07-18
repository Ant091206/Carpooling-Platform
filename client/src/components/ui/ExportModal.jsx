import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';
import { FileDown, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportModal({ open, onClose, onSubmit = () => {} }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('RIDE');
  const [fileType, setFileType] = useState('CSV');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a descriptive report title.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ title, type, fileType });
      toast.success('Report generation initiated successfully!');
      setTitle('');
      onClose();
    } catch (err) {
      toast.error('Failed to trigger report generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export System Report">
      <form onSubmit={handleGenerate} className="space-y-4 pt-2">
        <Input
          label="Report Title"
          type="text"
          placeholder="e.g. Q3 2026 Carpooling Efficiency Log"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Report Content Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            <option value="RIDE">Ride Sharing Data</option>
            <option value="PAYMENT">Commuter Payments & Transactions</option>
            <option value="USER">User Directories & Statuses</option>
            <option value="DRIVER">Driver Efficiency & Performance</option>
            <option value="PASSENGER">Passenger Activity Logs</option>
            <option value="REVENUE">Revenue Breakdown</option>
            <option value="BOOKING">Booking Requests Log</option>
            <option value="RATING">Reviews & Ratings Feed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Export Format</label>
          <div className="grid grid-cols-3 gap-3">
            {['CSV', 'XLSX', 'PDF'].map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFileType(fmt)}
                className={`py-3.5 rounded-2xl border text-sm font-bold transition text-center ${
                  fileType === fmt
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {fmt === 'XLSX' ? 'Excel (.xlsx)' : fmt}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          icon={FileDown}
          className="w-full mt-4"
          size="lg"
        >
          Generate and Export
        </Button>
      </form>
    </Modal>
  );
}
