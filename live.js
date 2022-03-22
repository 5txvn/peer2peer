const express = require('express')
const app = express()
app.use(express.static("views"));
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fs = require('fs')

const file = "./views/pages/submit-question.ejs"
const ejsPath = 'pages/submit-question.ejs'

app.get('/', (req, res) => {
    res.render(ejsPath, {
        username: "stevanoiskool",
        questionsAsked: "10",
        questionsAnswered: "5",
        u: "stevanoiskool",
        t: "10"
    })
})

io.on("connection", (socket) => {
    var data = fs.readFileSync(file, "utf8")
    setInterval(() => {
        if (data != fs.readFileSync(file, "utf8")) {
            socket.emit("reload");
            data = fs.readFileSync(file, "utf8");
            console.log("File reloaded")
        }
    }, 100)
})

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`App is running on port ${ PORT }`);
});

//inject script

/*
<script src="/scripts/socket.io.js"></script>
<script>
const socket = io()
socket.on("reload", () => {
    window.location.reload()
})
</script>
*/