import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
          variant === 'primary' && "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25",
          variant === 'secondary' && "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'