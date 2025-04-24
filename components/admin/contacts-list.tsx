"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Mail, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/lib/database.types"

type Contact = Database["public"]["Tables"]["contacts"]["Row"]

interface ContactsListProps {
  initialContacts: Contact[]
}

export function ContactsList({ initialContacts }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [filter, setFilter] = useState<string>("all")
  const { toast } = useToast()
  const supabase = createClient()

  const filteredContacts = filter === "all" ? contacts : contacts.filter((contact) => contact.status === filter)

  const updateStatus = async (id: string, status: string) => {
    try {
      // Optimistically update the UI
      setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, status } : contact)))

      // Update in the database - RLS will ensure the user can only update contacts they're allowed to
      const { error } = await supabase.from("contacts").update({ status }).eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Status updated",
        description: `Contact status updated to ${status}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      // Revert the optimistic update
      setContacts(initialContacts)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again.",
      })
    }
  }

  const deleteContact = async (id: string) => {
    try {
      // Optimistically update the UI
      setContacts((prev) => prev.filter((contact) => contact.id !== id))

      // Delete from the database - RLS will ensure the user can only delete contacts they're allowed to
      const { error } = await supabase.from("contacts").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Contact deleted",
        description: "Contact has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting contact:", error)
      // Revert the optimistic update
      setContacts(initialContacts)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contact. Please try again.",
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return "Unknown date"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            New
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            In Progress
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Resolved
          </Badge>
        )
      case "spam":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Spam
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Contacts</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <h3 className="text-lg font-medium mb-2">No contacts found</h3>
          <p className="text-muted-foreground">
            {filter === "all"
              ? "There are no contact submissions yet."
              : `There are no contacts with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{contact.name}</h3>
                      {getStatusBadge(contact.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                    <p className="text-sm text-muted-foreground">Submitted: {formatDate(contact.created_at)}</p>
                    <div className="mt-4 bg-muted p-3 rounded-md">
                      <p className="whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 self-end md:self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${contact.email}`, "_blank")}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Reply
                    </Button>

                    <Select value={contact.status} onValueChange={(value) => updateStatus(contact.id, value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
