import Link from "next/link"
import { Button } from "@/components/ui/button-custom"
import { ArrowLeft, Home } from "lucide-react"

export const metadata = {
  title: "Terms of Service | iLogo",
  description: "Terms and conditions for using the iLogo service",
}

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>

      <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: April 19, 2024</p>

        <p>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the iLogo website and
          service operated by iLogo ("us", "we", "our").
        </p>

        <p>
          Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
          These Terms apply to all visitors, users, and others who access or use the Service.
        </p>

        <p>
          <strong>
            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the
            terms, you may not access the Service.
          </strong>
        </p>

        <h2>1. Accounts</h2>
        <p>
          When you create an account with us, you must provide information that is accurate, complete, and current at
          all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
          your account on our Service.
        </p>

        <p>
          You are responsible for safeguarding the password that you use to access the Service and for any activities or
          actions under your password, whether your password is with our Service or a third-party service.
        </p>

        <p>
          You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware
          of any breach of security or unauthorized use of your account.
        </p>

        <h2>2. Intellectual Property</h2>
        <p>
          <strong>2.1 Our Intellectual Property</strong>
        </p>
        <p>
          The Service and its original content, features, and functionality are and will remain the exclusive property
          of iLogo and its licensors. The Service is protected by copyright, trademark, and other laws of both the
          United States and foreign countries. Our trademarks and trade dress may not be used in connection with any
          product or service without the prior written consent of iLogo.
        </p>

        <p>
          <strong>2.2 User-Generated Content</strong>
        </p>
        <p>
          You retain all your ownership rights to any content you submit, post, or display on or through the Service
          ("User Content"). By uploading User Content, you grant us a worldwide, non-exclusive, royalty-free license to
          use, reproduce, modify, adapt, publish, translate, and distribute your User Content in any existing or future
          media.
        </p>

        <p>
          <strong>2.3 Logo Ownership</strong>
        </p>
        <p>
          When you generate a logo using our Service, you are granted full ownership rights to the logo upon completion
          of any applicable payments. However, we reserve the right to use generated logos in a non-identifiable manner
          for the purpose of improving our AI models and service.
        </p>

        <h2>3. User Conduct</h2>
        <p>You agree not to use the Service:</p>
        <ul>
          <li>In any way that violates any applicable national or international law or regulation.</li>
          <li>
            To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail",
            "chain letter," "spam," or any other similar solicitation.
          </li>
          <li>
            To impersonate or attempt to impersonate iLogo, an iLogo employee, another user, or any other person or
            entity.
          </li>
          <li>
            To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or
            which, as determined by us, may harm iLogo or users of the Service or expose them to liability.
          </li>
          <li>
            To generate logos that infringe on existing trademarks, contain hate speech, or violate any applicable laws.
          </li>
        </ul>

        <h2>4. Service Usage and Limitations</h2>
        <p>
          <strong>4.1 Free and Paid Tiers</strong>
        </p>
        <p>
          Our Service may offer both free and paid tiers with different features and usage limitations. Free tier users
          may be subject to daily or monthly generation limits, watermarks, or other restrictions as specified on our
          website.
        </p>

        <p>
          <strong>4.2 API Usage</strong>
        </p>
        <p>
          If we provide API access, you agree to abide by our API rate limits and usage policies. Excessive or abusive
          API usage may result in temporary or permanent suspension of your access.
        </p>

        <h2>5. Payments and Subscriptions</h2>
        <p>
          <strong>5.1 Billing</strong>
        </p>
        <p>
          If you choose a paid subscription, you agree to pay all fees associated with your selected plan. You will be
          billed in advance on a recurring basis, depending on the type of subscription plan you select.
        </p>

        <p>
          <strong>5.2 Cancellation</strong>
        </p>
        <p>
          You may cancel your subscription at any time through your account settings or by contacting us. Upon
          cancellation, your subscription will remain active until the end of your current billing period.
        </p>

        <p>
          <strong>5.3 Refunds</strong>
        </p>
        <p>
          Refunds are provided at our discretion and in accordance with our refund policy as published on our website.
        </p>

        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason
          whatsoever, including without limitation if you breach the Terms.
        </p>

        <p>
          Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account,
          you may simply discontinue using the Service or contact us to request account deletion.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          In no event shall iLogo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable
          for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss
          of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul>
          <li>Your access to or use of or inability to access or use the Service;</li>
          <li>Any conduct or content of any third party on the Service;</li>
          <li>Any content obtained from the Service; and</li>
          <li>Unauthorized access, use or alteration of your transmissions or content.</li>
        </ul>

        <h2>8. Disclaimer</h2>
        <p>
          Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
          The Service is provided without warranties of any kind, whether express or implied, including, but not limited
          to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of
          performance.
        </p>

        <p>iLogo, its subsidiaries, affiliates, and its licensors do not warrant that:</p>
        <ul>
          <li>The Service will function uninterrupted, secure or available at any particular time or location;</li>
          <li>Any errors or defects will be corrected;</li>
          <li>The Service is free of viruses or other harmful components; or</li>
          <li>The results of using the Service will meet your requirements.</li>
        </ul>

        <h2>9. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of the United States, without regard
          to its conflict of law provisions.
        </p>

        <p>
          Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of
          these Terms will remain in effect.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
          material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What
          constitutes a material change will be determined at our sole discretion.
        </p>

        <p>
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by
          the revised terms. If you do not agree with the new terms, please stop using the Service.
        </p>

        <h2>11. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <ul>
          <li>Email: support@ilogo.com</li>
          <li>
            <Link href="/contact" className="text-primary hover:underline">
              Contact Form
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex justify-center">
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
