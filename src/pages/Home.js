import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAppContext } from '../AppContext';

import WelcomeModal from '../components/WelcomeModal'; // Import the WelcomeModal component
import ProgressBar from '../components/ProgressBar';

import { fire } from '../icons/icons';

import './Home.css';

const CollapsibleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
  
    const toggleOpen = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div className="collapsible-section">
        <div 
          className="section-header"
          onClick={toggleOpen}
        >
          <h3 className="section-title">{title}</h3>
          <div className={`section-arrow ${isOpen ? 'open' : ''}`}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        
        <div className={`section-content ${!isOpen ? 'closed' : ''}`}>
          {children}
        </div>
      </div>
    );
  };
  
  

export default function Home() {
    const streak = 12;
    const spent = 129.33;
    const { 
        userId, 
        user, setUser, 
        wallet, setWallet, 
        health, setHealth 
    } = useAppContext();
    
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

    const handleCloseModal = () => {
        setSetupModalOpen(false);
        fetchUserWallet();
        fetchUserHealth();
    };

    return (
        <div className="home">
            <div className='home-header'>
                <h1 id='welcome-header'>{user ? `Hello, ${user.name}` : ''}</h1>
                <img src={fire} alt='fire' id='fire' />
                <p id='streak-no'>{streak}</p>
            </div>
            <div className='home-content'>
                <div className='home-finances'>
                    <div className='home-finances-header'>

                        <div className='home-finances-row'>
                            <p className='home-finances-row-title'>{wallet ? wallet['balance'] : null}</p>
                            <p className='home-finances-row-title'>$</p>
                            <p className='home-finances-row-title'>{spent}</p>
                        </div>
                        <div className='home-finances-row'>
                            <p className='home-finances-row-subtitle'>Balance</p>
                            <p className='home-finances-row-subtitle'>Spent today</p>
                        </div>
                    </div>
                    <ProgressBar
                        id="home-finances-progress-bar"
                        title="Budget spent (W)"
                        current="2351.92"
                        max={3000}
                        color="#2D81FF"
                    />
                </div>
                <CollapsibleSection title={'Health'}></CollapsibleSection>
                <CollapsibleSection title={'Calendar'}></CollapsibleSection>
                <CollapsibleSection title={'Todo'}></CollapsibleSection>
            </div>
            
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