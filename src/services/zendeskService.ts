import { ZendeskComment, ZendeskCommentsResponse } from '../types/zendesk';

export class ZendeskService {
  private baseUrl: string;

  constructor() {
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!apiUrl) {
      throw new Error('Missing environment variable: REACT_APP_API_URL');
    }

    this.baseUrl = apiUrl;
  }

  // Upload an attachment via backend
  async uploadAttachment(imageBlob: Blob, filename: string, ticketId: string): Promise<string> {
    const url = `${this.baseUrl}/tickets/${ticketId}/upload?filename=${encodeURIComponent(filename)}`;

    try {
      console.log('🔄 Uploading attachment via backend:', filename);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': imageBlob.type,
        },
        body: imageBlob
      });

      console.log('📡 Backend Upload Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Attachment uploaded successfully:', data);

      return data.upload.token;
    } catch (error) {
      console.error('❌ Error uploading attachment:', error);
      throw error;
    }
  }

  // Fetch image from local API and convert to blob
  async fetchImageAsBlob(imagePath: string): Promise<{ blob: Blob; filename: string }> {
    try {
      // Extract filename from the path
      const filename = imagePath.split('/').pop() || 'jewelry-image.jpg';

      // Construct the full URL using the backend base URL
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const imageUrl = `${baseUrl}/images/${filename}`;

      console.log('🔄 Fetching image for attachment:', imageUrl);

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('✅ Image fetched successfully:', filename, blob.size, 'bytes');

      return { blob, filename };
    } catch (error) {
      console.error('❌ Error fetching image:', error);
      throw error;
    }
  }

  async fetchTicketComments(ticketNumber: string): Promise<ZendeskComment[]> {
    const url = `${this.baseUrl}/tickets/${ticketNumber}/comments`;

    try {
      console.log('🔄 Fetching ticket comments via backend for ticket:', ticketNumber);
      console.log('🌐 API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Backend API Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket ${ticketNumber} not found`);
        } else if (response.status === 401) {
          throw new Error('Authentication failed');
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      const data: ZendeskCommentsResponse = await response.json();
      console.log('📦 Raw data received from backend:', data);
      console.log('📊 Number of comments received:', data.comments?.length || 0);

      return data.comments || [];
    } catch (error) {
      console.error('❌ Error fetching ticket comments:', error);
      throw error;
    }
  }

  async fetchTicketDetails(ticketNumber: string): Promise<any> {
    const url = `${this.baseUrl}/tickets/${ticketNumber}/details`;

    try {
      console.log('🔄 Fetching ticket details via backend for ticket:', ticketNumber);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket ${ticketNumber} not found`);
        } else if (response.status === 401) {
          throw new Error('Authentication failed');
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('📦 Ticket details received from backend:', data);

      return data.ticket || null;
    } catch (error) {
      console.error('❌ Error fetching ticket details:', error);
      throw error;
    }
  }

  async addTicketComment(ticketNumber: string, message: string, isPublic: boolean = true): Promise<any> {
    const url = `${this.baseUrl}/tickets/${ticketNumber}`;

    // Check if message contains HTML
    const isHtml = message.includes('<p>') || message.includes('<div>') || message.includes('<strong>');

    const payload = {
      ticket: {
        comment: {
          ...(isHtml ? { html_body: message } : { body: message }),
          public: isPublic
        }
      }
    };

    try {
      console.log('🔄 Sending reply via backend to ticket:', ticketNumber);
      console.log('📝 Message:', message);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Backend API Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket ${ticketNumber} not found`);
        } else if (response.status === 401) {
          throw new Error('Authentication failed');
        } else if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Reply sent successfully via backend:', data);

      return data;
    } catch (error) {
      console.error('❌ Error sending reply to ticket:', error);
      throw error;
    }
  }
}

export const zendeskService = new ZendeskService();