import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  keyPoints: {
    type: [String],
    default: []
  }
});

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    // Optional - if chat is context-specific
  },
  messages: [messageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
