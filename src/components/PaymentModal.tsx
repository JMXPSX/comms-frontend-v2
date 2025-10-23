import React, { useState } from 'react';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  recipientEmail: string;
  ticketNumber: string;
  suggestedAmount?: number;
}

interface PaymentRequest {
  recipient: string;
  recipientType: string;
  amount: number;
  currency: string;
  note: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8213/api/v1';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  recipientEmail,
  ticketNumber,
  suggestedAmount = 0
}) => {
  const [vendor, setVendor] = useState<'paypal' | 'venmo' | 'tremendous'>('paypal');
  const [amount, setAmount] = useState<string>(suggestedAmount > 0 ? suggestedAmount.toFixed(2) : '');
  const [currency, setCurrency] = useState<'USD' | 'PHP'>('USD');
  const [note, setNote] = useState<string>('Jewelry appraisal payout');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const requestBody: PaymentRequest = {
      recipient: recipientEmail,
      recipientType: 'EMAIL',
      amount: parseFloat(amount),
      currency: currency,
      note: note
    };

    console.log('📤 PaymentModal - Sending payment request:', {
      vendor,
      url: `${API_URL}/payments/${vendor}`,
      body: requestBody
    });

    try {
      const response = await fetch(`${API_URL}/payments/${vendor}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('📦 PaymentModal - Response:', data);

      if (!response.ok || !data.success) {
        const errorMsg = data.message || `Payment failed with status: ${response.status}`;
        console.error('❌ PaymentModal - Error:', errorMsg);
        setErrorMessage(errorMsg);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ PaymentModal - Payment successful:', data);

      // Show success message
      setShowMessage(true);

    } catch (error) {
      console.error('❌ PaymentModal - Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process payment');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowMessage(false);
    setErrorMessage('');
    setAmount(suggestedAmount > 0 ? suggestedAmount.toFixed(2) : '');
    setVendor('paypal');
    setCurrency('USD');
    setNote('Jewelry appraisal payout');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showMessage) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-container payment-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Message</h2>
            <button onClick={handleClose} className="modal-close">&times;</button>
          </div>
          <div className="modal-form">
            <div className="message-content">
              <div className="message-field">
                <label>Order #{orderNumber}</label>
              </div>
              <div className="message-field">
                <label>To: {recipientEmail}</label>
              </div>
              <div className="message-field">
                <label>Response Template: Payment Sent</label>
              </div>
              <div className="message-body">
                <p>Dear [Customer],</p>
                <p>Your share of the total appraisal value has been sent.</p>
                <p>Thank you for using our service.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleClose} className="send-button">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Money Transfer</h2>
          <button onClick={handleClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label-readonly">Order #{orderNumber}</label>
          </div>

          <div className="form-group">
            <label className="form-label">To:</label>
            <input
              type="email"
              value={recipientEmail}
              className="form-input readonly"
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amount to be transferred:</label>
            <div className="amount-input-group">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'PHP')}
                className="currency-select"
                disabled={isSubmitting}
              >
                <option value="USD">USD</option>
                <option value="PHP">PHP</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="form-input amount-input"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment method:</label>
            <div className="vendor-options">
              <label className="vendor-option">
                <input
                  type="radio"
                  name="vendor"
                  value="paypal"
                  checked={vendor === 'paypal'}
                  onChange={(e) => setVendor(e.target.value as 'paypal')}
                  disabled={isSubmitting}
                />
                <span>PayPal</span>
              </label>
              <label className="vendor-option">
                <input
                  type="radio"
                  name="vendor"
                  value="venmo"
                  checked={vendor === 'venmo'}
                  onChange={(e) => setVendor(e.target.value as 'venmo')}
                  disabled={isSubmitting}
                />
                <span>Venmo</span>
              </label>
              <label className="vendor-option">
                <input
                  type="radio"
                  name="vendor"
                  value="tremendous"
                  checked={vendor === 'tremendous'}
                  onChange={(e) => setVendor(e.target.value as 'tremendous')}
                  disabled={isSubmitting}
                />
                <span>Tremendous</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Note:</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Payment note"
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="submit"
              className="send-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
