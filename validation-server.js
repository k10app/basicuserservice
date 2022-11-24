require('dotenv').config()

const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');

var pubkey = fs.readFileSync(process.env.PUBLIC_KEY,"utf8")

var port = 1080;




var app = express();
app.use(express.json());

app.get("/", async (req, res) => {
    const token = req.headers.authorization.split(" ")
    if (token.length > 1 && token[0] == "Bearer") {
        try {
            const result = jwt.verify(token[1],pubkey)
            res.json({status:"ok",login:result.login,exp:result.exp})
        } catch (error) {
            console.log("verify error",error)
            res.status(403).send("Verify error")
        }
    } else {
        res.status(403).send("No jwt")
    }
    
});

app.listen(port, () => {
    console.log("Server running on port "+port);
});  