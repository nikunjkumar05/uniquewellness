import { Fragment, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import {
  Copy,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import {
  FaChessBishop,
  FaChessKing,
  FaChessKnight,
  FaChessPawn,
  FaChessQueen,
  FaChessRook,
  FaRegChessBishop,
  FaRegChessKing,
  FaRegChessKnight,
  FaRegChessPawn,
  FaRegChessQueen,
  FaRegChessRook,
} from "react-icons/fa6";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const STOCKFISH_ENGINE_URL = "/stockfish/stockfish-18-lite-single.js";
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const ENGINE_LEVELS = {
  Easy: 8,
  Medium: 12,
  Hard: 14,
  Expert: 16,
} as const;
const STORAGE_KEY = "uwi.chess.saved-pgn";

const pieceIcons: Record<PieceSymbol, Record<"w" | "b", typeof FaChessPawn>> = {
  p: { w: FaRegChessPawn, b: FaChessPawn },
  n: { w: FaRegChessKnight, b: FaChessKnight },
  b: { w: FaRegChessBishop, b: FaChessBishop },
  r: { w: FaRegChessRook, b: FaChessRook },
  q: { w: FaRegChessQueen, b: FaChessQueen },
  k: { w: FaRegChessKing, b: FaChessKing },
};

type EngineState = {
  ready: boolean;
  thinking: boolean;
  bestMove: string | null;
  bestSan: string | null;
  evaluation: string | null;
  depth: number | null;
  line: string | null;
};

type ViewMode = "play" | "replay";
type EngineLevel = keyof typeof ENGINE_LEVELS;

function createEmptyEngineState(): EngineState {
  return {
    ready: false,
    thinking: false,
    bestMove: null,
    bestSan: null,
    evaluation: null,
    depth: null,
    line: null,
  };
}

function parseUciMove(uci: string): { from: Square; to: Square; promotion?: PieceSymbol } {
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci[4] as PieceSymbol | undefined;
  return { from, to, promotion };
}

function formatCentipawn(score: string | null): string | null {
  if (!score) return null;
  if (score.startsWith("mate")) {
    const value = score.replace("mate", "").trim();
    return value ? `M${value}` : "M";
  }
  const raw = Number(score);
  if (Number.isNaN(raw)) return null;
  const evalText = (raw / 100).toFixed(2);
  return raw >= 0 ? `+${evalText}` : evalText;
}

function bestSanFromFen(fen: string, uci: string | null): string | null {
  if (!uci) return null;
  try {
    const temp = new Chess(fen);
    const move = temp.move(parseUciMove(uci));
    return move?.san ?? uci;
  } catch {
    return uci;
  }
}

function cloneGameFromMoves(moves: Move[], count: number): Chess {
  const next = new Chess();
  for (let i = 0; i < count; i += 1) {
    const move = moves[i];
    if (!move) break;
    next.move({ from: move.from, to: move.to, promotion: move.promotion });
  }
  return next;
}

function getMoveKey(move: Move): string {
  return `${move.from}-${move.to}-${move.san}`;
}

function extractFirstPgnGame(text: string): { text: string; multipleGames: boolean } {
  const eventTagMatches = [...text.matchAll(/^\s*\[Event\s+/gm)];
  if (eventTagMatches.length <= 1) {
    return { text, multipleGames: false };
  }

  const nextGameStart = eventTagMatches[1]?.index ?? text.length;
  return {
    text: text.slice(0, nextGameStart).trim(),
    multipleGames: true,
  };
}

export function ChessLab() {
  const [viewMode, setViewMode] = useState<ViewMode>("play");
  const [liveGame, setLiveGame] = useState(() => new Chess());
  const liveGameRef = useRef(liveGame);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [engine, setEngine] = useState<EngineState>(() => createEmptyEngineState());
  const engineRef = useRef<Worker | null>(null);
  const analysisTimerRef = useRef<number | null>(null);
  const pendingAutoMoveRef = useRef(false);

  const [replayMoves, setReplayMoves] = useState<Move[]>([]);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [replayName, setReplayName] = useState<string | null>(null);
  const [pastedPgn, setPastedPgn] = useState("");
  const [engineAssist, setEngineAssist] = useState(true);
  const [enginePlay, setEnginePlay] = useState(true);
  const [engineLevel, setEngineLevel] = useState<EngineLevel>("Medium");

  useEffect(() => {
    liveGameRef.current = liveGame;
  }, [liveGame]);

  useEffect(() => {
    const worker = new Worker(STOCKFISH_ENGINE_URL);
    engineRef.current = worker;

    worker.onmessage = (event) => {
      const message = String(event.data ?? "");

      if (message === "uciok" || message === "readyok") {
        setEngine((state) => ({ ...state, ready: true }));
        return;
      }

      if (message.startsWith("info ")) {
        const depthMatch = message.match(/\bdepth\s+(\d+)/);
        const cpMatch = message.match(/\bscore\s+cp\s+(-?\d+)/);
        const mateMatch = message.match(/\bscore\s+mate\s+(-?\d+)/);
        const pvMatch = message.match(/\bpv\s+(.+)$/);

        const rawScore = cpMatch ? cpMatch[1] : mateMatch ? `mate ${mateMatch[1]}` : null;
        setEngine((state) => ({
          ...state,
          thinking: true,
          depth: depthMatch ? Number(depthMatch[1]) : state.depth,
          evaluation: formatCentipawn(rawScore),
          line: pvMatch ? pvMatch[1] : state.line,
        }));
        return;
      }

      if (message.startsWith("bestmove ")) {
        const bestMove = message.split(" ")[1] || null;
        const nextFen = liveGameRef.current.fen();
        const bestSan = bestSanFromFen(nextFen, bestMove);

        setEngine((state) => ({
          ...state,
          thinking: false,
          bestMove,
          bestSan,
        }));

        if (pendingAutoMoveRef.current && bestMove) {
          const current = liveGameRef.current;
          const next = new Chess(current.fen());
          const applied = next.move(parseUciMove(bestMove));
          if (applied) {
            setLiveGame(next);
            setSelectedSquare(null);
          }
          pendingAutoMoveRef.current = false;
        }
      }
    };

    worker.postMessage("uci");
    worker.postMessage("setoption name MultiPV value 1");
    worker.postMessage("setoption name Threads value 1");
    worker.postMessage("isready");

    return () => {
      if (analysisTimerRef.current) {
        window.clearTimeout(analysisTimerRef.current);
      }
      worker.terminate();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!engineAssist || viewMode !== "play" || !engine.ready) return;
    if (!liveGame.isGameOver()) {
      if (analysisTimerRef.current) {
        window.clearTimeout(analysisTimerRef.current);
      }

      analysisTimerRef.current = window.setTimeout(() => {
        const worker = engineRef.current;
        if (!worker) return;

        const fen = liveGameRef.current.fen();
        worker.postMessage("stop");
        worker.postMessage(`position fen ${fen}`);

        pendingAutoMoveRef.current = enginePlay && liveGameRef.current.turn() === "b";
        setEngine((state) => ({ ...state, thinking: true }));
        worker.postMessage(`go depth ${ENGINE_LEVELS[engineLevel]}`);
      }, 220);
    }

    return () => {
      if (analysisTimerRef.current) {
        window.clearTimeout(analysisTimerRef.current);
      }
    };
  }, [engineAssist, engine.ready, engineLevel, enginePlay, liveGame, viewMode]);

  useEffect(() => {
    if (viewMode !== "replay" || !replayPlaying || replayIndex >= replayMoves.length) return;
    const interval = window.setInterval(() => {
      setReplayIndex((current) => {
        if (current >= replayMoves.length) {
          return current;
        }
        const next = current + 1;
        if (next >= replayMoves.length) {
          window.clearInterval(interval);
          setReplayPlaying(false);
        }
        return next;
      });
    }, Math.max(250, 3000 / replaySpeed));

    return () => window.clearInterval(interval);
  }, [replayIndex, replayMoves.length, replayPlaying, replaySpeed, viewMode]);

  const currentGame = viewMode === "replay" ? cloneGameFromMoves(replayMoves, replayIndex) : liveGame;
  const history = currentGame.history({ verbose: true }) as Move[];
  const lastMove = history[history.length - 1] ?? null;
  const legalMoves = useMemo(() => {
    if (viewMode !== "play" || !selectedSquare) return [] as Move[];
    return currentGame.moves({ square: selectedSquare, verbose: true }) as Move[];
  }, [currentGame, selectedSquare, viewMode]);
  const legalTargets = useMemo(() => new Set(legalMoves.map((move) => move.to)), [legalMoves]);
  const statusText = useMemo(() => {
    if (currentGame.isCheckmate()) return `Checkmate. ${currentGame.turn() === "w" ? "Black" : "White"} wins.`;
    if (currentGame.isStalemate()) return "Stalemate.";
    if (currentGame.isDraw()) return "Draw.";
    if (currentGame.inCheck()) return `${currentGame.turn() === "w" ? "White" : "Black"} is in check.`;
    return `${currentGame.turn() === "w" ? "White" : "Black"} to move.`;
  }, [currentGame]);
  const pgnText = viewMode === "play" ? liveGame.pgn({ newline: "\n" }) : currentGame.pgn({ newline: "\n" });

  function resetLiveGame() {
    setViewMode("play");
    setLiveGame(new Chess());
    setSelectedSquare(null);
    setEngine(createEmptyEngineState());
    setEngineAssist(true);
    setEnginePlay(true);
    pendingAutoMoveRef.current = false;
  }

  function switchToPlayMode() {
    setViewMode("play");
    setEngineAssist(true);
    setEnginePlay(true);
  }

  function switchToReplayMode() {
    setViewMode("replay");
    setEngineAssist(false);
    setEnginePlay(false);
  }

  function commitMove(move: { from: Square; to: Square; promotion?: PieceSymbol }) {
    const next = new Chess(liveGameRef.current.fen());
    const applied = next.move(move);
    if (!applied) return false;
    setLiveGame(next);
    setSelectedSquare(null);
    return true;
  }

  function handleSquareClick(square: Square) {
    if (viewMode !== "play") return;
    const piece = currentGame.get(square);

    if (selectedSquare) {
      const candidate =
        legalMoves.find((move) => move.to === square && move.promotion === "q") ||
        legalMoves.find((move) => move.to === square) ||
        null;

      if (candidate) {
        commitMove({
          from: candidate.from,
          to: candidate.to,
          promotion: candidate.promotion,
        });
        return;
      }

      if (piece && piece.color === currentGame.turn()) {
        setSelectedSquare(square);
        return;
      }

      setSelectedSquare(null);
      return;
    }

    if (piece && piece.color === currentGame.turn()) {
      setSelectedSquare(square);
    }
  }

  async function copyPgn() {
    try {
      await navigator.clipboard.writeText(pgnText);
      toast.success("PGN copied");
    } catch {
      toast.error("Could not copy PGN");
    }
  }

  function saveGame() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pgn: pgnText,
          savedAt: new Date().toISOString(),
        }),
      );
      toast.success("Game saved");
    } catch {
      toast.error("Could not save game");
    }
  }

  async function loadPgnText(text: string) {
    const imported = new Chess();
    const normalizedText = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    const { text: pgnText, multipleGames } = extractFirstPgnGame(normalizedText);

    try {
      imported.loadPgn(pgnText);
    } catch (error) {
      const message = error instanceof Error ? error.message : "That PGN could not be parsed.";
      toast.error(message);
      return;
    }

    if (multipleGames) {
      toast("Multiple games detected. Loaded the first game only.");
    }

    const moves = imported.history({ verbose: true }) as Move[];
    setReplayMoves(moves);
    setReplayIndex(0);
    setReplayPlaying(false);
    setReplayName(null);
    switchToReplayMode();
    toast.success("PGN loaded. Use replay controls to step through the game.");
  }

  async function onUpload(file: File) {
    const text = await file.text();
    setReplayName(file.name);
    await loadPgnText(text);
  }

  const boardRows = orientation === "white" ? [...RANKS] : [...RANKS].reverse();
  const boardFiles = orientation === "white" ? [...FILES] : [...FILES].reverse();
  const speedOptions = [0.5, 1, 1.5, 2, 3, 4] as const;

  return (
    <section className="px-3 sm:px-6 pt-6 sm:pt-8 pb-10">
      <div className="mx-auto max-w-6xl grid gap-6 xl:grid-cols-[minmax(0,1fr)_316px] items-start">
        <div className="space-y-4">
          <div className="rounded-[28px] border border-border/60 bg-white/75 p-3 sm:p-4 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="grid grid-cols-2 overflow-hidden rounded-[18px] bg-muted/55 p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={switchToPlayMode}
                className={`rounded-[14px] px-4 py-2 transition ${
                  viewMode === "play" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Play vs AI
              </button>
              <button
                type="button"
                onClick={switchToReplayMode}
                className={`rounded-[14px] px-4 py-2 transition ${
                  viewMode === "replay" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                PGN review
              </button>
            </div>

            <div className="mt-4 rounded-[22px] border border-border/60 bg-white/70 p-3 sm:p-4 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.18)]">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[18px] border border-border/60 bg-[#f4e0b9] p-2 sm:p-3 shadow-inner">
                    <div className="grid grid-cols-8 overflow-hidden rounded-[14px] border border-white/65 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.3)]">
                      {boardRows.map((rank, rowIndex) =>
                        boardFiles.map((file, fileIndex) => {
                          const square = `${file}${rank}` as Square;
                          const piece = currentGame.get(square);
                          const moveTarget = legalTargets.has(square);
                          const squareColor = currentGame.squareColor(square) || "light";
                          const isSelected = selectedSquare === square;
                          const isLastMoveFrom = lastMove?.from === square;
                          const isLastMoveTo = lastMove?.to === square;

                          return (
                            <button
                              key={square}
                              type="button"
                              onClick={() => handleSquareClick(square)}
                              className={`relative aspect-square text-lg sm:text-2xl md:text-3xl transition-all duration-200 focus:z-10 focus:outline-none ${
                                squareColor === "light" ? "bg-[#f7e6bf]" : "bg-[#bc8a5d]"
                              } ${isSelected ? "ring-4 ring-primary ring-inset" : ""} ${viewMode === "replay" ? "cursor-default" : "cursor-pointer hover:brightness-105"}`}
                            >
                              {isLastMoveFrom && (
                                <span className="absolute inset-0 bg-[#d4e388]/35 ring-2 ring-inset ring-[#6c8f2f]/40 transition-opacity duration-200" />
                              )}
                              {isLastMoveTo && (
                                <span className="absolute inset-0 bg-[#a8c84f]/45 ring-2 ring-inset ring-[#5c8425]/55 transition-opacity duration-200" />
                              )}
                              {fileIndex === 0 && (
                                <span className="absolute left-1 top-1 z-10 text-[10px] font-bold text-black/35">
                                  {rank}
                                </span>
                              )}
                              {rowIndex === 7 && (
                                <span className="absolute bottom-1 right-1 z-10 text-[10px] font-bold text-black/35">
                                  {file}
                                </span>
                              )}
                              {moveTarget && !piece && (
                                <span className="absolute inset-0 z-10 m-auto h-3 w-3 rounded-full bg-black/20" />
                              )}
                              {moveTarget && piece && (
                                <span className="absolute inset-2 z-10 rounded-full border-4 border-black/15" />
                              )}
                              {piece && (
                                (() => {
                                  const PieceIcon = pieceIcons[piece.type][piece.color];
                                  return (
                                    <span
                                      className={`relative z-10 inline-flex h-[84%] w-[84%] items-center justify-center ${
                                        piece.color === "w"
                                          ? "text-[#1b1b1b] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
                                          : "text-black drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]"
                                      }`}
                                    >
                                      <PieceIcon className="h-full w-full" aria-hidden />
                                    </span>
                                  );
                                })()
                              )}
                            </button>
                          );
                        }),
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div className="flex items-center justify-center gap-1.5 text-foreground/75">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("replay");
                          setReplayIndex(0);
                          setReplayPlaying(false);
                        }}
                        className="rounded-full px-2 py-1.5 transition hover:bg-muted/70"
                        aria-label="Go to start"
                      >
                        <ChevronsLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (viewMode === "replay") {
                            setReplayIndex((value) => Math.max(0, value - 1));
                          }
                        }}
                        className="rounded-full px-2 py-1.5 transition hover:bg-muted/70 disabled:opacity-40"
                        aria-label="Previous move"
                        disabled={viewMode !== "replay" || replayIndex === 0}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (viewMode === "replay") {
                            if (replayMoves.length === 0) return;
                            setReplayPlaying((value) => !value);
                            return;
                          }
                          setEnginePlay((value) => !value);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
                        aria-label={viewMode === "replay" ? (replayPlaying ? "Pause" : "Play") : "Toggle engine opponent"}
                      >
                        {viewMode === "replay" ? (
                          replayPlaying ? (
                            <Pause size={18} />
                          ) : (
                            <Play size={18} />
                          )
                        ) : (
                          <Play size={18} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (viewMode === "replay") {
                            setReplayIndex((value) => Math.min(replayMoves.length, value + 1));
                          }
                        }}
                        className="rounded-full px-2 py-1.5 transition hover:bg-muted/70 disabled:opacity-40"
                        aria-label="Next move"
                        disabled={viewMode !== "replay" || replayIndex >= replayMoves.length}
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("replay");
                          setReplayIndex(replayMoves.length);
                          setReplayPlaying(false);
                        }}
                        className="rounded-full px-2 py-1.5 transition hover:bg-muted/70"
                        aria-label="Go to end"
                      >
                        <ChevronsRight size={18} />
                      </button>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Move {viewMode === "replay" ? replayIndex : history.length} / {viewMode === "replay" ? replayMoves.length : history.length}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-border/60 bg-white/55 p-4">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                      <span>Speed</span>
                      <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
                        {speedOptions.map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => setReplaySpeed(speed)}
                            className={`rounded-full px-2 py-1 transition ${
                              replaySpeed === speed ? "bg-primary text-primary-foreground" : "hover:bg-muted/80"
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="range"
                        min={0.5}
                        max={4}
                        step={0.5}
                        value={replaySpeed}
                        onChange={(event) => setReplaySpeed(Number(event.target.value))}
                        className="h-2 w-full accent-[var(--primary)]"
                      />
                      <div className="w-20 rounded-xl border border-border/60 bg-background px-3 py-2 text-center text-sm font-semibold text-foreground">
                        {replaySpeed.toFixed(2)} x
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {viewMode === "play" ? (
                    <Card className="rounded-[22px] border border-border/60 bg-white/75 p-4 shadow-sm">
                      <div className="text-sm font-medium text-foreground">{statusText}</div>
                      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                        <select
                          value={engineLevel}
                          onChange={(event) => setEngineLevel(event.target.value as EngineLevel)}
                          className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          {Object.keys(ENGINE_LEVELS).map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        <Button variant="outline" onClick={resetLiveGame} className="h-10 px-4 font-medium">
                          <RotateCcw size={16} className="mr-2" /> New
                        </Button>
                        <Button onClick={saveGame} className="h-10 px-4 font-medium">
                          <Save size={16} className="mr-2" /> Save
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card className="rounded-[22px] border border-border/60 bg-white/75 p-4 shadow-sm space-y-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                          Upload PGN file
                        </div>
                        <Input
                          type="file"
                          accept=".pgn,text/plain"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void onUpload(file);
                            }
                          }}
                          className="mt-2 rounded-xl bg-background"
                        />
                        {replayName && (
                          <p className="mt-2 text-xs text-muted-foreground">Loaded file: {replayName}</p>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                          Or paste PGN
                        </div>
                        <textarea
                          id="pgn-text"
                          rows={6}
                          value={pastedPgn}
                          onChange={(event) => setPastedPgn(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 ..."
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button onClick={() => void loadPgnText(pastedPgn)} className="font-medium">
                          <Upload size={16} className="mr-2" /> Load PGN
                        </Button>
                        <Button variant="outline" onClick={copyPgn} className="font-medium">
                          <Copy size={16} className="mr-2" /> Copy current
                        </Button>
                      </div>
                    </Card>
                  )}

                  <Card className="rounded-[22px] border border-border/60 bg-white/75 p-4 shadow-sm">
                    <div className="text-lg font-semibold text-foreground">Move history</div>
                    <div className="mt-3 min-h-24 rounded-[18px] border border-border/50 bg-background/70 p-3">
                      {history.length ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-foreground/80">
                          {history.reduce<ReactElement[]>((acc, move, index) => {
                            if (index % 2 === 0) {
                              const moveNumber = index / 2 + 1;
                              const white = move;
                              const black = history[index + 1];
                              acc.push(
                                <Fragment key={getMoveKey(white)}>
                                  <div className="text-muted-foreground">{moveNumber}.</div>
                                  <div>{white.san}</div>
                                  <div className="text-muted-foreground">{moveNumber}...</div>
                                  <div>{black?.san || ""}</div>
                                </Fragment>,
                              );
                            }
                            return acc;
                          }, [])}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No moves yet.</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}