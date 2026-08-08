import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { IGlobalComponentProps } from './global.interface';

export interface IStatsCardProps extends IGlobalComponentProps {
  label: string;
  total: number;
  description?: string;
  isPositive?: boolean;
  route?: string;
  icon?: IconDefinition;
  loading?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  amountConfig?: {
    format: 'currency' | 'number';
    currency: string;
  };
}
