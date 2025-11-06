'use client';

// Core
import React, { useRef, type ReactNode } from 'react';

// Interfaces

// Prime React
import { Toast } from 'primereact/toast';

// Components
import CustomNotification from '@/lib/ui/useable-components/notification';
import {
  IToast,
  IToastContext,
} from '@/lib/utils/interfaces/toast.interface';

type ToastProviderProps = { children?: ReactNode };

export const ToastContext = React.createContext<IToastContext>(
  {} as IToastContext
);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  // Ref
  const toastRef = useRef<Toast>(null);

  // Handlers
  const onShowToast = (config: IToast) => {
    toastRef.current?.show({
      severity: config.type,
      life: config?.duration ?? 2500,
      contentStyle: {
        margin: 0,
        padding: 0,
      },
      content: (
        <CustomNotification
          type={config.type}
          title={config.title}
          message={config.message}
        />
      ),
    });
  };

  const value: IToastContext = {
    showToast: onShowToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
<Toast
  ref={toastRef}
  position="top-right"
  baseZIndex={100000}
  appendTo={typeof window !== 'undefined' ? document.body : undefined}
  className="pointer-events-auto"
/>
    </ToastContext.Provider>
  );
};
