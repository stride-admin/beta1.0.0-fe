import React, { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAppContext } from '../AppContext';

import { fire } from '../icons/icons';

import './Home.css';

export default function Home() {
    const { userId, user, setUser } = useAppContext();

    const fetchUserData = async () => {
        try {
            const { data, err } = await supabase
                .from('user')
                .select('*')
                .eq('user_id', userId)
                .single();

            setUser(data)
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    return (
        <div className="home">
            <h1 id='welcome-header'>Hello, <b>{user.name}</b></h1>
            <img src={fire} alt='fire' id='fire' />
        </div>
    );
}