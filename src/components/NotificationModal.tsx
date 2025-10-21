import React from 'react';
import './NotificationModal.css';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'success' | 'error';
  title?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  message,
  type,
  title = 'Notification'
}) => {
  if (!isOpen) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="notification-modal-header">
          <div className={`notification-modal-icon ${type}`}>
            {getIconForType(type)}
          </div>
          <h3>{title}</h3>
          <button className="notification-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="notification-modal-body">
          <p>{message}</p>
        </div>
        <div className="notification-modal-actions">
          <button className="notification-modal-ok" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;