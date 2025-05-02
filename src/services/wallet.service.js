import { supabase } from "../utils/supabaseClient";

export const walletService = {
    async fetchWallet(userId) {
        try {
            const { data, error } = await supabase
                .from("user_wallet")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error) throw error;
            return data || {};

        } catch (err) {
            console.error("Error fetching wallet:", err);
            return {};
        }
    },

    async fetchDebits(userId) {
        try {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", userId)
                .eq("type", true);

            if (error) throw error;
            return data || [];

        } catch (err) {
            console.error("Error fetching expenses:", err);
            return [];
        }
    },

    async fetchCredits(userId) {
        try {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", userId)
                .eq("type", false);

            if (error) throw error;
            return data || [];

        } catch (err) {
            console.error("Error fetching credits:", err);
            return [];
        }
    },
    async addTransaction(transaction) {
        try {
            const { data, error } = await supabase
                .from("transactions")
                .insert(transaction)
                .select();

            if (error) throw error;
            return { success: true, data };

        } catch (err) {
            console.error("Error adding transaction:", err);
            return { success: false, error: err.message };
        }
    },
    async deleteTransaction(transactionId) {
        try {
            const { data, error } = await supabase
                .from("transactions")
                .delete()
                .eq("transaction_id", transactionId);

            if (error) throw error;
            return { success: true, data };

        } catch (err) {
            console.error("Error deleting transaction:", err);
            return { success: false, error: err.message };
        }
    },
    async updateTransaction(transactionId, updatedTransaction) {
        try {
            const { data, error } = await supabase
                .from("transactions")
                .update(updatedTransaction)
                .eq("transaction_id", transactionId)
                .select();

            if (error) throw error;
            return { success: true, data };

        } catch (err) {
            console.error("Error updating transaction:", err);
            return { success: false, error: err.message };
        }
    },
}