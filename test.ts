import { prisma } from "./lib/prisma.ts";

async function getAllUser() {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
    },
  });

  console.log(users);
}

getAllUser();
