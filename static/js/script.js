document.addEventListener('DOMContentLoaded', function() {
    // Audio player functionality
    var audio = document.getElementById("backgroundMusic");
    var playButton = document.getElementById("playButton");

    playButton.addEventListener("click", function() {
        if (audio.paused) {
            audio.play();
            playButton.textContent = "🎄"; // Christmas tree
        } else {
            audio.pause();
            playButton.textContent = "🎅"; // Santa
        }
    });

    // PDF download functionality
    document.getElementById("downloadPDFButton").addEventListener("click", function() {
        downloadPDF();
    });

    // Form submission handling
    document.querySelector("#surveyForm").addEventListener("submit", function(event) {
        event.preventDefault();
        if (audio && audio.paused) {
            audio.play();
        }
        submitForm();
    });

    // Category change handling
    document.getElementById('category').addEventListener('change', updateQuestion);

    // Function to submit the form
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

    // Function to update questions based on category
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

    // Function to update the response list
    function updateResponseList(responses) {
        const responseList = document.getElementById('responseList');
        responseList.innerHTML = '';
        responses.forEach(response => {
            const li = document.createElement('li');
            li.textContent = `[${response.카테고리}] 질문: ${response.질문} - 답변: ${response.응답}`;
            responseList.appendChild(li);
        });
    }

    // Function to download PDF
    function downloadPDF() {
        const element = document.getElementById('responseList');
        if (!element) {
            console.error("Element with id 'responseList' not found!");
            return;
        }

        // Configure html2canvas options
        const options = {
            scale: 2, // Increase quality
            useCORS: true,
            logging: false
        };

        // Create the PDF
        html2canvas(element, options, function(canvas) {
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                console.error("jsPDF not found! Make sure the library is loaded properly.");
                return;
            }

            try {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 30;

                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                pdf.save('2024_reflections.pdf');
            } catch (error) {
                console.error('Error generating PDF:', error);
            }
        });
    }
});