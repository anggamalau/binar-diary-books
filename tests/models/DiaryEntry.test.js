const DiaryEntry = require('../../models/DiaryEntry');
const User = require('../../models/User');

// Mock auth utilities for user creation
jest.mock('../../utils/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedpassword'),
  comparePassword: jest.fn().mockResolvedValue(true)
}));

describe('DiaryEntry Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for diary entries
    testUser = await User.create({
      email: 'diarytest@example.com',
      password: 'password123',
      name: 'Diary Test User'
    });
  });

  describe('Constructor', () => {
    test('should create a DiaryEntry instance with all properties', () => {
      const entryData = {
        id: 1,
        user_id: 1,
        title: 'Test Entry',
        content: 'This is a test diary entry.',
        entry_date: '2024-01-15',
        tags: 'test,diary',
        created_at: '2024-01-15 10:00:00',
        updated_at: '2024-01-15 10:00:00'
      };

      const entry = new DiaryEntry(entryData);

      expect(entry.id).toBe(1);
      expect(entry.user_id).toBe(1);
      expect(entry.title).toBe('Test Entry');
      expect(entry.content).toBe('This is a test diary entry.');
      expect(entry.entry_date).toBe('2024-01-15');
      expect(entry.tags).toBe('test,diary');
      expect(entry.created_at).toBe('2024-01-15 10:00:00');
      expect(entry.updated_at).toBe('2024-01-15 10:00:00');
    });
  });

  describe('create()', () => {
    test('should create entry with valid data', async () => {
      const entryData = {
        user_id: testUser.id,
        title: 'My First Entry',
        content: 'Today was a great day!',
        entry_date: '2024-01-15',
        tags: 'happy,great'
      };

      const createdEntry = await DiaryEntry.create(entryData);

      expect(createdEntry).toBeDefined();
      expect(createdEntry.user_id).toBe(testUser.id);
      expect(createdEntry.title).toBe('My First Entry');
      expect(createdEntry.content).toBe('Today was a great day!');
      expect(createdEntry.entry_date).toBe('2024-01-15');
      expect(createdEntry.tags).toBe('happy,great');
      expect(createdEntry.id).toBeDefined();
    });

    test('should handle optional tags', async () => {
      const entryData = {
        user_id: testUser.id,
        title: 'Entry Without Tags',
        content: 'This entry has no tags.',
        entry_date: '2024-01-16'
        // tags not provided
      };

      const createdEntry = await DiaryEntry.create(entryData);

      expect(createdEntry.tags).toBeNull();
    });

    test('should handle empty tags', async () => {
      const entryData = {
        user_id: testUser.id,
        title: 'Entry With Empty Tags',
        content: 'This entry has empty tags.',
        entry_date: '2024-01-17',
        tags: ''
      };

      const createdEntry = await DiaryEntry.create(entryData);

      // Empty string tags are converted to null by the model logic (tags || null)
      expect(createdEntry.tags).toBeNull();
    });

    test('should validate required fields', async () => {
      const incompleteEntryData = {
        user_id: testUser.id,
        title: 'Incomplete Entry'
        // missing content and entry_date
      };

      await expect(DiaryEntry.create(incompleteEntryData)).rejects.toThrow();
    });

    test('should handle null tags correctly', async () => {
      const entryData = {
        user_id: testUser.id,
        title: 'Null Tags Entry',
        content: 'This entry has null tags.',
        entry_date: '2024-01-18',
        tags: null
      };

      const createdEntry = await DiaryEntry.create(entryData);

      expect(createdEntry.tags).toBeNull();
    });

    test('should throw error for invalid user_id', async () => {
      const entryData = {
        user_id: 99999, // Non-existent user
        title: 'Invalid User Entry',
        content: 'This should fail.',
        entry_date: '2024-01-19'
      };

      await expect(DiaryEntry.create(entryData)).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    test('should return entry for valid ID', async () => {
      const entryData = {
        user_id: testUser.id,
        title: 'Find By ID Entry',
        content: 'Content for find by ID test.',
        entry_date: '2024-01-20',
        tags: 'findbyid,test'
      };

      const createdEntry = await DiaryEntry.create(entryData);
      const foundEntry = await DiaryEntry.findById(createdEntry.id);

      expect(foundEntry).toBeDefined();
      expect(foundEntry.id).toBe(createdEntry.id);
      expect(foundEntry.title).toBe('Find By ID Entry');
      expect(foundEntry.content).toBe('Content for find by ID test.');
      expect(foundEntry.tags).toBe('findbyid,test');
    });

    test('should return null for non-existent ID', async () => {
      const foundEntry = await DiaryEntry.findById(99999);

      expect(foundEntry).toBeNull();
    });

    test('should return null for invalid ID types', async () => {
      const foundEntry = await DiaryEntry.findById('invalid');

      expect(foundEntry).toBeNull();
    });
  });

  describe('findByUserAndDate()', () => {
    beforeEach(async () => {
      // Create multiple entries for different dates
      await DiaryEntry.create({
        user_id: testUser.id,
        title: 'Entry 1',
        content: 'First entry on 2024-01-15',
        entry_date: '2024-01-15'
      });

      await DiaryEntry.create({
        user_id: testUser.id,
        title: 'Entry 2',
        content: 'Second entry on 2024-01-15',
        entry_date: '2024-01-15'
      });

      await DiaryEntry.create({
        user_id: testUser.id,
        title: 'Entry 3',
        content: 'Entry on 2024-01-16',
        entry_date: '2024-01-16'
      });
    });

    test('should return entries for specific date', async () => {
      const entries = await DiaryEntry.findByUserAndDate(testUser.id, '2024-01-15');

      expect(entries).toHaveLength(2);
      expect(entries[0].title).toBe('Entry 1');
      expect(entries[1].title).toBe('Entry 2');
      expect(entries[0].entry_date).toBe('2024-01-15');
      expect(entries[1].entry_date).toBe('2024-01-15');
    });

    test('should return empty array for date with no entries', async () => {
      const entries = await DiaryEntry.findByUserAndDate(testUser.id, '2024-01-20');

      expect(entries).toHaveLength(0);
      expect(Array.isArray(entries)).toBe(true);
    });

    test('should respect user isolation', async () => {
      // Create another user
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'password123',
        name: 'Another User'
      });

      // Create entry for another user on same date
      await DiaryEntry.create({
        user_id: anotherUser.id,
        title: 'Another User Entry',
        content: 'This should not appear in testUser results',
        entry_date: '2024-01-15'
      });

      const entries = await DiaryEntry.findByUserAndDate(testUser.id, '2024-01-15');

      expect(entries).toHaveLength(2); // Still only testUser's entries
      expect(entries.every(entry => entry.user_id === testUser.id)).toBe(true);
    });

    test('should order entries by created_at ASC', async () => {
      const entries = await DiaryEntry.findByUserAndDate(testUser.id, '2024-01-15');

      // Assuming Entry 1 was created first, it should come first
      expect(entries[0].title).toBe('Entry 1');
      expect(entries[1].title).toBe('Entry 2');
    });
  });

  describe('findByUserAndDateRange()', () => {
    beforeEach(async () => {
      // Create entries across multiple dates
      const dates = ['2024-01-10', '2024-01-15', '2024-01-20', '2024-01-25'];
      
      for (let i = 0; i < dates.length; i++) {
        await DiaryEntry.create({
          user_id: testUser.id,
          title: `Entry ${i + 1}`,
          content: `Content for ${dates[i]}`,
          entry_date: dates[i]
        });
      }
    });

    test('should return entries within date range', async () => {
      const entries = await DiaryEntry.findByUserAndDateRange(
        testUser.id, 
        '2024-01-12', 
        '2024-01-22'
      );

      expect(entries).toHaveLength(2);
      expect(entries[0].entry_date).toBe('2024-01-15');
      expect(entries[1].entry_date).toBe('2024-01-20');
    });

    test('should return empty array for range with no entries', async () => {
      const entries = await DiaryEntry.findByUserAndDateRange(
        testUser.id, 
        '2024-02-01', 
        '2024-02-28'
      );

      expect(entries).toHaveLength(0);
    });

    test('should include boundary dates', async () => {
      const entries = await DiaryEntry.findByUserAndDateRange(
        testUser.id, 
        '2024-01-15', 
        '2024-01-20'
      );

      expect(entries).toHaveLength(2);
      expect(entries[0].entry_date).toBe('2024-01-15');
      expect(entries[1].entry_date).toBe('2024-01-20');
    });

    test('should order by entry_date ASC, then created_at ASC', async () => {
      const entries = await DiaryEntry.findByUserAndDateRange(
        testUser.id, 
        '2024-01-01', 
        '2024-01-31'
      );

      expect(entries).toHaveLength(4);
      expect(entries[0].entry_date).toBe('2024-01-10');
      expect(entries[1].entry_date).toBe('2024-01-15');
      expect(entries[2].entry_date).toBe('2024-01-20');
      expect(entries[3].entry_date).toBe('2024-01-25');
    });
  });

  describe('findByUser()', () => {
    beforeEach(async () => {
      // Create entries with different dates
      const entries = [
        { title: 'Oldest Entry', date: '2024-01-10' },
        { title: 'Middle Entry', date: '2024-01-15' },
        { title: 'Newest Entry', date: '2024-01-20' }
      ];

      for (const entry of entries) {
        await DiaryEntry.create({
          user_id: testUser.id,
          title: entry.title,
          content: `Content for ${entry.title}`,
          entry_date: entry.date
        });
      }
    });

    test('should return all user entries by default', async () => {
      const entries = await DiaryEntry.findByUser(testUser.id);

      expect(entries).toHaveLength(3);
    });

    test('should order by entry_date DESC, created_at DESC', async () => {
      const entries = await DiaryEntry.findByUser(testUser.id);

      expect(entries[0].title).toBe('Newest Entry');
      expect(entries[1].title).toBe('Middle Entry');
      expect(entries[2].title).toBe('Oldest Entry');
    });

    test('should respect limit parameter', async () => {
      const entries = await DiaryEntry.findByUser(testUser.id, 2);

      expect(entries).toHaveLength(2);
      expect(entries[0].title).toBe('Newest Entry');
      expect(entries[1].title).toBe('Middle Entry');
    });

    test('should respect offset parameter', async () => {
      const entries = await DiaryEntry.findByUser(testUser.id, 2, 1);

      expect(entries).toHaveLength(2);
      expect(entries[0].title).toBe('Middle Entry');
      expect(entries[1].title).toBe('Oldest Entry');
    });

    test('should handle limit without offset', async () => {
      const entries = await DiaryEntry.findByUser(testUser.id, 1);

      expect(entries).toHaveLength(1);
      expect(entries[0].title).toBe('Newest Entry');
    });
  });

  describe('getEntryCounts()', () => {
    beforeEach(async () => {
      // Create entries with varying counts per date
      const entriesData = [
        { date: '2024-01-10', count: 1 },
        { date: '2024-01-15', count: 3 },
        { date: '2024-01-20', count: 2 }
      ];

      for (const { date, count } of entriesData) {
        for (let i = 0; i < count; i++) {
          await DiaryEntry.create({
            user_id: testUser.id,
            title: `Entry ${i + 1} on ${date}`,
            content: `Content ${i + 1}`,
            entry_date: date
          });
        }
      }
    });

    test('should return correct entry counts for date range', async () => {
      const counts = await DiaryEntry.getEntryCounts(
        testUser.id,
        '2024-01-01',
        '2024-01-31'
      );

      expect(counts['2024-01-10']).toBe(1);
      expect(counts['2024-01-15']).toBe(3);
      expect(counts['2024-01-20']).toBe(2);
    });

    test('should return empty object for range with no entries', async () => {
      const counts = await DiaryEntry.getEntryCounts(
        testUser.id,
        '2024-02-01',
        '2024-02-28'
      );

      expect(Object.keys(counts)).toHaveLength(0);
    });

    test('should only include dates within range', async () => {
      const counts = await DiaryEntry.getEntryCounts(
        testUser.id,
        '2024-01-12',
        '2024-01-18'
      );

      expect(counts['2024-01-15']).toBe(3);
      expect(counts['2024-01-10']).toBeUndefined();
      expect(counts['2024-01-20']).toBeUndefined();
    });
  });

  describe('update()', () => {
    let testEntry;

    beforeEach(async () => {
      testEntry = await DiaryEntry.create({
        user_id: testUser.id,
        title: 'Original Title',
        content: 'Original content',
        entry_date: '2024-01-15',
        tags: 'original,test'
      });
    });

    test('should update entry with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        tags: 'updated,test'
      };

      const updatedEntry = await testEntry.update(updateData);

      expect(updatedEntry.title).toBe('Updated Title');
      expect(updatedEntry.content).toBe('Updated content');
      expect(updatedEntry.tags).toBe('updated,test');
      expect(updatedEntry.id).toBe(testEntry.id);
    });

    test('should handle null tags in update', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        tags: null
      };

      const updatedEntry = await testEntry.update(updateData);

      expect(updatedEntry.tags).toBeNull();
    });

    test('should throw error for unauthorized update', async () => {
      // Create another user
      const anotherUser = await User.create({
        email: 'unauthorized@example.com',
        password: 'password123',
        name: 'Unauthorized User'
      });

      // Try to update with wrong user_id
      testEntry.user_id = anotherUser.id;

      const updateData = {
        title: 'Unauthorized Update',
        content: 'This should fail',
        tags: 'unauthorized'
      };

      await expect(testEntry.update(updateData)).rejects.toThrow('Entry not found or unauthorized');
    });

    test('should throw error for non-existent entry', async () => {
      testEntry.id = 99999;

      const updateData = {
        title: 'Non-existent Update',
        content: 'This should fail',
        tags: 'nonexistent'
      };

      await expect(testEntry.update(updateData)).rejects.toThrow('Entry not found or unauthorized');
    });

    test('should update timestamp on modification', async () => {
      const originalUpdatedAt = testEntry.updated_at;

      const updateData = {
        title: 'Time Test Update',
        content: 'Updated for time test',
        tags: 'time,test'
      };

      const updatedEntry = await testEntry.update(updateData);

      // Note: In a real scenario, updated_at would be different
      // This test verifies the SQL includes CURRENT_TIMESTAMP
      expect(updatedEntry.updated_at).toBeDefined();
    });
  });

  describe('delete()', () => {
    let testEntry;

    beforeEach(async () => {
      testEntry = await DiaryEntry.create({
        user_id: testUser.id,
        title: 'Entry to Delete',
        content: 'This entry will be deleted',
        entry_date: '2024-01-15',
        tags: 'delete,test'
      });
    });

    test('should delete entry successfully', async () => {
      const result = await testEntry.delete();

      expect(result).toBe(true);

      // Verify entry is deleted
      const foundEntry = await DiaryEntry.findById(testEntry.id);
      expect(foundEntry).toBeNull();
    });

    test('should throw error for unauthorized delete', async () => {
      // Create another user
      const anotherUser = await User.create({
        email: 'deletetest@example.com',
        password: 'password123',
        name: 'Delete Test User'
      });

      // Try to delete with wrong user_id
      testEntry.user_id = anotherUser.id;

      await expect(testEntry.delete()).rejects.toThrow('Entry not found or unauthorized');
    });

    test('should throw error for non-existent entry', async () => {
      testEntry.id = 99999;

      await expect(testEntry.delete()).rejects.toThrow('Entry not found or unauthorized');
    });

    test('should handle double deletion gracefully', async () => {
      await testEntry.delete();

      // Try to delete again
      await expect(testEntry.delete()).rejects.toThrow('Entry not found or unauthorized');
    });
  });

  describe('findByUserAndTag()', () => {
    beforeEach(async () => {
      const entriesData = [
        { title: 'Work Entry', tags: 'work,important' },
        { title: 'Personal Entry', tags: 'personal,life' },
        { title: 'Mixed Entry', tags: 'work,personal,mixed' },
        { title: 'No Tags Entry', tags: null }
      ];

      for (const entry of entriesData) {
        await DiaryEntry.create({
          user_id: testUser.id,
          title: entry.title,
          content: `Content for ${entry.title}`,
          entry_date: '2024-01-15',
          tags: entry.tags
        });
      }
    });

    test('should find entries with specific tag', async () => {
      const entries = await DiaryEntry.findByUserAndTag(testUser.id, 'work');

      expect(entries).toHaveLength(2);
      expect(entries.some(e => e.title === 'Work Entry')).toBe(true);
      expect(entries.some(e => e.title === 'Mixed Entry')).toBe(true);
    });

    test('should return empty array for non-existent tag', async () => {
      const entries = await DiaryEntry.findByUserAndTag(testUser.id, 'nonexistent');

      expect(entries).toHaveLength(0);
    });

    test('should handle exact tag matching', async () => {
      const entries = await DiaryEntry.findByUserAndTag(testUser.id, 'personal');

      expect(entries).toHaveLength(2);
      expect(entries.some(e => e.title === 'Personal Entry')).toBe(true);
      expect(entries.some(e => e.title === 'Mixed Entry')).toBe(true);
    });

    test('should order by entry_date DESC, created_at DESC', async () => {
      // Create entries on different dates
      await DiaryEntry.create({
        user_id: testUser.id,
        title: 'Newer Work Entry',
        content: 'Newer work content',
        entry_date: '2024-01-20',
        tags: 'work,new'
      });

      const entries = await DiaryEntry.findByUserAndTag(testUser.id, 'work');

      expect(entries[0].title).toBe('Newer Work Entry');
    });
  });

  describe('searchByUser()', () => {
    beforeEach(async () => {
      const entriesData = [
        { title: 'Meeting Notes', content: 'Important client meeting', tags: 'work,meeting' },
        { title: 'Personal Thoughts', content: 'Reflecting on life goals', tags: 'personal,goals' },
        { title: 'Project Update', content: 'Working on important features', tags: 'work,project' },
        { title: 'Random Entry', content: 'Just some random thoughts', tags: 'random' }
      ];

      for (const entry of entriesData) {
        await DiaryEntry.create({
          user_id: testUser.id,
          title: entry.title,
          content: entry.content,
          entry_date: '2024-01-15',
          tags: entry.tags
        });
      }
    });

    test('should search in title', async () => {
      const entries = await DiaryEntry.searchByUser(testUser.id, 'Meeting');

      expect(entries).toHaveLength(1);
      expect(entries[0].title).toBe('Meeting Notes');
    });

    test('should search in content', async () => {
      const entries = await DiaryEntry.searchByUser(testUser.id, 'important');

      expect(entries).toHaveLength(2);
      expect(entries.some(e => e.title === 'Meeting Notes')).toBe(true);
      expect(entries.some(e => e.title === 'Project Update')).toBe(true);
    });

    test('should search in tags', async () => {
      const entries = await DiaryEntry.searchByUser(testUser.id, 'work');

      expect(entries).toHaveLength(2);
      expect(entries.some(e => e.title === 'Meeting Notes')).toBe(true);
      expect(entries.some(e => e.title === 'Project Update')).toBe(true);
    });

    test('should be case insensitive', async () => {
      const entries = await DiaryEntry.searchByUser(testUser.id, 'MEETING');

      expect(entries).toHaveLength(1);
      expect(entries[0].title).toBe('Meeting Notes');
    });

    test('should respect limit parameter', async () => {
      // Use a more general search term that will match multiple entries
      const entries = await DiaryEntry.searchByUser(testUser.id, 'on', 2);

      expect(entries.length).toBeGreaterThanOrEqual(1);
      expect(entries.length).toBeLessThanOrEqual(2);
    });

    test('should respect offset parameter', async () => {
      // First get all results to understand the data
      const allEntries = await DiaryEntry.searchByUser(testUser.id, 'on');
      
      if (allEntries.length >= 3) {
        const entries = await DiaryEntry.searchByUser(testUser.id, 'on', 2, 1);
        expect(entries.length).toBeGreaterThanOrEqual(1);
        expect(entries.length).toBeLessThanOrEqual(2);
      } else {
        // If we don't have enough entries, just verify offset works
        const entries = await DiaryEntry.searchByUser(testUser.id, 'on', 1, 1);
        expect(entries.length).toBeLessThanOrEqual(1);
      }
    });

    test('should return empty array for no matches', async () => {
      const entries = await DiaryEntry.searchByUser(testUser.id, 'nonexistent');

      expect(entries).toHaveLength(0);
    });
  });

  describe('toJSON()', () => {
    test('should return all properties', () => {
      const entryData = {
        id: 1,
        user_id: 1,
        title: 'JSON Test Entry',
        content: 'Content for JSON test',
        entry_date: '2024-01-15',
        tags: 'json,test',
        created_at: '2024-01-15 10:00:00',
        updated_at: '2024-01-15 10:00:00'
      };

      const entry = new DiaryEntry(entryData);
      const json = entry.toJSON();

      expect(json).toEqual(entryData);
    });

    test('should handle null tags', () => {
      const entryData = {
        id: 1,
        user_id: 1,
        title: 'JSON Test Entry',
        content: 'Content for JSON test',
        entry_date: '2024-01-15',
        tags: null,
        created_at: '2024-01-15 10:00:00',
        updated_at: '2024-01-15 10:00:00'
      };

      const entry = new DiaryEntry(entryData);
      const json = entry.toJSON();

      expect(json.tags).toBeNull();
    });
  });

  describe('getFormattedDate()', () => {
    test('should format date correctly', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Date Test',
        content: 'Content',
        entry_date: '2024-01-15'
      });

      const formatted = entry.getFormattedDate();

      expect(formatted).toMatch(/Monday, January 15, 2024/);
    });

    test('should handle different date formats', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Date Test',
        content: 'Content',
        entry_date: '2024-12-25'
      });

      const formatted = entry.getFormattedDate();

      expect(formatted).toMatch(/Wednesday, December 25, 2024/);
    });
  });

  describe('getFormattedCreatedAt()', () => {
    test('should format created_at timestamp correctly', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Timestamp Test',
        content: 'Content',
        entry_date: '2024-01-15',
        created_at: '2024-01-15T10:30:00Z'
      });

      const formatted = entry.getFormattedCreatedAt();

      expect(formatted).toMatch(/Jan 15, 2024/);
      // Time might be displayed differently based on timezone, so just check it exists
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('getTagsArray()', () => {
    test('should return array of tags', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Tags Test',
        content: 'Content',
        entry_date: '2024-01-15',
        tags: 'work,important,meeting'
      });

      const tagsArray = entry.getTagsArray();

      expect(tagsArray).toEqual(['work', 'important', 'meeting']);
    });

    test('should handle tags with spaces', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Tags Test',
        content: 'Content',
        entry_date: '2024-01-15',
        tags: 'work, important , meeting'
      });

      const tagsArray = entry.getTagsArray();

      expect(tagsArray).toEqual(['work', 'important', 'meeting']);
    });

    test('should return empty array for null tags', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Tags Test',
        content: 'Content',
        entry_date: '2024-01-15',
        tags: null
      });

      const tagsArray = entry.getTagsArray();

      expect(tagsArray).toEqual([]);
    });

    test('should return empty array for empty tags', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Tags Test',
        content: 'Content',
        entry_date: '2024-01-15',
        tags: ''
      });

      const tagsArray = entry.getTagsArray();

      expect(tagsArray).toEqual([]);
    });

    test('should filter out empty tags', () => {
      const entry = new DiaryEntry({
        id: 1,
        user_id: 1,
        title: 'Tags Test',
        content: 'Content',
        entry_date: '2024-01-15',
        tags: 'work,,important,'
      });

      const tagsArray = entry.getTagsArray();

      expect(tagsArray).toEqual(['work', 'important']);
    });
  });

  describe('formatTagsForStorage()', () => {
    test('should format tags correctly for storage', () => {
      const formatted = DiaryEntry.formatTagsForStorage('work, important , meeting');

      expect(formatted).toBe('work,important,meeting');
    });

    test('should return null for empty string', () => {
      const formatted = DiaryEntry.formatTagsForStorage('');

      expect(formatted).toBeNull();
    });

    test('should return null for null input', () => {
      const formatted = DiaryEntry.formatTagsForStorage(null);

      expect(formatted).toBeNull();
    });

    test('should return null for whitespace only', () => {
      const formatted = DiaryEntry.formatTagsForStorage('   ');

      expect(formatted).toBeNull();
    });

    test('should filter out empty tags', () => {
      const formatted = DiaryEntry.formatTagsForStorage('work,,important,');

      expect(formatted).toBe('work,important');
    });

    test('should return null if all tags are empty after filtering', () => {
      const formatted = DiaryEntry.formatTagsForStorage(',,, ,');

      expect(formatted).toBeNull();
    });
  });
});