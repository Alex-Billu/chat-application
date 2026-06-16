import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, MoreVertical, Phone, Video, ChevronLeft, Smile, Loader2, Info, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ chat, onBack }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const { user } = useAuth();
    const { socket } = useSocket();
    const scrollRef = useRef();
    const imageInputRef = useRef();

    // ... (keep getSender and getSenderPic)

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            const { data } = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            });
            
            // Send message with image URL
            const config = {
                headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
            };
            const { data: msgData } = await axios.post('http://localhost:5000/api/messages', {
                content: "Sent an image",
                chatId: chat._id,
                messageType: 'image',
                fileUrl: data.url
            }, config);

            socket.emit('new_message', msgData);
            setMessages((prev) => [...prev, msgData]);
            setLoading(false);
        } catch (error) {
            console.error("Image upload failed");
            setLoading(false);
        }
    };

    const getSender = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
    };

    const getSenderPic = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].profilePic : users[0].profilePic;
    };

    const fetchMessages = async () => {
        if (!chat) return;
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`http://localhost:5000/api/messages/${chat._id}`, config);
            setMessages(data);
            setLoading(false);
            socket.emit('join_chat', chat._id);
        } catch (error) {
            console.error("Failed to load messages");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [chat]);

    useEffect(() => {
        if (!socket) return;
        
        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop_typing', () => setIsTyping(false));

        socket.on('message_received', (newMessageReceived) => {
            if (!chat || chat._id !== newMessageReceived.chat._id) {
                // Handle notification for other chats
            } else {
                setMessages((prev) => [...prev, newMessageReceived]);
            }
        });

        return () => {
            socket.off('message_received');
            socket.off('typing');
            socket.off('stop_typing');
        };
    }, [socket, chat]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        socket.emit('stop_typing', chat._id);
        try {
            const config = {
                headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
            };
            const msgToSend = message;
            setMessage('');
            const { data } = await axios.post('http://localhost:5000/api/messages', {
                content: msgToSend,
                chatId: chat._id
            }, config);

            socket.emit('new_message', data);
            setMessages((prev) => [...prev, data]);
        } catch (error) {
            console.error("Error sending message");
        }
    };

    const typingHandler = (e) => {
        setMessage(e.target.value);
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', chat._id);
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit('stop_typing', chat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-[#060e20]">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right--[10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Header */}
            <div className="p-6 glass border-b border-white/5 relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <img 
                            src={chat.isGroupChat ? 'https://cdn-icons-png.flaticon.com/512/615/615075.png' : getSenderPic(user, chat.users)} 
                            alt="avatar" 
                            className="w-12 h-12 rounded-full border-2 border-indigo-400/20 aura-glow object-cover"
                        />
                        {!chat.isGroupChat && (
                            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#091328] rounded-full"></div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            {chat.isGroupChat ? chat.chatName : getSender(user, chat.users)}
                        </h2>
                        {isTyping ? (
                            <div className="flex items-center space-x-2 text-[10px] text-indigo-400 font-black uppercase tracking-widest">
                                <motion.div 
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                                />
                                <span>Typing...</span>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {chat.isGroupChat ? `${chat.users.length} members` : 'Active Now'}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="p-2.5 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white glass"><Phone className="w-5 h-5" /></button>
                    <button className="p-2.5 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white glass"><Video className="w-5 h-5" /></button>
                    <button className="p-2.5 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white glass"><Info className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-hide relative z-10">
                {messages.map((msg, index) => {
                    const isMe = msg.sender._id === user._id;
                    const showAvatar = index === 0 || messages[index-1].sender._id !== msg.sender._id;

                    return (
                        <motion.div 
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                        >
                            <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                {!isMe && (
                                    <div className="w-8 flex-shrink-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                                        {showAvatar && (
                                            <img src={msg.sender.profilePic} alt="avatar" className="w-8 h-8 rounded-full border border-white/10" />
                                        )}
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {showAvatar && !isMe && (
                                        <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1 uppercase tracking-tighter">{msg.sender.name}</span>
                                    )}
                                    <div className={`px-5 py-3 rounded-[24px] shadow-2xl relative transition-all duration-300 ${
                                        isMe 
                                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-none aura-glow' 
                                        : 'bg-white/[0.04] text-slate-100 rounded-bl-none border border-white/5 backdrop-blur-md'
                                    }`}>
                                        {msg.messageType === 'image' && (
                                            <img src={msg.fileUrl} alt="sent" className="w-full max-w-sm rounded-2xl mb-3 border border-white/10 shadow-2xl" />
                                        )}
                                        <p className="text-[15px] font-medium leading-relaxed break-words">{msg.content}</p>
                                        <div className={`flex items-center justify-end space-x-1 mt-1.5 opacity-40 group-hover:opacity-100 transition-opacity`}>
                                            <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && <CheckCheck className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 relative z-10">
                <div className="max-w-4xl mx-auto glass p-2 rounded-[28px] border border-white/5 aura-glow">
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                        <div className="flex items-center px-2">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={imageInputRef}
                                onChange={handleImageUpload}
                            />
                            <button 
                                type="button" 
                                onClick={() => imageInputRef.current.click()}
                                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-indigo-400"
                            >
                                <Image className="w-5 h-5" />
                            </button>
                            <button type="button" className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-indigo-400">
                                <Smile className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-grow">
                            <input 
                                type="text" 
                                placeholder="Message your loom..."
                                value={message}
                                onChange={typingHandler}
                                className="w-full bg-transparent border-none py-3 px-2 text-white placeholder:text-slate-600 focus:ring-0 text-[15px] font-medium"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!message.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:hover:bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
