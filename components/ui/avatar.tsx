"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex items-center justify-center h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 border",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageProps extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>, 'loading'> {
  isLoading?: boolean;
  size?: number;
  src?: string;
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ isLoading, size = 64, src, ...props }, ref) => {
  const [imageError, setImageError] = React.useState(false);
  
  // Debug logging
  React.useEffect(() => {
    if (src) {
      console.log('AvatarImage src:', src);
    }
  }, [src]);

  const handleImageError = () => {
    console.error('Avatar image failed to load:', src);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Avatar image loaded successfully:', src);
    setImageError(false);
  };

  return (
    <>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 rounded-full">
          <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
        </span>
      )}
      <AvatarPrimitive.Image
        ref={ref}
        loading="lazy"
        width={size}
        height={size}
        className="absolute inset-0 w-full h-full object-cover rounded-full"
        src={src}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </>
  );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted select-none",
      className
    )}
    {...props}
  >
    <span className="text-gray-400 text-3xl font-semibold leading-none">{children}</span>
  </AvatarPrimitive.Fallback>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback } 