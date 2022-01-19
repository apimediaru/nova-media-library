<?php

namespace APIMedia\NovaMediaLibrary\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use APIMedia\NovaMediaLibrary\Fields\HandlesConversionsTrait;


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
        return array_merge($this->resource->toArray(), [
            '__conversions__' => $this->getConversionUrls($this->resource),
        ]);
    }
}
