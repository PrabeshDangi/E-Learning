const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");

app.on("error", (e) => {
  console.error("Error:", e);
  throw error;
});

try {
  app.listen(process.env.PORT, () => {
    console.log(`Server started at port ${process.env.PORT}`);
  });
} catch (error) {
  console.log("Error connecting to the server!!");
}
