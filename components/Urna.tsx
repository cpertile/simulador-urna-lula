"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DIGIT_COUNT,
  candidates,
  lulaSurpresa,
  type Candidate,
} from "@/lib/candidates";
import { playConfirmTone, playFimTone, playKeyTone } from "@/lib/sounds";

type Phase = "voting" | "reveal" | "fim";

const NUM_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;
const BRAILLE: Record<string, string> = {
  "1": "⠁",
  "2": "⠃",
  "3": "⠉",
  "4": "⠙",
  "5": "⠑",
  "6": "⠋",
  "7": "⠛",
  "8": "⠓",
  "9": "⠊",
  "0": "⠚",
};

export function Urna() {
  const [digits, setDigits] = useState("");
  const [blank, setBlank] = useState(false);
  const [phase, setPhase] = useState<Phase>("voting");
  const [confirmReady, setConfirmReady] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const [flicker, setFlicker] = useState(false);
  const timers = useRef<number[]>([]);
  const pressTimer = useRef<number | null>(null);
  const armTimer = useRef<number | null>(null);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    if (armTimer.current) window.clearTimeout(armTimer.current);
  };

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const flashKey = useCallback((id: string) => {
    setPressed(id);
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 140);
  }, []);

  const armConfirm = useCallback(() => {
    setConfirmReady(false);
    if (armTimer.current) window.clearTimeout(armTimer.current);
    armTimer.current = window.setTimeout(() => setConfirmReady(true), 1000);
  }, []);

  useEffect(() => () => clearTimers(), []);

  const complete = digits.length === DIGIT_COUNT || blank;
  const typedCandidate = !blank && digits.length === DIGIT_COUNT ? candidates[digits] ?? null : null;
  const shownDigits = phase === "reveal" || phase === "fim" ? "13" : digits;
  const shownCandidate: Candidate | null =
    phase === "reveal" || phase === "fim" ? lulaSurpresa : typedCandidate;
  const showBlank = phase === "voting" && blank;
  const showNulo = phase === "voting" && digits.length === DIGIT_COUNT && !typedCandidate && !blank;
  const showFooter = phase === "voting" && complete;
  const showConfira = showFooter && !confirmReady;

  const pressDigit = useCallback(
    (n: string) => {
      if (phase !== "voting" || blank) return;
      if (digits.length >= DIGIT_COUNT) return;
      playKeyTone();
      flashKey(n);
      const next = (digits + n).slice(0, DIGIT_COUNT);
      setDigits(next);
      if (next.length === DIGIT_COUNT) armConfirm();
    },
    [phase, blank, digits, flashKey, armConfirm],
  );

  const pressBranco = useCallback(() => {
    if (phase !== "voting") return;
    playKeyTone();
    flashKey("branco");
    setDigits("");
    setBlank(true);
    armConfirm();
  }, [phase, flashKey, armConfirm]);

  const pressCorrige = useCallback(() => {
    if (phase !== "voting") return;
    playKeyTone();
    flashKey("corrige");
    setDigits("");
    setBlank(false);
    setConfirmReady(false);
  }, [phase, flashKey]);

  const pressConfirma = useCallback(() => {
    if (phase !== "voting" || !complete || !confirmReady) return;
    flashKey("confirma");
    playConfirmTone();
    setFlicker(true);
    later(() => {
      setFlicker(false);
      setPhase("reveal");
      setBlank(false);
      setDigits("13");
    }, 180);
    later(() => {
      playFimTone();
      setPhase("fim");
    }, 2800);
  }, [phase, complete, confirmReady, flashKey, later]);

  const restart = () => {
    clearTimers();
    setDigits("");
    setBlank(false);
    setPhase("voting");
    setConfirmReady(false);
    setFlicker(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        pressDigit(e.key);
      } else if (e.key === "Enter") {
        e.preventDefault();
        pressConfirma();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        pressCorrige();
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        pressBranco();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressDigit, pressConfirma, pressCorrige, pressBranco]);

  return (
    <div className="booth">
      <div className="urna-scale">
        <div className="urna">
          <div className="urna-lid">
            <span className="urna-brand">Justiça Eleitoral</span>
          </div>
          <div className="urna-body">
            <div className="screen-well">
              <div className={`lcd${flicker ? " lcd-flicker" : ""}`}>
                {phase === "fim" ? (
                  <div className="lcd-fim">
                    <span>FIM</span>
                  </div>
                ) : (
                  <>
                    <div className="lcd-main">
                      <div className="lcd-left">
                        <p className="lcd-kicker">SEU VOTO PARA</p>
                        <h1 className="lcd-cargo">Presidente</h1>
                        {!showBlank && (
                          <div className="lcd-row">
                            <span className="lcd-label">Número</span>
                            <div className="digit-boxes">
                              {Array.from({ length: DIGIT_COUNT }).map((_, i) => (
                                <span key={i} className="digit-box">
                                  {shownDigits[i] ?? ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {showBlank && (
                          <p className="lcd-blank">VOTO EM BRANCO</p>
                        )}
                        {showNulo && (
                          <div className="lcd-nulo">
                            <p>NÚMERO ERRADO</p>
                            <p className="lcd-nulo-sub">VOTO NULO</p>
                          </div>
                        )}
                        {shownCandidate && (
                          <>
                            <div className="lcd-row">
                              <span className="lcd-label">Nome</span>
                              <span className="lcd-value">{shownCandidate.name}</span>
                            </div>
                            <div className="lcd-row">
                              <span className="lcd-label">Partido</span>
                              <span className="lcd-value">{shownCandidate.party}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="lcd-photo-col">
                        {shownCandidate && (
                          <figure className="lcd-photo">
                            <Image
                              src={shownCandidate.photo}
                              alt={shownCandidate.name}
                              width={128}
                              height={168}
                            />
                            <figcaption>Presidente</figcaption>
                          </figure>
                        )}
                      </div>
                    </div>
                    {showFooter && (
                      <div className="lcd-footer">
                        {showConfira ? (
                          <p className="lcd-confira">Confira seu voto</p>
                        ) : (
                          <>
                            <p>Aperte a tecla:</p>
                            <p>
                              <span className="txt-verde">VERDE</span>
                              <span> para CONFIRMA</span>
                            </p>
                            <p>
                              <span className="txt-laranja">LARANJA</span>
                              <span> para CORRIGE</span>
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="keypad">
              <div className="num-grid">
                {NUM_KEYS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`key key-num${n === "0" ? " key-zero" : ""}${pressed === n ? " is-pressed" : ""}`}
                    onClick={() => pressDigit(n)}
                    aria-label={n}
                  >
                    <span className="key-n">{n}</span>
                    <span className="key-braille">{BRAILLE[n]}</span>
                  </button>
                ))}
              </div>
              <div className="action-row">
                <button
                  type="button"
                  className={`key key-branco${pressed === "branco" ? " is-pressed" : ""}`}
                  onClick={pressBranco}
                >
                  BRANCO
                </button>
                <button
                  type="button"
                  className={`key key-corrige${pressed === "corrige" ? " is-pressed" : ""}`}
                  onClick={pressCorrige}
                >
                  CORRIGE
                </button>
              </div>
              <button
                type="button"
                className={`key key-confirma${pressed === "confirma" ? " is-pressed" : ""}`}
                onClick={pressConfirma}
              >
                CONFIRMA
              </button>
            </div>
          </div>
        </div>
      </div>
      {phase === "fim" && (
        <button type="button" className="nova" onClick={restart}>
          Nova simulação
        </button>
      )}
      <p className="disclaimer">Simulação satírica. Não é a urna da Justiça Eleitoral.</p>
    </div>
  );
}
