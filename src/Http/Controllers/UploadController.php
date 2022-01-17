<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use APIMedia\NovaMediaLibrary\Http\Requests\MediaUploadRequest;
use Illuminate\Contracts\Container\BindingResolutionException;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $class = $request->get('object');
        $id = $request->get('objectId');

        // Vapor uploads may be implemented in future
        $object = $class::findOrFail($id);

        \Log::debug('test');

        \Log::debug($object->id);

        return response()->json([
            'test' => true,
        ]);
    }
}
