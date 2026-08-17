// import ActionMenu from '../../action-menu';
import Image from 'next/image';

// Interface
import { IActionMenuProps, IFoodNew } from '@/lib/utils/interfaces';

import ActionMenu from '../../action-menu';
import { ApolloError, useMutation, useApolloClient } from '@apollo/client';
import { useContext, useState } from 'react';
import { useTranslations } from 'next-intl';
import { UPDATE_FOOD_OUT_OF_STOCK, UPDATE_FOOD_FEATURED } from '@/lib/api/graphql/mutations/food';
import { GET_RESTAURANT_FOODS_LIST } from '@/lib/api/graphql/queries/restaurants';
import { GET_FOODS_BY_RESTAURANT_ID } from '@/lib/api/graphql/queries/food';
import { ToastContext } from '@/lib/context/global/toast.context';
import CustomInputSwitch from '../../custom-input-switch';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';

export const FOODS_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IFoodNew>['items'];
}) => {
  // Hooks
  const t = useTranslations();
  const client = useApolloClient();

  // Context
  const { showToast } = useContext(ToastContext);
  const {
    restaurantLayoutContextData: { restaurantId },
  } = useContext(RestaurantLayoutContext);

  // State
  const [isFoodLoading, setIsFoodLoading] = useState<string>('');
  const [isFeaturedLoading, setIsFeaturedLoading] = useState<string>('');

  // API
  const [updateFoodOutOfStock] = useMutation(UPDATE_FOOD_OUT_OF_STOCK, {
    refetchQueries: [
      {
        query: GET_RESTAURANT_FOODS_LIST,
        variables: { id: restaurantId },
      },
      {
        query: GET_FOODS_BY_RESTAURANT_ID,
        variables: { id: restaurantId },
      },
    ],
    optimisticResponse: {
      updateFoodOutOfStock: true,
    },
    update: (cache, { data }, { variables }) => {
      if (!data?.updateFoodOutOfStock) return;
      const flipOutOfStock = (existing: any) => {
        if (!existing?.restaurant) return existing;
        const updatedCategories = existing.restaurant.categories.map((ctg: any) => ({
          ...ctg,
          foods: ctg.foods.map((fd: any) =>
            fd._id === variables?.id ? { ...fd, isOutOfStock: !fd.isOutOfStock } : fd
          ),
        }));
        return {
          ...existing,
          restaurant: { ...existing.restaurant, categories: updatedCategories },
        };
      };
      try {
        cache.updateQuery(
          { query: GET_RESTAURANT_FOODS_LIST, variables: { id: restaurantId } },
          flipOutOfStock
        );
      } catch {}
      try {
        cache.updateQuery(
          { query: GET_FOODS_BY_RESTAURANT_ID, variables: { id: restaurantId } },
          flipOutOfStock
        );
      } catch {}
    },
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('Food Stock'),
        message: t(`Food stock status has been changed`),
      });
      setIsFoodLoading('');
      // Ensure the table reflects the latest toggle without manual refresh
      client.refetchQueries({
        include: [GET_RESTAURANT_FOODS_LIST, GET_FOODS_BY_RESTAURANT_ID],
      });
    },
    onError: ({ networkError, graphQLErrors }: ApolloError) => {
      showToast({
        type: 'error',
        title: t('Food Stock'),
        message:
          networkError?.message ??
          graphQLErrors[0]?.message ??
          t('Food Stock status failed'),
      });
      setIsFoodLoading('');
    },
  });

  const [updateFoodFeatured] = useMutation(UPDATE_FOOD_FEATURED, {
    refetchQueries: [
      {
        query: GET_RESTAURANT_FOODS_LIST,
        variables: { id: restaurantId },
      },
      {
        query: GET_FOODS_BY_RESTAURANT_ID,
        variables: { id: restaurantId },
      },
    ],
    optimisticResponse: {
      updateFoodFeatured: true,
    },
    update: (cache, { data }, { variables }) => {
      if (!data?.updateFoodFeatured) return;
      const flipFeatured = (existing: any) => {
        if (!existing?.restaurant) return existing;
        const updatedCategories = existing.restaurant.categories.map((ctg: any) => ({
          ...ctg,
          foods: ctg.foods.map((fd: any) =>
            fd._id === variables?.id ? { ...fd, isFeatured: !fd.isFeatured } : fd
          ),
        }));
        return {
          ...existing,
          restaurant: { ...existing.restaurant, categories: updatedCategories },
        };
      };
      try {
        cache.updateQuery(
          { query: GET_RESTAURANT_FOODS_LIST, variables: { id: restaurantId } },
          flipFeatured
        );
      } catch {}
      try {
        cache.updateQuery(
          { query: GET_FOODS_BY_RESTAURANT_ID, variables: { id: restaurantId } },
          flipFeatured
        );
      } catch {}
    },
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('Featured Item'),
        message: t(`Featured status has been changed`),
      });
      setIsFeaturedLoading('');
      client.refetchQueries({
        include: [GET_RESTAURANT_FOODS_LIST, GET_FOODS_BY_RESTAURANT_ID],
      });
    },
    onError: ({ networkError, graphQLErrors }: ApolloError) => {
      showToast({
        type: 'error',
        title: t('Featured Item'),
        message:
          networkError?.message ??
          graphQLErrors[0]?.message ??
          t('Featured status failed'),
      });
      setIsFeaturedLoading('');
    },
  });

  // Handlers
  const onUpdateFoodOutOfStock = async (foodId: string, categoryId: string) => {
    try {
      setIsFoodLoading(foodId);

      await updateFoodOutOfStock({
        variables: {
          id: foodId,
          categoryId,
          restaurant: restaurantId,
        },
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: t('Food Stock'),
        message: t('Food Stock status failed'),
      });
      setIsFoodLoading('');
    }
  };

  const onUpdateFoodFeatured = async (foodId: string, categoryId: string) => {
    try {
      setIsFeaturedLoading(foodId);

      await updateFoodFeatured({
        variables: {
          id: foodId,
          categoryId,
          restaurant: restaurantId,
        },
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: t('Featured Item'),
        message: t('Featured status failed'),
      });
      setIsFeaturedLoading('');
    }
  };

  return [
    { headerName: t('Title'), propertyName: 'title' },
    { headerName: t('Description'), propertyName: 'description' },
    {
      headerName: t('Category'),
      propertyName: 'category.label',
      body: (item: IFoodNew) => <div>{item?.category?.label ?? ''}</div>,
    },
    {
      headerName: t('Image'),
      propertyName: 'image',
      body: (item: IFoodNew) =>
        item.image ? (
          <Image src={item.image} width={40} height={40} alt="item.png" />
        ) : (
          <></>
        ),
    },
    {
      headerName: t('Out of Stock'),
      propertyName: 'isOutOfStock',
      body: (item: IFoodNew) => {
        return (
          <CustomInputSwitch
            loading={isFoodLoading === item._id}
            isActive={item.isOutOfStock}
            onChange={() =>
              onUpdateFoodOutOfStock(item._id, item.category?.code ?? '')
            }
          />
        );
      },
    },
    {
      headerName: t('Featured'),
      propertyName: 'isFeatured',
      body: (item: IFoodNew) => {
        return (
          <CustomInputSwitch
            loading={isFeaturedLoading === item._id}
            isActive={item.isFeatured}
            onChange={() =>
              onUpdateFoodFeatured(item._id, item.category?.code ?? '')
            }
          />
        );
      },
    },
    {
      propertyName: 'actions',
      body: (option: IFoodNew) => {
        return <ActionMenu items={menuItems} data={option} />;
      },
    },
  ];
};
