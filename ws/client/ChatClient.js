const { WebSocket } = require('ws');
const crypto = require('crypto');

class ChatClient {
    constructor(options) {
        this.ws = new WebSocket(options.url);
        this.sessionId = options.sessionId || null;
        this.username = options.username;
        this.secretKey = crypto.scryptSync(options.secretKey, 'salt', 32); // Генеруємо ключ шифрування
    }

    init() {
        this.ws.on('open', () => this.onOpen());
        this.ws.on('message', (data) => this.onMessage(data));
        this.ws.on('error', console.error);
    }

    onOpen() {
        console.log('connected');
        this.ws.send(JSON.stringify({
            type: 'options',
            sessionId: this.sessionId,
            data: {
                username: this.username
            }
        }));
    }

    onMessage(data) {
        const parsedData = JSON.parse(data);

        switch (parsedData.type) {
            case 'message':
                try {
                    const decryptedMessage = this.decryptMessage(parsedData.data.message);
                    console.log(`${parsedData.data.sender} >>: ${decryptedMessage}`);
                } catch (err) {
                    console.error('Failed to decrypt message:', err.message);
                }
                break;
            case 'options':
                this.setOptions(parsedData);
                break;
            default:
                console.log('unknown message type');
        }
    }

    setOptions(msgObject) {
        this.sessionId = msgObject.sessionId;
        console.log('Your sessionId: ', this.sessionId);
    }

    send(message) {
        const encryptedMessage = this.encryptMessage(message);
        const msgObject = {
            type: 'message',
            sessionId: this.sessionId,
            data: {
                message: encryptedMessage
            }
        };
        this.ws.send(JSON.stringify(msgObject));
    }

    encryptMessage(message) {
        const iv = crypto.randomBytes(16); // Генеруємо унікальний IV для кожного повідомлення
        const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, iv);
        let encrypted = cipher.update(message, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decryptMessage(encryptedMessage) {
        const [ivHex, encryptedText] = encryptedMessage.split(':'); // Розділяємо IV і зашифрований текст
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

module.exports = { ChatClient };