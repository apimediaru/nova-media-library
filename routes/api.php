<?php

use Illuminate\Support\Facades\Route;
use APIMedia\NovaMediaLibrary\Http\Controllers\MediaController;

Route::post('/upload', [MediaController::class, 'upload']);
Route::post('/multiple', [MediaController::class, 'multiple']);
Route::post('/sort', [MediaController::class, 'sort']);
Route::post('/clear', [MediaController::class, 'clear']);
