import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "auth" | "auth-secondary"
  size?: "default" | "icon" | "sm" | "lg"
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variant === "default" &&
            "bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-400 shadow-lg shadow-purple-900/20 dark:shadow-purple-900/10",
          variant === "outline" &&
            "border border-input bg-background/50 text-foreground hover:bg-accent hover:text-accent-foreground backdrop-blur-sm",
          variant === "auth" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
          variant === "auth-secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          size === "default" && "h-10 sm:h-12 rounded-lg px-4 sm:px-6 text-sm",
          size === "sm" && "h-9 rounded-md px-3 text-xs",
          size === "lg" && "h-14 rounded-lg px-8 text-base",
          size === "icon" && "h-9 w-9 sm:h-10 sm:w-10 rounded-full",
          className,
        )}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{typeof children === "string" ? children : "Loading..."}</span>
          </div>
        ) : (
          children
        )}
      </button>
    )
  },
)
Button.displayName = "Button"
