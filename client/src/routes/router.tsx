import { createBrowserRouter } from "react-router";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import CustomerChatPage from "@/pages/customer/CustomerChatPage";
import OrganizationLayout from "@/layouts/OrganizationLayout";
import OverviewPage from "@/pages/dashboard/OrganizationDashboardPage";
import KnowledgeBasePage from "@/pages/dashboard/KnowledgeBasePage";
import ConversationsPage from "@/pages/dashboard/ConversationsPage";
import ConversationDetailPage from "@/pages/dashboard/ConversationDetailPage";
import AIAssistantPage from "@/pages/dashboard/AIAssistantPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import CustomersPage from "@/pages/dashboard/CustomersPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import AssistantSettingsPage from "@/pages/dashboard/settings/AssistantSettingsPage";
import TeamMembersPage from "@/pages/dashboard/settings/TeamMembersPage";
import IntegrationsPage from "@/pages/dashboard/settings/IntegrationsPage";
import SecurityPage from "@/pages/dashboard/settings/SecurityPage";
import Billing from "@/pages/dashboard/Billing";
import LandingPage from "@/pages/public/HomePage";
import SignupPage from "@/pages/auth/SignupPage";
import LoginPage from "@/pages/auth/LoginPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import InvitationResponsePage from "@/pages/auth/InvitationResponsePage";
import BackendHealthPage from "@/pages/dev/BackendHealthPage";
import RequireAuth from "@/components/auth/RequireAuth";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/dev/health",
        element: <BackendHealthPage />,
    },
    {
        path: "/signup",
        element: <SignupPage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/auth/callback",
        element: <AuthCallbackPage />,
    },
    {
        path: "/invitations/respond",
        element: <InvitationResponsePage />,
    },
    {
        path: "/reset-password",
        element: <ResetPasswordPage />
    },
    {
        path: "forgot-password",
        element: <ForgotPasswordPage />
    },
    {
        element: <RequireAuth />,
        children: [
            {
                path: "/admin",
                element: <AdminDashboardPage />,
            },
            {
                path: "/dashboard",
                element: <OrganizationLayout />,
                children: [
            {
                index: true,
                element: <OverviewPage />,
            },
            {
                path: "conversations",
                element: <ConversationsPage />,
            },
            {
                path: "conversations/:conversationId",
                element: <ConversationDetailPage />,
            },
            {
                path: "knowledge-base",
                element: <KnowledgeBasePage />,
            },
            {
                path: "assistant",
                element: <AIAssistantPage />,
            },
            {
                path: "analytics",
                element: <AnalyticsPage />,
            },
            {
                path: "customers",
                element: <CustomersPage />,
            },
            {
                path: "settings",
                element: <SettingsPage />,
            },
            {
                path: "settings/assistant",
                element: <AssistantSettingsPage />,
            },
            {
                path: "settings/team",
                element: <TeamMembersPage />,
            },
            {
                path: "settings/integrations",
                element: <IntegrationsPage />,
            },
            {
                path: "settings/security",
                element: <SecurityPage />,
            },
            {
                path: "/dashboard/billing",
                element: <Billing />
            }
                ],
            },
        ],
    },
    {
        path: "/chat/:organizationSlug",
        element: <CustomerChatPage />,
    },
]);
