<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use APIMedia\NovaMediaLibrary\Http\Requests\MediaRequest;

class UploadController extends Controller
{
    public function index(MediaRequest $request): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'test' => true,
        ]);
    }
}
