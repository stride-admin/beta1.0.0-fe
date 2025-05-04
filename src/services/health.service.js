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
}