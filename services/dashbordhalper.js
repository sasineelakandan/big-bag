const orderCollection = require('../model/ordermodel')
const userCollection = require('../model/usermodel')
const addressCollection = require('../model/addressmodel')
const productCollection = require('../model/productmodel')
const walletCollection=require('../model/Walletmodel')
module.exports = {
  currentDayRevenue: async () => {
    try {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const result = await orderCollection.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $match: { orderDate: { $gte: yesterday, $lt: today } } },
        { $group: { _id: "", totalRevenue: { $sum: "$Total" } } },
      ]);
      return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
      console.error(error);
    }
  },

  fourteenDaysRevenue: async () => {
    try {
      const result = await orderCollection.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
            dailyRevenue: { $sum: "$Total" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 14 },
      ]);
      return {
        date: result.map((v) => v._id),
        revenue: result.map((v) => v.dailyRevenue),
      };
    } catch (error) {
      console.error(error);
    }
  },

  categoryWiseRevenue: async () => {
    try {
      const result = await orderCollection.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $unwind: '$cartData' },
        {
          $lookup: {
            from: 'products', // assuming your product collection is named 'products'
            localField: 'cartData.productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $lookup: {
            from: 'categories', // assuming your category collection is named 'categories'
            localField: 'productDetails.parentCategory', // this should match the field in products
            foreignField: '_id', // this should match the primary key field in categories
            as: 'categoryDetails'
          }
        },
        { $unwind: '$categoryDetails' },
        {
          $group: {
            _id: '$categoryDetails.categoryname', // assuming 'categoryname' is the field you want to group by in 'categories'
            revenuePerCategory: { $sum: '$cartData.totalCostPerProduct' }
          }
        },
        { $sort: { _id: 1 } }
      ]).exec();
      


      return {
        categoryName: result.map(v => v._id),
        revenuePerCategory: result.map(v => v.revenuePerCategory)
      };
    } catch (error) {
      console.error(error);
    }
  },

  Revenue: async () => {
    try {
      const result = await orderCollection.find({ orderStatus: 'Delivered' });

      return {
        revenue: result.reduce((acc, curr) => (acc += curr.Total), 0)
      };
    } catch (error) {
      console.error(error);
    }
  },

  MonthlyRevenue: async () => {
    try {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 28);

      const result = await orderCollection.aggregate([
        { $match: { orderStatus: 'Delivered', orderDate: { $gte: lastMonth, $lt: today } } },
        { $group: { _id: "", MonthlyRevenue: { $sum: "$Total" } } },
      ]);
      return result.length > 0 ? result[0].MonthlyRevenue : 0;
    } catch (error) {
      console.error(error);
    }
  },
};