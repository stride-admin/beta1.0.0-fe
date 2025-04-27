import { useState, useRef, useEffect } from 'react';
import { InferenceClient } from '@huggingface/inference';
import { useAppContext } from '../AppContext';

import './Chatbot.css';

// Initialize Hugging Face Inference Client
const hf = new InferenceClient('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');

export default function Chatbot() {
    const { user } = useAppContext();
    const [messages, setMessages] = useState([
        { role: "bot", content: `Hello ${user.name}! How can I help you today?` },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return;

        const userMessage = { role: "user", content: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const chatHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            // Include the new user message in the context
            chatHistory.push({ role: "user", content: input });

            const out = await hf.chatCompletion({
                provider: "sambanova",
                model: "meta-llama/Llama-3.3-70B-Instruct",
                messages: chatHistory,
                max_tokens: 512,
                temperature: 0.3,
            });

            const botMessage = {
                role: "bot",
                content: out.choices?.[0]?.message?.content || "No response from model.",
            };

            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error calling Hugging Face API:', error);
            const errorMessage = {
                role: "bot",
                content: "Oops! Something went wrong contacting the model.",
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chat-window">
                <div className="messages-container">
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`message ${message.role === "user" ? "user-message" : "bot-message"}`}
                        >
                            {message.content}
                        </div>
                    ))}
                    {loading && (
                        <div className="message bot-message">
                            Thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="message-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="message-input"
                        disabled={loading}
                    />
                    <button type="submit" className="send-button" disabled={loading}>
                        {loading ? "Sending..." : "Send"}
                    </button>
                </form>
            </div>
        </div>
    );
}
