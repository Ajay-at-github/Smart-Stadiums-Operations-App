import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, User, ShieldAlert } from "lucide-react";

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Chat Bot", path: "/chat", icon: MessageSquare },
        { name: "Profile", path: "/profile", icon: User },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-73px)] hidden md:flex flex-col justify-between p-4 shrink-0">
            <div className="space-y-6">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
                    Menu
                </div>
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                                        : "hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-855">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm mb-1">
                    <ShieldAlert size={16} /> Emergency Info
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Need immediate assistance? Say <strong>"Emergency"</strong> in the chat to alert medical & security personnel instantly.
                </p>
            </div>
        </aside>
    );
}
