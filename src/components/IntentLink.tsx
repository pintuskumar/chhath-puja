"use client";

/**
 * next/link that prefetches on *intent* (pointer over, keyboard focus, touch start) instead of
 * as soon as it scrolls into view. Every page shows links to all four days (header progress,
 * nav, footer, home cards); viewport prefetching downloaded and evaluated every day's payload
 * and JS right after load — the long main-thread tasks on phones. Navigation stays instant:
 * a tap's touchstart arrives ~100 ms before the click.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useCallback, useRef } from "react";

type Props = Omit<ComponentProps<typeof Link>, "prefetch" | "href"> & { href: string };

export function IntentLink({ href, onPointerEnter, onFocus, onTouchStart, ...rest }: Props) {
  const router = useRouter();
  const done = useRef(false);
  const warm = useCallback(() => {
    if (done.current) return;
    done.current = true;
    router.prefetch(href);
  }, [router, href]);
  return (
    <Link
      {...rest}
      href={href}
      prefetch={false}
      onPointerEnter={(e) => {
        warm();
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
    />
  );
}
