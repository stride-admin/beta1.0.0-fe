import { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Placeholder function for sending message - you'll replace this with your HF logic later
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (input.trim() === "") return;

        // Add user message
        const newUserMessage = {
            id: messages.length + 1,
            text: input,
            sender: "user"
        };
        
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInput("");
        
        // Simulate bot response (remove this when you add your actual logic)
        if (messages.length < 5) {
            setTimeout(() => {
                const botResponse = {
                    id: messages.length + 2,
                    text: "Ok so I haven't added the chatbot logic yet because I'm too busy but I'll get to it soon!",
                    sender: "bot"
                };
                setMessages(prevMessages => [...prevMessages, botResponse]);
            }, 1000);
        } else {
            setTimeout(() => {
                const botResponse = {
                    id: messages.length + 2,
                    text: "Omfg bro get the hint, just shut the fuck up and go back to playing with the rest of the app... ",
                    sender: "bot"
                };
                setMessages(prevMessages => [...prevMessages, botResponse]);
            }, 1000);
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chat-window">
                <div className="messages-container">
                    {messages.map(message => (
                        <div 
                            key={message.id} 
                            className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
                        >
                            {message.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                <form className="message-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="message-input"
                    />
                    <button type="submit" className="send-button">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}