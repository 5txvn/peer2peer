const socket = io();

socket.on("questions", questions => {
    console.log(questions);
    questions.forEach(question => {
        const username = question.username;
        const subject = question.subject
        const topic = question.topic
        document.getElementById("main").innerHTML += `
        <div class="question">
        <p>User - <span class="text-info">${username}</span></p>
        <p>Subject - <span class="text-primary">${subject}</span></p>
        <p>Topic - <span class="text-danger">${topic}</span></p>
        </div>
        `
    })
})