import {
  X,
  Eye,
  UserCircle,
  User,
  Calendar,
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
  onOpenResponse
}: FeedbackDetailsModalProps) {
  if (!isOpen || !feedback) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                Detalhes do Feedback
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                ID: {feedback.id}
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
        <div className="px-4 sm:px-6 py-6 max-h-[80vh] overflow-y-auto">
          {/* Informações do Usuário */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <UserCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                <div className="ml-3 sm:ml-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{feedback.user.name}</p>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs sm:text-sm text-gray-500">{feedback.user.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Status e Data */}
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="flex items-center sm:justify-end mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-xs sm:text-sm text-gray-600">
                    {formatDate(feedback.createdAt)}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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

          {/* Detalhes do Feedback */}
          <div className="space-y-6">
            {/* Avaliação */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Avaliação
              </h4>
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${
                      i < feedback.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-4 text-lg sm:text-xl font-bold text-gray-800">
                  {feedback.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Comentário */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
                Comentário
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {feedback.comment || <span className="italic text-gray-500">Nenhum comentário fornecido.</span>}
                </p>
              </div>
            </div>

            {/* Resposta */}
            {feedback.response && (
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <MessageCircle className="w-5 h-5 text-green-500 mr-2" />
                  Resposta da Equipe
                </h4>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <p className="text-sm sm:text-base text-gray-800 mb-2">
                    {feedback.response.text}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 text-right">
                    Respondido por: {feedback.response.respondedBy} em {formatDate(feedback.response.respondedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer do Modal com Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          {feedback.status === 'novo' && (
            <button
              onClick={() => onMarkAsRead(feedback.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Marcar como Lido
            </button>
          )}
          {(feedback.status === 'novo' || feedback.status === 'lido') && (
            <button
              onClick={() => onOpenResponse(feedback)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Responder
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
