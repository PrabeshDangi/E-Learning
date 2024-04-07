const jwt = require("jsonwebtoken");
const prisma = require("../prisma/index");

const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer", "");

    //console.log(token);

    if (!token) {
      res.status(401);
      throw new Error("Unauthorized request error!!");
    }

    const jwtDecodedInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: {
        id: jwtDecodedInfo.id,
      },
    });

    if (!user) {
      res.status(401);
      throw new Error("Unauthorized access token!!");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = verifyJWT;
