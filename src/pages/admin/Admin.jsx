import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Admin.module.scss';
import sendPng from '../../assets/img/send.png';
import circlePng from '../../assets/img/circle.png';

export const Admin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messagesList, setMessagesList] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const [newAdminMessage, setNewAdminMessage] = useState('');
    const [unreadMessages, setUnreadMessages] = useState({});
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchUsers();
    }, []);
    
    useEffect(() => {
        scrollToBottom();
    }, [messagesList, adminMessages]);

    useEffect(() => {
        let intervalId;
        if (selectedUser) {
            fetchMessages(selectedUser);
            intervalId = setInterval(() => {
                fetchMessages(selectedUser);
            }, 5000); // Poll every 5 seconds
        }
        return () => clearInterval(intervalId);
    }, [selectedUser]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://6668977cf53957909ff897bc.mockapi.io/users');
            const data = await response.json();
            const unreadStatus = {};
            data.forEach(user => {
                unreadStatus[user.id] = checkUnreadMessages(user.messages, user.adminmessage);
            });
            setUsers(data);
            setUnreadMessages(unreadStatus);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const checkUnreadMessages = (userMessages, adminMessages) => {
        const lastAdminMessageTime = adminMessages.length > 0 ? new Date(adminMessages[adminMessages.length - 1].time) : new Date(0);
        return userMessages.some(message => new Date(message.time) > lastAdminMessageTime);
    };

    const fetchMessages = async (user) => {
        try {
            const response = await fetch(`https://6668977cf53957909ff897bc.mockapi.io/users/${user.id}`);
            const userData = await response.json();
            setMessagesList(userData.messages || []);
            setAdminMessages(userData.adminmessage || []);
            setUnreadMessages(prevState => ({
                ...prevState,
                [user.id]: checkUnreadMessages(userData.messages, userData.adminmessage)
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const toggleContainerBlock = (user) => {
        if (selectedUser === user) {
            setSelectedUser(null);
        } else {
            setSelectedUser(user);
            setUnreadMessages(prevState => ({
                ...prevState,
                [user.id]: false
            }));
        }
    };

    const handleSendAdminMessage = async () => {
        if (newAdminMessage.trim() === '') return;
        const timestamp = new Date().toLocaleString('en-US', { hour12: false });
        const messageWithTimestamp = { text: newAdminMessage, time: timestamp };

        try {
            const updatedAdminMessages = [...adminMessages, messageWithTimestamp];
            const updatedUser = { 
                ...selectedUser, 
                messages: [...messagesList], // Ensure we keep the current user messages intact
                adminmessage: updatedAdminMessages 
            };

            const response = await fetch(`https://6668977cf53957909ff897bc.mockapi.io/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            if (response.ok) {
                setAdminMessages(updatedAdminMessages);
                setNewAdminMessage('');
                setUsers(users.map(u => (u.id === selectedUser.id ? updatedUser : u)));
                setUnreadMessages(prevState => ({
                    ...prevState,
                    [selectedUser.id]: false
                }));
            } else {
                console.error('Error updating admin messages:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending admin message:', error);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendAdminMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const mergeAndSortMessages = () => {
        const mergedMessages = [
            ...messagesList.map(msg => ({ ...msg, sender: 'user' })),
            ...adminMessages.map(msg => ({ ...msg, sender: 'admin' }))
        ];

        return mergedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const options = { day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <>
            <header className={styles.header}>
                <h3>Главная</h3>
                <div className={styles.header_block}>
                    <p>Администратор</p>
                    <p>|</p>
                    <Link to='/'><p>Выход</p></Link>
                </div>
            </header>
            <div className={styles.container}>
                <div className={styles.container_list}>
                    <div className={styles.container_list_buttons}>
                        <h3>Все</h3>
                        <h3>Ответы</h3>
                        <h3>Ожидают ответ</h3>
                    </div>
                    <div className={styles.container_list_users}>
                        {users.map((user, index) => (
                            <div key={index} className={styles.container_list_users_block} onClick={() => toggleContainerBlock(user)}>
                                <h3>{user.login}</h3>
                                {unreadMessages[user.id] && <img src={circlePng} alt="circle" />}
                            </div>
                        ))}
                    </div>
                </div>
                {selectedUser && (
                    <div className={styles.container_block}>
                        <div className={styles.container_block_title}>
                            <h2>{selectedUser.login}</h2>
                        </div>
                        <div className={styles.container_block_text}>
                            {mergeAndSortMessages().map((msg, index) => (
                                <div key={index} className={msg.sender === 'user' ? styles.container_block_text_user_message : styles.container_block_text_admin_message}>
                                    <h4>{msg.text}</h4>
                                    <p>{formatTimestamp(msg.time)}</p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className={styles.container_block_input}>
                            <input
                                type="text"
                                placeholder='Введите сообщение...'
                                value={newAdminMessage}
                                onChange={(e) => setNewAdminMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <img src={sendPng} alt="send" onClick={handleSendAdminMessage} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
