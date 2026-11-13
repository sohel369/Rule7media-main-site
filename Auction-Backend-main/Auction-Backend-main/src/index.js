
import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js"
import connectDB from './db/index.js';
import http from "http";
import { Server } from "socket.io";
import  {socketIoConnectioin}  from './socketio/socketio.js';
import { startCampaignScheduler } from './cronJobs.js';
import dns from "node:dns";
const server = http.createServer(app);


// Force Node to use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', "http://localhost:5174", 'https://rule7media.com', 'https://www.rule7media.com'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);
connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT || 8000}`);
      startCampaignScheduler();
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });



socketIoConnectioin()

export { io, server  }