// eslint-disable-next-line no-unused-vars
import React from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../services/firebase";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Home, MessageSquare } from "lucide-react";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium text-sm transition-all"
            >
                Skip to main content
            </a>
            <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md border-b border-slate-800" aria-label="Main Navigation">
                <Link to="/dashboard" aria-label="PromptWars Home" className="flex items-center gap-2 font-bold text-xl tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                    <span className="text-2xl" aria-hidden="true">🏟</span> PromptWars
                </Link>
                
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="hover:text-blue-400 transition flex items-center gap-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">
                        <Home size={16} aria-hidden="true" /> <span>Dashboard</span>
                    </Link>
                    <Link to="/chat" className="hover:text-blue-400 transition flex items-center gap-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">
                        <MessageSquare size={16} aria-hidden="true" /> <span>Chat</span>
                    </Link>
                    
                    {user && (
                        <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                            <Link to="/profile" aria-label="View user profile" className="flex items-center gap-2 hover:text-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={`${user.displayName || "User"}'s avatar`} className="w-8 h-8 rounded-full border border-slate-600" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600" aria-hidden="true">
                                        <User size={16} />
                                    </div>
                                )}
                                <span className="hidden sm:inline text-sm font-medium">{user.displayName || user.email.split("@")[0]}</span>
                            </Link>
                            
                            <button
                                onClick={handleLogout}
                                aria-label="Log out of account"
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition flex items-center gap-1 text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                title="Log Out"
                            >
                                <LogOut size={16} aria-hidden="true" />
                                <span className="hidden md:inline">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}

