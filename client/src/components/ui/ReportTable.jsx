import Badge from './Badge.jsx';
import Button from './Button.jsx';
import DownloadButton from './DownloadButton.jsx';
import { Trash2, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReportTable({ reports = [], onDownload = () => {}, onDelete = () => {} }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge tone="green"><span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</span></Badge>;
      case 'PROCESSING':
        return <Badge tone="blue"><span className="flex items-center gap-1 animate-pulse"><RefreshCw className="h-3 w-3 animate-spin" /> Processing</span></Badge>;
      case 'FAILED':
        return <Badge tone="red"><span className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed</span></Badge>;
      case 'PENDING':
      default:
        return <Badge tone="amber"><span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Queued</span></Badge>;
    }
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14 text-slate-400">
        <FileText className="h-10 w-10 text-slate-300" />
        <p className="font-semibold text-sm">No reports generated yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-700">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
            <th className="pb-3 font-semibold">Report Title</th>
            <th className="pb-3 font-semibold">Type</th>
            <th className="pb-3 font-semibold">Format</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Created On</th>
            <th className="pb-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-slate-50/50 transition">
              <td className="py-4 font-bold text-slate-900 flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-emerald-700 shrink-0" />
                {report.title}
              </td>
              <td className="py-4 text-slate-500 font-semibold">{report.type}</td>
              <td className="py-4">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  report.fileType === 'PDF' ? 'bg-rose-50 border border-rose-100 text-rose-700' :
                  report.fileType === 'XLSX' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' :
                  'bg-slate-50 border border-slate-200 text-slate-700'
                }`}>
                  {report.fileType}
                </span>
              </td>
              <td className="py-4">{getStatusBadge(report.status)}</td>
              <td className="py-4 text-xs font-semibold text-slate-400">
                {new Date(report.createdAt).toLocaleString()}
              </td>
              <td className="py-4 text-right flex items-center justify-end gap-2">
                {report.status === 'COMPLETED' && (
                  <DownloadButton reportId={report.id} onDownload={() => onDownload(report.id)} />
                )}
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => onDelete(report.id)}
                  className="rounded-lg"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
