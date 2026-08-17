import React, { useContext } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { IExtendedOrder, Items } from '@/lib/utils/interfaces';
import { UPDATE_STATUS, GET_ORDERS_WITHOUT_PAGINATION } from '@/lib/api/graphql';
import { ToastContext } from '@/lib/context/global/toast.context';
import './order-detail-modal.css';

interface IOrderDetailModalProps {
  visible: boolean;
  onHide: () => void;
  restaurantData: IExtendedOrder | null;
}

const ORDER_STATUS_OPTIONS = [
  { label: 'Pending', code: 'PENDING' },
  { label: 'Accepted', code: 'ACCEPTED' },
  { label: 'Assigned', code: 'ASSIGNED' },
  { label: 'Picked', code: 'PICKED' },
  { label: 'Delivered', code: 'DELIVERED' },
  { label: 'Cancelled', code: 'CANCELLED' },
];

const OrderDetailModal: React.FC<IOrderDetailModalProps> = ({
  visible,
  onHide,
  restaurantData,
}) => {
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);

  const [updateStatus, { loading: statusUpdating }] = useMutation(
    UPDATE_STATUS,
    {
      onError: (err) => {
        showToast({
          type: 'error',
          title: t('Order Status'),
          message: err.message || t('An error occured while updating the status'),
        });
      },
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('Order Status'),
          message: t('Order status has been updated successfully'),
        });
      },
      refetchQueries: [{ query: GET_ORDERS_WITHOUT_PAGINATION }],
    }
  );

  const handleStatusChange = (e: DropdownChangeEvent) => {
    if (!restaurantData?._id) return;
    updateStatus({
      variables: {
        id: restaurantData._id,
        orderStatus: e.value.code,
      },
    });
  };
  const calculateItemUnitPrice = (item: Items) => {
    const addonsPrice = (item.addons ?? []).reduce((addonSum, addon) => {
      const defaultOptions = addon.defaultOptions ?? [];
      const optionsPrice = addon.options.reduce((optionSum, option) => {
        return defaultOptions.includes(option._id) ? optionSum : optionSum + option.price;
      }, 0);
      return addonSum + optionsPrice;
    }, 0);
    return item.variation.price + addonsPrice;
  };

  const calculateSubtotal = (items: Items[]) => {
    let subTotal = 0;
    for (let i = 0; i < items.length; i++) {
      subTotal += calculateItemUnitPrice(items[i]) * items[i].quantity;
    }
    return subTotal;
  };
  if (!restaurantData) return null;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Order # ${restaurantData.orderId}`}
      className="custom-modal" // Added custom class for CSS override
    >
      <div className="order-details-container">
        {/* Status Section */}
        <div className="order-section">
          <h3 className="section-header">Status</h3>
          <Dropdown
            value={ORDER_STATUS_OPTIONS.find(
              (opt) => opt.code === restaurantData.orderStatus
            )}
            onChange={handleStatusChange}
            options={ORDER_STATUS_OPTIONS}
            optionLabel="label"
            disabled={statusUpdating}
            placeholder="Select status"
          />
        </div>

        {/* Items Section */}
        <div className="order-section">
          <h3 className="section-header">Items</h3>
          {restaurantData.items && restaurantData.items.length > 0 ? (
            <div className="item-list">
              {restaurantData.items.map((item, index) => {
                const selectedOptions = (item.addons ?? []).flatMap((addon) => {
                  const defaultOptions = addon.defaultOptions ?? [];
                  return addon.options.filter((option) => !defaultOptions.includes(option._id));
                });
                return (
                  <div key={index} className="item-row-wrapper">
                    <div className="item-row">
                      <span>
                        {index + 1}. {item.title}
                      </span>
                      <span className="item-price">
                        {item.quantity} &#215; $
                        {calculateItemUnitPrice(item).toFixed(2)}
                      </span>
                    </div>
                    {selectedOptions.length > 0 && (
                      <div className="item-options">
                        {selectedOptions
                          .map((option) => `${option.title} (+$${option.price.toFixed(2)})`)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No items available</p>
          )}
        </div>

        {/* Charges Section */}
        <div className="order-section">
          <h3 className="section-header">Charges</h3>
          <div className="charges-table">
            <div className="charges-row">
              <span>Subtotal</span>
              <span>${calculateSubtotal(restaurantData?.items || []).toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Delivery Fee</span>
              <span>${(restaurantData.deliveryCharges ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Tax Charges</span>
              <span>${(restaurantData.taxationAmount ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Tip</span>
              <span>${(restaurantData.tipping ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row total-row">
              <strong>Total</strong>
              <strong>${restaurantData.orderAmount}</strong>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="order-section">
          <h3 className="section-header">Payment Method</h3>
          <div className="payment-section">
            <span className="payment-type">{restaurantData.paymentMethod}</span>
          </div>
          <div className="paid-amount">
            <span className="paid-label">Paid Amount</span>
            <span className="paid-value">
              ${(restaurantData.paidAmount ?? 0)?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="order-section">
          <h3 className="section-header">Delivery Address</h3>
          <p>{restaurantData.deliveryAddress.deliveryAddress}</p>
        </div>
      </div>
    </Dialog>
  );
};

export default OrderDetailModal;
