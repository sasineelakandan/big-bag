const isadmin = (req, res, next) => {
  try {
    if (req.session.admin) {
      next();
    } else {
      res.redirect('/admin')
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports={isadmin}
