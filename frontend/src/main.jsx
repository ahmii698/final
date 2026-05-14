import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import About from './pages/About';
import Shop from './pages/Shop';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import OrderTracking from './pages/OrderTracking';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Payment from './pages/Payment';
import PaymentPending from './pages/PaymentPending';
// Bestseller & New Arrival Imports
import BestsellerDetail from './pages/BestsellerDetail';
import NewArrivalDetail from './pages/NewArrivalDetail';
// Admin Imports
import AdminLogin from './pages/Admin/AdminLogin';
import AdminForgotPassword from './pages/Admin/AdminForgotPassword';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminBanners from './pages/Admin/AdminBanners';
import AdminTestimonials from './pages/Admin/AdminTestimonials';
import AdminFaqs from './pages/Admin/AdminFaqs';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminAboutStory from './pages/Admin/AdminAboutStory';
import AdminAboutCta from './pages/Admin/AdminAboutCta';
import AdminAboutHero from './pages/Admin/AdminAboutHero';
import AdminAboutTeam from './pages/Admin/AdminAboutTeam';
import AdminAboutStatistics from './pages/Admin/AdminAboutStatistics';
import AdminAboutValues from './pages/Admin/AdminAboutValues';
import AdminBlogPosts from './pages/Admin/AdminBlogPosts';
import AdminBlogFeatured from './pages/Admin/AdminBlogFeatured';
import AdminContactSubmissions from './pages/Admin/AdminContactSubmissions';
import AdminPaymentProofs from './pages/Admin/AdminPaymentProofs';
import AdminShopHero from './pages/Admin/AdminShopHero';
import AdminBlogHero from './pages/Admin/AdminBlogHero';
import AdminContactHero from './pages/Admin/AdminContactHero';
import AdminTrackHero from './pages/Admin/AdminTrackHero';
import AdminNewArrivals from './pages/Admin/AdminNewArrivals';
import AdminBestsellers from './pages/Admin/AdminBestsellers';
import AdminSoloBanners from './pages/Admin/AdminSoloBanners';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Frontend Routes */}
            <Route path="/" element={<App />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-pending" element={<PaymentPending />} />
            
            {/* Bestseller & New Arrival Routes */}
            <Route path="/bestseller/:id" element={<BestsellerDetail />} />
            <Route path="/new-arrival/:id" element={<NewArrivalDetail />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/faqs" element={<AdminFaqs />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/about-story" element={<AdminAboutStory />} />
            <Route path="/admin/about-cta" element={<AdminAboutCta />} />
            <Route path="/admin/about-hero" element={<AdminAboutHero />} />
            <Route path="/admin/about-team" element={<AdminAboutTeam />} />
            <Route path="/admin/about-statistics" element={<AdminAboutStatistics />} />
            <Route path="/admin/about-values" element={<AdminAboutValues />} />
            <Route path="/admin/blog-posts" element={<AdminBlogPosts />} />
            <Route path="/admin/blog-featured" element={<AdminBlogFeatured />} />
            <Route path="/admin/contact-submissions" element={<AdminContactSubmissions />} />
            <Route path="/admin/payment-proofs" element={<AdminPaymentProofs />} />
            <Route path="/admin/shop-hero" element={<AdminShopHero />} />
            <Route path="/admin/blog-hero" element={<AdminBlogHero />} />
            <Route path="/admin/contact-hero" element={<AdminContactHero />} />
            <Route path="/admin/track-hero" element={<AdminTrackHero />} />
            <Route path="/admin/new-arrivals" element={<AdminNewArrivals />} />
            <Route path="/admin/bestsellers" element={<AdminBestsellers />} />
            <Route path="/admin/solo-banners" element={<AdminSoloBanners />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);