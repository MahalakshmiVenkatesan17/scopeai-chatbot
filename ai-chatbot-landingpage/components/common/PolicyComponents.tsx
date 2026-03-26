import React, { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

type SectionHeaderProps = {
  title: string;
  children: ReactNode;
};

type BulletListProps = {
  items: string[];
};

type ParagraphProps = {
  children: ReactNode;
};

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
  <div className="page-header-gradient dark:context-hero-gradient transition-colors">
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white transition-colors">
        {title}
      </h1>
      {subtitle && <p className="mt-4 text-gray-600 dark:text-gray-400 transition-colors">{subtitle}</p>}
    </div>
  </div>
);

// Section Wrapper
export const SectionHeader = ({ title, children }: SectionHeaderProps) => (
  <section className="mt-10">
    <h2 className="text-[var(--foundation-blue-blue-800)] dark:text-blue-400 font-semibold text-2xl mb-3 transition-colors">{title}</h2>
    {children}
  </section>
);

// Bullet List
export const BulletList = ({ items }: BulletListProps) => (
  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-400 transition-colors">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

// Simple Text
export const Paragraph = ({ children }: ParagraphProps) => (
  <p className="text-gray-700 dark:text-gray-400 leading-relaxed transition-colors">{children}</p>
);
