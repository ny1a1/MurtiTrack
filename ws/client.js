const readline = require('node:readline');

const { ChatClient } = require('./client/ChatClient');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let username = '';
let secretKey = '';

const askUsername = () => {
    rl.question("What's your name? ", (answer) => {
        username = answer.trim();
        if (!username) {
            console.log('Name cannot be empty.');
            return askUsername();
        }
        askKey();
    });
};

const askKey = () => {
    rl.question("Enter your encryption key: ", (answer) => {
        secretKey = answer.trim();
        if (!secretKey) {
            console.log('Encryption key cannot be empty.');
            return askKey();
        }
        startChat();
    });
};

const startChat = () => {
    const client = new ChatClient({
        url: 'ws://localhost:8080',
        username: username,
        secretKey: secretKey,
    });

    client.init();

    rl.on('line', (input) => {
        if (input.trim().toLowerCase() === 'exit') {
            rl.close();
            process.exit(0);
        } else {
            client.send(input);
        }
    });
};

askUsername();