import { useEffect, useState } from 'react';
import { useAppContext } from '../../AppContext';
import { useHealth } from '../../hooks/useHealth';
import PieChart from '../../components/PieChart';

import './Gym.css';

export default function Gym() {
    const { userId } = useAppContext();
    const { health, exercises, fetchExercises, deleteExercise } = useHealth();
    const pieWidth = window.innerWidth * 0.2;
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    const [swipeStates, setSwipeStates] = useState({});

    // Close any open swipe when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeSwipeId && !event.target.closest(`.exercise-swipeable[data-id="${activeSwipeId}"]`)) {
                setActiveSwipeId(null);
                setSwipeStates(prev => ({
                    ...prev,
                    [activeSwipeId]: 0
                }));
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
                setSwipeStates(prev => ({
                    ...prev,
                    [activeSwipeId]: 0
                }));
            }
            
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
            
            // Update the swipe state for this specific item only
            setSwipeStates(prev => ({
                ...prev,
                [exerciseId]: diff
            }));
            
            // Show delete button when swiped enough
            if (diff < -50) {
                setActiveSwipeId(exerciseId);
            } else if (activeSwipeId === exerciseId) {
                setActiveSwipeId(null);
            }
        };
    };

    const handleTouchEnd = (exerciseId) => {
        return (e) => {
            const swipeItem = e.currentTarget;
            const startX = parseInt(swipeItem.dataset.startX);
            const endX = parseInt(swipeItem.dataset.currentX);
            const diff = endX - startX;
            
            // If swiped far enough, keep it open
            if (diff < -50) {
                setSwipeStates(prev => ({
                    ...prev,
                    [exerciseId]: -100
                }));
                setActiveSwipeId(exerciseId);
            } else {
                // Not swiped far enough, snap back
                setSwipeStates(prev => ({
                    ...prev,
                    [exerciseId]: 0
                }));
                if (activeSwipeId === exerciseId) {
                    setActiveSwipeId(null);
                }
            }
        };
    };

    // Reset swipe state
    const resetSwipe = (exerciseId) => {
        setSwipeStates(prev => ({
            ...prev,
            [exerciseId]: 0
        }));
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
                                    className={`exercise-swipeable ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
                                    data-id={exercise.id}
                                    onTouchStart={handleTouchStart(exercise.id)}
                                    onTouchMove={handleTouchMove(exercise.id)}
                                    onTouchEnd={handleTouchEnd(exercise.id)}
                                    style={{ 
                                        transform: `translateX(${swipeStates[exercise.id] || 0}px)`,
                                        transition: swipeStates[exercise.id] === undefined ? 'transform 0.3s ease' : 'none'
                                    }}
                                >
                                    <div className='gym-table-exercise-content'>
                                        <p className='gym-table-exercise-name'>{exercise.exercise}</p>
                                        <p className='gym-table-exercise-type'>{exercise.workout_type}</p>
                                        {exercise.workout_type === 'weights' ? (
                                            <p className='gym-table-exercise-details'>
                                                {exercise.reps} reps × {exercise.weight} {exercise.weight_unit}
                                            </p>
                                        ) : (
                                            <p className='gym-table-exercise-details'>
                                                {exercise.duration_min} min
                                                {exercise.intensity ? ` × ${exercise.intensity} km` : ''}
                                            </p>
                                        )}
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