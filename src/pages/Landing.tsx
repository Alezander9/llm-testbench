import { SignInButton } from "@clerk/clerk-react";
import { Button } from "../components/ui/button";
import BoidBackground from "../components/features/landing/BoidBackground";
import { ArrowRight, Zap, Box, TestTube, Check } from "lucide-react";

function Landing() {
  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0">
        <BoidBackground />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 pointer-events-none">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-4 py-32 backdrop-blur-sm bg-white/30 rounded-lg pointer-events-auto">
            <h1 className="text-6xl font-bold text-center mb-6 cursor-default">
              Theo: A Prompt Engineering Studio
            </h1>
            <p className="text-xl text-center mb-8 max-w-2xl mx-auto">
              Design, test, and perfect your AI interactions. Make your agents
              not just functional, but delightful to talk to.
            </p>
            <div className="flex justify-center gap-4 pointer-events-auto">
              <SignInButton>
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2" />
                </Button>
              </SignInButton>
              <Button variant="secondary" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white/40 backdrop-blur-md pointer-events-auto">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Box />}
                title="Organize Your Prompts"
                description="Keep your prompting strategies organized and version-controlled. Test variations and track improvements."
              />
              <FeatureCard
                icon={<Zap />}
                title="Aggregate Model Inputs"
                description="Test multiple models simultaneously. Compare responses and find the perfect fit for your use case."
              />
              <FeatureCard
                icon={<TestTube />}
                title="Test, Iterate, Improve"
                description="See results side by side. Make data-driven decisions about your prompt engineering."
              />
            </div>
          </div>
        </section>

        {/* Why Theo Section */}
        <section className="py-24 pointer-events-auto">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Why Theo?</h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="space-y-6">
                <WhyCard
                  title="Human-Centered Design"
                  description="Focus on making AI interactions feel natural and engaging. It's not just about accuracy—it's about experience."
                />
                <WhyCard
                  title="Avoid Costly Fine-tuning"
                  description="Discover the full potential of existing models through strategic prompting before investing in expensive fine-tuning."
                />
                <WhyCard
                  title="Deploy with Confidence"
                  description="Thoroughly test your prompts against edge cases and ensure consistent, high-quality responses."
                />
              </div>
              <div className="space-y-6">
                <WhyCard
                  title="Multi-model Testing"
                  description="Break down complex agent flows and test different models for each component."
                />
                <WhyCard
                  title="Prompt Security"
                  description="Test prompt injection methods and ensure your systems are robust against manipulation."
                />
                <WhyCard
                  title="Optimize Model Selection"
                  description="Find the most cost-effective models that meet your quality requirements."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-white/40 backdrop-blur-md pointer-events-auto">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Simple Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-lg bg-white/60 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4">Free</h3>
                <ul className="space-y-4 mb-8">
                  <PricingFeature text="Access to all features and models" />
                  <PricingFeature text="Pay for tokens as you go" />
                  <PricingFeature text="No hidden fees" />
                </ul>
                <Button className="w-full" size="lg">
                  Get Started
                </Button>
              </div>
              <div className="p-8 rounded-lg bg-black/5 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <p className="mb-8">
                  Interested in using Theo at scale? Want customizations for
                  internal use?
                </p>
                <Button variant="secondary" className="w-full" size="lg">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="min-h-screen flex items-center justify-center pointer-events-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-8">
              Ready to transform your AI interactions?
            </h2>
            <Button size="lg">
              Start Now <ArrowRight className="ml-2" />
            </Button>
          </div>
        </section>

        <section className="min-h-screen hover:pointer-events-auto bg-transparent"></section>
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
    <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm">
      <div className="w-12 h-12 mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
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
    <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="w-5 h-5 text-primary" />
      <span>{text}</span>
    </div>
  );
}

export default Landing;
