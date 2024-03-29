jest.mock('../../repositories/ActivityRepository');
jest.mock('../../repositories/BikeRepository');
jest.mock('../../repositories/ComponentRepository');
jest.mock('../../repositories/MaintenanceTaskRepository');
jest.mock('../../repositories/MaintenanceRecordRepository');
jest.mock('../../repositories/ComponentActivityRepository');

const express = require('express');
const maintenanceTaskService = require('../../services/MaintenanceTaskService');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

//MOCK DATA USED FOR TESTING
var maintSchedule1 = {
  _id: 1,
  component_id: new mongoose.Types.ObjectId('56cb91bdc3464f14678934ca'),
  schedule_type: 'date',
  threshold_val: 30,
  description: 'oil chain',
  last_maintenance_val: new Date('2020-10-11'),
  repeats: true,
  predicted_due_date: new Date('2020-11-11'),
};

var maintSchedule2 = {
  _id: 2,
  component_id: new mongoose.Types.ObjectId('56cb91bdc3464f14678934cb'),
  schedule_type: 'distance',
  threshold_val: 180,
  description: 'tire check',
  last_maintenance_val: new Date('2020-10-10'),
  repeats: false,
  predicted_due_date: new Date('2020-12-01'),
};

var maintSchedule3 = {
  _id: 3,
  component_id: new mongoose.Types.ObjectId('56cb91bdc3464f14678934ca'),
  schedule_type: 'distance',
  threshold_val: 200,
  description: 'brake check',
  last_maintenance_val: new Date('2020-09-26'),
  repeats: true,
  predicted_due_date: new Date('2021-03-20'),
};

var schedule_data = [maintSchedule1, maintSchedule2, maintSchedule3];

const maintSchedule3Update = {
  _id: 3,
  component_id: new mongoose.Types.ObjectId('56cb91bdc3464f14678934cb'),
  schedule_type: 'distance',
  threshold_val: 180,
  description: 'brake check',
  last_maintenance_val: new Date('2020-06-08'),
  repeats: true,
  predicted_due_date: new Date('2020-11-15'),
};

const maintSchedule4 = {
  _id: 6,
  component_id: new mongoose.Types.ObjectId('56cb91bdc3464f14678934ca'),
  schedule_type: 'date',
  threshold_val: 30,
  description: 'brake check',
  last_maintenance_val: new Date('2020-10-08'),
  repeats: false,
  predicted_due_date: new Date('2020-11-15'),
};

const maintSchedule5 = {
  _id: 5,
  component_id: new mongoose.Types.ObjectId('56cb91bdc3464f14678934cc'),
  schedule_type: 'distance',
  threshold_val: 120,
  description: 'brake check',
  last_maintenance_val: new Date('2020-10-08'),
  repeats: true,
  predicted_due_date: undefined,
};

//schedule for userId = 2
const maintSchedule6 = {
  _id: 60,
  component_id: new mongoose.Types.ObjectId('56cb91bdc3464f14678934ce'),
  schedule_type: 'distance',
  threshold_val: 80,
  description: 'pump tire',
  last_maintenance_val: new Date('2020-11-08'),
  repeats: true,
  predicted_due_date: undefined,
};

//MaintenanceTaskService TEST CASES
describe('GetById(id) Test Cases', () => {
  test('1. Get with existing id', async () => {
    expect.assertions(4);
    try {
      let response = await maintenanceTaskService.GetById(1);
      expect(response._id).toBe(1);
      expect(response.description).toBe('oil chain');
      expect(response.repeats).toBe(true);
      expect(response.threshold_val).toBe(30);
    } catch (err) {
      console.log(err);
    }
  });
});

describe('Create(maintenanceTask) Test Cases', () => {
  test('1. Valid new maintenanceTask with date schedule type', async () => {
    expect.assertions(2);
    try {
      let response = await maintenanceTaskService.Create(maintSchedule4);
      expect(response._id).toBe(6);
      expect(response.description).toBe('brake check');
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Valid new maintenanceTask with distance schedule type', async () => {
    expect.assertions(2);
    try {
      let response = await maintenanceTaskService.Create(maintSchedule3Update);
      expect(response._id).toBe(3);
      expect(response.description).toBe('brake check');
    } catch (err) {
      console.log(err);
    }
  });
});

describe('Update(maintenanceTask) Test Cases', () => {
  test('1. Update existing maintainenceTask with distance schedule type', async () => {
    try {
      expect.assertions(2);
      let response = await maintenanceTaskService.Update(maintSchedule3Update);
      expect(response.n).toBe(1);
      expect(response.nModified).toBe(1);
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Update existing maintainenceTask with date schedule type', async () => {
    expect.assertions(2);
    try {
      let response = await maintenanceTaskService.Update(maintSchedule1);
      expect(response.n).toBe(1);
      expect(response.nModified).toBe(1);
    } catch (err) {
      console.log(err);
    }
  });
});

describe('Delete(maintenanceTask) Test Cases', () => {
  test('1. Delete existing maintainenceTask', async () => {
    expect.assertions(1);
    try {
      let response = await maintenanceTaskService.Delete(maintSchedule1);
      expect(response).toBe(true);
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Delete non-existing maintainenceTask', async () => {
    expect.assertions(1);
    try {
      let respose = await maintenanceTaskService.Delete(maintSchedule4);
      expect(respose).toBe(false);
    } catch (err) {
      console.log(err);
    }
  });
});

describe('MaintenanceRecordFromTask(maintenanceTask) Test Cases', () => {
  test('1. Make record from existing maintainenceTask', async () => {
    expect.assertions(2);
    try {
      let record = await maintenanceTaskService.MaintenanceRecordFromTask(
        maintSchedule4,
      );

      expect(record.description).toBe('brake check');
      expect(record.maintenance_date.getTime()).toBeGreaterThan(
        maintSchedule4.last_maintenance_val.getTime(),
      );
    } catch (err) {
      console.log(err);
    }
  });
});

describe('GetTaskScheduleForUser(userId) Test Cases', () => {
  test('1. Get tasks for user - Update mock data dates', async () => {
    expect.assertions(9);
    try {
      let schedule = await maintenanceTaskService.GetTaskScheduleForUser(1);
      expect(schedule.length).toBe(4);
      expect(schedule[0].title).toBe('Overdue');
      expect(schedule[0].data[0].task).toBe('oil chain'); //maintSchedule1
      expect(schedule[1].title).toBe('Today');
      expect(schedule[1].data[0].task).toBe('brake check'); //maintSchedule4
      expect(schedule[2].title).toBe('Next 7 Days');
      expect(schedule[2].data[0].task).toBe('brake check'); //maintSchedule3
      expect(schedule[3].title).toBe('Upcoming');
      expect(schedule[3].data[0].task).toBe('tire check'); //maintSchedule2
    } catch (err) {
      console.log(err);
    }
  });

  test('1. Get tasks for user with undefined predicted date', async () => {
    expect.assertions(9);
    try {
      let schedule = await maintenanceTaskService.GetTaskScheduleForUser(2);
      expect(schedule.length).toBe(4);
      expect(schedule[0].title).toBe('Overdue');
      expect(schedule[0].data).toStrictEqual([]);
      expect(schedule[1].title).toBe('Today');
      expect(schedule[1].data).toStrictEqual([]);
      expect(schedule[2].title).toBe('Next 7 Days');
      expect(schedule[2].data).toStrictEqual([]);
      expect(schedule[3].title).toBe('Upcoming');
      expect(schedule[3].data[0].task).toBe('pump tire'); //maintSchedule5
    } catch (err) {
      console.log(err);
    }
  });
});

describe('GetScheduledTasksSorted(userId, numDays) Test Cases', () => {
  test('1. Get and sort tasks in date range, numDays = 0', async () => {
    expect.assertions(5);
    try {
      let sortedList = await maintenanceTaskService.GetScheduledTasksSorted(1);
      expect(sortedList.length).toBe(4);
      expect(sortedList[0].description).toBe('oil chain'); //maintSchedule1
      expect(sortedList[1].description).toBe('brake check'); //maintSchedule4
      expect(sortedList[2].description).toBe('brake check'); //maintSchedule3
      expect(sortedList[3].description).toBe('tire check'); //maintSchedule2
    } catch (err) {
      console.log(err);
    }
  });

  test('1. Get and sort tasks in date range, numDays = 30', async () => {
    expect.assertions(4);
    try {
      let sortedList = await maintenanceTaskService.GetScheduledTasksSorted(
        1,
        30,
      );
      expect(sortedList.length).toBe(3);
      expect(sortedList[0].description).toBe('oil chain'); //maintSchedule1
      expect(sortedList[1].description).toBe('brake check'); //maintSchedule4
      expect(sortedList[2].description).toBe('brake check'); //maintSchedule3
    } catch (err) {
      console.log(err);
    }
  });
});

describe('addDays(currentDate, daysToAdd) Test Cases', () => {
  test('1. Check negative days to add', () => {
    expect.assertions(1);
    try {
      let response = maintenanceTaskService.addDays(new Date('2020-11-10'), -2);
      expect(response).toStrictEqual(new Date('2020-11-08'));
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Check positive days to add', () => {
    expect.assertions(1);
    try {
      let response = maintenanceTaskService.addDays(new Date('2020-11-10'), 5);
      expect(response).toStrictEqual(new Date('2020-11-15'));
    } catch (err) {
      console.log(err);
    }
  });

  test('3. Check 0 days to add', () => {
    expect.assertions(1);
    try {
      let response = maintenanceTaskService.addDays(new Date('2020-11-10'), 0);
      expect(response).toStrictEqual(new Date('2020-11-10'));
    } catch (err) {
      console.log(err);
    }
  });
});

describe('GetTasksForComponent(componentId) Test Cases', () => {
  test('1. Get task with valid componentId', async () => {
    expect.assertions(2);
    try {
      let tasks = await maintenanceTaskService.GetTasksForComponent([
        new mongoose.Types.ObjectId('56cb91bdc3464f14678934cb'),
      ]);
      expect(tasks.length).toBe(1);
      expect(tasks[0].description).toBe('tire check');
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Get task with multiple valid componentId', async () => {
    expect.assertions(4);
    try {
      let tasks = await maintenanceTaskService.GetTasksForComponent([
        new mongoose.Types.ObjectId('56cb91bdc3464f14678934ca'),
        new mongoose.Types.ObjectId('56cb91bdc3464f14678934cb'),
      ]);
      expect(tasks.length).toBe(3);
      expect(tasks[0].description).toBe('oil chain');
      expect(tasks[1].description).toBe('brake check');
      expect(tasks[2].description).toBe('tire check');
    } catch (err) {
      console.log(err);
    }
  });
});

describe('MaintenancePredictForComponent(componentId) Test Cases', () => {
  test('1. Maintenance Predict with one valid componentId', async () => {
    expect.assertions(2);
    try {
      let predictions = await maintenanceTaskService.MaintenancePredictForComponent(
        [new mongoose.Types.ObjectId('56cb91bdc3464f14678934cb')],
      );
      expect(predictions.length).toBe(1);
      expect(new Date(predictions).getTime()).toBeGreaterThan(
        maintSchedule2.last_maintenance_val.getTime(),
      );
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Maintenance Predict with multiple valid componentId', async () => {
    expect.assertions(3);
    try {
      let predictions = await maintenanceTaskService.MaintenancePredictForComponent(
        [
          new mongoose.Types.ObjectId('56cb91bdc3464f14678934ca'),
          new mongoose.Types.ObjectId('56cb91bdc3464f14678934cb'),
        ],
      );
      expect(predictions.length).toBe(2);
      expect(new Date(predictions[0]).getTime()).toBeGreaterThan(
        maintSchedule3.last_maintenance_val.getTime(),
      );
      expect(new Date(predictions[1]).getTime()).toBeGreaterThan(
        maintSchedule2.last_maintenance_val.getTime(),
      );
    } catch (err) {
      console.log(err);
    }
  });
});

describe('MaintenancePredictForUser(userId) Test Cases', () => {
  test('1. Get task with valid userId', async () => {
    expect.assertions(3);
    try {
      let predictions = await maintenanceTaskService.MaintenancePredictForUser(
        1,
      );
      expect(predictions.length).toBe(2);
      expect(new Date(predictions[0]).getTime()).toBeGreaterThan(
        maintSchedule2.last_maintenance_val.getTime(),
      );
      expect(new Date(predictions[1]).getTime()).toBeGreaterThan(
        maintSchedule3.last_maintenance_val.getTime(),
      );
    } catch (err) {
      console.log(err);
    }
  });
});

describe('MaintenancePredict(maintenanceList) Test Cases', () => {
  test('1. Predict with valid tasks with activity', async () => {
    expect.assertions(3);
    try {
      let predictions = await maintenanceTaskService.MaintenancePredict(
        schedule_data,
      );
      expect(predictions.length).toBe(2);
      expect(new Date(predictions[0]).getTime()).toBeGreaterThan(
        maintSchedule2.last_maintenance_val.getTime(),
      );
      expect(new Date(predictions[1]).getTime()).toBeGreaterThan(
        maintSchedule3.last_maintenance_val.getTime(),
      );
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Predict with valid tasks with no activity', async () => {
    expect.assertions(1);
    try {
      let predictions = await maintenanceTaskService.MaintenancePredict([
        maintSchedule5,
      ]);
      expect(predictions).toStrictEqual([]);
    } catch (err) {
      console.log(err);
    }
  });

  test('3. Predict with skewed data (large intercept, positive slope)', async () => {
    expect.assertions(1);
    try {
      let predictions = await maintenanceTaskService.MaintenancePredict([
        maintSchedule6,
      ]);
      //expect(predictions).toBe();
      expect(new Date(predictions[0]).getTime()).toBeGreaterThan(
        maintSchedule6.last_maintenance_val.getTime(),
      );
    } catch (err) {
      console.log(err);
    }
  });
});

describe('MarkCompleted(maintenanceTask) Test Cases', () => {
  test('1. Valid existing repeating maintenanceTask', async () => {
    expect.assertions(3);
    try {
      let response = await maintenanceTaskService.MarkCompleted([
        maintSchedule1,
      ]);
      expect(response[0].n).toBe(1);
      expect(response[0].nModified).toBe(1);
      expect(response[1].description).toBe('oil chain');
    } catch (err) {
      console.log(err);
    }
  });

  test('2. Valid existing non-repeating maintenanceTask', async () => {
    expect.assertions(3);
    try {
      let response = await maintenanceTaskService.MarkCompleted([
        maintSchedule2,
      ]);
      expect(response.length).toBe(2);
      expect(response[0]).toBe(true);
      expect(response[1].description).toBe('tire check');
    } catch (err) {
      console.log(err);
    }
  });

  test('3. Valid existing non-repeating maintenanceTask', async () => {
    expect.assertions(5);
    try {
      let response = await maintenanceTaskService.MarkCompleted([
        maintSchedule1,
        maintSchedule2,
      ]);
      expect(response[0].n).toBe(1);
      expect(response[0].nModified).toBe(1);
      expect(response[1].description).toBe('oil chain');
      expect(response[2]).toBe(true);
      expect(response[3].description).toBe('tire check');
    } catch (err) {
      console.log(err);
    }
  });
});
