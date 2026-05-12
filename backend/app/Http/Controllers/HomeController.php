<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function getHomeData()
    {
        // Get banners
        try {
            $banners = DB::table('home_banners')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $banners = [];
        }

        // Get bestsellers
        try {
            $bestsellers = DB::table('bestseller_products')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $bestsellers = [];
        }

        // Get solo banner
        try {
            $soloBanner = DB::table('solo_banners')->where('active', 1)->first();
        } catch (\Exception $e) {
            $soloBanner = null;
        }

        // Get new arrivals
        try {
            $newArrivals = DB::table('new_arrival_products')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $newArrivals = [];
        }

        // Get testimonials
        try {
            $testimonials = DB::table('testimonials')->where('active', 1)->get();
        } catch (\Exception $e) {
            $testimonials = [];
        }

        // Get features
        try {
            $features = DB::table('features')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $features = [];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'banners' => $banners,
                'bestsellers' => $bestsellers,
                'soloBanner' => $soloBanner,
                'newArrivals' => $newArrivals,
                'testimonials' => $testimonials,
                'features' => $features
            ]
        ]);
    }

    public function getBanners()
    {
        try {
            $banners = DB::table('home_banners')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $banners = [];
        }
        return response()->json(['success' => true, 'data' => $banners]);
    }

    public function getBestsellers()
    {
        try {
            $bestsellers = DB::table('bestseller_products')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $bestsellers = [];
        }
        return response()->json(['success' => true, 'data' => $bestsellers]);
    }

    public function getSoloBanner()
    {
        try {
            $soloBanner = DB::table('solo_banners')->where('active', 1)->first();
        } catch (\Exception $e) {
            $soloBanner = null;
        }
        return response()->json(['success' => true, 'data' => $soloBanner]);
    }

    public function getNewArrivals()
    {
        try {
            $newArrivals = DB::table('new_arrival_products')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $newArrivals = [];
        }
        return response()->json(['success' => true, 'data' => $newArrivals]);
    }

    public function getTestimonials()
    {
        try {
            $testimonials = DB::table('testimonials')->where('active', 1)->get();
        } catch (\Exception $e) {
            $testimonials = [];
        }
        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function getFeatures()
    {
        try {
            $features = DB::table('features')->where('active', 1)->orderBy('order')->get();
        } catch (\Exception $e) {
            $features = [];
        }
        return response()->json(['success' => true, 'data' => $features]);
    }
}