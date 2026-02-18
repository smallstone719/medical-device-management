import { defineStore } from 'pinia';
import { deviceApi } from '@/api/device.api';

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [],
    currentDevice: null
  }),

  actions: {
    async fetchDevices() {
      const response = await deviceApi.getAll();
      this.devices = response.data;
    },

    async fetchDevice(id) {
      const response = await deviceApi.getById(id);
      this.currentDevice = response.data;
    },

    async createDevice(data) {
      await deviceApi.create(data);
      await this.fetchDevices();
    },

    async updateDevice(id, data) {
      await deviceApi.update(id, data);
      await this.fetchDevices();
    },

    async deleteDevice(id) {
      await deviceApi.delete(id);
      await this.fetchDevices();
    }
  }
});
