import {
  X,
  Send,
  UserCircle,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
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

  // Limpar o texto quando o modal abre/fecha
  useEffect(() => {
    if (!isOpen) {
      setResponseText('');
    }
  }, [isOpen]);

  if (!isOpen || !feedback) return null;

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      alert('Por favor, digite uma resposta antes de enviar.');
      return;
    }
    
    onSendResponse(feedback.id, responseText);
    setResponseText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
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
        <div className="px-6 py-4">
          {/* Feedback Original */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <UserCircle className="w-8 h-8 text-gray-400" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{feedback.user.name}</p>
                  <p className="text-sm text-gray-500">{feedback.user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
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
            <p className="text-gray-700">{feedback.comment}</p>
          </div>

          {/* Campo de Resposta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sua Resposta
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Digite sua resposta para o cliente..."
              rows={5}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {responseText.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendResponse}
            disabled={!responseText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar Resposta
          </button>
        </div>
      </div>
    </div>
  );
}
