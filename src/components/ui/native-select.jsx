import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Native &lt;select&gt; with the same height and chrome as Input / Button (h-10).
 */
const NativeSelect = React.forwardRef(({ className, children, ...props }, ref) => (
    <select
        className={cn(
            'flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
        )}
        ref={ref}
        {...props}
    >
        {children}
    </select>
))
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
