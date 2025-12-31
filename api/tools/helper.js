import sharp from 'sharp'
import { ValidationError, UniqueConstraintError } from 'sequelize'
/**
 * Helper functions for the API
*/
export const apiResponse = ({ success = false, message = null, data = null, error = null }) => ({
  success,
  message,
  data,
  error
})

/**
 * Optimize an image file and save to output path
*/
export const optimizeImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize({
      width: 1080,
      withoutEnlargement: true
    })
    .jpeg({
      quality: 75,
      mozjpeg: true
    })
    .toFile(outputPath)
}

/**
 * Normalize Sequelize errors into a simple object
*/
export const  normalizeSequelizeError = (err) => {
  if (err instanceof ValidationError) {
    const errors = {}
    for (const e of err.errors) {
      if (!errors[e.path]) errors[e.path] = []
      errors[e.path].push(e.message)
    }
    return errors
  }

  if (err instanceof UniqueConstraintError) {
    const errors = {}
    for (const e of err.errors) {
      if (!errors[e.path]) errors[e.path] = []
      errors[e.path].push(e.message)
    }
    return errors
  }

  return { message: err.message }
}