// Script to analyze the CSV structure and fix parsing issues
async function analyzePsychologistsCSV() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/filtrados-psicologos-fWXTwtTj6JV5gqOjBpQ7eJNaaNjt5s.csv",
    )
    const csvText = await response.text()

    console.log("CSV Content (first 500 chars):")
    console.log(csvText.substring(0, 500))

    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log("\nTotal lines:", lines.length)

    // Check first few lines
    console.log("\nFirst 5 lines:")
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      console.log(`Line ${i}:`, lines[i])
    }

    // Detect separator
    const firstLine = lines[0]
    const commaCount = (firstLine.match(/,/g) || []).length
    const tabCount = (firstLine.match(/\t/g) || []).length
    const semicolonCount = (firstLine.match(/;/g) || []).length

    console.log("\nSeparator analysis:")
    console.log("Commas:", commaCount)
    console.log("Tabs:", tabCount)
    console.log("Semicolons:", semicolonCount)

    // Try parsing with different separators
    const separators = [",", "\t", ";"]
    separators.forEach((sep) => {
      console.log(`\nTrying separator "${sep === "\t" ? "TAB" : sep}":`)
      const parts = firstLine.split(sep)
      console.log("Parts count:", parts.length)
      console.log(
        "Parts:",
        parts.map((p) => p.trim().replace(/"/g, "")),
      )
    })
  } catch (error) {
    console.error("Error analyzing CSV:", error)
  }
}

analyzePsychologistsCSV()
