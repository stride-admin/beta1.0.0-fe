import { useState, useEffect } from "react";
import { calendarService } from "../services/calendar.service";
import { useAppContext } from "../AppContext";

export function useCalendar() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const { userId, calendar, setCalendar } = useAppContext(); // <-- use context calendar
    
    const fetchCalendar = async () => {
        if (!userId) return;
    
        setLoading(true);
        try {
            const calendarData = await calendarService.fetchCalendar(userId);
            setCalendar(calendarData); // update context
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const deleteEvent = async (eventId) => {
        const result = await calendarService.deleteEvent(eventId);
        if (result.success) {
        await fetchCalendar(); // or manually remove from context calendar
        }
        return result;
    };

    const addEvent = async (eventData) => {
        const { data, error } = await calendarService.addEvent(eventData); // NOTE: fix here too (see below)
        if (error) {
            console.error("Error adding event:", error);
            return { success: false };
        }
        if (data && data.length > 0) {
            setCalendar((prevCalendar) => [...(prevCalendar || []), ...data]); // correctly add to context
        }
        return { success: true };
    };

    const updateEvent = async (eventId, updatedEvent) => {
        const result = await calendarService.updateEvent(eventId, updatedEvent);
        if (result.success) {
            await fetchCalendar();
        }
        return result;
    };

    useEffect(() => {
        fetchCalendar();
    }, [userId]);

    return {
        calendar,
        loading,
        error,
        fetchCalendar,
        deleteEvent,
        addEvent,
        updateEvent
    };
}