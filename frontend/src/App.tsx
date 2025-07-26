import Home from "./pages/NotLoggedIn/Home.tsx";
import Login from "./pages/NotLoggedIn/Login.tsx";
import Dashboard from "./pages/LoggedIn/Dashboard.tsx";
import SignUp from "./pages/NotLoggedIn/SignUp.tsx";
// import Community from "./pages/Community.tsx";
import Cafes from "./pages/LoggedIn/Cafes.tsx";
import DiscoverCafes from "./pages/NotLoggedIn/DiscoverCafes.tsx";
import Logout from "./pages/NotLoggedIn/Logout.tsx";
import Maps from "./pages/Maps.tsx";
import PageNotFound from "./pages/PageNotFound.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="Routes">
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/discovercafes" element={<DiscoverCafes />} />

          {/* Signed In */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cafes" element={<Cafes />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/community" element={<PageNotFound />} />
          <Route path="/passport" element={<PageNotFound />} />
          <Route path="/routes" element={<PageNotFound />} />
          <Route path="/achievement" element={<PageNotFound />} />
          <Route path="/journal" element={<PageNotFound />} />
          <Route path="/account" element={<PageNotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
