import { CornerRightUp, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";
import { cn } from "../../utils/cn";
import { getCryptoInfo } from "../../services/perplexity";

interface AIInputWithLoadingProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  onResponse?: (response: string, sources?: any[]) => void;
  className?: string;
  autoFocus?: boolean;
}

export function AIInputWithLoading({
  id = "ai-input-with-loading",
  placeholder = "Ask about crypto or blockchain...",
  minHeight = 56,
  maxHeight = 200,
  onSubmit,
  onResponse,
  className,
  autoFocus = false
}: AIInputWithLoadingProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ask me anything about cryptocurrency");
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, textareaRef]);

  const handleSubmit = async () => {
    const query = inputValue.trim();
    if (!query || isLoading) return;
    
    setIsLoading(true);
    setStatusMessage("Thinking...");
    
    try {
      // Call onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(query);
      }
      
      // Call Perplexity API
      const response = await getCryptoInfo(query);
      
      // Call onResponse prop with the result
      if (onResponse) {
        onResponse(response.content, response.sources);
      }
      
      setStatusMessage("Ready for your next question");
    } catch (error) {
      console.error("Error getting AI response:", error);
      setStatusMessage("Failed to get response. Please try again.");
    } finally {
      setInputValue("");
      adjustHeight(true);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-start flex-col gap-2">
        <div className="relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Sparkles 
              size={18} 
              className="text-blue-500 dark:text-blue-400" 
            />
          </div>
          <textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-xl pl-11 pr-12 py-3.5",
              "bg-white dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400",
              "focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none",
              "text-gray-900 dark:text-white resize-none text-sm leading-normal",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
              "transition-colors duration-200",
              `min-h-[${minHeight}px]`
            )}
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5",
              "text-white",
              isLoading 
                ? "bg-blue-400 cursor-not-allowed" 
                : inputValue.trim() 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "bg-blue-300 cursor-not-allowed",
              "transition-colors duration-200"
            )}
            type="button"
            disabled={isLoading || !inputValue.trim()}
            aria-label="Submit question"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CornerRightUp className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="pl-4 text-xs text-gray-500 dark:text-gray-400 flex items-center">
          {isLoading && (
            <span className="inline-block mr-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          )}
          {statusMessage}
        </p>
      </div>
    </div>
  );
}