import {
  X,
  Eye,
  UserCircle,
  User,
  Calendar,
  Hash,
  Star,
  MessageSquare,
  Check,
  Send,
  MessageCircle
} from 'lucide-react';
import type { Feedback } from '../../../types';
import { formatDate } from '../../../utils/formatters';

interface FeedbackDetailsModalProps {
  isOpen: boolean;
  feedback: Feedback | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsResponded: (id: string) => void;
  onOpenResponse: (feedback: Feedback) => void;
}

export default function FeedbackDetailsModal({
  isOpen,
  feedback,
  onClose,
  onMarkAsRead,
  onMarkAsResponded,
  onOpenResponse
}: FeedbackDetailsModalProps) {
  if (!isOpen || !feedback) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-purple-600 mr-2" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Detalhes do Feedback
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Feedback #{feedback.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="px-6 py-6">
          {/* Informações do Usuário */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCircle className="w-12 h-12 text-gray-400" />
                <div className="ml-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-lg font-semibold text-gray-900">{feedback.user.name}</p>
                  </div>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-600">
                      {formatDate(feedback.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">{feedback.user.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  <Hash className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">ID: {feedback.id}</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  feedback.status === 'novo' 
                    ? 'bg-green-100 text-green-800' 
                    : feedback.status === 'lido'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Avaliação */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Avaliação
            </h4>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < feedback.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-lg font-medium text-gray-900">
                    {feedback.rating}/5
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {feedback.rating === 5 ? 'Excelente' :
                     feedback.rating === 4 ? 'Muito Bom' :
                     feedback.rating === 3 ? 'Bom' :
                     feedback.rating === 2 ? 'Regular' : 'Ruim'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comentário */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
              Comentário
            </h4>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                "{feedback.comment}"
              </p>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Ações Rápidas</h4>
            <div className="flex gap-3">
              {feedback.status === 'novo' && (
                <button
                  onClick={() => {
                    onMarkAsRead(feedback.id);
                    onClose();
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Marcar como Lido
                </button>
              )}
              
              {(feedback.status === 'novo' || feedback.status === 'lido') && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenResponse(feedback);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Responder
                  </button>
                  
                  <button
                    onClick={() => {
                      onMarkAsResponded(feedback.id);
                      onClose();
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Marcar como Respondido
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
