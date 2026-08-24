import { useParams } from "react-router";

export default function CustomerChatPage() {
    const { organizationSlug } = useParams();

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div>
                <h1 className="text-3xl font-bold">
                    AI Support Chat
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Organisation: {organizationSlug}
                </p>
            </div>
        </div>
    );
}