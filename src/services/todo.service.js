import { supabase } from '../utils/supabaseClient';

export const todoService = {
  async fetchTodos(userId) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select("*")
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching todos:", err);
      return [];
    }
  },
  
  async deleteTodo(taskId) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .delete()
        .eq('task_id', taskId);
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error("Error deleting todo:", err);
      return { success: false, error: err.message };
    }
  },
  
  async addTodo(task) {
    try {
        const { data, error } = await supabase
        .from('todos')
        .insert(task)
        .select();
        
        if (error) throw error;

        return { success: true, data };

    } catch (err) {
        console.error("Error adding todo:", err);
        return { success: false, error: err.message };
    }
  },

  async updateTodo(taskId, updatedTask) {
    try {
        const { data, error } = await supabase
            .from('todos')
            .update(updatedTask)
            .eq('task_id', taskId)
            .select();
      
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("Error updating todo:", err);
        return { success: false, error: err.message };
    }
  }
}