from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from datetime import datetime
from groq import Groq

# optional dotenv (works locally, ignored on render)
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass


# -----------------------------
# OPTIONAL FIREBASE (safe)
# -----------------------------

USE_FIREBASE = False
db = None

try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    if os.path.exists("serviceAccountKey.json"):

        cred = credentials.Certificate("serviceAccountKey.json")

        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)

        db = firestore.client()
        USE_FIREBASE = True

except Exception as e:
    print("Firebase disabled:", e)
    USE_FIREBASE = False


# -----------------------------
# FASTAPI
# -----------------------------

app = FastAPI(
    title="Academic Planning AI Backend",
    version="1.0"
)


# -----------------------------
# CORS (important for React / Render)
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# HEALTH CHECK
# -----------------------------

@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "running"}


# -----------------------------
# OPTIONS FIX (for browser)
# -----------------------------

@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request):
    return {"status": "ok"}


# -----------------------------
# REQUEST MODEL
# -----------------------------

class StudentProfile(BaseModel):
    goal: str
    level: str
    time_available_days: int
    hours_per_day: int
    constraints: List[str]


# -----------------------------
# GROQ CLIENT
# -----------------------------

GROQ_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_KEY:
    print("WARNING: GROQ_API_KEY not set")

client = Groq(
    api_key=GROQ_KEY
)


# -----------------------------
# SYSTEM PROMPT
# -----------------------------

SYSTEM_PROMPT = """
You are an Academic Execution Planning System.

Rules:
- Output only execution plan
- Use PHASE format
- Use PHASE 1, PHASE 2 etc
- Be realistic
- Use days not hours
- Use conservative planning
- No motivation text
- No websites
- No tools
- Begin with PHASE 1
"""


# -----------------------------
# PLAN GENERATOR
# -----------------------------

def generate_plan(student):

    user_prompt = f"""
Student Profile

Goal: {student['goal']}
Level: {student['level']}
Days: {student['time_available_days']}
Hours per day: {student['hours_per_day']}

Constraints:
{student['constraints']}

Generate execution plan.
"""

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.05,
    )

    return completion.choices[0].message.content


# -----------------------------
# MAIN API
# -----------------------------

@app.post("/generate-plan")
def generate(student: StudentProfile):

    try:

        plan = generate_plan(student.dict())

        # optional logging
        if USE_FIREBASE and db:

            try:
                db.collection("backend_logs").add({
                    "input": student.dict(),
                    "output": plan,
                    "timestamp": datetime.utcnow(),
                })
            except Exception as e:
                print("Firestore log error:", e)

        return {
            "plan": plan
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }