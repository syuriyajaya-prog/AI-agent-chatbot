import streamlit as st
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from elevenlabs import play
import tempfile
import os

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

# Load document
with open("car_service_document.txt", "r") as f:
    dd = f.read()

# System prompt
prompt = f"""
You are AutoCare Assistant, a friendly and professional car service customer care executive.
Your job is to answer questions from customers about car maintenance and services.
Answer clearly and politely.
If the question is not related to car service, say:
"I can only assist with car service and maintenance questions."

Knowledge base:
{dd}
"""


# Configure ElevenLabs
eleven_client = ElevenLabs(api_key="sk_15b715984c86cc485d18ec1cc8b756ce07d626c8113e95bb")

# Initialize session
if "messages" not in st.session_state:
    st.session_state.messages = []

# Show chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.write(message["content"])

# User input
user_input = st.chat_input("Type your question here...")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    # Build history
    history = []
    for msg in st.session_state.messages[:-1]:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": msg["content"]})

    # Get Gemini response
    chat = model.start_chat(history=history)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = chat.send_message(user_input)
            reply = response.text
            st.write(reply)

        # Convert reply to voice using ElevenLabs
        with st.spinner("Generating voice..."):
            audio = eleven_client.text_to_speech.convert(
                voice_id="EXAVITQu4vr4xnSDxMaL",  # Sarah voice
                text=reply,
                model_id="eleven_multilingual_v2"
            )
            # Save audio and play in browser
            audio_bytes = b"".join(audio)
            st.audio(audio_bytes, format="audio/mpeg")

    st.session_state.messages.append({"role": "assistant", "content": reply})
