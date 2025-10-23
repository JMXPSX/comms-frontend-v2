import { Communication } from '../types';

// Database configuration
const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  database: 'bountiplydb',
  user: 'admin',
  password: 'Admin123!'
};

// API service class for handling database operations
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.REACT_APP_API_URL || 'http://localhost:8000/api') {
    this.baseUrl = baseUrl;
  }

  // Fetch jewelry images for a specific ticket
  async fetchJewelryImages(ticketId: string): Promise<JewelryImage[]> {
    console.log('🔄 Making API call to fetch jewelry images for ticket:', ticketId);

    try {
      const response = await fetch(`${this.baseUrl}/tickets`);
      console.log('📡 Jewelry images API Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('📦 Raw jewelry images data received:', rawData);
      console.log('📦 Is array:', Array.isArray(rawData));

      // Handle different response formats
      let ticketsData: any[];

      if (Array.isArray(rawData)) {
        ticketsData = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (rawData.object && Array.isArray(rawData.object)) {
          ticketsData = rawData.object;
        } else if (rawData.tickets && Array.isArray(rawData.tickets)) {
          ticketsData = rawData.tickets;
        } else if (rawData.data && Array.isArray(rawData.data)) {
          ticketsData = rawData.data;
        } else if (rawData.results && Array.isArray(rawData.results)) {
          ticketsData = rawData.results;
        } else {
          console.log('📦 Unexpected response format - expected array or object with object/tickets/data/results');
          console.log('📦 Response keys:', Object.keys(rawData));
          return [];
        }
      } else {
        console.log('📦 Invalid response format');
        return [];
      }

      console.log('📦 Looking for ticket with ID:', ticketId);

      // Find the ticket that matches the provided ticketId (new API uses ticketNumber)
      const targetTicket = ticketsData.find((ticket: any) => ticket.ticketNumber === ticketId || ticket.ticket_number === ticketId);

      if (targetTicket && targetTicket.items && Array.isArray(targetTicket.items)) {
        console.log('📦 Found ticket with', targetTicket.items.length, 'items');

        // Transform new API structure to match existing JewelryImage interface
        const transformedItems = targetTicket.items.map((item: any) => ({
          jewelry_item_id: item.id,
          weight: item.weight,
          purity: item.purity,
          metal_type: item.metalType,
          unit_of_measure: item.unitOfMeasure,
          estimated_value: item.appraisedAmount,
          after_fees_value: item.actualAmount,
          price_per_gram: item.appraisedAmount / item.weight, // Calculate price per gram
          image_data: item.imageUrl, // Use imageUrl as image_data
          timestamp: targetTicket.dateModified || new Date().toISOString()
        }));

        // Filter out items without image URLs
        const validItems = transformedItems.filter((item: any) => item && item.image_data);
        console.log('📦 Valid items with images:', validItems.length);
        return validItems;
      } else {
        console.log('📦 No items found for ticket:', ticketId);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching jewelry images from API:', error);
      console.error('🌐 API URL attempted:', `${this.baseUrl}/tickets`);
      return [];
    }
  }

  // Fetch communications data from the database
  async fetchCommunications(): Promise<Communication[]> {
    console.log('🔄 Making API call to:', `${this.baseUrl}/tickets`);

    try {
      const response = await fetch(`${this.baseUrl}/tickets`);
      console.log('📡 API Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('📦 Raw API data received:', rawData);
      console.log('📦 Raw API data type:', typeof rawData);
      console.log('📦 Is array:', Array.isArray(rawData));

      // Handle different response formats
      let data: TicketApiResponse[];

      if (Array.isArray(rawData)) {
        // Response is already an array
        data = rawData;
      } else if (rawData && typeof rawData === 'object') {
        // Response is an object, check for common property names
        if (rawData.object && Array.isArray(rawData.object)) {
          data = rawData.object;
        } else if (rawData.tickets && Array.isArray(rawData.tickets)) {
          data = rawData.tickets;
        } else if (rawData.data && Array.isArray(rawData.data)) {
          data = rawData.data;
        } else if (rawData.results && Array.isArray(rawData.results)) {
          data = rawData.results;
        } else {
          console.error('❌ Unknown API response format. Expected array or object with object/tickets/data/results property');
          console.log('📦 Response keys:', Object.keys(rawData));
          return [];
        }
      } else {
        console.error('❌ Invalid API response format');
        return [];
      }

      console.log('📊 Number of tickets received:', data.length);

      // Transform the API response to match our Communication interface
      const transformedData = data.map(ticket => transformTicketApiResponse(ticket));
      console.log('✨ Transformed data:', transformedData);
      console.log('🎯 Returning data with length:', transformedData.length);

      return transformedData;
    } catch (error) {
      console.error('❌ Error fetching tickets from API:', error);
      console.error('🌐 API URL attempted:', `${this.baseUrl}/tickets`);

      // For now, return empty array on error
      // In production, you might want to throw the error or return cached data
      return [];
    }
  }

  // Method to get database configuration (for backend setup)
  static getDatabaseConfig() {
    return DB_CONFIG;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// SQL query that should be used on the backend:
export const COMMUNICATIONS_QUERY = `
  SELECT
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    u.email,
    o.subject,
    o.ticket_number,
    o.order_number,
    o.date_modified as last_update_date,
    o.status
  FROM users u
  JOIN order o ON u.id = o.user_id
  ORDER BY o.date_modified DESC
`;

// Type for the raw database result
export interface DatabaseResult {
  customer_name: string;
  email: string;
  subject: string;
  ticket_number: string;
  order_number: string;
  last_update_date: string;
  status: string;
}

// Type for the API response from /tickets endpoint (new API structure)
export interface TicketApiResponse {
  id: number;
  ticketNumber: string;
  sessionId: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerFullName: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zipCode: string;
  provinceCode: string;
  countryCode: string;
  currency: string;
  status: string;
  orderType: string;
  orderDate: string;
  dateModified: string;
  items?: any[];
  itemCount?: number;
  totalAppraisedAmount?: number;
  totalActualAmount?: number;
}

// Transform database result to Communication format
export const transformDatabaseResult = (dbResult: DatabaseResult): Communication => {
  return {
    id: `comm-${dbResult.order_number}-${dbResult.ticket_number}`,
    customerName: dbResult.customer_name,
    email: dbResult.email,
    subject: dbResult.subject,
    ticketNumber: dbResult.ticket_number,
    orderNumber: dbResult.order_number,
    status: mapDatabaseStatus(dbResult.status),
    date: formatDatabaseDate(dbResult.last_update_date)
  };
};

// Transform API ticket response to Communication format (new API structure)
export const transformTicketApiResponse = (ticket: TicketApiResponse): Communication => {
  // Create a subject from orderType - convert snake_case to Title Case
  const subject = ticket.orderType
    ? ticket.orderType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Order Inquiry';

  return {
    id: `ticket-${ticket.orderNumber}-${ticket.ticketNumber}`,
    customerName: ticket.customerFullName,
    email: ticket.customerEmail,
    subject: subject,
    ticketNumber: ticket.ticketNumber,
    orderNumber: ticket.orderNumber,
    status: mapDatabaseStatus(ticket.status),
    date: formatDatabaseDate(ticket.dateModified)
  };
};

// Map database status to our Communication status enum
const mapDatabaseStatus = (status: string): 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' => {
  if (!status) return 'Pending';

  switch (status.toLowerCase()) {
    case 'completed':
    case 'complete':
    case 'done':
      return 'Completed';
    case 'processing':
    case 'in_progress':
    case 'in-progress':
      return 'In Progress';
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    default:
      return 'Pending';
  }
};

// Format database date to readable string
const formatDatabaseDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Type for jewelry image data
export interface JewelryImage {
  jewelry_item_id: number;
  weight: number;
  purity: string;
  metal_type: string;
  unit_of_measure: string;
  estimated_value: number;
  after_fees_value: number;
  price_per_gram: number;
  image_data: string; // file path for image (e.g., "images/filename.jpeg")
  timestamp: string;
}

// Type for the API response containing jewelry images
export interface JewelryImagesApiResponse {
  jewelry_images: JewelryImage[];
}