<?php

namespace APIMedia\NovaMediaLibrary\Support\Traits;


use Spatie\MediaLibrary\MediaCollections\Exceptions\InvalidConversion;

trait HandlesConversionsTrait
{
    public function getConversionUrls(\Spatie\MediaLibrary\MediaCollections\Models\Media $media): array
    {
        $conversions = [];

        try {
            $thumbnail = $media->getFullUrl('thumbnail');
        } catch (InvalidConversion $exception) {
            $thumbnail = $media->originalUrl;
        }

        $conversions['thumbnail'] = $thumbnail;

        return $conversions;
    }
}
