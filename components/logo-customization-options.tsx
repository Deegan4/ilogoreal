"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-custom"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings, ChevronDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface LogoCustomizationOptions {
  style: string
  colorScheme: string
  complexity: string
  industry: string
}

interface LogoCustomizationProps {
  options: LogoCustomizationOptions
  onChange: (options: LogoCustomizationOptions) => void
  disabled?: boolean
}

export function LogoCustomizationOptions({ options, onChange, disabled = false }: LogoCustomizationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStyleChange = (value: string) => {
    onChange({ ...options, style: value })
  }

  const handleColorSchemeChange = (value: string) => {
    onChange({ ...options, colorScheme: value })
  }

  const handleComplexityChange = (value: string) => {
    onChange({ ...options, complexity: value })
  }

  const handleIndustryChange = (value: string) => {
    onChange({ ...options, industry: value })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2" disabled={disabled}>
          <Settings className="h-4 w-4" />
          <span>Customization Options</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Tabs defaultValue="style">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Logo Style</Label>
              <RadioGroup value={options.style} onValueChange={handleStyleChange} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimalist" id="style-minimalist" />
                  <Label htmlFor="style-minimalist">Minimalist</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="geometric" id="style-geometric" />
                  <Label htmlFor="style-geometric">Geometric</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="abstract" id="style-abstract" />
                  <Label htmlFor="style-abstract">Abstract</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3D" id="style-3d" />
                  <Label htmlFor="style-3d">3D</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flat" id="style-flat" />
                  <Label htmlFor="style-flat">Flat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vintage" id="style-vintage" />
                  <Label htmlFor="style-vintage">Vintage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hand-drawn" id="style-hand-drawn" />
                  <Label htmlFor="style-hand-drawn">Hand-drawn</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="futuristic" id="style-futuristic" />
                  <Label htmlFor="style-futuristic">Futuristic</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Industry Focus</Label>
              <RadioGroup
                value={options.industry}
                onValueChange={handleIndustryChange}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="industry-any" />
                  <Label htmlFor="industry-any">Any</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technology" id="industry-tech" />
                  <Label htmlFor="industry-tech">Technology</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="finance" id="industry-finance" />
                  <Label htmlFor="industry-finance">Finance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="health" id="industry-health" />
                  <Label htmlFor="industry-health">Healthcare</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="food" id="industry-food" />
                  <Label htmlFor="industry-food">Food</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creative" id="industry-creative" />
                  <Label htmlFor="industry-creative">Creative</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <RadioGroup
                value={options.colorScheme}
                onValueChange={handleColorSchemeChange}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="color-any" />
                  <Label htmlFor="color-any">Any</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monochrome" id="color-monochrome" />
                  <Label htmlFor="color-monochrome">Monochrome</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vibrant" id="color-vibrant" />
                  <Label htmlFor="color-vibrant">Vibrant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pastel" id="color-pastel" />
                  <Label htmlFor="color-pastel">Pastel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blue and purple" id="color-blue-purple" />
                  <Label htmlFor="color-blue-purple">Blue/Purple</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="green and teal" id="color-green-teal" />
                  <Label htmlFor="color-green-teal">Green/Teal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="red and orange" id="color-red-orange" />
                  <Label htmlFor="color-red-orange">Red/Orange</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black and gold" id="color-black-gold" />
                  <Label htmlFor="color-black-gold">Black/Gold</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label>Complexity</Label>
              <RadioGroup
                value={options.complexity}
                onValueChange={handleComplexityChange}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="complexity-simple" />
                  <Label htmlFor="complexity-simple">Simple</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="complexity-moderate" />
                  <Label htmlFor="complexity-moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="complexity-detailed" />
                  <Label htmlFor="complexity-detailed">Detailed</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
