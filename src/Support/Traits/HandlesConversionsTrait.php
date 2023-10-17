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

        foreach ($media->getGeneratedConversions() as $conversionName => $isGenerated) {
            if ($isGenerated) {
                $conversions[$conversionName] = $media->getFullUrl($conversionName);
            }
        }

        $conversions['thumbnail'] = $thumbnail;

        return $conversions;
    }
}
