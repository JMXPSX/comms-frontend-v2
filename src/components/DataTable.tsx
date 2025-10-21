import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Communication } from '../types';
import './DataTable.css';

interface DataTableProps {
  communications: Communication[];
  onWebhookAction?: (action: string, ticketNumber: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ communications, onWebhookAction }) => {
  const navigate = useNavigate();

  const handleRowClick = (ticketNumber: string) => {
    console.log('🔄 Navigating to ticket details for ticket:', ticketNumber);
    navigate(`/ticket/${ticketNumber}`);
  };

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ticket Number</th>
            <th>Order Number</th>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Last Update Date</th>
          </tr>
        </thead>
        <tbody>
          {communications.map((communication) => (
            <tr
              key={communication.id}
              className="clickable-row"
              onClick={() => handleRowClick(communication.ticketNumber)}
            >
              <td className="ticket-cell">{communication.ticketNumber}</td>
              <td className="order-cell">{communication.orderNumber}</td>
              <td className="customer-name-cell">{communication.customerName}</td>
              <td className="email-cell">{communication.email}</td>
              <td className="subject-cell">{communication.subject}</td>
              <td className="date-cell">{communication.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {communications.length === 0 && (
        <div className="empty-state">
          <p>No communications found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;