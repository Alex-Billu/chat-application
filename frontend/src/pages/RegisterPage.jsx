import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await register(name, email, password);
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#060e20] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Auras */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="glass aura-glow p-10 rounded-[40px] border border-white/5 bg-white/[0.02]">
                    <div className="text-center mb-10">
                        <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="inline-block p-4 rounded-3xl bg-indigo-600/20 mb-6"
                        >
                            <UserPlus className="w-10 h-10 text-indigo-400" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Loom</h1>
                        <p className="text-slate-400 font-medium">Join the sanctuary of conversations</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#000000]/40 border-none rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#000000]/40 border-none rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input 
                                    type="password" 
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#000000]/40 border-none rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-4"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500">
                            Already part of the loom? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in here</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
