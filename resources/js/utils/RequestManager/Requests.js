import { AbstractRequest } from "../shared";

const apiRoutes = {
  multiple: '/nova-vendor/nova-media-library/multiple',
}

export class MediaRequest extends AbstractRequest {

}

export class MultipleMediaRequest extends MediaRequest {
  getRequestUrl() {
    return apiRoutes.multiple;
  }
}
