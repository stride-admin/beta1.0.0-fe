import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import './Home.css';

import WelcomeModal from '../components/WelcomeModal';
import ProgressBar from '../components/ProgressBar';
import PieChart from '../components/PieChart';
import CollapsibleSection from '../components/CollapsibleSection';

import { useTodos } from '../hooks/useTodos';
import { useCalendar } from '../hooks/useCalendar';
import { useWallet } from '../hooks/useWallet';
import { useHealth } from '../hooks/useHealth';

import { currencyMap } from '../utils/currencyMap';

import { supabase } from '../utils/supabaseClient';

export default function Home() {
    const pieWidth = window.innerWidth * 0.2;

    const [completedTodos, setCompletedTodos] = useState({});
    const streak = 12;

    const { 
        userId, 
        user, setUser, 
    } = useAppContext();

    const { todos, deleteTodo } = useTodos();
    const { calendar, deleteEvent } = useCalendar();

    const { wallet, fetchWallet, getBalance, getSpentToday } = useWallet();
    const balance = getBalance() || 0;
    const spentToday = getSpentToday() || 0;
    const budgetMax = wallet?.daily_budget || 0;
    const [ currency, setCurrency ] = useState(wallet?.currency || '$');

    const { health, fetchHealth } = useHealth();

    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [isUserLoaded, setIsUserLoaded] = useState(false);
    
    const [activeSwipeId, setActiveSwipeId] = useState(null);

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

    const checkUserSetup = async () => {
        const walletData = await fetchWallet();
        const healthData = await fetchHealth();
        
        // Only show setup modal if either wallet or health data is missing
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
                    await checkUserSetup();
                }
    
                setIsUserLoaded(true);
                setCurrency(currencyMap[userData.currency] || userData.currency);
            }
        };
    
        loadUserData();
    }, [userId]);

    // Close any open swipe when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeSwipeId && !event.target.closest(`.calendar-item-swipeable[data-id="${activeSwipeId}"]`)) {
                setActiveSwipeId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeSwipeId]);

    const handleCloseModal = () => {
        setSetupModalOpen(false);
        // Refresh data after setup is complete
        fetchWallet();
        fetchHealth();
    };

    // Handle swipe gesture
    const handleTouchStart = (eventId) => {
        return (e) => {
            const touch = e.touches[0];
            const swipeItem = e.currentTarget;
            
            // Set current position
            swipeItem.dataset.startX = touch.clientX;
            swipeItem.dataset.currentX = touch.clientX;
        };
    };

    const handleTouchMove = (eventId) => {
        return (e) => {
            const touch = e.touches[0];
            const swipeItem = e.currentTarget;
            
            const startX = parseInt(swipeItem.dataset.startX);
            const currentX = touch.clientX;
            swipeItem.dataset.currentX = currentX;
            
            let diff = currentX - startX;
            
            // Only allow left swipe (negative diff)
            if (diff > 0) diff = 0;
            
            // Limit the swipe distance
            if (diff < -100) diff = -100;
            
            // Apply the transform
            swipeItem.style.transform = `translateX(${diff}px)`;
            
            // Show delete button when swiped enough
            if (diff < -50) {
                setActiveSwipeId(eventId);
            }
        };
    };

    const handleTouchEnd = (eventId) => {
        return (e) => {
            const swipeItem = e.currentTarget;
            const startX = parseInt(swipeItem.dataset.startX);
            const endX = parseInt(swipeItem.dataset.currentX);
            const diff = endX - startX;
            
            // If swiped far enough, keep it open
            if (diff < -50) {
                swipeItem.style.transform = 'translateX(-100px)';
                setActiveSwipeId(eventId);
            } else {
                // Not swiped far enough, snap back
                swipeItem.style.transform = 'translateX(0)';
                setActiveSwipeId(null);
            }
        };
    };

    // Reset swipe state
    const resetSwipe = (eventId) => {
        const swipeItem = document.querySelector(`.calendar-item-swipeable[data-id="${eventId}"]`);
        if (swipeItem) {
            swipeItem.style.transform = 'translateX(0)';
            setActiveSwipeId(null);
        }
    };

    return (
        <div className="home">
            <div className='home-header'>
                <h1 id='welcome-header'>{user ? `Hello, ${user.name}` : ''}</h1>
            </div>

            <div className='home-content'>
                <div className='home-finances'>
                    <div className='home-finances-header'>
                        <div className='home-finances-row'>
                            <p className='home-finances-row-title'>{parseFloat(balance).toFixed(2)}</p>
                            <p className='home-finances-row-title' style={{ opacity: 0.3, fontWeight: 100 }}>{currency}</p>
                            <p className='home-finances-row-title'>{parseFloat(spentToday).toFixed(2)}</p>
                        </div>
                        <div className='home-finances-row'>
                            <p className='home-finances-row-subtitle'>Balance</p>
                            <p className='home-finances-row-subtitle'>Spent today</p>
                        </div>
                    </div>
                    {wallet ? (
                        <ProgressBar
                            id="home-finances-progress-bar"
                            title="Budget remaining"
                            current={spentToday}
                            max={budgetMax}
                            color="#2D81FF"
                        />
                    ) : null}
                </div>

                <CollapsibleSection title={'Health'}>
                    <div className='home-health-content'>
                        <PieChart 
                            title="Steps"
                            current={1922}
                            max={3000}
                            color='#FF7C4C'
                            radius={pieWidth}
                        />
                        <PieChart 
                            title="Cardio"
                            current={51}
                            max={60}
                            color='#DB4CFF'
                            radius={pieWidth}
                            unit="min"
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title={'Calendar'}>
                    <div className='calendar-items'>
                        {calendar && calendar.length > 0 ? (
                            calendar.map((event) => (
                                <div 
                                    key={event.event_id}
                                    className="calendar-item-container"
                                >
                                    <div 
                                        className="calendar-item-swipeable"
                                        data-id={event.event_id}
                                        onTouchStart={handleTouchStart(event.event_id)}
                                        onTouchMove={handleTouchMove(event.event_id)}
                                        onTouchEnd={handleTouchEnd(event.event_id)}
                                    >
                                        <div className='calendar-item'>
                                            <div className="calendar-item-texts">
                                                <p className="calendar-item-title">{event.title}</p>
                                                <p className="calendar-item-description">{event.description}</p>
                                            </div>
                                            <div className='calendar-item-datetime'>
                                                <div className="calendar-item-time">
                                                    {event.event_date.split('T')[1].split(':').slice(0, 2).join(':')}
                                                </div>
                                                <div className="calendar-item-date">
                                                    {event.event_date.split('T')[0].split('-').reverse().join('/')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        className={`delete-btn ${activeSwipeId === event.event_id ? 'visible' : ''}`}
                                        onClick={() => {
                                            deleteEvent(event.event_id);
                                            resetSwipe(event.event_id);
                                        }}
                                    >
                                        <span className="delete-btn-text">Delete</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ opacity: 0.5, padding: 10 }}>No events today! :)</p>
                        )}
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