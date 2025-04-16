import { useEffect, useState } from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, children, className = '', transitionDuration = 300 }) {
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
            const timer = setTimeout(() => setShouldRender(false), transitionDuration);
            return () => clearTimeout(timer);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose, transitionDuration]);

    // If modal should not render, return null
    if (!shouldRender) return null;

    return (
        <div 
            className={`modal-overlay ${isVisible ? 'visible' : 'hidden'}`} 
            onClick={onClose}
            style={{ '--transition-duration': `${transitionDuration}ms` }}
        >
            <div
                className={`modal-content ${className} ${isVisible ? 'visible' : 'hidden'}`}
                onClick={(e) => e.stopPropagation()} // prevent click bubbling
            >
                {children}
                {/* <button className="modal-close" onClick={onClose}>×</button> */}
            </div>
        </div>
    );
}