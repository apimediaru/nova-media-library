import Axios from 'axios';

const instance = Axios.create();

instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
instance.defaults.headers.common['Content-Type'] = 'multipart/form-data';
instance.defaults.headers.common['X-CSRF-TOKEN'] = document.head.querySelector(
  'meta[name="csrf-token"]',
).content;

instance.interceptors.response.use(
  (response) => {
    const { errors, message } = response.data;

    // Show error messages
    if (errors) {
      let iterable;
      if (Array.isArray(errors)) {
        iterable = errors;
      } else if (typeof errors === 'object') {
        iterable = Object.values(errors);
      } else {
        iterable = [errors];
      }

      iterable.forEach((error) => {
        Nova.$emit('error', error);
      });
    }

    return response;
  },
  (error) => {
    const { status } = error.response;
    const { message } = error.response.data;

    // Show the user a 500 error
    if (message && (status >= 500 || status === 400)) {
      Nova.$emit('error', message);
    }
    // Handle Token Timeouts
    if (status === 419) {
      Nova.$emit('token-expired');
    }

    return Promise.reject(error);
  },
)

export default instance;
