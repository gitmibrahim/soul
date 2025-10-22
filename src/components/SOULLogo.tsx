import React from 'react'

interface SOULLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const SOULLogo: React.FC<SOULLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative inline-block">
        {/* Main SOUL text with gradient and glow effect */}
        <div className="relative">
          <div className="absolute inset-0 blur-sm opacity-50">
            <span className="bg-gradient-to-br from-cyan-300 via-blue-400 to-blue-600 bg-clip-text text-transparent">
              SOUL
            </span>
          </div>
          <span className="relative bg-gradient-to-br from-cyan-200 via-blue-300 to-blue-500 bg-clip-text text-transparent font-bold tracking-wider">
            SOUL
          </span>
        </div>
      </div>
    </div>
  )
}

export default SOULLogo
