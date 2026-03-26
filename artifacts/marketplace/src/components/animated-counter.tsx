import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
}

export function AnimatedCounter({ value, duration = 2, formatter = (v) => v.toString() }: AnimatedCounterProps) {
  const [mounted, setMounted] = useState(false);
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => formatter(Math.floor(current)));

  useEffect(() => {
    setMounted(true);
    spring.set(value);
  }, [value, spring]);

  if (!mounted) return <span>{formatter(0)}</span>;

  return <motion.span>{display}</motion.span>;
}
