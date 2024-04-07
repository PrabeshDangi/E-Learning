const genAuthToken = require("./generateAuthToken");
const prisma = require("../prisma/index");

const sendtoken = async (userAvailable, statuscode, res) => {
  const token = genAuthToken(userAvailable);
  // console.log(token);
  // console.log(userAvailable.email);
  // console.log(userAvailable);

  const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
  };

  const loggedInUser = await prisma.user.findUnique({
    where: {
      id: userAvailable?.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return res.status(statuscode).cookie("token", token, cookieOptions).json({
    success: true,
    message: "User logged in successfully",
    user: loggedInUser,
    token,
  });
};

module.exports = sendtoken;
