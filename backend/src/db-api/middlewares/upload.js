import multer from 'multer'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { placeImgsPath } from '../configs/paths.js'

if (!fs.existsSync(placeImgsPath)) {
    fs.mkdirSync(placeImgsPath)
}


const fileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, placeImgsPath)
    },
    filename: (request, file, callback) => {
        do {
            var newFileName = crypto.randomUUID() + path.extname(file.originalname)
            var fileCompletePath = `${placeImgsPath}/${newFileName}`
        } while (fs.existsSync(fileCompletePath))
        
        request.body.imgPath = fileCompletePath
        callback(null, newFileName)
    }
})

const scriptStorage = multer({storage: fileStorage})
const upload = scriptStorage.fields([{ name: 'placeImg', maxCount: 1}])
export default upload