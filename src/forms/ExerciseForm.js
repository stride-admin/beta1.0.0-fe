import { useState } from 'react';
import { useAppContext } from '../AppContext';
import { useHealth } from '../hooks/useHealth';

import './FormStyles.css';

export default function ExerciseForm({ onClose }) {
    const { userId } = useAppContext();
    const { addExercise } = useHealth();

    const [exerciseData, setExerciseData] = useState({
        workout_type: 'weights', // Default to weights
        exercise: '',
        reps: '',
        weight: '',
        weight_unit: 'kg',
        duration_min: '',
        intensity: '',  // Will be used for distance in cardio
        logged_at: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExerciseData(prev => ({
            ...prev,
            [name]: name === 'reps' || name === 'weight' || name === 'duration_min' || name === 'intensity' 
                ? value === '' ? '' : parseFloat(value) 
                : value
        }));

        // Special handling for bodyweight selection
        if (name === 'weight_unit' && value === 'bodyweight') {
            setExerciseData(prev => ({
                ...prev,
                weight_unit: value,
                weight: 0
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create payload with only the relevant fields based on workout_type
        const payload = {
            ...exerciseData,
            user_id: userId
        };

        try {
            const result = await addExercise(payload);
            if (result) {
                console.log('Exercise added successfully');
            } else {
                console.error('Failed to add exercise');
            }
        } catch (err) {
            console.error("Error adding exercise:", err);
        }

        // Reset form and close
        setExerciseData({
            workout_type: 'weights',
            exercise: '',
            reps: '',
            weight: '',
            weight_unit: 'kg',
            duration_min: '',
            intensity: '',
            logged_at: new Date().toISOString().split('T')[0]
        });

        onClose();
    };

    // Determine which fields to show based on workout_type
    const isWeights = exerciseData.workout_type === 'weights';
    const isCardio = exerciseData.workout_type === 'cardio';
    const isMobility = exerciseData.workout_type === 'mobility';

    return (
        <div className="form-container">
            <h2>Log Exercise</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="workout_type">Workout Type</label>
                    <select
                        id="workout_type"
                        name="workout_type"
                        value={exerciseData.workout_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="weights">Weights</option>
                        <option value="cardio">Cardio</option>
                        <option value="mobility">Mobility</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="exercise">Exercise</label>
                    <input
                        type="text"
                        id="exercise"
                        name="exercise"
                        value={exerciseData.exercise}
                        onChange={handleChange}
                        placeholder={
                            isWeights ? "E.g. Bench Press, Squats" : 
                            isCardio ? "E.g. Running, Cycling" : 
                            "E.g. Shoulder Stretch, Hip Mobility"
                        }
                        required
                    />
                </div>

                {isWeights && (
                    <>
                        <div className="form-group">
                            <label htmlFor="reps">Repetitions</label>
                            <input
                                type="number"
                                id="reps"
                                name="reps"
                                value={exerciseData.reps}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="weight_unit">Weight Unit</label>
                            <select
                                id="weight_unit"
                                name="weight_unit"
                                value={exerciseData.weight_unit}
                                onChange={handleChange}
                                required
                            >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                                <option value="bodyweight">Bodyweight</option>
                            </select>
                        </div>

                        {exerciseData.weight_unit !== 'bodyweight' && (
                            <div className="form-group">
                                <label htmlFor="weight">Weight</label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={exerciseData.weight}
                                    onChange={handleChange}
                                    step="0.5"
                                    min="0"
                                    required
                                />
                            </div>
                        )}
                    </>
                )}

                {(isCardio || isMobility) && (
                    <div className="form-group">
                        <label htmlFor="duration_min">Duration (minutes)</label>
                        <input
                            type="number"
                            id="duration_min"
                            name="duration_min"
                            value={exerciseData.duration_min}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>
                )}

                {isCardio && (
                    <div className="form-group">
                        <label htmlFor="intensity">Distance (km/mi)</label>
                        <input
                            type="number"
                            id="intensity"
                            name="intensity"
                            value={exerciseData.intensity}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="logged_at">Date</label>
                    <input
                        type="date"
                        id="logged_at"
                        name="logged_at"
                        value={exerciseData.logged_at}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        Log Exercise
                    </button>
                </div>
            </form>
        </div>
    );
}