// Server Component example (no "use client" directive)
import { createClient } from "@/lib/supabase/server" // Import for server components

export async function LogosList() {
  const supabase = createClient()

  // Fetch data on the server
  const { data, error } = await supabase.from("logos").select("*").limit(10)

  if (error) {
    console.error("Error fetching logos:", error)
    return <div>Error loading logos</div>
  }

  return (
    <div>
      <h2>Your Logos</h2>
      {data && data.length > 0 ? (
        <ul>
          {data.map((logo) => (
            <li key={logo.id}>{logo.prompt}</li>
          ))}
        </ul>
      ) : (
        <p>No logos found</p>
      )}
    </div>
  )
}
