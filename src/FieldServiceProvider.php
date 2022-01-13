<?php

namespace APIMedia\NovaMediaLibrary;

use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Events\ServingNova;
use Laravel\Nova\Nova;

class FieldServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Nova::serving(function (ServingNova $event) {
            Nova::script('nova-media-library', __DIR__.'/../dist/js/field.js');
            Nova::style('nova-media-library', __DIR__.'/../dist/css/field.css');
        });

        // Publish public assets
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/nova-media-library'),
        ], 'nova-media-library-assets');
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
