const { renderWithLayout } = require('../../utils/render');

describe('Render Utilities', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      render: jest.fn()
    };
  });

  describe('renderWithLayout', () => {
    test('should render template with layout successfully', async () => {
      const template = 'dashboard';
      const data = { title: 'Dashboard', user: { name: 'John' } };
      const renderedTemplate = '<div>Dashboard content</div>';
      const finalHtml = '<html><body><div>Dashboard content</div></body></html>';

      // First call to render the template
      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(tmpl).toBe(template);
          expect(templateData).toEqual(data);
          callback(null, renderedTemplate);
        })
        // Second call to render with layout
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layout).toBe('layouts/main');
          expect(layoutData).toEqual({
            ...data,
            body: renderedTemplate
          });
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, data);

      expect(result).toBe(finalHtml);
      expect(mockRes.render).toHaveBeenCalledTimes(2);
    });

    test('should render template with empty data', async () => {
      const template = 'login';
      const renderedTemplate = '<form>Login form</form>';
      const finalHtml = '<html><body><form>Login form</form></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(tmpl).toBe(template);
          expect(templateData).toEqual({});
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layout).toBe('layouts/main');
          expect(layoutData).toEqual({ body: renderedTemplate });
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template);

      expect(result).toBe(finalHtml);
      expect(mockRes.render).toHaveBeenCalledTimes(2);
    });

    test('should preserve data properties in layout render', async () => {
      const template = 'entries/list';
      const data = { 
        title: 'My Entries', 
        user: { id: 1, name: 'Alice' },
        entries: [{ id: 1, title: 'Entry 1' }],
        csrfToken: 'abc123'
      };
      const renderedTemplate = '<div>Entries list</div>';
      const finalHtml = '<html><body><div>Entries list</div></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layoutData).toEqual({
            ...data,
            body: renderedTemplate
          });
          expect(layoutData.title).toBe('My Entries');
          expect(layoutData.user).toEqual({ id: 1, name: 'Alice' });
          expect(layoutData.entries).toEqual([{ id: 1, title: 'Entry 1' }]);
          expect(layoutData.csrfToken).toBe('abc123');
          callback(null, finalHtml);
        });

      await renderWithLayout(mockRes, template, data);
    });

    test('should reject when template rendering fails', async () => {
      const template = 'invalid-template';
      const data = { title: 'Test' };
      const templateError = new Error('Template not found');

      mockRes.render.mockImplementationOnce((tmpl, templateData, callback) => {
        callback(templateError);
      });

      await expect(renderWithLayout(mockRes, template, data))
        .rejects.toThrow('Template not found');

      expect(mockRes.render).toHaveBeenCalledTimes(1);
    });

    test('should reject when layout rendering fails', async () => {
      const template = 'dashboard';
      const data = { title: 'Dashboard' };
      const renderedTemplate = '<div>Dashboard content</div>';
      const layoutError = new Error('Layout not found');

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          callback(layoutError);
        });

      await expect(renderWithLayout(mockRes, template, data))
        .rejects.toThrow('Layout not found');

      expect(mockRes.render).toHaveBeenCalledTimes(2);
    });

    test('should handle template rendering with complex data structures', async () => {
      const template = 'calendar';
      const data = {
        title: 'Calendar View',
        user: { id: 1, name: 'Bob', preferences: { theme: 'dark' } },
        calendar: {
          year: 2024,
          month: 0,
          weeks: [
            [null, { day: 1 }, { day: 2 }],
            [{ day: 3 }, { day: 4 }, { day: 5 }]
          ]
        },
        entries: {
          '2024-01-01': [{ id: 1, title: 'New Year' }],
          '2024-01-02': []
        }
      };
      const renderedTemplate = '<div>Calendar with entries</div>';
      const finalHtml = '<html><body><div>Calendar with entries</div></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(templateData).toEqual(data);
          expect(templateData.calendar.weeks).toBeInstanceOf(Array);
          expect(templateData.entries).toHaveProperty('2024-01-01');
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layoutData.calendar).toEqual(data.calendar);
          expect(layoutData.entries).toEqual(data.entries);
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, data);
      expect(result).toBe(finalHtml);
    });

    test('should handle undefined data parameter', async () => {
      const template = 'error';
      const renderedTemplate = '<div>Error page</div>';
      const finalHtml = '<html><body><div>Error page</div></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(tmpl).toBe(template);
          expect(templateData).toEqual({});
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layoutData).toEqual({ body: renderedTemplate });
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, undefined);
      expect(result).toBe(finalHtml);
    });

    test('should handle null data parameter', async () => {
      const template = '404';
      const renderedTemplate = '<div>Not found</div>';
      const finalHtml = '<html><body><div>Not found</div></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(templateData).toBeNull();
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layoutData.body).toBe(renderedTemplate);
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, null);
      expect(result).toBe(finalHtml);
    });

    test('should handle empty string template', async () => {
      const template = '';
      const data = { title: 'Empty Template Test' };
      const renderedTemplate = '';
      const finalHtml = '<html><body></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(tmpl).toBe('');
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layoutData.body).toBe('');
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, data);
      expect(result).toBe(finalHtml);
    });

    test('should preserve function properties in data', async () => {
      const template = 'test';
      const helperFunction = jest.fn().mockReturnValue('helper result');
      const data = {
        title: 'Test',
        helper: helperFunction,
        formatDate: (date) => date.toISOString()
      };
      const renderedTemplate = '<div>Test content</div>';
      const finalHtml = '<html><body><div>Test content</div></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(typeof templateData.helper).toBe('function');
          expect(typeof templateData.formatDate).toBe('function');
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(typeof layoutData.helper).toBe('function');
          expect(typeof layoutData.formatDate).toBe('function');
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, data);
      expect(result).toBe(finalHtml);
    });

    test('should handle template names with paths', async () => {
      const template = 'auth/login';
      const data = { title: 'Login', error: null };
      const renderedTemplate = '<form>Login form</form>';
      const finalHtml = '<html><body><form>Login form</form></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          expect(tmpl).toBe('auth/login');
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, data);
      expect(result).toBe(finalHtml);
    });
  });

  describe('error handling edge cases', () => {
    test('should handle synchronous errors in template rendering', async () => {
      const template = 'sync-error-template';
      
      mockRes.render.mockImplementationOnce(() => {
        throw new Error('Synchronous template error');
      });

      // This should still reject since the synchronous error will be caught
      await expect(renderWithLayout(mockRes, template, {}))
        .rejects.toThrow();
    });

    test('should handle template rendering with circular reference in data', async () => {
      const template = 'circular-test';
      const data = { title: 'Circular Test' };
      data.self = data; // Create circular reference
      
      const renderedTemplate = '<div>Circular test</div>';
      const finalHtml = '<html><body><div>Circular test</div></body></html>';

      mockRes.render
        .mockImplementationOnce((tmpl, templateData, callback) => {
          // The circular reference should be preserved
          expect(templateData.title).toBe('Circular Test');
          expect(templateData.self).toBe(templateData);
          callback(null, renderedTemplate);
        })
        .mockImplementationOnce((layout, layoutData, callback) => {
          expect(layoutData.title).toBe('Circular Test');
          expect(layoutData.body).toBe(renderedTemplate);
          // The circular reference is preserved but not the same object due to spreading
          expect(layoutData.self).toEqual(expect.objectContaining({
            title: 'Circular Test'
          }));
          callback(null, finalHtml);
        });

      const result = await renderWithLayout(mockRes, template, data);
      expect(result).toBe(finalHtml);
    });
  });
});