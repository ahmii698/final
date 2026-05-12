<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutTeam extends Model
{
    protected $table = 'about_team';
    protected $fillable = ['name', 'position', 'image', 'bio', 'experience', 'order', 'active'];
}