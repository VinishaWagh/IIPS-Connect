import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage'
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";
import MyPosts from "./pages/MyPosts";
import SavedPosts from "./pages/SavedPosts";
import AlumniMentorship from "./pages/AlumniMentorship";
import Notifications from "./pages/Notifications";
import ProfileSettings from "./pages/ProfileSettings";
import PendingRequests from "./pages/PendingRequests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/saved-posts" element={<SavedPosts />} />
        <Route path="/mentorship" element={<AlumniMentorship />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/requests" element={<PendingRequests />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
