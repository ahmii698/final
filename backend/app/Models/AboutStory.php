<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutStory extends Model
{
    protected $table = 'about_story';
    protected $fillable = ['image', 'heading', 'paragraph1', 'paragraph2', 'paragraph3', 'active'];
}