const socket = io();

socket.on("questions", questions => {
    console.log(questions);
    questions.reverse().forEach(question => {
        const username = question.username.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const subject = question.subject.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const topic = question.topic.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const url = `/question/${question.id.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`
        document.getElementById("main").innerHTML += `
        <div class="question">
        <p><b>User</b> - <span class="text-info">${username}</span></p>
        <p><b>Subject</b> - <span class="text-primary">${subject}</span></p>
        <p><b>Topic</b> - <span class="text-danger">${topic}</span></p>
        <p>Click <a class="text-info" href="${url}">here</a> to view the question</p>
        </div>
        `
    })
})

//animations

$(document).ready(() => {
    $(".nav").hide();
    $(".nav").slideDown(1000);
})