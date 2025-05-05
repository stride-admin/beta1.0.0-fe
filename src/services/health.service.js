import { supabase } from "../utils/supabaseClient";

export const healthService = {
    async fetchHealth(userId) {
        try {
            const { data, error } = await supabase
                .from("user_health")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error) throw error;
            return data || {};

        } catch (err) {
            console.error("Error fetching health:", err);
            return {};
        }
    },
    async fetchExercises(userId) {
        try {
            const { data, error } = await supabase
                .from("exercises")
                .select("*")
                .eq("user_id", userId);

            if (error) throw error;
            return data || [];

        } catch (err) {
            console.error("Error fetching exercises:", err);
            return [];
        }
    },
    async addExercise(exercise) {
        try {
            const { data, error } = await supabase
                .from("exercises")
                .insert(exercise)
                .select();

            if (error) throw error;
            return data || [];

        } catch (err) {
            console.error("Error adding exercise:", err);
            return [];
        }
    },
    async deleteExercise(exerciseId) {
        try {
            const { data, error } = await supabase
                .from("exercises")
                .delete()
                .eq("id", exerciseId)
                .select();

            if (error) throw error;
            return data || [];

        } catch (err) {
            console.error("Error deleting exercise:", err);
            return [];
        }
    },
}