import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import Modal from '../../components/Modal';
import NutritionChatbot from '../../components/NutritionChatbot';

import './Nutrition.css'

export default function Nutrition() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    const handleOpenChatbot = () => {
        setIsChatbotOpen(true);
    };

    const handleCloseChatbot = () => {
        setIsChatbotOpen(false);
    };

    return (
        <div className='nutrition'>
            <button className='nutrition-assistant-button' onClick={handleOpenChatbot}>Talk to assistant</button>
            
            <Modal
                isOpen={isChatbotOpen}
                onClose={handleCloseChatbot}
                className="nutrition-chatbot-modal"
                transitionDuration={300}
            >
                <NutritionChatbot isOpen={isChatbotOpen} onClose={handleCloseChatbot} />
            </Modal>
        </div>
    );
}