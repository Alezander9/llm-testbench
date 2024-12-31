import { SignInButton } from "@clerk/clerk-react";
import { Button } from "../components/ui/button";

function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your App</h1>
      <Button asChild>
        <SignInButton mode="modal" />
      </Button>
    </div>
  );
}

export default Landing;
