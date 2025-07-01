import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/lib/store/user";
import { supabaseClient } from "@/utils/supabase/client";
import { useCircleStore, CircleData } from "@/lib/store/circle";

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

// Helper to fetch display_name for a user id
async function fetchDisplayName(userId: string): Promise<string> {
  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", userId)
    .single();
  if (error || !data) return "User";
  return data.display_name || "User";
}

const FloatingCircles: React.FC = () => {
  const user = useUser((state) => state.user);
  const displayName = useUser((state) => state.displayName);
  const { circles, setCircles } = useCircleStore();
  const [waitingUsers, setWaitingUsers] = useState<{
    id: string;
    display_name: string;
    circleId: string;
  }[]>([]);

  // On mount, only generate random/user circles if store is empty
  useEffect(() => {
    if (circles.length === 0) {
      // Generate random/user circles
      const namedIndices = new Set<number>();
      while (namedIndices.size < N_NAMED) {
        namedIndices.add(Math.floor(Math.random() * N_CIRCLES));
      }
      const uniqueNames = shuffle(NAMES).slice(0, N_NAMED);
      let nameIdx = 0;
      const arr: CircleData[] = Array.from({ length: N_CIRCLES }).map((_, i) => {
        const size = randomBetween(22, 38);
        const left = randomBetween(0, 90);
        const top = randomBetween(0, 90);
        const duration = randomBetween(8, 18);
        const delay = randomBetween(0, 8);
        const isNamed = namedIndices.has(i);
        const name = isNamed ? uniqueNames[nameIdx++] : null;
        const angle = randomBetween(0, 2 * Math.PI);
        const namePopDuration = randomBetween(2, 4);
        const namePopDelay = randomBetween(0, 6);
        return {
          size, left, top, duration, delay, isNamed, name, angle, namePopDuration, namePopDelay, isUser: false, isWaiting: false, circleId: `random-${i}`
        };
      });
      // Add user circle if logged in
      if (user) {
        const size = randomBetween(28, 44);
        const left = randomBetween(10, 80);
        const top = randomBetween(10, 80);
        const duration = randomBetween(8, 18);
        const delay = randomBetween(0, 8);
        const angle = randomBetween(0, 2 * Math.PI);
        const namePopDuration = randomBetween(2, 4);
        const namePopDelay = randomBetween(0, 6);
        arr.push({
          size,
          left,
          top,
          duration,
          delay,
          isNamed: false,
          name: displayName || "You",
          angle,
          namePopDuration,
          namePopDelay,
          isUser: true,
          isWaiting: false,
          circleId: user.id || "user-circle",
        });
      }
      setCircles(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to waiting_users table and update waitingUsers state
  useEffect(() => {
    const supabase = supabaseClient();
    let mounted = true;

    async function fetchInitial() {
      const { data } = await supabase
        .from("waiting_users")
        .select("id, created_at");
      if (data && mounted) {
        // Fetch display names for all
        const usersWithNames = await Promise.all(
          data
            .filter((u) => !user || u.id !== user.id)
            .map(async (u) => ({
              id: u.id,
              display_name: await fetchDisplayName(u.id),
              circleId: u.id,
            }))
        );
        setWaitingUsers(usersWithNames);
      }
    }
    fetchInitial();

    const channel = supabase
      .channel("waiting-users-listen")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waiting_users" },
        async (payload) => {
          if (!mounted) return;
          const newId = payload.new.id;
          if (user && newId === user.id) return; // skip self
          const display_name = await fetchDisplayName(newId);
          setWaitingUsers((prev) =>
            prev.some((u) => u.id === newId)
              ? prev
              : [...prev, { id: newId, display_name, circleId: newId }]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "waiting_users" },
        (payload) => {
          if (!mounted) return;
          const delId = payload.old.id;
          setWaitingUsers((prev) => prev.filter((u) => u.id !== delId));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [user]);

  // Merge waiting users into circles for rendering (but don't persist them)
  const renderCircles: CircleData[] = [
    ...circles,
    ...waitingUsers.map((w) => {
      // If a waiting circle already exists in store, use its position/size
      const existing = circles.find((c) => c.circleId === w.circleId);
      return existing
        ? { ...existing, isUser: false, isWaiting: true, name: w.display_name }
        : {
            circleId: w.circleId,
            size: randomBetween(28, 44),
            left: randomBetween(10, 80),
            top: randomBetween(10, 80),
            duration: randomBetween(8, 18),
            delay: randomBetween(0, 8),
            angle: randomBetween(0, 2 * Math.PI),
            isNamed: false,
            name: w.display_name,
            namePopDuration: 2.5,
            namePopDelay: 0.5,
            isUser: false,
            isWaiting: true,
          };
    }),
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <AnimatePresence>
        {renderCircles.map((circle, i) => {
          // Animate floating in a random direction
          const floatDistance = randomBetween(30, 80); // px
          const dx = Math.cos(circle.angle) * floatDistance;
          const dy = Math.sin(circle.angle) * floatDistance;

          // Handler to update circle position in Zustand store
          const handleUpdate = (latest: { x: number; y: number }) => {
            // Only update for random/user circles (not waiting)
            if (!circle.isWaiting) {
              setCircles((prev: CircleData[]) =>
                prev.map((c) =>
                  c.circleId === circle.circleId
                    ? {
                        ...c,
                        // Convert px offset to % (approximate, since parent is 100vw/100vh)
                        left: Math.min(100, Math.max(0, circle.left + (latest.x / window.innerWidth) * 100)),
                        top: Math.min(100, Math.max(0, circle.top + (latest.y / window.innerHeight) * 100)),
                      }
                    : c
                )
              );
            }
          };

          return (
            <motion.div
              key={circle.circleId || i}
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
              exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.7 } }}
              style={{
                position: "absolute",
                left: `${circle.left}%`,
                top: `${circle.top}%`,
                width: circle.size,
                height: circle.size,
                zIndex: 1,
              }}
              onUpdate={handleUpdate}
            >
              <div
                className={
                  circle.isUser
                    ? "rounded-full bg-green-500 border-2 border-green-300 shadow-lg flex items-center justify-center relative"
                    : circle.isWaiting
                    ? "rounded-full bg-blue-500 border-2 border-blue-300 shadow-lg flex items-center justify-center relative"
                    : "rounded-full bg-[#363a4f] border border-[#494d64] shadow-lg flex items-center justify-center relative"
                }
                style={{ width: circle.size, height: circle.size }}
              >
                {((circle.isNamed && circle.name) || circle.isUser || circle.isWaiting) && (
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
                    <span
                      className={
                        circle.isUser
                          ? "text-[11px] font-bold text-white text-center whitespace-nowrap"
                          : circle.isWaiting
                          ? "text-[10px] font-bold text-white text-center whitespace-nowrap"
                          : "text-[10px] font-bold text-[#a6adc8] text-center whitespace-nowrap"
                      }
                    >
                      {circle.name}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FloatingCircles; 