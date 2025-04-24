import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Authorization.module.scss';
import lockPng from '../../assets/img/lock.png';
import openlockPng from '../../assets/img/open-lock.png';

const Authorization = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [currentLockIndex, setCurrentLockIndex] = useState(0);
    const [isLoginVisible, setIsLoginVisible] = useState(true);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [registrationLogin, setRegistrationLogin] = useState('');
    const [registrationPassword, setRegistrationPassword] = useState('');

    const navigate = useNavigate();
    const locks = [lockPng, openlockPng];

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const changeLock = () => {
        setCurrentLockIndex((currentLockIndex + 1) % locks.length);
        togglePasswordVisibility();
    };

    const showLogin = () => {
        setIsLoginVisible(true);
    };

    const showRegistration = () => {
        setIsLoginVisible(false);
    };

    const handleLoginSubmit = async () => {
        try {
            const usersResponse = await fetch('https://2d872b439e2c3680.mokky.dev/messages');
            const users = await usersResponse.json();

            const user = users.find(user => user.login === login && user.password === password);

            if (user) {
                    alert('Login successful');
                    navigate('/user', { state: { login } });
            } else {
                alert('Пользователь не найден');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        }
    };

    const handleRegistrationSubmit = async () => {
        const userData = {
            login: registrationLogin,
            password: registrationPassword,
        };

        try {
            const usersResponse = await fetch('https://2d872b439e2c3680.mokky.dev/messages');
            const users = await usersResponse.json();

            const userExists = users.some(user => user.login === registrationLogin);

            if (userExists) {
                alert('Пользователь с данным логином уже существует');
                return;
            }

            const response = await fetch('https://2d872b439e2c3680.mokky.dev/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                alert('Registration successful');
                navigate('/user', { state: { login: registrationLogin } });
            } else {
                alert('Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        }
    };

    return (
        <div className={styles.auth}>
            <h1>Чат</h1>
            {isLoginVisible ? (
                <div className={styles.auth_form}>
                    <div className={styles.auth_form_change}>
                        <p onClick={showLogin}>Вход</p>
                        <h2 onClick={showRegistration}>Регистрация</h2>
                    </div>
                    <div className={styles.auth_form_auth}>
                        <p>Введите логин и пароль для входа в систему</p>
                        <div className={styles.auth_form_inputs}>
                            <input 
                                type="text" 
                                placeholder='Введите логин' 
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                            />
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                placeholder='Введите пароль'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <img
                                src={locks[currentLockIndex]}
                                alt="lock"
                                onClick={changeLock}
                            />
                        </div>
                        <div className={styles.auth_form_button}>
                            <p onClick={handleLoginSubmit}>Войти</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.auth_form}>
                    <div className={styles.auth_form_change}>
                        <h2 onClick={showLogin}>Вход</h2>
                        <p onClick={showRegistration}>Регистрация</p>
                    </div>
                    <div className={styles.auth_form_registr}>
                        <p>Введите логин и пароль для регистрации</p>
                        <div className={styles.auth_form_inputs}>
                            <input 
                                type="text" 
                                placeholder='Введите логин' 
                                value={registrationLogin}
                                onChange={(e) => setRegistrationLogin(e.target.value)}
                            />
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                placeholder='Введите пароль'
                                value={registrationPassword}
                                onChange={(e) => setRegistrationPassword(e.target.value)}
                            />
                            <img
                                src={locks[currentLockIndex]}
                                alt="lock"
                                onClick={changeLock}
                            />
                        </div>
                        <div className={styles.auth_form_button}>
                            <p onClick={handleRegistrationSubmit}>Регистрация</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Authorization;
