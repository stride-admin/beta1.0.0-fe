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
        if (user) {
            const header = document.getElementById('welcome-header');
            if (header) {
                header.textContent = `Hello, ${user.name}`;
            }
        }
    }, [user]);

    return (
        <div className="home">
            <h1 id='welcome-header'></h1>
            <img src={fire} alt='fire' id='fire' />
        </div>
    );
}