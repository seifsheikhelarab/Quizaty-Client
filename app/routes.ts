import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Landing page (public)
  index("routes/landing.tsx"),

  // Auth routes (no layout)
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  // Invite link flow
  route("invite/:id", "routes/invite.tsx"),

  // Teacher routes (with authenticated layout)
  layout("routes/teacher-layout.tsx", [
    route("teacher/dashboard", "routes/teacher-dashboard.tsx"),
    route("teacher/classes", "routes/teacher-classes.tsx"),
    route("teacher/classes/create", "routes/teacher-create-class.tsx"),
    route("teacher/classes/:id", "routes/teacher-class-detail.tsx"),
    route("teacher/classes/:id/edit", "routes/teacher-edit-class.tsx"),
    route("teacher/quizzes", "routes/teacher-quizzes.tsx"),
    route("teacher/quizzes/create", "routes/teacher-create-quiz.tsx"),
    route("teacher/quizzes/:id", "routes/teacher-quiz-detail.tsx"),
    route("teacher/quizzes/:id/edit", "routes/teacher-edit-quiz.tsx"),
    route("teacher/students/:id", "routes/teacher-student-detail.tsx"),
    route("teacher/quizzes/:quizId/submissions/:submissionId", "routes/teacher-submission-detail.tsx"),
    route("teacher/assistants", "routes/teacher-assistants.tsx"),
  ]),

  // Student routes (with authenticated layout)
  layout("routes/student-layout.tsx", [
    route("student/dashboard", "routes/student-dashboard.tsx"),
    route("student/classes", "routes/student-classes.tsx"),
    route("student/quizzes", "routes/student-quizzes.tsx"),
    route("student/quizzes/:id", "routes/student-quiz-detail.tsx"),
    route("student/quizzes/:id/test", "routes/student-quiz-test.tsx"),
    route("student/quizzes/:id/result", "routes/student-result.tsx"),
  ]),
] satisfies RouteConfig;

