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
        { $match: { orderStatus: 'Delivered', orderDate: { $gte: yesterday, $lt: today } } },
        { $group: { _id: "", totalRevenue: { $sum: "$Total" } } },
      ])
      return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
      console.error(error);
      return 0; // Return 0 in case of error
    }
  },

  fourteenDaysRevenue: async (filter) => {
    try {
      
      let startDate;
      switch(filter) {
          case 'week':
              startDate = new Date();
              startDate.setDate(startDate.getDate() - 7);
              break;
          case '2week':
              startDate = new Date();
              startDate.setDate(startDate.getDate() - 14);
              break;
          case 'month':
              startDate = new Date();
              startDate.setMonth(startDate.getMonth() - 1);
              break;
          case 'year':
              startDate = new Date();
              startDate.setFullYear(startDate.getFullYear() - 1);
              break;
          default:
              // Default to 14 days if no filter specified
              startDate = new Date();
              startDate.setDate(startDate.getDate() - 14);
      }
      
      const result = await orderCollection.aggregate([
          { $match: { orderStatus: 'Delivered', orderDate: { $gte: startDate } } },
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                  dailyRevenue: { $sum: "$Total" },
              },
          },
          { $sort: { _id: -1 } },
          
      ])
      
      return {
          date: result.map((v) => v._id),
          revenue: result.map((v) => v.dailyRevenue),
      };
    } catch (error) {
      console.error(error);
      return { date: [], revenue: [] }; // Return empty arrays in case of error
    }
  },

  categoryWiseRevenue: async (filter) => {
    try {
      let startDate;
      switch(filter) {
          case 'week':
              startDate = new Date();
              startDate.setDate(startDate.getDate() - 7);
              break;
          case '2week':
              startDate = new Date();
              startDate.setDate(startDate.getDate() - 14);
              break;
          case 'month':
              startDate = new Date();
              startDate.setMonth(startDate.getMonth() - 1);
              break;
          case 'year':
              startDate = new Date();
              startDate.setFullYear(startDate.getFullYear() - 1);
              break;
          default:
              // Default to 14 days if no filter specified
              startDate = new Date();
              startDate.setDate(startDate.getDate() - 14);
      }

      const result = await orderCollection.aggregate([
        { $match: { orderStatus: 'Delivered', orderDate: { $gte: startDate } } },
        { $unwind: '$cartData' },
        {
          $lookup: {
            from: 'products',
            localField: 'cartData.productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDetails.parentCategory',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        },
        { $unwind: '$categoryDetails' },
        {
          $group: {
            _id: '$categoryDetails.categoryname',
            revenuePerCategory: { $sum: '$cartData.totalCostPerProduct' }
          }
        },
        { $sort: { _id: 1 } }
      ])

      return {
        categoryName: result.map(v => v._id),
        revenuePerCategory: result.map(v => v.revenuePerCategory)
      };
    } catch (error) {
      console.error(error);
      return { categoryName: [], revenuePerCategory: [] }; // Return empty arrays in case of error
    }
  },

  Revenue: async () => {
    try {
      const result = await orderCollection.find({ orderStatus: 'Delivered' })

      return {
        revenue: result.reduce((acc, curr) => (acc += curr.Total), 0)
      };
    } catch (error) {
      console.error(error);
      return { revenue: 0 }; // Return 0 in case of error
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
      ])
      return result.length > 0 ? result[0].MonthlyRevenue : 0;
    } catch (error) {
      console.error(error);
      return 0; // Return 0 in case of error
    }
  },
};
