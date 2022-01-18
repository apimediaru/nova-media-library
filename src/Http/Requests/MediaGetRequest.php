<?php

namespace APIMedia\NovaMediaLibrary\Http\Requests;

class MediaGetRequest extends MediaRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'collection' => ['required'],
        ]);
    }
}
