import mongoose from 'mongoose';

const budgetCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
    default: 0,
  },
  spent: {
    type: Number,
    required: true,
    default: 0,
  },
});

const budgetSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
    default: 0,
  },
  allocatedBudget: {
    type: Number,
    required: true,
    default: 0,
  },
  availableBudget: {
    type: Number,
    required: true,
    default: 0,
  },
  categories: [budgetCategorySchema],
}, {
  timestamps: true,
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget; 