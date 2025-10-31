// apps/admin/lib/context/restaurant/profile.context.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GET_RESTAURANT_PROFILE } from '@/lib/api/graphql';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import { useQueryGQL } from '../../hooks/useQueryQL';
import {
  IQueryResult,
  IProfileContextData,
  IProfileProviderProps,
} from '../../utils/interfaces';
import { IRestaurantProfileProps } from '../../utils/interfaces';
import { ToastContext } from '@/lib/context/global/toast.context';

export const ProfileContext = createContext<IProfileContextData>(
  {} as IProfileContextData
);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { showToast } = useContext(ToastContext);
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const { restaurantId } = restaurantLayoutContextData;

  const [isUpdateProfileVisible, setIsUpdateProfileVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // do we actually have a restaurant selected?
  const shouldFetch = Boolean(restaurantId);

  // --- call useQueryGQL differently based on shouldFetch ---
  const restaurantProfileResponse = shouldFetch
    ? (useQueryGQL(
        GET_RESTAURANT_PROFILE,
        { id: restaurantId },
        {
          enabled: true,
          fetchPolicy: 'network-only',
          debounceMs: 300,
          onError: () => {
            showToast({
              type: 'error',
              title: 'Profile Fetch',
              message: 'Failed to fetch profile',
            });
          },
        }
      ) as IQueryResult<IRestaurantProfileProps | undefined, undefined>)
    : ({
        data: undefined,
        loading: false,
        error: undefined,
        refetch: () => Promise.resolve(),
      } as unknown as IQueryResult<IRestaurantProfileProps | undefined, undefined>);
  // ----------------------------------------------------------

  const handleUpdateProfile = () => {
    setIsUpdateProfileVisible(true);
  };

  const onActiveStepChange = (activeStep: number) => {
    setActiveIndex(activeStep);
  };

  const refetchRestaurantProfile = async (): Promise<void> => {
    if (shouldFetch) {
      restaurantProfileResponse.refetch();
    }
  };

  // re-fetch when restaurant changes
  useEffect(() => {
    if (shouldFetch) {
      restaurantProfileResponse.refetch();
    }
  }, [shouldFetch, restaurantId]);

  const value: IProfileContextData = {
    restaurantId,
    isUpdateProfileVisible,
    setIsUpdateProfileVisible,
    handleUpdateProfile,
    restaurantProfileResponse,
    activeIndex,
    onActiveStepChange,
    refetchRestaurantProfile,
    loading: shouldFetch ? restaurantProfileResponse.loading : false,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};