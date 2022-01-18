<?php

namespace APIMedia\NovaMediaLibrary\Fields;

use Laravel\Nova\Fields\Field;


class MediaField extends Field
{
    use HandlesConversionsTrait;

    /**
     * The field's component.
     *
     * @var string
     */
    public $component = 'nova-media-library';

    /**
     * Media collection identifier. Defaults to attribute name
     *
     * @var string
     */
    protected $collection = null;

    /**
     * Limit uploaded files. Zero means unlimited count
     *
     * @var int
     */
    protected $limit = 0;

    /**
     * Callback for serializing media on response
     *
     * @var callable|null
     */
    protected $serializeMediaCallback;

    public function serializeMediaUsing(callable $serializeMediaUsing): self
    {
        $this->serializeMediaCallback = $serializeMediaUsing;

        return $this;
    }

    public function getClass(): string
    {
        return get_class($this->resource);
    }

    /**
     * Set collection
     *
     * @param string $key
     *
     * @return $this
     */
    public function setCollection(string $key): self
    {
        $this->collection = $key;

        return $this;
    }

    /**
     * Get collection
     *
     * @return string
     */
    public function getCollection(): string
    {
        return $this->collection ?? $this->attribute;
    }

    /**
     * Set limit
     *
     * @param int $limit
     *
     * @return $this
     */
    public function multiple(int $limit = 0): self
    {
        $this->limit = $limit;

        return $this;
    }

    /**
     * Limit uploaded files to single one
     *
     * @return $this
     */
    public function single(): self
    {
        $this->limit = 1;

        return $this;
    }

    /**
     * Get files limit
     *
     * @return int
     */
    public function getLimit(): int
    {
        return $this->limit;
    }

    /**
     * Set the maximum accepted file size for the frontend in kBs
     *
     * @param int $maxSize

     * @return $this
     */
    public function setMaxFileSize(int $maxSize): self
    {
        return $this->withMeta(['maxFileSize' => $maxSize]);
    }

    /**
     * Resolve the field's value.
     *
     * @param  mixed  $resource
     * @param  string|null  $attribute
     *
     * @return void
     */
    public function resolve($resource, $attribute = null)
    {
        $this->resource = $resource;
        $collection = $this->getCollection();

        if ($collection === 'ComputedField') {
            $collection = call_user_func($this->computedCallback, $resource);
        }

        $this->value = $resource->getMedia($collection)
            ->map(function (\Spatie\MediaLibrary\MediaCollections\Models\Media $media) {
                return array_merge($this->serializeMedia($media), ['__conversions__' => $this->getConversionUrls($media)]);
            })->values();
    }

    public function serializeMedia(\Spatie\MediaLibrary\MediaCollections\Models\Media $media): array
    {
        if ($this->serializeMediaCallback) {
            return call_user_func($this->serializeMediaCallback, $media);
        }

        return $media->toArray();
    }

    /**
     * Prepare the field for JSON serialization.
     *
     * @return array
     */
    public function jsonSerialize(): array
    {
        return array_merge(parent::jsonSerialize(), [
            'object' => $this->getClass(),
            'collection' => $this->getCollection(),
            'limit' => $this->getLimit(),
        ]);
    }
}
