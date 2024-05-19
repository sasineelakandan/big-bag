const orderCollection = require('../model/ordermodel')
const userCollection = require('../model/usermodel')
const addressCollection = require('../model/addressmodel')
const productCollection = require('../model/productmodel')
const walletCollection=require('../model/Walletmodel')
const puppeteer = require('puppeteer-core');
const exceljs = require('exceljs');





const SalesReportGet=async(req,res)=>{
    try{
    var salesDetails = req.session.salesDetails ||await orderCollection.find({orderStatus:'Delivered'}).sort({_id:-1})
    
    const productsPerPage = 7
    const totalPages = salesDetails.length / productsPerPage
    const pageNo = req.query.pages || 1
    const start = (pageNo - 1) * productsPerPage
    const end = start + productsPerPage
    salesDetails = salesDetails.slice(start, end)

    res.render('adminpages/SalesReport',{Sreports:salesDetails,totalPages})
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
        });

        const browser = await puppeteer.launch({
         
            channel: 'chrome'
        });

        const page = await browser.newPage();

        let htmlContent = `
            <h1 style="text-align: center;">Sales Report</h1>
            <table style="width:100%; border-collapse: collapse;" border="1">
              <tr>
                <th>Order Number</th>
                <th>UserName</th>
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
                <td>${order.OrderId}</td>
                <td>${order.UserName}</td>
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

const filterDate=async(req,res)=>{
  try{
    
    const startOfDay = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  };

  const endOfDay = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  };
;

 
    if (req.body.filterDateFrom && req.body.filterDateTo) {
      startDate = new Date(req.body.filterDateFrom);
      endDate = new Date(req.body.filterDateTo);
      startDate = startOfDay(new Date(startDate));
      endDate = endOfDay(new Date(endDate));
    const salesData = await orderCollection.find({
      orderDate: { $gte: startDate, $lte: endDate },
      orderStatus: "Delivered"
      
  });
  req.session.salesDetails=salesData
   res.send({success:true})
  }
}
  catch(error){
    console.log(error)
  }
}
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
  
      let salesData = await orderCollection.find({orderStatus:'Delivered'})
  
      salesData = salesData.map((v) => {
        v.orderDateFormatted = formatDate(v.orderDate);
        return v;
      });
  
      salesData.forEach((v) => {
        sheet.addRow({
          no: v.OrderId,
          username: v.UserName,
          orderDate: v.orderDateFormatted,
          products: v.cartData.map((v) => v.productName).join(", "),
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
  
  const removeAllFillters = async (req, res) => {
    try {
      req.session.salesDetails  = null
        res.redirect('/Sales')
    } catch (error) {
        console.log(error)
    }
}
module.exports={SalesReportGet,salesReportDownloadPDF,salesReportDownload,filterDate,removeAllFillters}