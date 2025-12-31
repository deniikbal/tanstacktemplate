import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
    const sql = neon(process.env.DATABASE_URL);

    try {
        // Find the first user
        const users = await sql`SELECT id, email FROM "user" LIMIT 1`;
        if (users.length === 0) {
            console.log('No users found');
            return;
        }

        const firstUser = users[0];
        await sql`UPDATE "user" SET role = 'admin' WHERE id = ${firstUser.id}`;

        console.log(`Successfully elevated ${firstUser.email} to admin`);
    } catch (err) {
        console.error('Error elevating user:', err);
    }
}

main();
