import React, { useState } from 'react';
import './Health.css';

import Gym from './health/Gym';
import Nutrition from './health/Nutrition';

export default function Health() {
    const [selectedPage, setSelectedPage] = useState('gym');

    return (
        <div className="health">
            <div className='page-selector'>
                <h2 
                    className={selectedPage === 'gym' ? 'selected' : ''}
                    onClick={() => setSelectedPage('gym')}
                >
                    Gym
                </h2>
                <h2 
                    className={selectedPage === 'nutrition' ? 'selected' : ''}
                    onClick={() => setSelectedPage('nutrition')}
                >
                    Nutrition
                </h2>
            </div>
            {selectedPage === 'gym' && <Gym />}
            {selectedPage === 'nutrition' && <Nutrition />}
        </div>
    );
}
