import { useState } from 'react';
import createStorage from './storage';

const storage = createStorage('schengen');

/**
 * @param {string} key
 * @param {function | any} [defaultValue]
 */
const useStorage = (key, defaultValue) => {
  const [value, set] = useState(storage.get(key, defaultValue));

  const update = newValue => {
    storage.set(key, newValue);
    set(newValue);
  };

  return [value, update];
};

export default useStorage;