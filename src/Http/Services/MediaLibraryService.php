<?php

namespace APIMedia\NovaMediaLibrary\Http\Services;

use App\Nova\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Intervention\Image\Exception\NotFoundException;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig;
use Illuminate\Database\Eloquent\Model;
use \APIMedia\NovaMediaLibrary\Fields\HandlesConversionsTrait;
use Spatie\MediaLibrary\MediaCollections\Exceptions\MediaCannotBeUpdated;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use APIMedia\NovaMediaLibrary\Http\Resources\MediaResource;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\Conversions\FileManipulator;
use APIMedia\NovaMediaLibrary\Http\Exceptions\MediaLibraryMediaCannotBeUpdated;


class MediaLibraryService
{
    use HandlesConversionsTrait;

    protected $object;
    protected $fileManipulator;

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
        $sources = $request->get('sources');
        $method = $request->get('method');

        if (!method_exists($this, $method)) {
            return $this->failure('Method "' . $method . '" does not exists.');
        }

        foreach ($sources as $id) {
            try {
                $this->{$method}($object, $id, $collection);
            } catch (\Exception $exception) {
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

    /**
     * Mark media as active
     *
     * @param $object
     * @param $id
     * @param $collection
     * @return mixed
     * @throws MediaLibraryMediaCannotBeUpdated
     */
    public function activate($object, $id, $collection) {
        return $this->changeActivity($object, $id, $collection, true);
    }

    /**
     * Mark media as not active
     *
     * @param $object
     * @param $id
     * @param $collection
     * @return mixed
     * @throws MediaLibraryMediaCannotBeUpdated
     */
    public function deactivate($object, $id, $collection) {
        return $this->changeActivity($object, $id, $collection, false);
    }

    /**
     * Change media active column
     *
     * @param $object
     * @param $id
     * @param $collection
     * @param bool $active
     * @return mixed
     * @throws MediaLibraryMediaCannotBeUpdated
     */
    public function changeActivity($object, $id, $collection, bool $active) {
        $media = $object->media->find($id);
        if (!$media) {
            throw MediaLibraryMediaCannotBeUpdated::doesNotFound($collection, $id);
        }
        return $media->update(['active' => $active]);
    }

    /**
     * Regenerate media thumbnails
     *
     * @param $object
     * @param $id
     * @param $collection
     * @return void
     * @throws MediaLibraryMediaCannotBeUpdated
     */
    public function regenerateThumbnails($object, $id, $collection) {
        $fileManipulator = $this->getFileManipulator();

        $media = $object->media->find($id);
        if (!$media) {
            throw MediaLibraryMediaCannotBeUpdated::doesNotFound($collection, $id);
        }

        $fileManipulator->createDerivedFiles($media->first());
    }

    public function clear(Request $request, $object = null): JsonResponse
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

        // Todo: handle potential errors
        $object->clearMediaCollection($collection);

        if ($object->relationLoaded('media')) {
            unset($this->media);
        }

        return $this->success('Cleared', [
            'collection' => $collection,
            'files' => MediaResource::collection($object->getMedia($collection)),
        ]);
    }

    public function sort(Request $request, $object = null): JsonResponse
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
        $sources = $request->get('sources');

        // Reference: https://github.com/laravel/ideas/issues/575
        $table = Media::getModel()->getTable();
        $cases = [];
        $ids = [];
        $params = [];

        foreach ($sources as $id => $value) {
            $id = (int) $id;
            $cases[] = "WHEN {$id} then ?";
            $params[] = $value;
            $ids[] = $id;
        }

        $ids = implode(',', $ids);
        $cases = implode(' ', $cases);
        $params[] = Carbon::now();
        $params[] = $collection;

        \DB::update("UPDATE `{$table}` SET `order_column` = CASE `id` {$cases} END, `updated_at` = ? WHERE `id` in ({$ids}) AND `collection_name` = ?", $params);

        unset($object->media);
        $media = $object->getMedia($collection);

        return $this->success('Sorted', [
            'files' => MediaResource::collection($media),
        ]);
    }

    /**
     * Get media library file manipulator
     *
     * @return FileManipulator mixed
     */
    public function getFileManipulator(): FileManipulator
    {
        if (!$this->fileManipulator) {
            $this->fileManipulator = new FileManipulator();
        }

        return $this->fileManipulator;
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
