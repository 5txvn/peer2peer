const socket = io();
    const windowId = location.pathname.match(/[^\/]+$/)[0]
    const input = document.getElementById("message");
    const cookie = document.cookie.split("; ").reduce((prev, current) => {
      const [name, ...value] = current.split("=");
      prev[name] = value.join("=");
      return prev;
    }, {});
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              send();
            }
          });
          socket.emit('recieve-messages', windowId)
          socket.on(`dm-messages-${windowId}`, messages => {
            messages.forEach(message => {
              $("#messages").append(`<p>${message[0]} : ${message[1]}</p>`)
            })
          })
    socket.on("recieve", (message, name, id) => {
        if (windowId == id) {
            console.log(message)
            $("#m").text(message)
            document.getElementById("messages").innerHTML += `<p>${name}: ${message}</p>`;
            console.log(document.getElementById("messages").innerHTML)
          //$("#messages").append(`<p>${message}</p>`);
        }
      });
    function send() {
        console.log("done")
        socket.emit("send", $("#message").val(), cookie.username, windowId);
        $("#message").val("")
    }