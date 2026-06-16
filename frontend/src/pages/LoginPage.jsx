import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 glass rounded-2xl shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 mb-4 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/50">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Sign In</h1>
                    <p className="mt-2 text-slate-400">Welcome back to Real-Time Chat</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 mb-6 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-lg"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <LogIn className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Create Account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
