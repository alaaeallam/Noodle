'use client';
// Core
import React, { createContext, useState, useEffect, useContext } from 'react';

// Interfaces and Types
import {
  IQueryResult,
  IProfileProviderProps,
  ISingleVendorResponseGraphQL,
} from '../../utils/interfaces';

import { IVendorProfileContextData } from '@/lib/utils/interfaces/profile/vendor.profile.interface';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { VendorLayoutContext } from './layout-vendor.context';

// GraphQL
import { PROFILE } from '@/lib/api/graphql/queries/me';
import { useQueryGQL } from '../../hooks/useQueryQL';

export const ProfileContext = createContext<IVendorProfileContextData>(
  {} as IVendorProfileContextData
);

type ProviderProps = { children: React.ReactNode };
export const ProfileProvider = ({ children }: ProviderProps) => {
  const { showToast } = useContext(ToastContext);
  const { vendorLayoutContextData } = useContext(VendorLayoutContext);
  const { vendorId } = vendorLayoutContextData;

  const [isUpdateProfileVisible, setIsUpdateProfileVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const vendorProfileResponse = useQueryGQL(
    PROFILE,
    {},
    {
      fetchPolicy: 'network-only',
      debounceMs: 300,
      onCompleted: () => {
        // fetched
      },
      onError: () => {
        showToast({
          type: 'error',
          title: 'Profile Fetch',
          message: 'Failed to fetch profile',
        });
      },
    }
  ) as IQueryResult<any, undefined>;

  const handleUpdateProfile = () => {
    setIsUpdateProfileVisible(true);
  };

  const onActiveStepChange = (activeStep: number) => {
    setActiveIndex(activeStep);
  };

  const refetchVendorProfile = async (): Promise<void> => {
    vendorProfileResponse.refetch();
  };

  useEffect(() => {
    vendorProfileResponse.refetch();
  }, []);

  const value: IVendorProfileContextData = {
    isUpdateProfileVisible,
    setIsUpdateProfileVisible,
    handleUpdateProfile,
    vendorProfileResponse,
    activeIndex,
    onActiveStepChange,
    refetchVendorProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
