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
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-medium"
                >
                    الانتقال للمحتوى الرئيسي
                </a>
                {isLoading && (
                    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary-100/80 overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-primary-600 animate-loading-bar"></div>
                    </div>
                )}
                <main id="main-content">
                    {children}
                </main>
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
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl mx-auto animate-pulse" />
                    <div className="h-6 bg-slate-200 rounded w-32 mx-auto" />
                </div>
                <div className="space-y-3">
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
            </div>
        </div>
    );
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
