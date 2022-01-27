# Nova Media Library

This [Laravel Nova](https://nova.laravel.com/) package provides frontend UI and field with some useful options over forked and modified for our usage library [spatie\laravel-medialibrary](https://spatie.be/docs/laravel-medialibrary/v9/introduction). Documentation how to use base media library could be found [here](https://spatie.be/docs/laravel-medialibrary/v9/introduction). 

## Installation
Not published yet

## Usage

Step 1: register model collections and conversions
```
use APIMedia\NovaMediaLibrary\Http\Services\MediaLibraryService;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Image\Manipulations;


class ExampleModel extends Model implements HasMedia
{
    use InteractsWithMedia;
    
    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('gallery');
    }

    /**
     * Register media conversions
     * 
     * @throws \Spatie\Image\Exceptions\InvalidManipulation
     */
    public function registerMediaConversions(Media $media = null): void
    {
        // Adds 'thumbnail' conversions attached to all collections
        MediaLibraryService::addLibraryConversions($this);

        $this->addMediaConversion('thumb')
            ->fit(Manipulations::FIT_CROP, 150, 150)
            ->performOnCollections('gallery');

        $this->addMediaConversion('medium')
            ->fit(Manipulations::FIT_MAX, 720, 720)
            ->performOnCollections('gallery');

        $this->addMediaConversion('large')
            ->fit(Manipulations::FIT_MAX, 1920, 1920)
            ->performOnCollections('gallery');
    }
}
```

Step 2: add nova field. Collection key resolves as nova default field attribute, so you can omit the second argument for `make` method.

```
use Laravel\Nova\Http\Requests\NovaRequest;


class ExampleResource extends Resource {
    /**
     * Get the fields displayed by the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function fields(Request $request)
    {
        return [
            // ... 
            MediaField::make(__('gallery'), 'gallery'),
        ];
    }
}
```

### Limit media files count

```
public function fields(Request $request)
    {
        return [
            // ... 
            MediaField::make(__('gallery'), 'gallery')
                ->limit(10),
        ];
    }
```

### Disable / enable checking duplicates for certain collection

```
public function fields(Request $request)
    {
        return [
            // ... 
            MediaField::make(__('gallery'), 'gallery')
                ->checkDuplicates(false),
        ];
    }
```


## Nova component  

- Drag-and-drop single or multiple files to upload
- Press `ctrl+A` to toggle all files selection
- Click thumbnail with `ctrl`, `shift` or `ctrl+shift` modifier to select multiple media files just like in default File Explorer
- Use context menu clicking by thumbnail to perform multiple actions
- Change display order by dragging single or multiple files
