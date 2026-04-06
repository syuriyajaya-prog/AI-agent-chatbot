import streamlit as st
import google.generativeai as genai

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

with open("car_service_document.txt", "r") as f:
    dd = f.read()

prompt = f"""
You are AutoCare Assistant, a friendly and professional car service customer care executive.
Your job is to answer questions from customers about car maintenance and services.
Answer clearly and politely.
If the question is not related to car service, say:
"I can only assist with car service and maintenance questions."

Knowledge base:
{dd}
"""

# Configure Gemini
genai.configure(api_key="AIzaSyAjVseWvjaUQvqd85AaHiYE1cojRODvrDI")
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=prompt
)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Show chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.write(message["content"])

# Get user input
user_input = st.chat_input("Type your question here...")

if user_input:
    # Show user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    # Build history for Gemini
    history = []
    for msg in st.session_state.messages[:-1]:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": msg["content"]})

    # Create fresh chat with history each time
    chat = model.start_chat(history=history)

    # Get response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = chat.send_message(user_input)
            reply = response.text
            st.write(reply)

    st.session_state.messages.append({"role": "assistant", "content": reply})
