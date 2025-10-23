import React, { useState, useEffect } from 'react';
import './ReplyModal.css';

import { JewelryImage } from '../services/apiService';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  customerEmail: string;
  customerName?: string;
  jewelryImages?: JewelryImage[];
  onSubmit: (message: string) => Promise<void>;
  onWebhookAction?: (action: string, ticketNumber: string) => void;
}

interface JewelryItem {
  id: number;
  metal: string;
  purity: string;
  value: string;
  remarks: string;
  imageData?: string;
  imagePath?: string;
}

interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
}

const responseTemplates: ResponseTemplate[] = [
  {
    id: 'mail-kit-sent',
    name: 'Mail Kit Sent',
    content: `Dear [Customer],

Thank you for ordering our Buy Back Mail Kit.
The package is now on their way to your address.

[Insert other instructions]`
  },
  {
    id: 'order-received',
    name: 'Order Received',
    content: `Dear [Customer],

We have received the Mail Kit back along with your jewelries
Please wait a few days for our final appraisal.

Thank you for your business!`
  },
  {
    id: 'inquiry-response',
    name: 'General Inquiry Response',
    content: `Dear [Customer],

Thank you for your inquiry.

[Your response here]

Please let us know if you have any other questions.`
  },
  {
    id: 'final-appraisal',
    name: 'Final Appraisal Response',
    content: `Dear [Customer],

Thank you for your patience.
We have appraised your jewelries and here are their final values:

[JEWELRY_DETAILS]

Would you like to proceed with receiving your share of the appraisal value or proceed with recycling instead?

[ACTION_BUTTONS]`
  }
];

// Configuration: Frontend URL for email action handling
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

// Configuration: Public API URL for images
const PUBLIC_API_URL = process.env.REACT_APP_PUBLIC_API_URL;

// Helper function to get public image URL for email
const getPublicImageSrc = (imagePath: string): string => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '';
  }

  // If the path is already a full URL (S3 URL), return it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Extract filename from the path for legacy local paths
  const filename = imagePath.split('/').pop();
  if (!filename) {
    return '';
  }
  // Use the public URL for email (for legacy local image paths)
  return `${PUBLIC_API_URL}/images/${filename}`;
};

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  ticketNumber,
  customerEmail,
  customerName = 'Customer',
  jewelryImages = [],
  onSubmit,
  onWebhookAction
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('mail-kit-sent');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [jewelryItems, setJewelryItems] = useState<JewelryItem[]>([]);


  // Initialize jewelry items based on images when switching to final-appraisal
  useEffect(() => {
    if (selectedTemplate === 'final-appraisal' && jewelryImages.length > 0) {
      const initialItems = jewelryImages.map((img, index) => ({
        id: img.jewelry_item_id || index + 1,
        metal: img.metal_type || '',
        purity: img.purity || '',
        value: img.estimated_value ? img.estimated_value.toString() : '',
        remarks: '',
        imagePath: img.image_data
      }));
      setJewelryItems(initialItems);
    }
  }, [selectedTemplate, jewelryImages]);

  useEffect(() => {
    const template = responseTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      let personalizedContent = template.content.replace(/\[Customer\]/g, customerName);

      // Handle Final Appraisal template
      if (selectedTemplate === 'final-appraisal') {
        // Generate HTML formatted content with images
        const jewelryDetailsHtml = jewelryItems.map((item, index) => {
          if (!item.metal && !item.purity && !item.value) return '';

          let detailHtml = `<div style='margin-bottom:20px; border:1px solid #e0e0e0; border-radius:8px; padding:16px; display:flex; gap:16px; align-items:flex-start;'>`;

          // Add image if available - use public URL for email compatibility
          if (item.imagePath) {
            const publicImageSrc = getPublicImageSrc(item.imagePath);
            detailHtml += `<div style='flex-shrink:0;'>
              <img src='${publicImageSrc}' alt='Jewelry ${index + 1}' style='width:120px; height:120px; object-fit:cover; border-radius:6px; border:2px solid #e0e0e0;' />
            </div>`;
          }

          // Add details
          detailHtml += `<div style='flex:1; padding-left:15px;'>
            <p style='margin:0 0 8px 0; font-weight:bold; font-size:16px;'>Jewel #${index + 1}</p>
            <p style='margin:0 0 4px 0;'><strong>Metal:</strong> ${item.metal || '####'}</p>
            <p style='margin:0 0 4px 0;'><strong>Purity:</strong> ${item.purity || 'N/A'}</p>
            <p style='margin:0 0 4px 0;'><strong>Estimated Value:</strong> $${item.value || '###.##'}</p>`;

          if (item.remarks) {
            detailHtml += `<p style='margin:4px 0 0 0;'><strong>Remarks:</strong> ${item.remarks}</p>`;
          }

          detailHtml += `</div></div>`;
          return detailHtml;
        }).filter(html => html).join('');

        // Email buttons now point to frontend action handler
        const actionButtonsHtml = `<div style='text-align:center;margin-top:20px;'>
<a href='${FRONTEND_URL}/action?action=receive_share&ticket_number=${ticketNumber}' data-action='receive_share' data-ticket='${ticketNumber}' style='background-color:#5B8FCF;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-family:sans-serif;font-size:14px;margin:5px;'>I like to receive my share</a>
<a href='${FRONTEND_URL}/action?action=recycle&ticket_number=${ticketNumber}' data-action='recycle' data-ticket='${ticketNumber}' style='background-color:#5B8FCF;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-family:sans-serif;font-size:14px;margin:5px;'>Please proceed with recycling</a>
<a href='${FRONTEND_URL}/action?action=return_jewelry&ticket_number=${ticketNumber}' data-action='return_jewelry' data-ticket='${ticketNumber}' style='background-color:#5B8FCF;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-family:sans-serif;font-size:14px;margin:5px;'>I like to have my jewelries back</a>
</div>`;

        // Default fallback with image placeholder
        const defaultJewelryHtml = `<div style='margin-bottom:20px; border:1px solid #e0e0e0; border-radius:8px; padding:16px; display:flex; gap:16px; align-items:flex-start;'>
          <div style='flex-shrink:0; width:120px; height:120px; background:#f0f0f0; border-radius:6px; border:2px solid #e0e0e0; display:flex; align-items:center; justify-content:center; color:#999; font-size:12px;'>
            [Image]
          </div>
          <div style='flex:1; padding-left:15px;'>
            <p style='margin:0 0 8px 0; font-weight:bold; font-size:16px;'>Jewel #1</p>
            <p style='margin:0 0 4px 0;'><strong>Metal:</strong> ####</p>
            <p style='margin:0 0 4px 0;'><strong>Purity:</strong> N/A</p>
            <p style='margin:0 0 4px 0;'><strong>Estimated Value:</strong> $###.##</p>
          </div>
        </div>`;

        // Build complete HTML message
        const htmlMessage = `<p>Dear ${customerName},</p>
<p>Thank you for your patience.<br>We have appraised your jewelries and here are their final values:</p>
${jewelryDetailsHtml || defaultJewelryHtml}
<p>Would you like to proceed with receiving your share of the appraisal value or proceed with recycling instead?</p>
${actionButtonsHtml}`;

        personalizedContent = htmlMessage;
      }

      setMessage(personalizedContent);
    }
  }, [selectedTemplate, customerName, jewelryItems, ticketNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message);
      onClose();
      setMessage('');
      setSelectedTemplate('mail-kit-sent');
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplate(e.target.value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleJewelryItemChange = (id: number, field: keyof JewelryItem, value: string) => {
    setJewelryItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.preventDefault();

      // Handle webhook actions if onWebhookAction is provided
      if (onWebhookAction) {
        const action = target.getAttribute('data-action');
        const ticket = target.getAttribute('data-ticket');

        if (action && ticket) {
          onWebhookAction(action, ticket);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Message</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="order-number">Order #</label>
                <input
                  type="text"
                  id="order-number"
                  value={ticketNumber}
                  readOnly
                  className="form-input readonly"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-email">To:</label>
                <input
                  type="email"
                  id="customer-email"
                  value={customerEmail}
                  readOnly
                  className="form-input readonly"
                />
              </div>
            </div>
          </div>

          <div className="template-selector-section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h3>Select Template</h3>
            </div>
            <div className="form-group">
              <label htmlFor="response-template" className="template-label">Choose a response template:</label>
              <select
                id="response-template"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="form-select template-select"
              >
                {responseTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="message-section">
            {selectedTemplate === 'final-appraisal' && jewelryItems.length > 0 && (
              <div className="jewelry-details-section">
                <div className="jewelry-header">
                  <h3>Jewelry Appraisal Details</h3>
                </div>
              {jewelryItems.map((item, index) => (
                <div key={item.id} className="jewelry-item">
                  <div className="jewelry-item-container">
                    {item.imagePath && (
                      <div className="jewelry-image-container">
                        <img
                          src={getPublicImageSrc(item.imagePath)}
                          alt={`Jewelry ${index + 1}`}
                          className="jewelry-image"
                          onError={(e) => {
                            console.error('Failed to load jewelry image:', e.currentTarget.src);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="jewelry-image-label">Jewel #{index + 1}</div>
                      </div>
                    )}
                    <div className="jewelry-details-fields">
                      <div className="jewelry-fields-row">
                        <div className="jewelry-field">
                          <label>Metal:</label>
                          <input
                            type="text"
                            value={item.metal}
                            onChange={(e) => handleJewelryItemChange(item.id, 'metal', e.target.value)}
                            placeholder="e.g., Gold, Silver"
                            className="jewelry-input"
                          />
                        </div>
                        <div className="jewelry-field">
                          <label>Purity:</label>
                          <input
                            type="text"
                            value={item.purity}
                            onChange={(e) => handleJewelryItemChange(item.id, 'purity', e.target.value)}
                            placeholder="e.g., 14K, 925"
                            className="jewelry-input"
                          />
                        </div>
                        <div className="jewelry-field">
                          <label>Final Value:</label>
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleJewelryItemChange(item.id, 'value', e.target.value)}
                            placeholder="e.g., 450.00"
                            className="jewelry-input"
                          />
                        </div>
                      </div>
                      <div className="jewelry-field-full">
                        <label>Remarks:</label>
                        <textarea
                          value={item.remarks}
                          onChange={(e) => handleJewelryItemChange(item.id, 'remarks', e.target.value)}
                          placeholder="Additional notes or observations"
                          className="jewelry-remarks"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="message">
                {selectedTemplate === 'final-appraisal' ? 'Message Preview' : 'Message'}:
              </label>
              {selectedTemplate === 'final-appraisal' ? (
                <div className="message-preview-container">
                  <div
                    className="message-preview-html"
                    dangerouslySetInnerHTML={{ __html: message }}
                    onClick={handlePreviewClick}
                  />
                </div>
              ) : (
                <textarea
                  id="message"
                  value={message}
                  onChange={handleMessageChange}
                  className="form-textarea"
                  rows={10}
                  required
                />
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="submit"
              className="send-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;