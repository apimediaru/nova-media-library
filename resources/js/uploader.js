import MediaLibraryUploader from "./components/MediaLibraryUploader";

export const createUploader = (Vue) => {
  const element = document.createElement('div');
  document.body.append(element);
  return new Vue({
    render: (h) => h(MediaLibraryUploader),
  }).$mount(element);
};
