import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAppContext } from '../AppContext';

import './FormStyles.css';

export default function TodoForm({ onClose }) {
    const { 
        userId, setTodos
    } = useAppContext();

    const [todoData, setTodoData] = useState({
        user_id: userId,
        title: '',
        description: '',
        recurrent: false,
        deadline: false,
        deadline_date: '',
        recurrent_date: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTodoData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Here you would normally send the data to your backend or state management
        console.log('Submitting todo:', todoData);

        try {
            const { error } = await supabase
                .from('todos')
                .insert(todoData);
        } catch (err) {
            console.error("Error inserting todo:", err);
        }

        // You can add validation here before submission
        
        // Clear form and close
        setTodoData({
            title: '',
            description: '',
            recurrent: false,
            deadline: false,
            deadline_date: '',
            recurrent_date: ''
        });
        
        // Close the form modal
        onClose();
    };

    return (
        <div className="form-container">
            <h2>Add New Todo</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={todoData.title}
                        onChange={handleChange}
                        required
                        placeholder="What needs to be done?"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={todoData.description}
                        onChange={handleChange}
                        placeholder="Add details about this task..."
                        rows="3"
                    />
                </div>
                
                <div className="form-group checkbox-group">
                    <label htmlFor="deadline">Set Deadline</label>
                    <input
                        type="checkbox"
                        id="deadline"
                        name="deadline"
                        checked={todoData.deadline}
                        onChange={handleChange}
                    />
                </div>
                
                {todoData.deadline && (
                    <div className="form-group indented">
                        <label htmlFor="deadline_date">Deadline Date</label>
                        <input
                            type="datetime-local"
                            id="deadline_date"
                            name="deadline_date"
                            value={todoData.deadline_date}
                            onChange={handleChange}
                            required={todoData.deadline}
                        />
                    </div>
                )}
                
                <div className="form-group checkbox-group">
                    <label htmlFor="recurrent">Recurring Task</label>
                    <input
                        type="checkbox"
                        id="recurrent"
                        name="recurrent"
                        checked={todoData.recurrent}
                        onChange={handleChange}
                    />
                </div>
                
                {todoData.recurrent && (
                    <div className="form-group indented">
                        <label htmlFor="recurrent_date">Recurrence Pattern</label>
                        <select
                            id="recurrent_date"
                            name="recurrent_date"
                            value={todoData.recurrent_date}
                            onChange={handleChange}
                            required={todoData.recurrent}
                        >
                            <option value="">Select recurrence</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
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
                        Add Todo
                    </button>
                </div>
            </form>
        </div>
    );
}