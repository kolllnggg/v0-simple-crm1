const csvUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/filtrados-plX8imz0Ip0RniiS7JPrWyKvdBtdCs.csv"

async function analyzeCsv() {
  try {
    console.log("[v0] Fetching CSV from:", csvUrl)
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("[v0] CSV length:", csvText.length)
    console.log("[v0] First 500 characters:")
    console.log(csvText.substring(0, 500))

    const lines = csvText.split("\n")
    console.log("[v0] Total lines:", lines.length)
    console.log("[v0] First line (header):", lines[0])
    console.log("[v0] Second line (first data):", lines[1])

    // Check if it's comma or tab separated
    const firstDataLine = lines[1]
    const commaCount = (firstDataLine.match(/,/g) || []).length
    const tabCount = (firstDataLine.match(/\t/g) || []).length

    console.log("[v0] Comma count in first data line:", commaCount)
    console.log("[v0] Tab count in first data line:", tabCount)

    // Parse first few rows to understand structure
    const separator = commaCount > tabCount ? "," : "\t"
    console.log("[v0] Detected separator:", separator === "," ? "comma" : "tab")

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const values = lines[i].split(separator)
      console.log(`[v0] Line ${i}:`, values)
    }
  } catch (error) {
    console.error("[v0] Error fetching CSV:", error)
  }
}

analyzeCsv()
