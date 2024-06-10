const PDFDocument = require("pdfkit");
const addressCollection=require('../model/addressmodel')
module.exports = {
  generateInvoice: (dataCallback, endCallback, orderData) => {
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    generateHeader(doc);
    generateCustomerInformation(doc, orderData);
    generateInvoiceTable(doc, orderData);
    generateFooter(doc);

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    doc.end();
  },
};

function generateHeader(doc) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Big-Bags", 110, 57)
    .fontSize(10)
    .text("BetaSpace-4th Floor, Desabandhu St., Ramnagar,", 200, 65, {
      align: "right",
    })
    .text("Coimbatore, TN- 6100025", 200, 80, { align: "right" })
    .moveDown();
}

function generateFooter(doc) {
  doc.fontSize(10).text("Thank You! Shop with us again :)", 50, 750, {
    align: "center",
    width: 500,
  });
}

function generateCustomerInformation(doc, orderData) {
  const { UserName, orderDate, Total, address } = orderData;
 
  doc
    .fontSize(12)
    .text(`Order Number: ${orderData.OrderId}`, 50, 100)
    .text(`Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}`, 50, 115)
    .text(`Total Price: ${orderData.Total}`, 50, 130)
    .text(`Name: ${orderData.UserName}`, 300, 100)
    .text(`Phone: ${address.phone}`, 300, 130)
    .text(`Address: ${address.addressLine1}`, 300, 115)
    
    .moveDown();
}

function generateInvoiceTable(doc, orderData) {
  let i,
    invoiceTableTop = 170;

  doc.font("Helvetica-Bold");
  generateTableRow(doc, invoiceTableTop, "Item", "Quantity", "Price");

  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < orderData.cartData.length; i++) {
    const item = orderData.cartData[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.productName,
      item.productQuantity,
      item.totalCostPerProduct
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  doc.font("Helvetica-Bold");

  // Adjusted to include new columns for Discount and Total
  generateTableRow(
    doc,
    subtotalPosition,
    "", // Empty for alignment
    "Subtotal",
    orderData.grandTotalCost+'$'
  );

  const discountPosition = subtotalPosition + 30;
  generateTableRow(
    doc,
    discountPosition,
    "", // Empty for alignment
    "Discount",
    orderData.couponApplied+'$'
  );

  const totalPosition = discountPosition + 30;
  generateTableRow(
    doc,
    totalPosition,
    "", // Empty for alignment
    "Total",
    orderData.Total+'$'
  );
}

function generateTableRow(doc, y, item, quantity, price) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(quantity, 150, y)
    .text(price, 280, y, { width: 90, align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function generateTableRow(doc, y, item, quantity, price) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(quantity, 280, y, { width: 90, align: "right" })
    .text(price, 370, y, { width: 90, align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}
