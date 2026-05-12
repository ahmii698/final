<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $fillable = [
        'name', 'price', 'old_price', 'image', 'hover_image', 'rating', 
        'category', 'description', 'features', 'in_stock', 'is_featured', 
        'order', 'active'
    ];
    
    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'old_price' => 'decimal:2',
        'rating' => 'decimal:1'
    ];
}