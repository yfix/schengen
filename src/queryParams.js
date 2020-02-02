const queryString = window.location.search.slice(1);

const toObj = str => ({ [str.split('=')[0]]: str.split('=')[1] });

/** @type {{ [key: string]: any }} */
const query = queryString
  ? queryString.split('&').reduce((params, param) => Object.assign(params, toObj(param)), {})
  : {};

export default query;