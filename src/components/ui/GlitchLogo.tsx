import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './GlitchLogo.css';
import { getGlyph } from '../../lib/ascii/glyphs';

const LOGO_VARIANTS = ['s33g', 'seeg', 's33g', 's33g', 'seeg'];
const SCRAMBLE_CHARS = '0123456789@#$%&*!?<>[]{}';
const TECH_EMOJIS = ['💻', '⚡', '🔧', '⌨️', '🖥️', '📡', '🔌', '💾', '🤖', '⚙️', '📱', '🛠️', '🧠', '🔗', '🚀'];

export default function GlitchLogo() {
  const [chars, setChars] = useState(['s', 'e', 'e', 'g']);
  const [glitching, setGlitching] = useState([false, false, false, false]);
  const [anaglyph, setAnaglyph] = useState([false, false, false, false]);
  const [warping, setWarping] = useState(false);
  const [shadowStyle, setShadowStyle] = useState<React.CSSProperties>({});
  const [showingHundred, setShowingHundred] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const variantRef = useRef(0);
  const countingRef = useRef(false);
  const countingCooldownRef = useRef(false);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const bsodRef = useRef(false);

  // Setup portal container
  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // Sync bsodRef with state for use in callbacks
  useEffect(() => {
    bsodRef.current = showBSOD;
  }, [showBSOD]);

  // Flash 3D effect on random characters
  const flash3D = useCallback(() => {
    if (bsodRef.current) return; // Pause during BSOD

    const numFlashes = Math.random() < 0.5 ? 1 : 2;
    const indices: number[] = [];
    for (let i = 0; i < numFlashes; i++) {
      indices.push(Math.floor(Math.random() * 4));
    }

    setAnaglyph(prev => {
      const next = [...prev];
      indices.forEach(i => next[i] = true);
      return next;
    });

    setTimeout(() => {
      setAnaglyph(prev => {
        const next = [...prev];
        indices.forEach(i => next[i] = false);
        return next;
      });
    }, 150);
  }, []);

  // Counting mode: 33 -> 34 -> 35... exponentially faster
  const startCounting = useCallback(() => {
    if (countingRef.current || countingCooldownRef.current || bsodRef.current) return;
    countingRef.current = true;
    countingCooldownRef.current = true;

    let count = 33;
    let delay = 400;
    const minDelay = 30;
    const acceleration = 0.75;

    const tick = () => {
      if (!countingRef.current || bsodRef.current) {
        return;
      }

      // Hit 99 - MELTDOWN TIME!
      if (count > 99) {
        // Keep countingRef true during finale to prevent scrambleLogo from interrupting

        // Dramatic finale sequence with delays
        const funnySequence: { chars: string[], delay: number }[] = [
          { chars: ['s', '💯', '!', 'g'], delay: 1000 }, // Pause on 💯!
          { chars: ['s', '🤯', '🤯', 'g'], delay: 120 },
          { chars: ['💥', '💥', '💥', '💥'], delay: 120 },
          { chars: ['s', '∞', '∞', 'g'], delay: 120 },
          { chars: ['O', 'O', 'P', 'S'], delay: 120 },
          { chars: ['l', 'o', 'l', '!'], delay: 120 },
          { chars: ['s', '0', '0', 'g'], delay: 120 },
          { chars: ['s', 'e', 'e', 'g'], delay: 120 },
        ];

        let step = 0;

        const runStep = () => {
          if (step >= funnySequence.length) {
            setShowingHundred(false);
            countingRef.current = false; // Only now allow scrambles again
            // Cooldown period before counting can happen again
            setTimeout(() => {
              countingCooldownRef.current = false;
            }, 5000);
            return;
          }

          const { chars: stepChars, delay: stepDelay } = funnySequence[step];
          setChars(stepChars);

          // Track when 💯 is showing (clickable)
          if (step === 0) {
            setShowingHundred(true);
          } else {
            setShowingHundred(false);
          }

          // Rapid 3D flash during meltdown
          setAnaglyph([true, true, true, true]);
          setTimeout(() => setAnaglyph([false, false, false, false]), 50);

          step++;
          setTimeout(runStep, stepDelay);
        };

        runStep();

        return;
      }

      const countStr = count.toString();
      setChars(['s', countStr[0], countStr[1], 'g']);

      // Flash 3D on some numbers - more frequent as we speed up
      if (Math.random() < 0.3 + (count - 33) * 0.005) {
        setAnaglyph([false, true, true, false]);
        setTimeout(() => setAnaglyph([false, false, false, false]), 100);
      }

      count++;
      delay = Math.max(minDelay, delay * acceleration);
      setTimeout(tick, delay);
    };

    tick();
  }, []);

  // Main scramble function
  const scrambleLogo = useCallback(() => {
    // Don't scramble if counting is active or BSOD is showing
    if (countingRef.current || bsodRef.current) return;

    // 15% chance to do counting mode
    if (Math.random() < 0.15 && !countingCooldownRef.current) {
      startCounting();
      return;
    }

    const targetWord = LOGO_VARIANTS[variantRef.current];
    variantRef.current = (variantRef.current + 1) % LOGO_VARIANTS.length;

    // Trigger warp
    setWarping(true);
    setTimeout(() => setWarping(false), 500);

    // Scramble each character
    const targetChars = targetWord.split('');
    const iterations = [0, 0, 0, 0];
    const maxIterations = targetChars.map(() => 5 + Math.random() * 5);

    // Staggered glitch start
    targetChars.forEach((_, i) => {
      setTimeout(() => {
        if (countingRef.current || bsodRef.current) return; // Don't glitch during counting or BSOD
        setGlitching(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        setTimeout(() => {
          setGlitching(prev => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
        }, 400);
      }, i * 30);
    });

    // Character scrambling intervals
    const intervals = targetChars.map((targetChar, i) => {
      return setInterval(() => {
        // STOP if counting started or BSOD showing
        if (countingRef.current || bsodRef.current) {
          clearInterval(intervals[i]);
          return;
        }

        if (iterations[i] < maxIterations[i]) {
          setChars(prev => {
            const next = [...prev];
            // 25% chance for brief emoji flash
            if (Math.random() < 0.25) {
              next[i] = TECH_EMOJIS[Math.floor(Math.random() * TECH_EMOJIS.length)];
              // Schedule quick replacement
              setTimeout(() => {
                if (iterations[i] < maxIterations[i] - 1 && !countingRef.current && !bsodRef.current) {
                  setChars(p => {
                    const n = [...p];
                    n[i] = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                    return n;
                  });
                }
              }, 30);
            } else {
              next[i] = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
            return next;
          });

          // Random 3D flash
          if (Math.random() < 0.15) {
            setAnaglyph(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
            setTimeout(() => {
              setAnaglyph(prev => {
                const next = [...prev];
                next[i] = false;
                return next;
              });
            }, 100);
          }

          iterations[i]++;
        } else {
          // Final character - no emoji sticking
          if (!countingRef.current && !bsodRef.current) {
            setChars(prev => {
              const next = [...prev];
              next[i] = targetChar;
              return next;
            });
          }
          clearInterval(intervals[i]);
        }
      }, 50 + Math.random() * 30);
    });

    return () => intervals.forEach(clearInterval);
  }, [startCounting]);

  // Mouse shadow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || bsodRef.current) return; // Pause during BSOD

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const offsetX = (e.clientX - centerX) / window.innerWidth * -8;
      const offsetY = (e.clientY - centerY) / window.innerHeight * -8;

      const shadowColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary').trim() || '#10b981';

      setShadowStyle({
        textShadow: `
          ${offsetX}px ${offsetY}px 0 ${shadowColor}20,
          ${offsetX * 2}px ${offsetY * 2}px 20px ${shadowColor}15
        `
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Schedule scrambles (pauses when BSOD is showing)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleScramble = () => {
      const delay = 4000 + Math.random() * 4000;
      timeoutId = setTimeout(() => {
        if (!bsodRef.current) {
          scrambleLogo();
        }
        scheduleScramble();
      }, delay);
    };

    scheduleScramble();
    return () => clearTimeout(timeoutId);
  }, [scrambleLogo]);

  // Handle clicking on 💯 to show BSOD
  const handleLogoClick = useCallback(() => {
    if (showingHundred && !showBSOD) {
      setShowBSOD(true);
    }
  }, [showingHundred, showBSOD]);

  // Schedule 3D flashes (pauses when BSOD is showing)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule3DFlash = () => {
      const delay = 800 + Math.random() * 2000;
      timeoutId = setTimeout(() => {
        if (!bsodRef.current) {
          flash3D();
        }
        schedule3DFlash();
      }, delay);
    };

    schedule3DFlash();
    return () => clearTimeout(timeoutId);
  }, [flash3D]);

  // Console commands for browser debugging/fun
  useEffect(() => {
    // Make functions available globally
    interface S33GWindow extends Window {
      s33g?: typeof s33gCommands;
    }
    const s33gCommands = {
      // Theme controls
      darkMode: () => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        console.log('🌙 Dark mode activated');
      },
      lightMode: () => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        console.log('☀️ Light mode activated');
      },
      toggleTheme: () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          s33gCommands.lightMode();
        } else {
          s33gCommands.darkMode();
        }
      },

      // Logo effects
      scramble: () => {
        scrambleLogo();
        console.log('🎲 Logo scrambled!');
      },
      count: () => {
        startCounting();
        console.log('🔢 Counting mode started!');
      },
      flash3D: () => {
        flash3D();
        console.log('👓 3D anaglyph flash!');
      },
      warp: () => {
        setWarping(true);
        setTimeout(() => setWarping(false), 500);
        console.log('🌀 Logo warped!');
      },

      // BSOD effect
      bsod: () => {
        setShowBSOD(true);
        console.log('💀 BSOD triggered! Click "Reboot System" to dismiss.');
      },
      dismissBSOD: () => {
        setShowBSOD(false);
        console.log('🔄 System rebooted!');
      },

      // Utility
      help: () => {
        console.log(`
🎮 s33g Console Commands:

📱 Theme Controls:
  s33g.darkMode()     - Enable dark theme
  s33g.lightMode()    - Enable light theme
  s33g.toggleTheme()  - Toggle current theme

✨ Logo Effects:
  s33g.scramble()     - Scramble the logo
  s33g.count()        - Start counting mode (33→99)
  s33g.flash3D()      - Trigger 3D anaglyph effect
  s33g.warp()         - Warp the logo

💥 Special Effects:
  s33g.bsod()         - Show Blue Screen of Death
  s33g.dismissBSOD()  - Dismiss BSOD overlay

❓ Help:
  s33g.help()         - Show this help menu

Type any command to try it out! 🚀`);
      }
    };

    (window as S33GWindow).s33g = s33gCommands;

    // Cleanup on unmount
    return () => {
      delete (window as S33GWindow).s33g;
    };
  }, [scrambleLogo, startCounting, flash3D]);

  // Decode the secret message
  const getSecretMessage = () => getGlyph(0x47);

  // BSOD Component rendered via portal
  const BSODOverlay = () => (
    <div className="bsod-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="bsod-content">
        <div className="bsod-emoticon">{getGlyph(0x1e)}</div>
        <h2 className="bsod-title">{getGlyph(0x1f1)}</h2>
        <p className="bsod-subtitle">{getGlyph(0x1f2)}</p>
        <div className="bsod-progress">
          <span className="bsod-percent">{getGlyph(0x1f3)}</span> {getGlyph(0x1f4)}
        </div>

        <div className="bsod-details">
          <div className="bsod-qr">
            <div className="qr-fake" />
          </div>
          <div className="bsod-info">
            <p>{getGlyph(0x1f5)}</p>
            <p className="bsod-url">{getGlyph(0x1f6)}</p>
            <br />
            <p className="bsod-small">{getGlyph(0x1f7)}</p>
            <p className="bsod-stop">{getGlyph(0x1f8)}</p>
          </div>
        </div>

        <div className="bsod-message">
          <pre>{getSecretMessage()}</pre>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <h1
        ref={containerRef}
        className={`glitch-logo ${warping ? 'warping' : ''} ${showingHundred ? 'clickable' : ''}`}
        style={{
          ...shadowStyle,
          pointerEvents: showBSOD ? 'none' : 'auto'
        }}
        onClick={handleLogoClick}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className={`logo-char ${glitching[i] ? 'glitching' : ''} ${anaglyph[i] ? 'anaglyph' : ''}`}
          >
            {char}
          </span>
        ))}
      </h1>

      {showBSOD && portalContainer && createPortal(<BSODOverlay />, portalContainer)}
    </>
  );
}
