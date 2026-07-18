import Card from './Card.jsx';
import Badge from './Badge.jsx';
import Button from './Button.jsx';
import DownloadButton from './DownloadButton.jsx';
import { Trash2, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReportCard({ report = {}, onDownload = () => {}, onDelete = () => {} }) {
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

  const getFormatBadge = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return <span className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">PDF</span>;
      case 'XLSX':
        return <span className="rounded bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">XLSX</span>;
      case 'CSV':
      default:
        return <span className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">CSV</span>;
    }
  };

  return (
    <Card className="flex flex-col justify-between gap-4 p-5 hover:shadow-md transition bg-white border border-slate-100 rounded-2xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h4 className="font-bold text-slate-900 line-clamp-1">{report.title}</h4>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{report.type} REPORT</p>
          </div>
        </div>
        {getStatusBadge(report.status)}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-slate-50 pt-3.5 text-xs text-slate-500 font-medium">
        <div className="flex justify-between">
          <span>Created on:</span>
          <span className="font-semibold text-slate-700">{new Date(report.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Format:</span>
          {getFormatBadge(report.fileType)}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3">
        {report.status === 'COMPLETED' && (
          <DownloadButton reportId={report.id} onDownload={() => onDownload(report.id)} />
        )}
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={() => onDelete(report.id)}
          className="rounded-xl"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
