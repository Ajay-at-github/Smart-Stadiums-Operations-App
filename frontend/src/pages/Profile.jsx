import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="app-layout min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />
            <div className="dashboard flex flex-1">
                <Sidebar />
                <main id="main-content" className="dashboard-content p-8 md:p-12 flex-1 max-w-4xl mx-auto">
                    <section aria-labelledby="profile-title" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
                        {/* Title */}
                        <div>
                            <h1 id="profile-title" className="text-3xl font-extrabold tracking-tight text-white">My Profile</h1>
                            <p className="text-slate-400 mt-2">Manage your account information and preferences.</p>
                        </div>

                        {/* User Card */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-800">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={`${user?.displayName || "User"}'s avatar`}
                                    className="w-24 h-24 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/20"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 text-4xl shadow-inner" aria-hidden="true">
                                    <User size={48} />
                                </div>
                            )}
                            <div className="text-center sm:text-left space-y-1">
                                <h2 className="text-2xl font-bold text-white">
                                    {user?.displayName || "Stadium Visitor"}
                                </h2>
                                <p className="text-blue-400 text-sm font-medium">Verified Visitor</p>
                                <p className="text-xs text-slate-500">Visitor ID: {user?.uid || "UNKNOWN"}</p>
                            </div>
                        </div>

                        {/* Details */}
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="User Account Details">
                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 flex items-start gap-4">
                                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg shrink-0" aria-hidden="true">
                                    <Mail size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <dt className="text-xs text-slate-500 font-medium">Email Address</dt>
                                    <dd className="text-sm font-semibold text-slate-200">{user?.email || "N/A"}</dd>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 flex items-start gap-4">
                                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg shrink-0" aria-hidden="true">
                                    <Calendar size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <dt className="text-xs text-slate-500 font-medium">Joined At</dt>
                                    <dd className="text-sm font-semibold text-slate-200">
                                        {user?.metadata?.creationTime
                                            ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                              })
                                            : "N/A"}
                                    </dd>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 flex items-start gap-4">
                                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0" aria-hidden="true">
                                    <Shield size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <dt className="text-xs text-slate-500 font-medium">Role & Credentials</dt>
                                    <dd className="text-sm font-semibold text-slate-200">Guest Visitor</dd>
                                </div>
                            </div>
                        </dl>

                        {/* Sign out */}
                        <div className="pt-6 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={handleLogout}
                                aria-label="Sign out from this device"
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl font-medium transition cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                                <LogOut size={16} aria-hidden="true" />
                                Sign Out
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}