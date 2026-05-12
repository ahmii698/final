<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function trackOrder($orderId)
    {
        $order = Order::where('order_id', $orderId)->first();
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        
        $items = is_string($order->items) ? json_decode($order->items, true) : $order->items;
        $shippingAddress = is_string($order->shipping_address) ? json_decode($order->shipping_address, true) : $order->shipping_address;
        
        $steps = [
            ['name' => 'Order Placed', 'completed' => true, 'date' => date('M d, Y', strtotime($order->created_at)), 'time' => date('h:i A', strtotime($order->created_at))],
            ['name' => 'Processing', 'completed' => in_array($order->status, ['processing', 'shipped', 'delivered']), 'date' => null, 'time' => null],
            ['name' => 'Shipped', 'completed' => in_array($order->status, ['shipped', 'delivered']), 'date' => null, 'time' => null],
            ['name' => 'Delivered', 'completed' => $order->status == 'delivered', 'date' => null, 'time' => null]
        ];
        
        $statusText = ['pending' => 'Your order has been received', 'processing' => 'Your order is being processed', 'shipped' => 'Your order has been shipped', 'delivered' => 'Your order has been delivered', 'cancelled' => 'Your order has been cancelled'][$order->status] ?? '';
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->order_id, 'status' => $order->status, 'statusText' => $statusText,
                'date' => date('M d, Y', strtotime($order->created_at)),
                'estimatedDelivery' => $order->status == 'shipped' ? date('M d, Y', strtotime('+3 days')) : '',
                'items' => count($items), 'total' => $order->total,
                'shippingAddress' => is_array($shippingAddress) ? implode(', ', $shippingAddress) : $shippingAddress,
                'paymentMethod' => $order->payment_method == 'cod' ? 'Cash on Delivery' : 'Credit Card',
                'steps' => $steps, 'trackingNumber' => $order->tracking_number
            ]
        ]);
    }
    
    public function createOrder(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255', 'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20', 'shipping_address' => 'required|array',
            'items' => 'required|array', 'subtotal' => 'required|numeric', 'total' => 'required|numeric',
            'payment_method' => 'nullable|string'
        ]);
        
        $orderId = 'LXE' . time() . rand(100, 999);
        
        $order = Order::create([
            'order_id' => $orderId, 'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'], 'customer_phone' => $validated['customer_phone'],
            'shipping_address' => json_encode($validated['shipping_address']), 'items' => json_encode($validated['items']),
            'subtotal' => $validated['subtotal'], 'shipping' => 10, 'total' => $validated['total'],
            'status' => 'pending', 'payment_method' => $validated['payment_method'] ?? 'cod', 'payment_status' => 'pending'
        ]);
        
        return response()->json(['success' => true, 'message' => 'Order created successfully', 'data' => ['order_id' => $orderId, 'status' => 'pending']]);
    }
}