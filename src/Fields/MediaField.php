<?php

namespace APIMedia\NovaMediaLibrary\Fields;

use APIMedia\NovaMediaLibrary\Http\Resources\MediaResource;
use Laravel\Nova\Fields\Field;


class MediaField extends Field
{
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
     * Check duplicates on file upload
     *
     * @var boolean|null
     */
    protected $checkDuplicates = null;

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
    private function getLimit(): int
    {
        return $this->limit;
    }

    /**
     * Set maximum count of possible uploaded media files
     *
     * @param int $limit
     * @return $this
     */
    public function limit(int $limit): self
    {
        $this->limit = $limit;

        return $this;
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
     * Set check duplicates option for field
     *
     * @param bool $value
     * @return $this
     */
    public function checkDuplicates(bool $value = true): self
    {
        $this->checkDuplicates = $value;

        return $this;
    }

    /**
     * Get resolved check duplicates option
     *
     * @return bool
     */
    protected function getCheckDuplicates(): bool
    {
        if ($this->checkDuplicates === null) {
            return (bool) config('nova-media-library.check_duplicates');
        }

        return (bool) $this->checkDuplicates;
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

        $this->value = MediaResource::collection($this->resource->getMedia($collection));
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
            'checkDuplicates' => $this->getCheckDuplicates(),
        ]);
    }
}
