<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use APIMedia\NovaMediaLibrary\Http\Requests\MediaMultipleRequest;
use APIMedia\NovaMediaLibrary\Http\Requests\MediaUploadRequest;
use APIMedia\NovaMediaLibrary\Http\Requests\MediaGetRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use PHPUnit\Exception;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig;
use Spatie\MediaLibrary\MediaCollections\Exceptions\MediaCannotBeDeleted;
use Spatie\MediaLibrary\MediaCollections\Models\Media;


class MediaController extends Controller
{
    /**
     * Get all media for provided model
     * @param MediaGetRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(MediaGetRequest $request): \Illuminate\Http\JsonResponse
    {
        //
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
        try {
            $object = $class::findOrFail($id);
        } catch (ModelNotFoundException $exception) {
            return $this->failure($exception->getMessage(), 404);
        }

        try {
            $media = $object->addMediaFromRequest('file')->toMediaCollection($collection);
        } catch (FileIsTooBig $exception) {
            return $this->failure($exception->getMessage(), 400);
        }

        return $this->succeed('OK', [
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

    public function multiple(MediaMultipleRequest $request): \Illuminate\Http\JsonResponse
    {
        $method = $request->get('method');
        $ids = $request->get('ids');
        $collection = $request->get('collection');

        $class = $request->get('object');
        $objectId = $request->get('objectId');

        // Vapor uploads may be implemented in future
        try {
            $object = $class::findOrFail($objectId);
        } catch (ModelNotFoundException $exception) {
            return $this->failure($exception->getMessage(), 404);
        }

        $errors = [];
        foreach ($ids as $id) {
            try {
                $object->deleteMedia($id);
            } catch (MediaCannotBeDeleted $exception) {
                $errors[$id] = $exception->getMessage();
            }
        }

        unset($object->media);
        $media = $object->getMedia($collection);

        return $this->succeed('', [
            'errors' => $errors,
            'files' => $media->toArray(),
        ]);
    }
}
