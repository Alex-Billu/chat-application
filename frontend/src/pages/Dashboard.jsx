import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const { logout, user } = useAuth();

    return (
        <div className="flex h-screen overflow-hidden bg-[#0f172a]">
            {/* Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <Sidebar 
                    onSelectChat={setSelectedChat} 
                    selectedChatId={selectedChat?._id}
                    user={user}
                    onLogout={logout}
                />
            </div>

            {/* Chat Area */}
            <div className={`flex-grow h-full bg-[#1e293b]/30 ${!selectedChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                <AnimatePresence mode="wait">
                    {selectedChat ? (
                        <motion.div 
                            key={selectedChat._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full"
                        >
                            <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">👋</span>
                            </div>
                            <h2 className="text-2xl font-semibold text-white">Select a conversation</h2>
                            <p className="text-slate-400 mt-2">Choose someone from your contacts to start chatting</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
