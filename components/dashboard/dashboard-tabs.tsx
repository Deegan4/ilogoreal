"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogoGallery } from "./logo-gallery"
import { CollectionsList } from "./collections-list"
import { GenerationHistory } from "./generation-history"
import type { Database } from "@/lib/database.types"

type Logo = Database["public"]["Tables"]["logos"]["Row"]
type Collection = Database["public"]["Tables"]["logo_collections"]["Row"]
type GenerationHistoryItem = Database["public"]["Tables"]["logo_generation_history"]["Row"]

interface DashboardTabsProps {
  logos: Logo[]
  collections: Collection[]
  generationHistory: GenerationHistoryItem[]
}

export function DashboardTabs({ logos, collections, generationHistory }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("logos")

  return (
    <Tabs defaultValue="logos" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="logos">My Logos</TabsTrigger>
        <TabsTrigger value="collections">Collections</TabsTrigger>
        <TabsTrigger value="history">Generation History</TabsTrigger>
      </TabsList>

      <TabsContent value="logos" className="space-y-6">
        <LogoGallery initialLogos={logos} />
      </TabsContent>

      <TabsContent value="collections" className="space-y-6">
        <CollectionsList initialCollections={collections} />
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <GenerationHistory initialHistory={generationHistory} />
      </TabsContent>
    </Tabs>
  )
}
