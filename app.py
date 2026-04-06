import streamlit as st
import streamlit.components.v1 as components
import requests

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

ELEVENLABS_AGENT_ID = "agent_4001kngt35v3exhr79ea37mxggq7"

with open("car_service_document.txt", "r") as f:
    dd = f.read()

SYSTEM_PROMPT = f"""
You are Maya, a friendly and professional customer care executive for AutoCare Service Center in Malaysia.
Answer questions about car service and maintenance clearly and politely.
If not related to car service say: I can only assist with AutoCare car service questions.
Knowledge base:
{dd}
"""

def get_response(user_message, history):
    messages = []
    for msg in history:
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    messages.append({"role": "user", "content": user_message})

    response = requests.post(
        "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta/v1/chat/completions",
        headers={"Content-Type": "application/json"},
        json={
            "model": "HuggingFaceH4/zephyr-7b-beta",
            "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
            "max_tokens": 500,
            "stream": False
        }
    )
    data = response.json()
    return data["choices"][0]["message"]["content"]

# Voice widget
st.subheader("🎙️ Voice Chat")
components.html(f"""
<elevenlabs-convai agent-id="{ELEVENLABS_AGENT_ID}"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/index.js" async></script>
""", height=100)

st.divider()

# Text chat
st.subheader("💬 Text Chat")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.write(message["content"])

user_input = st.chat_input("Type your question here...")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            try:
                reply = get_response(user_input, st.session_state.messages[:-1])
                st.write(reply)
            except Exception as e:
                st.error(f"Error: {str(e)}")
                reply = "Sorry, please try again."

    st.session_state.messages.append({"role": "assistant", "content": reply})
