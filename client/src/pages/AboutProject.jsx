import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiDatabase,
  FiGitBranch,
  FiLock,
  FiMessageSquare,
  FiServer,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import Button from "../components/common/Button";
import { useAuthContext } from "../context/AuthContext";

const stack = [
  "React 19",
  "Vite",
  "Tailwind CSS",
  "Zustand",
  "React Query",
  "Express",
  "MongoDB",
  "Mongoose",
  "JWT",
  "Socket.IO",
  "Jest",
];

const achievements = [
  "Role-based access control across admin, manager, and employee workflows",
  "Analytics dashboard backed by aggregation pipelines and reusable services",
  "Audit logging for sensitive user and employee operations",
  "Realtime messaging foundation with Socket.IO connection management",
  "Secure auth flow with access tokens, refresh-token cookies, rate limiting, and validation",
  "Demo workspace that provisions realistic platform data on demand",
];

const architecture = [
  {
    icon: <FiServer />,
    title: "API Layer",
    description: "Express routes delegate to controllers and services, keeping validation, auth, and domain behavior separated.",
  },
  {
    icon: <FiDatabase />,
    title: "Data Layer",
    description: "MongoDB models capture users, employees, messages, reports, and activity logs with indexes for common queries.",
  },
  {
    icon: <FiShield />,
    title: "Security Layer",
    description: "Helmet, CORS, rate limiting, JWT auth, refresh cookies, sanitization, and RBAC protect the main workflows.",
  },
  {
    icon: <FiGitBranch />,
    title: "Client Layer",
    description: "React pages use reusable components, stores, hooks, service clients, and route guards for maintainable UX.",
  },
];

const AboutProject = () => {
  const { demoLogin } = useAuthContext();

  return (
    <main className="min-h-screen bg-secondary-50 text-secondary-900">
      <Helmet>
        <title>About GreatTeam EMS | Employee Management Platform</title>
        <meta
          name="description"
          content="Technical overview of GreatTeam EMS, a full-stack employee management platform built with React, Express, MongoDB, JWT auth, RBAC, analytics, audit logs, and real-time messaging."
        />
      </Helmet>

      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600">
            <FiArrowLeft />
            Back to landing
          </Link>
          <Button type="button" onClick={demoLogin} icon={<FiUsers />}>
            Try Demo
          </Button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-3">
            About the platform
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            A production-minded employee management platform for modern teams.
          </h1>
          <p className="text-lg text-secondary-600">
            GreatTeam EMS helps organizations manage employee records, workforce analytics,
            performance signals, reports, messaging, and audit activity from a protected
            role-based workspace. The platform is designed around clear operations,
            secure access, realistic workforce data, useful reporting, and a polished
            day-to-day experience for HR, managers, and employees.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <FiBarChart2 className="text-3xl text-primary-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Business Value</h2>
          <p className="text-secondary-600">
            Consolidates HR operations into one workspace so teams can make faster
            decisions about headcount, performance, payroll, and employee lifecycle events.
          </p>
        </div>
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <FiLock className="text-3xl text-primary-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Technical Challenges</h2>
          <p className="text-secondary-600">
            Solves authenticated CRUD, refresh-token sessions, role authorization,
            aggregation-backed dashboards, audit trails, file upload, and realtime flows.
          </p>
        </div>
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <FiMessageSquare className="text-3xl text-primary-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Demo Experience</h2>
          <p className="text-secondary-600">
            One-click demo login creates a realistic company snapshot and opens
            the product with dashboards, employee records, reports, and activity data ready.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Architecture Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {architecture.map((item) => (
            <div key={item.title} className="bg-white border border-secondary-200 rounded-lg p-5">
              <div className="text-2xl text-primary-600 mb-3">{item.icon}</div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-secondary-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <span key={item} className="rounded-full bg-white border border-secondary-200 px-4 py-2 text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Key Engineering Achievements</h2>
          <div className="space-y-3">
            {achievements.map((item) => (
              <div key={item} className="flex gap-3">
                <FiCheckCircle className="mt-1 shrink-0 text-success" />
                <p className="text-secondary-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutProject;
