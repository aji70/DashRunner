// Prevent wallet extensions from interfering with THREE.js
if (typeof window !== 'undefined') {
  // Protect defineProperties from being overridden
  const originalDefineProperties = Object.defineProperties;
  Object.defineProperties = function(obj, props) {
    try {
      return originalDefineProperties.call(Object, obj, props);
    } catch (e) {
      // Silently ignore extension errors
      console.debug('Extension override blocked:', e.message);
      return obj;
    }
  };

  // Prevent window contamination
  const handler = {
    set: function(target, property, value) {
      if (property === 'StacksProvider' || property === '__ETHERS_EXTENSION__') {
        console.debug('Extension injection blocked:', property);
        return true;
      }
      return Reflect.set(target, property, value);
    }
  };

  // This helps but doesn't fully prevent extensions
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.type && event.data.type.includes('extension')) {
      event.stopPropagation();
    }
  }, true);
}
