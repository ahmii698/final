<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function trackOrder($orderId)
    {
        $order = DB::table('orders')->where('order_id', $orderId)->first();
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
                'paymentMethod' => $order->payment_method == 'cod' ? 'Cash on Delivery' : 'Bank Transfer',
                'steps' => $steps, 'trackingNumber' => $order->tracking_number ?? null
            ]
        ]);
    }
    
    public function createOrder(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone' => 'nullable|string|max:20',
                'shipping_address' => 'required|string',
                'items' => 'required|array',
                'subtotal' => 'required|numeric',
                'shipping' => 'nullable|numeric',
                'total' => 'required|numeric',
                'user_id' => 'nullable|integer'
            ]);
            
            // Generate unique order ID
            $orderId = 'LXE' . time() . rand(100, 999);
            
            // Create order
            $orderData = [
                'order_id' => $orderId,
                'user_id' => $validated['user_id'] ?? null,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'shipping_address' => $validated['shipping_address'],
                'items' => json_encode($validated['items']),
                'subtotal' => $validated['subtotal'],
                'shipping' => $validated['shipping'] ?? 0,
                'total' => $validated['total'],
                'status' => 'pending',
                'payment_method' => 'bank_transfer',
                'payment_status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ];
            
            $id = DB::table('orders')->insertGetId($orderData);
            
            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => [
                    'id' => $id,
                    'order_id' => $orderId,
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'],
                    'shipping_address' => $validated['shipping_address'],
                    'items' => $validated['items'],
                    'subtotal' => $validated['subtotal'],
                    'shipping' => $validated['shipping'] ?? 0,
                    'total' => $validated['total'],
                    'status' => 'pending',
                    'created_at' => now()
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getUserOrders(Request $request)
    {
        $userId = $request->user()->id ?? null;
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
        }
        
        $orders = DB::table('orders')->where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        
        return response()->json(['success' => true, 'data' => $orders]);
    }
}