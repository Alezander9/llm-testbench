import { Smartphone } from "lucide-react";
import { Monitor } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import TheoLogo1024 from "../../assets/TheoLogo1024.png";

export const MobileRestrictionMessage = () => (
  <div className="min-h-screen bg-background p-4 flex flex-col items-center">
    <img src={TheoLogo1024} alt="Theo" className="w-[256px] mt-20 mb-8" />
    <Alert className="max-w-md">
      <div className="flex items-center gap-4 mb-4">
        <Smartphone className="h-8 w-8" />
        <Monitor className="h-8 w-8" />
      </div>
      <AlertTitle className="text-lg font-semibold mb-2">
        Desktop Device Required
      </AlertTitle>
      <AlertDescription className="text-base">
        Theo is designed for desktop development environments. Please open this
        application on a computer to access all features and capabilities.
      </AlertDescription>
    </Alert>
  </div>
);
