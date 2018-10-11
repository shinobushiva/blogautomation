const AWS = require('aws-sdk')
const fs  = require('fs')
const uuid = require('uuid')
const filetype = require('file-type')
const path = require('path')

function upload(cdir, src) {
    const bucket = "https://s3-ap-northeast-1.amazonaws.com/sitateru-tech-blog"
    AWS.config.loadFromPath('keys/aws_key.json')
    AWS.config.update({region: 'ap-northeast-1'})

    if (!fs.existsSync(`${cdir}/${src}`)){
        return src
    }
    
    const v = fs.readFileSync(`${cdir}/${src}`)
    const filename = path.basename(src)
    const {ext2, mime} = filetype(v)

    const { root, dir, base, ext, name} = path.parse(src)

    const fn = "" + uuid.v4().replace(/-/g,'_')
    const dest = `${dir}/${fn}${ext}`

    const s3 = new AWS.S3()
    const params = {
        Bucket: "sitateru-tech-blog",
        Key: dest,
        ContentType: mime
    }

    params.Body=v
    s3.putObject(params, function(err, data) {
      if (err) console.log(err, err.stack)
      else     console.log(data)
    })
    return `${bucket}/${dest}`
}

exports.upload = upload
