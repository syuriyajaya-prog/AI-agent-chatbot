import streamlit as st
import requests
from elevenlabs.client import ElevenLabs

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

# Load document
with open("car_service_document.txt", "r") as f:
    dd = f.read()

# ElevenLabs for voice
eleven_client = ElevenLabs(api_key="sk_15b715984c86cc485d18ec1cc8b756ce07d626c8113e95bb")

SYSTEM_PROMPT = f"""
You are AutoCare Assistant, a friendly and professional car service customer care executive.
Answer questions about car maintenance and services clearly and politely.
If not related to car service say: I can only assist with car service and maintenance questions.

Knowledge base:
{dd}
"""

def get_ai_response(user_message, chat_history):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})

    response = requests.post(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions",
        headers={"Authorization": "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"},
        json={"model": "mistralai/Mistral-7B-Instruct-v0.3", "messages": messages, "max_tokens": 500}
    )
    return response.json()["choices"][0]["message"]["content"]

def text_to_speech(text):
    try:
        audio_generator = eleven_client.text_to_speech.convert(
            voice_id="EXAVITQu4vr4xnSDxMaL",
            text=text,
            model_id="eleven_multilingual_v2"
        )
        return b"".join(audio_generator)
    except:
        return None

# Initialize session
if "messages" not in st.session_state:
    st.session_state.messages = []

# Show chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.write(message["content"])
        if message["role"] == "assistant" and "audio" in message:
            st.audio(message["audio"], format="audio/mpeg")

# User input
user_input = st.chat_input("Type your question here...")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            reply = get_ai_response(user_input, st.session_state.messages[:-1])
            st.write(reply)

        with st.spinner("Generating voice..."):
            audio_bytes = text_to_speech(reply)
            if audio_bytes:
                st.audio(audio_bytes, format="audio/mpeg")

    msg = {"role": "assistant", "content": reply}
    if audio_bytes:
        msg["audio"] = audio_bytes
    st.session_state.messages.append(msg)
