<?php

namespace APIMedia\NovaMediaLibrary\Http\Exceptions;

use Exception;


class MediaCannotBeUpdated extends Exception
{
    public static function doesNotFound(string $collectionName, int $id): self
    {
        return new static("Media with id {$id} cannot be found in collection `{$collectionName}`");
    }
}
