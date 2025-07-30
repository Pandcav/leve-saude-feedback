import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, ArrowRight, Activity } from "lucide-react"



export default function Login() {
    const { user, signIn, loading} = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if(user){
        return <Navigate to="/dashboard" replace />;    
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500">Loading! ...</div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await signIn(email, password);
        } catch (err) {
           setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const getErrorMessage = (error: any) => {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'Usuário não encontrado. Verifique o email.';
            case 'auth/wrong-password':
                return 'Senha incorreta. Tente novamente.';
            case 'auth/invalid-email':
                return 'Email inválido. Verifique o formato.';
            case 'auth/user-disabled':
                return 'Esta conta foi desabilitada.';
            case 'auth/too-many-requests':
                return 'Muitas tentativas. Tente novamente mais tarde.';
            case 'auth/network-request-failed':
                return 'Erro de conexão. Verifique sua internet.';
            case 'auth/invalid-credential':
                return 'Credenciais inválidas. Verifique email e senha.';
            default:
                return 'Erro ao fazer login. Tente novamente.';
        }
    };

    return(
        <div className="min-h-screen flex flex-col lg:flex-row bg-purple-100">
            {/* Seção Esquerda - Branding */}
            <div className="w-full lg:w-1/2 rounded-b-3xl lg:rounded-r-3xl lg:rounded-b-none bg-purple-700 p-8 flex flex-col items-center justify-center text-center">
                <div className="mx-auto w-24 h-24 sm:w-30 sm:h-30 bg-white/20 rounded-full flex items-center justify-center mb-6 sm:mb-8">
                    <Activity className="w-12 h-12 sm:w-15 sm:h-15 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-5">Leve Saúde</h1>
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-light text-orange-200 mb-4 sm:mb-6">Feedback</h2>
                <p className="text-base sm:text-lg lg:text-2xl text-purple-100 max-w-md">
                   Gerencie feedbacks de saúde com facilidade e eficiência
                </p>
            </div>

            {/* Seção Direita - Formulário de Login */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
                <div className="h-auto bg-white rounded-2xl w-full max-w-md lg:max-w-lg xl:w-3/5 shadow-xl p-6 sm:p-8 border border-gray-100">
                    <div className="mb-6 sm:mb-8 text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Bem-vindo de volta</h2>
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600">Faça login para acessar o painel</p>
                    </div>

                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center text-sm sm:text-base">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="mb-4 sm:mb-6">
                                <label htmlFor="email" className="block text-xl sm:text-2xl lg:text-3xl font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-base sm:text-lg lg:text-2xl h-12 sm:h-14 lg:h-15 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
                                    focus:ring-purple-500 focus:border-purple-500 focus:ring-2"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xl sm:text-2xl lg:text-3xl font-medium text-gray-700">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="text-base sm:text-lg lg:text-2xl h-12 sm:h-14 lg:h-15 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
                                    focus:ring-purple-500 focus:border-purple-500 focus:ring-2"
                                    placeholder="Sua senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                        {showPassword ? <EyeOff className="w-6 h-6 sm:w-7 sm:h-7" /> : <Eye className="w-6 h-6 sm:w-7 sm:h-7" />}
                                    </button>

                                </div>
                            </div>
                        </div>

                        <div className="pt-2 sm:pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-lg sm:text-xl lg:text-2xl h-14 sm:h-16 lg:h-17 bg-gradient-to-r flex justify-center items-center from-purple-600 to-purple-700 hover:from-purple-700 
                                hover:to-purple-800 text-white font-semibold rounded-lg group transition-all duration-300">
                                {isLoading ? 'Entrando...' : 'Entrar'}
                                 <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-4 sm:ml-7 mt-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="text-center flex flex-col items-center pt-2 sm:pt-3">
                            <a href="#"  className="text-base sm:text-lg lg:text-2xl text-purple-600 hover:text-purple-700 hover:underline">
                                Esqueceu sua senha?
                            </a>
                            <a href="#"  className="mt-2 text-lg sm:text-xl lg:text-3xl font-medium text-orange-600 hover:text-orange-700 hover:underline">
                               cadastrar-se
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};