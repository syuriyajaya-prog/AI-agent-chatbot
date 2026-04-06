import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="AutoCare Chatbot", page_icon="🚗")
st.title("🚗 AutoCare Assistant")
st.caption("Ask me anything about car service and maintenance!")

components.html("""
<style>
    elevenlabs-convai {
        width: 100%;
        height: 600px;
        display: block;
    }
</style>

<elevenlabs-convai agent-id="agent_4001kngt35v3exhr79ea37mxggq7"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/index.js" async></script>
""", height=650)
