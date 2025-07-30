import { useState } from 'react';
import {
    UserCircle,
    Star,
    Search,
    Filter,
    MoreHorizontal,
    Download,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import type { Feedback, FeedbackFilters } from '../../../types';
import { formatDate, generateFilename } from '../../../utils/formatters';
import { ActionDropdown } from '../dropdown/ActionDropdown';

interface FeedbackTableProps {
    feedbacks: Feedback[];
    filters: FeedbackFilters;
    onFilterChange: (key: keyof FeedbackFilters, value: string) => void;
    onMarkAsRead: (feedbackId: string) => void;
    onMarkAsResponded: (feedbackId: string) => void;
    onViewDetails: (feedbackId: string) => void;
    onDeleteFeedback: (feedbackId: string) => void;
    onOpenResponse: (feedback: Feedback) => void;
    onResetFilters: () => void;
}

export default function FeedbackTable({
    feedbacks,
    filters,
    onFilterChange,
    onMarkAsRead,
    onMarkAsResponded,
    onViewDetails,
    onDeleteFeedback,
    onOpenResponse,
    onResetFilters
}: FeedbackTableProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calcular paginação
    const totalItems = feedbacks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFeedbacks = feedbacks.slice(startIndex, endIndex);

    // Função para contar filtros ativos
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status !== 'todos') count++;
        if (filters.rating !== 'todos') count++;
        if (filters.date !== 'todos') count++;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    // Função para obter cores do status
    const getStatusColors = (status: string) => {
        switch (status) {
            case 'novo':
                return 'bg-green-100 text-green-800';
            case 'lido':
                return 'bg-blue-100 text-blue-800';
            case 'respondido':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const toggleActionMenu = (feedbackId: string, event?: React.MouseEvent) => {
        if (openActionMenuId === feedbackId) {
            setOpenActionMenuId(null);
        } else {
            if (event) {
                const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                setDropdownPosition({
                    top: buttonRect.bottom + window.scrollY - 45,
                    left: buttonRect.right + window.scrollX + 15
                });
            }
            setOpenActionMenuId(feedbackId);
        }
    };

    // Funções de navegação da paginação
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToPage = (page: number) => setCurrentPage(page);

    // Gerar números das páginas para navegação
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    // Função para exportar dados para CSV
    const exportToCSV = () => {
        const headers = ['ID', 'Usuario', 'Email', 'Avaliacao', 'Comentario', 'Data', 'Status'];

        const csvData = feedbacks.map(feedback => [
            feedback.id,
            `"${feedback.user?.name || 'Usuário não identificado'}"`,
            `"${feedback.user?.email || 'Email não disponível'}"`,
            feedback.rating || 0,
            `"${(feedback.comment || 'Sem comentário').replace(/"/g, '""')}"`,
            formatDate(feedback.createdAt),
            feedback.status || 'novo'
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], {
            type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        const filename = generateFilename('feedbacks', 'csv');
        link.setAttribute('download', filename);

        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    // Função para exportar dados para JSON
    const exportToJSON = () => {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalRecords: feedbacks.length,
                filters: filters
            },
            feedbacks: feedbacks.map(feedback => ({
                id: feedback.id,
                usuario: feedback.user?.name || 'Usuário não identificado',
                email: feedback.user?.email || 'Email não disponível',
                avaliacao: feedback.rating || 0,
                comentario: feedback.comment || 'Sem comentário',
                data: formatDate(feedback.createdAt),
                status: feedback.status || 'novo',
                resposta: feedback.response ? {
                    texto: feedback.response.text,
                    respondidoPor: feedback.response.respondedBy,
                    dataResposta: formatDate(feedback.response.respondedAt)
                } : null
            }))
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        const filename = generateFilename('feedbacks', 'json');
        link.setAttribute('download', filename);

        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            {/* Cabeçalho da Tabela e Filtros */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Lista de Feedbacks ({totalItems})
                </h2>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Botão de Filtros */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative"
                    >
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Filtros</span>
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Botão de Exportar */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Exportar</span>
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-20">
                                <button
                                    onClick={exportToCSV}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Exportar para CSV
                                </button>
                                <button
                                    onClick={exportToJSON}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Exportar para JSON
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filtros Expansíveis */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Filtro de Pesquisa */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou email..."
                                value={filters.search}
                                onChange={(e) => onFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                            />
                        </div>

                        {/* Filtro de Status */}
                        <select
                            value={filters.status}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="novo">Novo</option>
                            <option value="lido">Lido</option>
                            <option value="respondido">Respondido</option>
                        </select>

                        {/* Filtro de Avaliação */}
                        <select
                            value={filters.rating}
                            onChange={(e) => onFilterChange('rating', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        >
                            <option value="todos">Todas as Avaliações</option>
                            <option value="1">1 Estrela</option>
                            <option value="2">2 Estrelas</option>
                            <option value="3">3 Estrelas</option>
                            <option value="4">4 Estrelas</option>
                            <option value="5">5 Estrelas</option>
                        </select>

                        {/* Filtro de Data */}
                        <select
                            value={filters.date}
                            onChange={(e) => onFilterChange('date', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        >
                            <option value="todos">Qualquer Data</option>
                            <option value="hoje">Hoje</option>
                            <option value="7dias">Últimos 7 dias</option>
                            <option value="30dias">Últimos 30 dias</option>
                            <option value="este_mes">Este Mês</option>
                            <option value="mes_passado">Mês Passado</option>
                        </select>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={onResetFilters}
                            className="text-sm text-purple-600 hover:underline"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            )}

            {/* Tabela de Feedbacks */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuário
                            </th>
                            <th scope="col" className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Comentário
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Avaliação
                            </th>
                            <th scope="col" className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="relative px-3 py-2">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentFeedbacks.length > 0 ? (
                            currentFeedbacks.map((feedback) => (
                                <tr key={feedback.id} className="hover:bg-gray-50">
                                    {/* Coluna Usuário */}
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <UserCircle className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-xs font-medium text-gray-900">{feedback.user.name}</div>
                                                <div className="text-xs text-gray-500">{feedback.user.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Coluna Comentário */}
                                    <td className="hidden md:table-cell px-3 py-3">
                                        <p className="text-xs text-gray-900 max-w-xs truncate" title={feedback.comment}>
                                            {feedback.comment}
                                        </p>
                                    </td>

                                    {/* Coluna Avaliação */}
                                    <td className="px-3 py-3 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center">
                                            <span className="text-xs font-medium text-gray-900 mr-1">{feedback.rating}</span>
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        </div>
                                    </td>

                                    {/* Coluna Data */}
                                    <td className="hidden lg:table-cell px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                                        {formatDate(feedback.createdAt)}
                                    </td>

                                    {/* Coluna Status */}
                                    <td className="px-3 py-3 whitespace-nowrap text-center">
                                        <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${getStatusColors(feedback.status)}`}>
                                            {feedback.status}
                                        </span>
                                    </td>

                                    {/* Coluna Ações */}
                                    <td className="px-3 py-3 whitespace-nowrap text-right text-xs font-medium">
                                        <div className="relative inline-block text-left action-menu">
                                            <button
                                                onClick={(e) => toggleActionMenu(feedback.id, e)}
                                                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                            {openActionMenuId === feedback.id && (
                                                <ActionDropdown
                                                    isOpen={openActionMenuId === feedback.id}
                                                    feedback={feedback}
                                                    onMarkAsRead={onMarkAsRead}
                                                    onMarkAsResponded={onMarkAsResponded}
                                                    onViewDetails={onViewDetails}
                                                    onDeleteFeedback={onDeleteFeedback}
                                                    onOpenResponse={onOpenResponse}
                                                    onClose={() => setOpenActionMenuId(null)}
                                                    position={dropdownPosition}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-12">
                                    <div className="text-gray-500">
                                        <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p className="text-lg font-medium">Nenhum feedback encontrado</p>
                                        <p className="text-sm mt-1">Tente ajustar seus filtros ou aguarde por novos feedbacks.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 border-t border-gray-200">
                    {/* Informações de Itens por Página */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 md:mb-0">
                        <span>Mostrar</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border rounded-md px-2 py-1 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>de {totalItems} resultados</span>
                    </div>

                    {/* Controles de Paginação */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            <ChevronsLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && goToPage(page)}
                                disabled={typeof page !== 'number'}
                                className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                                        ? 'bg-purple-600 text-white'
                                        : 'hover:bg-gray-100'
                                    } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            <ChevronsRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}