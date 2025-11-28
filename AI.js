const express = require("express");
const mysql = require("mysql2");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.set("trust proxy", true);

// MySQL
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "AI"
});

function getIP(req) {
    return req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "unknown";
}

function log(ip, status) {
    db.query("INSERT INTO ip_logs (ip, timestamp, status) VALUES (?, ?, ?)",
        [ip, Date.now(), status]);
}

/* LOGIN LIMITER */
const loginState = {};
const LOGIN_LIMIT = 5;
const LOGIN_BLOCK = 60 * 1000;

app.post("/login", (req, res) => {
    const ip = getIP(req);
    const { username, password } = req.body;

    if (!loginState[ip]) loginState[ip] = { fails: 0, blockedUntil: 0 };
    const st = loginState[ip];
    const now = Date.now();

    if (st.blockedUntil > now) {
        return res.json({
            blocked: true,
            message: `Blocked for ${Math.ceil((st.blockedUntil - now)/1000)}s`
        });
    }

    if (username === "admin" && password === "123") {
        st.fails = 0;
        log(ip, "login_success");
        return res.json({ success: true });
    }

    st.fails++;
    log(ip, "login_fail");

    if (st.fails >= LOGIN_LIMIT) {
        st.blockedUntil = now + LOGIN_BLOCK;
        return res.json({ blocked: true, message: "Too many attempts! Blocked 1 minute." });
    }

    res.json({ success: false, message: `Wrong (${st.fails}/5)` });
});

/* BUTTON LIMITER */
const buttonState = {};
const BTN_LIMIT = 5;
const BTN_WINDOW = 15000;
const BTN_BLOCK = 30000;

app.post("/click", (req, res) => {
    const ip = getIP(req);
    const now = Date.now();

    if (!buttonState[ip]) buttonState[ip] = { clicks: [], blockedUntil: 0 };
    const st = buttonState[ip];

    if (st.blockedUntil > now) {
        return res.json({
            blocked: true,
            message: `Blocked for ${Math.ceil((st.blockedUntil - now)/1000)}s`
        });
    }

    st.clicks = st.clicks.filter(t => now - t < BTN_WINDOW);
    st.clicks.push(now);

    if (st.clicks.length > BTN_LIMIT) {
        st.blockedUntil = now + BTN_BLOCK;
        log(ip, "button_blocked");
        return res.json({ blocked: true, message: "Too many clicks! Blocked 30s" });
    }

    log(ip, "button_click");
    res.json({ success: true, message: "Button clicked!" });
});

/* CHAT LIMITER */
const chatState = {};
const CHAT_LIMIT = 4;
const CHAT_WINDOW = 10000;
const CHAT_BLOCK = 20000;

app.post("/message", (req, res) => {
    const ip = getIP(req);
    const now = Date.now();
    const { text } = req.body;

    if (!chatState[ip]) chatState[ip] = { msgs: [], blockedUntil: 0 };
    const st = chatState[ip];

    if (st.blockedUntil > now) {
        return res.json({
            blocked: true,
            message: `Blocked for ${Math.ceil((st.blockedUntil - now)/1000)}s`
        });
    }

    st.msgs = st.msgs.filter(t => now - t < CHAT_WINDOW);
    st.msgs.push(now);

    if (st.msgs.length > CHAT_LIMIT) {
        st.blockedUntil = now + CHAT_BLOCK;
        log(ip, "chat_blocked");
        return res.json({ blocked: true, message: "Too many messages! Blocked 20s" });
    }

    log(ip, "chat_message");
    res.json({ success: true, echo: text });
});

/* START LOCAL SERVER */
app.listen(3000, () => {
    console.log("Local server running at http://localhost:3000");
    exec("start http://localhost:3000/AI.html");
});
