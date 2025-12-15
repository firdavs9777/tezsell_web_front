import React, { useState, useEffect, useRef } from "react";

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  onClick?: () => void;
}

const LOGO_URL = "https://my-projects-media.sfo3.cdn.digitaloceanspaces.com/tezsell/logo.png";

// Image cache management
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<void>>();

const preloadImage = (src: string): Promise<void> => {
  // Return existing promise if image is already loading
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  // Return cached image if available
  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  // Create new loading promise
  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve();
    };
    
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Don't set crossOrigin if CORS is not configured on the server
    // The browser will handle CORS automatically if needed
    img.src = src;
  });

  loadingPromises.set(src, promise);
  return promise;
};

const Logo: React.FC<LogoProps> = ({
  className = "",
  width = "auto",
  height = "auto",
  alt = "TezSell Logo",
  onClick,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Preload the image on component mount
    preloadImage(LOGO_URL)
      .then(() => {
        setImageLoaded(true);
      })
      .catch(() => {
        setImageError(true);
      });
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Fallback to text if image fails to load
  if (imageError) {
    return (
      <span
        className={`text-xl sm:text-2xl font-bold text-blue-900 ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        TezSell
      </span>
    );
  }

  return (
    <img
      ref={imgRef}
      src={LOGO_URL}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${!imageLoaded ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
      onLoad={handleImageLoad}
      onError={handleImageError}
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        objectFit: "contain",
      }}
      loading="lazy"
      decoding="async"
    />
  );
};

// Export preload function for use in other components
export const preloadLogo = () => preloadImage(LOGO_URL);

// Export logo URL constant
export { LOGO_URL };

export default Logo;

