**CREATE PRD**

```sh
create PRD document then save into ./documentation/PRD.md
i want to use this PRD as a steps that i will follow on vibe coding, make sure the document is concise and easy to read

the application is structured as a mono repo with clear separation of concerns
the application is using clean code and solid principles
the application is a web application
the application has a responsive design using Bootstrap
the application is using express js for the backend
the application is using SQLite for the database
the application has a basic login page using email and password, using JWT for authentication
the application has a basic register page with field, email, username, birth date, gender and password as inputs
the application has basic error handling and validation for user inputs
the application has a home page that can be accessed after logged in that shows a full calendar of the current month:
- each day in the calendar can be clicked to view diary entries for that day
- each day can have multiple diary entries
- diary entries can be added, edited, or deleted
- diary entry is simple text with title, tags, and content using a WYSIWYG editor
the project has migration files for the SQLite database
```

**UPDATE THE PRD**
```sh
update @documentation/PRD.md:
express js SSR with ejs templating
use common ssr structure instead of mono-repo structure
```

```sh
update @documentation/PRD.md:
separate feature implementation incrementaly
```

**IMPLEMENT PHASE 1**
```sh
based on @documentation/PRD.md implement Phase 1
```

**IMPLEMENT PHASE 2**
```sh
based on @documentation/PRD.md implement Phase 2
```

**IMPLEMENT PHASE 3**
```sh
based on @documentation/PRD.md implement Phase 3
```

**IMPLEMENT PHASE 4**
```sh
based on @documentation/PRD.md implement Phase 4
```

**IMPLEMENT PHASE 5**
```sh
based on @documentation/PRD.md implement Phase 5
```

**ASK FOR UI/UX IMPROVEMENT PLAN**
```sh
make a plan for improving ui/ux on dashboard pages
save the plan into documentation directory
```

**ASK FOR UNIT TESTING PLAN**
```sh
make a plan for unit testing
save the plan into documentation directory
```

**IMPLEMENT UNIT TESTING**
```sh
based on @documentation/unit-testing-plan.md
implement unit testing plan phase 1
```
Terjadi error saat menjalankan npm start
```sh
do not code, find the reason that causing this error when execute npm start. here is the error:
Cannot log after tests are done. Did you forget to wait for something async in your test?
    Attempted to log "Database connection closed".

      30 |           console.error('Error closing database:', err.message);
      31 |         } else {
    > 32 |           console.log('Database connection closed');
         |                   ^
      33 |         }
      34 |       });
      35 |     }

      at console.log (node_modules/@jest/console/build/CustomConsole.js:141:10)
      at Database.log (config/database.js:32:19)
      at Database.replacement (node_modules/sqlite3/lib/trace.js:25:27)
```

```sh
execute Option 2: Make Database Close Synchronous in Tests is the best option.
```

```sh
based on @documentation/unit-testing-plan.md
implement unit testing plan phase 2
```

```sh
based on @documentation/unit-testing-plan.md
implement unit testing plan phase 3
```

**IMPLEMENT LINT**
```sh
implement eslint for coding style and code quality
```

Muncul warning ketika menjalan lint
```sh
find the reason that causing this warning:
(node:62646) ESLintIgnoreWarning: The ".eslintignore" file is no longer supported. Switch to using the "ignores" property in "eslint.config.js": https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
(Use `node --trace-warnings ...` to show where the warning was created)
```

npm run lint:fix tidak memperbaiki code secara otomasi
```sh
npm run lint:fix do not auto-fixing the code, what is causing that
```

Beberapa error dan warning tidak dapat di-fixing otomatis, perlu dilakukan manual edit
```sh
It cannot auto-fix:
- ❌ Unused variables - Requires manual decision (remove/rename with _ prefix)
- ❌ Console statements - Requires manual review to keep/remove
- ❌ Logic errors - Need human judgment
```