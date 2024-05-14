const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection = require('../model/ProductOffer')
const categoryOfferCollection = require('../model/categoryOffer')


const BestOffer = async (req, res) => {
    try {
        
        const catOff = await categoryOfferCollection.find({ isAvailable: true })
        const productOff = await productOfferCollection.find({ isAvailable: true })
        const products = await productcollection.find({ isListed: true })

        const categoryOfferset = new Set(
            catOff.map((offer) => String(offer.category))
        )
        const productOfferset = new Set(
            productOff.map((offer) => String(offer.product))
        )
      
        
        for (i = 0; i < products.length; i++) {
            let productId = String(products[i]._id)
            let categoryId=String(products[i].parentCategory)
           
            let isInProdOffer = productOfferset.has(productId)
            let isInCatOffer = categoryOfferset.has(categoryId)
        
        
        


            if (isInCatOffer && isInProdOffer) {
            
                await havingBothOffers(productId, categoryId,products[i]);

            } else if (isInCatOffer || isInProdOffer) {
                let availOffer = isInProdOffer ? "productOffer" : "categoryOffer";

                await havingSingleOffer(availOffer, productId, categoryId, products[i]);
            }
        }
    }

    catch (error) {
        console.log(error)
    }
}

const havingBothOffers = async (productId, categoryId, prod) => {
    
    try {
      let prodOffer = await productOfferCollection.findOne({ product:productId });
      let catOffer = await categoryOfferCollection.findOne({
        category:categoryId,
      });
    

      let maxOffer = Math.max(
        prodOffer.offerPercentage,
        catOffer.offerPercentage
      );
      
  
      if (prod.productOfferPercentage !== maxOffer) {

        let offerId;
        if (prodOffer.offerPercentage === maxOffer) {
          offerId = prodOffer._id;
        } else if (catOffer.offerPercentage === maxOffer) {
          offerId = catOffer._id;
        }
  
        let productPrice = Math.round(
          prod.priceBeforeOffer * (1 - maxOffer * 0.01)
        );
       console.log(productPrice)
        result = await productcollection.updateOne(
          { _id: prod._id },
          {
            $set: {
              productPrice,
              productOfferId: offerId,
              productOfferPercentage: maxOffer,
            },
          }
        );
      }
    } catch (error) {
      console.log(
        "Error while cheking and updating the offers present in both :" + error
      );
    }
  };

const havingSingleOffer = async (
    availOffer,
    productId,
    categoryId,
    prod
  ) => {
    try {
      if (availOffer === "productOffer") {
        let prodOffer = await productOfferCollection.findOne({ product:productId});
        if (prod.productOfferPercentage !== prodOffer.offerPercentage) {
          let productPrice = Math.round(
            prod.priceBeforeOffer * (1 - prodOffer.offerPercentage * 0.01)
          );
  
          result = await productcollection.updateOne(
            { _id: prod._id },
            {
              $set: {
                productPrice,
                productOfferId: prodOffer._id,
                productOfferPercentage: prodOffer.offerPercentage,
              },
            }
          );
        }
      } else if (availOffer === "categoryOffer") {
        let catOffer = await categoryOfferCollection.findOne({
         category :categoryId,
        });
        if (prod.productOfferPercentage !== catOffer.offerPercentage) {
          let productPrice = Math.round(
            prod.priceBeforeOffer * (1 - catOffer.offerPercentage * 0.01)
          );
  
          result = await productcollection.updateOne(
            { _id: prod._id },
            {
              $set: {
                productPrice,
                productOfferId: catOffer._id,
                productOfferPercentage: catOffer.offerPercentage,
              },
            }
          );
        }
      }
    } catch (error) {
      console.log(
        "Error while applying offer for product holds single offer :" + error
      );
    }
  };
 
module.exports={BestOffer}
 