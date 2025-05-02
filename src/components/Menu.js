import { useState, useEffect } from 'react';
import Modal from './Modal';
import './Menu.css';
import { useAppContext } from '../AppContext';

import { 
    chatbot, home, wallet, gym, add_icon,
    dollar, food, event, muscle, todo
} from '../icons/icons';

import TodoForm from '../forms/TodoForm';
import CalendarForm from '../forms/CalendarForm';
import ExpenseForm from '../forms/ExpenseForm';

export default function Menu() {
    const { currentPage, setCurrentPage } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [visibleOptions, setVisibleOptions] = useState([]);
    const [isClosing, setIsClosing] = useState(false);
    // New state to track which form to display
    const [activeForm, setActiveForm] = useState(null);

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
        
        // Set the active form based on the selected option
        const formTypes = ['expense', 'food', 'workout', 'todo', 'event'];
        setActiveForm(formTypes[index]);
    };

    // Function to close the active form
    const closeActiveForm = () => {
        setActiveForm(null);
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
        { icon: dollar, label: 'Add Expense' },
        { icon: food, label: 'Add Food' },
        { icon: muscle, label: 'Add Workout' },
        { icon: todo, label: 'Add Todo' },
        { icon: event, label: 'Add Event' },
    ];

    // Render the appropriate form based on activeForm state
    const renderActiveForm = () => {
        switch(activeForm) {
            case 'todo':
                return <TodoForm onClose={closeActiveForm} />;
            case 'expense':
                // You'll create and import these forms later
                return <ExpenseForm onClose={closeActiveForm} />;
            case 'food':
                return <div>Food Form Placeholder</div>;
            case 'workout':
                return <div>Workout Form Placeholder</div>;
            case 'event':
                return <CalendarForm onClose={closeActiveForm} />;
            default:
                return null;
        }
    };

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
            
            {/* Add Options Modal */}
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
                            <img src={option.icon} alt="" />
                            <p>{option.label}</p>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Render the active form in its own modal */}
            {activeForm && (
                <Modal
                    isOpen={activeForm !== null}
                    onClose={closeActiveForm}
                    className="form-modal"
                    transitionDuration={300}
                >
                    {renderActiveForm()}
                </Modal>
            )}
        </>
    );
}