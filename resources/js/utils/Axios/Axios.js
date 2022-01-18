import Axios from 'axios';

const instance = Axios.create();

instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
instance.defaults.headers.common['Content-Type'] = 'multipart/form-data';
instance.defaults.headers.common['X-CSRF-TOKEN'] = document.head.querySelector(
  'meta[name="csrf-token"]',
).content;

export default instance;
