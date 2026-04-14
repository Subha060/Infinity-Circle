import { prisma } from "./lib/prisma.ts";

async function getAllUser() {
  const users = await prisma.user.findMany();

  console.log(users);
}

getAllUser();
