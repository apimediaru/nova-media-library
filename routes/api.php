<?php

use Illuminate\Support\Facades\Route;
use APIMedia\NovaMediaLibrary\Http\Controllers\MediaController;

Route::post('/upload', [MediaController::class, 'upload']);
