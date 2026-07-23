const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.get('/', async (req, res) => {
  try {
    const { filterBy, priority, sortBy } = req.query;
    const filter = {};

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }

    if (filterBy === 'overdue') {
      filter.dueDate = { $lt: new Date() };
    } else if (filterBy === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.dueDate = { $gte: start, $lt: end };
    } else if (filterBy === 'upcoming') {
      filter.dueDate = { $gte: new Date() };
    }

    const sort = {};
    if (sortBy === 'priority') {
      sort.priority = 1;
    } else {
      sort.dueDate = 1;
    }

    const tasks = await Task.find(filter).sort(sort);

    if (sortBy === 'priority') {
      const order = { high: 1, medium: 2, low: 3 };
      tasks.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load tasks.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create task.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Invalid task ID.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found.' });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update task.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete task.' });
  }
});

module.exports = router;
