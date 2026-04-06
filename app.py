import streamlit as st
import requests

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

ELEVENLABS_API_KEY = "sk_15b715984c86cc485d18ec1cc8b756ce07d626c8113e95bb"

with open("car_service_document.txt", "r") as f:
    dd = f.read()

SYSTEM_PROMPT = f"""
You are AutoCare Assistant, a friendly and professional car service customer care executive.
Answer questions about car maintenance and services clearly and politely.
If not related to car service say: I can only assist with car service and maintenance questions.
Knowledge base:
{dd}
"""

def get_response(user_message, history):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})

    response = requests.post(
        "https://api.elevenlabs.io/v1/chat/completions",
        headers={
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": messages
        }
    )
    return response.json()["choices"][0]["message"]["content"]

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
            reply = get_response(user_input, st.session_state.messages[:-1])
            st.write(reply)

    st.session_state.messages.append({"role": "assistant", "content": reply})
