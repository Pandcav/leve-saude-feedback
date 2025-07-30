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
        <div className="bg-white rounded-lg shadow">
            {/* Header da Tabela */}
            <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800">Feedbacks Recentes</h1>
                        <p className="text-sm sm:text-lg lg:text-2xl text-gray-600 mt-1">
                            {activeFiltersCount > 0 ? (
                                <span>
                                    Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} feedbacks
                                    <span className="text-purple-600 font-medium"> (filtrados)</span>
                                </span>
                            ) : (
                                <span>Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} feedbacks</span>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />
                                <input
                                    placeholder="Buscar feedbacks..."
                                    value={filters.search}
                                    onChange={(e) => onFilterChange('search', e.target.value)}
                                    className="h-8 sm:h-9 lg:h-10 text-sm sm:text-lg lg:text-2xl pl-8 sm:pl-10 lg:pl-12 w-full sm:w-64 lg:w-90 border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-gray-300 focus:border-gray-300 focus:ring-2"
                                />
                            </div>

                            <div className="flex space-x-2 justify-center sm:justify-start">
                                <div className="relative filter-container">
                                    <button
                                        className={`p-2 transition-colors relative ${activeFiltersCount > 0
                                                ? 'text-purple-600 hover:text-purple-700'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        onClick={() => setShowFilters(!showFilters)}
                                        title={`${activeFiltersCount} filtro(s) ativo(s)`}
                                    >
                                        <Filter className="w-5 h-5 lg:w-7 lg:h-7" />
                                        {activeFiltersCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                {activeFiltersCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Menu de Exportação */}
                                <div className="relative export-menu">
                                    <button
                                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowExportMenu(!showExportMenu)}
                                        title="Exportar dados"
                                    >
                                        <Download className="w-5 h-5 lg:w-7 lg:h-7" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showExportMenu && (
                                        <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                            <div className="py-2">
                                                <button
                                                    onClick={exportToCSV}
                                                    className="flex items-center w-full px-4 py-2 text-sm sm:text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                                                    Exportar CSV
                                                </button>
                                                <button
                                                    onClick={exportToJSON}
                                                    className="flex items-center w-full px-4 py-2 text-sm sm:text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                                                    Exportar JSON
                                                </button>
                                                <hr className="my-2" />
                                                <div className="px-4 py-2 text-xs sm:text-sm text-gray-500">
                                                    {feedbacks.length} registro(s) serão exportados
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Painel de Filtros */}
                {showFilters && (
                    <div className="px-3 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 filter-container">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Filtro por Status */}
                            <div>
                                <label className="block text-sm sm:text-lg lg:text-xl font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => onFilterChange('status', e.target.value as any)}
                                    className="w-full text-sm sm:text-lg lg:text-xl border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="todos">Todos os Status</option>
                                    <option value="novo">Novo</option>
                                    <option value="lido">Lido</option>
                                    <option value="respondido">Respondido</option>
                                </select>
                            </div>

                            {/* Filtro por Rating */}
                            <div>
                                <label className="block text-sm sm:text-lg lg:text-xl font-medium text-gray-700 mb-2">Avaliação</label>
                                <select
                                    value={filters.rating}
                                    onChange={(e) => onFilterChange('rating', e.target.value as any)}
                                    className="w-full text-sm sm:text-lg lg:text-xl border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="todos">Todas as Notas</option>
                                    <option value="5">5 Estrelas</option>
                                    <option value="4">4 Estrelas</option>
                                    <option value="3">3 Estrelas</option>
                                    <option value="2">2 Estrelas</option>
                                    <option value="1">1 Estrela</option>
                                </select>
                            </div>

                            {/* Filtro por Data */}
                            <div>
                                <label className="block text-sm sm:text-lg lg:text-xl font-medium text-gray-700 mb-2">Período</label>
                                <select
                                    value={filters.date}
                                    onChange={(e) => onFilterChange('date', e.target.value as any)}
                                    className="w-full text-sm sm:text-lg lg:text-xl border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="todos">Todas as Datas</option>
                                    <option value="hoje">Hoje</option>
                                    <option value="semana">Última Semana</option>
                                    <option value="mes">Último Mês</option>
                                </select>
                            </div>

                            {/* Botão para limpar filtros */}
                            <div className="flex items-end sm:col-span-2 lg:col-span-1">
                                <button
                                    onClick={onResetFilters}
                                    className="w-full px-4 py-2 bg-purple-600 text-white text-sm sm:text-lg lg:text-xl rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                                    Nota
                                </th>
                                <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                                    Comentário
                                </th>
                                <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentFeedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p className="text-2xl font-medium">Nenhum feedback encontrado</p>
                                            <p className="text-xl mt-2">
                                                {activeFiltersCount > 0
                                                    ? 'Tente ajustar os filtros para ver mais resultados.'
                                                    : 'Não há feedbacks para exibir.'
                                                }
                                            </p>
                                            {activeFiltersCount > 0 && (
                                                <button
                                                    onClick={onResetFilters}
                                                    className="mt-4 px-4 py-2 bg-purple-600 text-white text-lg rounded-lg hover:bg-purple-700 transition-colors"
                                                >
                                                    Limpar Filtros
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentFeedbacks.map((feedback) => (
                                    <tr key={feedback.id} className={`hover:bg-gray-50 ${openActionMenuId === feedback.id ? 'bg-blue-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <UserCircle className="w-8 h-8 text-gray-400" />
                                                <div className="ml-3">
                                                    <div className="text-xl font-medium text-gray-900">{feedback.user?.name || 'Usuário não identificado'}</div>
                                                    <div className="text-sm text-gray-500">{feedback.user?.email || 'Email não disponível'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < (feedback.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="ml-2 text-xl text-gray-600">{feedback.rating || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xl text-gray-900 max-w-xs truncate">{feedback.comment || 'Sem comentário'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">
                                            {formatDate(feedback.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">
                                            <span className={`px-2 py-1 rounded-full text-xl ${getStatusColors(feedback.status || 'novo')}`}>
                                                {(feedback.status || 'novo').charAt(0).toUpperCase() + (feedback.status || 'novo').slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-9 py-4 whitespace-nowrap text-right text-xl font-medium flex justify-start items-center">
                                            <div className="relative action-menu">
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 p-1"
                                                    onClick={(e) => toggleActionMenu(feedback.id, e)}
                                                    title="Mais ações"
                                                >
                                                    <MoreHorizontal className="w-7 h-7" />
                                                </button>

                                                {/* Menu de Ações */}
                                                <ActionDropdown
                                                    isOpen={openActionMenuId === feedback.id}
                                                    position={dropdownPosition}
                                                    onClose={() => setOpenActionMenuId(null)}
                                                    feedback={feedback}
                                                    onMarkAsRead={onMarkAsRead}
                                                    onMarkAsResponded={onMarkAsResponded}
                                                    onViewDetails={onViewDetails}
                                                    onDeleteFeedback={onDeleteFeedback}
                                                    onOpenResponse={onOpenResponse}
                                                    
                                                    
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Controles de Paginação */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            {/* Informações da página atual */}
                            <div className="flex items-center space-x-4">
                                <p className="text-lg text-gray-700">
                                    Página {currentPage} de {totalPages}
                                </p>

                                {/* Seletor de itens por página */}
                                <div className="flex items-center space-x-2">
                                    <label className="text-lg text-gray-700">Itens por página:</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>

                            {/* Navegação de páginas */}
                            <div className="flex items-center space-x-2">
                                {/* Primeira página */}
                                <button
                                    onClick={goToFirstPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    title="Primeira página"
                                >
                                    <ChevronsLeft className="w-5 h-5" />
                                </button>

                                {/* Página anterior */}
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    title="Página anterior"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Números das páginas */}
                                <div className="flex items-center space-x-1">
                                    {getPageNumbers().map((pageNum, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof pageNum === 'number' && goToPage(pageNum)}
                                            disabled={pageNum === '...'}
                                            className={`px-3 py-2 rounded-lg text-lg transition-colors ${pageNum === currentPage
                                                    ? 'bg-purple-600 text-white'
                                                    : pageNum === '...'
                                                        ? 'text-gray-400 cursor-default'
                                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                {/* Próxima página */}
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    title="Próxima página"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                {/* Última página */}
                                <button
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    title="Última página"
                                >
                                    <ChevronsRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}