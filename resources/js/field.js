import IndexField from "./components/Fields/IndexField";
import DetailField from "./components/Fields/DetailField";
import FormField from "./components/Fields/FormField";

Nova.booting((Vue, router, store) => {
  Vue.component('index-nova-media-library', IndexField);
  Vue.component('detail-nova-media-library', DetailField);
  Vue.component('form-nova-media-library', FormField);
});
