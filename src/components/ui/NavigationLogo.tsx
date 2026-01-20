import { useEffect, useState, useRef } from 'react';

interface LogoChar {
  char: string;
  isGlitching: boolean;
}

const GLITCH_CHARS = '0123456789@#$%&*!?';

export default function NavigationLogo() {
  const [logoChars, setLogoChars] = useState<LogoChar[]>([
    { char: 's', isGlitching: false },
    { char: 'e', isGlitching: false },
    { char: 'e', isGlitching: false },
    { char: 'g', isGlitching: false },
  ]);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // React 19: No useCallback needed - compiler handles optimization
  const triggerGlitch = (newVariant: 'seeg' | 's33g') => {
    if (!isMountedRef.current) return;

    const targetChars = newVariant.split('');
    const glitchDuration = 300; // ms
    const glitchSteps = 8;
    let stepCount = 0;

    const glitchStep = () => {
      if (!isMountedRef.current) return;

      // Randomly glitch some characters
      setLogoChars(prev =>
        prev.map(char => {
          if (Math.random() < 0.5) {
            return {
              char: GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
              isGlitching: true,
            };
          }
          return char;
        })
      );

      stepCount++;
      if (stepCount < glitchSteps) {
        glitchTimeoutRef.current = setTimeout(
          glitchStep,
          glitchDuration / glitchSteps
        );
      } else {
        // Finish with the new variant
        if (isMountedRef.current) {
          setLogoChars(
            targetChars.map(char => ({
              char,
              isGlitching: false,
            }))
          );
        }
      }
    };

    glitchStep();
  };

  // Store triggerGlitch in ref for stable access in effect
  const triggerGlitchRef = useRef(triggerGlitch);
  triggerGlitchRef.current = triggerGlitch;

  // Cycle between variants every 5 seconds
  useEffect(() => {
    isMountedRef.current = true;

    const nextVariant = (current: 'seeg' | 's33g'): 'seeg' | 's33g' => {
      return current === 'seeg' ? 's33g' : 'seeg';
    };

    const cycle = () => {
      if (!isMountedRef.current) return;

      setLogoChars(prev => {
        const currentString = prev.map(c => c.char).join('') as 'seeg' | 's33g';
        const newVariant = nextVariant(currentString);
        triggerGlitchRef.current(newVariant);
        return prev;
      });

      cycleTimeoutRef.current = setTimeout(cycle, 5000);
    };

    cycleTimeoutRef.current = setTimeout(cycle, 5000);

    return () => {
      isMountedRef.current = false;
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
      if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current);
    };
  }, []);

  return (
    <span className="brand-text">
      {logoChars.map((item, i) => (
        <span
          key={`${i}-${item.char}`}
          className={`logo-char ${item.isGlitching ? 'glitching' : ''}`}
          style={{
            display: 'inline-block',
            transition: 'all 0.05s ease',
            ...(item.isGlitching && {
              textShadow: `
                ${Math.random() * 2 - 1}px 0 0 rgba(255, 0, 0, 0.5),
                ${Math.random() * 2 - 1}px 0 0 rgba(0, 255, 255, 0.5)
              `,
              transform: `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px) skewX(${Math.random() * 4 - 2}deg)`,
              opacity: 0.8 + Math.random() * 0.2,
            }),
          }}
        >
          {item.char}
        </span>
      ))}
    </span>
  );
}
