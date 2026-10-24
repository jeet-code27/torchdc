/** "#1042" for new orders, "#TORCH-806546" for older ones; never "##1042". */
export function orderLabel(orderNumber: string) {
  return orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`;
}
