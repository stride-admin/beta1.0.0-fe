import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import './Home.css';

import WelcomeModal from '../components/WelcomeModal'; // Import the WelcomeModal component
import ProgressBar from '../components/ProgressBar';
import PieChart from '../components/PieChart';
import CollapsibleSection from '../components/CollapsibleSection';

import { useTodos } from '../hooks/useTodos';

import { fire } from '../icons/icons';

import { supabase } from '../utils/supabaseClient';

export default function Home() {
    const [completedTodos, setCompletedTodos] = useState({});
    const streak = 12;
    const spent = 129.33;

    const { 
        userId, 
        user, setUser, 
        wallet, setWallet, 
        health, setHealth
    } = useAppContext();

    const { todos, deleteTodo } = useTodos(); // <-- using the hook here

    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [isUserLoaded, setIsUserLoaded] = useState(false);

    const fetchUserData = async () => {
        try {
            const { data, error } = await supabase
                .from('user')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            setUser(data);
            return data;
        } catch (err) {
            console.error("Error fetching user data:", err);
            return null;
        }
    };

    const fetchUserWallet = async () => {
        try {
            const { data, error } = await supabase
                .from('user_wallet')
                .select("*")
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setWallet(data);
                return data;
            } else {
                console.log('User has no wallet');
                return null;
            }
        } catch (err) {
            console.error("Error fetching wallet:", err);
            return null;
        }
    };

    const fetchUserHealth = async () => {
        try {
            const { data, error } = await supabase
                .from('user_health')
                .select("*")
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setHealth(data);
                return data;
            } else {
                console.log('User has no health info');
                return null;
            }
        } catch (err) {
            console.error("Error fetching health:", err);
            return null;
        }
    };

    const checkUserSetup = (walletData, healthData) => {
        if (!walletData || !healthData) {
            console.log("User isn't fully set up");
            setSetupModalOpen(true);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            if (userId) {
                const userData = await fetchUserData();

                if (userData) {
                    const walletData = await fetchUserWallet();
                    const healthData = await fetchUserHealth();
                    checkUserSetup(walletData, healthData);
                }

                setIsUserLoaded(true);
            }
        };

        loadUserData();
    }, [userId]);

    const handleCloseModal = () => {
        setSetupModalOpen(false);
        fetchUserWallet();
        fetchUserHealth();
    };

    return (
        <div className="home">
            <div className='home-header'>
                <h1 id='welcome-header'>{user ? `Hello, ${user.name}` : ''}</h1>
                <img src={fire} alt='fire' id='fire' />
                <p id='streak-no'>{streak}</p>
            </div>

            <div className='home-content'>
                <div className='home-finances'>
                    <div className='home-finances-header'>
                        <div className='home-finances-row'>
                            <p className='home-finances-row-title'>{wallet ? wallet['balance'] : null}</p>
                            <p className='home-finances-row-title' style={{ opacity: 0.3, fontWeight: 100 }}>$</p>
                            <p className='home-finances-row-title'>{spent}</p>
                        </div>
                        <div className='home-finances-row'>
                            <p className='home-finances-row-subtitle'>Balance</p>
                            <p className='home-finances-row-subtitle'>Spent today</p>
                        </div>
                    </div>
                    <ProgressBar
                        id="home-finances-progress-bar"
                        title="Budget spent (W)"
                        current="2351.92"
                        max={3000}
                        color="#2D81FF"
                    />
                </div>

                <CollapsibleSection title={'Health'}>
                    <div className='home-health-content'>
                        <PieChart 
                            title="Steps"
                            current={1922}
                            max={3000}
                            color='#FF7C4C'
                            radius={80}
                        />
                        <PieChart 
                            title="Cardio"
                            current={51}
                            max={60}
                            color='#DB4CFF'
                            radius={80}
                            unit="min"
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title={'Calendar'}>
                    <div className='calendar-content'>
                        <div className='calendar-timeframe-selector'>
                            <div className='calendar-timeframe-selector-item selected'>Today</div>
                            <div className='calendar-timeframe-selector-item'>Week</div>
                            <div className='calendar-timeframe-selector-item'>Month</div>
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title={'Todo'}>
                    {todos && todos.length > 0 ? (
                        todos.map((todo, index) => {
                            const isCompleted = completedTodos[index] || false;

                            const handleToggle = () => {
                                setCompletedTodos(prev => ({
                                    ...prev,
                                    [index]: !isCompleted
                                }));
                            };

                            return (
                                <div id={todo.task_id} className='todo-item' key={todo.task_id}>
                                    <div 
                                        className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
                                        onClick={handleToggle}
                                    />
                                    <div className="todo-texts">
                                        <p className={`todo-title ${isCompleted ? 'completed' : ''}`}>
                                            {todo.title}
                                        </p>
                                        <p className={`todo-description ${isCompleted ? 'completed' : ''}`}>
                                            {todo.description}
                                        </p>
                                    </div>
                                    <div 
                                        className="delete-todo"
                                        onClick={() => deleteTodo(todo.task_id)}
                                    >
                                        ✕
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ opacity: 0.5, padding: 10 }}>Nothing to do today! :)</p>
                    )}
                </CollapsibleSection>
            </div>

            {isUserLoaded && (
                <WelcomeModal
                    wallet={wallet}
                    health={health}
                    isOpen={setupModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}