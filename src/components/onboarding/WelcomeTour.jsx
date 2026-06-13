import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Rocket,
  Zap,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';

const tourSteps = [
  {
    id: 1,
    title: "Welcome to Tuesday.com! 🎉",
    description: "Your all-in-one project management solution. Let's take a quick tour to get you started.",
    icon: Rocket,
    color: "#0073EA",
    action: "Get Started"
  },
  {
    id: 2,
    title: "Create Your First Board",
    description: "Boards help you organize your projects. Click 'Create Board' to start organizing your work.",
    icon: Sparkles,
    color: "#00C875",
    target: "create-board-btn",
    action: "Got it!"
  },
  {
    id: 3,
    title: "Multiple Views",
    description: "Switch between Table, Kanban, Calendar, and Timeline views to see your work in different ways.",
    icon: Calendar,
    color: "#FFCB00",
    target: "view-switcher",
    action: "Cool!"
  },
  {
    id: 4,
    title: "Team Collaboration",
    description: "Invite teammates, assign tasks, and track progress together in real-time.",
    icon: Users,
    color: "#A25DDC",
    target: "team-section",
    action: "Awesome!"
  },
  {
    id: 5,
    title: "Powerful Automations",
    description: "Set up automations to save time on repetitive tasks. Find them in board settings.",
    icon: Zap,
    color: "#E2445C",
    target: "automations",
    action: "Show me more"
  },
  {
    id: 6,
    title: "Track Progress",
    description: "Use Analytics and Workload pages to monitor team performance and capacity.",
    icon: BarChart3,
    color: "#4ECDC4",
    target: "analytics-link",
    action: "Nice!"
  },
  {
    id: 7,
    title: "You're All Set! 🚀",
    description: "You're ready to start managing your projects like a pro. Create your first board and dive in!",
    icon: CheckCircle2,
    color: "#00C875",
    action: "Start Working"
  }
];

export default function WelcomeTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Check if user has seen tour before
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowTour(false);
      setShowConfetti(false);
      localStorage.setItem('hasSeenTour', 'true');
      onComplete?.();
    }, 3000);
  };

  const handleSkip = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenTour', 'true');
    onComplete?.();
  };

  if (!showTour) return null;

  const step = tourSteps[currentStep];

  return (
    <AnimatePresence>
      {showTour && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
          >
            <Card className="shadow-2xl border-4 overflow-hidden" style={{ borderColor: step.color }}>
              {/* Progress Bar */}
              <div className="h-2 bg-gray-100">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: step.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <CardContent className="p-8">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={handleSkip}
                >
                  <X className="w-5 h-5" />
                </Button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <step.icon 
                    className="w-10 h-10"
                    style={{ color: step.color }}
                  />
                </motion.div>

                {/* Content */}
                <div className="text-center mb-8">
                  <Badge 
                    className="mb-4"
                    style={{ backgroundColor: `${step.color}20`, color: step.color }}
                  >
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {step.description}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-500"
                  >
                    Skip Tour
                  </Button>
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.action}
                    {currentStep < tourSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 ml-2" />
                    )}
                    {currentStep === tourSteps.length - 1 && (
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    )}
                  </Button>
                </div>

                {/* Dots Indicator */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep ? 'w-8' : 'w-2'
                      }`}
                      style={{ 
                        backgroundColor: index <= currentStep ? step.color : '#E5E7EB'
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Confetti */}
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}