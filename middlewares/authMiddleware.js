const jwt = require("jsonwebtoken");
const prisma = require("../prisma/index");
const ApiError = require("../utils/ApiError");

const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer", "");

    //console.log(token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request error!!");
    }

    const jwtDecodedInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: {
        id: jwtDecodedInfo.id,
      },
    });

    if (!user) {
      throw new ApiError(401, "Unauthorized access token!!");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const authorizeRoles = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({
          message: `${req.user.role} cannot proceed with this request!!`,
        });
    }
    next();
  };
};

//For multiple roles to get access
// const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       res
//         .status(403)
//         .json({ message: `${req.user.role} cannot access this file` });
//     }
//     next();
//   };
// };

module.exports = { verifyJWT, authorizeRoles };
