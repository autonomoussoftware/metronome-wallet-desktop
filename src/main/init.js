const { app } = require("electron")

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

const { createWindow } = require('./mainWindow')

createWindow()

const { initMainWorker } = require('./mainWorker')

app.on('ready', function () {
  initMainWorker()
})
