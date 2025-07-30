import {
  X,
  Send,
  UserCircle,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotification } from '../../../hooks/useNotification';
import { NotificationModal } from '../../ui/NotificationModal';
import type { Feedback } from '../../../types';

interface FeedbackResponseModalProps {
  isOpen: boolean;
  feedback: Feedback | null;
  onClose: () => void;
  onSendResponse: (feedbackId: string, response: string) => void;
}

export default function FeedbackResponseModal({
  isOpen,
  feedback,
  onClose,
  onSendResponse
}: FeedbackResponseModalProps) {
  const [responseText, setResponseText] = useState('');
  const { 
    showWarning, 
    notification, 
    isOpen: isNotificationOpen, 
    hideNotification 
  } = useNotification();

  // Limpar o texto quando o modal abre/fecha
  useEffect(() => {
    if (!isOpen) {
      setResponseText('');
    }
  }, [isOpen]);

  if (!isOpen || !feedback) return null;

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      showWarning('Atenção', 'Por favor, digite uma resposta antes de enviar.');
      return;
    }
    
    onSendResponse(feedback.id, responseText);
    setResponseText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              Responder Feedback
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Respondendo para: {feedback.user.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="px-4 sm:px-6 py-4 max-h-[80vh] overflow-y-auto">
          {/* Feedback Original */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
              <div className="flex items-center">
                <UserCircle className="w-8 h-8 text-gray-400" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{feedback.user.name}</p>
                  <p className="text-sm text-gray-500">{feedback.user.email}</p>
                </div>
              </div>
              <div className="flex items-center self-start sm:self-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{feedback.rating}/5</span>
              </div>
            </div>
            <p className="text-gray-700 text-sm sm:text-base">{feedback.comment}</p>
          </div>

          {/* Área de Resposta */}
          <div>
            <label htmlFor="responseText" className="block text-sm font-medium text-gray-700 mb-2">
              Sua Resposta
            </label>
            <textarea
              id="responseText"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-shadow text-sm sm:text-base"
              placeholder="Digite sua resposta aqui..."
            />
            <p className="text-xs text-gray-500 mt-1">
              A resposta será enviada para o email do usuário.
            </p>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendResponse}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar Resposta
          </button>
        </div>
      </div>

      {/* Modal de Notificação para aviso */}
      {notification && (
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={hideNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          autoClose={notification.autoClose}
          autoCloseDelay={notification.autoCloseDelay}
        />
      )}
    </div>
  );
}
