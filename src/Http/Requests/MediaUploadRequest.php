<?php

namespace APIMedia\NovaMediaLibrary\Http\Requests;

class MediaUploadRequest extends MediaRequest
{
    public function rules()
    {
        return [
            'file' => ['required'],
            'object' => ['required'],
            'objectId' => ['required'],
        ];
    }
}
