import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";

export default function Chat() {
    return (
        <div className="app-layout min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />
            <div className="dashboard flex flex-1">
                <Sidebar />
                <div className="dashboard-content p-6 md:p-10 flex-1 flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">🏟 Stadium Assistant</h1>
                        <p className="text-slate-400 text-sm mt-1">Chat bot powered by Gemini 2.5 and RAG knowledge base.</p>
                    </div>
                    <ChatBox />
                </div>
            </div>
        </div>
    );
}