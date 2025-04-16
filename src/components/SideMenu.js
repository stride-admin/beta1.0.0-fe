import { useEffect, useState } from 'react';
import './SideMenu.css';

export default function SideMenu({ isOpen, onClose, children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    
    useEffect(() => {
        // Handle escape key
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            // When opening, immediately render the DOM elements
            setShouldRender(true);
            document.addEventListener('keydown', handleEsc);
            // Small delay to ensure DOM is ready for animation
            setTimeout(() => setIsVisible(true), 10);
        } else {
            // When closing, first make invisible (triggers animation)
            setIsVisible(false);
            // Then remove from DOM after animation completes
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // If menu should not render, return null
    if (!shouldRender) return null;

    return (
        <div className={`side-menu-container ${isVisible ? 'visible' : 'hidden'}`}>
            <div className="side-menu-overlay" onClick={onClose}></div>
            <div className={`side-menu ${isVisible ? 'visible' : 'hidden'}`}>
                <button className="side-menu-close" onClick={onClose}>×</button>
                <div className="side-menu-content">
                    {children}
                </div>
            </div>
        </div>
    );
}