<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    protected $fillable = ['order_id', 'user_id', 'customer_name', 'customer_email', 'customer_phone', 'shipping_address', 'items', 'subtotal', 'shipping', 'total', 'status', 'payment_method', 'payment_status', 'tracking_number', 'notes'];
    
    protected $casts = [
        'shipping_address' => 'array',
        'items' => 'array'
    ];
}