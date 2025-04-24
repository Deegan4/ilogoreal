import { PageHeader } from "@/components/layout/page-header"

export const metadata = {
  title: "Privacy Policy | iLogo",
  description: "Privacy policy for iLogo - how we collect, use, and protect your data",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <PageHeader title="Privacy Policy" breadcrumbItems={[{ label: "Privacy Policy" }]} />

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: April 19, 2024</p>

        {/* Rest of the privacy policy content */}
        {/* ... */}
      </div>
    </div>
  )
}
