<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactSubmission;
use App\Models\Faq;
use App\Models\ContactInfo;

class ContactController extends Controller
{
    public function getContactData()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'contactInfo' => ContactInfo::where('active', 1)->first(),
                'faqs' => Faq::where('active', 1)->orderBy('order')->get()
            ]
        ]);
    }

    public function getContactInfo()
    {
        return response()->json([
            'success' => true,
            'data' => ContactInfo::where('active', 1)->first()
        ]);
    }

    public function getFaqs()
    {
        return response()->json([
            'success' => true,
            'data' => Faq::where('active', 1)->orderBy('order')->get()
        ]);
    }

    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string'
        ]);

        $submission = ContactSubmission::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully!',
            'data' => $submission
        ]);
    }

    public function getSubmissions()
    {
        $submissions = ContactSubmission::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $submissions]);
    }

    public function markAsRead($id)
    {
        $submission = ContactSubmission::findOrFail($id);
        $submission->update(['is_read' => 1]);
        return response()->json(['success' => true, 'message' => 'Marked as read']);
    }
}