const $ = require('jquery');
const Config = require('./config.js');
const db = require('./db.js');
let items;

class Items {
  constructor() {
    this.tableName = 'items';
    this.returnItems = returnItems;

    function returnItems(state) {
      return state.items;
    }
  }

  getAll() {
    return db.getState().then(this.returnItems);
  }

  add(item) {
    return db.add(this.tableName, item).then(this.returnItems);
  }

  removeAll() {
    return db.removeAll(this.tableName).then(this.returnItems);
  }
}

module.exports = function() {
  if (!items) {
    items = new Items();
  }
  return items;
};