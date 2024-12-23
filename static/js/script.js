document.addEventListener('DOMContentLoaded', function() {
    var audio = document.getElementById("backgroundMusic");
    var playButton = document.getElementById("playButton");

    playButton.addEventListener("click", function() {
        if (audio.paused) {
            audio.play();
            playButton.textContent = "🎄"; // Christmas tree
        } else {
            audio.pause();
            playButton.textContent = "🎅"; // Santa, or any other icon you prefer for pause
        }
    });
    document.getElementById("downloadPDFButton").addEventListener("click", function() {
        downloadPDF();
    });

    document.querySelector("#surveyForm").addEventListener("submit", function(event) {
        event.preventDefault();
        if (audio && audio.paused) {
            audio.play();
        }
        submitForm();
    });

    document.getElementById('category').addEventListener('change', updateQuestion);

    function submitForm() {
        var audio = document.getElementById("backgroundMusic");
        var wasPlaying = !audio.paused;
        var currentTime = audio.currentTime;
    
        var formData = new FormData(document.getElementById('surveyForm'));
        fetch('/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                updateResponseList(data.responses);
                document.getElementById('questionDisplay').textContent = "질문: " + data.next_question;
                document.querySelector('input[name="current_question"]').value = data.next_question;
                document.getElementById('user_input').value = '';
                
                document.getElementById('category').value = data.next_category;
                
                if (data.next_category === "완료") {
                    document.getElementById('surveyForm').style.display = 'none';
                    document.getElementById('completionMessage').style.display = 'block';
                }
    
                // Resume music if it was playing
                if (wasPlaying) {
                    audio.currentTime = currentTime;
                    audio.play();
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }

function updateQuestion() {
    var category = document.getElementById('category').value;
    fetch(`/get_question?category=${category}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('questionDisplay').textContent = "질문: " + data.question;
            document.querySelector('input[name="current_question"]').value = data.question;
        })
        .catch(error => console.error('Error:', error));
}
function updateResponseList(responses) {
    const responseList = document.getElementById('responseList');
    responseList.innerHTML = '';
    responses.forEach(response => {
        const li = document.createElement('li');
        li.textContent = `[${response.카테고리}] 질문: ${response.질문} - 답변: ${response.응답}`;
        responseList.appendChild(li);
    });
}
function downloadPDF() {
    const element = document.getElementById('responseList'); // The element you want to capture
    html2canvas(element).then(canvas => {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png'); // Capture the element as an image
        pdf.addImage(imgData, 'PNG', 10, 10, 180, 0); // Add the image to the PDF
        pdf.save("2024_reflections.pdf"); // Save the PDF file
    });
}
})
