// Mock database for testing
class MockDatabase {
  constructor() {
    this.db = true; // Simulate db connection
    this.data = {
      users: [],
      diary_entries: []
    };
    this.lastID = 0;
  }

  connect() {
    return Promise.resolve(this.db);
  }

  close() {
    this.db = null;
    return Promise.resolve();
  }

  run(sql, params = []) {
    // Handle table creation
    if (sql.includes('CREATE TABLE')) {
      return Promise.resolve({ changes: 0 });
    }

    // Handle index creation
    if (sql.includes('CREATE INDEX')) {
      return Promise.resolve({ changes: 0 });
    }

    // Handle PRAGMA
    if (sql.includes('PRAGMA')) {
      return Promise.resolve({ changes: 0 });
    }

    // Handle DELETE operations
    if (sql.includes('DELETE FROM diary_entries')) {
      if (sql.includes('WHERE id = ? AND user_id = ?')) {
        const [id, userId] = params;
        const before = this.data.diary_entries.length;
        this.data.diary_entries = this.data.diary_entries.filter(
          e => !(e.id === id && e.user_id === userId)
        );
        return Promise.resolve({ changes: before - this.data.diary_entries.length });
      }
      // Generic delete all for cleanup
      this.data.diary_entries = [];
      return Promise.resolve({ changes: this.data.diary_entries.length });
    }

    if (sql.includes('DELETE FROM users')) {
      this.data.users = [];
      return Promise.resolve({ changes: this.data.users.length });
    }

    // Handle INSERT operations
    if (sql.includes('INSERT INTO users')) {
      // Validate required fields
      const [email, password, name] = params;
      if (!email || !password || !name) {
        return Promise.reject(new Error('NOT NULL constraint failed'));
      }

      // Check for duplicate email
      const existingUser = this.data.users.find(u => u.email === email);
      if (existingUser) {
        return Promise.reject(new Error('UNIQUE constraint failed: users.email'));
      }

      this.lastID++;
      const user = {
        id: this.lastID,
        email: email,
        password: password,
        name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(user);
      return Promise.resolve({ id: this.lastID, changes: 1 });
    }

    if (sql.includes('INSERT INTO diary_entries')) {
      // Validate required fields
      const [userId, title, content, entryDate, tags] = params;
      if (!userId || !title || !content || !entryDate) {
        return Promise.reject(new Error('NOT NULL constraint failed'));
      }

      // Check if user exists
      const userExists = this.data.users.find(u => u.id === userId);
      if (!userExists) {
        return Promise.reject(new Error('FOREIGN KEY constraint failed'));
      }

      this.lastID++;
      const entry = {
        id: this.lastID,
        user_id: userId,
        title: title,
        content: content,
        entry_date: entryDate,
        tags: tags || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.diary_entries.push(entry);
      return Promise.resolve({ id: this.lastID, changes: 1 });
    }

    // Handle UPDATE operations
    if (sql.includes('UPDATE users')) {
      const userId = params[params.length - 1];
      const user = this.data.users.find(u => u.id === userId);
      if (user) {
        // Update fields based on SQL
        if (sql.includes('password =')) user.password = params[0];
        if (sql.includes('name =')) user.name = params[0];
        user.updated_at = new Date().toISOString();
        return Promise.resolve({ changes: 1 });
      }
      return Promise.resolve({ changes: 0 });
    }

    if (sql.includes('UPDATE diary_entries')) {
      // Handle update with user_id check
      if (sql.includes('WHERE id = ? AND user_id = ?')) {
        const [title, content, tags, id, userId] = params;
        const entry = this.data.diary_entries.find(e => e.id === id && e.user_id === userId);
        if (entry) {
          entry.title = title;
          entry.content = content;
          entry.tags = tags || null;
          entry.updated_at = new Date().toISOString();
          return Promise.resolve({ changes: 1 });
        }
        return Promise.resolve({ changes: 0 });
      }
      // Generic update
      const entryId = params[params.length - 1];
      const entry = this.data.diary_entries.find(e => e.id === entryId);
      if (entry) {
        entry.title = params[0];
        entry.content = params[1];
        entry.tags = params[2];
        entry.updated_at = new Date().toISOString();
        return Promise.resolve({ changes: 1 });
      }
      return Promise.resolve({ changes: 0 });
    }

    // Default response
    return Promise.resolve({ changes: 0 });
  }

  get(sql, params = []) {
    // Handle COUNT queries
    if (sql.includes('COUNT(*)')) {
      if (sql.includes('FROM users')) {
        return Promise.resolve({ count: this.data.users.length });
      }
      if (sql.includes('FROM diary_entries')) {
        return Promise.resolve({ count: this.data.diary_entries.length });
      }
    }

    // Handle sqlite_master queries
    if (sql.includes('sqlite_master')) {
      if (sql.includes('name=\'users\'')) {
        return Promise.resolve({ name: 'users' });
      }
      if (sql.includes('name=\'diary_entries\'')) {
        return Promise.resolve({ name: 'diary_entries' });
      }
    }

    // Handle SELECT queries for users
    if (sql.includes('SELECT * FROM users')) {
      if (sql.includes('WHERE email =')) {
        const email = params[0];
        const user = this.data.users.find(u => u.email === email);
        return Promise.resolve(user || null);
      }
      if (sql.includes('WHERE id =')) {
        const id = params[0];
        const user = this.data.users.find(u => u.id === id);
        return Promise.resolve(user || null);
      }
    }

    // Handle SELECT queries for diary entries
    if (sql.includes('SELECT * FROM diary_entries')) {
      if (sql.includes('WHERE id =') && sql.includes('AND user_id =')) {
        const [id, userId] = params;
        const entry = this.data.diary_entries.find(
          e => e.id === id && e.user_id === userId
        );
        return Promise.resolve(entry || null);
      }
      if (sql.includes('WHERE id =')) {
        const id = params[0];
        const entry = this.data.diary_entries.find(e => e.id === id);
        return Promise.resolve(entry || null);
      }
    }

    return Promise.resolve(null);
  }

  all(sql, params = []) {
    // Handle GROUP BY COUNT queries
    if (sql.includes('SELECT entry_date, COUNT(*)') && sql.includes('GROUP BY entry_date')) {
      const [userId, startDate, endDate] = params;
      const entries = this.data.diary_entries.filter(e =>
        e.user_id === userId &&
        e.entry_date >= startDate &&
        e.entry_date <= endDate
      );

      // Group by entry_date and count
      const grouped = {};
      entries.forEach(entry => {
        grouped[entry.entry_date] = (grouped[entry.entry_date] || 0) + 1;
      });

      // Convert to array format expected by the model
      return Promise.resolve(
        // eslint-disable-next-line camelcase
        Object.entries(grouped).map(([entry_date, count]) => ({
          // eslint-disable-next-line camelcase
          entry_date,
          count
        }))
      );
    }

    // Handle SELECT queries for diary entries
    if (sql.includes('SELECT * FROM diary_entries')) {
      if (sql.includes('WHERE user_id =')) {
        const userId = params[0];
        let entries = this.data.diary_entries.filter(e => e.user_id === userId);

        // Handle exact date matching (for findByUserAndDate)
        if (sql.includes('AND entry_date = ?')) {
          const date = params[1];
          entries = entries.filter(e => e.entry_date === date);
        }

        // Handle findByUserAndTag query with special LIKE pattern
        if (sql.includes('(\',\' || tags || \',\') LIKE')) {
          const tagPattern = params[1]; // e.g., "%,work,%"
          const tag = tagPattern.replace(/%,/g, '').replace(/,%/g, '');
          entries = entries.filter(e => {
            if (!e.tags) return false;
            const tags = e.tags.split(',').map(t => t.trim());
            return tags.includes(tag);
          });
        } else if (sql.includes('title LIKE ? OR') && sql.includes('content LIKE ? OR') && sql.includes('tags LIKE ?')) {
          const searchTerm = params[1].replace(/%/g, '');
          entries = entries.filter(e =>
            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.tags && e.tags.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        } else if (sql.includes('LIKE ?')) {
          let searchIndex = 1; // Start after user_id

          // Check each condition in the SQL
          if (sql.includes('title LIKE ?')) {
            const searchTerm = params[searchIndex++].replace(/%/g, '');
            entries = entries.filter(e =>
              e.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          if (sql.includes('content LIKE ?')) {
            const searchTerm = params[searchIndex++].replace(/%/g, '');
            entries = entries.filter(e =>
              e.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          if (sql.includes('tags LIKE ?')) {
            const searchTerm = params[searchIndex++].replace(/%/g, '');
            entries = entries.filter(e =>
              e.tags && e.tags.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
        }

        // Handle date filtering
        if (sql.includes('entry_date BETWEEN')) {
          const dateParamStart = params.indexOf(params.find((p, i) => i > 0 && typeof p === 'string' && p.match(/\d{4}-\d{2}-\d{2}/)));
          if (dateParamStart !== -1) {
            const startDate = params[dateParamStart];
            const endDate = params[dateParamStart + 1];
            entries = entries.filter(e =>
              e.entry_date >= startDate && e.entry_date <= endDate
            );
          }
        }

        // Handle ordering
        if (sql.includes('ORDER BY entry_date DESC')) {
          entries.sort((a, b) => b.entry_date.localeCompare(a.entry_date));
        } else if (sql.includes('ORDER BY created_at DESC')) {
          entries.sort((a, b) => b.created_at.localeCompare(a.created_at));
        }

        // Handle LIMIT and OFFSET
        if (sql.includes('LIMIT')) {
          // Check if LIMIT/OFFSET are parameterized (using ?)
          if (sql.includes('LIMIT ?')) {
            // Find the position of LIMIT and OFFSET parameters
            let limitIndex = -1;
            let offsetIndex = -1;

            // Count ? marks to find parameter positions
            // const questionMarks = sql.match(/\?/g) || [];
            const limitPos = sql.indexOf('LIMIT ?');
            const offsetPos = sql.indexOf('OFFSET ?');

            // Calculate parameter indices
            if (limitPos > -1) {
              limitIndex = (sql.substring(0, limitPos).match(/\?/g) || []).length;
            }
            if (offsetPos > -1) {
              offsetIndex = (sql.substring(0, offsetPos).match(/\?/g) || []).length;
            }

            if (offsetIndex > -1 && params[offsetIndex] !== undefined) {
              const offset = parseInt(params[offsetIndex]);
              entries = entries.slice(offset);
            }

            if (limitIndex > -1 && params[limitIndex] !== undefined) {
              const limit = parseInt(params[limitIndex]);
              entries = entries.slice(0, limit);
            }
          } else {
            // Handle hardcoded LIMIT/OFFSET in SQL
            const limitMatch = sql.match(/LIMIT (\d+)/);
            const offsetMatch = sql.match(/OFFSET (\d+)/);

            if (offsetMatch) {
              const offset = parseInt(offsetMatch[1]);
              entries = entries.slice(offset);
            }

            if (limitMatch) {
              const limit = parseInt(limitMatch[1]);
              entries = entries.slice(0, limit);
            }
          }
        }

        return Promise.resolve(entries);
      }
    }

    return Promise.resolve([]);
  }
}

const mockDatabase = new MockDatabase();

module.exports = mockDatabase;
