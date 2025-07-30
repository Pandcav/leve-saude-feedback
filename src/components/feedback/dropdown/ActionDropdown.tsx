import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Check, Send, Trash2 } from 'lucide-react';
import type { Feedback } from '../../../types';

interface ActionDropdownProps {
    isOpen: boolean;
    position: { top: number; left: number };
    onClose: () => void;
    feedback: Feedback;
    onMarkAsResponded: (feedbackId: string) => void;
    onMarkAsRead: (feedbackId: string) => void;
    onViewDetails: (feedbackId: string) => void;
    onDeleteFeedback: (feedbackId: string) => void;
    onOpenResponse: (feedback: Feedback) => void;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
    isOpen,
    position,
    onClose,
    feedback,
    onMarkAsRead,
    onViewDetails,
    onDeleteFeedback,
    onOpenResponse
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={dropdownRef}
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-[9999]"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <button
                onClick={() => {
                    onViewDetails(feedback.id);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <Eye className="w-4 h-4" />
                Ver detalhes
            </button>

            {feedback.status === 'novo' && (
                <button
                    onClick={() => {
                        onMarkAsRead(feedback.id);
                        onClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                    <Check className="w-4 h-4" />
                    Marcar como lido
                </button>
            )}

            {(feedback.status === 'novo' || feedback.status === 'lido') && (
                <button
                    onClick={() => {
                        onOpenResponse(feedback);
                        onClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                    <Send className="w-4 h-4" />
                    Responder
                </button>
            )}

            <hr className="my-1" />

            <button
                onClick={() => {
                    onDeleteFeedback(feedback.id);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
                <Trash2 className="w-4 h-4" />
                Excluir
            </button>
        </div>,
        document.body
    );
};
