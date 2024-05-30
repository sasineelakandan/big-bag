const orderCollection = require('../model/ordermodel')
const userCollection = require('../model/usermodel')
const addressCollection = require('../model/addressmodel')
const productCollection = require('../model/productmodel')
const walletCollection=require('../model/Walletmodel')
const puppeteer = require('puppeteer-core');
const exceljs = require('exceljs');
const AppError=require('../middlewere/errorhandling')




const SalesReportGet=async(req,res,next)=>{
    try{
    var salesDetails = req.session.salesDetails ||await orderCollection.find({orderStatus:'Delivered'}).sort({_id:-1})
    
    const productsPerPage = 7
    const totalPages = salesDetails.length / productsPerPage
    const pageNo = req.query.pages || 1
    const start = (pageNo - 1) * productsPerPage
    const end = start + productsPerPage
    salesDetails = salesDetails.slice(start, end)
    let totalSum=[]
    let total=[]
    let totalSum1=[]
    let total2=[]
    for(i=0;i<salesDetails.length;i++){
       totalSum = salesDetails[i].cartData.map((item) => item.productprice) 
       total.push(totalSum)
       totalSum1= salesDetails[i].cartData.map((item) => item.priceBeforeOffer) 
       total2.push(totalSum1)
    }
    let sum=total.flat()
    let sum2=total2.flat()
    let totalSales = sum.reduce((total, sale) =>total= total + sale, 0)
    let totalSales2= sum2.reduce((total, sale) =>total= total + sale, 0)
    let coupontotal= salesDetails.reduce((total, sale) =>total= total + sale.couponApplied, 0)
    
   let totalDiscount=coupontotal+totalSales2-totalSales
    
    res.render('adminpages/SalesReport',{Sreports:salesDetails,totalPages,Dates:req.session.admin.datevalue ,TotalDiscount:coupontotal})
    }
    catch(error){
      next(new AppError('Somthing went Wrong', 500));
    }
}

const salesReportDownloadPDF = async (req, res,next) => {
    try {
        
        
        const startOfDay = (date) => {
          return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 1, 1, 1);
      };
      
      const endOfDay = (date) => {
          return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      };
    ; let startDate, endDate;
     
        if (req.query.startDate && req.query.endDate) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
            var startDate1= startOfDay(new Date(startDate));
          var  endDate2 = endOfDay(new Date(endDate));
            
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date();
        }

        const salesData = await orderCollection.find({
            orderDate: { $gte: startDate1, $lte: endDate2 },
            orderStatus: "Delivered"
        });

        const browser = await puppeteer.launch({
         
            channel: 'chrome'
        });

        const page = await browser.newPage();
        let totalSales = salesData.reduce((total, sale) => total + sale.Total, 0) 
        let totalSum=[]
        let total=[]
        let totalSum1=[]
        let total2=[]
        for(i=0;i<salesData.length;i++){
           totalSum = salesData[i].cartData.map((item) => item.productprice) 
           total.push(totalSum)
           totalSum1= salesData[i].cartData.map((item) => item.priceBeforeOffer) 
           total2.push(totalSum1)
        }
        let sum=total.flat()
        let sum2=total2.flat()
        let totalSales1 = sum.reduce((total, sale) =>total= total + sale, 0)
        let totalSales2= sum2.reduce((total, sale) =>total= total + sale, 0)
        let coupontotal= salesData.reduce((total, sale) =>total= total + sale.couponApplied, 0)
       let totalDiscount=coupontotal+totalSales2-totalSales1

        let htmlContent = `
            <h1 style="text-align: center;">Sales Report</h1>
            <h5>FromDate</h5>:<span>${startDate1.toDateString()}</span>
            <h5>To</h5>:<span>${endDate2.toDateString()}</span>
          <h3>Total Sales</h3>  <h4>${salesData.length}</h4>  <h3>Total Amount</h3> <h4>  $ ${totalSales}</h4> 
          <h3>Total Discount</h3> <h4>  $ ${coupontotal}</h4> 
            <table style="width:100%; border-collapse: collapse;" border="1">
              <tr>
                <th>Order Number</th>
                <th>UserName</th>
                <th>Order Date</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>productOfferPercentage</th>
                <th>productPrice</th>
                <th>CouponAmount</th>
                <th>TotalCost</th>
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
                <td>${order.cartData.map((item) => item.productOfferPercentage).join("%, ")}</td>
                <td>${order.cartData.map((item) => item.productprice).join("$, ")}</td>
                <td>$.${order.couponApplied}</td>
                <td>$.${order.Total}</td>
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
      next(new AppError('Somthing went Wrong', 500));
    }
};

const filterDates=async(req,res,next)=>{
  try {console.log(req.body)
    let { filterOption } = req.body;
    let startDate, endDate;

    if (filterOption === "month") {
      startDate = new Date();
      startDate.setDate(1);
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0);
    } else if (filterOption === "week") {
      let currentDate = new Date();
      let currentDay = currentDate.getDay();
      let diff = currentDate.getDate() - currentDay - 7;
      startDate = new Date(currentDate.setDate(diff));
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (filterOption === "year") {
      let currentYear = new Date().getFullYear();
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
    }

    let salesDataFiltered = await orderCollection
      .find({
        orderDate: { $gte: startDate, $lte: endDate },
        orderStatus: "Delivered",
      })
      

    req.session.admin = {};
    req.session.admin.dateValues = { startDate, endDate };
    req.session.salesDetails=salesData = JSON.parse(JSON.stringify(salesDataFiltered));

    res.status(200).json({ success: true });
  } catch (error) {
    next(new AppError('Somthing went Wrong', 500));;
  }
};




const filterDate=async(req,res,next)=>{
  try{
     
    if(req.body.filterDateFrom>req.body.filterDateTo){
       res.send({dateInvalid:true})
    }else{

    const startOfDay = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 1, 1, 1);
  };
  
  const endOfDay = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  };
; 

 
    if (req.body.filterDateFrom && req.body.filterDateTo) {
      startDate = new Date(req.body.filterDateFrom);
      endDate = new Date(req.body.filterDateTo);
      startDate1= startOfDay(new Date(startDate));
      endDate2 = endOfDay(new Date(endDate));
      console.log(startDate1)
      console.log(endDate2)
    const salesData = await orderCollection.find({
      orderDate: { $gte: startDate1, $lte: endDate2 },
      orderStatus: "Delivered"
      
  });

  req.session.salesDetails=salesData
  req.session.admin = {}
  req.session.admin.datevalue={startDate1,endDate2}

  
   res.send({success:true})
  }
}
  }
  catch(error){
    next(new AppError('Somthing went Wrong', 500));
  }
}

const formatDate = (date) => {
  // Implement your date formatting function here
  return date.toISOString().split('T')[0]; // Example implementation
};
const salesReportDownload = async (req, res,next) => {
  try{ 
    const workBook = new exceljs.Workbook();
    const sheet = workBook.addWorksheet("book");
    
    sheet.columns = [
      { header: "Order No", key: "no", width: 10 },
      { header: "Order Date", key: "orderDate", width: 25 },
      { header: "Products", key: "products", width: 35 },
      { header: "No of items", key: "noOfItems", width: 35 },
      { header: "OfferPercentege", key: "OfferPercentege", width: 35 },
      { header: "productPrice", key: "productPrice", width: 35 },
      { header: "CouponAmount", key: "CouponAmount", width: 35 },
      { header: "Total Cost", key: "totalCost", width: 25 },
      { header: "Payment Method", key: "paymentMethod", width: 25 },
      { header: "Status", key: "status", width: 20 },
    ];
    
    const startOfDay = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 1, 1, 1);
  };
  
  const endOfDay = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  };
; let startDate, endDate;
 
    if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        var startDate1= startOfDay(new Date(startDate));
      var  endDate2 = endOfDay(new Date(endDate));
        
    } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
    }

    var salesData = await orderCollection.find({
        orderDate: { $gte: startDate1, $lte: endDate2 },
        orderStatus: "Delivered"
    });
    
    salesData = salesData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });
    let totalSum=[]
    let total=[]
    let totalSum1=[]
    let total2=[]
    for(i=0;i<salesData.length;i++){
       totalSum = salesData[i].cartData.map((item) => item.productprice) 
       total.push(totalSum)
       totalSum1= salesData[i].cartData.map((item) => item.priceBeforeOffer) 
       total2.push(totalSum1)
    }
    let sum=total.flat()
    let sum2=total2.flat()
    let totalSales1 = sum.reduce((total, sale) =>total= total + sale, 0)
    let totalSales2= sum2.reduce((total, sale) =>total= total + sale, 0)
    let coupontotal= salesData.reduce((total, sale) =>total= total + sale.couponApplied, 0)
   let totalDiscount=coupontotal+totalSales2-totalSales1
    salesData.forEach((v) => {
      sheet.addRow({
        no: v.OrderId,
        orderDate: v.orderDateFormatted,
        products: v.cartData.map((v) => v.productName).join(", "),
        noOfItems: v.cartData.map((v) => v.productQuantity).join(", "),
        OfferPercentege: v.cartData.map((v) => v.productOfferPercentage).join("%, "),
        productPrice: v.cartData.map((v) => v.productprice).join("$, "),
        CouponAmount:v.couponApplied,
        totalCost: "$" + v.Total,
        paymentMethod: v.paymentType,
        status: v.orderStatus,
      });
    });
    
    const totalOrders = salesData.length;
    const totalSales = salesData.reduce(
      (total, sale) => total + sale.Total,
      0
    );
    
    
    
    // Adding an empty row for separation
    sheet.addRow({});
    
    // Adding total orders and total sales summary
    sheet.addRow({
      no: '',
      orderDate: '',
      products: '',
      
      noOfItems: 'Total Orders: ' + totalOrders,
      totalCost: 'Total Sales: $' + totalSales,
      CouponAmount:'TotalDiscount: $'+coupontotal,
      paymentMethod: '',
      status: ''
    });
    
    await workBook.xlsx.writeFile('path_to_your_file.xlsx');
    
    
  
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
    
    
}
catch(error){
  next(new AppError('Somthing went Wrong', 500));
}
}
  
  const removeAllFillters = async (req, res,next) => {
    try {
      req.session.salesDetails=null
      req.session.admin.datevalue=null
        res.redirect('/Sales')
    } catch (error) {
      next(new AppError('Somthing went Wrong', 500));
    }
}
module.exports={SalesReportGet,salesReportDownloadPDF,salesReportDownload,filterDate,removeAllFillters,filterDates}