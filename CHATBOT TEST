import streamlit as st
from google import genai

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

@st.cache_resource
def load_chat():
    client = genai.Client(api_key=st.secrets["AIzaSyA_O1AF8XVd1DcFG6hh53R8euFD63WwMI4"])
    chat = client.chats.create(model="gemini-2.0-flash")
    return chat

chat = load_chat()

if "messages" not in st.session_state:
    st.session_state.messages = []
    st.session_state.first_message = True

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
            if st.session_state.first_message:
                full_input = prompt + "\n\nCustomer question: " + user_input
                st.session_state.first_message = False
            else:
                full_input = user_input

            response = chat.send_message(full_input)
            reply = response.text
            st.write(reply)

    st.session_state.messages.append({"role": "assistant", "content": reply})