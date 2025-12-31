const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        // Find the first user
        const res = await client.query('SELECT id, email FROM "user" LIMIT 1');
        if (res.rows.length === 0) {
            console.log('No users found');
            return;
        }

        const firstUser = res.rows[0];
        await client.query('UPDATE "user" SET role = $1 WHERE id = $2', ['admin', firstUser.id]);

        console.log(`Successfully elevated ${firstUser.email} to admin`);
    } catch (err) {
        console.error('Error elevating user:', err);
    } finally {
        await client.end();
    }
}

main();
