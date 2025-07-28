const express = require('express');
const axios = require('axios');
const { body } = require('express-validator');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Chat validation
const chatValidation = [
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
    .trim(),
  body('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required')
];

// AI prompt templates for different types of requests
const PROMPT_TEMPLATES = {
  component: `You are an expert React developer. Create a React component based on the user's request.

Requirements:
- Use modern React with hooks
- Include proper TypeScript types if needed
- Use Tailwind CSS for styling
- Make the component responsive and accessible
- Add hover effects and animations where appropriate
- Use semantic HTML elements
- Include proper ARIA attributes for accessibility

User request: {userMessage}

Please provide:
1. A complete React JSX component
2. Any necessary CSS (preferably Tailwind classes, but custom CSS if needed)
3. Brief explanation of the component's features

Format your response as:
JSX:
\`\`\`jsx
[Your JSX code here]
\`\`\`

CSS:
\`\`\`css
[Your CSS code here]
\`\`\`

Explanation:
[Brief explanation of what the component does]`,

  modification: `You are an expert React developer. Modify the existing component based on the user's request.

Current component:
JSX:
\`\`\`jsx
{currentJSX}
\`\`\`

CSS:
\`\`\`css
{currentCSS}
\`\`\`

User's modification request: {userMessage}

Please provide the updated component with the requested changes. Format your response as:
JSX:
\`\`\`jsx
[Updated JSX code]
\`\`\`

CSS:
\`\`\`css
[Updated CSS code]
\`\`\`

Explanation:
[Brief explanation of the changes made]`
};

// Extract code blocks from AI response
const extractCodeBlocks = (response) => {
  const jsxMatch = response.match(/JSX:\s*```jsx\s*([\s\S]*?)\s*```/i);
  const cssMatch = response.match(/CSS:\s*```css\s*([\s\S]*?)\s*```/i);
  
  return {
    jsx: jsxMatch ? jsxMatch[1].trim() : '',
    css: cssMatch ? cssMatch[1].trim() : ''
  };
};

// Call OpenRouter API
const callOpenRouter = async (prompt) => {
  try {
    const response = await axios.post(
      `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'gpt-4o-mini', // Free model
        messages: [
          {
            role: 'system',
            content: 'You are an expert React developer who creates beautiful, functional components.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:3000',
          'X-Title': 'Accio AI Playground'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error('Failed to generate AI response');
  }
};

// @route   POST /api/chat
// @desc    Send a message to AI and get response
// @access  Private
router.post('/', auth, chatValidation, validate, async (req, res) => {
  try {

    console.log("Inside chat route");
    
    const { message, sessionId } = req.body;

    // Verify session exists and belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      user: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Determine if this is a new component request or modification
    const hasExistingCode = session.generatedCode && 
      (session.generatedCode.jsx || session.generatedCode.css);

    let prompt;
    if (hasExistingCode) {
      // Modification request
      prompt = PROMPT_TEMPLATES.modification
        .replace('{userMessage}', message)
        .replace('{currentJSX}', session.generatedCode.jsx || '')
        .replace('{currentCSS}', session.generatedCode.css || '');
    } else {
      // New component request
      prompt = PROMPT_TEMPLATES.component.replace('{userMessage}', message);
    }

    // Call AI API
    const aiResponse = await callOpenRouter(prompt);

    // Extract code blocks from response
    const { jsx, css } = extractCodeBlocks(aiResponse);

    // Update session with new code
    session.generatedCode = {
      jsx,
      css,
      timestamp: new Date()
    };

    await session.save();

    res.json({
      success: true,
      message: aiResponse,
      code: {
        jsx,
        css
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    if (error.message === 'Failed to generate AI response') {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/models
// @desc    Get available AI models (for future use)
// @access  Private
router.get('/models', auth, async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.OPENROUTER_BASE_URL}/models`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      models: response.data.data
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI models'
    });
  }
});

module.exports = router; 