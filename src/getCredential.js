const fs = require('fs')
const { google } = require('googleapis')
const _ = require('lodash')
const { join } = require('path')
const marked = require('marked') // markedパッケージを読み込む
const { JSDOM } = require("jsdom")

const { authExec } = require('./googleAuth') 
const { upload } = require('./aws')

// If modifying these scopes, delete your previously saved credentials
const SCOPES = [
  'https://www.googleapis.com/auth/blogger',
  'https://www.googleapis.com/auth/blogger.readonly'
]

authExec('keys/client_secret.json', SCOPES, onAuthorized)

function onAuthorized (auth) {
  console.log('credential saved at .credentials/googleapi.json')
}
