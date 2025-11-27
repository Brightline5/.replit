import { StackServerApp } from "@stackframe/js";

const stackServerApp = new StackServerApp({
  // You should store these in environment variables based on your project setup
  projectId: "eb04e940-25a6-4888-85b6-041d6fdcf015",
  publishableClientKey: "pck_83xp3d7kgbqssrrrb9x133ke9c6p6r2zkp6bwgtn0d4k8",
  secretServerKey: "ssk_qjgx8dw95gz8vz9p01rxkd663x4mpy236tkd5cnkv8vy8",
  tokenStore: "memory",
});
