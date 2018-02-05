/**
 * Constructor function for Deferred objects.
 * @constructor
 */
function Deferred () {
  const obj = this
  obj.promise = new Promise(function (resolve, reject) {
    Object.assign(obj, { resolve, reject })
  })
}

module.exports = Deferred
