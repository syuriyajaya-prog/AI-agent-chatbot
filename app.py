import streamlit as st
import streamlit.components.v1 as components
import requests

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

ELEVENLABS_AGENT_ID = "agent_4001kngt35v3exhr79ea37mxggq7"

with open("car_service_document.txt", "r") as f:
    dd = f.read()

def get_response(user_message, history):
    
    system = f"""You are Maya, a customer care executive for AutoCare Service Center Malaysia.
You MUST answer ONLY using the information below. Do not make up anything.
If the answer is not in the information below, say: I can only assist with AutoCare car service questions.

=== AutoCare Information ===
{dd}
=== End of Information ===

Answer clearly, friendly and professionally."""

    messages = [{"role": "system", "content": system}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})

    response = requests.post(
        "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta/v1/chat/completions",
        headers={"Content-Type": "application/json"},
        json={
            "model": "HuggingFaceH4/zephyr-7b-beta",
            "messages": messages,
            "max_tokens": 500,
            "stream": False
        }
    )

    data = response.json()
    
    if "choices" in data:
        return data["choices"][0]["message"]["content"]
    else:
        return str(data)

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
            reply = get_response(user_input, st.session_state.messages[:-1])
            st.write(reply)

    st.session_state.messages.append({"role": "assistant", "content": reply})
