export const toCustomerQuotationDto = (quotation: any) => {
  if (!quotation) return null;

  // We strictly omit internal margins, internal approval notes, internal risk details.
  return {
    id: quotation.id,
    title: quotation.title,
    amount: quotation.amount,
    status: quotation.status,
    customerId: quotation.customerId,
    lastActivityAt: quotation.lastActivityAt,
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt,
    // Note: Do not expose ownerId (internal rep identity is sometimes hidden, but usually fine, we omit it just in case).
    // Do not expose any joined approval data, risk scores, or margin/cost info.
  };
};

export const toCustomerOrderLinesDto = (orderLines: any[]) => {
  if (!orderLines) return [];
  
  return orderLines.map(line => ({
    id: line.id,
    orderId: line.orderId,
    lineType: line.lineType,
    productId: line.productId,
    quantity: line.quantity,
    // Notice we'd map product details here, omitting internal cost if products had it
    product: line.product ? {
      id: line.product.id,
      name: line.product.name,
      price: line.product.price, // Selling price is fine for customer
    } : undefined,
  }));
};
