import { useState, useCallback } from 'react';

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const showNotification = useCallback((data: NotificationData) => {
    setNotification(data);
    setIsOpen(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsOpen(false);
    // Delay para permitir a animação de saída
    setTimeout(() => {
      setNotification(null);
    }, 300);
  }, []);

  const showConfirmation = useCallback((data: ConfirmationData) => {
    setConfirmation(data);
    setIsConfirmationOpen(true);
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsConfirmationOpen(false);
    // Delay para permitir a animação de saída
    setTimeout(() => {
      setConfirmation(null);
    }, 300);
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'success',
      title,
      message,
      autoClose: true,
      autoCloseDelay: 3000,
      ...options
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'error',
      title,
      message,
      autoClose: false,
      ...options
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'warning',
      title,
      message,
      autoClose: true,
      autoCloseDelay: 4000,
      ...options
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'info',
      title,
      message,
      autoClose: true,
      autoCloseDelay: 3000,
      ...options
    });
  }, [showNotification]);

  return {
    notification,
    isOpen,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmation,
    isConfirmationOpen,
    showConfirmation,
    hideConfirmation
  };
}
