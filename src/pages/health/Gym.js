import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { useHealth } from '../../hooks/useHealth';
import PieChart from '../../components/PieChart';

import './Gym.css';

export default function Gym() {
    const { userId } = useAppContext();
    const { health, exercises, fetchExercises, deleteExercise } = useHealth();
    const pieWidth = window.innerWidth * 0.2;
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    const swipeRefs = useRef({});

    // Close any open swipe when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeSwipeId && !event.target.closest(`.exercise-swipeable[data-id="${activeSwipeId}"]`)) {
                const swipeElement = swipeRefs.current[activeSwipeId];
                if (swipeElement) {
                    swipeElement.style.transform = 'translateX(0px)';
                    swipeElement.style.transition = 'transform 0.3s ease';
                }
                setActiveSwipeId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeSwipeId]);

    // Handle swipe gesture
    const handleTouchStart = (exerciseId) => {
        return (e) => {
            const touch = e.touches[0];
            const swipeItem = e.currentTarget;
            
            // Close any other open swipes first
            if (activeSwipeId && activeSwipeId !== exerciseId) {
                const prevSwipeElement = swipeRefs.current[activeSwipeId];
                if (prevSwipeElement) {
                    prevSwipeElement.style.transform = 'translateX(0px)';
                    prevSwipeElement.style.transition = 'transform 0.3s ease';
                }
                setActiveSwipeId(null);
            }
            
            // Remove transition during swipe
            swipeItem.style.transition = 'none';
            
            // Set current position
            swipeItem.dataset.startX = touch.clientX;
            swipeItem.dataset.currentX = touch.clientX;
        };
    };

    const handleTouchMove = (exerciseId) => {
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
            
            // Apply transform directly to this element only
            swipeItem.style.transform = `translateX(${diff}px)`;
        };
    };

    const handleTouchEnd = (exerciseId) => {
        return (e) => {
            const swipeItem = e.currentTarget;
            const startX = parseInt(swipeItem.dataset.startX);
            const endX = parseInt(swipeItem.dataset.currentX);
            const diff = endX - startX;
            
            // Add transition back for snap animation
            swipeItem.style.transition = 'transform 0.3s ease';
            
            // If swiped far enough, keep it open
            if (diff < -50) {
                swipeItem.style.transform = 'translateX(-100px)';
                setActiveSwipeId(exerciseId);
            } else {
                // Not swiped far enough, snap back
                swipeItem.style.transform = 'translateX(0px)';
                setActiveSwipeId(null);
            }
        };
    };

    // Reset swipe state - similar to Finances.js
    const resetSwipe = (exerciseId) => {
        const swipeElement = swipeRefs.current[exerciseId];
        if (swipeElement) {
            swipeElement.style.transform = 'translateX(0px)';
            swipeElement.style.transition = 'transform 0.3s ease';
        }
        setActiveSwipeId(null);
    };

    const handleDeleteExercise = async (exerciseId) => {
        await deleteExercise(exerciseId);
        resetSwipe(exerciseId);
        await fetchExercises();
    };

    // Get today's exercises
    const getTodayExercises = () => {
        const today = new Date().toISOString().split('T')[0];
        return exercises.filter(exercise => {
            // Extract just the date part from the ISO string
            const exerciseDate = exercise.logged_at.split('T')[0];
            return exerciseDate === today;
        });
    };
    const todayExercises = getTodayExercises();

    // Calculate total cardio minutes for today
    const getTodayCardioMinutes = () => {
        const todayExercises = getTodayExercises();
        return todayExercises
            .filter(ex => ex.workout_type === 'cardio')
            .reduce((total, ex) => total + (ex.duration_min || 0), 0);
    };

    // Calculate total steps (placeholder - you might want to integrate with a step tracking API)
    const getTodaySteps = () => {
        return 1922; // Placeholder value
    };

    return (
        <div className='gym'>
            <div className='gym-header'>
                <div className='home-health-content'>
                    <PieChart 
                        title="Steps"
                        current={getTodaySteps()}
                        max={health?.steps_goal || 10000}
                        color='#FF7C4C'
                        radius={pieWidth}
                    />
                    <PieChart 
                        title="Cardio"
                        current={getTodayCardioMinutes()}
                        max={health?.cardio_goal || 60}
                        color='#DB4CFF'
                        radius={pieWidth}
                        unit="min"
                    />
                </div>
            </div>
            <div className='gym-workout-table'>
                <div className='gym-table-header'>
                    <p className='gym-table-header-title'>Today's Workout</p>
                </div>
                <div className='gym-table-exercises'>
                    {todayExercises.length > 0 ? (
                        todayExercises.map((exercise, index) => (
                            <div key={exercise.id} className="exercise-container">
                                <div 
                                    ref={el => swipeRefs.current[exercise.id] = el}
                                    className={`exercise-swipeable ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
                                    data-id={exercise.id}
                                    onTouchStart={handleTouchStart(exercise.id)}
                                    onTouchMove={handleTouchMove(exercise.id)}
                                    onTouchEnd={handleTouchEnd(exercise.id)}
                                    style={{ 
                                        transform: 'translateX(0px)',
                                        transition: 'transform 0.3s ease'
                                    }}
                                >
                                    <div className='gym-table-exercise-content'>
                                        <p className='gym-table-exercise-name'>{exercise.exercise}</p>
                                        {exercise.workout_type === 'weights' ? (
                                            <p className='gym-table-exercise-details'>
                                                {exercise.reps} reps × {exercise.weight} {exercise.weight_unit}
                                            </p>
                                        ) : (exercise.workout_type === 'cardio' ? (
                                            <p className='gym-table-exercise-details'>
                                                {exercise.duration_min} min
                                                {exercise.intensity ? ` × ${exercise.intensity} km` : ''}
                                            </p>
                                        ) : (
                                            <p className='gym-table-exercise-details'>
                                                {exercise.duration_min} min
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                <div 
                                    className={`delete-exercise-btn ${activeSwipeId === exercise.id ? 'visible' : ''}`}
                                    onClick={() => handleDeleteExercise(exercise.id)}
                                >
                                    <span className="delete-btn-text">Delete</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className='no-exercises'>No exercises logged today</p>
                    )}
                </div>
            </div>
        </div>
    );
}