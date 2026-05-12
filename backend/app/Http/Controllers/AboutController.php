<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AboutHero;
use App\Models\AboutStory;
use App\Models\AboutStatistic;
use App\Models\AboutValue;
use App\Models\AboutTeam;
use App\Models\AboutCta;

class AboutController extends Controller
{
    public function getAboutData()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'hero' => AboutHero::where('active', 1)->first(),
                'story' => AboutStory::where('active', 1)->first(),
                'statistics' => AboutStatistic::where('active', 1)->orderBy('order')->get(),
                'values' => AboutValue::where('active', 1)->orderBy('order')->get(),
                'team' => AboutTeam::where('active', 1)->orderBy('order')->get(),
                'cta' => AboutCta::where('active', 1)->first()
            ]
        ]);
    }

    public function getHero()
    {
        return response()->json([
            'success' => true,
            'data' => AboutHero::where('active', 1)->first()
        ]);
    }

    public function getStory()
    {
        return response()->json([
            'success' => true,
            'data' => AboutStory::where('active', 1)->first()
        ]);
    }

    public function getStatistics()
    {
        return response()->json([
            'success' => true,
            'data' => AboutStatistic::where('active', 1)->orderBy('order')->get()
        ]);
    }

    public function getValues()
    {
        return response()->json([
            'success' => true,
            'data' => AboutValue::where('active', 1)->orderBy('order')->get()
        ]);
    }

    public function getTeam()
    {
        return response()->json([
            'success' => true,
            'data' => AboutTeam::where('active', 1)->orderBy('order')->get()
        ]);
    }

    public function getCta()
    {
        return response()->json([
            'success' => true,
            'data' => AboutCta::where('active', 1)->first()
        ]);
    }
}