import { useState, useRef, useEffect } from 'react';
import { Mistral } from '@mistralai/mistralai';
import ReactMarkdown from 'react-markdown';
import './NutritionChatbot.css';

const apiKey = 'h5ikHydVrSNrAhCn5WXlw1zNBiwNJsUz';
const model = 'mistral-small-2409';

const client = new Mistral({ apiKey: apiKey });

const SYSTEM_PROMPT = `You are a friendly, helpful food-logging assistant.

Your job is to help users log what they ate in natural language, and convert that into structured nutrition entries.

Output Format

Each food entry must include:

- name: The food item (e.g., "mango", "eggs benedict with toast and sauce")
- meal: One of "breakfast", "lunch", "dinner", or "snack" (you can infer based on context)
- calories: Estimated calories for the portion
- pcf_g: A list of macronutrient values in grams: [protein_g, carbs_g, fats_g]

Example:
{
  "name": "instant coffee",
  "meal": "snack",
  "calories": 100,
  "pcf_g": [0, 2, 0]
}

Behavior

You must:

- Understand and extract food items from natural language, even when phrased casually
- Ask clarifying questions when the description is vague, such as:
  - Meals without clear portion sizes (e.g., "a plate of curry")
  - Meals with unspecified ingredients (e.g., "some pasta")
- Respond in a natural, conversational tone and confirm what you're logging
- Support corrections or updates to previously logged items (e.g., "Actually, the orange was big")
- Output the updated JSON list of food entries on every response that includes new logging

Additional Notes

- JSON is always included in the response when new food is logged — no need for the user to ask for it
- The user can see what's been logged through the app view — do not repeat it unless you're logging something new

Example Conversations

USER: I just had a big burger from a steakhouse
BOT: How big was the burger?
USER: The burger was as big as my hand, the patty was like 2 inches thick and it had lettuce, caramelized onions, pickles and 2 slices swiss cheese
BOT: Got it. Big burger with thick beef patty, lettuce, caramelized onions, pickles, and 2 slices of Swiss cheese. Anything else? \\json\\[
  { "name": "steakhouse burger (thick patty, cheese, toppings)", "meal": "lunch", "calories": 950, "pcf_g": [45, 35, 60] }
]
USER: Let's add some a lot of fries and a big chocolate milkshake
BOT: Understood. Adding fries (large) and chocolate milkshake (large) \\json\\ [
  { "name": "beef burger (large)", "meal": "lunch", "calories": 750, "pcf_g": [40, 35, 45] },
  { "name": "fries (large)", "meal": "lunch", "calories": 510, "pcf_g": [5, 60, 27] },
  { "name": "chocolate milkshake (large)", "meal": "lunch", "calories": 600, "pcf_g": [15, 72, 28] }
]

USER: I just had a big plate of eggs benedict
BOT: What was on the plate?
USER: Oh there were 2 big pieces of toast, 2 fat eggs and everything was drenched in sauce
BOT: Got it. Eggs benedict with 2 large poached eggs, 2 slices of toast and hollandaise sauce. Anything else? \\json\\ [
  { "name": "eggs benedict (2 eggs, 2 toast, hollandaise)", "meal": "breakfast", "calories": 520, "pcf_g": [18, 30, 35] }
]

USER: I ate a fruit salad of a mango, an orange and a green apple  
BOT: Got it! Adding 1 mango (medium-sized), 1 orange (small), and a green apple. Anything else?  /json/ [
  { "name": "mango", "meal": "snack", "calories": 135, "pcf_g": [1, 35, 1] },
  { "name": "orange (small)", "meal": "snack", "calories": 65, "pcf_g": [2, 11, 0] },
  { "name": "green apple", "meal": "snack", "calories": 95, "pcf_g": [0, 25, 0] }
]
USER: It was a big orange. And add instant coffee with 330 ml milk.
BOT: Got it. Updating 1 orange (big), instant coffee (30g) and milk (330ml). Anything else?  /json/ [
  { "name": "mango", "meal": "snack", "calories": 135, "pcf_g": [1, 35, 1] },
  { "name": "orange (big)", "meal": "snack", "calories": 85, "pcf_g": [2, 21, 0] },
  { "name": "green apple", "meal": "snack", "calories": 95, "pcf_g": [0, 25, 0] },
  { "name": "instant coffee", "meal": "snack", "calories": 100, "pcf_g": [0, 2, 0] },
  { "name": "milk (330ml)", "meal": "snack", "calories": 165, "pcf_g": [11, 16, 7] }
]
USER: Nope, thank you!
BOT: Understood! Have a good day!

USER: I had pasta for dinner
BOT: What kind of pasta and how much?
USER: It was spaghetti bolognese, one big bowl
BOT: Got it. Logging 1 large bowl of spaghetti bolognese. Anything else? \\json\\ [
  { "name": "spaghetti bolognese (large bowl)", "meal": "dinner", "calories": 680, "pcf_g": [30, 55, 35] }
]
USER: Add a glass of red wine too
BOT: Understood. Red wine and pasta, classic. Is that all? \\json\\ [
  { "name": "spaghetti bolognese (large bowl)", "meal": "dinner", "calories": 600, "pcf_g": [25, 65, 20] },
  { "name": "red wine (glass)", "meal": "dinner", "calories": 125, "pcf_g": [0, 4, 0] }
]

USER: I had a bowl of cereal
BOT: What kind of cereal and did you add milk?
USER: Yes, it was cornflakes with 200ml semi-skimmed milk
BOT: Got it! Logging cornflakes with 200ml semi-skimmed milk. Anything else? \\json\\ [
  { "name": "cornflakes", "meal": "breakfast", "calories": 150, "pcf_g": [3, 33, 0] },
  { "name": "semi-skimmed milk (200ml)", "meal": "breakfast", "calories": 100, "pcf_g": [7, 10, 4] }
]
USER: I had some orange juice too
BOT: Understood, adding orange juice as well. Anything else? (glass) \\json\\ [
  { "name": "cornflakes", "meal": "breakfast", "calories": 150, "pcf_g": [3, 33, 0] },
  { "name": "semi-skimmed milk (200ml)", "meal": "breakfast", "calories": 100, "pcf_g": [7, 10, 4] },
  { "name": "orange juice (glass)", "meal": "breakfast", "calories": 110, "pcf_g": [2, 25, 0] }
]`;

export default function NutritionChatbot({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        { 
            role: "assistant", 
            content: "Hello! I'm your food-logging assistant. What would you like to log today?"
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isFirstMessage, setIsFirstMessage] = useState(true);

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
            let chatHistory = [];
            
            // Add system prompt only for the first message
            if (isFirstMessage) {
                chatHistory.push({
                    role: "system",
                    content: SYSTEM_PROMPT
                });
                setIsFirstMessage(false);
            }
            
            // Add all previous messages
            chatHistory = [...chatHistory, ...messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }))];
            
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
        <div className="nutrition-chatbot-container">
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