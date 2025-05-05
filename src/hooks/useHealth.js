import { useEffect, useState } from 'react';
import { healthService } from '../services/health.service';
import { useAppContext } from '../AppContext';

export function useHealth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { userId, health, setHealth } = useAppContext();

    const fetchHealth = async () => {
        if (!userId) return null;

        setLoading(true);
        try {
            const healthData = await healthService.fetchHealth(userId);
            setHealth(healthData);
            setError(null);
            return healthData;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchExercises = async () => {
        if (!userId) return [];

        setLoading(true);
        try {
            const exercisesData = await healthService.fetchExercises(userId);
            setHealth(exercisesData);
            setError(null);
            return exercisesData;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const addExercise = async (exercise) => {
        if (!userId) return null;

        setLoading(true);
        try {
            const newExercise = await healthService.addExercise(userId, exercise);
            setHealth((prevHealth) => [...prevHealth, newExercise]);
            setError(null);
            return newExercise;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteExercise = async (exerciseId) => {
        if (!userId) return null;

        setLoading(true);
        try {
            await healthService.deleteExercise(userId, exerciseId);
            setHealth((prevHealth) => prevHealth.filter(ex => ex.id !== exerciseId));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHealth();
        fetchExercises();
    }, [userId]);

    return { 
        loading, 
        error, 
        health, 
        fetchHealth,
        fetchExercises,
        addExercise,
        deleteExercise
    };
}