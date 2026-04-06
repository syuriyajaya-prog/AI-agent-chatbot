import streamlit as st
from elevenlabs.client import ElevenLabs

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

# Configure ElevenLabs
eleven_client = ElevenLabs(api_key="sk_15b715984c86cc485d18ec1cc8b756ce07d626c8113e95bb")

AGENT_ID = "agent_4001kngt35v3exhr79ea37mxggq7"

# Initialize session
if "messages" not in st.session_state:
    st.session_state.messages = []
if "conversation_id" not in st.session_state:
    st.session_state.conversation_id = None

# Show chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.write(message["content"])
        if message["role"] == "assistant" and "audio" in message:
            st.audio(message["audio"], format="audio/mpeg")

# User input
user_input = st.chat_input("Type your question here...")

if user_input:
    # Show user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            try:
                # Send message to ElevenLabs agent
                response = eleven_client.conversational_ai.get_signed_url(
                    agent_id=AGENT_ID
                )

                # Get text response from agent
                result = eleven_client.conversational_ai.send_conversation_message(
                    agent_id=AGENT_ID,
                    message=user_input,
                    conversation_id=st.session_state.conversation_id
                )

                reply = result.response
                st.session_state.conversation_id = result.conversation_id
                st.write(reply)

                # Convert reply to voice
                with st.spinner("Generating voice..."):
                    audio_generator = eleven_client.text_to_speech.convert(
                        voice_id="EXAVITQu4vr4xnSDxMaL",
                        text=reply,
                        model_id="eleven_multilingual_v2"
                    )
                    audio_bytes = b"".join(audio_generator)
                    st.audio(audio_bytes, format="audio/mpeg")

                st.session_state.messages.append({
                    "role": "assistant",
                    "content": reply,
                    "audio": audio_bytes
                })

            except Exception as e:
                st.error(f"Error: {str(e)}")
