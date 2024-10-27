const filter = async (req, res) => {
    try {
        let productDetail = req.session.productDetail || await productCollection.find({ isListed: true })
        let start = 0, end = Infinity
        if (req.params.by === 'byPrice') {

            switch (req.query.priceRange) {
                case '0': {
                    start = 0; end = 500
                    break
                }
                case '1': {
                    start = 500; end = 1000
                    break
                }
                case '2': {
                    start = 1000; end = 1500
                    break
                }
                case '3': {
                    start = 1500; end = Infinity
                    break
                }
            }
        } else {
            productDetail = await productCollection.find({ isListed: true, parentCategory: req.query.id })
        }

        productDetail = productDetail.filter((val) => {
            
            return val.productPrice > start && val.productPrice < end
        })

        req.session.productDetail = productDetail

        res.redirect('/shop')

    } catch (err) {
        console.log(err);
    }
}

const shopSort = async (req, res) => {
    try {
        let productDetail = req.session.productDetail || await productCollection.find({ isListed: true })
        switch (req.query.sortBy) {
            case 'priceAsc': {
                productDetail = productDetail.sort((a, b) => a.productPrice - b.productPrice)
                break;
            }
            case 'priceDes': {
                productDetail = productDetail.sort((a, b) => b.productPrice - a.productPrice)
                break;
            }
            case 'nameAsc': {
                productDetail = productDetail.sort((a, b) => a.productName.localeCompare(b.productName))
                break;
            }
            case 'nameDes': {
                productDetail = productDetail.sort((a, b) => b.productName.localeCompare(a.productName))
                break;
            }
            case 'newProduct': {
                productDetail = productDetail.sort((a, b) => b._id - a._id)
                break;
            }
        }
        req.session.productDetail = productDetail
        res.send({ success: true })
    } catch (err) {
        console.log(err)
    }
}


