import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("DNS:", dns.getServers());

try {
  const conn = await mongoose.connect(
    "mongodb+srv://akash:bnaGFxh6p9BavBm1@cluster0.dyvk8bh.mongodb.net/Auction"
  );

  console.log("Connected:", conn.connection.host);

  process.exit(0);
} catch (e) {
  console.error(e);
}