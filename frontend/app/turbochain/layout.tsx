import type { ReactNode } from "react";
import { TurboWeb3Provider } from "@/components/turbochain/TurboWeb3Provider";
import { turboFontBody, turboFontHeading, turboFontMono } from "./fonts";
import { turboBg } from "@/lib/turbochain/theme";

type TurboLayoutProps = {
  children: ReactNode;
};

/**
 * Layout scope for `/turbochain/*`: loads Turbo fonts as CSS variables, applies base background, mounts Web3 providers.
 */
export default function TurbochainLayout({ children }: TurboLayoutProps) {
  const fontVars = `${turboFontHeading.variable} ${turboFontBody.variable} ${turboFontMono.variable}`;

  return (
    <div
      className={fontVars}
      style={{
        backgroundColor: turboBg,
        fontFamily: turboFontBody.style.fontFamily,
        minHeight: "100dvh",
        color: "#f4f4f5",
      }}
    >
      <TurboWeb3Provider>{children}</TurboWeb3Provider>
    </div>
  );
}
