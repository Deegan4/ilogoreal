"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/dashboard/user-profile"
import { LogoGallery } from "@/components/dashboard/logo-gallery"
import { LogoCollections } from "@/components/dashboard/logo-collections"
import { useMobile } from "@/hooks/use-mobile"

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState("logos")
  const isMobile = useMobile()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      <Tabs defaultValue="logos" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="logos">My Logos</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="logos" className="space-y-6">
          <LogoGallery />
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <LogoCollections />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  )
}
