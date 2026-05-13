<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class AdminController extends Controller
{
    // ===================== AUTH =====================
    
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $admin = DB::table('users')->where('email', $request->email)->where('role', 'admin')->first();

        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Admin not found'], 401);
        }

        if (!Hash::check($request->password, $admin->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid password'], 401);
        }

        $token = bin2hex(random_bytes(32));
        
        return response()->json(['success' => true, 'token' => $token, 'user' => ['id' => $admin->id, 'email' => $admin->email]]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $admin = DB::table('users')->where('email', $request->email)->where('role', 'admin')->first();
        
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Email not found'], 404);
        }

        $otp = rand(100000, 999999);
        
        try {
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                ['token' => $otp, 'created_at' => now()]
            );
        } catch (\Exception $e) {
            DB::statement("CREATE TABLE IF NOT EXISTS password_reset_tokens (
                email VARCHAR(255) PRIMARY KEY,
                token VARCHAR(255) NOT NULL,
                created_at TIMESTAMP NULL
            )");
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                ['token' => $otp, 'created_at' => now()]
            );
        }

        $subject = "Password Reset OTP - LUXE Admin";
        $message = "Your OTP for password reset is: $otp\n\nThis OTP is valid for 15 minutes.\n\nRegards,\nLUXE Team";
        $headers = "From: noreply@luxe.com\r\n";
        
        @mail($request->email, $subject, $message, $headers);

        return response()->json(['success' => true, 'message' => 'OTP sent to your email']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric',
            'new_password' => 'required|min:6'
        ]);

        $reset = DB::table('password_reset_tokens')->where('email', $request->email)->where('token', $request->otp)->first();
        
        if (!$reset) {
            return response()->json(['success' => false, 'message' => 'Invalid OTP'], 400);
        }
        
        if (Carbon::parse($reset->created_at)->addMinutes(15)->isPast()) {
            return response()->json(['success' => false, 'message' => 'OTP expired'], 400);
        }

        DB::table('users')->where('email', $request->email)->update([
            'password' => Hash::make($request->new_password)
        ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['success' => true, 'message' => 'Password reset successfully']);
    }

    // ===================== DASHBOARD STATS =====================
    
    public function getStats(Request $request)
    {
        try {
            $totalProducts = DB::table('products')->count();
            $totalOrders = DB::table('orders')->count();
            // FIXED: Use clients table instead of users
            $totalUsers = DB::table('clients')->count();
            $totalRevenue = DB::table('orders')->sum('total') ?? 0;
        } catch (\Exception $e) {
            $totalProducts = 0;
            $totalOrders = 0;
            $totalUsers = 0;
            $totalRevenue = 0;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalUsers' => $totalUsers,
                'totalRevenue' => $totalRevenue
            ]
        ]);
    }

    // ===================== RECENT CLIENTS =====================
    
    public function getRecentClients(Request $request)
    {
        try {
            $clients = DB::table('clients')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $clients
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ===================== PRODUCTS CRUD WITH IMAGE UPLOAD =====================
    
    public function getProducts(Request $request)
    {
        $products = DB::table('products')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function createProduct(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/products'), $imageName);
            $data['image'] = '/uploads/products/' . $imageName;
        }
        
        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $hoverImageName = time() . '_hover_' . $hoverImage->getClientOriginalName();
            $hoverImage->move(public_path('uploads/products'), $hoverImageName);
            $data['hover_image'] = '/uploads/products/' . $hoverImageName;
        }
        
        unset($data['_method']);
        
        $id = DB::table('products')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateProduct(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/products'), $imageName);
            $data['image'] = '/uploads/products/' . $imageName;
        }
        
        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $hoverImageName = time() . '_hover_' . $hoverImage->getClientOriginalName();
            $hoverImage->move(public_path('uploads/products'), $hoverImageName);
            $data['hover_image'] = '/uploads/products/' . $hoverImageName;
        }
        
        unset($data['_method']);
        
        DB::table('products')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteProduct($id)
    {
        $product = DB::table('products')->where('id', $id)->first();
        if ($product) {
            if ($product->image && file_exists(public_path($product->image))) {
                unlink(public_path($product->image));
            }
            if ($product->hover_image && file_exists(public_path($product->hover_image))) {
                unlink(public_path($product->hover_image));
            }
        }
        
        DB::table('products')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== BANNERS CRUD WITH IMAGE UPLOAD =====================
    
    public function getBanners(Request $request)
    {
        $banners = DB::table('home_banners')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $banners]);
    }

    public function createBanner(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_banner_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/banners'), $imageName);
            $data['image'] = '/uploads/banners/' . $imageName;
        }
        
        unset($data['_method']);
        
        $id = DB::table('home_banners')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateBanner(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_banner_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/banners'), $imageName);
            $data['image'] = '/uploads/banners/' . $imageName;
        }
        
        unset($data['_method']);
        
        DB::table('home_banners')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteBanner($id)
    {
        $banner = DB::table('home_banners')->where('id', $id)->first();
        if ($banner && $banner->image && file_exists(public_path($banner->image))) {
            unlink(public_path($banner->image));
        }
        
        DB::table('home_banners')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== SOLO BANNERS (MID BANNERS) =====================
    
    public function getSoloBanners(Request $request)
    {
        $banners = DB::table('solo_banners')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $banners]);
    }

    public function createSoloBanner(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_solo_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/banners'), $imageName);
            $data['image'] = '/uploads/banners/' . $imageName;
        }
        
        unset($data['_method']);
        
        $id = DB::table('solo_banners')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateSoloBanner(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_solo_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/banners'), $imageName);
            $data['image'] = '/uploads/banners/' . $imageName;
            
            $oldBanner = DB::table('solo_banners')->where('id', $id)->first();
            if ($oldBanner && $oldBanner->image && file_exists(public_path($oldBanner->image))) {
                unlink(public_path($oldBanner->image));
            }
        }
        
        unset($data['_method']);
        
        DB::table('solo_banners')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteSoloBanner($id)
    {
        $banner = DB::table('solo_banners')->where('id', $id)->first();
        if ($banner && $banner->image && file_exists(public_path($banner->image))) {
            unlink(public_path($banner->image));
        }
        
        DB::table('solo_banners')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
    
    // ===================== ABOUT STORY =====================
    
    public function getAboutStory(Request $request)
    {
        try {
            $story = DB::table('about_story')->first();
            
            return response()->json([
                'success' => true,
                'data' => $story
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAboutStory(Request $request, $id)
    {
        try {
            $data = [];
            
            if ($request->has('heading')) $data['heading'] = $request->heading;
            if ($request->has('paragraph1')) $data['paragraph1'] = $request->paragraph1;
            if ($request->has('paragraph2')) $data['paragraph2'] = $request->paragraph2;
            if ($request->has('paragraph3')) $data['paragraph3'] = $request->paragraph3;
            if ($request->has('active')) $data['active'] = $request->active;
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_about_' . $image->getClientOriginalName();
                
                if (!file_exists(public_path('uploads/about'))) {
                    mkdir(public_path('uploads/about'), 0777, true);
                }
                
                $image->move(public_path('uploads/about'), $imageName);
                $data['image'] = '/uploads/about/' . $imageName;
                
                $oldStory = DB::table('about_story')->where('id', $id)->first();
                if ($oldStory && $oldStory->image && file_exists(public_path($oldStory->image))) {
                    unlink(public_path($oldStory->image));
                }
            }
            
            if (empty($data)) {
                return response()->json(['success' => false, 'message' => 'No data to update'], 400);
            }
            
            $exists = DB::table('about_story')->where('id', $id)->exists();
            
            if ($exists) {
                DB::table('about_story')->where('id', $id)->update($data);
            } else {
                $data['id'] = $id;
                DB::table('about_story')->insert($data);
            }
            
            return response()->json(['success' => true, 'message' => 'About Story updated successfully']);
            
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ===================== ABOUT HERO =====================
    
    public function getAboutHero(Request $request)
    {
        $hero = DB::table('about_hero')->first();
        return response()->json(['success' => true, 'data' => $hero]);
    }

    public function updateAboutHero(Request $request, $id)
    {
        try {
            $data = [];
            
            if ($request->has('title')) $data['title'] = $request->title;
            if ($request->has('subtitle')) $data['subtitle'] = $request->subtitle;
            if ($request->has('active')) $data['active'] = $request->active;
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_hero_' . $image->getClientOriginalName();
                
                if (!file_exists(public_path('uploads/about'))) {
                    mkdir(public_path('uploads/about'), 0777, true);
                }
                
                $image->move(public_path('uploads/about'), $imageName);
                $data['image'] = '/uploads/about/' . $imageName;
                
                $oldHero = DB::table('about_hero')->where('id', $id)->first();
                if ($oldHero && $oldHero->image && file_exists(public_path($oldHero->image))) {
                    unlink(public_path($oldHero->image));
                }
            }
            
            unset($data['_method']);
            
            $exists = DB::table('about_hero')->where('id', $id)->exists();
            
            if ($exists) {
                DB::table('about_hero')->where('id', $id)->update($data);
            } else {
                $data['id'] = $id;
                DB::table('about_hero')->insert($data);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'About Hero updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ===================== ABOUT CTA =====================
    
    public function getAboutCta(Request $request)
    {
        $cta = DB::table('about_cta')->first();
        return response()->json(['success' => true, 'data' => $cta]);
    }

    public function updateAboutCta(Request $request, $id)
    {
        try {
            $data = [];
            
            if ($request->has('title')) $data['title'] = $request->title;
            if ($request->has('subtitle')) $data['subtitle'] = $request->subtitle;
            if ($request->has('button_text')) $data['button_text'] = $request->button_text;
            if ($request->has('button_link')) $data['button_link'] = $request->button_link;
            if ($request->has('active')) $data['active'] = $request->active;
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_cta_' . $image->getClientOriginalName();
                
                if (!file_exists(public_path('uploads/about'))) {
                    mkdir(public_path('uploads/about'), 0777, true);
                }
                
                $image->move(public_path('uploads/about'), $imageName);
                $data['image'] = '/uploads/about/' . $imageName;
                
                $oldCta = DB::table('about_cta')->where('id', $id)->first();
                if ($oldCta && $oldCta->image && file_exists(public_path($oldCta->image))) {
                    unlink(public_path($oldCta->image));
                }
            }
            
            unset($data['_method']);
            
            $exists = DB::table('about_cta')->where('id', $id)->exists();
            
            if ($exists) {
                DB::table('about_cta')->where('id', $id)->update($data);
            } else {
                $data['id'] = $id;
                DB::table('about_cta')->insert($data);
            }
            
            return response()->json(['success' => true, 'message' => 'CTA updated successfully']);
            
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ===================== NEWSLETTER SUBSCRIBE =====================
    
    public function subscribeNewsletter(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:newsletter_subscribers,email',
        ]);

        $id = DB::table('newsletter_subscribers')->insertGetId([
            'email' => $request->email,
            'subscribed_at' => now(),
            'is_active' => 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for subscribing to our newsletter!'
        ]);
    }

    public function getSubscribers(Request $request)
    {
        $subscribers = DB::table('newsletter_subscribers')
            ->orderBy('subscribed_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $subscribers
        ]);
    }

    public function deleteSubscriber($id)
    {
        DB::table('newsletter_subscribers')->where('id', $id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Subscriber removed successfully'
        ]);
    }

    // ===================== SHOP HERO =====================
    
    public function getShopHero(Request $request)
    {
        $hero = DB::table('shop_hero')->first();
        return response()->json(['success' => true, 'data' => $hero]);
    }

    public function updateShopHero(Request $request, $id)
    {
        try {
            $data = [];
            if ($request->has('title')) $data['title'] = $request->title;
            if ($request->has('subtitle')) $data['subtitle'] = $request->subtitle;
            if ($request->has('active')) $data['active'] = $request->active;
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_shop_' . $image->getClientOriginalName();
                if (!file_exists(public_path('uploads/shop'))) mkdir(public_path('uploads/shop'), 0777, true);
                $image->move(public_path('uploads/shop'), $imageName);
                $data['image'] = '/uploads/shop/' . $imageName;
                
                $oldHero = DB::table('shop_hero')->where('id', $id)->first();
                if ($oldHero && $oldHero->image && file_exists(public_path($oldHero->image))) {
                    unlink(public_path($oldHero->image));
                }
            }
            
            unset($data['_method']);
            $exists = DB::table('shop_hero')->where('id', $id)->exists();
            if ($exists) {
                DB::table('shop_hero')->where('id', $id)->update($data);
            } else {
                $data['id'] = $id;
                DB::table('shop_hero')->insert($data);
            }
            
            return response()->json(['success' => true, 'message' => 'Shop Hero updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ===================== BLOG HERO =====================
    
    public function getBlogHero(Request $request)
    {
        $hero = DB::table('blog_hero')->first();
        return response()->json(['success' => true, 'data' => $hero]);
    }

    public function updateBlogHero(Request $request, $id)
    {
        try {
            $data = [];
            if ($request->has('title')) $data['title'] = $request->title;
            if ($request->has('subtitle')) $data['subtitle'] = $request->subtitle;
            if ($request->has('active')) $data['active'] = $request->active;
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_blog_' . $image->getClientOriginalName();
                if (!file_exists(public_path('uploads/blog'))) mkdir(public_path('uploads/blog'), 0777, true);
                $image->move(public_path('uploads/blog'), $imageName);
                $data['image'] = '/uploads/blog/' . $imageName;
                
                $oldHero = DB::table('blog_hero')->where('id', $id)->first();
                if ($oldHero && $oldHero->image && file_exists(public_path($oldHero->image))) {
                    unlink(public_path($oldHero->image));
                }
            }
            
            unset($data['_method']);
            $exists = DB::table('blog_hero')->where('id', $id)->exists();
            if ($exists) {
                DB::table('blog_hero')->where('id', $id)->update($data);
            } else {
                $data['id'] = $id;
                DB::table('blog_hero')->insert($data);
            }
            
            return response()->json(['success' => true, 'message' => 'Blog Hero updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ===================== CONTACT HERO =====================
    
    public function getContactHero(Request $request)
    {
        $hero = DB::table('contact_hero')->first();
        return response()->json(['success' => true, 'data' => $hero]);
    }

    public function updateContactHero(Request $request, $id)
    {
        try {
            $data = [];
            if ($request->has('title')) $data['title'] = $request->title;
            if ($request->has('subtitle')) $data['subtitle'] = $request->subtitle;
            if ($request->has('active')) $data['active'] = $request->active;
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_contact_' . $image->getClientOriginalName();
                if (!file_exists(public_path('uploads/contact'))) mkdir(public_path('uploads/contact'), 0777, true);
                $image->move(public_path('uploads/contact'), $imageName);
                $data['image'] = '/uploads/contact/' . $imageName;
                
                $oldHero = DB::table('contact_hero')->where('id', $id)->first();
                if ($oldHero && $oldHero->image && file_exists(public_path($oldHero->image))) {
                    unlink(public_path($oldHero->image));
                }
            }
            
            unset($data['_method']);
            $exists = DB::table('contact_hero')->where('id', $id)->exists();
            if ($exists) {
                DB::table('contact_hero')->where('id', $id)->update($data);
            } else {
                $data['id'] = $id;
                DB::table('contact_hero')->insert($data);
            }
            
            return response()->json(['success' => true, 'message' => 'Contact Hero updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ===================== TRACK ORDER HERO =====================
    
    public function getTrackHero(Request $request)
    {
        $hero = DB::table('track_hero')->first();
        return response()->json(['success' => true, 'data' => $hero]);
    }

    public function updateTrackHero(Request $request, $id)
    {
        try {
            $data = [];
            if ($request->has('title')) $data['title'] = $request->title;
            if ($request->has('subtitle')) $data['subtitle'] = $request->subtitle;
            if ($request->has('active')) $data['active'] = $request->active;
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_track_' . $image->getClientOriginalName();
                if (!file_exists(public_path('uploads/track'))) mkdir(public_path('uploads/track'), 0777, true);
                $image->move(public_path('uploads/track'), $imageName);
                $data['image'] = '/uploads/track/' . $imageName;
                
                $oldHero = DB::table('track_hero')->where('id', $id)->first();
                if ($oldHero && $oldHero->image && file_exists(public_path($oldHero->image))) {
                    unlink(public_path($oldHero->image));
                }
            }
            
            unset($data['_method']);
            $exists = DB::table('track_hero')->where('id', $id)->exists();
            if ($exists) {
                DB::table('track_hero')->where('id', $id)->update($data);
            } else {
                $data['id'] = $id;
                DB::table('track_hero')->insert($data);
            }
            
            return response()->json(['success' => true, 'message' => 'Track Hero updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ===================== ABOUT STATISTICS =====================
    
    public function getAboutStatistics(Request $request)
    {
        $statistics = DB::table('about_statistics')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $statistics]);
    }

    public function createAboutStatistic(Request $request)
    {
        $id = DB::table('about_statistics')->insertGetId($request->all());
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateAboutStatistic(Request $request, $id)
    {
        DB::table('about_statistics')->where('id', $id)->update($request->all());
        return response()->json(['success' => true]);
    }

    public function deleteAboutStatistic($id)
    {
        DB::table('about_statistics')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== ABOUT VALUES =====================
    
    public function getAboutValues(Request $request)
    {
        $values = DB::table('about_values')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $values]);
    }

    public function createAboutValue(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('icon')) {
            $icon = $request->file('icon');
            $iconName = time() . '_value_' . $icon->getClientOriginalName();
            
            if (!file_exists(public_path('uploads/values'))) {
                mkdir(public_path('uploads/values'), 0777, true);
            }
            
            $icon->move(public_path('uploads/values'), $iconName);
            $data['icon'] = '/uploads/values/' . $iconName;
        }
        
        unset($data['_method']);
        
        $id = DB::table('about_values')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateAboutValue(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('icon')) {
            $icon = $request->file('icon');
            $iconName = time() . '_value_' . $icon->getClientOriginalName();
            
            if (!file_exists(public_path('uploads/values'))) {
                mkdir(public_path('uploads/values'), 0777, true);
            }
            
            $icon->move(public_path('uploads/values'), $iconName);
            $data['icon'] = '/uploads/values/' . $iconName;
            
            $oldValue = DB::table('about_values')->where('id', $id)->first();
            if ($oldValue && $oldValue->icon && file_exists(public_path($oldValue->icon))) {
                unlink(public_path($oldValue->icon));
            }
        }
        
        unset($data['_method']);
        
        DB::table('about_values')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteAboutValue($id)
    {
        $value = DB::table('about_values')->where('id', $id)->first();
        if ($value && $value->icon && file_exists(public_path($value->icon))) {
            unlink(public_path($value->icon));
        }
        
        DB::table('about_values')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== BLOG POSTS CRUD =====================
    
    public function getBlogPosts(Request $request)
    {
        $posts = DB::table('blog_posts')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function createBlogPost(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_blog_' . $image->getClientOriginalName();
            
            if (!file_exists(public_path('uploads/blog'))) {
                mkdir(public_path('uploads/blog'), 0777, true);
            }
            
            $image->move(public_path('uploads/blog'), $imageName);
            $data['image'] = '/uploads/blog/' . $imageName;
        }
        
        if (empty($data['slug'])) {
            $data['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'])));
        }
        
        unset($data['_method']);
        
        $id = DB::table('blog_posts')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateBlogPost(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_blog_' . $image->getClientOriginalName();
            
            if (!file_exists(public_path('uploads/blog'))) {
                mkdir(public_path('uploads/blog'), 0777, true);
            }
            
            $image->move(public_path('uploads/blog'), $imageName);
            $data['image'] = '/uploads/blog/' . $imageName;
            
            $oldPost = DB::table('blog_posts')->where('id', $id)->first();
            if ($oldPost && $oldPost->image && file_exists(public_path($oldPost->image))) {
                unlink(public_path($oldPost->image));
            }
        }
        
        if (empty($data['slug']) && !empty($data['title'])) {
            $data['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'])));
        }
        
        unset($data['_method']);
        
        DB::table('blog_posts')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteBlogPost($id)
    {
        $post = DB::table('blog_posts')->where('id', $id)->first();
        if ($post && $post->image && file_exists(public_path($post->image))) {
            unlink(public_path($post->image));
        }
        
        DB::table('blog_posts')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    public function toggleFeaturedPost($id)
    {
        $post = DB::table('blog_posts')->where('id', $id)->first();
        
        if ($post) {
            $newStatus = $post->is_featured ? 0 : 1;
            
            if ($newStatus == 1) {
                DB::table('blog_posts')->update(['is_featured' => 0]);
            }
            
            DB::table('blog_posts')->where('id', $id)->update(['is_featured' => $newStatus]);
            
            return response()->json(['success' => true, 'is_featured' => $newStatus]);
        }
        
        return response()->json(['success' => false, 'message' => 'Post not found'], 404);
    }

    // ===================== CONTACT SUBMISSIONS =====================
    
    public function getContactSubmissions(Request $request)
    {
        $submissions = DB::table('contact_submissions')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $submissions]);
    }

    public function markContactAsRead(Request $request, $id)
    {
        DB::table('contact_submissions')->where('id', $id)->update([
            'is_read' => 1,
            'updated_at' => now()
        ]);
        
        return response()->json(['success' => true, 'message' => 'Marked as read']);
    }

    public function deleteContactSubmission($id)
    {
        DB::table('contact_submissions')->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Deleted successfully']);
    }

    // ===================== CONTACT REPLY (EMAIL) - FIXED =====================
    
    public function replyToContact(Request $request, $id)
    {
        try {
            $submission = DB::table('contact_submissions')->where('id', $id)->first();
            
            if (!$submission) {
                return response()->json(['success' => false, 'message' => 'Submission not found'], 404);
            }
            
            $to = $request->to;
            $subject = $request->subject;
            $message = $request->message;
            $customerName = $request->customer_name;
            
            $fullMessage = "Dear " . $customerName . ",\n\n";
            $fullMessage .= $message . "\n\n";
            $fullMessage .= "---\n";
            $fullMessage .= "Best Regards,\n";
            $fullMessage .= "LUXE Support Team\n";
            $fullMessage .= "www.luxe.com";
            
            // Using PHPMailer
            $mail = new PHPMailer(true);
            
            // Server settings
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'xahmedmalik30600@gmail.com';
            $mail->Password = 'eqjltztoeuatrvtk';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = 465;
            $mail->setFrom('xahmedmalik30600@gmail.com', 'LUXE Support');
            $mail->addAddress($to, $customerName);
            $mail->isHTML(false);
            $mail->Subject = $subject;
            $mail->Body = $fullMessage;
            
            $mail->send();
            
            // Mark as read when replied
            DB::table('contact_submissions')->where('id', $id)->update([
                'is_read' => 1,
                'updated_at' => now()
            ]);
            
            return response()->json(['success' => true, 'message' => 'Reply sent successfully']);
            
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Mailer Error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }// ===================== BLOG FEATURED =====================
    
public function getBlogFeatured(Request $request)
{
    $featured = DB::table('blog_featured')->first();
    return response()->json(['success' => true, 'data' => $featured]);
}

public function updateBlogFeatured(Request $request, $id)
{
    try {
        $data = [];
        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('excerpt')) $data['excerpt'] = $request->excerpt;
        if ($request->has('date')) $data['date'] = $request->date;
        if ($request->has('read_time')) $data['read_time'] = $request->read_time;
        if ($request->has('link')) $data['link'] = $request->link;
        if ($request->has('active')) $data['active'] = $request->active;
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_featured_' . $image->getClientOriginalName();
            if (!file_exists(public_path('uploads/blog'))) mkdir(public_path('uploads/blog'), 0777, true);
            $image->move(public_path('uploads/blog'), $imageName);
            $data['image'] = '/uploads/blog/' . $imageName;
            
            $oldFeatured = DB::table('blog_featured')->where('id', $id)->first();
            if ($oldFeatured && $oldFeatured->image && file_exists(public_path($oldFeatured->image))) {
                unlink(public_path($oldFeatured->image));
            }
        }
        
        unset($data['_method']);
        $exists = DB::table('blog_featured')->where('id', $id)->exists();
        if ($exists) {
            DB::table('blog_featured')->where('id', $id)->update($data);
        } else {
            $data['id'] = $id;
            DB::table('blog_featured')->insert($data);
        }
        
        return response()->json(['success' => true, 'message' => 'Featured post updated successfully']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

    // ===================== ABOUT TEAM =====================
    
    public function getAboutTeam(Request $request)
    {
        $team = DB::table('about_team')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $team]);
    }

    public function createAboutTeam(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_team_' . $image->getClientOriginalName();
            
            if (!file_exists(public_path('uploads/team'))) {
                mkdir(public_path('uploads/team'), 0777, true);
            }
            
            $image->move(public_path('uploads/team'), $imageName);
            $data['image'] = '/uploads/team/' . $imageName;
        }
        
        unset($data['_method']);
        
        $id = DB::table('about_team')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateAboutTeam(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_team_' . $image->getClientOriginalName();
            
            if (!file_exists(public_path('uploads/team'))) {
                mkdir(public_path('uploads/team'), 0777, true);
            }
            
            $image->move(public_path('uploads/team'), $imageName);
            $data['image'] = '/uploads/team/' . $imageName;
            
            $oldTeam = DB::table('about_team')->where('id', $id)->first();
            if ($oldTeam && $oldTeam->image && file_exists(public_path($oldTeam->image))) {
                unlink(public_path($oldTeam->image));
            }
        }
        
        unset($data['_method']);
        
        DB::table('about_team')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteAboutTeam($id)
    {
        $team = DB::table('about_team')->where('id', $id)->first();
        if ($team && $team->image && file_exists(public_path($team->image))) {
            unlink(public_path($team->image));
        }
        
        DB::table('about_team')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== FEATURES CRUD =====================
    
    public function getFeatures(Request $request)
    {
        $features = DB::table('features')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $features]);
    }

    public function createFeature(Request $request)
    {
        $id = DB::table('features')->insertGetId($request->all());
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateFeature(Request $request, $id)
    {
        DB::table('features')->where('id', $id)->update($request->all());
        return response()->json(['success' => true]);
    }

    public function deleteFeature($id)
    {
        DB::table('features')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== BESTSELLER PRODUCTS =====================
    
    public function getBestsellerProducts(Request $request)
    {
        $products = DB::table('bestseller_products')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function createBestsellerProduct(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_bestseller_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/products'), $imageName);
            $data['image'] = '/uploads/products/' . $imageName;
        }
        
        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $hoverImageName = time() . '_bestseller_hover_' . $hoverImage->getClientOriginalName();
            $hoverImage->move(public_path('uploads/products'), $hoverImageName);
            $data['hover_image'] = '/uploads/products/' . $hoverImageName;
        }
        
        unset($data['_method']);
        
        $id = DB::table('bestseller_products')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateBestsellerProduct(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_bestseller_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/products'), $imageName);
            $data['image'] = '/uploads/products/' . $imageName;
            
            $oldProduct = DB::table('bestseller_products')->where('id', $id)->first();
            if ($oldProduct && $oldProduct->image && file_exists(public_path($oldProduct->image))) {
                unlink(public_path($oldProduct->image));
            }
        }
        
        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $hoverImageName = time() . '_bestseller_hover_' . $hoverImage->getClientOriginalName();
            $hoverImage->move(public_path('uploads/products'), $hoverImageName);
            $data['hover_image'] = '/uploads/products/' . $hoverImageName;
            
            $oldProduct = DB::table('bestseller_products')->where('id', $id)->first();
            if ($oldProduct && $oldProduct->hover_image && file_exists(public_path($oldProduct->hover_image))) {
                unlink(public_path($oldProduct->hover_image));
            }
        }
        
        unset($data['_method']);
        
        DB::table('bestseller_products')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteBestsellerProduct($id)
    {
        $product = DB::table('bestseller_products')->where('id', $id)->first();
        if ($product) {
            if ($product->image && file_exists(public_path($product->image))) {
                unlink(public_path($product->image));
            }
            if ($product->hover_image && file_exists(public_path($product->hover_image))) {
                unlink(public_path($product->hover_image));
            }
        }
        
        DB::table('bestseller_products')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
    
    // ===================== NEW ARRIVAL PRODUCTS =====================
    
    public function getNewArrivalProducts(Request $request)
    {
        $products = DB::table('new_arrival_products')->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function createNewArrivalProduct(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_new_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/products'), $imageName);
            $data['image'] = '/uploads/products/' . $imageName;
        }
        
        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $hoverImageName = time() . '_new_hover_' . $hoverImage->getClientOriginalName();
            $hoverImage->move(public_path('uploads/products'), $hoverImageName);
            $data['hover_image'] = '/uploads/products/' . $hoverImageName;
        }
        
        unset($data['_method']);
        
        $id = DB::table('new_arrival_products')->insertGetId($data);
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateNewArrivalProduct(Request $request, $id)
    {
        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_new_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/products'), $imageName);
            $data['image'] = '/uploads/products/' . $imageName;
            
            $oldProduct = DB::table('new_arrival_products')->where('id', $id)->first();
            if ($oldProduct && $oldProduct->image && file_exists(public_path($oldProduct->image))) {
                unlink(public_path($oldProduct->image));
            }
        }
        
        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $hoverImageName = time() . '_new_hover_' . $hoverImage->getClientOriginalName();
            $hoverImage->move(public_path('uploads/products'), $hoverImageName);
            $data['hover_image'] = '/uploads/products/' . $hoverImageName;
            
            $oldProduct = DB::table('new_arrival_products')->where('id', $id)->first();
            if ($oldProduct && $oldProduct->hover_image && file_exists(public_path($oldProduct->hover_image))) {
                unlink(public_path($oldProduct->hover_image));
            }
        }
        
        unset($data['_method']);
        
        DB::table('new_arrival_products')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function deleteNewArrivalProduct($id)
    {
        $product = DB::table('new_arrival_products')->where('id', $id)->first();
        if ($product) {
            if ($product->image && file_exists(public_path($product->image))) {
                unlink(public_path($product->image));
            }
            if ($product->hover_image && file_exists(public_path($product->hover_image))) {
                unlink(public_path($product->hover_image));
            }
        }
        
        DB::table('new_arrival_products')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== TESTIMONIALS CRUD =====================
    
    public function getTestimonials(Request $request)
    {
        $testimonials = DB::table('testimonials')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function createTestimonial(Request $request)
    {
        $id = DB::table('testimonials')->insertGetId($request->all());
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateTestimonial(Request $request, $id)
    {
        DB::table('testimonials')->where('id', $id)->update($request->all());
        return response()->json(['success' => true]);
    }

    public function deleteTestimonial($id)
    {
        DB::table('testimonials')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== TESTIMONIAL SUBMIT & APPROVAL =====================
    
    public function submitTestimonial(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'text' => 'required|string|min:3',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $role = $request->role ?: 'Customer';

        $id = DB::table('testimonials')->insertGetId([
            'name' => $request->name,
            'role' => $role,
            'text' => $request->text,
            'rating' => $request->rating,
            'active' => 0,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback! It will be reviewed and published soon.',
            'data' => ['id' => $id]
        ]);
    }

    public function getPendingTestimonials(Request $request)
    {
        $testimonials = DB::table('testimonials')
            ->where('active', 0)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $testimonials
        ]);
    }

    public function approveTestimonial($id)
    {
        DB::table('testimonials')->where('id', $id)->update([
            'active' => 1,
            'updated_at' => now()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Testimonial approved successfully'
        ]);
    }

    public function getAllTestimonials(Request $request)
    {
        $testimonials = DB::table('testimonials')
            ->orderBy('active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $testimonials
        ]);
    }

    public function getActiveTestimonials(Request $request)
    {
        $testimonials = DB::table('testimonials')
            ->where('active', 1)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $testimonials
        ]);
    }

    public function rejectTestimonial($id)
    {
        DB::table('testimonials')->where('id', $id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Testimonial rejected and deleted'
        ]);
    }

    // ===================== FAQS CRUD =====================
    
    public function getFaqs(Request $request)
    {
        $faqs = DB::table('faqs')->where('active', 1)->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $faqs]);
    }

    public function createFaq(Request $request)
    {
        $id = DB::table('faqs')->insertGetId($request->all());
        return response()->json(['success' => true, 'data' => ['id' => $id]]);
    }

    public function updateFaq(Request $request, $id)
    {
        DB::table('faqs')->where('id', $id)->update($request->all());
        return response()->json(['success' => true]);
    }

    public function deleteFaq($id)
    {
        DB::table('faqs')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    // ===================== ORDERS =====================
    
    public function getOrders(Request $request)
    {
        $orders = DB::table('orders')->orderBy('created_at', 'desc')->get();
        
        foreach ($orders as $order) {
            $order->items = json_decode($order->items, true);
            $order->shipping_address = json_decode($order->shipping_address, true);
        }
        
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,processing,shipped,delivered,cancelled']);
        
        DB::table('orders')->where('id', $id)->update([
            'status' => $request->status,
            'updated_at' => now()
        ]);
        
        return response()->json(['success' => true]);
    }
}