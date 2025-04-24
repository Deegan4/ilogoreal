"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Briefcase,
  Coffee,
  Compass,
  Cpu,
  Flower2,
  Gem,
  Leaf,
  Layers,
  Mountain,
  Palette,
  ShoppingBag,
  Sparkles,
  Triangle,
  Waves,
} from "lucide-react"

export interface LogoCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

// Define all available logo categories
export const LOGO_CATEGORIES: LogoCategory[] = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, simple designs with minimal elements",
    icon: <Layers size={16} />,
    color:
      "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
  },
  {
    id: "abstract",
    name: "Abstract",
    description: "Non-representational designs with shapes and colors",
    icon: <Waves size={16} />,
    color:
      "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-800",
  },
  {
    id: "geometric",
    name: "Geometric",
    description: "Designs based on geometric shapes and patterns",
    icon: <Triangle size={16} />,
    color: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Designs inspired by natural elements",
    icon: <Leaf size={16} />,
    color:
      "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800",
  },
  {
    id: "tech",
    name: "Technology",
    description: "Modern designs for tech companies and startups",
    icon: <Cpu size={16} />,
    color: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100 hover:bg-cyan-200 dark:hover:bg-cyan-800",
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Elegant, premium designs for high-end brands",
    icon: <Gem size={16} />,
    color:
      "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Artistic and imaginative designs",
    icon: <Palette size={16} />,
    color: "bg-pink-100 text-pink-900 dark:bg-pink-900 dark:text-pink-100 hover:bg-pink-200 dark:hover:bg-pink-800",
  },
  {
    id: "business",
    name: "Business",
    description: "Professional designs for corporate use",
    icon: <Briefcase size={16} />,
    color:
      "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800",
  },
  {
    id: "food",
    name: "Food & Beverage",
    description: "Designs for restaurants, cafes, and food brands",
    icon: <Coffee size={16} />,
    color:
      "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100 hover:bg-orange-200 dark:hover:bg-orange-800",
  },
  {
    id: "retail",
    name: "Retail",
    description: "Designs for shops and retail businesses",
    icon: <ShoppingBag size={16} />,
    color: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800",
  },
  {
    id: "travel",
    name: "Travel",
    description: "Designs for travel agencies and tourism",
    icon: <Compass size={16} />,
    color: "bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-100 hover:bg-teal-200 dark:hover:bg-teal-800",
  },
  {
    id: "outdoor",
    name: "Outdoor",
    description: "Designs for outdoor and adventure brands",
    icon: <Mountain size={16} />,
    color:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-800",
  },
  {
    id: "floral",
    name: "Floral",
    description: "Designs featuring flowers and botanical elements",
    icon: <Flower2 size={16} />,
    color: "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100 hover:bg-rose-200 dark:hover:bg-rose-800",
  },
  {
    id: "magical",
    name: "Magical",
    description: "Whimsical and fantasy-inspired designs",
    icon: <Sparkles size={16} />,
    color:
      "bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100 hover:bg-violet-200 dark:hover:bg-violet-800",
  },
]

// Get a category by ID
export function getCategoryById(id: string): LogoCategory | undefined {
  return LOGO_CATEGORIES.find((category) => category.id === id)
}

// Get multiple categories by IDs
export function getCategoriesByIds(ids: string[]): LogoCategory[] {
  return LOGO_CATEGORIES.filter((category) => ids.includes(category.id))
}

// Suggest categories based on prompt text
export function suggestCategoriesFromPrompt(prompt: string): string[] {
  const lowercasePrompt = prompt.toLowerCase()
  const suggestedCategories: string[] = []

  // Map of keywords to category IDs
  const keywordMap: Record<string, string[]> = {
    minimalist: ["minimal", "simple", "clean", "modern", "sleek"],
    abstract: ["abstract", "fluid", "flowing", "non-representational", "artistic"],
    geometric: ["geometric", "shape", "circle", "square", "triangle", "polygon", "symmetrical"],
    nature: ["nature", "tree", "leaf", "plant", "flower", "organic", "natural", "mountain", "water"],
    tech: ["tech", "digital", "circuit", "computer", "software", "app", "startup", "innovation"],
    luxury: ["luxury", "premium", "elegant", "gold", "silver", "high-end", "exclusive", "sophisticated"],
    creative: ["creative", "art", "artistic", "colorful", "vibrant", "imaginative", "expressive"],
    business: ["business", "corporate", "professional", "company", "firm", "enterprise", "office"],
    food: ["food", "restaurant", "cafe", "coffee", "bakery", "cuisine", "chef", "kitchen", "drink", "beverage"],
    retail: ["retail", "shop", "store", "boutique", "market", "mall", "shopping", "commerce"],
    travel: ["travel", "tourism", "vacation", "holiday", "adventure", "journey", "destination", "tour"],
    outdoor: ["outdoor", "adventure", "mountain", "hiking", "camping", "wilderness", "nature", "exploration"],
    floral: ["floral", "flower", "botanical", "bloom", "petal", "garden", "rose", "tulip", "lily"],
    magical: ["magical", "fantasy", "whimsical", "mystical", "enchanted", "fairy", "magic", "dream", "wonder"],
  }

  // Check for keywords in the prompt
  Object.entries(keywordMap).forEach(([categoryId, keywords]) => {
    if (keywords.some((keyword) => lowercasePrompt.includes(keyword))) {
      suggestedCategories.push(categoryId)
    }
  })

  // If no categories were matched, suggest some default ones
  if (suggestedCategories.length === 0) {
    return ["minimalist", "creative"]
  }

  return suggestedCategories
}

interface CategoryBadgeProps {
  category: LogoCategory
  onClick?: () => void
  selected?: boolean
  className?: string
}

export function CategoryBadge({ category, onClick, selected, className }: CategoryBadgeProps) {
  return (
    <Badge
      className={cn(
        "flex items-center gap-1 cursor-pointer transition-all",
        category.color,
        selected && "ring-2 ring-primary ring-offset-1",
        className,
      )}
      onClick={onClick}
    >
      {category.icon}
      <span>{category.name}</span>
    </Badge>
  )
}

interface CategorySelectorProps {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  className?: string
  suggestedCategories?: string[]
}

export function CategorySelector({
  selectedCategories,
  onChange,
  className,
  suggestedCategories = [],
}: CategorySelectorProps) {
  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter((id) => id !== categoryId))
    } else {
      onChange([...selectedCategories, categoryId])
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {LOGO_CATEGORIES.map((category) => (
          <CategoryBadge
            key={category.id}
            category={category}
            selected={selectedCategories.includes(category.id)}
            onClick={() => handleToggleCategory(category.id)}
          />
        ))}
      </div>

      {suggestedCategories.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-1">Suggested categories:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedCategories.map((categoryId) => {
              const category = getCategoryById(categoryId)
              if (!category) return null
              return (
                <CategoryBadge
                  key={category.id}
                  category={category}
                  selected={selectedCategories.includes(category.id)}
                  onClick={() => handleToggleCategory(category.id)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
