const sqlite3 = require('sqlite3').verbose();

let db;

exports.initialize = function (callback) {
  db = new sqlite3.Database('./scripts/csvs.db', err => {
    if (err) {
      console.error(err.message);
      callback(err);
      return;
    }
    callback();
  });
};

exports.close = function () {
  db.close();
};

exports.getOperator = function (operatorName, callback) {
  const query = "SELECT * FROM csvs WHERE name=?"
  db.all(query, [operatorName], (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(err);
      return;
    }
    callback(rows);
  })
};

exports.getOperators = function (callback) {
  const query = "SELECT * FROM csvs"
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(err);
      return;
    }
    callback(rows);
  })
};

exports.clearOperators = function (callback) {
};

exports.addOperators = function (operators, callback) {
};
