import { useAuth } from '../hooks/useAuth';
import { useFeedbacks } from '../hooks/useFeedbacks';
import { useState, useEffect } from 'react';
import {
  UserCircle,
  LogOut,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Bell,
  Loader,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import { FeedbackDetailsModal, FeedbackResponseModal, FeedbackTable } from '../components/feedback';
import type { FeedbackFilters } from '../types';
import { formatDate } from '../utils/formatters';

type Needle = {
  value: number;
  data: { name: string; value: number; color: string }[];
  cx: number;
  cy: number;
  iR: number;
  oR: number;
  color: string;
};


export default function Dashboard() {
  const { user, signOut } = useAuth();

  // Hook para gerenciar feedbacks do Firebase
  const {
    feedbacks,
    loading,
    error,
    updateFeedbackStatus,
    addResponse,
    deleteFeedback,
    filterFeedbacks,
    calculateMetrics
  } = useFeedbacks();

  // Estados para filtros
  const [filters, setFilters] = useState<FeedbackFilters>({
    search: '',
    status: 'todos',
    rating: 'todos',
    date: 'todos'
  });
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Estados para modais
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  // Estados para detalhes do feedback
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsFeedback, setDetailsFeedback] = useState<any>(null);

  // Estados para notificações
  const [showNotifications, setShowNotifications] = useState(false);

  // Estados para paginação - removidos pois agora estão no componente FeedbackTable

  const cx = 220;
  const cy = 185;
  const iR = 250;
  const oR = 100;


  const handleSignOut = () => {
    signOut();
  };

  // Fechar menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      const isClickOutsideAction = !target.closest('.action-menu');
      const isClickOutsideModal = target.classList.contains('modal-backdrop');
      const isClickOutsideNotifications = !target.closest('.notifications-menu');

      if (isClickOutsideAction) {
        setOpenActionMenuId(null);
      }

      if (isClickOutsideNotifications) {
        setShowNotifications(false);
      }

      if (isClickOutsideModal) {
        handleCloseResponseModal();
        handleCloseDetailsModal();
      }
    };

    if (openActionMenuId !== null || showResponseModal || showDetailsModal || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenuId, showResponseModal, showDetailsModal, showNotifications]);

  // Filtrar feedbacks usando o hook
  const filteredFeedbacks = filterFeedbacks(filters);

  // Calcular métricas usando o hook
  const metricsData = calculateMetrics(filteredFeedbacks);

  // Calcular feedbacks novos para notificações
  const newFeedbacks = feedbacks.filter(feedback => feedback.status === 'novo');
  const newFeedbacksCount = newFeedbacks.length;

  // Obter os 5 feedbacks mais recentes com status 'novo'
  const recentNewFeedbacks = newFeedbacks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const metricsCards = [
    {
      title: "Total de Feedbacks",
      value: metricsData.totalFeedbacks.toLocaleString(),
      icon: MessageSquare,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Nota Média",
      value: metricsData.averageRating.toFixed(1),
      icon: Star,
      color: "bg-yellow-500",
      change: "+0.3",
      changeType: "positive",
    },
    {
      title: "Usuários Únicos",
      value: metricsData.uniqueUsers.toLocaleString(),
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Taxa de Satisfação",
      value: `${Math.round(metricsData.satisfactionRate)}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "+5%",
      changeType: "positive",
    },
  ];

  const status = [
    { label: 'NOVO', value: filteredFeedbacks.filter(feedback => feedback.status === 'novo').length, color: '#22c55e' },
    { label: 'LIDO', value: filteredFeedbacks.filter(feedback => feedback.status === 'lido').length, color: '#3b82f6' },
    { label: 'RESP', value: filteredFeedbacks.filter(feedback => feedback.status === 'respondido').length, color: '#a855f7' },
  ];

  const rating = [
    { name: '1 Estrela', value: filteredFeedbacks.filter(feedback => feedback.rating === 1).length, color: '#ef4444' }, // Vermelho
    { name: '2 Estrelas', value: filteredFeedbacks.filter(feedback => feedback.rating === 2).length, color: '#f97316' }, // Laranja
    { name: '3 Estrelas', value: filteredFeedbacks.filter(feedback => feedback.rating === 3).length, color: '#eab308' }, // Amarelo
    { name: '4 Estrelas', value: filteredFeedbacks.filter(feedback => feedback.rating === 4).length, color: '#84cc16' }, // Verde claro
    { name: '5 Estrelas', value: filteredFeedbacks.filter(feedback => feedback.rating === 5).length, color: '#22c55e' }, // Verde
  ];

  const mediumRating = [
    { name: "Satisfação", value: metricsData.averageRating, color: '#00C49F' },
    { name: "Máximo", value: 5 - metricsData.averageRating, color: '#f1f5f9' }
  ];

  // Calcular a média para o gauge
  const averageRating = metricsData.averageRating;
  const value = averageRating;

  // Funções para ações dos feedbacks
  const handleMarkAsRead = async (feedbackId: string) => {
    try {
      await updateFeedbackStatus(feedbackId, 'lido');
      setOpenActionMenuId(null);
      alert(`Feedback marcado como lido!`);
    } catch (error) {
      alert('Erro ao marcar feedback como lido.');
    }
  };

  const handleMarkAsResponded = async (feedbackId: string) => {
    try {
      await updateFeedbackStatus(feedbackId, 'respondido');
      setOpenActionMenuId(null);
      alert(`Feedback marcado como respondido!`);
    } catch (error) {
      alert('Erro ao marcar feedback como respondido.');
    }
  };

  const handleViewDetails = (feedbackId: string) => {
    const feedback = filteredFeedbacks.find(f => f.id === feedbackId);
    if (feedback) {
      setDetailsFeedback(feedback);
      setShowDetailsModal(true);
    }
    setOpenActionMenuId(null);
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (window.confirm(`Tem certeza que deseja excluir este feedback?`)) {
      try {
        await deleteFeedback(feedbackId);
        alert(`Feedback excluído com sucesso!`);
        setOpenActionMenuId(null);
      } catch (error) {
        alert('Erro ao excluir feedback.');
      }
    }
  };

  // Função para abrir modal de resposta
  const handleOpenResponse = (feedback: any) => {
    setSelectedFeedback(feedback);
    setShowResponseModal(true);
    setOpenActionMenuId(null);
  };

  // Função para enviar resposta
  const handleSendResponse = async (feedbackId: string, responseText: string) => {
    try {
      await addResponse(feedbackId, responseText, user?.email || 'admin');
      const feedback = filteredFeedbacks.find(f => f.id === feedbackId);
      if (feedback) {
        alert(`Resposta enviada com sucesso para ${feedback.user.name}!\n\nResposta: "${responseText}"`);
      }
    } catch (error) {
      alert('Erro ao enviar resposta.');
    }
  };

  // Função para fechar modal de resposta
  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setSelectedFeedback(null);
  };

  // Função para fechar modal de detalhes
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsFeedback(null);
  };

  // Função para atualizar filtros individuais
  const updateFilter = (key: keyof FeedbackFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Função para resetar todos os filtros
  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'todos',
      rating: 'todos',
      date: 'todos'
    });
  };

  // Função para marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    try {
      const promises = newFeedbacks.map(feedback =>
        updateFeedbackStatus(feedback.id, 'lido')
      );
      await Promise.all(promises);
      setShowNotifications(false);
      alert(`${newFeedbacksCount} feedback(s) marcado(s) como lido!`);
    } catch (error) {
      alert('Erro ao marcar feedbacks como lidos.');
    }
  };

  // Função para visualizar feedback específico das notificações
  const viewFeedbackFromNotification = (feedbackId: string) => {
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (feedback) {
      setDetailsFeedback(feedback);
      setShowDetailsModal(true);
      setShowNotifications(false);
    }
  };

  const RADIAN = Math.PI / 180;

  const needle = ({ value, data, cx, cy, iR, oR, color }: Needle) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx + 5;
    const y0 = cy + 5;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return [
      <circle key="needle-circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
      <path
        key="needle-path"
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="#none"
        fill={color}
      />,
    ];
  };

  return (
    <div className="min-h-screen bg-purple-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Leve Saúde Dashboard</h1>
            <p className="text-2xl text-gray-600">Gerencie feedbacks e monitore a satisfação</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sistema de Notificações */}
            <div className="relative notifications-menu">
              <button
                className={`p-2 transition-colors relative ${newFeedbacksCount > 0
                  ? 'text-purple-600 hover:text-purple-700'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
                onClick={() => setShowNotifications(!showNotifications)}
                title={`${newFeedbacksCount} feedback(s) novo(s)`}
              >
                <Bell className="w-8 h-8" />
                {newFeedbacksCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {newFeedbacksCount > 99 ? '99+' : newFeedbacksCount}
                  </span>
                )}
              </button>

              {/* Menu de Notificações */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-30 max-h-96 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Notificações {newFeedbacksCount > 0 && `(${newFeedbacksCount})`}
                      </h3>
                      {newFeedbacksCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {newFeedbacksCount === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">Nenhuma notificação</p>
                        <p className="text-sm mt-1">Todos os feedbacks foram lidos</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {recentNewFeedbacks.map((feedback) => (
                          <div
                            key={feedback.id}
                            className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
                            onClick={() => viewFeedbackFromNotification(feedback.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <UserCircle className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {feedback.user.name}
                                  </p>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 truncate mt-1">
                                  {feedback.comment}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(feedback.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {newFeedbacksCount > 5 && (
                          <div className="px-4 py-3 text-center border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">
                              E mais {newFeedbacksCount - 5} feedback(s) novo(s)...
                            </p>
                            <button
                              onClick={() => {
                                updateFilter('status', 'novo');
                                setShowNotifications(false);
                              }}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-1"
                            >
                              Ver todos os feedbacks novos
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <UserCircle className="w-8 h-8 text-gray-600" />
              <span className="text-2xl text-gray-700">{user?.email}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-8 h-8" />
              <span className="text-2xl">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-2/3 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicador de carregamento */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-purple-600 mr-3" />
            <span className="text-lg text-gray-600">Carregando feedbacks...</span>
          </div>
        )}

        {/* Indicador de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metricsCards.map((metric, index) => (
                <div key={index} className="h-auto bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${metric.color} p-3 rounded-lg`}>
                      <metric.icon className="w-8 h-8 text-white" />
                    </div>

                    <div className="ml-4">
                      <p className="text-xl font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  </div>
                  <p className="text-xl text-green-600 flex items-center mt-5">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {metric.change} desde o mês passado
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className='flex justify-between items-center mb-8'>
          <div className=' h-85 bg-white w-1/2 rounded-lg py-4 mr-6'>
            <h2 className='text-2xl font-semibold text-gray-800 text-center mb-2'>Distribuição de Avaliações por Nota (Rating)</h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart width={150} height={40} data={rating} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} feedback${value !== 1 ? 's' : ''}`,
                    name
                  ]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  label={({ value }) => value > 0 ? value : ''}
                >
                  {rating.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='flex justify-between items-center w-1/2'>
            <div className='h-85 bg-white w-2/3 rounded-lg py-4 mr-6'>
              <h2 className='text-2xl font-semibold text-gray-800 text-center mb-2'>Avaliação Média dos Feedbacks</h2>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart width={150} height={40}>
                  <Pie
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    data={mediumRating}
                    cx="50%"
                    cy="80%"
                    innerRadius="100"
                    outerRadius="180"
                    fill="#8884d8"
                    stroke="none"
                  >
                    {mediumRating.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {needle({ value, data: mediumRating, cx, cy, iR, oR, color: '#797979ff' })}
                  <text
                    x="50%"
                    y="75%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#374151"
                  >
                    {averageRating.toFixed(1)}
                  </text>
                  <text
                    x="50%"
                    y="82%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fill="#9CA3AF"
                  >
                    de 5.0
                  </text>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className='h-85 bg-white w-2/3 rounded-lg py-4'>
              <h2 className='text-2xl font-semibold text-gray-800 text-center mb-2'>Proporção de Status dos Feedbacks</h2>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart width={150} height={40}>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} feedback${value !== 1 ? 's' : ''}`,
                      name === 'NOVO' ? 'Novos' : name === 'LIDO' ? 'Lidos' : 'Respondidos'
                    ]}
                    labelFormatter={() => ''}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Pie
                    data={status}
                    dataKey="value"
                    fill="#884d98"
                    nameKey="label"
                    cx="55%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ value, percent }: any) =>
                      value && value > 0 && percent ? `${(percent * 100).toFixed(0)}%` : ''

                    }
                    labelLine={false}

                  >
                    {status.map((entry) => (
                      <Cell key={`cell-${entry.label}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconSize={12}
                    iconType='circle'
                    wrapperStyle={{ fontSize: '1.5rem', paddingRight: '5px' }}
                    formatter={(value) =>
                      value === 'NOVO' ? 'Novos' :
                        value === 'LIDO' ? 'Lidos' : 'Respondidos'
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <FeedbackTable
          feedbacks={filteredFeedbacks}
          filters={filters}
          onFilterChange={updateFilter}
          onMarkAsRead={handleMarkAsRead}
          onMarkAsResponded={handleMarkAsResponded}
          onViewDetails={handleViewDetails}
          onDeleteFeedback={handleDeleteFeedback}
          onOpenResponse={handleOpenResponse}
          onResetFilters={resetFilters}
        />
      </main>

      {/* Modais */}
      <FeedbackResponseModal
        isOpen={showResponseModal}
        feedback={selectedFeedback}
        onClose={handleCloseResponseModal}
        onSendResponse={handleSendResponse}
      />

      <FeedbackDetailsModal
        isOpen={showDetailsModal}
        feedback={detailsFeedback}
        onClose={handleCloseDetailsModal}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsResponded={handleMarkAsResponded}
        onOpenResponse={handleOpenResponse}
      />
    </div>
  );
}