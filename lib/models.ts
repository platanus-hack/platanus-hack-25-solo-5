import { SiOpenai, SiAnthropic, SiGoogle } from "react-icons/si"
import { FaRobot } from "react-icons/fa"
import { LucideIcon } from "lucide-react"
import { IconType } from "react-icons"

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: "openai" | "anthropic" | "google" | "deepseek" | "xai" | "zai";
  isPro: boolean;
  category?: "fast" | "balanced" | "advanced" | "reasoning";
}

export interface ProviderIconConfig {
  icon: IconType;
  color: string;
  bgColor: string;
}

export const PROVIDER_ICONS: Record<ModelInfo["provider"], ProviderIconConfig> = {
  openai: {
    icon: SiOpenai,
    color: "text-foreground",
    bgColor: "bg-muted",
  },
  anthropic: {
    icon: SiAnthropic,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  google: {
    icon: SiGoogle,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  deepseek: {
    icon: FaRobot,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  xai: {
    icon: FaRobot,
    color: "text-foreground",
    bgColor: "bg-muted",
  },
  zai: {
    icon: FaRobot,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
}

export function getProviderIcon(provider: ModelInfo["provider"]): ProviderIconConfig {
  return PROVIDER_ICONS[provider] || PROVIDER_ICONS.openai
}

export const AVAILABLE_MODELS: Record<string, ModelInfo> = {
  "openai/gpt-4.1-mini": {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description: "OpenAI's fastest and most economical model",
    provider: "openai",
    isPro: false,
    category: "fast",
  },
  "openai/gpt-4.1": {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    description: "Balanced performance and capabilities",
    provider: "openai",
    isPro: true,
    category: "balanced",
  },
  "openai/gpt-4o": {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's most accurate model",
    provider: "openai",
    isPro: true,
    category: "advanced",
  },
  "openai/gpt-5": {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "OpenAI's most advanced model",
    provider: "openai",
    isPro: true,
    category: "advanced",
  },
  "openai/gpt-5-mini": {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Fast and efficient GPT-5 variant",
    provider: "openai",
    isPro: false,
    category: "fast",
  },
  "anthropic/claude-sonnet-4.5": {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    description: "Excellent reasoning and analysis",
    provider: "anthropic",
    isPro: true,
    category: "advanced",
  },
  "anthropic/claude-3.7-sonnet": {
    id: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    description: "Fast and capable AI assistant",
    provider: "anthropic",
    isPro: true,
    category: "balanced",
  },
  "google/gemini-2.0-flash": {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Google's fast multimodal AI",
    provider: "google",
    isPro: true,
    category: "fast",
  },
  "google/gemini-2.5-flash-image": {
    id: "google/gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash Image",
    description: "Specialized for image generation",
    provider: "google",
    isPro: true,
    category: "advanced",
  },
  "deepseek/deepseek-chat": {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat",
    description: "Great for coding and technical tasks",
    provider: "deepseek",
    isPro: true,
    category: "balanced",
  },
  "deepseek/deepseek-r1": {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    description: "Advanced reasoning and problem-solving",
    provider: "deepseek",
    isPro: true,
    category: "reasoning",
  },
  "xai/grok-4": {
    id: "xai/grok-4",
    name: "Grok 4",
    description: "xAI's next-generation AI model",
    provider: "xai",
    isPro: true,
    category: "advanced",
  },
  "xai/grok-4-fast-reasoning": {
    id: "xai/grok-4-fast-reasoning",
    name: "Grok 4 Fast Reasoning",
    description: "Optimized for quick logical reasoning",
    provider: "xai",
    isPro: true,
    category: "reasoning",
  },
  "xai/grok-4-fast-non-reasoning": {
    id: "xai/grok-4-fast-non-reasoning",
    name: "Grok 4 Fast",
    description: "Fast responses without deep reasoning",
    provider: "xai",
    isPro: false,
    category: "fast",
  },
  "zai/glm-4.6": {
    id: "zai/glm-4.6",
    name: "GLM 4.6",
    description: "Powerful general-purpose AI model",
    provider: "zai",
    isPro: true,
    category: "balanced",
  },
};

// Helper function to get model info
export function getModelInfo(modelId: string): ModelInfo | undefined {
  return AVAILABLE_MODELS[modelId];
}

// Get models by category
export function getModelsByCategory(category: ModelInfo["category"]) {
  return Object.values(AVAILABLE_MODELS).filter((model) => model.category === category);
}

// Get all model IDs
export function getAllModelIds(): string[] {
  return Object.keys(AVAILABLE_MODELS);
}

// Get models by provider
export function getModelsByProvider(provider: ModelInfo["provider"]) {
  return Object.values(AVAILABLE_MODELS).filter((model) => model.provider === provider);
}
