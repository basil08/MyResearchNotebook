import type { CreateResearchLogInput, ResearchLog, UpdateResearchLogInput } from '@/types/research-log';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const GOOGLE_SHEET_URL = Constants.expoConfig?.extra?.GOOGLE_SHEET_DB_URL || 
                         process.env.GOOGLE_SHEET_DB_URL || 
                         '';

// Headers should match the Google Sheet column structure
// Expected columns: id, created_by, date, plan_to_read, plan_to_do, did_read, learned_today, 
//                   new_thoughts, coded_today, wrote_or_taught, try_tomorrow, created_at, updated_at

/**
 * Get the API URL based on platform
 * - Web: Use CORS proxy at /api/proxy
 * - Mobile (iOS/Android): Use Google Sheets directly (no CORS issues)
 */
function getApiUrl(): string {
  if (Platform.OS === 'web') {
    // For web, use the proxy to avoid CORS issues
    if (typeof window !== 'undefined') {
      const { hostname, protocol } = window.location;
      
      // Local development: Expo runs on different port than Express server
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Proxy server runs on port 3000 in development
        return 'http://localhost:3000/api/proxy';
      }
      
      // Production: Use same origin (Vercel serves both)
      return `${protocol}//${hostname}/api/proxy`;
    }
    
    // Fallback (SSR or edge case)
    return 'http://localhost:3000/api/proxy';
  }
  
  // For mobile, use Google Sheets directly
  return GOOGLE_SHEET_URL;
}

class ResearchLogService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
    console.log(`[ResearchLogService] Platform: ${Platform.OS}, API URL: ${this.baseUrl}`);
  }

  /**
   * Fetch all research logs from Google Sheets
   */
  async getAll(): Promise<ResearchLog[]> {
    try {
      const response = await axios.get(this.baseUrl);
      
      // Assuming the Google Sheet returns JSON with the data
      // The structure depends on the Apps Script or Sheets API setup
      // Common format: { data: [{...}, {...}] }
      const data = response.data;
      
      // Handle different possible response formats
      if (Array.isArray(data)) {
        return data as ResearchLog[];
      } else if (data.data && Array.isArray(data.data)) {
        return data.data as ResearchLog[];
      } else if (data.values && Array.isArray(data.values)) {
        // Handle Google Sheets API format with rows
        return this.parseSheetRows(data.values);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching research logs:', error);
      throw new Error('Failed to fetch research logs');
    }
  }

  /**
   * Create a new research log
   */
  async create(input: CreateResearchLogInput): Promise<ResearchLog> {
    try {
      if (!this.baseUrl) {
        throw new Error('GOOGLE_SHEET_DB_URL is not configured. Please add it to your .env file.');
      }

      const now = new Date().toISOString();
      const newLog: ResearchLog = {
        id: uuidv4(),
        created_by: 'basil',
        date: input.date,
        plan_to_read: input.plan_to_read,
        plan_to_do: input.plan_to_do,
        did_read: input.did_read,
        learned_today: input.learned_today,
        new_thoughts: input.new_thoughts,
        coded_today: input.coded_today,
        wrote_or_taught: input.wrote_or_taught,
        try_tomorrow: input.try_tomorrow,
        created_at: now,
        updated_at: now,
      };

      console.log('Creating log at URL:', this.baseUrl);
      console.log('Log data:', JSON.stringify(newLog, null, 2));

      const response = await axios.post(this.baseUrl, newLog, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Create response:', response.data);
      
      // Return the created log
      return response.data?.data || newLog;
    } catch (error: any) {
      console.error('Error creating research log:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: this.baseUrl,
      });
      
      if (error.response?.status === 405) {
        throw new Error('Google Apps Script endpoint not accepting POST requests. Please check your deployment settings.');
      }
      
      throw new Error(`Failed to create research log: ${error.message}`);
    }
  }

  /**
   * Update an existing research log
   * Note: Uses POST with _method=PUT since Google Apps Script doesn't support PUT directly
   */
  async update(input: UpdateResearchLogInput): Promise<ResearchLog> {
    try {
      const now = new Date().toISOString();
      const updateData = {
        ...input,
        updated_at: now,
      };

      // Google Apps Script doesn't support PUT, so we use POST with _method parameter
      const response = await axios.post(
        `${this.baseUrl}?id=${input.id}&action=update`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Update response:', response.data);
      return response.data?.data || updateData as ResearchLog;
    } catch (error: any) {
      console.error('Error updating research log:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(`Failed to update research log: ${error.message}`);
    }
  }

  /**
   * Delete a research log by ID
   * Note: Uses POST with action=delete since Google Apps Script doesn't support DELETE directly
   */
  async delete(id: string): Promise<void> {
    try {
      // Google Apps Script doesn't support DELETE, so we use POST with action parameter
      const response = await axios.post(
        `${this.baseUrl}?id=${id}&action=delete`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Delete response:', response.data);
    } catch (error: any) {
      console.error('Error deleting research log:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(`Failed to delete research log: ${error.message}`);
    }
  }

  /**
   * Parse Google Sheets row data into ResearchLog objects
   * First row should be headers
   */
  private parseSheetRows(rows: string[][]): ResearchLog[] {
    if (rows.length === 0) return [];

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows.map(row => {
      const log: any = {};
      headers.forEach((header, index) => {
        log[header] = row[index] || '';
      });
      return log as ResearchLog;
    });
  }
}

export const researchLogService = new ResearchLogService();

