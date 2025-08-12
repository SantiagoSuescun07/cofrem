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
                AUTH_SECRET:process.env.AUTH_SECRET,
                NEXTAUTH_URL:process.env.NEXTAUTH_URL,
                AUTH_TRUST_HOST:process.env.AUTH_TRUST_HOST
            }
        }
    ]
};