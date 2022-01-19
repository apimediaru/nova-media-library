<?php

namespace APIMedia\NovaMediaLibrary\Http\Services;

use App\Nova\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig;
use Spatie\MediaLibrary\MediaCollections\Exceptions\MediaCannotBeDeleted;
use Illuminate\Database\Eloquent\Model;
use \APIMedia\NovaMediaLibrary\Fields\HandlesConversionsTrait;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use APIMedia\NovaMediaLibrary\Http\Resources\MediaResource;


class MediaLibraryService
{
    use HandlesConversionsTrait;

    protected $object;

    public function handle(Request $request, $object = null): JsonResponse
    {
        if (!$object) {
            $class = $request->get('object');
            try {
                $object = $class::findOrFail($request->get('objectId'));
            } catch (ModelNotFoundException $exception) {
                return $this->failure($exception->getMessage(), [], [], 404);
            }
        }

        $errors = [];
        $collection = $request->get('collection');
        $ids = $request->get('ids');
        $method = $request->get('method');

        if (!method_exists($this, $method)) {
            return $this->failure('Method "' . $method . '" does not exists.');
        }

        foreach ($ids as $id) {
            try {
                $this->{$method}($object, $id);
            } catch (MediaCannotBeDeleted $exception) {
                $errors[$id] = $exception->getMessage();
            }
        }

        unset($object->media);
        $media = $object->getMedia($collection);

        return $this->success('', [
            'files' => MediaResource::collection($media),
        ], $errors);
    }

    public function upload(Request $request, $object = null): JsonResponse
    {
        if (!$object) {
            $class = $request->get('object');
            try {
                $object = $class::findOrFail($request->get('objectId'));
            } catch (ModelNotFoundException $exception) {
                return $this->failure($exception->getMessage(), [], [], 404);
            }
        }

        $collection = $request->get('collection');

        try {
            $media = $object->addMediaFromRequest('file')->toMediaCollection($collection);
        } catch (FileIsTooBig $exception) {
            return $this->failure($exception->getMessage(), [], [], 400);
        }

        return $this->success('OK', [
            'file' => new MediaResource($media),
        ]);
    }

    public function delete($object, $id) {
        return $object->deleteMedia($id);
    }

    public function sort(Request $request, $object = null): JsonResponse
    {
        // if (!$object) {
        //     $class = $request->get('object');
        //     try {
        //         $object = $class::findOrFail($request->get('objectId'));
        //     } catch (ModelNotFoundException $exception) {
        //         return $this->failure($exception->getMessage(), [], [], 404);
        //     }
        // }


        $collection = $request->get('collection');
        $class = $request->get('object');
        $target = $request->get('target');
        $sources = $request->get('ids');


        foreach ($sources as $id) {
            $source = Media::where(['collection' => $collection]);
        }


        Media::where(['collection' => $collection]);

        return $this->success('test');
    }

    /**
     * Returns JSON response
     *
     * @param bool $successful
     * @param string $message
     * @param array $data
     * @param array $errors
     * @param int $statusCode
     *
     * @return JsonResponse
     */
    protected function jsonResponse(bool $successful, string $message, array $data, array $errors, int $statusCode): JsonResponse
    {
        return response()->json([
            'success' => $successful,
            'message' => $message,
            'data' => $data,
            'errors' => $errors,
        ], $statusCode);
    }

    /**
     * Returns successful JSON response
     *
     * @param string $message
     * @param array $data
     * @param array $errors
     * @param int $statusCode
     *
     * @return JsonResponse
     */
    protected function success(string $message = '', array $data = [], array $errors = [], int $statusCode = 200): JsonResponse
    {
        return $this->jsonResponse(true, $message, $data, $errors, $statusCode);
    }

    /**
     * Returns erroneous JSON response
     *
     * @param string $message
     * @param array $data
     * @param array $errors
     * @param int $statusCode
     *
     * @return JsonResponse
     */
    protected function failure(string $message = '', array $data = [], array $errors = [], int $statusCode = 400): JsonResponse
    {
        return $this->jsonResponse(false, $message, $data, $errors, $statusCode);
    }
}
