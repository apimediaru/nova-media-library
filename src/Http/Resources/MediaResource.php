<?php

namespace APIMedia\NovaMediaLibrary\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use APIMedia\NovaMediaLibrary\Support\Traits\HandlesConversionsTrait;


class MediaResource extends JsonResource
{
    use HandlesConversionsTrait;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $conversions = $this->getConversionUrls($this->resource);

        return array_merge($this->resource->toArray(), [
            '__conversions__' => $conversions,
            'conversions' => $conversions,
        ]);
    }
}
