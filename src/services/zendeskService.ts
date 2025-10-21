import { ZendeskComment, ZendeskCommentsResponse } from '../types/zendesk';

export class ZendeskService {
  private domain: string;
  private email: string;
  private token: string;

  constructor() {
    const domain = process.env.REACT_APP_ZENDESK_DOMAIN;
    const email = process.env.REACT_APP_ZENDESK_EMAIL;
    const token = process.env.REACT_APP_ZENDESK_TOKEN;

    if (!domain || !email || !token) {
      throw new Error('Missing Zendesk environment variables: REACT_APP_ZENDESK_DOMAIN, REACT_APP_ZENDESK_EMAIL, REACT_APP_ZENDESK_TOKEN');
    }

    this.domain = domain;
    this.email = email;
    this.token = token;
  }

  private getAuthHeader(): string {
    const credentials = btoa(`${this.email}/token:${this.token}`);
    return `Basic ${credentials}`;
  }

  // Upload an attachment to Zendesk
  async uploadAttachment(imageBlob: Blob, filename: string): Promise<string> {
    const url = `${this.domain}/api/v2/uploads.json?filename=${encodeURIComponent(filename)}`;

    try {
      console.log('🔄 Uploading attachment to Zendesk:', filename);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': imageBlob.type,
        },
        body: imageBlob
      });

      console.log('📡 Zendesk Upload Response status:', response.status, response.statusText);

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
    const url = `${this.domain}/api/v2/tickets/${ticketNumber}/comments.json`;

    try {
      console.log('🔄 Fetching Zendesk ticket comments for ticket:', ticketNumber);
      console.log('🌐 API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Zendesk API Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket ${ticketNumber} not found`);
        } else if (response.status === 401) {
          throw new Error('Invalid Zendesk credentials');
        } else {
          throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`);
        }
      }

      const data: ZendeskCommentsResponse = await response.json();
      console.log('📦 Raw Zendesk data received:', data);
      console.log('📊 Number of comments received:', data.comments?.length || 0);

      return data.comments || [];
    } catch (error) {
      console.error('❌ Error fetching Zendesk ticket comments:', error);
      throw error;
    }
  }

  async fetchTicketDetails(ticketNumber: string): Promise<any> {
    const url = `${this.domain}/api/v2/tickets/${ticketNumber}.json`;

    try {
      console.log('🔄 Fetching Zendesk ticket details for ticket:', ticketNumber);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket ${ticketNumber} not found`);
        } else if (response.status === 401) {
          throw new Error('Invalid Zendesk credentials');
        } else {
          throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('📦 Zendesk ticket details received:', data);

      return data.ticket || null;
    } catch (error) {
      console.error('❌ Error fetching Zendesk ticket details:', error);
      throw error;
    }
  }

  async addTicketComment(ticketNumber: string, message: string, isPublic: boolean = true): Promise<any> {
    const url = `${this.domain}/api/v2/tickets/${ticketNumber}.json`;

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
      console.log('🔄 Sending reply to ticket:', ticketNumber);
      console.log('📝 Message:', message);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Zendesk API Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket ${ticketNumber} not found`);
        } else if (response.status === 401) {
          throw new Error('Invalid Zendesk credentials');
        } else if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        } else {
          throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Reply sent successfully:', data);

      return data;
    } catch (error) {
      console.error('❌ Error sending reply to ticket:', error);
      throw error;
    }
  }
}

export const zendeskService = new ZendeskService();