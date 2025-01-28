const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

class WhatsAppClient {
    constructor() {
        this.client = new Client();
        this.initializeEvents();
    }

    initializeEvents() {
        this.client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', async () => {
            console.log('Client is ready!');
            await this.sendMessageToGroup(); // Panggil fungsi untuk mendapatkan ID grup
        });
    }
    
    async sendMessageToGroup() {
        try {
            const groupName = "P2D"
            this.client.getChats().then(chats => {
                const group = chats.find(chat => chat.isGroup && chat.name === groupName)

                group ? console.log(group.id) : console.log('Grup Dengan Nama P2D tidak ada')
            });
        } catch (error) {
            console.error('Gagal:', error);
        }
    }

    sendMessagePersonal(number, date, time) {
        this.client.sendMessage(number, 
            `*📢 PENGUMUMAN JADWAL POSYANDU DESA MUNCANGELA 📢*\n\nKepada seluruh warga Desa Muncangela,\nKami ingin menginformasikan jadwal pelaksanaan Posyandu untuk bulan ini. Mari hadiri dan manfaatkan layanan kesehatan yang disediakan untuk balita, ibu hamil, dan lansia.\n\n📅 Hari/Tanggal: ${date}\n⏰ Waktu: ${time}\n📍 Tempat: Di Posyandu Dusun Masing-Masing\n\nLayanan yang tersedia:\nPemeriksaan kesehatan balita (timbang berat badan, ukur tinggi badan, dll.)\n- Imunisasi\n- Pemeriksaan kesehatan ibu hamil\n- Konsultasi gizi dan kesehatan\n- Layanan kesehatan lansia\n\nAyo, datang tepat waktu dan jangan lewatkan kesempatan ini untuk menjaga kesehatan keluarga kita!\nUntuk informasi lebih lanjut, silakan hubungi:\n📞 [+62xxxxxxxxx]\nTerima kasih atas perhatian dan partisipasinya.\nSalam sehat,\nTim Posyandu Desa Muncangela\n`)
            .then(() => console.log(`Pesan berhasil dikirim ke nomor ${number}`))
            .catch((err) => console.error('Gagal mengirim pesan:', err));
    }
    
    async getGroup(res){
        const chats = await  this.client.getChats()
        const groupChats = chats.filter((chat) => chat.isGroup)

        let hasil = ""
        groupChats.forEach((chat) => hasil = chat.name + "|" + chat.id +"\n")

        res.send(hasil)
    }

    initialize() {
        this.client.initialize();
    }
}

class WhatsAppAPI {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.whatsAppClient = new WhatsAppClient();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
    }

    setupRoutes() {
            this.app.post('/send-message', (req, res) => {
                const { number, date, time } = req.body;
    
                if (!date || !time) {
                    return res.status(400).json({ error: 'Nomor dan yang lain harus diisi' });
                }
            
                // Konversi string tanggal ke objek Date
                const dateObj = new Date(date);
            
                // Validasi apakah tanggal valid
                if (isNaN(dateObj.getTime())) {
                    return res.status(400).json({ error: 'Format tanggal tidak valid' });
                }
            
    
                const formattedNumber = this.formatPhoneNumber(number);
                const formatDate = this.formatTanggal(dateObj)
                this.whatsAppClient.sendMessagePersonal(formattedNumber, formatDate, time);
                res.json({ success: true, message: 'Pesan sedang dikirim', formattedNumber });
            });

            this.app.get('/allGroup', async (req, res) => {
                this.whatsAppClient.getGroup(res);
            })
    }

    formatTanggal(date) {
        const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const bulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
    
        const namaHari = hari[date.getDay()]; // Ambil nama hari
        const tanggal = date.getDate(); // Ambil tanggal (1-31)
        const namaBulan = bulan[date.getMonth()]; // Ambil nama bulan
        const tahun = date.getFullYear(); // Ambil tahun
    
        return `${namaHari} ${tanggal} ${namaBulan} ${tahun}`;
    }

    formatPhoneNumber(number) {
        // Jika nomor diawali dengan 0, ganti dengan 62
        if (number.startsWith('0')) {
            return '62' + number.slice(1) + '@c.us';
        }
        // Jika nomor sudah diawali dengan 62, langsung kembalikan
        return number.endsWith('@c.us') ? number : number + '@c.us';
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server berjalan di http://localhost:${this.port}`);
        });
        this.whatsAppClient.initialize();
    }
}

// Jalankan aplikasi
const whatsAppAPI = new WhatsAppAPI();
whatsAppAPI.start();