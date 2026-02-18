import { exportApi } from '@/api/export.api';

export function useExport() {
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDevices = async () => {
    const blob = await exportApi.exportDevices();
    downloadFile(blob, `devices-${Date.now()}.xlsx`);
  };

  const exportAssets = async () => {
    const blob = await exportApi.exportAssets();
    downloadFile(blob, `assets-${Date.now()}.xlsx`);
  };

  return {
    exportDevices,
    exportAssets
  };
}
