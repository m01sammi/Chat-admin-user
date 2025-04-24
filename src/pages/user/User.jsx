import React, { useEffect, useRef, useState } from 'react';
import styles from './User.module.scss';
import { Link, useLocation } from 'react-router-dom';
import chatPng from '../../assets/img/chat.png';
import sendPng from '../../assets/img/send.png';

export const User = () => {
    const location = useLocation();
    const { login } = location.state || {};
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('');
    const [messagesList, setMessagesList] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (login) {
            fetchMessages();
        }
    }, [login]);

    useEffect(() => {
        scrollToBottom();
    }, [messagesList, adminMessages]);

    useEffect(() => {
        let intervalId;
        if (showChat) {
            intervalId = setInterval(() => {
                fetchMessages();
            }, 5000); // Poll every 5 seconds
        }
        return () => clearInterval(intervalId);
    }, [showChat, login]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`https://2d872b439e2c3680.mokky.dev/messages?login=${login}`);
            const users = await response.json();
            if (users.length > 0) {
                const user = users[0];
                setMessagesList(user.messages || []);
                setAdminMessages(user.adminmessage || []);
            } else {
                setMessagesList([]);
                setAdminMessages([]);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const toggleChat = () => {
        setShowChat(!showChat);
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const sendMessage = async () => {
        if (message.trim() === '' || !login) return;

        const timestamp = new Date().toLocaleString('en-US', { hour12: false });
        const messageWithTimestamp = { text: message, time: timestamp };

        try {
            const response = await fetch(`https://2d872b439e2c3680.mokky.dev/messages?login=${login}`, {
                method: 'GET'
            });

            const users = await response.json();
            if (users.length > 0) {
                const user = users[0];
                const updatedMessages = [...(user.messages || []), messageWithTimestamp];

                const updateResponse = await fetch(`https://2d872b439e2c3680.mokky.dev/messages/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages: updatedMessages })
                });

                if (updateResponse.ok) {
                    setMessagesList(updatedMessages);
                    setMessage('');
                } else {
                    console.error('Error updating message:', updateResponse.statusText);
                }
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
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
                    <p>{login ? login : 'Пользователь'}</p>
                    <p>|</p>
                    <Link to='/'><p>Выход</p></Link>
                </div>
            </header>
            <div className={styles.container}>
                {showChat ? (
                    <div className={styles.container_block}>
                        <div className={styles.container_block_title}>
                            <h2>Администратор</h2>
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
                                value={message}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                            />
                            <img 
                                src={sendPng} 
                                alt="send" 
                                onClick={sendMessage}
                            />
                        </div>
                    </div>
                ) : (
                    <p></p>
                )}
                <img 
                    className={styles.container_img} 
                    src={chatPng} 
                    alt="chat" 
                    onClick={toggleChat} 
                />
            </div>
        </>
    );
};
