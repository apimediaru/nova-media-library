import Axios from 'axios';

const instance = Axios.create();

instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
instance.defaults.headers.common['Content-Type'] = 'multipart/form-data';
instance.defaults.headers.common['X-CSRF-TOKEN'] = document.head.querySelector(
  'meta[name="csrf-token"]',
).content;

instance.interceptors.response.use(
  (response) => {
    const { errors } = response.data;

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

    // Show the user a 500 error
    if (status >= 500) {
      Nova.$emit('error', error.response.data.message);
    }
    // Handle Token Timeouts
    if (status === 419) {
      Nova.$emit('token-expired');
    }

    return Promise.reject(error);
  },
)

export default instance;
