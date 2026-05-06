import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import FindGroupsPage from './pages/FindGroupsPage';
import MyGroupsPage from './pages/MyGroupsPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute><DashboardPage /></ProtectedRoute>
                    } />
                    <Route path="/groups" element={
                        <ProtectedRoute><FindGroupsPage /></ProtectedRoute>
                    } />
                    <Route path="/my-groups" element={
                        <ProtectedRoute><MyGroupsPage /></ProtectedRoute>
                    } />
                    <Route path="/groups/new" element={
                        <ProtectedRoute><CreateGroupPage /></ProtectedRoute>
                    } />
                    <Route path="/groups/:id" element={
                        <ProtectedRoute><GroupDetailPage /></ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/login" replace />} />
                    <Route path="/profile" element={
                        <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}