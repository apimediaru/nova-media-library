<?php

namespace APIMedia\NovaMediaLibrary\Http\Exceptions;

use Exception;


class MediaCannotBeUploaded extends Exception
{
    public static function alreadyExists(string $collection): self
    {
        return new static(__("Media already exists in `{$collection}` collection"));
    }
}
