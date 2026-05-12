<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewArrivalProduct extends Model
{
    protected $table = 'new_arrival_products';
    protected $fillable = ['name', 'price', 'old_price', 'image', 'hover_image', 'rating', 'category', 'link', 'order', 'active'];
}