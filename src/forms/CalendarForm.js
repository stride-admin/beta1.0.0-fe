import { useState } from 'react';
import './FormStyles.css';

export default function CalendarForm({ onClose }) {
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        event_date: '',
        recurrent: false,
        recurrent_date: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Here you would normally send the data to your backend or state management
        console.log('Submitting event:', eventData);
        
        // You can add validation here before submission
        
        // Clear form and close
        setEventData({
            title: '',
            description: '',
            event_date: '',
            recurrent: false,
            recurrent_date: ''
        });
        
        // Close the form modal
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