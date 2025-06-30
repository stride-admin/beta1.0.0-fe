import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { useHealth } from '../../hooks/useHealth';
import PieChart from '../../components/PieChart';
import Modal from '../../components/Modal';
import CollapsibleSection from '../../components/CollapsibleSection';
import GymProgressTracker from '../../components/GymProgressTracker';

import './Gym.css';

export default function Gym() {
    const { userId } = useAppContext();
    const { health, exercises, fetchExercises, deleteExercise } = useHealth();
    const pieWidth = window.innerWidth * 0.2;
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    const swipeRefs = useRef({});
    const [isAllWorkoutsOpen, setIsAllWorkoutsOpen] = useState(false);

    // Group exercises by date
    const groupExercisesByDate = (exercises) => {
        if (!exercises || exercises.length === 0) return [];
        
        const groupedExercises = {};
        
        exercises.forEach(exercise => {
            // Extract date part from logged_at
            const date = exercise.logged_at.split('T')[0];
            
            if (!groupedExercises[date]) {
                groupedExercises[date] = [];
            }
            
            groupedExercises[date].push(exercise);
        });
        
        // Convert to array and sort dates in descending order
        return Object.keys(groupedExercises)
            .sort()
            .reverse()
            .map(date => ({
                date,
                formattedDate: new Date(date).toLocaleDateString('en-US', {
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                }),
                exercises: groupedExercises[date].sort((a, b) => 
                    new Date(b.logged_at) - new Date(a.logged_at)
                )
            }));
    };

    const groupedExercises = groupExercisesByDate(exercises);

    const handleOpenAllWorkoutsModal = () => {
        setIsAllWorkoutsOpen(true);
    };

    const handleCloseAllWorkoutsModal = () => {
        setIsAllWorkoutsOpen(false);
    };

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
        }).sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at)); // Sort from most recent to oldest
    };
    const todayExercises = getTodayExercises();

    // Calculate total cardio minutes for today
    const getTodayCardioMinutes = () => {
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
                <div className='gym-charts'>
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
                    <p className='gym-table-header-subtitle' onClick={handleOpenAllWorkoutsModal}>See all</p>
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

            {/* Add the GymProgressTracker component */}
            <GymProgressTracker exercises={exercises} />

            {isAllWorkoutsOpen && (
                <Modal
                    isOpen={isAllWorkoutsOpen}
                    onClose={handleCloseAllWorkoutsModal}
                    className="workouts-modal"
                    transitionDuration={400}
                >
                    <div className='workouts-modal-content'>
                        <div className='workouts-modal-header'>
                            <p className='workouts-modal-title'>All Workouts</p>
                            <p className='workouts-modal-close' onClick={handleCloseAllWorkoutsModal}>X</p>
                        </div>
                        <div className='workouts-modal-body'>
                            {groupedExercises.length > 0 ? (
                                groupedExercises.map(group => (
                                    <CollapsibleSection key={group.date} title={group.formattedDate}>
                                        {group.exercises.map((exercise, index) => (
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
                                                        <p className='gym-table-exercise-time'>
                                                            {new Date(exercise.logged_at).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={`delete-exercise-btn ${activeSwipeId === exercise.id ? 'visible' : ''}`}
                                                    onClick={() => handleDeleteExercise(exercise.id)}
                                                >
                                                    <span className="delete-btn-text">Delete</span>
                                                </div>
                                            </div>
                                        ))}
                                    </CollapsibleSection>
                                ))
                            ) : (
                                <p style={{ opacity: 0.5, padding: 10 }}>No workouts available</p>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}