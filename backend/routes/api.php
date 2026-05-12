<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminController;

// ===================== TESTIMONIAL SUBMIT ROUTE =====================
Route::post('/submit-testimonial', [AdminController::class, 'submitTestimonial']);
Route::get('/testimonials/active', [AdminController::class, 'getActiveTestimonials']);

// ===================== NEWSLETTER SUBSCRIBE ROUTE =====================
Route::post('/subscribe-newsletter', [AdminController::class, 'subscribeNewsletter']);

// ===================== TEST ROUTE =====================
Route::get('/test', function() {
    return response()->json([
        'success' => true,
        'message' => 'API is working!',
        'timestamp' => now()
    ]);
});

// ===================== HOME PAGE API =====================
Route::get('/home-data', [HomeController::class, 'getHomeData']);
Route::get('/banners', [HomeController::class, 'getBanners']);
Route::get('/bestsellers', [HomeController::class, 'getBestsellers']);
Route::get('/solo-banner', [HomeController::class, 'getSoloBanner']);
Route::get('/new-arrivals', [HomeController::class, 'getNewArrivals']);
Route::get('/testimonials', [HomeController::class, 'getTestimonials']);
Route::get('/features', [HomeController::class, 'getFeatures']);

// ===================== ABOUT PAGE API =====================
Route::get('/about-data', [AboutController::class, 'getAboutData']);
Route::get('/about-hero', [AboutController::class, 'getHero']);
Route::get('/about-story', [AboutController::class, 'getStory']);
Route::get('/about-statistics', [AboutController::class, 'getStatistics']);
Route::get('/about-values', [AboutController::class, 'getValues']);
Route::get('/about-team', [AboutController::class, 'getTeam']);
Route::get('/about-cta', [AboutController::class, 'getCta']);

// ===================== PRODUCTS API =====================
Route::get('/products', [ProductController::class, 'getProducts']);
Route::get('/products/filter', [ProductController::class, 'getProductsFilter']);
Route::get('/product/{id}', [ProductController::class, 'getProduct']);
Route::get('/products/featured', [ProductController::class, 'getFeaturedProducts']);

// ===================== BLOG PAGE API =====================
Route::get('/blog-posts', [BlogController::class, 'getPosts']);
Route::get('/blog-posts/filter', [BlogController::class, 'getPostsFilter']);
Route::get('/blog-posts/featured', [BlogController::class, 'getFeaturedPost']);
Route::get('/blog-post/{slug}', [BlogController::class, 'getPost']);
Route::get('/blog-categories', [BlogController::class, 'getCategories']);

// ===================== CONTACT PAGE API =====================
Route::get('/contact-data', [ContactController::class, 'getContactData']);
Route::get('/contact-info', [ContactController::class, 'getContactInfo']);
Route::get('/faqs', [ContactController::class, 'getFaqs']);
Route::post('/contact-submit', [ContactController::class, 'submitContact']);
Route::get('/contact-submissions', [ContactController::class, 'getSubmissions']);
Route::put('/contact-submissions/{id}/read', [ContactController::class, 'markAsRead']);

// ===================== ORDER TRACKING API =====================
Route::get('/track-order/{orderId}', [OrderController::class, 'trackOrder']);
Route::post('/create-order', [OrderController::class, 'createOrder']);
Route::get('/my-orders', [OrderController::class, 'getUserOrders'])->middleware('auth:sanctum');

// ===================== ADMIN AUTH ROUTES =====================
Route::post('/admin/login', [AdminController::class, 'login']);
Route::post('/admin/forgot-password', [AdminController::class, 'forgotPassword']);
Route::post('/admin/reset-password', [AdminController::class, 'resetPassword']);

// ===================== ADMIN ROUTES =====================
Route::prefix('admin')->group(function () {
    
    // Dashboard Stats
    Route::get('/stats', [AdminController::class, 'getStats']);
    
    // Products CRUD
    Route::get('/products', [AdminController::class, 'getProducts']);
    Route::post('/products', [AdminController::class, 'createProduct']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
    
    // Home Banners CRUD
    Route::get('/banners', [AdminController::class, 'getBanners']);
    Route::post('/banners', [AdminController::class, 'createBanner']);
    Route::put('/banners/{id}', [AdminController::class, 'updateBanner']);
    Route::delete('/banners/{id}', [AdminController::class, 'deleteBanner']);
    
    // Solo Banners CRUD
    Route::get('/solo-banners', [AdminController::class, 'getSoloBanners']);
    Route::post('/solo-banners', [AdminController::class, 'createSoloBanner']);
    Route::post('/solo-banners/{id}', [AdminController::class, 'updateSoloBanner']);
    Route::put('/solo-banners/{id}', [AdminController::class, 'updateSoloBanner']);
    Route::delete('/solo-banners/{id}', [AdminController::class, 'deleteSoloBanner']);
    
    // About Story
    Route::post('/about-story/{id}', [AdminController::class, 'updateAboutStory']);
    Route::put('/about-story/{id}', [AdminController::class, 'updateAboutStory']);
    Route::get('/about-story', [AdminController::class, 'getAboutStory']);
    
    // About CTA
    Route::get('/about-cta', [AdminController::class, 'getAboutCta']);
    Route::post('/about-cta/{id}', [AdminController::class, 'updateAboutCta']);
    Route::put('/about-cta/{id}', [AdminController::class, 'updateAboutCta']);
    
    // About Hero
    Route::get('/about-hero', [AdminController::class, 'getAboutHero']);
    Route::post('/about-hero/{id}', [AdminController::class, 'updateAboutHero']);
    Route::put('/about-hero/{id}', [AdminController::class, 'updateAboutHero']);
    
    // About Team
    Route::get('/about-team', [AdminController::class, 'getAboutTeam']);
    Route::post('/about-team', [AdminController::class, 'createAboutTeam']);
    Route::post('/about-team/{id}', [AdminController::class, 'updateAboutTeam']);
    Route::put('/about-team/{id}', [AdminController::class, 'updateAboutTeam']);
    Route::delete('/about-team/{id}', [AdminController::class, 'deleteAboutTeam']);
    
    // About Statistics
    Route::get('/about-statistics', [AdminController::class, 'getAboutStatistics']);
    Route::post('/about-statistics', [AdminController::class, 'createAboutStatistic']);
    Route::put('/about-statistics/{id}', [AdminController::class, 'updateAboutStatistic']);
    Route::delete('/about-statistics/{id}', [AdminController::class, 'deleteAboutStatistic']);
    
    // About Values
    Route::get('/about-values', [AdminController::class, 'getAboutValues']);
    Route::post('/about-values', [AdminController::class, 'createAboutValue']);
    Route::put('/about-values/{id}', [AdminController::class, 'updateAboutValue']);
    Route::delete('/about-values/{id}', [AdminController::class, 'deleteAboutValue']);
    
    // Shop Hero
    Route::get('/shop-hero', [AdminController::class, 'getShopHero']);
    Route::post('/shop-hero/{id}', [AdminController::class, 'updateShopHero']);
    Route::put('/shop-hero/{id}', [AdminController::class, 'updateShopHero']);
    
    // Blog Hero
    Route::get('/blog-hero', [AdminController::class, 'getBlogHero']);
    Route::post('/blog-hero/{id}', [AdminController::class, 'updateBlogHero']);
    Route::put('/blog-hero/{id}', [AdminController::class, 'updateBlogHero']);
    
    // Contact Hero
    Route::get('/contact-hero', [AdminController::class, 'getContactHero']);
    Route::post('/contact-hero/{id}', [AdminController::class, 'updateContactHero']);
    Route::put('/contact-hero/{id}', [AdminController::class, 'updateContactHero']);
    
    // Track Order Hero
    Route::get('/track-hero', [AdminController::class, 'getTrackHero']);
    Route::post('/track-hero/{id}', [AdminController::class, 'updateTrackHero']);
    Route::put('/track-hero/{id}', [AdminController::class, 'updateTrackHero']);
    
    // Blog Posts CRUD
    Route::get('/blog-posts', [AdminController::class, 'getBlogPosts']);
    Route::post('/blog-posts', [AdminController::class, 'createBlogPost']);
    Route::put('/blog-posts/{id}', [AdminController::class, 'updateBlogPost']);
    Route::delete('/blog-posts/{id}', [AdminController::class, 'deleteBlogPost']);
    Route::put('/blog-posts/{id}/featured', [AdminController::class, 'toggleFeaturedPost']);
    
    // Features CRUD
    Route::get('/features', [AdminController::class, 'getFeatures']);
    Route::post('/features', [AdminController::class, 'createFeature']);
    Route::put('/features/{id}', [AdminController::class, 'updateFeature']);
    Route::delete('/features/{id}', [AdminController::class, 'deleteFeature']);
    
    // Bestseller Products
    Route::get('/bestsellers', [AdminController::class, 'getBestsellerProducts']);
    Route::post('/bestsellers', [AdminController::class, 'createBestsellerProduct']);
    Route::post('/bestsellers/{id}', [AdminController::class, 'updateBestsellerProduct']);
    Route::put('/bestsellers/{id}', [AdminController::class, 'updateBestsellerProduct']);
    Route::delete('/bestsellers/{id}', [AdminController::class, 'deleteBestsellerProduct']);
    
    // New Arrival Products
    Route::get('/new-arrivals', [AdminController::class, 'getNewArrivalProducts']);
    Route::post('/new-arrivals', [AdminController::class, 'createNewArrivalProduct']);
    Route::post('/new-arrivals/{id}', [AdminController::class, 'updateNewArrivalProduct']);
    Route::put('/new-arrivals/{id}', [AdminController::class, 'updateNewArrivalProduct']);
    Route::delete('/new-arrivals/{id}', [AdminController::class, 'deleteNewArrivalProduct']);
    
    // Testimonials CRUD
    Route::get('/testimonials', [AdminController::class, 'getTestimonials']);
    Route::post('/testimonials', [AdminController::class, 'createTestimonial']);
    Route::put('/testimonials/{id}', [AdminController::class, 'updateTestimonial']);
    Route::delete('/testimonials/{id}', [AdminController::class, 'deleteTestimonial']);
    
    // Testimonial Approval Routes
    Route::get('/all-testimonials', [AdminController::class, 'getAllTestimonials']);
    Route::get('/pending-testimonials', [AdminController::class, 'getPendingTestimonials']);
    Route::put('/testimonials/{id}/approve', [AdminController::class, 'approveTestimonial']);
    Route::delete('/testimonials/{id}/reject', [AdminController::class, 'rejectTestimonial']);
    
    // FAQs CRUD
    Route::get('/faqs', [AdminController::class, 'getFaqs']);
    Route::post('/faqs', [AdminController::class, 'createFaq']);
    Route::put('/faqs/{id}', [AdminController::class, 'updateFaq']);
    Route::delete('/faqs/{id}', [AdminController::class, 'deleteFaq']);
    
    // Orders
    Route::get('/orders', [AdminController::class, 'getOrders']);
    Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
});

// ===================== FRONTEND HERO API ROUTES =====================
Route::get('/shop-hero', function() {
    $hero = DB::table('shop_hero')->where('active', 1)->first();
    if ($hero) $hero->image = $hero->image;
    return response()->json(['success' => true, 'data' => $hero]);
});

Route::get('/blog-hero', function() {
    $hero = DB::table('blog_hero')->where('active', 1)->first();
    if ($hero) $hero->image = $hero->image;
    return response()->json(['success' => true, 'data' => $hero]);
});

Route::get('/contact-hero', function() {
    $hero = DB::table('contact_hero')->where('active', 1)->first();
    if ($hero) $hero->image = $hero->image;
    return response()->json(['success' => true, 'data' => $hero]);
});

Route::get('/track-hero', function() {
    $hero = DB::table('track_hero')->where('active', 1)->first();
    if ($hero) $hero->image = $hero->image;
    return response()->json(['success' => true, 'data' => $hero]);
});

// ===================== SHOP BANNER FOR FRONTEND =====================
Route::get('/shop-banner', function() {
    $banner = DB::table('home_banners')->where('active', 1)->orderBy('order')->first();
    if ($banner) $banner->image = $banner->image;
    return response()->json(['success' => true, 'data' => $banner]);
});

// ===================== FALLBACK =====================
Route::fallback(function() {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found'
    ], 404);
});