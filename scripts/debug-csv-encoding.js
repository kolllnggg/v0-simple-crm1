// Script to analyze the CSV file encoding and content
async function analyzeCsvEncoding() {
  const csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/filtrados-psicologos-fWXTwtTj6JV5gqOjBpQ7eJNaaNjt5s.csv"

  try {
    console.log("[v0] Fetching CSV file...")
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get as ArrayBuffer to analyze raw bytes
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    console.log("[v0] File size:", uint8Array.length, "bytes")
    console.log(
      "[v0] First 20 bytes:",
      Array.from(uint8Array.slice(0, 20))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" "),
    )

    // Check for BOM
    if (uint8Array.length >= 3 && uint8Array[0] === 0xef && uint8Array[1] === 0xbb && uint8Array[2] === 0xbf) {
      console.log("[v0] UTF-8 BOM detected")
    } else if (uint8Array.length >= 2 && uint8Array[0] === 0xff && uint8Array[1] === 0xfe) {
      console.log("[v0] UTF-16 LE BOM detected")
    } else if (uint8Array.length >= 2 && uint8Array[0] === 0xfe && uint8Array[1] === 0xff) {
      console.log("[v0] UTF-16 BE BOM detected")
    } else {
      console.log("[v0] No BOM detected")
    }

    // Try different decodings
    const encodings = ["utf-8", "iso-8859-1", "windows-1252"]

    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding)
        const text = decoder.decode(uint8Array)
        const lines = text.split("\n").slice(0, 3) // First 3 lines

        console.log(`[v0] === ${encoding.toUpperCase()} ===`)
        lines.forEach((line, i) => {
          console.log(`[v0] Line ${i + 1}:`, line.substring(0, 100))
        })
        console.log("[v0] ---")
      } catch (e) {
        console.log(`[v0] ${encoding} failed:`, e.message)
      }
    }

    // Try as text directly
    const textResponse = await fetch(csvUrl)
    const directText = await textResponse.text()
    console.log("[v0] Direct text (first 200 chars):", directText.substring(0, 200))
  } catch (error) {
    console.error("[v0] Error analyzing CSV:", error)
  }
}

analyzeCsvEncoding()
