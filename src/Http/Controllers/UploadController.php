<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use APIMedia\NovaMediaLibrary\Http\Requests\MediaUploadRequest;

class UploadController extends Controller
{
    public function index(MediaUploadRequest $request): \Illuminate\Http\JsonResponse
    {
        \Log::debug($request->input());

        return response()->json([
            'test' => true,
        ]);
    }
}
