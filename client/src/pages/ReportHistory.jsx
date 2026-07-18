import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import ReportTable from '../components/ui/ReportTable.jsx';
import { ArrowLeft, RefreshCw, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReportHistory() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(data.data || []);
    } catch (e) {
      toast.error('Failed to load reports log.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Report deleted successfully.');
      fetchReports();
    } catch (e) {
      toast.error('Failed to delete report.');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <PageShell
      eyebrow="Reports"
      title="Export Logs & History"
      description="Track previous report compilations and access generated download links."
      action={
        <div className="flex gap-2">
          <Button variant="slate" icon={ArrowLeft} onClick={() => navigate('/reports')}>
            Back to Dashboard
          </Button>
          <Button icon={Plus} onClick={() => navigate('/reports/create')} id="btn-history-new-report">
            New Report
          </Button>
        </div>
      }
    >
      <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading text-lg font-bold text-slate-800">Historical Report Compilations</h3>
          <button
            onClick={fetchReports}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-slate-50 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-slate-50 animate-pulse rounded" />
                  <div className="h-3 w-24 bg-slate-50 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ReportTable reports={reports} onDownload={fetchReports} onDelete={handleDelete} />
        )}
      </Card>
    </PageShell>
  );
}
