import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button-custom"
import { Breadcrumb } from "@/components/ui/breadcrumb"

interface PageHeaderProps {
  title: string
  breadcrumbItems?: Array<{ label: string; href?: string }>
  showBackButton?: boolean
  showHomeButton?: boolean
  className?: string
}

export function PageHeader({
  title,
  breadcrumbItems,
  showBackButton = true,
  showHomeButton = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={className}>
      {breadcrumbItems && <Breadcrumb items={breadcrumbItems} className="mb-4" />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>

        <div className="flex items-center gap-2">
          {showHomeButton && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
          )}

          {showBackButton && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
