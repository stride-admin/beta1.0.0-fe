import React, { useState } from 'react';
import './Wallet.css';

import Finances from './wallet/Finances';
import Portfolio from './wallet/Portfolio';

export default function Wallet() {
    const [selectedPage, setSelectedPage] = useState('finances');

    return (
        <div className="wallet">
            <div className='page-selector'>
                <h2 
                    className={selectedPage === 'finances' ? 'selected' : ''}
                    onClick={() => setSelectedPage('finances')}
                >
                    Wallet
                </h2>
                <h2 
                    className={selectedPage === 'portfolio' ? 'selected' : ''}
                    onClick={() => setSelectedPage('portfolio')}
                >
                    Portfolio
                </h2>
            </div>
            {selectedPage === 'finances' && <Finances />}
            {selectedPage === 'portfolio' && <Portfolio />}
        </div>
    );
}
