import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type RatingStarsProps = {
  value: number        // 1-5
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (val: number) => void
  className?: string
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
}

export default function RatingStars({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            'transition-transform',
            interactive && 'hover:scale-110 cursor-pointer',
            !interactive && 'cursor-default pointer-events-none'
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-muted-foreground/40'
            )}
          />
        </button>
      ))}
    </div>
  )
}
