import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { FullPageSpinner } from "./components/Spinner";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation();
    const isLoading = navigation.state !== "idle";

    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body suppressHydrationWarning>
                {isLoading && (
                    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-100 overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-loading-bar shadow-[0_0_10px_rgb(79,70,229)]"></div>
                    </div>
                )}
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function HydrateFallback() {
    return <FullPageSpinner />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "خطأ!";
    let details = "حدث خطأ غير متوقع.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "خطأ";
        details =
            error.status === 404
                ? "الصفحة المطلوبة غير موجودة."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
                {message}
            </h1>
            <p className="text-slate-600">{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto mt-6 bg-slate-100 rounded-lg text-left text-sm">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
