<?php

namespace APIMedia\NovaMediaLibrary\Http\Requests;

class MediaMultipleRequest extends MediaRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'sources' => ['required', 'array'],
            'method' => ['required'],
        ]);
    }
}
