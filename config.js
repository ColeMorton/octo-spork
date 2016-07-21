module.exports = function Config() {
  let service = {
    isLocal: isLocal,
    getCurrentHash: getCurrentHash
  };

  return service;

  function isLocal() {
    if (window.location.origin === 'file://') {
      return true;
    }
    if (window.location.hostname === 'localhost') {
      return true;
    }
    return false;
  }

  function getCurrentHash() {
    let path = window.location.pathname;
    let startsWith = '/ipfs/';
    if (path.indexOf(startsWith) !== -1) {
      path = path.substr(startsWith.length);
      return path.substr(0, path.length - 1);
    }
    return false;
  }
}