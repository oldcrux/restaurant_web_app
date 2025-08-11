import { Order } from "@/lib/types";

export const generatePrintContent = (order: Order) => {
  const orderDate = new Date(order.createdAt).toLocaleString();
  const orderItems = (order.orderDetails || []).map(item => ({
    name: item.item,
    quantity: item.quantity,
    price: item.itemPrice,
    total: order.totalCost,
    discount: order.totalDiscount,
    notes: item.notes || ''
  }));

  const total = orderItems.reduce((sum, item) => sum + item.total, 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${order.orderNumber}</title>
      <style>
        @media print {
          @page { margin: 0; }
          body { padding: 20px; font-family: Arial, sans-serif; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .order-info { margin-bottom: 15px; }
          .items { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
          .items td { padding: 5px 0; border-bottom: 1px solid #eee; }
          .items .item-name { width: 60%; }
          .items .item-qty { width: 15%; text-align: center; }
          .items .item-price { width: 25%; text-align: right; }
          .total { text-align: right; font-weight: bold; margin-top: 10px; }
          .notes { margin-top: 20px; font-style: italic; }
          .thank-you { text-align: center; margin-top: 20px; font-weight: bold; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h2>Order #${order.orderNumber}</h2>
          <p>${orderDate}</p>
        </div>
        
        <div class="order-info">
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhoneNumber}</p>
        </div>
        
        <table class="items">
          <thead>
            <tr>
              <th class="item-name">Item</th>
              <th class="item-qty">Qty</th>
              <th class="item-price">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.map(item => `
              <tr>
                <td>${item.name}${item.notes ? '<br><small>Note: ' + item.notes + '</small>' : ''}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">$${item.price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total: $${order.totalCost.toFixed(2)}</p>
          <p>Discount: $${order.totalDiscount.toFixed(2)}</p>
        </div>
        
        <div class="thank-you">
          <p>Thank you for your order!</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;
};
