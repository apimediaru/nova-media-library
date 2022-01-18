<?php

namespace APIMedia\NovaMediaLibrary\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MediaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'object' => ['required'],
            'objectId' => ['required'],
        ];
    }
}
