const jwt = require("jsonwebtoken");

const genAuthToken = (user) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  const jwtExpiry = process.env.JWT_EXPIRY_DATE;

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      password: user.password,
    },
    jwtSecretKey,
    {
      expiresIn: jwtExpiry,
    }
  );
  return token;
};

module.exports = genAuthToken;
