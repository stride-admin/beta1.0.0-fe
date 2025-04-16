import { useState, useEffect } from 'react';
import Modal from './Modal'; // Modal component
import './Menu.css';
import { useAppContext } from '../AppContext';
import { chatbot, home, wallet, gym, add_icon } from '../icons/icons'; // Replace with your actual icon paths
// Example icons for the modal options
// import { option1, option2, option3, option4, option5 } from '../icons/addModalIcons'; // Create or update this file

export default function Menu() {
    const { currentPage, setCurrentPage } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [visibleOptions, setVisibleOptions] = useState([]);
    const [isClosing, setIsClosing] = useState(false);

    const handleMenuClick = (page) => () => {
        setCurrentPage(page);
        console.log(`Switching to ${page} page`);
    };

    const handleAddModal = () => {
        setModalOpen(true);
        setIsClosing(false);
        // Reset visible options when opening modal
        setVisibleOptions([]);
    };

    const handleCloseModal = () => {
        // Start exit animations
        setIsClosing(true);
        
        // Reset visible options in reverse order
        const totalOptions = addOptions.length;
        const exitInterval = 80; // Slightly faster than entrance
        
        let currentIndex = totalOptions - 1;
        const exitTimer = setInterval(() => {
            setVisibleOptions(prev => prev.filter(i => i !== currentIndex));
            currentIndex--;
            
            if (currentIndex < 0) {
                clearInterval(exitTimer);
                // After all options have disappeared, close the modal
                setTimeout(() => {
                    setModalOpen(false);
                    setIsClosing(false);
                }, 100);
            }
        }, exitInterval);
    };

    const handleAddOption = (index) => {
        console.log(`Clicked Add Option ${index + 1}`);
        handleCloseModal();
    };

    // Effect to animate in options one by one
    useEffect(() => {
        if (!isModalOpen || isClosing) return;
    
        const totalOptions = addOptions.length;
        const enterInterval = 100;
    
        let timeouts = [];
        for (let i = totalOptions - 1; i >= 0; i--) {
            const timeout = setTimeout(() => {
                setVisibleOptions(prev => [...prev, i]);
            }, enterInterval * (totalOptions - i));
            timeouts.push(timeout);
        }
    
        return () => timeouts.forEach(clearTimeout);
    }, [isModalOpen, isClosing]);

    const addOptions = [
        { icon: 'option1', label: 'Add Expense' },
        { icon: 'option2', label: 'Add Workout' },
        { icon: 'option3', label: 'Add Goal' },
        { icon: 'option4', label: 'Add Task' },
        { icon: 'option5', label: 'Add Note' },
    ];

    return (
        <>
            <div className="menu">
                <img 
                    src={home} 
                    alt="Home" 
                    className={`menu-icon ${currentPage === 'home' ? 'selected' : ''}`} 
                    onClick={handleMenuClick('home')} 
                />
                <img 
                    src={wallet} 
                    alt="Wallet" 
                    className={`menu-icon ${currentPage === 'wallet' ? 'selected' : ''}`} 
                    onClick={handleMenuClick('wallet')} 
                />
                <img 
                    src={add_icon} 
                    alt="Add" 
                    className="add-icon" 
                    onClick={handleAddModal} 
                />
                <img 
                    src={gym} 
                    alt="Gym" 
                    className={`menu-icon ${currentPage === 'gym' ? 'selected' : ''}`} 
                    onClick={handleMenuClick('gym')} 
                />
                <img 
                    src={chatbot} 
                    alt="Chatbot" 
                    className={`menu-icon ${currentPage === 'chatbot' ? 'selected' : ''}`} 
                    onClick={handleMenuClick('chatbot')} 
                />
            </div>
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                className="add-modal"
                transitionDuration={400}
            >
                <div className="add-modal-options">
                    {addOptions.map((option, i) => (
                        <div 
                            key={i} 
                            className={`add-modal-option ${visibleOptions.includes(i) ? 'visible' : 'hidden'}`}
                            onClick={() => handleAddOption(i)}
                        >
                            <img src={option.icon} alt={option.label} />
                            <p>{option.label}</p>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
}