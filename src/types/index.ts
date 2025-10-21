export interface Communication {
  id: string;
  customerName: string;  // from users > first_name + last_name
  email: string;
  subject: string;
  ticketNumber: string;  // from Order Complete payload > number
  orderNumber: string;   // from Order Complete payload > id
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  date: string;
}

export interface FilterOptions {
  customerName: string;
  email: string;
  subject: string;
  ticketNumber: string;
  orderNumber: string;
  status: string;
  date: string;
}

// Interface for Order Complete payload
export interface OrderCompletePayload {
  id: string;           // Maps to orderNumber
  number: string;       // Maps to ticketNumber
  customer_email?: string;
  subject?: string;
  status?: string;
  created_at?: string;
}