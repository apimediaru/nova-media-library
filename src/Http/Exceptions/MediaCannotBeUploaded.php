<?php

namespace APIMedia\NovaMediaLibrary\Http\Exceptions;

use Exception;


class MediaCannotBeUploaded extends Exception
{
    public static function alreadyExists(string $collection, string $filename): self
    {
        return new static(__("File named \":filename\" already exists in \":collection\" collection", compact('collection', 'filename')));
    }
}
