import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

interface SaveButtonProps {
  onClick: () => void;
  loading: boolean;
  text?: string;
  loadingText?: string;
  className?: string;
}

export default function SaveButton({
  onClick,
  loading,
  text = "Save Changes",
  loadingText = "Saving...",
  className = "bg-blue-600 hover:bg-blue-700",
}: SaveButtonProps) {
  return (
    <motion.div whileTap={{ scale: 0.96 }}>
      <Button
        onClick={onClick}
        disabled={loading}
        className={`${className} transition-all ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {loading ? loadingText : text}
      </Button>
    </motion.div>
  );
}
