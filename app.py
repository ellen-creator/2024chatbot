from flask import Flask, render_template, request, jsonify, make_response, session
from flask_session import Session
import random
import os
from time import time


app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a secure key
app.config['SESSION_TYPE'] = 'filesystem'  # Store sessions on the server filesystem
Session(app)
# 질문 데이터 - 카테고리별 질문 설정
questions = {
    "일반": [
        "2024년은 당신에게 어떤 색깔이었나요? 왜 그런가요?",
        "2023년을 돌아볼때와 2024년을 돌아볼 때 지금, 무엇이 다르다고 느끼고 있나요?",
        "이번년도의 내가 바뀐 점, 바뀌길 원했지만 잘 바뀌지 않았던 점은 무엇인가요?",
        "이번년도에 내가 후회하는 점은 무엇인가요? 앞으로의 나의 행동이 이 후회를 바꿀 수 있다고 생각하나요?",
        "이번년도 나를 칭찬할 점은 무엇인가요? 마음껏 칭찬해주세요" 
    ],
    "취미": [
        "2024년에 가장 좋아한 취미는 무엇인가요?",
        "이전의 취미를 대할 때와 달라진 나의 자세, 생각 등이 있다면 무엇인가요?",
        "새로운 취미를 배우고 싶다면 어떤 걸 배우고 싶나요?",
        "2025년에 누군가에게 추천해주고 싶은 취미가 있다면 그것은 무엇인가요?"
    ],
    "여행": [
        "여행을 좋아하시나요? 2024년 가장 기억에 남는 여행지는 어디인가요?",
        "내가 가장 좋아한 여행은 왜 좋았나요?",
        "2025년 혹은 미래에 가보고 싶은 여행지는 어디인가요?"
    ],
    "직업": [
        "현재 어떤 일을 하고 계세요?",
        "그 직업은 현재 만족스러운가요?",
        "명함에 직업이 없다면 나를 어떻게 정의할건가요?",
        "미래에 어떤 일을 하고 싶으신가요?(직무가 아니어도 좋습니다)",
        "2024년에 그 일을 위해 무엇을해보셨나요?"
    ],
    "음악": [
        "올해 내가 가장 많이 들은 노래는?",
        "올해 내가 가장 많이 부른 노래는?",
        "올해 내가 사랑한 노래 장르는?",
        "올해 내가 가장 많이 추천한 노래는/앨범은? 이유가 무엇일까요?",
        "2025년에 기대되는 가수는? 앨범은?"
    ],
    "애정": [
        "2024년에 나는 많이 사랑하고 사랑받았나요?",
        "사랑과 관심을 더 베풀고 싶은 사람들이 있다면 누구일까요?(떠오른다면 지금 안부메시지를 보내보세요)",
        "2025년에는 어떤 사랑을 하고 싶나요?"
    ]
}

# 대화 기록을 저장하는 리스트
responses = []

# 각 카테고리별 사용된 질문을 추적하는 딕셔너리
used_questions = {category: set() for category in questions}

def get_next_question(current_category):
    categories = list(questions.keys())
    current_index = categories.index(current_category)
    
    for i in range(len(categories)):
        category = categories[(current_index + i) % len(categories)]
        available_questions = set(questions[category]) - used_questions[category]
        
        if available_questions:
            question = random.choice(list(available_questions))
            used_questions[category].add(question)
            return category, question
    
    # 모든 질문을 사용했을 경우
    return "완료", "2024년을 걸어온 당신, 수고 많았어요!"

@app.route("/", methods=["GET", "POST"])
def home():
    random_value = random.random()

    # Initialize session responses if not already set
    if 'responses' not in session:
        session['responses'] = []

    if request.method == "POST":
        category = request.form.get("category", "일반")
        user_input = request.form.get("user_input", "").strip()
        current_question = request.form.get("current_question", "")
        
        # Append to session-specific responses
        session['responses'].append({"카테고리": category, "질문": current_question, "응답": user_input})
        session.modified = True  # Mark session as modified

        # Generate the next question
        next_category, next_question = get_next_question(category)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                "status": "success", 
                "responses": session['responses'], 
                "next_question": next_question,
                "next_category": next_category
            })

        return render_template("index.html", question=next_question, responses=session['responses'], random_value=random_value, current_category=next_category)

    current_category = request.args.get("category", "일반")
    initial_question = "안녕하세요! 오늘 저와 함께 2024년의 소회를 해보아요"
    return render_template("index.html", 
                           question=initial_question, 
                           responses=session['responses'], 
                           random_value=random_value, 
                           current_category=current_category, 
                           time=time)
    
if __name__ == "__main__":
    # Use environment variables for host and port
    host = os.environ.get('HOST', '0.0.0.0')  # Default to 0.0.0.0
    port = int(os.environ.get('PORT', 5000))  # Default to 5000

    app.run(host=host, port=port, debug=True)
