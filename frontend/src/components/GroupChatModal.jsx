import React, { useState } from 'react';
import { X, Loader2, Users, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const GroupChatModal = ({ isOpen, onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const { user } = useAuth();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return;

        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`http://localhost:5000/api/users?search=${query}`, config);
            setSearchResult(data);
            setLoading(false);
        } catch (error) {
            console.error("Search failed");
            setLoading(false);
        }
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.some(u => u._id === userToAdd._id)) {
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        if (!groupName || selectedUsers.length === 0) {
            alert("Please fill all the fields");
            return;
        }

        try {
            setIsCreating(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post(
                `http://localhost:5000/api/chats/group`,
                {
                    name: groupName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            onGroupCreated(data);
            onClose();
            setIsCreating(false);
            setGroupName('');
            setSelectedUsers([]);
            setSearchResult([]);
        } catch (error) {
            console.error("Failed to create group");
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg glass aura-glow rounded-[40px] p-8 border border-white/5 bg-[#141f38]/40 overflow-hidden relative"
            >
                {/* Decorative Aura */}
                <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3.5 bg-indigo-600/20 rounded-2xl">
                        <Users className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Create Loom Group</h2>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Group Details</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#000000]/30 border-none rounded-2xl py-4 px-5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            placeholder="Enter a creative name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Invite Collaborators</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text" 
                                className="w-full bg-[#000000]/30 border-none rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                placeholder="Search by name or email..."
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Selected Users Chips */}
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-hide">
                        <AnimatePresence>
                            {selectedUsers.map((u) => (
                                <motion.div 
                                    key={u._id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center space-x-2 bg-indigo-500/10 text-indigo-200 text-xs font-bold py-2 px-3.5 rounded-full border border-indigo-500/20 shadow-lg"
                                >
                                    <span>{u.name}</span>
                                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" onClick={() => handleDelete(u)} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Search Results */}
                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-500/50" /></div>
                        ) : (
                            searchResult?.slice(0, 5).map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => handleGroup(u)}
                                    className="w-full flex items-center p-3 rounded-2xl hover:bg-white/[0.03] transition-all group text-left border border-transparent hover:border-white/[0.02]"
                                >
                                    <img src={u.profilePic} className="w-9 h-9 rounded-full border border-white/10" alt={u.name} />
                                    <div className="ml-4">
                                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{u.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{u.email}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isCreating}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-20 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center space-x-3 mt-4"
                    >
                        {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <span>Create Group Loom</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default GroupChatModal;
