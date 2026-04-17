const prefix = () => new Date().toISOString();

export default {
  info: (...args) => console.log(prefix(), "[info]", ...args),
  warn: (...args) => console.warn(prefix(), "[warn]", ...args),
  error: (...args) => console.error(prefix(), "[err]", ...args),
};
