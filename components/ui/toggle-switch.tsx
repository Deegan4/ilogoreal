import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ToggleSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  className?: string
}

export function ToggleSwitch({ checked, onCheckedChange, label, className }: ToggleSwitchProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch id="demo-mode" checked={checked} onCheckedChange={onCheckedChange} />
      {label && (
        <Label htmlFor="demo-mode" className="text-sm text-gray-400">
          {label}
        </Label>
      )}
    </div>
  )
}
