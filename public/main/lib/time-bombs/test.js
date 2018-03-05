const timeBombs = require('.')

const start = Date.now()

const bomb1 = timeBombs.create(250)

bomb1.onBoom(function () {
  console.log('Should show ~550ms:', Date.now() - start)
})

setTimeout(function () {
  bomb1.reset(200)
  setTimeout(function () {
    bomb1.reset(200)
  }, 150)
}, 200)

const bomb2 = timeBombs.create(100)

bomb2.onBoom(function () {
  console.log('Should show ~350ms:', Date.now() - start)
})

setTimeout(function () {
  bomb2.reset(300)
}, 50)
