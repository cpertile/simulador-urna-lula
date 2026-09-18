"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DIGIT_COUNT, FORCED_NUMBER, lula } from "@/lib/candidates";
import { playFimTone, playKeyTone } from "@/lib/sounds";

type Phase = "voting" | "fim";

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
  const [filled, setFilled] = useState(0);
  const [phase, setPhase] = useState<Phase>("voting");
  const [pressed, setPressed] = useState<string | null>(null);
  const pressTimer = useRef<number | null>(null);

  const shownDigits = FORCED_NUMBER.slice(0, filled);
  const complete = filled === DIGIT_COUNT;
  const showCandidate = complete && phase === "voting";

  const flashKey = useCallback((id: string) => {
    setPressed(id);
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 140);
  }, []);

  useEffect(
    () => () => {
      if (pressTimer.current) window.clearTimeout(pressTimer.current);
    },
    [],
  );

  const pressDigit = useCallback(
    (n: string) => {
      if (phase !== "voting" || complete) return;
      playKeyTone();
      flashKey(n);
      setFilled((count) => Math.min(count + 1, DIGIT_COUNT));
    },
    [phase, complete, flashKey],
  );

  const pressBranco = useCallback(() => {
    if (phase !== "voting") return;
    playKeyTone();
    flashKey("branco");
    setFilled(DIGIT_COUNT);
  }, [phase, flashKey]);

  const pressCorrige = useCallback(() => {
    if (phase !== "voting") return;
    playKeyTone();
    flashKey("corrige");
    setFilled(0);
  }, [phase, flashKey]);

  const pressConfirma = useCallback(() => {
    if (phase !== "voting" || !complete) return;
    flashKey("confirma");
    playFimTone();
    setPhase("fim");
  }, [phase, complete, flashKey]);

  const restart = () => {
    setFilled(0);
    setPhase("voting");
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
              <div className="lcd">
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
                        {showCandidate && (
                          <>
                            <div className="lcd-row">
                              <span className="lcd-label">Nome</span>
                              <span className="lcd-value">{lula.name}</span>
                            </div>
                            <div className="lcd-row">
                              <span className="lcd-label">Partido</span>
                              <span className="lcd-value">{lula.party}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="lcd-photo-col">
                        {showCandidate && (
                          <figure className="lcd-photo">
                            <img src={lula.photo} alt={lula.name} />
                            <figcaption>Presidente</figcaption>
                          </figure>
                        )}
                      </div>
                    </div>
                    {complete && (
                      <div className="lcd-footer">
                        <p>Aperte a tecla:</p>
                        <p>
                          <span className="txt-verde">VERDE</span>
                          <span> para CONFIRMA</span>
                        </p>
                        <p>
                          <span className="txt-laranja">LARANJA</span>
                          <span> para CORRIGE</span>
                        </p>
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
