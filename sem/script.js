/**
 * Gemini AI Chatbot Frontend
 * Vanilla JavaScript - No frameworks
 * Handles user input, API communication, and message display
 */

// DOM Elements
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitBtn = form.querySelector('button[type="submit"]');

// Store conversation history for multi-turn interactions
let conversation = [];

/**
 * Handle form submission
 */
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  
  // Validate input
  if (!userMessage) {
    return;
  }

  // 1. Add user message to UI and conversation history
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });

  // Clear input field
  input.value = '';

  // Disable input and button while waiting for response
  input.disabled = true;
  submitBtn.disabled = true;

  // 2. Show temporary "Thinking..." message
  const thinkingMessage = appendMessage('model', 'Thinking...');

  try {
    // 3. Send POST request to backend with conversation history
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    // Parse JSON response
    const data = await response.json();

    // 4. Validate response contains result
    if (data.result && typeof data.result === 'string' && data.result.trim()) {
      // Replace "Thinking..." with actual AI response
      thinkingMessage.textContent = data.result;
      
      // Add AI response to conversation history
      conversation.push({ role: 'model', text: data.result });
    } else {
      // No valid response received
      throw new Error('No response received from AI model.');
    }

  } catch (error) {
    // 5. Error handling - show error message instead of "Thinking..."
    const errorMessage = error.message || 'Failed to get response from server.';
    thinkingMessage.textContent = `Error: ${errorMessage}`;
    thinkingMessage.classList.add('error');
    
    console.error('Chat API Error:', error);
  } finally {
    // Re-enable input and button
    input.disabled = false;
    submitBtn.disabled = false;
    input.focus();
  }
});

/**
 * Append a message to the chat box
 * @param {string} role - 'user' or 'model'
 * @param {string} text - Message text
 * @returns {HTMLElement} - The created message element
 */
function appendMessage(role, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', role);
  msg.textContent = text;
  chatBox.appendChild(msg);
  
  // Auto-scroll to latest message
  chatBox.scrollTop = chatBox.scrollHeight;
  
  return msg; // Return for potential later updates
}
