import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zendeskService } from '../services/zendeskService';
import { ZendeskComment, ZendeskTicket } from '../types/zendesk';
import { apiService, JewelryImage } from '../services/apiService';
import JewelryImages from './JewelryImages';
import ReplyModal from './ReplyModal';
import PaymentModal from './PaymentModal';
import NotificationModal from './NotificationModal';
import { webhookHandler, WebhookResponse } from '../utils/webhookHandler';
import './TicketDetails.css';

const TicketDetails: React.FC = () => {
  const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const navigate = useNavigate();
  const [comments, setComments] = useState<ZendeskComment[]>([]);
  const [ticket, setTicket] = useState<ZendeskTicket | null>(null);
  const [jewelryImages, setJewelryImages] = useState<JewelryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [jewelryImagesLoading, setJewelryImagesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

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

  const fetchJewelryImages = useCallback(async (ticketId: string) => {
    setJewelryImagesLoading(true);

    try {
      console.log('🔄 Fetching jewelry images for:', ticketId);
      const images = await apiService.fetchJewelryImages(ticketId);
      setJewelryImages(images);
      console.log('✅ Successfully loaded jewelry images:', images.length, 'images');
    } catch (err) {
      console.error('❌ Failed to fetch jewelry images:', err);
      // Don't set error state for jewelry images, just log it
    } finally {
      setJewelryImagesLoading(false);
    }
  }, []);

  const fetchTicketData = useCallback(async (ticketId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching ticket data for:', ticketId);

      // Fetch both ticket details and comments in parallel
      const [ticketComments, ticketDetails] = await Promise.all([
        zendeskService.fetchTicketComments(ticketId),
        zendeskService.fetchTicketDetails(ticketId)
      ]);

      setComments(ticketComments);
      setTicket(ticketDetails);
      console.log('✅ Successfully loaded ticket data');

      // Fetch jewelry images after ticket data is loaded
      fetchJewelryImages(ticketId);
    } catch (err) {
      console.error('❌ Failed to fetch ticket data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket data');
    } finally {
      setLoading(false);
    }
  }, [fetchJewelryImages]);

  useEffect(() => {
    if (ticketNumber) {
      fetchTicketData(ticketNumber);
    }
  }, [ticketNumber, fetchTicketData]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const formatCommentBody = (comment: ZendeskComment): string => {
    // Use plain_body if available, otherwise fall back to body
    return comment.plain_body || comment.body || '';
  };

  const isHtmlComment = (comment: ZendeskComment): boolean => {
    const htmlBody = comment.html_body || '';
    // Check for HTML content that indicates this is a rich comment
    return htmlBody.includes('<p>') || htmlBody.includes('<div>') || htmlBody.includes('<img>') || htmlBody.includes('<strong>') || htmlBody.includes('<a ');
  };

  const getCommentFromToInfo = (comment: ZendeskComment) => {
    const fromData = comment.via?.source?.from;
    const toData = comment.via?.source?.to;

    return {
      from: {
        name: fromData?.name || 'Bountiply',
        address: fromData?.address || fromData?.email || 'support@bountiply.zendesk.com'
      },
      to: {
        name: toData?.name || 'Bountiply',
        address: toData?.address || toData?.email || 'support@bountiply.zendesk.com'
      }
    };
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'status-new';
      case 'open':
        return 'status-open';
      case 'pending':
        return 'status-pending';
      case 'hold':
        return 'status-hold';
      case 'solved':
        return 'status-solved';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-default';
    }
  };

  const handleProceedToPayment = () => {
    console.log('Proceed to Payment clicked for ticket:', ticketNumber);
    setIsPaymentModalOpen(true);
  };

  const handleReply = () => {
    console.log('Reply clicked for ticket:', ticketNumber);
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async (message: string): Promise<void> => {
    if (!ticketNumber) {
      throw new Error('Ticket number is required');
    }

    try {
      console.log('Submitting reply for ticket:', ticketNumber);
      await zendeskService.addTicketComment(ticketNumber, message, true);

      // Refresh the ticket data to show the new comment
      await fetchTicketData(ticketNumber);

      console.log('Reply submitted successfully');
    } catch (error) {
      console.error('Failed to submit reply:', error);
      throw error;
    }
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
        // Refresh the ticket data after success
        setTimeout(async () => {
          if (ticketNumber) {
            await fetchTicketData(ticketNumber);
          }
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

  const getCustomerEmail = (): string => {
    // Try to get customer email from the first public comment
    const firstPublicComment = comments.find(comment => comment.public);
    if (firstPublicComment) {
      const fromToInfo = getCommentFromToInfo(firstPublicComment);
      // Check if the from address is not the support email
      if (fromToInfo.from.address && !fromToInfo.from.address.includes('bountiply')) {
        return fromToInfo.from.address;
      }
      // Otherwise, check the to address
      if (fromToInfo.to.address && !fromToInfo.to.address.includes('bountiply')) {
        return fromToInfo.to.address;
      }
    }
    return 'customer@email.com';
  };

  const getCustomerName = (): string => {
    // Try to get customer name from the first public comment
    const firstPublicComment = comments.find(comment => comment.public);
    if (firstPublicComment) {
      const fromToInfo = getCommentFromToInfo(firstPublicComment);
      // Check if the from name is not the support name
      if (fromToInfo.from.name && fromToInfo.from.name !== 'Bountiply' && !fromToInfo.from.address?.includes('bountiply')) {
        return fromToInfo.from.name;
      }
      // Otherwise, check the to name
      if (fromToInfo.to.name && fromToInfo.to.name !== 'Bountiply' && !fromToInfo.to.address?.includes('bountiply')) {
        return fromToInfo.to.name;
      }
    }
    return 'Customer';
  };

  const getOrderNumber = (): string => {
    // Use ticket number as order number for now
    // You can modify this if you have a different source for order number
    return ticketNumber || 'N/A';
  };

  const getSuggestedPaymentAmount = (): number => {
    // Calculate total from after_fees_value of all jewelry items
    if (jewelryImages && jewelryImages.length > 0) {
      const total = jewelryImages.reduce((sum, item) => sum + (item.after_fees_value || 0), 0);
      return total;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="ticket-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-details-container">
        <div className="error-state">
          <h2>Error Loading Ticket</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-details-container">
      <div className="ticket-details-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Dashboard
        </button>

        {ticket && (
          <div className="ticket-info">
            <h1>Ticket #{ticketNumber}</h1>
            <div className="ticket-meta">
              <span className="ticket-subject">{ticket.subject}</span>
              <span className={`ticket-status ${getStatusBadgeClass(ticket.status)}`}>
                {ticket.status?.toUpperCase()}
              </span>
            </div>
            <div className="ticket-dates">
              <span>Created: {formatDate(ticket.created_at)}</span>
              <span>Updated: {formatDate(ticket.updated_at)}</span>
            </div>
          </div>
        )}
      </div>

      

      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments found for this ticket.</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment, index) => {
              const fromToInfo = getCommentFromToInfo(comment);
              const isFirstPublicComment = comment.public && comments.slice(0, index + 1).filter(c => c.public).length === 1;

              return (
                <div key={comment.id} className={`comment ${comment.public ? 'public' : 'private'}`}>
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="from-to-info">
                        <div className="from-section">
                          <span className="label">From →</span>
                          <span className="name">{fromToInfo.from.name}</span>
                          <span className="address">{fromToInfo.from.address}</span>
                        </div>
                        <div className="to-section">
                          <span className="label">To →</span>
                          <span className="name">{fromToInfo.to.name}</span>
                          <span className="address">{fromToInfo.to.address}</span>
                        </div>
                      </div>
                      {!comment.public && <span className="private-badge">Private</span>}
                    </div>
                    <div className="comment-date">
                      {formatDate(comment.created_at)}
                    </div>
                  </div>

                <div className="comment-body">
                  {isHtmlComment(comment) ? (
                    <>
                      {console.log('Rendering HTML comment:', comment.html_body?.substring(0, 200))}
                      <div
                        className="html-comment-content"
                        dangerouslySetInnerHTML={{ __html: comment.html_body || '' }}
                      />
                    </>
                  ) : (
                    formatCommentBody(comment)
                  )}
                  {isFirstPublicComment && (
                    <JewelryImages
                      images={jewelryImages}
                      loading={jewelryImagesLoading}
                    />
                  )}
                </div>

                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="comment-attachments">
                    <h4>Attachments:</h4>
                    <ul>
                      {comment.attachments.map((attachment) => (
                        <li key={attachment.id}>
                          <a
                            href={attachment.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                          >
                            {attachment.name}
                          </a>
                          <span className="attachment-size">
                            ({Math.round(attachment.size / 1024)} KB)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>);

                  
              
            })}


                <div className="action-buttons">
                  <button onClick={handleProceedToPayment} className="action-button payment-button">
                    Proceed to Payment
                  </button>
                  <button onClick={handleReply} className="action-button reply-button">
                    Reply
                  </button>
                </div>

          </div>


        )}
      </div>

      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        ticketNumber={ticketNumber || ''}
        customerEmail={getCustomerEmail()}
        customerName={getCustomerName()}
        jewelryImages={jewelryImages}
        onSubmit={handleReplySubmit}
        onWebhookAction={handleWebhookAction}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderNumber={getOrderNumber()}
        recipientEmail={getCustomerEmail()}
        ticketNumber={ticketNumber || ''}
        suggestedAmount={getSuggestedPaymentAmount()}
      />

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

export default TicketDetails;