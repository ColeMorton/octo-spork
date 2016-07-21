const Config = require('./config.js');
const Items = require('./items.js');

const app = new App();
app.init();

function App() {
  const config = new Config();
  const items = new Items();

  return {
    init: init
  };

  function init() {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        document.getElementById('add').onclick = add;
        document.getElementById('default').onclick = defaultData;
      }
    };

    items.getAll().then(onItemsRecieved);
  }

  function onItemsRecieved(items) {
    document.getElementById('source').innerText = JSON.stringify(items);
  }

  function defaultData() {
    items.removeAll().then(onItemsRecieved);
  }

  function add() {
    let item = { 'name' : document.getElementById('name').value };
    items.add(item).then(onItemsRecieved);
  }
}