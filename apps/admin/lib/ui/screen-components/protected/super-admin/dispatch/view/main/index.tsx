// GraphQL
import { GET_ACTIVE_ORDERS } from '@/lib/api/graphql';

//Components
import Table from '@/lib/ui/useable-components/table';
import DispatchTableHeader from '../header/table-header';

//Inrfaces
import {
  IActiveOrders,
  IGetActiveOrders,
} from '@/lib/utils/interfaces/dispatch.interface';

//Hooks
import { useMemo, useState } from 'react';

// Constants
import { DISPATCH_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/dispatch-columns';
import { useQuery } from '@apollo/client';

export default function DispatchMain() {
  // States
  const [selectedData, setSelectedData] = useState<IActiveOrders[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Query — getActiveOrders only takes an optional restaurantId server-side
  // (no pagination/search/status-filter support), so filtering/pagination
  // below is done client-side over the full active-orders list.
  const { data: active_orders_data, loading: active_orders_loading } =
    useQuery<IGetActiveOrders | undefined, { restaurantId?: string }>(
      GET_ACTIVE_ORDERS,
      {
        variables: { restaurantId: '' },
        pollInterval: 15000,
      }
    );

  const filteredOrders = useMemo(() => {
    const orders = active_orders_data?.getActiveOrders ?? [];
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.orderId?.toLowerCase().includes(term) ||
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.phone?.toLowerCase().includes(term) ||
        order.restaurant?.name?.toLowerCase().includes(term);

      const matchesStatus =
        selectedActions.length === 0 ||
        selectedActions.includes(order.orderStatus);

      return matchesSearch && matchesStatus;
    });
  }, [active_orders_data, search, selectedActions]);

  return (
    <div className="p-3">
      <Table
        columns={DISPATCH_TABLE_COLUMNS()}
        data={filteredOrders}
        loading={active_orders_loading}
        selectedData={selectedData}
        setSelectedData={(e) => setSelectedData(e as IActiveOrders[])}
        header={
          <DispatchTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e) => setGlobalFilterValue(e.target.value)}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
            search={search}
            setSearch={setSearch}
          />
        }
        rowsPerPage={10}
      />
    </div>
  );
}
