// components/features/settings/Settings.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Monitor, HelpCircle, X, Key, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { IconButton } from "../../../components/ui/icon-button";
import { useDashboardStore } from "../../../stores/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";
import { APIKeyInput } from "./APIKeyInput";
import { useToast } from "../../../hooks/use-toast";
import { Textarea } from "../../../components/ui/textarea";

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: Monitor },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "feedback", label: "Feedback", icon: HelpCircle },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

type ApiKeys = {
  openai: string;
  anthropic: string;
  deepseek: string;
};

type ApiKeyErrors = {
  openai?: string;
  anthropic?: string;
  deepseek?: string;
};

export function Settings() {
  const currentUser = useGetUser();
  const userCredit = useQuery(api.queries.getUserCredit, {
    userId: currentUser?._id,
  });
  const specialOfferAvailable =
    userCredit?.remainingCredit &&
    userCredit.remainingCredit <= 50 &&
    !userCredit.demoCreditsUsed;
  const [section, setSection] =
    useState<(typeof SECTIONS)[number]["id"]>("dashboard");
  const {
    gridColumns,
    setGridColumns,
    fontSize,
    setFontSize,
    chatWindowHeight,
    setChatWindowHeight,
  } = useDashboardStore();
  const updateSetting = useMutation(api.mutations.updateUserSetting);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    deepseek: "",
  });
  const [apiKeyErrors, setApiKeyErrors] = useState<ApiKeyErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [savedKeyInfo, setSavedKeyInfo] = useState<
    Record<string, string | null>
  >({
    openai: null,
    anthropic: null,
    deepseek: null,
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSpecialOffer, setFeedbackSpecialOffer] = useState("");
  const createUserFeedback = useMutation(api.mutations.createUserFeedback);
  const claimDemoCredits = useMutation(api.mutations.claimDemoCredits);

  const upsertApiKey = useAction(api.actions.upsertApiKey);
  const deleteApiKey = useAction(api.actions.deleteApiKey);
  const getApiKeyLastDigits = useAction(api.actions.getApiKeyLastDigits);

  const [showFeedbackSpecialOfferForm, setShowFeedbackSpecialOfferForm] =
    useState(false);
  const [
    isSubmittingFeedbackSpecialOffer,
    setIsSubmittingFeedbackSpecialOffer,
  ] = useState(false);

  // Fetch saved API key info when component mounts
  useEffect(() => {
    const fetchSavedKeys = async () => {
      if (!currentUser?._id) return;

      const providers = ["openai", "anthropic", "deepseek"] as const;
      const info: Record<string, string | null> = {};

      for (const provider of providers) {
        try {
          const lastDigits = await getApiKeyLastDigits({
            userId: currentUser._id,
            provider,
          });
          info[provider] = lastDigits;
        } catch (error) {
          console.error(`Failed to fetch ${provider} API key info:`, error);
          info[provider] = null;
        }
      }

      setSavedKeyInfo(info);
    };

    fetchSavedKeys();
  }, [currentUser?._id]);

  const handleClose = () => {
    window.location.hash = "";
  };

  const handleSaveApiKeys = async () => {
    if (!currentUser?._id) return;
    setIsSaving(true);
    setApiKeyErrors({});

    try {
      // Save each non-empty API key
      for (const [provider, key] of Object.entries(apiKeys)) {
        if (key) {
          try {
            await upsertApiKey({
              userId: currentUser._id,
              provider: provider as "openai" | "anthropic" | "deepseek",
              apiKey: key,
            });
          } catch (error) {
            setApiKeyErrors((prev) => ({
              ...prev,
              [provider]:
                error instanceof Error
                  ? error.message
                  : "Failed to save API key",
            }));
          }
        }
      }
      toast({
        title: "Success",
        description: "API keys saved successfully",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiKey = async (provider: keyof ApiKeys) => {
    if (!currentUser?._id) return;

    try {
      await deleteApiKey({
        userId: currentUser._id,
        provider,
      });
      setApiKeys((prev) => ({ ...prev, [provider]: "" }));
      setSavedKeyInfo((prev) => ({ ...prev, [provider]: null }));
      toast({
        title: "Success",
        description: `${provider.toUpperCase()} API key deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${provider.toUpperCase()} API key`,
        variant: "destructive",
      });
    }
  };

  const handleSubmitFeedback = async () => {
    if (!currentUser?._id || !feedback.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      await createUserFeedback({
        userId: currentUser._id,
        feedback: feedback.trim(),
      });

      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });

      setFeedback(""); // Clear the textarea
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSubmitFeedbackSpecialOffer = async () => {
    if (!currentUser?._id || !feedbackSpecialOffer.trim()) return;

    setIsSubmittingFeedbackSpecialOffer(true);
    try {
      await createUserFeedback({
        userId: currentUser._id,
        feedback: feedbackSpecialOffer.trim(),
      });

      await claimDemoCredits({
        userId: currentUser._id,
      });

      toast({
        title: "Success",
        description:
          "Thank you for your feedback! 1000 credits have been added to your account.",
      });

      setFeedbackSpecialOffer(""); // Clear the textarea
      setShowFeedbackSpecialOfferForm(false); // Hide the form
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedbackSpecialOffer(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-[680px] h-[540px] p-0" hideCloseButton>
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Settings</DialogTitle>
            <IconButton variant="ghost" onClick={handleClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(540px-65px)]">
          {/* Sidebar */}
          <div className="w-[200px] border-r p-2">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={section === id ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 mb-1"
                onClick={() => setSection(id)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {section === "apikeys" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-md font-medium">OpenAI API Key</h3>
                    <APIKeyInput
                      provider="openai"
                      value={apiKeys.openai}
                      onChange={(value) =>
                        setApiKeys((prev) => ({ ...prev, openai: value }))
                      }
                      onDelete={() => handleDeleteApiKey("openai")}
                      error={
                        apiKeyErrors.openai ? "Invalid API key" : undefined
                      }
                      savedLastDigits={savedKeyInfo.openai}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-md font-medium">Anthropic API Key</h3>
                    <APIKeyInput
                      provider="anthropic"
                      value={apiKeys.anthropic}
                      onChange={(value) =>
                        setApiKeys((prev) => ({ ...prev, anthropic: value }))
                      }
                      onDelete={() => handleDeleteApiKey("anthropic")}
                      error={
                        apiKeyErrors.anthropic ? "Invalid API key" : undefined
                      }
                      savedLastDigits={savedKeyInfo.anthropic}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-md font-medium">Deepseek API Key</h3>
                    <APIKeyInput
                      provider="deepseek"
                      value={apiKeys.deepseek}
                      onChange={(value) =>
                        setApiKeys((prev) => ({ ...prev, deepseek: value }))
                      }
                      onDelete={() => handleDeleteApiKey("deepseek")}
                      error={
                        apiKeyErrors.deepseek ? "Invalid API key" : undefined
                      }
                      savedLastDigits={savedKeyInfo.deepseek}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveApiKeys} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save API Keys"}
                  </Button>
                </div>
              </div>
            )}

            {section === "feedback" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Send us a message</h3>
                  <Textarea
                    placeholder="Enter your feedback here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    variant="secondary"
                    className="resize-none min-h-[200px] font-mono"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback || !feedback.trim()}
                  >
                    {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </div>
            )}

            {section === "dashboard" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">Grid Columns</h3>
                  <Select
                    value={gridColumns.toString()}
                    onValueChange={async (value) => {
                      const columns = Number(value) as 1 | 2 | 3 | 4 | 5;
                      if (!currentUser?._id) {
                        return;
                      }
                      await updateSetting({
                        userId: currentUser?._id,
                        settingKey: "gridColumns",
                        settingValue: columns,
                      });
                      setGridColumns(columns);
                    }}
                  >
                    <SelectTrigger variant="secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Column" : "Columns"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">Font Size</h3>
                  <Select
                    value={fontSize}
                    onValueChange={async (newSize) => {
                      if (!currentUser?._id) {
                        return;
                      }
                      await updateSetting({
                        userId: currentUser?._id,
                        settingKey: "fontSize",
                        settingValue: newSize,
                      });
                      setFontSize(newSize as "small" | "medium" | "large");
                    }}
                  >
                    <SelectTrigger variant="secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">Chat Window Height</h3>
                  <Select
                    value={chatWindowHeight.toString()}
                    onValueChange={async (value) => {
                      if (!currentUser?._id) {
                        return;
                      }
                      const height = Number(value);
                      await updateSetting({
                        userId: currentUser?._id,
                        settingKey: "chatWindowHeight",
                        settingValue: height,
                      });
                      setChatWindowHeight(height);
                    }}
                  >
                    <SelectTrigger variant="secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 7 }, (_, i) => (i + 2) * 100).map(
                        (height) => (
                          <SelectItem key={height} value={height.toString()}>
                            {height}px
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {section === "billing" && (
              <div className="space-y-6">
                {!showFeedbackSpecialOfferForm && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Credit Balance</h3>
                      <div className="p-4 border rounded-lg bg-secondary/50">
                        <div className="grid gap-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Remaining Credits
                            </span>
                            <span className="font-medium">
                              {Math.round(userCredit?.remainingCredit || 0)}
                            </span>
                          </div>
                          {/* <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total Credits Received
                          </span>
                          <span className="font-medium">
                            {userCredit?.totalCreditsReceived || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total Credits Purchased
                          </span>
                          <span className="font-medium">
                            {userCredit?.totalCreditsPurchased || 0}
                          </span>
                        </div> */}
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Total Credits Used
                            </span>
                            <span className="font-medium">
                              {Math.round(userCredit?.totalCreditsUsed || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!showFeedbackSpecialOfferForm ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Special Offer</h3>
                      <div className="p-4 border rounded-lg ">
                        <div className="space-y-4">
                          <p className="text-sm text-foreground mb-4">
                            Earn 1000 credits for writing feedback about Theo
                          </p>
                          <div className="flex justify-center">
                            <Button
                              variant={
                                specialOfferAvailable ? "secondary" : "disabled"
                              }
                              disabled={!specialOfferAvailable}
                              onClick={() =>
                                setShowFeedbackSpecialOfferForm(true)
                              }
                            >
                              Claim Offer
                            </Button>
                          </div>
                          <div className="flex justify-center">
                            {!specialOfferAvailable &&
                            userCredit?.remainingCredit &&
                            userCredit.remainingCredit > 50 ? (
                              <p className="text-sm text-muted mt-2">
                                You have already claimed this offer
                              </p>
                            ) : (
                              <p className="text-sm text-muted mt-2">
                                Use Theo more to unlock this offer
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Submit feedback about Theo and earn 1000 credits
                      </h3>
                      <Textarea
                        placeholder="Likes, dislikes, bugs, feature requests..."
                        value={feedbackSpecialOffer}
                        onChange={(e) =>
                          setFeedbackSpecialOffer(e.target.value)
                        }
                        variant="secondary"
                        className="resize-none min-h-[200px] font-mono"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitFeedbackSpecialOffer}
                        disabled={
                          isSubmittingFeedbackSpecialOffer ||
                          !feedbackSpecialOffer.trim()
                        }
                      >
                        {isSubmittingFeedbackSpecialOffer
                          ? "Submitting..."
                          : "Submit Feedback"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
