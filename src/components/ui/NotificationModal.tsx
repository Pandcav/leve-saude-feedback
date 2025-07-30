import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700'
  }
};

export function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000
}: NotificationModalProps) {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop">
      <div 
        className={`
          ${config.bgColor} ${config.borderColor} 
          border rounded-lg shadow-lg max-w-md w-full mx-4 p-6
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-lg font-medium ${config.titleColor}`}>
              {title}
            </h3>
            <div className={`mt-2 text-sm ${config.messageColor}`}>
              <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className={`
                inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent 
                ${config.iconColor}
              `}
              onClick={onClose}
            >
              <span className="sr-only">Fechar</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {!autoClose && (
          <div className="mt-4">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
