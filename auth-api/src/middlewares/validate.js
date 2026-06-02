const validate = (requiredFields) => {
  return (req, res, next) => {                        //returns middleware function
    const missing = requiredFields.filter(field => !req.body[field]);           //check which fields are missing

    if (missing.length > 0) {                      //check if there are any missing fields
      return res.status(400).json({                //send error response (400: Bad Request)
        success: false,                            //API failed
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();                                  //if everything valid: call next middleware/route handler
  };
};

module.exports = validate;