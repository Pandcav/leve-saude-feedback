# Leve Saúde - Sistema de Feedback Web

Dashboard administrativo para gerenciamento de feedbacks dos usuários da plataforma Leve Saúde.

## 🌟 Funcionalidades Implementadas

### ✅ Autenticação
- Sistema de login com Firebase Auth
- Proteção de rotas autenticadas
- Context API para gerenciamento de estado de autenticação

### ✅ Dashboard Administrativo
- Métricas em tempo real (Total de Feedbacks, Nota Média, Usuários Únicos, Taxa de Satisfação)
- Gráficos interativos com Recharts:
  - Distribuição de Avaliações (Gráfico de Barras)
  - Avaliação Média (Gráfico Gauge)
  - Status dos Feedbacks (Gráfico de Pizza)

### ✅ Gerenciamento de Feedbacks
- Listagem completa com paginação
- Sistema de filtros avançados (busca, status, avaliação, data)
- Ações por feedback (marcar como lido/respondido, visualizar detalhes, responder, excluir)
- Exportação de dados (CSV e JSON)
- Sistema de notificações para novos feedbacks

### ✅ Interface Responsiva
- Design totalmente responsivo com Tailwind CSS
- Otimizado para mobile, tablet, laptop e desktop
- Interface moderna e intuitiva

### ✅ Tecnologias Utilizadas
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Auth + Firestore)
- **Gráficos:** Recharts
- **Ícones:** Lucide React

## � Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Pandcav/teste-web-leve-saude.git
   ```

2. **Navegue até a pasta do projeto:**
   ```bash
   cd test-web-leve-saude
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Configure o Firebase:**
   - Crie um projeto no Firebase Console
   - Configure Authentication e Firestore
   - Atualize as credenciais em `src/lib/firebase.ts`

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação:**
   - Abra [http://localhost:5173](http://localhost:5173) no navegador

## � Estrutura do Projeto

```
src/
├── components/
│   ├── auth/
│   │   └── AuthProvider.tsx
│   ├── feedback/
│   │   ├── table/
│   │   │   └── FeedbackTable.tsx
│   │   ├── modals/
│   │   │   ├── FeedbackDetailsModal.tsx
│   │   │   └── FeedbackResponseModal.tsx
│   │   └── dropdown/
│   │       └── ActionDropdown.tsx
│   └── ui/
│       ├── ConfirmationModal.tsx
│       └── NotificationModal.tsx
├── pages/
│   ├── Dashboard.tsx
│   └── Login.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useFeedbacks.ts
│   └── useNotification.ts
├── types/
│   └── index.ts
├── utils/
│   └── formatters.ts
└── lib/
    └── firebase.ts
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter ESLint
