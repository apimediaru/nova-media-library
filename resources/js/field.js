import IndexField from "./components/IndexField";
import DetailField from "./components/DetailField";
import FormField from "./components/FormField";
import { createUploader } from "./uploader";

Nova.booting((Vue, router, store) => {
  Vue.component('index-nova-media-library', IndexField);
  Vue.component('detail-nova-media-library', DetailField);
  Vue.component('form-nova-media-library', FormField);
  createUploader(Vue);
});
