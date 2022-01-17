<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use APIMedia\NovaMediaLibrary\Http\Requests\MediaUploadRequest;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        \Log::debug($request->get('test'));
        \Log::debug($request->input());

        return response()->json([
            'test' => true,
        ]);
    }
}
