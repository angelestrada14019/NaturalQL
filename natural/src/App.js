import "./App.css";
import SideBar from "./components/Sidebar/SideBar";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Train from "./pages/Train";
import ChatProviderWithRouter from "./context/ChatProviderWithRouter";
function App() {
    return (
        <Router>
            <ChatProviderWithRouter>
            <SideBar>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/train" element={<Train />} />
                    <Route path="*" element={<> not found</>} />
                </Routes>
            </SideBar>
            </ChatProviderWithRouter>
        </Router>
    );
}

export default App;
