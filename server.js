require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // 정적 폴더 설정

// HTML 파일에서 Client Key를 가져가기 위한 API (환경변수 보호용)
app.get('/api/config', (req, res) => {
    res.json({ clientKey: process.env.TOSS_CLIENT_KEY });
});

// 토스 공식 예제 스타일의 승인 API
app.post('/confirm', async function (req, res) {
    const { paymentKey, orderId, amount } = req.body;
    const secretKey = process.env.TOSS_SECRET_KEY;
    
    // 토스페이먼츠 인증용 Basic 토큰 생성
    const encryptedSecretKey = "Basic " + Buffer.from(secretKey + ":").toString("base64");

    try {
        const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
            method: "POST",
            headers: {
                Authorization: encryptedSecretKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                paymentKey,
                orderId,
                amount,
            }),
        });

        // 토스 서버의 응답을 그대로 클라이언트에 전달
        const data = await response.json();
        console.log(data);
        res.status(response.status).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));