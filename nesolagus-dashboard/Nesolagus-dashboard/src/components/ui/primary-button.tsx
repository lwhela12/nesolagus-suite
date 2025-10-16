"use client";

import React from "react";

type Props =
  | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined });

/**
 * PrimaryButton
 * - Uses CSS variables --brand-from / --brand-to with sensible fallbacks
 * - Works as <a> when `href` is provided, else <button>
 */
export default function PrimaryButton(props: Props) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const style = {
    background: `linear-gradient(90deg, var(--brand-from, #64B37A) 0%, var(--brand-to, #2F6D49) 100%)`,
  } as React.CSSProperties;

  if ("href" in props && props.href) {
    const { href, className, ...rest } = props;
    return (
      <a
        href={href}
        className={`${base} ${className ?? ""}`}
        style={style}
        {...rest}
      />
    );
  }

  const { className, ...rest } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      className={`${base} ${className ?? ""}`}
      style={style}
      {...rest}
    />
  );
}
