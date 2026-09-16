import {useEffect} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/public/HomePage';
import HotelDetailPage from './pages/public/HotelDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import PaymentPage from './pages/customer/PaymentPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import {useAppDispatch, useAppSelector} from './app/hooks';
import {setFullName} from './features/authSlice';
import {getMyProfile} from './api/users';
import ManagerHotelsPage from "./pages/manager/ManagerHotelsPage.tsx";
import ManagerRoomsPage from "./pages/manager/ManagerRoomsPage.tsx";
import ManagerBookingsPage from "./pages/manager/ManagerBookingsPage.tsx";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage.tsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.tsx";
import BackToTop from "./components/BackToTop.tsx";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/public/ResetPasswordPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

function App() {
    const dispatch = useAppDispatch();
    const {token, fullName} = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (token && !fullName) {
            getMyProfile().then((res) => dispatch(setFullName(res.data.fullName))).catch(() => {
            });
        }
    }, [token, fullName, dispatch]);

    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <Navbar/>
                <main className="flex-1 bg-sand">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/hotels/:id" element={<HotelDetailPage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/payment/:bookingId" element={
                                                               <ProtectedRoute
                                                                  requiredRole="CUSTOMER"><PaymentPage/></ProtectedRoute>
                                                          }/>
                        <Route path="/my-bookings" element={
                                                        <ProtectedRoute
                                                           requiredRole="CUSTOMER"><MyBookingsPage/></ProtectedRoute>
                                                   }/>
                        <Route path="/dashboard" element={
                                                      <ProtectedRoute
                                                         requiredRole="CUSTOMER"><CustomerDashboardPage/></ProtectedRoute>
                                                 }/>
                        <Route path="/manager/hotels" element={
                                                           <ProtectedRoute
                                                              requiredRole="HOTEL_MANAGER"><ManagerHotelsPage/></ProtectedRoute>
                                                      }/>
                        <Route path="/manager/hotels/:hotelId/rooms" element={
                                                                          <ProtectedRoute
                                                                             requiredRole="HOTEL_MANAGER"><ManagerRoomsPage/></ProtectedRoute>
                                                                     }/>
                        <Route path="/manager/hotels/:hotelId/bookings" element={
                                                                             <ProtectedRoute
                                                                                requiredRole="HOTEL_MANAGER"><ManagerBookingsPage/></ProtectedRoute>
                                                                        }/>
                        <Route path="/manager/dashboard" element={
                                                              <ProtectedRoute
                                                                 requiredRole="HOTEL_MANAGER"><ManagerDashboardPage/></ProtectedRoute>
                                                         }/>
                        <Route path="/admin/dashboard" element={
                                                            <ProtectedRoute
                                                               requiredRole="ADMIN"><AdminDashboardPage/></ProtectedRoute>
                                                       }/>
                        <Route path="/profile" element={
                                                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                                               } />
                    </Routes>
                </main>
                <Footer/>
                <BackToTop />
            </div>
        </BrowserRouter>
    );
}

export default App;