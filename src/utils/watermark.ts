/**
 * Composites the UN Women logo as a semi-transparent watermark
 * onto a product image using the Canvas API before upload.
 */
export async function applyWatermark(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const originalUrl = URL.createObjectURL(file)

    const img = new Image()
    img.onload = () => {
      const logo = new Image()
      logo.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Logo: 20% of the shorter side, bottom-right corner with 3% padding
        const shortSide = Math.min(img.width, img.height)
        const logoW = shortSide * 0.2
        const logoH = (logo.naturalHeight / logo.naturalWidth) * logoW
        const pad = shortSide * 0.03
        const x = img.width - logoW - pad
        const y = img.height - logoH - pad

        ctx.globalAlpha = 0.5
        ctx.drawImage(logo, x, y, logoW, logoH)
        ctx.globalAlpha = 1

        URL.revokeObjectURL(originalUrl)

        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Canvas toBlob failed')); return }
            resolve(new File([blob], file.name, { type: blob.type }))
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          0.92
        )
      }
      logo.onerror = () => {
        // If logo fails to load, just upload the original image
        URL.revokeObjectURL(originalUrl)
        resolve(file)
      }
      logo.src = '/unwomenlogo.png'
    }
    img.onerror = () => {
      URL.revokeObjectURL(originalUrl)
      reject(new Error('Failed to read image file'))
    }
    img.src = originalUrl
  })
}
