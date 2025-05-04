import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Mistral } from '@mistralai/mistralai';
import ReactMarkdown from 'react-markdown';

import './Chatbot.css';

const apiKey = 'h5ikHydVrSNrAhCn5WXlw1zNBiwNJsUz';
const model = 'mistral-large-2411'; // Using standard model instead of agent

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
            // Create chat history for the API
            const chatHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            
            // Add the user's latest message
            chatHistory.push({
                role: userMessage.role,
                content: userMessage.content,
            });

            // Create a placeholder message with streaming ID
            const streamingId = Date.now().toString();
            setMessages(prevMessages => [
                ...prevMessages,
                { role: "assistant", content: "", id: streamingId }
            ]);

            // Stream the response using the standard chat stream API
            const stream = await client.chat.stream({
                model: model,
                messages: chatHistory,
            });

            let fullContent = "";
            
            for await (const chunk of stream) {
                const content = chunk.data?.choices?.[0]?.delta?.content || "";
                if (content) {
                    fullContent += content;
                    
                    // Update the placeholder message with the accumulated content
                    setMessages(prevMessages => 
                        prevMessages.map(msg => 
                            msg.id === streamingId 
                                ? { ...msg, content: fullContent } 
                                : msg
                        )
                    );
                }
            }

            // Once streaming is complete, update the message without the temp ID
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.id === streamingId 
                        ? { role: "assistant", content: fullContent } 
                        : msg
                )
            );
        } catch (error) {
            console.error('Error calling Mistral API:', error);
            const errorMessage = {
                role: "assistant",
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
                            key={message.id || index} 
                            className={`message ${message.role === "user" ? "user-message" : "bot-message"}`}
                        >
                            {message.role === "assistant" ? (
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            ) : (
                                message.content
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="message bot-message" style={{
                            opacity: 0.5
                        }}>
                            {messages.some(msg => msg.id) ? "" : "Thinking..."}
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