const DiaryEntry = require('../../models/DiaryEntry');

class EntryFactory {
  static async create(userId, overrides = {}) {
    const defaultData = {
      user_id: userId,
      title: 'Test Entry',
      content: 'This is a test diary entry content.',
      entry_date: '2024-01-15',
      tags: 'test,diary'
    };

    return await DiaryEntry.create({ ...defaultData, ...overrides });
  }

  static async createMultiple(userId, count, overrides = {}) {
    const entries = [];
    for (let i = 0; i < count; i++) {
      const date = new Date('2024-01-15');
      date.setDate(date.getDate() + i);
      
      entries.push(await this.create(userId, {
        title: `Test Entry ${i + 1}`,
        content: `This is test diary entry number ${i + 1}.`,
        entry_date: date.toISOString().split('T')[0],
        ...overrides
      }));
    }
    return entries;
  }

  static getValidEntryData(userId, overrides = {}) {
    return {
      user_id: userId,
      title: 'Test Entry',
      content: 'This is a test diary entry content.',
      entry_date: '2024-01-15',
      tags: 'test,diary',
      ...overrides
    };
  }

  static async createWithDateRange(userId, startDate, endDate, overrides = {}) {
    const entries = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = new Date(start);
    let counter = 1;

    while (current <= end) {
      entries.push(await this.create(userId, {
        title: `Entry ${counter}`,
        content: `Content for entry on ${current.toISOString().split('T')[0]}`,
        entry_date: current.toISOString().split('T')[0],
        ...overrides
      }));
      
      current.setDate(current.getDate() + 1);
      counter++;
    }
    
    return entries;
  }
}

module.exports = EntryFactory;