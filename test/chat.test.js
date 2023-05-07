// Import required libraries
const expect = require("chai").expect;
const io = require("socket.io-client");

// Import your server instance
const server = require("../"); // Update the path to your server instance

// Set up the server URL and options for the test
const socketURL = "http://localhost:3000";
const options = {
    transports: ["websocket"],
    "force new connection": true,
};

describe("Chat App Tests", () => {
    it("Allow a new user to join and broadcast the event", (done) => {
        const client1 = io.connect(socketURL, options);

        client1.on("connect", () => {
            client1.emit("new user", "user1");

            client1.on("welcome", () => {
                const client2 = io.connect(socketURL, options);

                client2.on("connect", () => {
                    client2.emit("new user", "user2");

                    client1.on("user join", (username) => {
                        expect(username).to.equal("user2");
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    });
                });
            });
        });
    });

    it("Emit a chat message event with sender and message", (done) => {
        const client = io.connect(socketURL, options);

        client.on("connect", () => {
            client.emit("new user", "user1");

            client.on("welcome", () => {
                client.emit("chat message", "Hello, World!");

                client.on("chat message", (formattedMessage) => {
                    expect(formattedMessage.sender).to.equal("user1");
                    expect(formattedMessage.message).to.equal("Hello, World!");
                    client.disconnect();
                    done();
                });
            });
        });
    });

    it("Emit a user leave event when a user disconnects", (done) => {
        const client1 = io.connect(socketURL, options);

        client1.on("connect", () => {
            client1.emit("new user", "user1");

            client1.on("welcome", () => {
                const client2 = io.connect(socketURL, options);

                client2.on("connect", () => {
                    client2.emit("new user", "user2");

                    client1.on("user join", (username) => {
                        expect(username).to.equal("user2");
                        client2.disconnect();

                        client1.on("user leave", (user) => {
                            expect(user).to.equal("user2");
                            client1.disconnect();
                            done();
                        });
                    });
                });
            });
        });
    });
});
