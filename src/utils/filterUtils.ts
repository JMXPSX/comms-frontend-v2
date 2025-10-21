import { Communication, FilterOptions } from '../types';

export const filterCommunications = (
  communications: Communication[],
  filters: FilterOptions
): Communication[] => {
  return communications.filter((comm) => {
    const customerNameMatch = !filters.customerName ||
      comm.customerName.toLowerCase().includes(filters.customerName.toLowerCase());

    const emailMatch = !filters.email ||
      comm.email.toLowerCase().includes(filters.email.toLowerCase());

    const subjectMatch = !filters.subject ||
      comm.subject.toLowerCase().includes(filters.subject.toLowerCase());

    const ticketMatch = !filters.ticketNumber ||
      comm.ticketNumber.toLowerCase().includes(filters.ticketNumber.toLowerCase());

    const orderMatch = !filters.orderNumber ||
      comm.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase());

    const statusMatch = !filters.status ||
      comm.status.toLowerCase().includes(filters.status.toLowerCase());

    const dateMatch = !filters.date ||
      comm.date.toLowerCase().includes(filters.date.toLowerCase());

    return customerNameMatch && emailMatch && subjectMatch && ticketMatch && orderMatch && statusMatch && dateMatch;
  });
};