import AsyncStorage from '@react-native-async-storage/async-storage';
import { MedicalItem, BillItem } from '../types';

const API_BASE_URL = 'http://localhost:5000'; // Update this to your server URL

class ApiService {
  async getMedicalItems(): Promise<MedicalItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-items`);
      if (!response.ok) {
        throw new Error('Failed to fetch medical items');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching medical items:', error);
      // Fallback to cached data if available
      const cached = await AsyncStorage.getItem('cached_medical_items');
      return cached ? JSON.parse(cached) : [];
    }
  }

  async getBills(sessionId: string, type?: 'outpatient' | 'inpatient'): Promise<BillItem[]> {
    try {
      const params = new URLSearchParams({ sessionId });
      if (type) params.append('type', type);
      
      const response = await fetch(`${API_BASE_URL}/api/bills?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  }

  async addBillItem(billItem: Omit<BillItem, 'id'>): Promise<BillItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add bill item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding bill item:', error);
      throw error;
    }
  }

  async removeBillItem(billId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bills/${billId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove bill item');
      }
    } catch (error) {
      console.error('Error removing bill item:', error);
      throw error;
    }
  }

  async clearBills(sessionId: string, type?: 'outpatient' | 'inpatient'): Promise<void> {
    try {
      const params = new URLSearchParams({ sessionId });
      if (type) params.append('type', type);
      
      const response = await fetch(`${API_BASE_URL}/api/bills/clear?${params}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear bills');
      }
    } catch (error) {
      console.error('Error clearing bills:', error);
      throw error;
    }
  }
}

export default new ApiService();