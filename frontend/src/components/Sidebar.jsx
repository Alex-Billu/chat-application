import React, { useState, useEffect } from 'react';
import { Search, LogOut, Plus, MessageSquare, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import GroupChatModal from './GroupChatModal';

const Sidebar = ({ onSelectChat, selectedChatId, user, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { socket } = useSocket();

    const fetchChats = async () => {
        try {
            setLoadingChats(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/chats', config);
            setChats(data);
            setLoadingChats(false);
        } catch (error) {
            console.error("Failed to load chats");
            setLoadingChats(false);
        }
    };

    useEffect(() => {
        if (user) fetchChats();
    }, [user]);

    // Handle incoming messages to update sidebar
    useEffect(() => {
        if (!socket) return;
        socket.on('message_received', (newMessage) => {
            fetchChats(); // Refresh chat list to show latest message
        });
    }, [socket]);

    const handleSearch = async (query) => {
        setSearchTerm(query);
        if (!query) {
            setSearchResult([]);
            setIsSearching(false);
            return;
        }

        try {
            setLoading(true);
            setIsSearching(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`http://localhost:5000/api/users?search=${query}`, config);
            setSearchResult(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to search users");
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoading(true);
            const config = {
                headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('http://localhost:5000/api/chats', { userId }, config);
            
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            
            onSelectChat(data);
            setIsSearching(false);
            setSearchTerm('');
            setLoading(false);
        } catch (error) {
            console.error("Error fetching the chat");
            setLoading(false);
        }
    };

    const getSender = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
    };

    const getSenderPic = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].profilePic : users[0].profilePic;
    };

    return (
        <div className="flex flex-col h-full bg-[#091328] relative z-10">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-md group-hover:bg-indigo-500/30 transition-all pulse"></div>
                        <img 
                            src={user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                            alt="avatar" 
                            className="relative w-12 h-12 rounded-full border-2 border-indigo-500/20 glass aura-glow object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#091328] rounded-full shadow-lg"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg tracking-tight truncate w-32">{user?.name}</h3>
                        <div className="flex items-center text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Online
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white glass"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onLogout}
                        className="p-2.5 hover:bg-red-500/10 rounded-2xl transition-all text-slate-400 hover:text-red-400 glass"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-6 pb-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Jump to conversation..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-[#000000]/30 border-none rounded-2xl py-3 pl-11 pr-10 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-white placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* List Area */}
            <div className="flex-grow overflow-y-auto px-4 pb-4 scrollbar-hide">
                {isSearching ? (
                    <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 mb-4">Results</div>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500/50" /></div>
                        ) : searchResult.length > 0 ? (
                            searchResult.map(res => (
                                <button
                                    key={res._id}
                                    onClick={() => accessChat(res._id)}
                                    className="w-full flex items-center p-3 rounded-2xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-white/[0.02]"
                                >
                                    <div className="relative">
                                        <img src={res.profilePic} alt={res.name} className="w-11 h-11 rounded-full border border-white/10" />
                                    </div>
                                    <div className="ml-4 text-left">
                                        <h4 className="font-bold text-white text-sm">{res.name}</h4>
                                        <p className="text-xs text-slate-500">{res.email}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center p-10 text-slate-600 text-sm font-medium italic">No matches found</div>
                        )}
                    </div>
                ) : (
                    <div className="mt-2 space-y-1">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 mb-4">Messages</div>
                        {loadingChats ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500/50" /></div>
                        ) : chats.length > 0 ? (
                            chats.map(chat => (
                                <button
                                    key={chat._id}
                                    onClick={() => onSelectChat(chat)}
                                    className={`w-full flex items-center p-4 rounded-[24px] transition-all duration-300 ${
                                        selectedChatId === chat._id 
                                        ? 'bg-indigo-600/10 text-white aura-glow border border-indigo-500/20' 
                                        : 'hover:bg-white/[0.03] text-slate-400'
                                    }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className={`absolute -inset-1 rounded-full blur-sm transition-opacity duration-500 ${selectedChatId === chat._id ? 'bg-indigo-500/20 opacity-100' : 'opacity-0'}`}></div>
                                        <img 
                                            src={chat.isGroupChat ? 'https://cdn-icons-png.flaticon.com/512/615/615075.png' : getSenderPic(user, chat.users)} 
                                            alt="avatar" 
                                            className={`relative w-12 h-12 rounded-full border border-white/10 object-cover ${selectedChatId === chat._id ? 'border-indigo-400/50' : ''}`}
                                        />
                                        {!chat.isGroupChat && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#091328] rounded-full shadow-lg"></div>
                                        )}
                                    </div>
                                    <div className="ml-4 text-left flex-grow overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h4 className={`font-bold truncate text-[15px] ${selectedChatId === chat._id ? 'text-white' : 'group-hover:text-white'}`}>
                                                {chat.isGroupChat ? chat.chatName : getSender(user, chat.users)}
                                            </h4>
                                            {chat.updatedAt && (
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                    {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate font-medium ${selectedChatId === chat._id ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                            {chat.latestMessage ? (
                                                <>
                                                    <span className="opacity-60">{chat.latestMessage.sender._id === user._id ? 'You: ' : ''}</span>
                                                    {chat.latestMessage.content}
                                                </>
                                            ) : 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center p-12 text-slate-700 bg-black/10 rounded-3xl">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Your loom is empty</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <GroupChatModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onGroupCreated={(newChat) => {
                    setChats([newChat, ...chats]);
                    onSelectChat(newChat);
                }}
            />
        </div>
    );
};

export default Sidebar;
