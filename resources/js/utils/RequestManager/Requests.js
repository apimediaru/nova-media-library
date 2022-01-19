import { AbstractRequest } from "../../shared";

const apiRoutes = {
  multiple: '/nova-vendor/nova-media-library/multiple',
  sort: '/nova-vendor/nova-media-library/sort',
}

export class MediaRequest extends AbstractRequest {

}

export class MultipleMediaRequest extends MediaRequest {
  getRequestUrl() {
    return apiRoutes.multiple;
  }
}

export class SortMediaRequest extends MediaRequest {
  getRequestUrl() {
    return apiRoutes.sort;
  }
}
