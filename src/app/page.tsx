import { Container } from "@/components/container";

import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full  relative overflow-hidden ">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
        repeating-linear-gradient(
          to right,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        ),
        repeating-linear-gradient(
          to bottom,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        )
      `,
          WebkitMaskImage: `
        repeating-linear-gradient(
          to right,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        ),
        repeating-linear-gradient(
          to bottom,
          black 0px,
          black 3px,
          transparent 3px,
          transparent 8px
        )
      `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      <div className="flex flex-col items-center bg-neutral-100 ">
        <div className="max-w-7xl mx-auto absolute inset-0 h-full w-full">
          {/* <div className="absolute inset-y-0 left-0 h-full w-px bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-y-0 right-0 h-full w-px bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent pointer-events-none z-0" /> */}
        </div>
        <Container>
          <Navbar />
          <Hero />
        </Container>
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="max-w-5xl mx-auto p-4 bg-gray-200/50 rounded-xl  shadow-input ">
            <Image
              src="/hero1.png"
              alt="hero-ui"
              width={2000}
              height={2000}
              className="rounded-xl w-full object-cover object-left-top border border-neutral-200 shadow-md  "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
