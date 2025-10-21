import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DataTable from './DataTable';
import NotificationModal from './NotificationModal';
import { FilterOptions, Communication } from '../types';
import { mockCommunications } from '../data/mockData';
import { filterCommunications } from '../utils/filterUtils';
import { apiService } from '../services/apiService';
import { webhookHandler, WebhookResponse } from '../utils/webhookHandler';
import './Layout.css';

const Layout: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    customerName: '',
    email: '',
    subject: '',
    ticketNumber: '',
    orderNumber: '',
    status: '',
    date: ''
  });

  const [communications, setCommunications] = useState<Communication[]>(mockCommunications);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Notification modal state
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
    title: string;
  }>({
    isOpen: false,
    message: '',
    type: 'success',
    title: 'Notification'
  });

  // Fetch communications from API on component mount
  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    console.log('🚀 Layout: Starting fetchCommunications');
    setLoading(true);
    setError(null);

    try {
      console.log('📞 Layout: Calling apiService.fetchCommunications()');
      const data = await apiService.fetchCommunications();
      console.log('📥 Layout: Received data from API:', data);
      console.log('📊 Layout: Data length:', data.length);

      if (data.length > 0) {
        console.log('✅ Layout: Setting communications with API data');
        setCommunications(data);
      } else {
        // Fallback to mock data if no data from API
        console.log('⚠️ Layout: No data from API, using mock data');
        setCommunications(mockCommunications);
      }
    } catch (err) {
      console.error('❌ Layout: Failed to fetch communications:', err);
      setError('Failed to load communications. Using sample data.');
      setCommunications(mockCommunications);
    } finally {
      setLoading(false);
      console.log('🏁 Layout: fetchCommunications completed');
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleWebhookAction = (action: string, ticketNumber: string) => {
    webhookHandler.handleAction(action, ticketNumber, {
      onSuccess: (response: WebhookResponse) => {
        const successMessage = webhookHandler.getSuccessMessage(action);
        setNotificationModal({
          isOpen: true,
          message: successMessage,
          type: 'success',
          title: 'Success'
        });
        // Refresh the communications after success
        setTimeout(() => {
          fetchCommunications();
        }, 500);
      },
      onError: (error: string) => {
        setNotificationModal({
          isOpen: true,
          message: `Failed to process your request: ${error}`,
          type: 'error',
          title: 'Error'
        });
      }
    });
  };

  const closeNotificationModal = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }));
  };

  const filteredCommunications = filterCommunications(communications, filters);
  console.log('🎛️ Layout: Current communications state:', communications);
  console.log('🔍 Layout: Filtered communications for table:', filteredCommunications);

  return (
    <div className="layout">
      <Header
        userName="Johnny Douahnut"
        userEmail="angel@outlook.co.angular.com"
      />
      <div className="layout-body">
        <Sidebar
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <main className="main-content">
          {error && (
            <div className="error-message" style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', marginBottom: '10px' }}>
              <p style={{ margin: 0, color: '#856404' }}>{error}</p>
            </div>
          )}
          {loading ? (
            <div className="loading-message" style={{ padding: '20px', textAlign: 'center' }}>
              <p>Loading communications...</p>
            </div>
          ) : (
            <DataTable communications={filteredCommunications} onWebhookAction={handleWebhookAction} />
          )}
        </main>
      </div>

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        message={notificationModal.message}
        type={notificationModal.type}
        title={notificationModal.title}
      />
    </div>
  );
};

export default Layout;