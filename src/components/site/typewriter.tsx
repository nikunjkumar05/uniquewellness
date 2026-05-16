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
    const word = words[i % words.length];
    const speed = del ? deletingSpeed : typingSpeed;
    const t = setTimeout(() => {
      if (!del) {
        const next = word.slice(0, text.length + 1);
        setText(next);
        if (next === word) setTimeout(() => setDel(true), pauseMs);
      } else {
        const next = word.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDel(false);
          setI((v) => v + 1);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, del, i, words]);

  return (
    <span className={className}>
      {text}
      <span className="caret text-primary">|</span>
    </span>
  );
}
