const path = require('path')
const multer = require('multer')

const destination = path.join(__dirname, '..', process.env.UPLOADFOLDER)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destination)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${String(Math.random()).slice(2, 6)}.file`)
  },
  limits: {
    files: 1,
    fileSize: 20 * 1024 * 1024 // buggy
  }
})

const uploader = () => multer({ storage })

module.exports = uploader
