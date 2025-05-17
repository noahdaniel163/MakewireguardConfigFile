const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const QRCode = require('qrcode');

const app = express();
const PORT = 6960;
const CONFIG_DIR = path.join(__dirname, 'configs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure configs directory exists
if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Helper function to generate WireGuard keys using wg command-line tools
function generateKeys() {
    try {
        const privateKey = execSync('wg genkey').toString().trim();
        const publicKey = execSync(`echo "${privateKey}" | wg pubkey`).toString().trim();
        return { privateKey, publicKey };
    } catch (error) {
        console.error("Error generating keys with wg tools:", error);
        throw new Error('Failed to generate WireGuard keys.');
    }
}

// Route to serve the main page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to generate WireGuard keys
app.post('/api/generate-keys', (req, res) => {
    try {
        const { privateKey } = req.body;
        let result;

        if (!privateKey) {
            result = generateKeys();
        } else {
            const publicKey = execSync(`echo "${privateKey}" | wg pubkey`).toString().trim();
            result = { privateKey, publicKey };
        }

        res.json({ success: true, ...result });
    } catch (error) {
        console.error("API Error - /api/generate-keys:", error.message);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate or derive keys' });
    }
});

// API route to generate WireGuard config file and QR code
app.post('/api/generate-config', async (req, res) => {
    try {
        const {
            name,
            privateKey,
            address,
            dns = '1.1.1.1',
            listenPort,
            publicKeyServer,
            presharedKey,
            allowedIPs,
            endpoint,
            persistentKeepalive
        } = req.body;

        if (!name || !privateKey || !address || !publicKeyServer || !allowedIPs || !endpoint) {
            return res.status(400).json({ success: false, error: 'Missing required fields. Please fill out all mandatory fields.' });
        }

        if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/\d{1,2})?$/.test(address.split('/')[0])) {
            return res.status(400).json({ success: false, error: 'Invalid Address format. Please use CIDR notation (e.g., 10.13.13.2/24).' });
        }
        if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[:\d]*$|^([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,})[:\d]*$/.test(endpoint)) {
            return res.status(400).json({ success: false, error: 'Invalid Endpoint format. Must be IP:Port or domain:Port.' });
        }
        if (listenPort && isNaN(parseInt(listenPort))) {
            return res.status(400).json({ success: false, error: 'Listen Port must be a number.' });
        }
        if (persistentKeepalive && isNaN(parseInt(persistentKeepalive))) {
            return res.status(400).json({ success: false, error: 'Persistent Keepalive must be a number.' });
        }

        let finalEndpoint = endpoint;
        if (listenPort && !endpoint.includes(':')) {
            finalEndpoint = `${endpoint}:${listenPort}`;
        }

        let configContent = `[Interface]\nPrivateKey = ${privateKey}\nAddress = ${address}\n`;
        if (dns) configContent += `DNS = ${dns}\n`;

        configContent += `\n[Peer]\nPublicKey = ${publicKeyServer}\nAllowedIPs = ${allowedIPs}\nEndpoint = ${finalEndpoint}\n`;
        if (persistentKeepalive) configContent += `PersistentKeepalive = ${persistentKeepalive}\n`;
        if (presharedKey) configContent += `PresharedKey = ${presharedKey}\n`;

        const configFilename = path.join(CONFIG_DIR, `${name}.conf`);
        fs.writeFileSync(configFilename, configContent);

        const qrCodeData = await QRCode.toDataURL(configContent);
        const qrImageFilename = path.join(CONFIG_DIR, `${name}_qrcode.png`);
        const base64Data = qrCodeData.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(qrImageFilename, base64Data, 'base64');

        res.json({
            success: true,
            configFile: `${name}.conf`,
            qrCodeFile: `${name}_qrcode.png`,
            qrCodeData,
            configContent,
            listenPortMessage: listenPort ?
                `ListenPort (${listenPort}) integrated into Endpoint: ${finalEndpoint}` :
                'No ListenPort provided (ensure Endpoint includes port, e.g., server:13231)'
        });
    } catch (error) {
        console.error("API Error - /api/generate-config:", error);
        res.status(500).json({ success: false, error: 'Failed to generate config or QR code. ' + error.message });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(CONFIG_DIR, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Download error for file:", filename, err);
                res.status(500).send('Error downloading file.');
            }
        });
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(PORT, () => {
    console.log(`WireGuard Web App running at http://192.168.0.206:${PORT}`);
});