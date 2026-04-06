import streamlit as st
import streamlit.components.v1 as components
import requests

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

ELEVENLABS_AGENT_ID = "agent_4001kngt35v3exhr79ea37mxggq7"
GROQ_API_KEY = "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"

with open("car_service_document.txt", "r") as f:
    dd = f.read()

SYSTEM_PROMPT = f"""
You are Megan, a friendly and professional customer care executive for AutoCare Service Center Malaysia.
You MUST answer ONLY using the information below. Do not make up anything.
If the answer is not in the information below say:
I can only assist with AutoCare car service and maintenance questions.

=== AutoCare Information ===
{dd}
=== End of Information ===

Always answer clearly, friendly and professionally.
"""

def get_text_response(user_message, history):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama3-8b-8192",
            "messages": messages,
            "max_tokens": 500
        }
    )
    data = response.json()
    return data["choices"][0]["message"]["content"]

# ================================
# VOICE CHAT
# ================================
st.subheader("🎙️ Voice Chat")
st.caption("Click Start a call to talk to Megan")

components.html(f"""
<div style="
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: #1e1e1e;
    border-radius: 12px;
    margin-bottom: 10px;
">
    <elevenlabs-convai agent-id="{ELEVENLABS_AGENT_ID}"></elevenlabs-convai>
</div>
<script src="https://elevenlabs.io/convai-widget/index.js" async></script>
""", height=150)

st.divider()

# ================================
# TEXT CHAT
# ================================
st.subheader("💬 Text Chat")
st.caption("Type your question and Megan will reply instantly")

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
        with st.spinner("Megan is thinking..."):
            reply = get_text_response(user_input, st.iframe[:-1])
            st.write(reply)

    st.session_state.messages.append({"role": "assistant", "content": reply})
