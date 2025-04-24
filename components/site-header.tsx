"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button-custom"
import { UserMenu } from "@/components/auth/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useScrollPosition } from "@/hooks/use-scroll"

interface SiteHeaderProps {
  demoMode: boolean
  setDemoMode: (demoMode: boolean) => void
}

export function SiteHeader({ demoMode, setDemoMode }: SiteHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const isMobile = useMobile()
  const { scrollY } = useScrollPosition()

  // Determine if header should be compact based on scroll position
  const isCompact = scrollY > 50

  // Close mobile menu when pathname changes (navigation occurs)
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Animation variants for menu container
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
        staggerDirection: 1,
      },
    },
  }

  // Animation variants for individual menu items
  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  }

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top transition-all duration-300",
        isCompact ? "shadow-md" : "",
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between transition-all duration-300 py-1",
          isCompact ? "h-12" : "h-12 sm:h-14",
        )}
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
            <span
              className={cn("inline-block font-bold transition-all duration-300", isCompact ? "text-sm" : "text-base")}
            >
              iLogo
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className={cn(
                "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground relative z-10 group",
                pathname === "/" ? "text-foreground" : "text-muted-foreground",
              )}
              onClick={(e) => {
                e.stopPropagation()
                // Navigate to home page
              }}
            >
              Home
              <span className="absolute -bottom-1 left-0 h-0.5 bg-foreground/70 w-0 group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground relative z-10 group",
                  pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate to dashboard page
                }}
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 h-0.5 bg-foreground/70 w-0 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
            )}
            {user && (
              <Link
                href="/profile"
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground relative z-10 group",
                  pathname === "/profile" ? "text-foreground" : "text-muted-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate to profile page
                }}
              >
                Profile
                <span className="absolute -bottom-1 left-0 h-0.5 bg-foreground/70 w-0 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
            )}
            {user && (
              <Link
                href="/storage-test"
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground relative z-10 group",
                  pathname === "/storage-test" ? "text-foreground" : "text-muted-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate to storage test page
                }}
              >
                Storage Test
                <span className="absolute -bottom-1 left-0 h-0.5 bg-foreground/70 w-0 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle for demo mode */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDemoMode(!demoMode)}
              className="text-sm font-medium transition-all duration-200 hover:bg-foreground/10"
            >
              {demoMode ? "Pro Mode" : "Demo Mode"}
            </Button>
          </div>

          <ThemeToggle />

          {!isLoading && <UserMenu />}

          {/* Mobile menu button with animation */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-all duration-200 hover:bg-foreground/10"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Animated mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu container */}
            <motion.div
              className="absolute left-0 right-0 z-50 mt-1 overflow-hidden border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <nav className="container flex flex-col gap-4 py-6">
                <motion.div variants={itemVariants}>
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground py-2 relative z-10 group",
                      pathname === "/" ? "text-foreground" : "text-muted-foreground",
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Home</span>
                  </Link>
                </motion.div>

                {user && (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground py-2 relative z-10 group",
                        pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground",
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">Dashboard</span>
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground py-2 relative z-10 group",
                        pathname === "/profile" ? "text-foreground" : "text-muted-foreground",
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">Profile</span>
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/storage-test"
                      className={cn(
                        "flex items-center text-sm font-medium transition-all duration-200 hover:text-foreground py-2 relative z-10 group",
                        pathname === "/storage-test" ? "text-foreground" : "text-muted-foreground",
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">Storage Test</span>
                    </Link>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDemoMode(!demoMode)
                      setMobileMenuOpen(false)
                    }}
                    className="justify-start p-0 text-sm font-medium text-muted-foreground hover:text-foreground py-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {demoMode ? "Pro Mode" : "Demo Mode"}
                    </span>
                  </Button>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
