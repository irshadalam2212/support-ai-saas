import { createBrowserRouter } from "react-router";

import RequireAuth from "@/components/auth/RequireAuth";
import LegacyDashboardRedirect from "@/components/layout/LegacyDashboardRedirect";
import RouteErrorPage from "@/components/shared/RouteErrorPage";
import OrganizationLayout from "@/layouts/OrganizationLayout";
import RootLayout from "@/layouts/RootLayout";
import SettingsLayout from "@/layouts/SettingsLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";
import InvitationResponsePage from "@/pages/auth/InvitationResponsePage";
import LoginPage from "@/pages/auth/LoginPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import SignupPage from "@/pages/auth/SignupPage";
import CustomerChatPage from "@/pages/customer/CustomerChatPage";
import AIAssistantPage from "@/pages/dashboard/AIAssistantPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import Billing from "@/pages/dashboard/Billing";
import ConversationDetailPage from "@/pages/dashboard/ConversationDetailPage";
import ConversationsPage from "@/pages/dashboard/ConversationsPage";
import CustomersPage from "@/pages/dashboard/CustomersPage";
import KnowledgeBasePage from "@/pages/dashboard/KnowledgeBasePage";
import OverviewPage from "@/pages/dashboard/OrganizationDashboardPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import AssistantSettingsPage from "@/pages/dashboard/settings/AssistantSettingsPage";
import IntegrationsPage from "@/pages/dashboard/settings/IntegrationsPage";
import SecurityPage from "@/pages/dashboard/settings/SecurityPage";
import TeamMembersPage from "@/pages/dashboard/settings/TeamMembersPage";
import BackendHealthPage from "@/pages/dev/BackendHealthPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LandingPage from "@/pages/public/HomePage";
import type { RouteHandle } from "@/routes/usePageTitle";

const titled = (title: string): RouteHandle => ({ title });

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: "/", element: <LandingPage /> },
            { path: "/dev/health", element: <BackendHealthPage />, handle: titled("API health") },
            { path: "/signup", element: <SignupPage />, handle: titled("Create account") },
            { path: "/login", element: <LoginPage />, handle: titled("Sign in") },
            { path: "/auth/callback", element: <AuthCallbackPage />, handle: titled("Confirm email") },
            { path: "/invitations/respond", element: <InvitationResponsePage />, handle: titled("Workspace invitation") },
            { path: "/reset-password", element: <ResetPasswordPage />, handle: titled("Reset password") },
            { path: "/forgot-password", element: <ForgotPasswordPage />, handle: titled("Forgot password") },
            { path: "/chat/:organizationSlug", element: <CustomerChatPage />, handle: titled("Customer support") },
            {
                element: <RequireAuth />,
                children: [
                    { path: "/admin", element: <AdminDashboardPage />, handle: titled("Platform administration") },
                    {
                        // A layout without a path: each page sits at its own top-level address.
                        element: <OrganizationLayout />,
                        children: [
                            { path: "/overview", element: <OverviewPage />, handle: titled("Overview") },
                            { path: "/conversations", element: <ConversationsPage />, handle: titled("Conversations") },
                            { path: "/conversations/:conversationId", element: <ConversationDetailPage />, handle: titled("Conversation") },
                            { path: "/knowledge-base", element: <KnowledgeBasePage />, handle: titled("Knowledge base") },
                            { path: "/assistant", element: <AIAssistantPage />, handle: titled("AI assistant") },
                            { path: "/analytics", element: <AnalyticsPage />, handle: titled("Analytics") },
                            { path: "/customers", element: <CustomersPage />, handle: titled("Customers") },
                            { path: "/billing", element: <Billing />, handle: titled("Billing") },
                            {
                                path: "/settings",
                                element: <SettingsLayout />,
                                children: [
                                    { index: true, element: <SettingsPage />, handle: titled("Settings") },
                                    { path: "assistant", element: <AssistantSettingsPage />, handle: titled("AI assistant settings") },
                                    { path: "team", element: <TeamMembersPage />, handle: titled("Team members") },
                                    { path: "integrations", element: <IntegrationsPage />, handle: titled("Integrations") },
                                    { path: "security", element: <SecurityPage />, handle: titled("Security") },
                                ],
                            },
                        ],
                    },
                ],
            },
            { path: "/dashboard/*", element: <LegacyDashboardRedirect /> },
            { path: "*", element: <NotFoundPage />, handle: titled("Page not found") },
        ],
    },
]);
