/**
 * Image service utility for handling responsive images
 */

// Define standard image sizes for different breakpoints
export const imageSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

// Define quality levels
export const imageQualities = {
  low: 60,
  medium: 80,
  high: 90,
}

/**
 * Generate image URL with width parameter
 * This works with image optimization services like Vercel's Image Optimization
 */
export function getImageUrl(src: string, width: number, quality: number = imageQualities.medium): string {
  // If it's already a placeholder URL, add width and quality
  if (src.includes("placeholder.svg")) {
    // Add width parameter if not already present
    const url = new URL(src, window.location.origin)
    if (!url.searchParams.has("width")) {
      url.searchParams.set("width", width.toString())
    }
    return url.toString()
  }

  // For SVGs, return as is
  if (src.endsWith(".svg")) {
    return src
  }

  // For Vercel Blob URLs, we can use the Vercel Image Optimization API
  if (src.includes("vercel-storage.com")) {
    // Extract the blob ID from the URL
    const blobId = src.split("/").pop()
    return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
  }

  // For other URLs, return as is (can't transform external URLs)
  return src
}

/**
 * Generate srcset string for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
  quality: number = imageQualities.medium,
): string {
  return widths.map((width) => `${getImageUrl(src, width, quality)} ${width}w`).join(", ")
}

/**
 * Generate sizes attribute based on responsive design needs
 */
export function generateSizes(sizes: { [breakpoint: string]: string } = {}): string {
  const defaultSizes = {
    sm: "100vw",
    md: "50vw",
    lg: "33vw",
    xl: "25vw",
    "2xl": "20vw",
  }

  const mergedSizes = { ...defaultSizes, ...sizes }

  return Object.entries(mergedSizes)
    .map(([breakpoint, size]) => {
      if (breakpoint === "sm") {
        return `(max-width: ${imageSizes.sm}px) ${size}`
      }
      if (breakpoint === "md") {
        return `(max-width: ${imageSizes.md}px) ${size}`
      }
      if (breakpoint === "lg") {
        return `(max-width: ${imageSizes.lg}px) ${size}`
      }
      if (breakpoint === "xl") {
        return `(max-width: ${imageSizes.xl}px) ${size}`
      }
      if (breakpoint === "2xl") {
        return `(min-width: ${imageSizes["2xl"]}px) ${size}`
      }
      return size
    })
    .join(", ")
}
