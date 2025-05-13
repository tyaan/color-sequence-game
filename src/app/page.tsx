"use client"

import React, { useState, useEffect } from "react";
import { Check, CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AVAILABLE_COLORS = [
  "red", 
  "yellow", 
  "blue", 
  "purple", 
  "green", 
  "orange", 
  "pink", 
  "brown", 
  "gray", 
  "black", 
  "white"] as const;
type Color = typeof AVAILABLE_COLORS[number];

const TAILWIND_COLOR_MAP: Record<string, string> = {
  red: "bg-red-600",
  yellow: "bg-yellow-400", 
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  green: "bg-green-600",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  brown: "bg-amber-900", 
  gray: "bg-gray-500",
  black: "bg-black",
  white: "bg-white"
};

const TAILWIND_COLOR_MAP_TEXT: Record<string, string> = {
  red: "text-red-600",
  yellow: "text-yellow-400", 
  blue: "text-blue-600",
  purple: "text-purple-600",
  green: "text-green-600",
  orange: "text-orange-500",
  pink: "text-pink-500",
  brown: "text-amber-900", 
  gray: "text-gray-500",
  black: "text-black",
  white: "text-white"
};

const Game: React.FC = () => {
  // Selected colors for the game
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  // Time in seconds for each color to be displayed
  const [displayTime, setDisplayTime] = useState<number>(2);
  // Sequence of colors to be displayed
  const [sequence, setSequence] = useState<Color[]>([]);
  // All colors up to this index are shown, -1 means none are shown
  const [displayedIndex, setDisplayedIndex] = useState<number>(-1); 
  // User input colors
  const [userInput, setUserInput] = useState<Color[]>([]);
  // Show rules modal on start screen
  const [showRules, setShowRules] = useState(false);
  // Show start game modal button
  const [showStartModalButton, setShowStartModalButton] = useState(true);

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showCorrectMessage, setShowCorrectMessage] = useState(false);
  const [score, setScore] = useState<number>(0);

  // Start game with selected colors
  const startGame = () => {
    if (selectedColors.length < 2) return;
    setGameStarted(true);
    const randomColor = selectedColors[Math.floor(Math.random() * selectedColors.length)];
    setSequence([randomColor]);
    setDisplayedIndex(-1);
  };

  // Sequence display logic
  useEffect(() => {
    if (displayedIndex >= 0 && displayedIndex < sequence.length) {
      const timer = setTimeout(() => {
        setDisplayedIndex(displayedIndex + 1);
      }, displayTime * 1000);
      return () => clearTimeout(timer);
    } else if (displayedIndex >= sequence.length) {
      setDisplayedIndex(-1);
    }
  }, [displayedIndex, sequence, displayTime]);

  // User color selection logic
  const handleColorSelect = (color: Color) => {
    if (userInput.length >= sequence.length) return;

    const newInput = [...userInput, color];
    setUserInput(newInput);
    
    if (color !== sequence[newInput.length - 1]) { // If user selects wrong color, game over
      setGameOver(true);
      const highScoreString = localStorage.getItem("COLOR_GAME_HIGH_SCORE")
      const highScore = highScoreString ? parseInt(highScoreString) : 0
      localStorage.setItem("COLOR_GAME_HIGH_SCORE", Math.max(score, highScore).toString())
    } else if (newInput.length === sequence.length) { // if user selects right color
      setShowCorrectMessage(true);

      setTimeout(() => {
        setShowCorrectMessage(false);
        const newColor = selectedColors[Math.floor(Math.random() * selectedColors.length)];
        const newSequence = [...sequence, newColor];
        setSequence(newSequence);
        setScore((prev) => prev + 1)
        setUserInput([]);
        setDisplayedIndex(-1); 

        // Wait 0.5s before next round
        setTimeout(() => {
          setDisplayedIndex(0);
        }, 500);
      }, 1000); // Show "Correct!" for 1 second
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setSequence([]);
    setDisplayedIndex(-1);
    setUserInput([]);
    setScore(0)
    setGameOver(false);
    setShowStartModalButton(true);
  };

  return (
    <>
      {!gameStarted ? (

        // Opening Screen
        <div className="min-h-screen bg-slate-200 flex gap-6 items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
            <h1 className="text-3xl font-bold mb-4 text-center 
                bg-[linear-gradient(to_right,_#dc2626,_#ca8a04,_#16a34a,_#2563eb,_#7c3aed,_#be185d)] 
                bg-clip-text text-transparent">
              ✨ Color Memory Game ✨
            </h1>
            <Button
              variant="outline"
              className="cursor-pointer mb-4 w-full text-center"
              onClick={() => setShowRules((prev) => !prev)}
            >
               <CircleHelp /> How to Play <CircleHelp />
            </Button>
            <p className="mb-4 text-center font-bold">Select at least 2 colors to play with</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {AVAILABLE_COLORS.map(color => (
                <button
                  key={color}
                  className={`cursor-pointer w-2/3 aspect-square mx-auto rounded-md ${TAILWIND_COLOR_MAP[color]}
                              border-2 border-gray-300 
                              ${selectedColors.includes(color) ? 'ring-2 ring-black opacity-100' : `opacity-70`}`}
                  onClick={() => {
                    if (selectedColors.includes(color)) {
                      setSelectedColors(selectedColors.filter(c => c !== color));
                    } else {
                      setSelectedColors([...selectedColors, color]);
                    }
                  }}
                />
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-center mb-2 font-bold">Color Display Time</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={displayTime}
                onChange={(e) => setDisplayTime(parseFloat(e.target.value))}
                className="cursor-pointer w-full accent-blue-500"
              />
              <p className="text-center mt-2 font-semibold">{displayTime.toFixed(1)} seconds</p>
            </div>
            <Button
              onClick={startGame}
              disabled={selectedColors.length < 2}
              variant={selectedColors.length < 2 ? "ghost" : "default"}
              className="cursor-pointer w-full text-center"
            >
              Start Game
            </Button>

            {/* Rules Modal */}
            <div
              className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
                showRules ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-center">How to Play</h2>
                <p className="mb-4">1. Select at least 2 colors to play with.</p>
                <p className="mb-4">
                  2. The game will display a sequence of the selected colors for you to remember.
                </p>
                <p className="mb-4">
                  3. After the sequence is displayed, you will recall the sequence
                  by clicking on the colors in the sidebar in the correct order.
                </p>
                <p className="mb-4">4. If you select a wrong color, the game is over!</p>
                <Button
                  variant="outline"
                  className="cursor-pointer w-full text-center"
                  onClick={() => setShowRules(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="min-h-screen bg-slate-200 flex flex-row gap-6 items-center justify-center p-4">

          {/* Start Game Modal Button */}
          <div
              className={`fixed inset-0 bg-black/80 flex items-center justify-center ${
                showStartModalButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
            <Button
              variant="outline"
              className="cursor-pointer w-[50vw] h-[25vh] text-center text-2xl font-bold bg-green-500 hover:bg-green-600 rounded-lg shadow-lg"
              onClick={() => {
                setShowStartModalButton(false)
                setDisplayedIndex(0)
              }}
            >
              Click to Start
            </Button>
          </div>

          {/* Main Sequence Screen */}
          <div className="bg-white p-6 rounded-lg shadow-md w-full min-h-[90vh]">
            <div className="relative text-center md:absolute l-20 t-20 text-lg">
              {`Score: ${score}`}
            </div>

            <h1 className="text-2xl font-bold mb-4 text-center">{(displayedIndex >= 0 || showStartModalButton) ? 'Watch Carefully...' : 'Recall the Sequence'}</h1>
            <div className="flex flex-wrap">
              {sequence.map((color, index) => (
                <div
                  key={index}
                  className={`flex mb-2 w-1/4 md:w-1/6 lg:w-1/12 aspect-square rounded-md ${TAILWIND_COLOR_MAP[color]} 
                            border-2 border-gray-300 transition-all duration-[${displayTime * 1000 / 3}ms]
                            ${(index <= displayedIndex || index < userInput.length || gameOver) ? "opacity-100" : "opacity-0"}`}
                >
                  {(gameOver && index == (userInput.length - 1)) &&
                    <X
                      className={`w-full h-full ${TAILWIND_COLOR_MAP_TEXT[userInput[userInput.length - 1]]} mx-auto my-auto`}
                    />
                  }
                </div>
              ))}
            </div>

            {showCorrectMessage && (
              <div className="text-center my-4">
                <p className="text-green-600 font-bold text-lg flex items-center justify-center"><Check /> Correct!</p>
              </div>
            )}

            {gameOver &&
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-500 mb-2 mt-6">Game over!</h3>
                <h4 className="text-xl font-bold mb-2">{`Score: ${score}`}</h4>
                <h4 className="text-xl font-bold mb-4">{`High Score: ${localStorage.getItem('COLOR_GAME_HIGH_SCORE') || 0}`}</h4>

                <Button
                  variant="default"
                  onClick={resetGame}
                  className="cursor-pointer p-6"
                >
                  Play Again
                </Button>
              </div>}
          </div>

          {/* Sequence Selector Screen */}
          <div className={`bg-white p-2 md:p-4 rounded-lg shadow-md min-h-[90vh] flex-shrink-0
                          ${displayedIndex >=0 && 'blur-lg opacity-50'}`}>
            <div className={`p-2 grid grid-cols-2 ${selectedColors.length > 2 && 'lg:grid-cols-3'} gap-2 overflow-auto`}>
              {selectedColors.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  disabled={(userInput.length >= sequence.length) || (displayedIndex >= 0) || gameOver}
                  className={`cursor-pointer w-14 md:w-16 lg:w-24 aspect-square mx-auto rounded-md ${TAILWIND_COLOR_MAP[color]} 
                            border-2 border-gray-300 transition
                            active:ring-2 active:ring-black`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Game;