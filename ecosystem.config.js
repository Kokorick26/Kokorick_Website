module.exports = {
    apps: [
        {
            name: "kokorick-server",
            script: "./server/index.js",
            env: {
                NODE_ENV: "production",
                PORT: 5000
            }
        }
    ]
};
