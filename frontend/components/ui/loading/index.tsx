import React from "react";
import { cn } from "@/lib/utils";

interface RotateSpinnerProps {
  size?: number;
  color?: string;
  loading?: boolean;
  sizeUnit?: string;
  className?: string;
}

export function RotateSpinner({ 
  size = 45, 
  color = "#eab308", // yellow-600
  loading = true, 
  sizeUnit = "px",
  className 
}: RotateSpinnerProps) {
  if (!loading) return null;

  const countBalls = 8;
  const ballSize = size / 5;

  const balls = [];
  for (let i = 0; i < countBalls; i++) {
    balls.push(
      <div
        key={i}
        className="absolute left-1/2 top-0 rounded-full"
        style={{
          width: `${ballSize}${sizeUnit}`,
          height: `${ballSize}${sizeUnit}`,
          backgroundColor: color,
          transform: `translateX(-50%) translateY(100%) rotate(${i * (360 / countBalls)}deg)`,
          transformOrigin: `0 ${size / 2}${sizeUnit} 0`,
          animation: `rotate-spinner-ball 4s both infinite`,
          animationTimingFunction: `cubic-bezier(0.5, ${i * 0.3}, 0.9, 0.9)`,
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        @keyframes rotate-spinner-ball {
          0% {
            transform: translateX(-50%) translateY(100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(100%) rotate(1440deg);
            opacity: 0.05;
          }
        }
      `}</style>
      <div 
        className={cn("relative flex justify-center items-center", className)}
        style={{ 
          width: `${size}${sizeUnit}`, 
          height: `${size}${sizeUnit}` 
        }}
      >
        {balls}
      </div>
    </>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-yellow-600", sizeClasses[size], className)} />
  );
}

export function LoadingScreen({ variant = "rotate" }: { variant?: "rotate" | "spin" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {variant === "rotate" ? (
          <RotateSpinner size={60} color="#eab308" className="mx-auto mb-4" />
        ) : (
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
        )}
        <h2 className="text-lg font-medium text-slate-800 mb-2">Cargando...</h2>
        <p className="text-sm text-slate-600">Por favor espera mientras preparamos todo para ti</p>
      </div>
    </div>
  );
}

export function PageLoading({ variant = "rotate" }: { variant?: "rotate" | "spin" }) {
  return (
    <div className="flex items-center justify-center py-12">
      {variant === "rotate" ? (
        <RotateSpinner size={50} color="#eab308" />
      ) : (
        <LoadingSpinner size="lg" />
      )}
    </div>
  );
}

export function ButtonLoading({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center">
      <LoadingSpinner size="sm" className="mr-2" />
      {children}
    </div>
  );
}