import { HeroVideoDialog } from "./ui/hero-video";

export function HeroVideoDialogDemo() {
  return (
    <div className="relative bg-gray-200/50 p-4 rounded-2xl shadow-input">
      <HeroVideoDialog
        className="block dark:hidden"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/Dum9LygufnY"
        thumbnailSrc="/hero1.png"
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/Dum9LygufnY"
        thumbnailSrc="/hero1.png"
        thumbnailAlt="Hero Video"
      />
    </div>
  );
}



