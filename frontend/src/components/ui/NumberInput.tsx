"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label?: string
  value?: number | null
  onValueChange?: (value: number | null) => void
  className?: string
}

export default function NumberInput({ label, value, onValueChange, className, ...props }: NumberInputProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue === "") {
      onValueChange?.(null)
    } else {
      const numValue = Number.parseFloat(newValue)
      if (!isNaN(numValue)) {
        onValueChange?.(numValue)
      }
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label className="block text-sm font-medium mb-2 text-foreground/80" htmlFor={props.id}>{label}</Label>}
      <Input
        type="number"
        value={inputValue}
        onChange={handleChange}
        className={cn(
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className,
        )}
        {...props}
      />
    </div>
  )
}