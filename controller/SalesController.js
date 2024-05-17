const orderCollection = require('../model/ordermodel')
const userCollection = require('../model/usermodel')
const addressCollection = require('../model/addressmodel')
const productCollection = require('../model/productmodel')
const walletCollection=require('../model/Walletmodel')
const puppeteer = require('puppeteer-core');






const SalesReportGet=async(req,res)=>{
    try{
        const sales=await orderCollection.find({orderStatus:'Delivered'})
        res.render('adminpages/SalesReport',{Sreports:sales})
    }
    catch(error){
        console.log(error)
    }
}

const salesReportDownloadPDF = async (req, res) => {
    try {
        let startDate, endDate;

        if (req.body.startDate && req.body.endDate) {
            startDate = new Date(req.body.startDate);
            endDate = new Date(req.body.endDate);
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date();
        }

        const salesData = await orderCollection.find({
            orderDate: { $gte: startDate, $lte: endDate },
            orderStatus: "Delivered"
        }); // Make sure to use .toArray() if you're using MongoDB

        const browser = await puppeteer.launch({
            // Specify the correct executablePath if needed
            // executablePath: '/path/to/your/chrome'
            channel: 'chrome'
        });

        const page = await browser.newPage();

        let htmlContent = `
            <h1 style="text-align: center;">Sales Report</h1>
            <table style="width:100%; border-collapse: collapse;" border="1">
              <tr>
                <th>Order Number</th>
                <th>Order Date</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>`;

        salesData.forEach((order) => {
            htmlContent += `
              <tr>
                <td>${order._id}</td>
                <td>${formatDate(order.orderDate)}</td>
                <td>${order.cartData.map((item) => item.productName).join(", ")}</td>
                <td>${order.cartData.map((item) => item.productQuantity).join(", ")}</td>
                <td>Rs.${order.grandTotalCost}</td>
                <td>${order.paymentType}</td>
                <td>${order.orderStatus}</td>
              </tr>`;
        });

        htmlContent += `</table>`;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=salesReport.pdf");
        res.send(pdfBuffer);

        await browser.close();
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Internal Server Error");
    }
};

const formatDate = (date) => {
    // Implement your date formatting function here
    return date.toISOString().split('T')[0]; // Example implementation
};
const salesReportDownload = async (req, res) => {
    try {
      const workBook = new exceljs.Workbook();
      const sheet = workBook.addWorksheet("book");
      sheet.columns = [
        { header: "Order No", key: "no", width: 10 },
        { header: "Order Date", key: "orderDate", width: 25 },
        { header: "Products", key: "products", width: 35 },
        { header: "No of items", key: "noOfItems", width: 35 },
        { header: "Total Cost", key: "totalCost", width: 25 },
        { header: "Payment Method", key: "paymentMethod", width: 25 },
        { header: "Status", key: "status", width: 20 },
      ];
  
      let salesData = req.session?.admin?.dateValues
        ? req.session.admin.salesData
        : await orderCollection.find().populate("userId");
  
      salesData = salesData.map((v) => {
        v.orderDateFormatted = formatDate(v.orderDate);
        return v;
      });
  
      salesData.forEach((v) => {
        sheet.addRow({
          no: v.orderNumber,
          username: v.userId.username,
          orderDate: v.orderDateFormatted,
          products: v.cartData.map((v) => v.productId.productName).join(", "),
          noOfItems: v.cartData.map((v) => v.productQuantity).join(", "),
          totalCost: "₹" + v.grandTotalCost,
          paymentMethod: v.paymentType,
          status: v.orderStatus,
        });
      });
  
      const totalOrders = salesData.length;
      const totalSales = salesData.reduce(
        (total, sale) => total + sale.grandTotalCost,
        0
      );
      const totalDiscount = salesData.reduce((total, sale) => {
        let discountAmount = sale.cartData.reduce((discount, cartItem) => {
          let productPrice = cartItem.productId.productPrice;
          let priceBeforeOffer = cartItem.productId.priceBeforeOffer;
          let discountPercentage = cartItem.productId.productOfferPercentage || 0;
          let actualAmount = productPrice * cartItem.productQuantity;
          let paidAmount =
            actualAmount - (actualAmount * discountPercentage) / 100;
          return discount + (actualAmount - paidAmount);
        }, 0);
        return total + discountAmount;
      }, 0);
  
      sheet.addRow({});
      sheet.addRow({ "Total Orders": totalOrders });
      sheet.addRow({ "Total Sales": "₹" + totalSales });
      sheet.addRow({ "Total Discount": "₹" + totalDiscount });
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=salesReport.xlsx"
      );
  
      await workBook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log(error);
      res.status(500).send("Error generating sales report");
    }
  };
  
  
module.exports={SalesReportGet,salesReportDownloadPDF,salesReportDownload}