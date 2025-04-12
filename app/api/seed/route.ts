import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Substance from "@/models/substance"
import { substancePoints } from "@/lib/substance-points"
import { isAdmin } from "@/lib/auth-utils"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const key = url.searchParams.get("key")

    // Ensure this endpoint can only be called with a secret key or by an admin
    if (key !== process.env.SEED_KEY && !(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Clear existing substances
    await Substance.deleteMany({})

    // Create categories mapping
    const categories = {
      Snus: "Tobacco",
      Sigaretta: "Tobacco",
      Cannabis: "Drugs",
      "Cerotto alla nicotina": "Tobacco",
      "Birra 3dl": "Alcohol",
      "Birra 5dl": "Alcohol",
      "Birra analcolica": "Alcohol",
      "Bicchiere di vino": "Alcohol",
      Cocktail: "Alcohol",
      Shot: "Alcohol",
      "Fast food": "Food",
      LSD: "Drugs",
      "Droghe pesanti": "Drugs",
      "Clean sheet": "Other",
    }

    // Insert substances with their points
    const substances = Object.entries(substancePoints).map(([name, points]) => ({
      name,
      points,
      category: categories[name as keyof typeof categories] || "Other",
      description: getSubstanceDescription(name),
    }))

    await Substance.insertMany(substances)

    return NextResponse.json({
      message: "Database seeded successfully",
      substancesCreated: substances.length,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ message: "Error seeding database" }, { status: 500 })
  }
}

function getSubstanceDescription(name: string): string {
  const descriptions: Record<string, string> = {
    Snus: "Una porzione di snus",
    Sigaretta: "Una sigaretta",
    Cannabis: "Una canna",
    "Cerotto alla nicotina": "Un cerotto alla nicotina",
    "Birra 3dl": "Una birra da 3dl",
    "Birra 5dl": "Una birra da 5dl",
    "Birra analcolica": "Una birra analcolica in qualsiasi formato",
    "Bicchiere di vino": "Un bicchiere di vino",
    Cocktail: "Un cocktail (Spritz, Negroni, Gin Tonic, ecc.)",
    Shot: "Uno shot (Tequila, Jäger, Sambuca, ecc.)",
    "Fast food": "Un pasto da fast food (McDonald's, Burger King, KFC...)",
    LSD: "Un uso di LSD",
    "Droghe pesanti": "Uso di droghe pesanti (Cocaina, ecc.)",
    "Clean sheet": "Nessuna sostanza in un giorno",
  }

  return descriptions[name] || ""
}
