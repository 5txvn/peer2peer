const socket = io();
    const windowId = window.location.pathname.replace("/dm/", "");
    const input = document.getElementById("message");
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              send();
              console.log("reached")
            }
          });
    socket.on("recieve", (message, id) => {
        console.log("reached again")
        if (windowId == id) {
            console.log("reached yet again")
            console.log(message)
            $("#m").text(message)
            document.getElementById("messages").innerHTML += `<p>${message}</p>`;
            console.log(document.getElementById("messages").innerHTML)
          //$("#messages").append(`<p>${message}</p>`);
        }
      });
    function send() {
        console.log("done")
        socket.emit("send", $("#message").val(), windowId);
        $("#message").val()
    }