import { Communication } from '../types';

export const mockCommunications: Communication[] = [
  {
    id: '1',
    customerName: 'John Smith',
    email: 'customer@email.com',
    subject: 'Order shipment inquiry',
    ticketNumber: 'TCK-999000001',  // from payload.number
    orderNumber: 'ORD-123456789',   // from payload.id
    status: 'Pending',
    date: 'July 12, 2025'
  },
  {
    id: '2',
    customerName: 'Jane Doe',
    email: 'customer@email.com',
    subject: 'Product return request',
    ticketNumber: 'TCK-999000002',
    orderNumber: 'ORD-123456790',
    status: 'In Progress',
    date: 'July 12, 2025'
  },
  {
    id: '3',
    customerName: 'Michael Johnson',
    email: 'customer@email.com',
    subject: 'Payment confirmation',
    ticketNumber: 'TCK-999000003',
    orderNumber: 'ORD-123456791',
    status: 'Completed',
    date: 'July 12, 2025'
  },
  {
    id: '4',
    customerName: 'Sarah Wilson',
    email: 'customer@email.com',
    subject: 'Order cancellation',
    ticketNumber: 'TCK-999000004',
    orderNumber: 'ORD-123456792',
    status: 'Cancelled',
    date: 'July 12, 2025'
  },
  {
    id: '5',
    customerName: 'David Brown',
    email: 'admin@business.com',
    subject: 'Billing address update',
    ticketNumber: 'TCK-999000005',
    orderNumber: 'ORD-123456793',
    status: 'Pending',
    date: 'July 11, 2025'
  },
  {
    id: '6',
    customerName: 'Emily Davis',
    email: 'support@company.org',
    subject: 'Delivery schedule change',
    ticketNumber: 'TCK-999000006',
    orderNumber: 'ORD-123456794',
    status: 'In Progress',
    date: 'July 10, 2025'
  },
  {
    id: '7',
    customerName: 'Robert Miller',
    email: 'user@example.net',
    subject: 'Product quality feedback',
    ticketNumber: 'TCK-999000007',
    orderNumber: 'ORD-123456795',
    status: 'Completed',
    date: 'July 9, 2025'
  },
  {
    id: '8',
    customerName: 'Lisa Anderson',
    email: 'contact@shop.com',
    subject: 'Bulk order pricing inquiry',
    ticketNumber: 'TCK-999000008',
    orderNumber: 'ORD-123456796',
    status: 'Pending',
    date: 'July 8, 2025'
  }
];

// Utility function to transform Order Complete payload to Communication
export const transformOrderPayload = (payload: any): Communication => {
  return {
    id: `comm-${Date.now()}`,
    customerName: payload.customer_name || 'Unknown Customer',
    email: payload.customer_email || 'unknown@email.com',
    subject: payload.subject || 'Order communication',
    ticketNumber: payload.number || 'TCK-UNKNOWN',    // from payload.number
    orderNumber: payload.id || 'ORD-UNKNOWN',         // from payload.id
    status: payload.status === 'completed' ? 'Completed' : 'Pending',
    date: payload.created_at ? new Date(payload.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
};