<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use APIMedia\NovaMediaLibrary\Http\Requests\MediaMultipleRequest;
use APIMedia\NovaMediaLibrary\Http\Requests\MediaSortRequest;
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
        return $this->service->upload($request);
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
     * @param MediaSortRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sort(MediaSortRequest $request) {
        return $this->service->sort($request);
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
        return $this->service->handle($request);
    }
}
