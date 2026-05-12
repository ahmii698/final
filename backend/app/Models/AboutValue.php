<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutValue extends Model
{
    protected $table = 'about_values';
    protected $fillable = ['icon', 'title', 'description', 'order', 'active'];
}