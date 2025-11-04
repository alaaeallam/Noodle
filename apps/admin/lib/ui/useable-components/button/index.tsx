import React from 'react';

// Prime React
import { Button } from 'primereact/button';
import type { ButtonProps } from 'primereact/button';

// Styles
import classes from './button.module.css';

export type CustomButtonProps = ButtonProps & {
  className?: string;
};

export default function CustomButton({
  className = '',
  ...props
}: CustomButtonProps) {
  return (
    <Button
      {...props}
      className={`${classes['btn-custom']} ${className ?? ''}`}
    />
  );
}
