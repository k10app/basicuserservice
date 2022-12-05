require('dotenv').config()

/*
POST /user/register {login,email,password} -> return JWT in {status:"ok",jwt:$jwt}
POST /user/login {login,password} -> return JWT in {status:"ok",jwt:$jwt}
GET /user/pubkey -> return pubkey of the server
GET /user/users -> list all users
*/

const fs = require('fs');
const express = require('express');
const mariadb = require('mariadb');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require('cors');


var port = process.env.SERVER_PORT || 80;


var privateKey = fs.readFileSync(process.env.PRIVATE_KEY,"utf8")
var publicKey = fs.readFileSync(process.env.PUBLIC_KEY,"utf8")

var jwtLifeTime = process.env.JWT_TOKEN_LIFETIME
console.log("lifetime ",jwtLifeTime)

console.log(publicKey)

var routePrefix = process.env.ROUTE_PREFIX || '/user' 

var db = mariadb.createPool({
    host: process.env.MARIADB_HOST || 'localhost', 
    port: process.env.MARIADB_PORT || '3306',
    user: process.env.MARIADB_USER || 'userdblogin', 
    password: process.env.MARIADB_PASSWORD || 'userdbpassword',
    database: process.env.MARIADB_DATABASE || 'userdb',
    connectionLimit: 10
});


function startServer() {
    var app = express();

    app.use(express.json());
    
    app.use(cors());

    app.get("/", async (req, res) => {
        res.status(404).send("unrecognized route")
    });
    app.post(routePrefix+"/register",  async (req, res) => {
        const { login, email, password } = req.body;

        if (!login || !email || !password ) {
            console.log("invalid request ",req.body)
            res.status(400).json({status:"error",message:"Some field not found { login, email, password }"});
        } else {
            try {
                const salt = crypto.randomBytes(8).toString('hex')
                const encryptedPassword = salt+":"+crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
    
                const conn = await db.getConnection()
                conn.query("insert into users (login,email,passwordHash) values (?,?,?)", [login,email,encryptedPassword]).then(v=> {
                    console.log("user created",v)
                    var token = jwt.sign({ login: login, email: email}, privateKey, { algorithm: 'RS256', expiresIn:jwtLifeTime});
                    res.json({status:"ok",jwt:token});
                }).catch(err=>{
                    //https://mariadb.com/kb/en/mariadb-error-codes/
                    if (err.code === 'ER_DUP_ENTRY') {
                        console.log("user not created because of duplicate")
                        res.status(400).json({status:"error",message:"already user login or email"});
                    } else {
                        console.log("user not created",err)
                        res.status(400).json({status:"error",message:"unspecified backend err"});
                    }
                    
                }).finally(() => {
                    conn.release()
                })
            } catch (err) {
                throw err;
            }
        }  
    })
    app.get(routePrefix+"/pubkey", (req,res)=>{
        res.status(200).type("text/plain").send(publicKey)
    })
    app.post(routePrefix+"/login", async (req, res) => {
        const { login, password } = req.body;
        if (!login || !password ) {
            console.log("invalid request ",req.body)
            res.status(400).json({status:"error",message:"Some field not found { login, email, password }"});
        } else {
            try {
                const conn = await db.getConnection()
                conn.query("select passwordHash,email from users where login = ? limit 1", [login]).then(v=> {
                    if (v.length ==1) {
                        const user = v[0]
                        const knownHash = user.passwordHash.split(":")
                        const encryptedPassword = crypto.pbkdf2Sync(password,knownHash[0],1000,64,'sha512').toString('hex')
                        if (encryptedPassword === knownHash[1]) {
                            var token = jwt.sign({ login: login, email: user.email}, privateKey, { algorithm: 'RS256', expiresIn:jwtLifeTime});
                            res.json({status:"ok",jwt:token});
                        } else {
                            console.log("user hash no match",login)
                            res.status(403).json({status:"error",message:"invalid password"});
                        }
                    } else {
                        console.log("user not found",login)
                        res.status(400).json({status:"error",message:"user not found"});
                    }
                    
                }).catch(err=>{
                        console.log("user query error",err)
                        res.status(400).json({status:"error",message:"unspecified backend err"});
                }).finally(() => {
                    conn.release()
                })
            } catch (err) {
                throw err;
            }
        }  
        
    })
    
    app.get(routePrefix+"/users", async (req,res)=> {
        try {
            const conn = await db.getConnection()
            const query = await conn.query("select * from users");
            res.json(query);
        } catch (err) {
            throw err;
        }
    })

    app.get(routePrefix+"/verify", async (req, res) => {
        const token = req.headers.authorization.split(" ")
        if (token.length > 1 && token[0] == "Bearer") {
            try {
                const result = jwt.verify(token[1],publicKey)
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
    
}


//Init wrapper just to make a valid database if it does not exists
//Removes any issue with setup
const sqlCreateTable = `CREATE TABLE IF NOT EXISTS \`users\` (
	\`id\` INT NOT NULL AUTO_INCREMENT UNIQUE,
	\`login\` VARCHAR(128) NOT NULL UNIQUE,
	\`email\` VARCHAR(256) NOT NULL UNIQUE,
	\`passwordHash\` TEXT NOT NULL,
	PRIMARY KEY (\`id\`)
);`

db.getConnection().then(conn => {
    conn.execute(sqlCreateTable).then(res=> {
        console.log("init success",res)
        startServer()
    }).catch(err=> {
        console.log("err create",err)
        throw err
    })
}).catch(err => {
    console.log("err con",err)
    throw err
})
     


