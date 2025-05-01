import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Mistral } from '@mistralai/mistralai';

import './Chatbot.css';

const apiKey = 'h5ikHydVrSNrAhCn5WXlw1zNBiwNJsUz';
const agentId = 'ag:c3566615:20250501:stride:ac10bea8';

const client = new Mistral({ apiKey: apiKey });

export default function Chatbot() {
    const { user } = useAppContext();
    const [messages, setMessages] = useState([
        { role: "assistant", content: `Hello ${user.name}! How can I help you today?` },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

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
            const chatHistory = [...messages, userMessage].map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            console.log(apiKey)

            const response = await client.agents.complete({
                agentId: agentId,
                messages: chatHistory,
            });

            const botReply = response.choices?.[0]?.message?.content || "No response from model.";

            const botMessage = {
                role: "assistant",
                content: botReply,
            };

            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error calling Mistral API:', error);
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
