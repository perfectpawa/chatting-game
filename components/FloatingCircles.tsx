import React, { useMemo } from "react";
import { motion } from "framer-motion";

const N_CIRCLES = 15;
const N_NAMED = 4;
const NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function shuffle<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const FloatingCircles: React.FC = () => {
  // Memoize circle data so it doesn't change on every render
  const circles = useMemo(() => {
    // Pick random indices for named circles
    const namedIndices = new Set<number>();
    while (namedIndices.size < N_NAMED) {
      namedIndices.add(Math.floor(Math.random() * N_CIRCLES));
    }
    // Shuffle names and pick unique ones
    const uniqueNames = shuffle(NAMES).slice(0, N_NAMED);
    let nameIdx = 0;
    return Array.from({ length: N_CIRCLES }).map((_, i) => {
      const size = randomBetween(22, 38); // px, reduced radius
      const left = randomBetween(0, 90); // %
      const top = randomBetween(0, 90); // %
      const duration = randomBetween(8, 18); // seconds
      const delay = randomBetween(0, 8); // seconds
      const isNamed = namedIndices.has(i);
      const name = isNamed ? uniqueNames[nameIdx++] : null;
      // Line direction: random angle
      const angle = randomBetween(0, 2 * Math.PI);
      // Name pop timing
      const namePopDuration = randomBetween(2, 4); // seconds
      const namePopDelay = randomBetween(0, 6); // seconds
      return { size, left, top, duration, delay, isNamed, name, angle, namePopDuration, namePopDelay };
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {circles.map((circle, i) => {
        // Animate floating in a random direction
        const floatDistance = randomBetween(30, 80); // px
        const dx = Math.cos(circle.angle) * floatDistance;
        const dy = Math.sin(circle.angle) * floatDistance;
        // Determine if the circle is on the left or right half
        const isLeft = circle.left < 50;
        // SVG and name alignment values
        const svgWidth = 44;
        const svgHeight = 24;
        const diagStartX = isLeft ? 22 : 22;
        const diagStartY = svgHeight;
        const diagEndX = isLeft ? 34 : 10;
        const diagEndY = 12;
        const horizEndX = isLeft ? 42 : 2;
        const horizEndY = 12;
        const nameLeft = isLeft ? `calc(50% + 20px)` : `calc(50% - 62px)`; // 22+20 or 22-42
        const nameAlign = isLeft ? "left" : "right";
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 0.7 }}
            animate={{
              x: [0, dx, 0],
              y: [0, dy, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: circle.duration,
              delay: circle.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              left: `${circle.left}%`,
              top: `${circle.top}%`,
              width: circle.size,
              height: circle.size,
              zIndex: 1,
            }}
          >
            <div
              className="rounded-full bg-[#363a4f] border border-[#494d64] shadow-lg flex items-center justify-center relative"
              style={{ width: circle.size, height: circle.size }}
            >
              {circle.isNamed && circle.name && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: circle.namePopDuration * 2,
                    delay: circle.namePopDelay,
                    repeat: Infinity,
                    repeatType: "loop",
                    times: [0, 0.2, 0.8, 1],
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* Name centered in the circle */}
                  <span className="text-[10px] font-bold text-[#a6adc8] text-center whitespace-nowrap">
                    {circle.name}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingCircles; 