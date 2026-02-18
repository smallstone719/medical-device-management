import api from './index';

export const exportApi = {
  exportDevices: () => api.get('/export/devices', { responseType: 'blob' }),
  exportAssets: () => api.get('/export/assets', { responseType: 'blob' })
};
