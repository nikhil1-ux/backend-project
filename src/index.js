import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const { default: connectDB } = await import("./db/index.js");
const { app } = await import("./app.js");

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION FAILED !!", error);
  });