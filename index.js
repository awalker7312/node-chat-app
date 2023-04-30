const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

const users = new Map();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle new user event
    socket.on("new user", (username) => {
        if (Array.from(users.values()).includes(username)) {
            socket.emit("username taken", username);
        } else {
            users.set(socket.id, username);
            socket.emit("welcome");
            socket.broadcast.emit("user join", username);
            io.emit("user list", Array.from(users.values()));
        }
    });

    // Handle chat message event
    socket.on("chat message", (message) => {
        const sender = users.get(socket.id);
        const formattedMessage = { sender, message };
        io.emit("chat message", formattedMessage);
    });

    // Handle user disconnection event
    socket.on("disconnect", () => {
        // ...
        const user = users.get(socket.id);
        if (user) {
            socket.broadcast.emit("user leave", user);
        }
        users.delete(socket.id);
        io.emit("user list", Array.from(users.values()));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
