<?php

namespace APIMedia\NovaMediaLibrary;

use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Events\ServingNova;
use Laravel\Nova\Nova;
use Illuminate\Support\Facades\Route;
use APIMedia\NovaMediaLibrary\Http\Services\MediaLibraryService;


class FieldServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Register routes
        $this->app->booted(function () {
            $this->routes();
        });

        Nova::serving(function (ServingNova $event) {
            Nova::script('nova-media-library', __DIR__.'/../dist/js/field.js');
            Nova::style('nova-media-library', __DIR__.'/../dist/css/field.css');
        });

        $this->registerTranslations();

        // Publish public assets
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/nova-media-library'),
        ], 'nova-media-library-assets');

        // Publish config
        $this->publishes([
            __DIR__.'/../config/nova-media-library.php' => config_path('nova-media-library.php')
        ], 'nova-media-library-config');

        // Publish translations
        $this->publishes([
            __DIR__.'/../resources/lang' => lang_path('vendor/nova-media-library')
        ], 'nova-media-library-lang');
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/nova-media-library.php', 'nova-media-library'
        );
    }

    /**
     * Register translations for current locale
     *
     * @return void
     */
    protected function registerTranslations()
    {
        $currentLocale = app()->getLocale();

        Nova::translations(__DIR__.'/../resources/lang'.$currentLocale.'.json');
        Nova::translations(lang_path('vendor/nova-media-library/'.$currentLocale.'.json'));

        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'nova-media-library');
        $this->loadJsonTranslationsFrom(__DIR__.'/../resources/lang');
        $this->loadJsonTranslationsFrom(lang_path('vendor/nova-media-library/'.$currentLocale.'.json'));
    }

    /**
     * Register the card's routes.
     *
     * @return void
     */
    protected function routes()
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        Route::middleware(['nova'])
            ->prefix('nova-vendor/nova-media-library')
            ->group(__DIR__.'/../routes/api.php');
    }
}
