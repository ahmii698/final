<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $table = 'blog_posts';
    protected $fillable = [
        'title', 'slug', 'date', 'image', 'excerpt', 'content', 
        'category', 'read_time', 'is_featured', 'views', 'active'
    ];
}