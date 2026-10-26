import React from 'react';

interface MaterialIconProps {
  name: string;
  fill?: boolean;
  size?: number | string;
  weight?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  fill = false,
  size = 20,
  weight = 400,
  className = '',
  style = {},
}) => {
  const fontVariationSettings = `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`;

  return (
    <span
      className={`material-symbols-rounded shrink-0 select-none ${fill ? 'fill-1' : ''} ${className}`}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        fontVariationSettings,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
