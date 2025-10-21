import { Communication, OrderCompletePayload } from '../types';

/**
 * Process Order Complete payload and transform it to Communication format
 *
 * Expected Order Complete payload structure:
 * {
 *   id: string,           // Maps to orderNumber
 *   number: string,       // Maps to ticketNumber
 *   customer_email?: string,
 *   subject?: string,
 *   status?: string,
 *   created_at?: string
 * }
 */
export const processOrderCompletePayload = (payload: OrderCompletePayload): Communication => {
  return {
    id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerName: 'Unknown Customer',  // Will be populated from database join
    email: payload.customer_email || 'unknown@email.com',
    subject: payload.subject || 'Order communication',
    ticketNumber: payload.number,      // FROM payload.number
    orderNumber: payload.id,           // FROM payload.id
    status: mapPayloadStatus(payload.status),
    date: formatPayloadDate(payload.created_at)
  };
};

/**
 * Map payload status to our Communication status enum
 */
const mapPayloadStatus = (status?: string): 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' => {
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
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Pending';
  }
};

/**
 * Format payload date to readable string
 */
const formatPayloadDate = (dateString?: string): string => {
  if (!dateString) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

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

/**
 * Example usage:
 *
 * const orderPayload = {
 *   id: "ORD-123456789",
 *   number: "TCK-999000001",
 *   customer_email: "customer@example.com",
 *   subject: "Order shipment inquiry",
 *   status: "completed",
 *   created_at: "2025-07-12T10:30:00Z"
 * };
 *
 * const communication = processOrderCompletePayload(orderPayload);
 */