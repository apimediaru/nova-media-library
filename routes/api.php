<?php

use Illuminate\Support\Facades\Route;
use APIMedia\NovaMediaLibrary\Http\Controllers\UploadController;

Route::post('/upload', [UploadController::class, 'index']);
