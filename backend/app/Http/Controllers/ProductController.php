<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function getProducts()
    {
        $products = DB::table('products')
            ->where('active', 1)
            ->orderBy('order')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function getProductsFilter(Request $request)
    {
        $query = DB::table('products')->where('active', 1);
        
        if ($request->has('sort')) {
            switch($request->sort) {
                case 'price-low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price-high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'rating':
                    $query->orderBy('rating', 'desc');
                    break;
                default:
                    $query->orderBy('order');
            }
        } else {
            $query->orderBy('order');
        }
        
        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    public function getProduct($id)
    {
        $product = DB::table('products')->where('id', $id)->where('active', 1)->first();
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function getFeaturedProducts()
    {
        $products = DB::table('products')
            ->where('active', 1)
            ->where('is_featured', 1)
            ->orderBy('order')
            ->limit(4)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
}