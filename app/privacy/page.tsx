import Link from "next/link"
import { Button } from "@/components/ui/button-custom"
import { ArrowLeft, Home } from "lucide-react"

export const metadata = {
  title: "Privacy Policy | iLogo",
  description: "Privacy policy for iLogo - how we collect, use, and protect your data",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>
        </Button>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="text-muted-foreground mb-6">Last updated: April 19, 2024</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p>
            Welcome to iLogo ("we," "our," or "us"). We respect your privacy and are committed to protecting your
            personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information
            when you use our service.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please
            do not access the site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>

          <h3 className="text-lg font-medium mt-6 mb-3">Personal Data</h3>
          <p>We may collect personal identification information, including but not limited to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Usage data</li>
            <li>Account credentials</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">Usage Data</h3>
          <p>We may also collect information on how the service is accessed and used. This usage data may include:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your computer's Internet Protocol address (e.g., IP address)</li>
            <li>Browser type and version</li>
            <li>Pages of our service that you visit</li>
            <li>Time and date of your visit</li>
            <li>Time spent on those pages</li>
            <li>Unique device identifiers and other diagnostic data</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">Logo Data</h3>
          <p>When you use our logo generation service, we collect:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Logo prompts and descriptions you provide</li>
            <li>Generated logo designs</li>
            <li>Customization preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
          <p>We use the collected data for various purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features of our service when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To fulfill any other purpose for which you provide it</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Security</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet,
            or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to
            protect your personal data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
          <p>
            We may employ third-party companies and individuals to facilitate our service ("Service Providers"), to
            provide the service on our behalf, to perform service-related services or to assist us in analyzing how our
            service is used.
          </p>
          <p>
            These third parties have access to your personal data only to perform these tasks on our behalf and are
            obligated not to disclose or use it for any other purpose.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">Analytics</h3>
          <p>We may use third-party Service Providers to monitor and analyze the use of our service.</p>

          <h3 className="text-lg font-medium mt-6 mb-3">AI Services</h3>
          <p>
            Our logo generation service uses artificial intelligence provided by third parties. Your prompts and
            generated content may be processed by these services to create your logos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and hold certain
            information.
          </p>
          <p>
            Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are
            sent to your browser from a website and stored on your device.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if
            you do not accept cookies, you may not be able to use some portions of our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Data Protection Rights</h2>
          <p>
            We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your personal
            data.
          </p>
          <p>
            If you wish to be informed what personal data we hold about you and if you want it to be removed from our
            systems, please contact us.
          </p>
          <p>In certain circumstances, you have the following data protection rights:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>The right to access, update or to delete the information we have on you</li>
            <li>The right of rectification</li>
            <li>The right to object</li>
            <li>The right of restriction</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our privacy policy from time to time. We will notify you of any changes by posting the new
            privacy policy on this page.
          </p>
          <p>
            We will let you know via email and/or a prominent notice on our service, prior to the change becoming
            effective and update the "Last updated" date at the top of this privacy policy.
          </p>
          <p>
            You are advised to review this privacy policy periodically for any changes. Changes to this privacy policy
            are effective when they are posted on this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>By email: privacy@ilogo.com</li>
            <li>
              By visiting the contact page on our website:{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Us
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
