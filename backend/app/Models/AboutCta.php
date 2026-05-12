<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutCta extends Model
{
    protected $table = 'about_cta';
    protected $fillable = ['image', 'title', 'subtitle', 'button_text', 'button_link', 'active'];
}