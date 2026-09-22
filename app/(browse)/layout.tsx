import { Suspense } from "react";
import { Container } from "./_components/container";
import { Navbar } from "./_components/navbar";
import { Sidebar, SidebarSkeleton } from "./_components/sidebar";
import { AutoRefresh } from "./_components/auto-refresh";
import { PublicChrome } from "@/components/sanity/public-chrome";

const BrowseLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return ( 
        <PublicChrome>
        <Navbar />
        <div className="flex h-full pt-20">
            <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar />
            </Suspense>
            <Container>
                {children}
            </Container>
        </div>
        <AutoRefresh />
        </PublicChrome>
    );
}

export default BrowseLayout;