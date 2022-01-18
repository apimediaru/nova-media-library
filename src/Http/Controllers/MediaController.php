<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use APIMedia\NovaMediaLibrary\Http\Requests\MediaUploadRequest;
use APIMedia\NovaMediaLibrary\Http\Requests\MediaGetRequest;
use Illuminate\Http\Request;


class MediaController extends Controller
{
    /**
     * Get all media for provided model
     * @param MediaGetRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(MediaGetRequest $request): \Illuminate\Http\JsonResponse
    {
        $class = $request->get('object');
        $id = $request->get('objectId');
        $collection = $request->get('collection');

        $object = $class::findOrFail($id);

        $media = $object->getMedia($collection);

        return response()->json([
            'files' => $media->toArray(),
        ]);
    }

    /**
     * Upload media and add it to provided model
     * @param MediaUploadRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(MediaUploadRequest $request): \Illuminate\Http\JsonResponse
    {
        $class = $request->get('object');
        $id = $request->get('objectId');
        $collection = $request->get('collection');

        // Vapor uploads may be implemented in future
        $object = $class::findOrFail($id);

        $media = $object->addMediaFromRequest('file')->toMediaCollection($collection);

        return response()->json([
            'file' => $media->toArray(),
        ]);
    }

    /**
     * Remove provided media
     * @param Request $request
     * @return void
     */
    public function remove(Request $request) {

    }

    /**
     * Change media order
     * @param Request $request
     * @return void
     */
    public function sort(Request $request) {

    }

    /**
     * Make provided media active
     * @param Request $request
     * @return void
     */
    public function activate(Request $request) {

    }

    /**
     * Make provided media inactive
     * @param Request $request
     * @return void
     */
    public function deactivate(Request $request) {

    }
}
