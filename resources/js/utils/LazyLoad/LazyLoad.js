import LazyLoadConstructor from 'vanilla-lazyload';

export const createLazyLoadInstance = (options = {}) => new LazyLoadConstructor(options);

const LazyLoad = createLazyLoadInstance();

export default LazyLoad;
