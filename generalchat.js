const chatBox = document.getElementById("chat-box");
const input = document.getElementById("userInput");

function appendMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = sender;
  messageDiv.innerText = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", "You: " + message);
  input.value = "";

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    appendMessage("ai", "AI: " + data.reply);
  } catch (error) {
    appendMessage("ai", "⚠️ Sorry, something went wrong.");
  }
}

// ✅ Only Enter sends message, Shift+Enter does nothing
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // block newline
    sendMessage();
  }
});