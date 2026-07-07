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
        <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md border-b border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-wide">
                <span className="text-2xl">🏟</span> PromptWars
            </Link>
            
            <div className="flex items-center gap-6">
                <Link to="/dashboard" className="hover:text-blue-400 transition flex items-center gap-1.5 text-sm font-medium">
                    <Home size={16} /> Dashboard
                </Link>
                <Link to="/chat" className="hover:text-blue-400 transition flex items-center gap-1.5 text-sm font-medium">
                    <MessageSquare size={16} /> Chat
                </Link>
                
                {user && (
                    <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                        <Link to="/profile" className="flex items-center gap-2 hover:text-blue-400 transition">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-600" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                    <User size={16} />
                                </div>
                            )}
                            <span className="hidden sm:inline text-sm font-medium">{user.displayName || user.email.split("@")[0]}</span>
                        </Link>
                        
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition flex items-center gap-1 text-sm font-medium cursor-pointer"
                            title="Log Out"
                        >
                            <LogOut size={16} />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
