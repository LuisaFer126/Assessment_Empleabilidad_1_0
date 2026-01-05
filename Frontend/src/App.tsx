import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// import PrivateRoute ...

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/courses" element={
                        <PrivateRoute>
                            <Courses />
                        </PrivateRoute>
                    } />
                    <Route path="/courses/:id" element={
                        <PrivateRoute>
                            <CourseDetail />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/courses" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
