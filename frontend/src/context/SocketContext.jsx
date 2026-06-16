import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            newSocket.emit('user_online', user._id);

            newSocket.on('get_online_users', (users) => {
                setOnlineUsers(users);
            });

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
