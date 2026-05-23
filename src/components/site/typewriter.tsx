import { useEffect, useState } from "react";

export function Typewriter({
  words,
  className = "",
  typingSpeed = 95,
  deletingSpeed = 55,
  pauseMs = 1600,
}: {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;

    const word = words[i % words.length];
    const speed = del ? deletingSpeed : typingSpeed;
    const wordComplete = !del && text === word;
    const wordDeleted = del && text === "";

    const t = setTimeout(() => {
      if (wordComplete) {
        setDel(true);
        return;
      }

      if (wordDeleted) {
        setDel(false);
        setI((v) => v + 1);
        return;
      }

      setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, wordComplete ? pauseMs : speed);

    return () => clearTimeout(t);
  }, [deletingSpeed, del, i, pauseMs, text, typingSpeed, words]);

  return (
    <span className={className}>
      {text}
      <span className="caret text-primary">|</span>
    </span>
  );
}
