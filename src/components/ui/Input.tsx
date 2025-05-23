import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg",
          "text-white placeholder-gray-500",
          "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
          "transition-colors",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'