const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const submitBtn = form.querySelector('button[type="submit"]');
// Store conversation history to send back to the API for context
let conversation = [];
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add the user's message to the UI and history
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });

  input.value = '';

  // Disable input and button while waiting for response
  input.disabled = true;
  submitBtn.disabled = true;

  // 2. Show a temporary "Thinking..." bot message
  const thinkingMessage = appendMessage('model', 'Thinking...');

  try {
    // 3. Send the conversation history to the backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) throw new Error('Failed to get response from server.');

    const data = await response.json();

    if (data.result) {
      // 4. Replace the "Thinking..." message with the AI's reply
      thinkingMessage.textContent = data.result;
      conversation.push({ role: 'model', text: data.result });
    } else {
      throw new Error('Sorry, no response received.');
    }
  } catch (error) {
    // 5. Error handling
    thinkingMessage.textContent = error.message || 'Failed to get response from server.';
  } finally {
    // Re-enable UI
    input.disabled = false;
    submitBtn.disabled = false;
    input.focus();
  }
});
function appendMessage(role, text) {
  console.log('Appending message:', { role, text });
  const msg = document.createElement('div');
  msg.classList.add('message', role);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element so it can be updated later
}