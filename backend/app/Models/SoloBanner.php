<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoloBanner extends Model
{
    protected $table = 'solo_banners';
    protected $fillable = ['image', 'title', 'subtitle', 'button_text', 'button_link', 'active'];
}