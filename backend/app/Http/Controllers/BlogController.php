<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BlogPost;

class BlogController extends Controller
{
    public function getPosts()
    {
        $posts = BlogPost::where('active', 1)->orderBy('date', 'desc')->get();
        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function getPostsFilter(Request $request)
    {
        $query = BlogPost::where('active', 1);
        
        if ($request->has('category') && $request->category != 'All') {
            $query->where('category', $request->category);
        }
        
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('excerpt', 'like', '%' . $request->search . '%');
            });
        }
        
        return response()->json([
            'success' => true,
            'data' => $query->orderBy('date', 'desc')->get()
        ]);
    }

    public function getFeaturedPost()
    {
        $post = BlogPost::where('active', 1)->where('is_featured', 1)->first();
        return response()->json(['success' => true, 'data' => $post]);
    }

    public function getPost($slug)
    {
        $post = BlogPost::where('slug', $slug)->where('active', 1)->first();
        
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        
        $post->increment('views');
        
        return response()->json(['success' => true, 'data' => $post]);
    }

    public function getCategories()
    {
        $categories = BlogPost::where('active', 1)
            ->select('category')
            ->distinct()
            ->get()
            ->pluck('category');
        
        $allCategories = array_merge(['All'], $categories->toArray());
        
        return response()->json(['success' => true, 'data' => $allCategories]);
    }
}