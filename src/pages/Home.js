import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAppContext } from '../AppContext';
import WelcomeModal from '../components/WelcomeModal'; // Import the WelcomeModal component

import { fire } from '../icons/icons';

import './Home.css';

export default function Home() {
    const { 
        userId, 
        user, setUser, 
        wallet, setWallet, 
        health, setHealth } = useAppContext();
    
    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [isUserLoaded, setIsUserLoaded] = useState(false);

    const fetchUserData = async () => {
        try {
            const { data, error } = await supabase
                .from('user')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            setUser(data);
            return data;
        } catch (err) {
            console.error("Error fetching user data:", err);
            return null;
        }
    }

    const fetchUserWallet = async () => {
        try {
            const { data, error } = await supabase
                .from('user_wallet')
                .select("*")
                .eq('user_id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                console.log("Wallet data:", data);
                setWallet(data);
                return data;
            } else {
                console.log('User has no wallet');
                return null;
            }
        } catch (err) {
            console.error("Error fetching wallet:", err);
            return null;
        }
    }

    const fetchUserHealth = async () => {
        try {
            const { data, error } = await supabase
                .from('user_health')
                .select("*")
                .eq('user_id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                console.log("Health data:", data);
                setHealth(data);
                return data;
            } else {
                console.log('User has no health info');
                return null;
            }
        } catch (err) {
            console.error("Error fetching health:", err);
            return null;
        }
    }

    // Check if user setup is complete and show modal if needed
    const checkUserSetup = (walletData, healthData) => {
        if (!walletData || !healthData) {
            console.log("User isn't fully set up");
            setSetupModalOpen(true);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            if (userId) {
                const userData = await fetchUserData();
                
                if (userData) {
                    const walletData = await fetchUserWallet();
                    const healthData = await fetchUserHealth();
                    
                    // Check if setup is needed after all data is fetched
                    checkUserSetup(walletData, healthData);
                }
                
                setIsUserLoaded(true);
            }
        };
        
        loadUserData();
    }, [userId]);

    // Close modal handler
    const handleCloseModal = () => {
        setSetupModalOpen(false);
        // You might want to refetch data here if the user has updated their info
        fetchUserWallet();
        fetchUserHealth();
    };

    return (
        <div className="home">
            <h1 id='welcome-header'>{user ? `Hello, ${user.name}` : ''}</h1>
            <img src={fire} alt='fire' id='fire' />
            
            {/* WelcomeModal will only render when needed */}
            {isUserLoaded && (
                <WelcomeModal
                    wallet={wallet}
                    health={health}
                    isOpen={setupModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}