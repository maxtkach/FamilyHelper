import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Budget from '../models/budgetModel';
import mongoose from 'mongoose';

// @desc    Get budget
// @route   GET /api/budget
// @access  Private
const getBudget = asyncHandler(async (req: Request, res: Response) => {
  console.log('Получен запрос на получение бюджета:', req.body);
  
  // Получаем familyId из запроса или используем ID пользователя
  let familyId = req.body.familyId || req.user._id;
  
  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(familyId)) {
    console.log('Невалидный familyId, используем фиксированное значение');
    familyId = "65f9b760cf36f9aa65ca33e5"; // Используем фиксированное значение
  }
  
  console.log('Ищем бюджет для familyId:', familyId);
  
  const budget = await Budget.findOne({ familyId });
  
  if (!budget) {
    console.log('Бюджет не найден, создаем новый');
    // Если бюджет не найден, создаем новый
    const newBudget = await Budget.create({
      familyId,
      totalBudget: 0,
      allocatedBudget: 0,
      availableBudget: 0,
      categories: [],
    });
    
    console.log('Создан новый бюджет:', newBudget);
    res.status(201).json(newBudget);
  } else {
    console.log('Найден существующий бюджет:', budget);
    res.json(budget);
  }
});

// @desc    Update budget
// @route   PUT /api/budget
// @access  Private
const updateBudget = asyncHandler(async (req: Request, res: Response) => {
  console.log('Получен запрос на обновление бюджета:', req.body);
  
  // Получаем familyId из запроса или используем ID пользователя
  let familyId = req.body.familyId || req.user._id;
  
  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(familyId)) {
    console.log('Невалидный familyId, используем фиксированное значение');
    familyId = "65f9b760cf36f9aa65ca33e5"; // Используем фиксированное значение
  }
  
  console.log('Ищем бюджет для familyId:', familyId);
  
  let budget = await Budget.findOne({ familyId });

  if (!budget) {
    console.log('Бюджет не найден, создаем новый');
    budget = await Budget.create({
      familyId,
      totalBudget: 0,
      allocatedBudget: 0,
      availableBudget: 0,
      categories: [],
    });
  }

  const { totalBudget, allocatedBudget, availableBudget, categories } = req.body;

  if (totalBudget !== undefined) budget.totalBudget = totalBudget;
  if (allocatedBudget !== undefined) budget.allocatedBudget = allocatedBudget;
  
  // Если указан только totalBudget, рассчитываем availableBudget
  if (totalBudget !== undefined && allocatedBudget === undefined) {
    budget.availableBudget = totalBudget - budget.allocatedBudget;
  } else if (availableBudget !== undefined) {
    budget.availableBudget = availableBudget;
  }
  
  if (categories) {
    budget.categories = categories;
  }

  console.log('Сохраняем обновленный бюджет:', budget);
  const updatedBudget = await budget.save();
  console.log('Бюджет успешно обновлен:', updatedBudget);
  
  res.json(updatedBudget);
});

export { getBudget, updateBudget }; 