# role_management.prompt

## Title
Role-Based Access Control (RBAC) System

## Description
Implement a role management system with two distinct roles: **Quiz Manager** (for creating/editing/deleting quiz content) and **Quiz Taker** (for attempting quizzes and viewing results). This feature adds authorization layer to the existing JWT authentication system, ensuring proper access control across the application.

The implementation uses an enum-based approach for simplicity and performance, with roles stored in the database, included in JWT tokens, and enforced through backend middleware. Frontend provides role-based UI and route protection for better UX.

## Affected Areas
**All areas**: Frontend / Backend / Database / Shared Types / Docs / QA

- **Database**: New UserRole enum, User model schema change, migration, seed updates
- **Shared Types**: UserRole enum, User interface update, new constants
- **Backend**: JWT enhancement, authorization middleware, route protection, controller updates
- **Frontend**: UserContext updates, role-based routing, UI components, management dashboard
- **Documentation**: CLAUDE.md, README.md, migration guide
- **QA/Security**: Authorization testing, privilege escalation prevention, security audit

## Steps

### Phase 1: Database and Shared Types (Foundation)
1. Add `UserRole` enum to `database/prisma/schema.prisma` with values: `QUIZ_TAKER`, `QUIZ_MANAGER`
2. Add `role` field to User model: `role UserRole @default(QUIZ_TAKER)`
3. Generate and run migration: `npm run db:migrate`
4. Update `database/prisma/seed.ts` to create demo users with both roles
5. Re-seed database: `npm run db:seed`
6. Add `UserRole` enum to `shared/src/types.ts` matching Prisma schema
7. Update `User` interface in `shared/src/types.ts` to include `role: UserRole`
8. Add role-related constants to `shared/src/constants.ts` (display names, descriptions, error messages)
9. Verify with `npm run db:studio` that schema changes applied correctly

### Phase 2: Backend Authentication & Authorization (Core Logic)
10. Update `server/src/middleware/auth.ts`:
    - Extend `JwtPayload` interface to include `role: UserRole`
    - Modify `generateToken()` to accept and include role parameter
    - Modify `verifyToken()` to return role in decoded payload
    - Update `authMiddleware` to validate JWT role matches database role
    - Extend Express Request interface to include `userRole?: UserRole`
11. Create new `server/src/middleware/authorization.ts`:
    - Implement `requireRole(...allowedRoles)` factory function
    - Implement `requireQuizManager` convenience middleware
    - Implement `requireQuizTaker` convenience middleware
    - Return 403 Forbidden when authenticated but lacks permission
12. Update `server/src/controllers/userController.ts`:
    - Modify `createUser()` to include role in JWT generation and response
    - Modify `loginUser()` to include role in JWT generation and response
    - Update `getUser()`, `getUserStats()` to return role field
    - Ensure database selects include `role` field
13. Test JWT token generation includes role claim using Postman/curl

### Phase 3: Backend Route Protection (Endpoints)
14. Update `server/src/routes/quizRoutes.ts`:
    - Add `authMiddleware` + `requireQuizManager` to POST/PUT/DELETE routes
    - Keep GET routes accessible to authenticated users
15. Create CRUD controller functions in `server/src/controllers/quizController.ts`:
    - `createQuiz()` - Manager only
    - `updateQuiz()` - Manager only
    - `deleteQuiz()` - Manager only
16. Update `server/src/routes/categoryRoutes.ts`:
    - Protect write operations with `requireQuizManager`
17. Create category CRUD controllers in `server/src/controllers/categoryController.ts`
18. Create new `server/src/routes/questionRoutes.ts`:
    - All CRUD routes protected with `requireQuizManager`
19. Create new `server/src/controllers/questionController.ts`:
    - Implement question CRUD operations
20. Update `server/src/routes/attemptRoutes.ts`:
    - Add `requireQuizTaker` to all attempt endpoints
21. Register question routes in `server/src/routes/index.ts`
22. Test authorization with Postman:
    - Manager can create/edit/delete quizzes (200/201)
    - Taker cannot create quizzes (403)
    - Taker can start attempts (200)
    - Manager cannot start attempts (403)

### Phase 4: Frontend Context and Route Protection (Infrastructure)
23. Update `client/src/context/UserContext.tsx`:
    - Add `isQuizManager: boolean` computed property
    - Add `isQuizTaker: boolean` computed property
    - Add `hasRole(role: UserRole): boolean` function
    - Update `createUser()` and `loginUser()` to handle role in API response
24. Update `client/src/App.tsx`:
    - Create `RoleProtectedRoute` component accepting `allowedRoles` prop
    - Wrap quiz-taking routes with `RoleProtectedRoute` allowing `QUIZ_TAKER`
    - Add `/manage` route with `RoleProtectedRoute` allowing `QUIZ_MANAGER`
    - Add `/unauthorized` route
25. Create `client/src/pages/Unauthorized.tsx`:
    - Display access denied message
    - Show user's current role
    - Link to home page
26. Update `client/src/services/api.ts`:
    - Verify 403 error handling exists
    - Ensure user-related API calls expect role field
27. Update `client/src/components/Layout.tsx`:
    - Add role-based navigation links (Dashboard for takers, Manage for managers)
    - Display user role badge in navigation
    - Show/hide navigation items based on role
28. Test role-based routing:
    - Login as taker → can access quiz pages, redirected from /manage
    - Login as manager → can access management pages, redirected from quiz pages

### Phase 5: Frontend UI Features (Manager Dashboard)
29. Create `client/src/pages/QuizManagementPage.tsx`:
    - List all categories with quizzes
    - "Create Quiz" button and form
    - "Edit Quiz" functionality
    - "Delete Quiz" with confirmation dialog
30. Create quiz CRUD components:
    - Quiz form component (create/edit)
    - Quiz list component with edit/delete actions
    - Category selector component
31. Create question management interface:
    - Question editor with options builder
    - Add/edit/delete questions within quiz
    - Question preview component
32. Add CRUD methods to `client/src/services/api.ts`:
    - `createQuiz(data: CreateQuizDto)`
    - `updateQuiz(id: string, data: UpdateQuizDto)`
    - `deleteQuiz(id: string)`
    - `createQuestion(quizId: string, data: CreateQuestionDto)`
    - `updateQuestion(id: string, data: UpdateQuestionDto)`
    - `deleteQuestion(id: string)`
    - Category CRUD methods
33. Update existing pages with role-based UI:
    - CategoryPage: Show "Create Quiz" button for managers
    - Add conditional rendering based on `isQuizManager`

### Phase 6: Testing and Refinement (Quality Assurance)
34. End-to-end testing:
    - Test complete taker flow (register → browse → take quiz → view results)
    - Test complete manager flow (register → create category → create quiz → add questions)
    - Test role switching scenario (simulate role change, verify token invalidation)
35. Security testing:
    - Attempt privilege escalation (modify JWT manually)
    - Verify all write endpoints reject takers (403)
    - Verify all attempt endpoints reject managers (403)
    - Test with expired tokens (401)
    - Test with manipulated role in token (401)
36. Error handling verification:
    - 401/403 errors display user-friendly messages
    - Network failure handling
    - Invalid form input validation
37. Cross-browser testing:
    - Chrome, Firefox, Safari
    - Mobile responsive design
    - Navigation flow consistency
38. Create test report documenting:
    - Security test results
    - Authorization test matrix (role × endpoint)
    - Bug fixes implemented
    - Performance measurements

### Phase 7: Documentation and Deployment (Finalization)
39. Update `CLAUDE.md`:
    - Document role system architecture
    - Document new API endpoints (quiz/category/question CRUD)
    - Document frontend routes and protection
    - Update security section with authorization details
    - Add role assignment instructions
40. Update `README.md`:
    - Add role management overview to project description
    - Document default user creation process
    - Update setup instructions with role information
41. Create migration guide document:
    - Steps for upgrading existing deployments
    - Instructions for creating first manager user
    - Rollback procedures if needed
    - Database backup recommendations
42. Verify `.env.example` is up-to-date (no new env vars needed)

## Agents

### Phase 1: Database and Shared Types
- **database-engineer**: Schema design, migration creation, seed file updates
- **system-architect**: Review type consistency across workspaces

### Phase 2: Backend Authentication & Authorization
- **backend-engineer**: JWT enhancement, authorization middleware, controller updates
- **qa-security-agent**: Review JWT implementation and authorization logic

### Phase 3: Backend Route Protection
- **backend-engineer**: Route protection, CRUD controller implementation
- **qa-security-agent**: Security testing of protected endpoints

### Phase 4: Frontend Context and Route Protection
- **frontend-engineer**: UserContext updates, route protection components
- **system-architect**: Review routing architecture

### Phase 5: Frontend UI Features
- **frontend-engineer**: Management dashboard, CRUD UI components
- **frontend-engineer**: API client updates, form validation

### Phase 6: Testing and Refinement
- **qa-security-agent**: Comprehensive security audit, authorization testing
- **backend-engineer**: Backend bug fixes from testing
- **frontend-engineer**: Frontend bug fixes from testing

### Phase 7: Documentation
- **documentation-agent**: Update all documentation files, create migration guide

## Notes

### Architecture Decisions
- **Enum-based roles**: Simple, performant, type-safe for two-role requirement
- **Role in JWT**: Avoids database lookup on every request, validated against DB
- **Default QUIZ_TAKER**: Principle of least privilege, safe default for new users
- **Backend enforcement**: Frontend role checks are UX convenience only

### Security Considerations
- Role NOT included in CreateUserDto (prevents privilege escalation)
- JWT role validated against database role on every request
- Role changes invalidate existing tokens via tokenVersion mechanism
- All write operations require explicit authorization middleware
- 403 Forbidden (not 401 Unauthorized) when authenticated but lacking permission

### Testing Priorities
1. Authorization matrix (role × endpoint) must pass 100%
2. Privilege escalation attempts must fail
3. Token manipulation must be detected
4. UI correctly reflects user's role

### Backward Compatibility
- Migration adds role with default QUIZ_TAKER for existing users
- Old tokens without role claim rejected (forces re-login)
- GET endpoints remain accessible (no breaking changes)
- Response format includes new role field (clients ignore unknown fields)

### Future Enhancements (Post-MVP)
- Admin API endpoint for role assignment
- Super admin role for managing other managers
- Audit logging for role changes
- Multi-role support (user has multiple roles)
- Fine-grained permissions beyond roles

### Success Criteria
✅ Quiz managers can create/edit/delete quiz content
✅ Quiz takers can only attempt quizzes and view results
✅ Unauthorized access returns 403 with clear error messages
✅ Role displayed correctly in UI
✅ Authorization adds <10ms latency per request
✅ Zero privilege escalation vulnerabilities found in security testing
✅ Documentation enables new developers to understand role system
