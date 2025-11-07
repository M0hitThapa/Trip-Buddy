import { cn } from "@/lib/utils";
import React from "react";


export const Container = ({className, children}: {
    children:React.ReactNode;
    className?:string
}) => {
    return <div className={cn(" w-full px-4 relative z-10"
, className)}>
{children}
    </div>
}