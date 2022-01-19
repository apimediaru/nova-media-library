<?php

namespace APIMedia\NovaMediaLibrary\Http\Requests;

class MediaUploadRequest extends MediaRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'file' => ['required'],
        ]);
    }
}
