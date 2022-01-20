<?php

namespace APIMedia\NovaMediaLibrary\Http\Requests;

class MediaSortRequest extends MediaRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'sources' => ['required', 'array'],
        ]);
    }
}
