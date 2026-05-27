import React from 'react';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const components: Components = {
    h1: ({ className, ...props }) => (
      <h1 className={cn("mt-6 mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100", className)} {...props} />
    ),
    h2: ({ className, ...props }) => (
      <h2 className={cn("mt-8 mb-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2", className)} {...props} />
    ),
    h3: ({ className, ...props }) => (
      <h3 className={cn("mt-6 mb-3 text-xl font-medium tracking-tight text-gray-900 dark:text-gray-100", className)} {...props} />
    ),
    h4: ({ className, ...props }) => (
      <h4 className={cn("mt-4 mb-2 text-lg font-medium text-gray-900 dark:text-gray-100", className)} {...props} />
    ),
    p: ({ className, ...props }) => (
      <p className={cn("mb-4 text-base leading-relaxed text-gray-700 dark:text-gray-300", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a className={cn("text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("mb-4 ml-6 list-disc [&>li]:mt-1 text-gray-700 dark:text-gray-300", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("mb-4 ml-6 list-decimal [&>li]:mt-1 text-gray-700 dark:text-gray-300", className)} {...props} />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("leading-relaxed", className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("mt-4 mb-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 py-2 pr-4 rounded-r-md", className)} {...props} />
    ),
    code: (props) => {
      const {children, className, node, ...rest} = props;
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      return (
        <code
          className={cn(
            isInline 
              ? "bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 rounded px-1.5 py-0.5 text-sm font-mono border border-gray-200 dark:border-gray-700" 
              : "block bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200 dark:border-gray-700 my-4",
            className
          )}
          {...rest}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }) => <>{children}</>,
    table: ({ className, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table className={cn("w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm", className)} {...props} />
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead className={cn("bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 font-semibold text-gray-800 dark:text-gray-200 text-left", className)} {...props} />
    ),
    tbody: ({ className, ...props }) => (
      <tbody className={cn("bg-white dark:bg-gray-900/50 text-gray-700 dark:text-gray-300", className)} {...props} />
    ),
    tr: ({ className, ...props }) => (
      <tr className={cn("border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors", className)} {...props} />
    ),
    th: ({ className, ...props }) => (
      <th className={cn("px-4 py-3 border-r border-gray-200 dark:border-gray-700 align-top", className)} {...props} />
    ),
    td: ({ className, ...props }) => (
      <td className={cn("px-4 py-3 border-r border-gray-200 dark:border-gray-700 align-top", className)} {...props} />
    ),
    hr: ({ className, ...props }) => (
      <hr className={cn("my-8 border-t border-gray-300 dark:border-gray-600", className)} {...props} />
    ),
    img: ({ className, ...props }) => (
      <img className={cn("max-w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 my-4 object-contain", className)} loading="lazy" referrerPolicy="no-referrer" {...props} alt={props.alt || "Generated Output Image"} />
    )
  };

  return (
    <div className={cn("w-full", className)}>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {content}
      </Markdown>
    </div>
  );
};
