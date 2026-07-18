import { useState } from 'react';
import Button from './Button.jsx';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function DownloadButton({ reportId, className = '' }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/download/${reportId}`,
        method: 'GET',
        responseType: 'blob', // Important
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Find original filename from headers if possible
      const contentDisposition = response.headers['content-disposition'];
      let filename = `report_${reportId}.zip`;
      if (contentDisposition) {
        const matches = /filename="?([^";]+)"?/g.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Create object URL and download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download completed successfully!');
    } catch (err) {
      toast.error('Failed to download report file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="success"
      size="sm"
      icon={Download}
      loading={downloading}
      onClick={handleDownload}
      className={`rounded-lg ${className}`}
      id={`btn-download-${reportId}`}
    >
      Download
    </Button>
  );
}
