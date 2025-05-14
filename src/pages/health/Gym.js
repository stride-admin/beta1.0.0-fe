import { useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { useHealth } from '../../hooks/useHealth';
import PieChart from '../../components/PieChart';

import './Gym.css';

export default function Gym() {
    const { userId } = useAppContext();
    const { health, exercises, fetchExercises, deleteExercise } = useHealth();
    const pieWidth = window.innerWidth * 0.2;

    console.log(exercises);

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

    const handleDeleteExercise = async (exerciseId) => {
        await deleteExercise(exerciseId);
        await fetchExercises();
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
                    <p className='gym-table-header-title'>Today's Workouts</p>
                </div>
                <div className='gym-table-exercises'>
                    {todayExercises.length > 0 ? (
                        todayExercises.map((exercise, index) => (
                            <div key={exercise.id} className={`gym-table-exercise ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
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
                                <button 
                                    className='delete-exercise-btn'
                                    onClick={() => handleDeleteExercise(exercise.id)}
                                >
                                    Delete
                                </button>
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