const express = require('express');
const { body } = require('express-validator');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Session validation
const sessionValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Session name must be between 1 and 100 characters')
    .trim()
];

// Message validation
const messageValidation = [
  body('content')
    .isLength({ min: 1 })
    .withMessage('Message content is required')
    .trim(),
  body('role')
    .isIn(['user', 'assistant'])
    .withMessage('Role must be either user or assistant')
];

// Code validation
const codeValidation = [
  body('jsx')
    .optional()
    .isString()
    .withMessage('JSX must be a string'),
  body('css')
    .optional()
    .isString()
    .withMessage('CSS must be a string')
];

// @route   GET /api/sessions
// @desc    Get all sessions for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ 
      user: req.user._id,
      isActive: true 
    })
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', auth, sessionValidation, validate, async (req, res) => {
  try {
    const { name } = req.body;

    const session = new Session({
      user: req.user._id,
      name
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session with messages and code
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update session name
// @access  Private
router.put('/:id', auth, sessionValidation, validate, async (req, res) => {
  try {
    const { name } = req.body;

    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        isActive: true
      },
      { name },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a session (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/sessions/:id/messages
// @desc    Add a message to a session
// @access  Private
router.post('/:id/messages', auth, messageValidation, validate, async (req, res) => {
  try {
    const { content, role } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const message = {
      role,
      content,
      timestamp: new Date()
    };

    session.messages.push(message);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      message: session.messages[session.messages.length - 1]
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/sessions/:id/code
// @desc    Update generated code for a session
// @access  Private
router.put('/:id/code', auth, codeValidation, validate, async (req, res) => {
  try {
    const { jsx, css } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.generatedCode = {
      jsx: jsx || '',
      css: css || '',
      timestamp: new Date()
    };

    await session.save();

    res.json({
      success: true,
      message: 'Code updated successfully',
      generatedCode: session.generatedCode
    });
  } catch (error) {
    console.error('Update code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 