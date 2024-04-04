const _ = require("lodash");

module.exports = {
  duplicates: (data) => _.filter(data, (val, i, iteratee) => _.includes(iteratee, val, i + 1)),
};
