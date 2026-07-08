import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { MessageSquare, Car, Accessibility, FlameKindling, HelpCircle } from "lucide-react";

const quickActions = [
    {
        title: "Chat Assistant",
        icon: MessageSquare,
        desc: "Ask anything about the stadium",
        route: "/chat",
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
        title: "Parking & Gates",
        icon: Car,
        desc: "Find parking zones & gate entrances",
        route: "/chat",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
        title: "Accessibility",
        icon: Accessibility,
        desc: "Accessible entrances & seating information",
        route: "/chat",
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
        title: "Emergency",
        icon: FlameKindling,
        desc: "Evacuation routes & medical assistance",
        route: "/chat",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
    },
];

const suggestions = [
    "Where is the nearest wheelchair accessible entrance?",
    "Where is Gate A?",
    "Where can I charge my phone?",
    "List stadium emergency procedures",
    "Is parking zone A open?",
];

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />

            <div className="flex flex-1">
                <Sidebar />

                <main id="main-content" className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
                    {/* Welcome Hero */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="space-y-3 max-w-2xl relative z-10">
                            <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                Stadium AI Concierge
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                                Welcome to PromptWars Stadium!
                            </h1>
                            <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                                Ask about gates, parking lots, food menus, rules, seating sections, accessibility services, and emergency help. Our AI is grounded in official stadium records.
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Cards */}
                    <section aria-labelledby="quick-actions-heading" className="space-y-4">
                        <h2 id="quick-actions-heading" className="text-xl font-bold text-white tracking-tight">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {quickActions.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <Link
                                        key={card.title}
                                        to={card.route}
                                        aria-label={`${card.title}: ${card.desc}`}
                                        className="group bg-slate-900 hover:bg-slate-900/80 border border-slate-850 hover:border-slate-700/80 p-6 rounded-2xl transition-all duration-300 shadow-xl flex flex-col justify-between h-48 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`} aria-hidden="true">
                                            <Icon size={24} />
                                        </div>
                                        <div className="space-y-1.5 mt-4">
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {card.title}
                                            </h3>
                                            <p className="text-slate-400 text-xs leading-normal">
                                                {card.desc}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Try Asking Suggestions */}
                    <section aria-labelledby="suggestions-heading" className="space-y-4">
                        <h2 id="suggestions-heading" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <HelpCircle size={20} className="text-blue-400" aria-hidden="true" />
                            Try Asking
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suggestions.map((q) => (
                                <Link
                                    key={q}
                                    to="/chat"
                                    aria-label={`Ask: ${q}`}
                                    className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-sm text-slate-300 hover:text-white transition flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    <span>{q}</span>
                                    <span className="text-slate-500 font-semibold text-xs group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}