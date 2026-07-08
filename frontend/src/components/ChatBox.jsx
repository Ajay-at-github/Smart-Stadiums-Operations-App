import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { Send, Bot, User, Sparkles } from "lucide-react";

export default function ChatBox() {
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hello! 🏟 Welcome to the stadium assistant. I can help you find gates, parking spots, food court options, accessibility routes, or emergency support. What can I do for you today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
        setLoading(true);

        try {
            const response = await api.post("/chat", { message: userMsg });
            const botReply = response.data.response;
            setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
        } catch (error) {
            console.error("Error communicating with chat API:", error);
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Sorry, I am having trouble connecting to the backend. Please make sure the backend service is running.",
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
    };

    const suggestions = [
        "Where is Gate A?",
        "Where can I charge my phone?",
        "Where is the nearest wheelchair accessible entrance?",
    ];

    return (
        <section aria-label="Stadium Chat Assistant" className="flex-1 flex flex-col h-[calc(100vh-210px)] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header info */}
            <div className="bg-slate-900 border-b border-slate-850 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Bot size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-slate-200">Stadium AI Concierge</div>
                        <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true"></span>
                            Online & ready
                        </div>
                    </div>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-400" aria-hidden="true" />
                    Gemini + RAG powered
                </div>
            </div>

            {/* Message Area */}
            <div 
                role="log" 
                aria-live="polite" 
                aria-label="Chat Message History"
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-955 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 max-w-[85%] ${
                            msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                        }`}
                    >
                        {/* Avatar */}
                        <div
                            aria-hidden="true"
                            className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border ${
                                msg.sender === "user"
                                    ? "bg-blue-600 border-blue-500 text-white"
                                    : msg.isError
                                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                                    : "bg-slate-800 border-slate-700 text-slate-300"
                            }`}
                        >
                            {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                                msg.sender === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : msg.isError
                                    ? "bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none"
                                    : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
                            }`}
                        >
                            <span className="sr-only">
                                {msg.sender === "user" ? "You said: " : "Concierge said: "}
                            </span>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex gap-3 max-w-[85%]" aria-live="assertive" aria-label="Concierge is typing...">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs" aria-hidden="true">
                            <Bot size={14} />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} aria-hidden="true"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} aria-hidden="true"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} aria-hidden="true"></span>
                            <span className="sr-only">Typing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions list */}
            {messages.length === 1 && !loading && (
                <div className="px-6 py-3 border-t border-slate-850 bg-slate-900 shrink-0">
                    <div className="text-xs text-slate-500 mb-2 font-medium">Quick Suggestions:</div>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Chat query suggestions">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                aria-label={`Use suggestion: ${suggestion}`}
                                className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-full transition text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Row */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-855 flex gap-3 shrink-0">
                <label htmlFor="chat-message-input" className="sr-only">Message text input</label>
                <input
                    id="chat-message-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about stadium, rules, gates, facilities..."
                    className="flex-1 bg-slate-950 text-slate-200 border border-slate-800 focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-white px-5 py-3 rounded-xl transition flex items-center justify-center font-medium gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <Send size={16} aria-hidden="true" />
                    <span>Send</span>
                </button>
            </form>
        </section>
    );
}

