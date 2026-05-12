<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BestsellerProduct extends Model
{
    protected $table = 'bestseller_products';
    protected $fillable = ['name', 'price', 'old_price', 'image', 'hover_image', 'rating', 'category', 'link', 'order', 'active'];
}