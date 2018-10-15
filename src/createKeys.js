const fs = require('fs')
require('dotenv').config()

const awsKey = JSON.parse(fs.readFileSync(`keys/aws_key.sample.json`, 'utf-8'))
const googleKey = JSON.parse(fs.readFileSync(`keys/client_secret.sample.json`, 'utf-8'))

awsKey.accessKeyId = process.env.AWS_ACCESS_KEY_ID
awsKey.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

googleKey.installed.client_id = process.env.GOOGLE_CLIENT_ID
googleKey.installed.project_id = process.env.GOOGLE_PROJECT_ID
googleKey.installed.client_secret = process.env.GOOGLE_CLIENT_SECRET

fs.writeFileSync('keys/aws_key.json', JSON.stringify(awsKey))
fs.writeFileSync('keys/client_secret.json', JSON.stringify(googleKey))


if (!fs.existsSync('.credentials')) {
    fs.mkdirSync('.credentials')
}
fs.writeFileSync('.credentials/googleapis.json', process.env.GOOGLE_API_CREDENTIAL)
