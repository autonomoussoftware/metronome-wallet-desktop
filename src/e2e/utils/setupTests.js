const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') })

// Give it some time to build the React app, spin up the dev web server, etc
jest.setTimeout(30000)
