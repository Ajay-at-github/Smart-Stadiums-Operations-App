import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth, googleProvider } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { LogIn, Sparkles, UserPlus } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isLogin, setIsLogin] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Already logged in
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");

        try {
            await signInWithPopup(auth, googleProvider);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }

        setLoading(false);
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
            } else {
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
            }

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-955 p-6 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-8 space-y-6 relative z-10">
                <div className="space-y-2 text-center">
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                        <span>🏟</span> PromptWars
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {isLogin
                            ? "Sign in to access the stadium concierge"
                            : "Create your concierge visitor account"}
                    </p>
                </div>

                <form
                    onSubmit={handleEmailAuth}
                    className="space-y-4"
                >
                    <div className="space-y-1">
                        <label htmlFor="email-address-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                            id="email-address-input"
                            type="email"
                            placeholder="you@example.com"
                            className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-blue-500"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                        <input
                            id="password-input"
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-955 text-slate-200 border border-slate-800 focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-blue-500"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    {error && (
                        <div role="alert" aria-live="assertive" className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 leading-normal">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3.5 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        {loading ? (
                            "Please wait..."
                        ) : isLogin ? (
                            <>
                                <LogIn size={16} aria-hidden="true" />
                                <span>Sign In</span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} aria-hidden="true" />
                                <span>Create Account</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-slate-800" aria-hidden="true"></div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">OR</span>
                    <div className="h-px flex-1 bg-slate-800" aria-hidden="true"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    aria-label="Continue with Google Authentication"
                    className="w-full rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-855 text-slate-300 hover:text-white py-3.5 text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <Sparkles size={16} className="text-amber-500 animate-pulse" aria-hidden="true" />
                    <span>Continue with Google</span>
                </button>

                <p className="text-center text-xs text-slate-400">
                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}
                    <button
                        onClick={() =>
                            setIsLogin(!isLogin)
                        }
                        className="ml-1.5 text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        {isLogin ? "Create one" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}