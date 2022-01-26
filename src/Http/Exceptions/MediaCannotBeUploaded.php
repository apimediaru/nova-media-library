<?php

namespace APIMedia\NovaMediaLibrary\Http\Exceptions;

use Exception;


class MediaCannotBeUploaded extends Exception
{
    public static function alreadyExists(string $collection, string $filename): self
    {
        return new static(__("File named \":filename\" already exists in \":collection\" collection", compact('collection', 'filename')));
    }

    public static function reachedLimitOfFiles(string $collection, int $count): self
    {
        return new static(__("Collection named \":collection\" reached it's limit of media files (Maximum possible: :count)", compact('collection', 'count')));
    }
}
