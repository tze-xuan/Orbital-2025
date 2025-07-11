import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import SignUp from "./pages/SignUp.tsx";
import Community from "./pages/Community.tsx";
import Cafes from "./pages/Cafes.tsx";
import Logout from "./pages/Logout.tsx";
import Maps from "./pages/Maps.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="Routes">
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/community" element={<Community />} />
          <Route path="/cafes" element={<Cafes />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
