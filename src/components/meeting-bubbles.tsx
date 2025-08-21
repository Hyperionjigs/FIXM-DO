
"use client";

import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

const Bubble = ({
  children,
  className,
  bubbleClassName,
  tailClassName,
}: {
  children: React.ReactNode;
  className?: string;
  bubbleClassName?: string;
  tailClassName?: string;
}) => {
  return (
    <div className={cn('relative group', className)}>
      <div className={cn('relative rounded-full border-2 border-primary/50 bg-background px-8 py-5 text-center font-headline text-3xl text-primary shadow-lg transition-transform duration-300 group-hover:scale-110 font-bold', bubbleClassName)}>
        {children}
      </div>
      <div className={cn('absolute -bottom-4 h-8 w-8 rounded-full border-2 border-primary/50 bg-background transition-transform duration-300 group-hover:scale-110', tailClassName)} />
      <div className={cn('absolute -bottom-6 h-5 w-5 rounded-full border-2 border-primary/50 bg-background transition-transform duration-300 group-hover:scale-110', tailClassName, tailClassName && tailClassName.includes('left') ? 'left-8' : 'right-8')} />

    </div>
  );
};

export default function MeetingBubbles() {
  return (
    <div className="relative my-8 flex h-48 items-center justify-center">
      <Link href="/post?type=task" className="z-10 -mr-8 -mt-4">
        <Bubble
          bubbleClassName="flex h-28 min-w-40 items-center justify-center bg-background px-6"
          tailClassName="left-4"
        >
          I need...
        </Bubble>
      </Link>
      <Link href="/post?type=service" className="z-0 ml-8 mt-8">
        <Bubble
          bubbleClassName="flex h-32 min-w-48 items-center justify-center bg-background px-6"
          tailClassName="right-4"
        >
          I can help!
        </Bubble>
      </Link>
    </div>
  );
}
