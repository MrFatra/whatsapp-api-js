const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    // Cetak QR Code ke terminal untuk scan
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');

    sendMessagePersonal('FWnowQ1qR3cGGTMd6ICut6@g.us', 'Hello World!');

    // Mengambil daftar chat
    const chats = await client.getChats();

    // Mencari grup dan ID-nya
    const groups = chats.filter(chat => chat.isGroup);
    console.log('Groups: ', groups);
    // groups.forEach(group => {
    //     console.log(`Group name: ${group.name}, Group ID: ${group.id._serialized}`);
    // });
});

client.on('message', (message) => {
    // dapatkan id group nya
    const groupId = message.isGroup ? message.group : '';
    console.log(`Message: ${message.body} | Group ID: ${groupId}`);
    if (message.isGroupMsg) {
        console.log(`Group: ${message.getChat().name} | ${message.getChat().id._serialized}`);
    }
});

const sendMessagePersonal = (number, message) => {

    // Mengirim pesan ke nomor pribadi
    client.sendMessage(number, message)
        .then(() => console.log(`Pesan berhasil dikirim ke nomor ${number}`))
        .catch((err) => console.error('Gagal mengirim pesan:', err));
};




client.initialize();
