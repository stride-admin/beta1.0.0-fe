import { useState } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { useAppContext } from '../AppContext';

import './FormStyles.css';

export default function CalendarForm({ onClose }) {
    const { userId } = useAppContext();
    const { addEvent } = useCalendar();

    const defaultEventDate = new Date().toISOString().slice(0, 16);
    const [eventData, setEventData] = useState({
        user_id: userId,
        title: '',
        description: '',
        event_date: defaultEventDate, // Default to now
        recurrent: false,
        recurrent_date: null
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting event:', eventData);

        try {
            const result = await addEvent(eventData);
            if (result.success) {
                console.log('Event added successfully');
            } else {
                console.error('Failed to add event');
            }
        } catch (err) {
            console.error("Error inserting event:", err);
        }

        // Reset form
        setEventData({
            user_id: userId,
            title: '',
            description: '',
            event_date: defaultEventDate,
            recurrent: false,
            recurrent_date: null
        });

        onClose();
    };

    return (
        <div className="form-container">
            <h2>Add Calendar Event</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={eventData.title}
                        onChange={handleChange}
                        required
                        placeholder="Event title"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={eventData.description}
                        onChange={handleChange}
                        placeholder="Event details..."
                        rows="3"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="event_date">Event Date & Time</label>
                    <input
                        type="datetime-local"
                        id="event_date"
                        name="event_date"
                        value={eventData.event_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="form-group checkbox-group">
                    <label htmlFor="recurrent">Recurring Event</label>
                    <input
                        type="checkbox"
                        id="recurrent"
                        name="recurrent"
                        checked={eventData.recurrent}
                        onChange={handleChange}
                    />
                </div>
                
                {eventData.recurrent && (
                    <div className="form-group indented">
                        <label htmlFor="recurrent_date">Recurrence Pattern</label>
                        <select
                            id="recurrent_date"
                            name="recurrent_date"
                            value={eventData.recurrent_date}
                            onChange={handleChange}
                            required={eventData.recurrent}
                        >
                            <option value="">Select recurrence</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="bi-weekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                )}
                
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        Add Event
                    </button>
                </div>
            </form>
        </div>
    );
}