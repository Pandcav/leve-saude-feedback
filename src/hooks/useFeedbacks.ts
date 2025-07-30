import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Feedback, FeedbackFilters, FeedbackMetrics } from '../types';

export const useFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar feedbacks em tempo real
  useEffect(() => {
    const feedbacksRef = collection(db, 'feedbacks');
    const q = query(feedbacksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const feedbacksData: Feedback[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          feedbacksData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            response: data.response ? {
              ...data.response,
              respondedAt: data.response.respondedAt?.toDate() || new Date()
            } : undefined
          } as Feedback);
        });
        setFeedbacks(feedbacksData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erro ao carregar feedbacks:', err);
        setError('Erro ao carregar feedbacks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Atualizar status do feedback
  const updateFeedbackStatus = useCallback(async (feedbackId: string, status: Feedback['status']) => {
    try {
      const feedbackRef = doc(db, 'feedbacks', feedbackId);
      await updateDoc(feedbackRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      throw new Error('Erro ao atualizar status do feedback');
    }
  }, []);

  // Adicionar resposta ao feedback
  const addResponse = useCallback(async (feedbackId: string, responseText: string, respondedBy: string) => {
    try {
      const feedbackRef = doc(db, 'feedbacks', feedbackId);
      await updateDoc(feedbackRef, {
        status: 'respondido',
        response: {
          text: responseText,
          respondedBy,
          respondedAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Erro ao adicionar resposta:', err);
      throw new Error('Erro ao adicionar resposta');
    }
  }, []);

  // Excluir feedback
  const deleteFeedback = useCallback(async (feedbackId: string) => {
    try {
      await deleteDoc(doc(db, 'feedbacks', feedbackId));
    } catch (err) {
      console.error('Erro ao excluir feedback:', err);
      throw new Error('Erro ao excluir feedback');
    }
  }, []);

  // Criar novo feedback (para testes)
  const createFeedback = useCallback(async (feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const feedbacksRef = collection(db, 'feedbacks');
      await addDoc(feedbacksRef, {
        ...feedbackData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Erro ao criar feedback:', err);
      throw new Error('Erro ao criar feedback');
    }
  }, []);

  // Filtrar feedbacks
  const filterFeedbacks = useCallback((filters: FeedbackFilters) => {
    return feedbacks.filter(feedback => {
      // Filtro de busca
      const matchesSearch = !filters.search || 
        feedback.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        feedback.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        feedback.comment.toLowerCase().includes(filters.search.toLowerCase());

      // Filtro de status
      const matchesStatus = filters.status === 'todos' || feedback.status === filters.status;

      // Filtro de rating
      const matchesRating = filters.rating === 'todos' || feedback.rating.toString() === filters.rating;

      // Filtro de data
      let matchesDate = true;
      if (filters.date !== 'todos') {
        const feedbackDate = new Date(feedback.createdAt);
        const today = new Date();
        
        switch (filters.date) {
          case 'hoje':
            matchesDate = feedbackDate.toDateString() === today.toDateString();
            break;
          case 'semana':
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            matchesDate = feedbackDate >= weekAgo;
            break;
          case 'mes':
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            matchesDate = feedbackDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesRating && matchesDate;
    });
  }, [feedbacks]);

  // Calcular métricas
  const calculateMetrics = useCallback((filteredFeedbacks: Feedback[]): FeedbackMetrics => {
    const totalFeedbacks = filteredFeedbacks.length;
    
    if (totalFeedbacks === 0) {
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        uniqueUsers: 0,
        satisfactionRate: 0
      };
    }

    const averageRating = filteredFeedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / totalFeedbacks;
    const uniqueUsers = new Set(filteredFeedbacks.map(f => f.userId)).size;
    const satisfactionRate = (filteredFeedbacks.filter(f => f.rating >= 4).length / totalFeedbacks) * 100;

    return {
      totalFeedbacks,
      averageRating,
      uniqueUsers,
      satisfactionRate
    };
  }, []);

  return {
    feedbacks,
    loading,
    error,
    updateFeedbackStatus,
    addResponse,
    deleteFeedback,
    createFeedback,
    filterFeedbacks,
    calculateMetrics
  };
};
