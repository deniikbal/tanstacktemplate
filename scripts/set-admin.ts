import { db } from "../src/lib/db";
import { user } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const users = await db.select().from(user).limit(1);
    if (users.length === 0) {
        console.log("No users found");
        return;
    }

    const firstUser = users[0];
    await db.update(user)
        .set({ role: "admin" })
        .where(eq(user.id, firstUser.id));

    console.log(`Updated user ${firstUser.email} to admin role`);
    process.exit(0);
}

main().catch(console.error);
