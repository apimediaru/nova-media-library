<?php

namespace APIMedia\NovaMediaLibrary\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    /**
     * Returns JSON response
     *
     * @param bool $successful
     * @param string $message
     * @param array $data
     * @param int $statusCode
     *
     * @return JsonResponse
     */
    protected function jsonResponse(bool $successful, string $message, array $data, int $statusCode): JsonResponse
    {
        return response()->json([
            'success' => $successful,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Returns successful JSON response
     *
     * @param string $message
     * @param mixed $data
     * @param int $statusCode
     *
     * @return JsonResponse
     */
    protected function succeed(string $message = '', $data = null, int $statusCode = 200): JsonResponse
    {
        if (is_int($data)) {
            return $this->jsonResponse(true, $message, [], $data);
        }

        return $this->jsonResponse(true, $message, $data ?? [], $statusCode);
    }

    /**
     * Returns erroneous JSON response
     *
     * @param string $message
     * @param mixed $data
     * @param int $statusCode
     *
     * @return JsonResponse
     */
    protected function failure(string $message = '', $data = null, int $statusCode = 400): JsonResponse
    {
        if (is_int($data)) {
            return $this->jsonResponse(false, $message, [], $data);
        }

        return $this->jsonResponse(false, $message, $data ?? [], $statusCode);
    }
}
