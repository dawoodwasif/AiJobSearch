import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

// Create a simple cn utility function since @/lib/utils is not available
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-cyan-400/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-secondary/50 bg-secondary/10 backdrop-blur-sm shadow-sm hover:bg-secondary/20",
        secondary:
          "bg-[rgba(28,18,30,0.80)] backdrop-blur-sm text-secondary shadow-sm hover:bg-[rgba(28,18,30,0.90)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-11 w-11 rounded-full p-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Define variants with proper typing
    const variantStyles: Record<NonNullable<typeof variant>, string> = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      secondary: "bg-gray-600 text-white hover:bg-gray-700",
      ghost: "text-gray-700 hover:bg-gray-100",
      link: "text-blue-600 underline-offset-4 hover:underline",
    };

    const sizeStyles: Record<NonNullable<typeof size>, string> = {
      default: "h-14 px-6 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-11 w-11 rounded-full p-2.5",
    };

    // Ensure variant and size are not null/undefined
    const safeVariant = variant || "default";
    const safeSize = size || "default";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant: safeVariant, size: safeSize, className }),
          variantStyles[safeVariant],
          sizeStyles[safeSize]
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
