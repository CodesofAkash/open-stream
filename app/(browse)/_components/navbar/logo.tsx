"use client";

import Image from "next/image"
import Link from "next/link"
import { Poppins } from "next/font/google"

import { cn } from "@/lib/utils"

const font = Poppins({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"]
});

export const Logo = () => {
    return (
        <div className="flex items-center gap-x-4">
            <Link href="/">
                <div className="flex items-center gap-x-4 hover:opacity-75 transition">
                    <div className="bg-white rounded-full p-1 mr-12 lg:mr-0 shrink-0 lg:shrink">
                        <Image src="/OpenStream.png" alt="OpenStream" height={32} width={32} />
                    </div>
                    <div className={cn(
                        "hidden lg:block",
                        font.className)}>
                        <p className="text-lg font-semibold">OpenStream</p>
                        <p className="text-xs text-muted-foreground">You&apos;re already one of us</p>
                    </div>
                </div>
            </Link>
        </div>
    )
}