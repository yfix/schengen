const createStorage = prefix => ({
  /**
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    localStorage.setItem(`${prefix}/${key}`, JSON.stringify(value));
  },
  
  /**
   * @param {string} key
   * @param {function | any} defaultValue 
   */
  get(key, defaultValue) {
    if (localStorage.hasOwnProperty(`${prefix}/${key}`))
      return JSON.parse(localStorage.getItem(`${prefix}/${key}`))
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  }
});

export default createStorage;