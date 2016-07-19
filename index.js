const Sync = require('./ipfs.js');

const app = new App();
app.init();

function App() {
  let dataHash;
  let appInfo;
  const sync = new Sync();

  return {
    init: init
  };

  function init() {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        document.getElementById('store').onclick = update;
        document.getElementById('default').onclick = defaultData;
      }
    };

    if (!isLocal()) {
      setAppInfo();
    }

    sync.getDataHash()
      .then(getData)
      .then(onDataRecieved);

    function setAppInfo() {
      appInfo = {
        appHash: getCurrentHash(),
        appLink: 'https://ipfs.io/ipfs/' + getCurrentHash(),
        timestamp: Date.now()
      };
    }
  }

  function getData(hash) {
    dataHash = hash;
    document.getElementById('hash').innerText = dataHash;
    return sync.getData(hash);
  }

  function onDataRecieved(data) {
    if (data.info) {
      console.log('Please edit from here: ', data.info.link);
    }

    document.getElementById('source').innerText = JSON.stringify(data);
    sync.render();
  }

  function isLocal() {
    return getCurrentHash() === false;
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

  function defaultData() {
    document.getElementById('source').innerText = JSON.stringify({ appInfo: [], items: [] });
  }

  function update() {
    let text = document.getElementById('source').value;
    sync.set(text);
  }
}