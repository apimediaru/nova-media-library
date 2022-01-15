<?php

use Illuminate\Support\Facades\Route;
use APIMedia\NovaMediaLibrary\Http\Controllers\UploadController;

Route::put('/upload', [UploadController::class, 'index']);
