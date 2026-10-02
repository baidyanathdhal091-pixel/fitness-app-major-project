import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, { duration: 800, bounce: 0 });

  useEffect(() => {
    springValue.set(value);
  }, [springValue, value]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [springValue]);

  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
