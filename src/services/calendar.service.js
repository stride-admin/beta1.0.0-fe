import { supabase } from '../utils/supabaseClient';

export const calendarService = {
  async fetchCalendar(userId) {
    try {
      const { data, error } = await supabase
        .from('calendar')
        .select("*")
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching todos:", err);
      return [];
    }
  },
  
  async deleteEvent(eventId) {
    try {
      const { data, error } = await supabase
        .from('calendar')
        .delete()
        .eq('event_id', eventId);
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error("Error deleting todo:", err);
      return { success: false, error: err.message };
    }
  },
  
  async addEvent(event) {
    try {
        const { data, error } = await supabase
        .from('calendar')
        .insert(event)
        .select();
        
        if (error) throw error;

        return { success: true, data };

    } catch (err) {
        console.error("Error adding event:", err);
        return { success: false, error: err.message };
    }
  },

  async updateTodo(eventId, updatedEvent) {
    try {
        const { data, error } = await supabase
            .from('calendar')
            .update(updatedEvent)
            .eq('event_id', eventId)
            .select();
      
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("Error updating event:", err);
        return { success: false, error: err.message };
    }
  }
}