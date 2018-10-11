const fs = require('fs')
const { google } = require('googleapis')
const { OAuth2Client } = require('google-auth-library')
const _ = require('lodash')
const { join } = require('path')
const marked = require('marked') // markedパッケージを読み込む

const { authExec } = require('./googleAuth') 

// If modifying these scopes, delete your previously saved credentials
const SCOPES = [
  'https://www.googleapis.com/auth/blogger',
  'https://www.googleapis.com/auth/blogger.readonly'
]

authExec('client_secret.json', SCOPES, onAuthorized)

function applyRecursive(dir, meta0, func, QUEUE) {
  
  const meta = fs.existsSync(`${dir}/meta.json`) ? 
    _.merge(meta0, JSON.parse(fs.readFileSync(`${dir}/meta.json`, 'utf-8'))) : meta0    
  if (meta.content_path && fs.existsSync(`${dir}/${meta.content_path}`)) {
    if (!meta.ignore) {
      QUEUE.push(() => {
        return func(meta, dir, `${dir}/${meta.content_path}`)
      })
    }
  }

  const dirs = fs.readdirSync(dir).filter(f => fs.statSync(join(dir, f)).isDirectory())
  dirs.forEach(d => {
    applyRecursive(`${dir}/${d}`, meta, func, QUEUE)
  })
}

function onAuthorized (auth) {
  const QUEUE = []
  const dir = 'posts'
  applyRecursive(dir, {}, (meta, dir, content_path) => {
    return post(meta, dir, content_path, auth)
  }, QUEUE)
  console.log(QUEUE)

  //同時実行するとBloggerがエラーを返すのでシーケンシャルに
  function sequentialExec (queue) {
    if (queue.length > 0) {
      queue.pop()().then((value) => {
        console.log('post success')
        sequentialExec(queue)
      }).catch((error) => {
        console.log(error)
        sequentialExec(queue)
      })
    }
  }
  sequentialExec(QUEUE)
}

function post(meta, dir, content_path, auth) {
  const markdown = fs.readFileSync(content_path, 'utf-8')

  const blogger = google.blogger({ version: 'v3', auth })
  const html = marked(markdown)

  let params = _.merge(meta, {
    resource: {
      content: html
    }
  })

  console.log(meta.resource.title, dir)
  if (fs.existsSync(`${dir}/response.json`)){
    // Update
    const response = JSON.parse(fs.readFileSync(`${dir}/response.json`, 'utf-8'))
    params.postId = response.id
    return blogger.posts.patch(params).then((value) => {
      fs.writeFileSync(`${dir}/response.json`, JSON.stringify(value.data, null , "  "))
      return value
    })
  } else {
    // Post New
    return blogger.posts.insert(params).then((value) => {
      fs.writeFileSync(`${dir}/response.json`, JSON.stringify(value.data, null , "  "))
      return value
    })
  }
}