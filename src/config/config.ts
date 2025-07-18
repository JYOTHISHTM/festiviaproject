import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
};

export default config;
