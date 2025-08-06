require('dotenv').config({ path: '/var/www/client/.env' });

module.exports = {
    apps: [
        {
            name: "cofrem",
            script: "npm",
            args: "start",
            cwd: "/var/www/client",
            env: {
                NODE_ENV: "production",
                DATABASE_URL: process.env.DATABASE_URL,
                AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
                AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
            }
        }
    ]
};