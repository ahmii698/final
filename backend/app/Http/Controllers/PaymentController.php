<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function uploadPaymentProof(Request $request)
    {
        try {
            $request->validate([
                'screenshot' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            ]);

            $screenshotPath = null;
            
            if ($request->hasFile('screenshot')) {
                $file = $request->file('screenshot');
                $filename = time() . '_proof_' . $file->getClientOriginalName();
                
                if (!file_exists(public_path('uploads/payments'))) {
                    mkdir(public_path('uploads/payments'), 0777, true);
                }
                
                $file->move(public_path('uploads/payments'), $filename);
                $screenshotPath = '/uploads/payments/' . $filename;
            }
            
            $id = DB::table('payment_proofs')->insertGetId([
                'order_id' => $request->order_id,
                'screenshot' => $screenshotPath,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Payment proof uploaded successfully',
                'data' => ['id' => $id]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}