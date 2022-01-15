<?php

namespace APIMedia\NovaMediaLibrary;

use Laravel\Nova\Fields\Field;
use ReflectionClass;

class NovaMediaLibrary extends Field
{
    /**
     * The field's component.
     *
     * @var string
     */
    public $component = 'nova-media-library';

    public function jsonSerialize(): array
    {
        return array_merge(parent::jsonSerialize(), [
            'object' => $this->getClass(),
        ]);
    }

    public function getClass(): string
    {
        return get_class($this->resource);
    }
}
