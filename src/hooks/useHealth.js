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

    useEffect(() => {
        fetchHealth();
    }, [userId]);

    return { loading, error, health, fetchHealth };
}