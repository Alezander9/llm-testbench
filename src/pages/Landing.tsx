import { SignInButton } from "@clerk/clerk-react";
import { Button } from "../components/ui/button";
import BoidBackground from "../components/features/landing/BoidBackground";
import {
  ArrowRight,
  Zap,
  Box,
  TestTube,
  Check,
  CircleHelp,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import TheoLogo from "../assets/TheoLogo1024.png";
import TheoIcon from "../assets/TheoIcon256.png";
import { useIsMobile } from "../hooks/use-mobile";
import {
  BoidParams,
  SECTION_PARAMS,
  SECTION_PARAMS_MOBILE,
} from "./boid-parameters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import TheoDemoVideo from "../assets/TheoDemoVideoCompressed.mp4";

function Landing() {
  const isMobile = useIsMobile();
  const [currentParams, setCurrentParams] = useState<BoidParams>(
    SECTION_PARAMS.hero,
  );
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [showTopBar, setShowTopBar] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t;
  };

  const lerpParams = (
    params1: BoidParams,
    params2: BoidParams,
    t: number,
  ): BoidParams => {
    return {
      separationDistance: lerp(
        params1.separationDistance,
        params2.separationDistance,
        t,
      ),
      alignmentDistance: lerp(
        params1.alignmentDistance,
        params2.alignmentDistance,
        t,
      ),
      cohesionDistance: lerp(
        params1.cohesionDistance,
        params2.cohesionDistance,
        t,
      ),
      centerAttractionStrength: lerp(
        params1.centerAttractionStrength,
        params2.centerAttractionStrength,
        t,
      ),
      predatorRepulsionStrength: lerp(
        params1.predatorRepulsionStrength,
        params2.predatorRepulsionStrength,
        t,
      ),
      predatorRepulsionRadius: lerp(
        params1.predatorRepulsionRadius,
        params2.predatorRepulsionRadius,
        t,
      ),
      speedLimit: lerp(params1.speedLimit, params2.speedLimit, t),
      cameraZoom: lerp(params1.cameraZoom, params2.cameraZoom, t),
    };
  };

  const scrollToSection = useCallback((sectionIndex: number) => {
    if (!sectionsRef.current) return;
    const sections = sectionsRef.current.children;
    const section = sections[sectionIndex] as HTMLElement;
    window.scrollTo({
      top: section.offsetTop,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionsRef.current) return;

      const sections = sectionsRef.current.children;
      const playgroundSection = sections[sections.length - 1] as HTMLElement;
      const isInPlayground =
        window.scrollY + window.innerHeight >= playgroundSection.offsetTop;

      setShowTopBar(
        (e.clientY < 100 || window.scrollY < 100) && !isInPlayground,
      );
    };

    const handleScroll = () => {
      if (!sectionsRef.current) return;

      const sections = sectionsRef.current.children;
      const playgroundSection = sections[sections.length - 1] as HTMLElement;
      const isInPlayground =
        window.scrollY + window.innerHeight >= playgroundSection.offsetTop;

      setShowTopBar(window.scrollY < 100 && !isInPlayground);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionsRef.current) return;

      const sections = sectionsRef.current.children;
      const scrollPosition = window.scrollY;

      let currentSectionIndex = 0;
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        if (scrollPosition >= section.offsetTop) {
          currentSectionIndex = i;
        }
      }

      const sectionNames = isMobile
        ? Object.keys(SECTION_PARAMS_MOBILE)
        : Object.keys(SECTION_PARAMS);
      const currentSection = sectionNames[currentSectionIndex];
      const nextSection =
        sectionNames[
          Math.min(currentSectionIndex + 1, sectionNames.length - 1)
        ];

      const currentSectionElement = sections[
        currentSectionIndex
      ] as HTMLElement;
      const sectionProgress =
        (scrollPosition - currentSectionElement.offsetTop) /
        currentSectionElement.offsetHeight;
      const t = Math.max(0, Math.min(1, sectionProgress));

      const interpolatedParams = lerpParams(
        isMobile
          ? SECTION_PARAMS_MOBILE[currentSection]
          : SECTION_PARAMS[currentSection],
        isMobile
          ? SECTION_PARAMS_MOBILE[nextSection]
          : SECTION_PARAMS[nextSection],
        t,
      );

      setCurrentParams(interpolatedParams);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionsRef.current) return;

      const sections = sectionsRef.current.children;
      const playgroundSection = sections[sections.length - 1] as HTMLElement;
      const isInPlayground =
        window.scrollY + window.innerHeight >= playgroundSection.offsetTop;

      setShowTopBar((window.scrollY < 100 || isInPlayground) && !isMobile);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  return (
    <div className="relative min-h-screen">
      <div
        className={`fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
          showTopBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="h-16 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto h-full flex items-center justify-between px-4">
            <div className="w-20" />
            {!isMobile && (
              <div className="flex items-center gap-6">
                <Button variant="ghost" onClick={() => scrollToSection(1)}>
                  Features
                </Button>
                <Button variant="ghost" onClick={() => scrollToSection(2)}>
                  Why Theo
                </Button>
                <Button variant="ghost" onClick={() => scrollToSection(3)}>
                  Pricing
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsVideoDialogOpen(true)}
                >
                  Watch Demo
                </Button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size={isMobile ? "sm" : "default"}
                onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}
              >
                <img
                  src={TheoIcon}
                  alt="Theo Icon"
                  className={`${isMobile ? "w-[18px] h-[18px]" : "w-[22px] h-[22px]"}`}
                />
                {isBackgroundEnabled ? "Disable" : "Enable"}
              </Button>
              <SignInButton>
                <Button size={isMobile ? "sm" : "default"}>Get Started</Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="w-[80%] max-w-none">
          <DialogHeader>
            <DialogTitle>Demo Video</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <video className="w-full h-auto max-h-[80vh]" controls>
              <source src={TheoDemoVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>

      <img
        src={TheoLogo}
        alt="Theo Logo"
        className={`fixed top-4 left-4 z-40 cursor-pointer ${
          isMobile ? "h-8" : "h-10"
        } ${
          isMobile
            ? "transition-opacity duration-300 " +
              (window.scrollY > 100 &&
              window.scrollY + window.innerHeight <
                document.body.scrollHeight - window.innerHeight
                ? "opacity-0"
                : "opacity-100")
            : ""
        }`}
        onClick={() => scrollToSection(0)}
      />

      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0">
        {isBackgroundEnabled && <BoidBackground {...currentParams} />}
      </div>

      <div
        className="relative z-10 pointer-events-none"
        ref={sectionsRef}
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Hero Section */}
        <section
          className={`min-h-screen flex items-center justify-center ${
            isMobile ? "pointer-events-auto" : ""
          }`}
        >
          <div className="w-full px-4 py-32 backdrop-blur-sm bg-background/30 rounded-lg pointer-events-auto">
            <h1
              className={`${isMobile ? "text-4xl" : "text-6xl"} font-bold text-center mb-6 cursor-default`}
            >
              Your Human-Centered Prompt <br /> Engineering Studio
            </h1>
            <p
              className={`${isMobile ? "text-lg" : "text-xl"} text-center mb-8 max-w-2xl mx-auto`}
            >
              Design, test, and perfect your AI agents for sensational user
              experience.
            </p>
            <div className="flex justify-center gap-4">
              <SignInButton>
                <Button size={isMobile ? "default" : "lg"}>
                  Get Started <ArrowRight className="ml-2" />
                </Button>
              </SignInButton>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-24 ${isMobile ? "pointer-events-auto" : ""}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Key Features
            </h2>
            <div className="flex flex-col gap-8 max-w-2xl mx-auto bg-background/40 backdrop-blur-md pt-8 rounded-lg pointer-events-auto">
              <FeatureCard
                icon={<Box />}
                title="Organize Your Prompts"
                description="Keep your prompting strategies organized and version-controlled. Test variations and track improvements."
              />
              <FeatureCard
                icon={<Zap />}
                title="Parallelize API Calls"
                description="Upload files of inputs and get responses simultaneously. Compare responses and find the perfect prompt and model for your use case."
              />
              <FeatureCard
                icon={<TestTube />}
                title="Test, Iterate, Improve"
                description="See results side by side. Quickly test prompt updates and make data-driven improvements."
              />
            </div>
          </div>
        </section>

        {/* Why Theo Section */}
        <section className={`py-24 ${isMobile ? "pointer-events-auto" : ""}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Why Theo?</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 gap-6 auto-rows-fr">
                <WhyCard
                  title="Human-Centered Design"
                  description="Our emphasis is on making AI interactions feel natural and engaging. It's not just about accuracy—it's about experience."
                />
                <WhyCard
                  title="Avoid Costly Fine-tuning"
                  description="Discover the full potential of existing models through strategic prompting without costs of fine-tuning."
                />
                <WhyCard
                  title="Deploy with Confidence"
                  description="Thoroughly test your prompts against edge cases, ensuring consistent, high-quality responses."
                />
              </div>
              <div className="grid grid-cols-1 gap-6 auto-rows-fr">
                <WhyCard
                  title="Multi-model Testing"
                  description="Break down complex multi-agent flows and test variations on each component."
                />
                <WhyCard
                  title="Agent Security"
                  description="Test prompt injection methods and ensure your systems are robust against manipulation."
                />
                <WhyCard
                  title="Optimize Model Selection"
                  description="Utilize our range of compatible providers to find the most cost-effective models that meet your requirements."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className={`py-24 ${isMobile ? "pointer-events-auto" : ""}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Simple Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto bg-background/40 backdrop-blur-md p-8 rounded-lg pointer-events-auto">
              <div className="p-8 rounded-lg bg-background/60 backdrop-blur-sm flex flex-col">
                <h3 className="text-2xl font-bold mb-4">Free</h3>
                <ul className="space-y-4 mb-8 flex-grow">
                  <PricingFeature text="Access to all features and models" />
                  <PricingFeature text="100 usage credits provided for free" />
                  <PricingFeature text="Pay for additional usage as you go" />
                  <PricingFeature text="Can use your own API keys" />
                </ul>
                <SignInButton>
                  <Button className="w-full" size="lg">
                    Get Started
                  </Button>
                </SignInButton>
              </div>
              <div className="p-8 rounded-lg bg-black/5 backdrop-blur-sm flex flex-col">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <ul className="space-y-4 mb-8 flex-grow">
                  <PricingQuestion text="Interested in using Theo at scale?" />
                  <PricingQuestion text="Want customizations for internal use?" />
                  <PricingQuestion text="Want to use Theo for your own proprietary models?" />
                </ul>
                <Button
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    (window.location.href = "mailto:alexander@trytheo.dev")
                  }
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section
          className={`min-h-screen flex items-center justify-center ${
            isMobile ? "pointer-events-auto" : ""
          }`}
        >
          <div className="text-center pointer-events-auto">
            <h2 className="text-4xl font-bold mb-8">
              Ready to transform your AI interactions?
            </h2>
            <SignInButton>
              <Button size="lg" variant="primary">
                Start Now <ArrowRight className="ml-2" />
              </Button>
            </SignInButton>
          </div>
        </section>
        {/* Playground section */}
        <section className="min-h-screen bg-transparent"></section>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-background/60 backdrop-blur-sm flex items-center gap-4">
      <div className="w-14 h-14 text-foreground flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
}

function WhyCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-background/60 backdrop-blur-sm pointer-events-auto">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="w-5 h-5 text-foreground flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function PricingQuestion({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CircleHelp className="w-5 h-5 text-foreground flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

export default Landing;
