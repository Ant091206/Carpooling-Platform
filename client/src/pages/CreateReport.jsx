import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Button from '../components/ui/Button.jsx';
import FilterPanel from '../components/ui/FilterPanel.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';
import { FilePlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CreateReport() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [filters, setFilters] = useState({
    type: 'RIDE',
    fileType: 'CSV',
    startDate: '',
    endDate: '',
    department: '',
    rideStatus: '',
    paymentStatus: ''
  });
  const [generating, setGenerating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a report title.');
      return;
    }
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/generate`,
        {
          title,
          type: filters.type,
          fileType: filters.fileType,
          filters: {
            startDate: filters.startDate,
            endDate: filters.endDate,
            department: filters.department,
            rideStatus: filters.rideStatus,
            paymentStatus: filters.paymentStatus
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Report generation started!');
      navigate('/reports/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start report generation.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageShell
      eyebrow="Reports"
      title="Create Custom Report"
      description="Define custom filters, date ranges, and formats to compile platform metrics."
      action={
        <Button variant="slate" icon={ArrowLeft} onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      }
    >
      <form onSubmit={handleCreate} className="space-y-6">
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm max-w-xl">
          <Input
            label="Report Title"
            type="text"
            placeholder="e.g. FY 2026 Q2 Financial Audit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            id="input-create-report-title"
          />
        </Card>

        <FilterPanel filters={filters} onChange={setFilters} />

        <div className="flex justify-end gap-3 max-w-xl">
          <Button variant="slate" onClick={() => navigate('/reports')}>
            Cancel
          </Button>
          <Button type="submit" loading={generating} icon={FilePlus} id="btn-submit-create-report">
            Generate Report
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
