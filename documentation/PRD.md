# Diary Books - Product Requirements Document

## Overview
A web-based diary application allowing users to create, manage, and organize daily diary entries through an intuitive calendar interface.

## Technical Architecture
- **Structure**: Monorepo with clean separation of concerns
- **Principles**: Clean code and SOLID principles
- **Frontend**: Responsive web application using Bootstrap
- **Backend**: Express.js REST API
- **Database**: SQLite with migration support
- **Authentication**: JWT-based authentication

## Core Features

### 1. User Authentication
- **Login Page**: Email and password authentication
- **Registration Page**: 
  - Email (required)
  - Username (required)
  - Birth date (required)
  - Gender (required)
  - Password (required)
- **Security**: JWT token-based authentication
- **Validation**: Input validation and error handling

### 2. Calendar Dashboard
- **Home Page**: Full calendar view of current month (login required)
- **Navigation**: Month/year navigation
- **Day Selection**: Clickable calendar days
- **Visual Indicators**: Show days with existing entries

### 3. Diary Entry Management
- **Multiple Entries**: Multiple diary entries per day
- **Entry Fields**:
  - Title (required)
  - Content (WYSIWYG editor)
  - Tags (optional, comma-separated)
- **Operations**: Create, read, update, delete entries
- **Editor**: Rich text WYSIWYG editor for content

### 4. Data Management
- **Database**: SQLite with proper schema
- **Migrations**: Database migration files for schema management
- **Data Validation**: Server-side input validation
- **Error Handling**: Comprehensive error handling and user feedback

## User Flow
1. User visits application
2. Register new account or login with existing credentials
3. Access calendar dashboard showing current month
4. Click on any day to view/manage entries for that date
5. Add, edit, or delete diary entries as needed
6. Navigate between months to access historical entries

## Technical Requirements
- Responsive design (mobile-friendly)
- Clean, maintainable codebase
- Proper error handling and validation
- Secure authentication flow
- Database migrations for schema management
- RESTful API design
- Cross-browser compatibility