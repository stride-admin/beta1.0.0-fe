import { useState, useEffect } from 'react';
import { todoService } from '../services/todo.service';
import { useAppContext } from '../AppContext';

export function useTodos() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { userId, todos, setTodos } = useAppContext(); // <-- use context todos

    const fetchTodos = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const todosData = await todoService.fetchTodos(userId);
            setTodos(todosData); // update context
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteTodo = async (taskId) => {
        const result = await todoService.deleteTodo(taskId);
        if (result.success) {
            await fetchTodos(); // or manually remove from context todos
        }
        return result;
    };

    const addTodo = async (todoData) => {
        const { data, error } = await todoService.addTodo(todoData); // NOTE: fix here too (see below)
        if (error) {
            console.error('Error adding todo:', error);
            return { success: false };
        }
        if (data && data.length > 0) {
            setTodos(prevTodos => [...(prevTodos || []), ...data]); // correctly add to context
        }
        return { success: true };
    };

    const updateTodo = async (taskId, updatedTask) => {
        const result = await todoService.updateTodo(taskId, updatedTask);
        if (result.success) {
            await fetchTodos();
        }
        return result;
    };

    useEffect(() => {
        fetchTodos();
    }, [userId]);

    return {
        todos,
        loading,
        error,
        fetchTodos,
        deleteTodo,
        addTodo,
        updateTodo
    };
}
